import { QuartzTransformerPlugin } from "../types"
import { Root, Code, Image } from "mdast"
import { visit } from "unist-util-visit"
import yaml from "js-yaml"
import fs from "fs"
import path from "path"
import { FilePath, slugifyFilePath, pathToRoot } from "../../util/path"
import { resolve } from "path/posix"

export interface Options {
  language: string
}

const defaultOptions: Options = {
  language: "img-gallery",
}

export interface ImgGalleryParsedData {
  path: string;
  columns?: number;
  spacing?: string;
  radius?: number;
}

export interface GalleryCodeNodeData {
  blockIndex: number
  images: Array<Image>
  columns: number
  spacing: string
  radius: number
}

export const GalleryTransformer: QuartzTransformerPlugin<Partial<Options> | undefined> = (
  userOpts,
) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "GalleryTransformer",
    markdownPlugins(ctx) {
      return [
        () => {
          return (tree: Root, _file) => {
            let galleryData = new Array<GalleryCodeNodeData>()

            visit(tree, "code", (node: Code, index) => {
              if (node && node.lang === opts.language && index != null) {
                const data = yaml.load(node.value, {
                  schema: yaml.JSON_SCHEMA,
                }) as ImgGalleryParsedData

                if (data.path) {
                  const imageFolderPath = resolve(ctx.argv.directory, data.path)

                  if (
                    fs.existsSync(imageFolderPath) &&
                    fs.statSync(imageFolderPath).isDirectory()
                  ) {
                    const imagesPaths = fs.readdirSync(imageFolderPath).filter(isImageFile)

                    let currentGalleryIndex =
                      galleryData.push({
                        blockIndex: index,
                        images: new Array<Image>(),
                        columns: data.columns || 3,
                        spacing: data.spacing || "10px",
                        radius: data.radius || 8
                      } as GalleryCodeNodeData) - 1

                    imagesPaths.forEach((imagePath) => {
                      const url = slugifyFilePath(imagePath as FilePath)
                      galleryData[currentGalleryIndex].images.push({
                        type: "image",
                        url: url,
                      } as Image)
                    })
                  }
                }
              }
            })

            if (galleryData.length === 0) {
              return
            }

            galleryData
              .sort((a, b) => b.blockIndex - a.blockIndex)
              .forEach((gallery) => {
                const columnContainers = Array.from({ length: gallery.columns }, (_, i) => ({
                  type: "html",
                  value: `<div class="image-column" style="flex: 1; display: flex; flex-direction: column; gap: ${gallery.spacing};">`,
                }))
                const columnEnds = Array.from({ length: gallery.columns }, (_, i) => ({
                  type: "html",
                  value: `</div>`,
                }))

                let imageNodes = gallery.images.reduce((acc, image, index) => {
                  const columnIndex = index % gallery.columns
                  acc[columnIndex].push({
                    type: "html",
                    value: `<a href="${image.url}" class="lightbox"><img src="${image.url}" style="width: 100%; object-fit: contain; border-radius: ${gallery.radius}px;" /></a>`
                  })
                  return acc
                }, Array.from({ length: gallery.columns }, () => []))

                let combinedNodes = []
                for (let i = 0; i < gallery.columns; i++) {
                  combinedNodes.push(columnContainers[i], ...imageNodes[i], columnEnds[i])
                }

                tree.children.splice(gallery.blockIndex, 1, {
                  type: "html",
                  value: `<div class="image-gallery" style="display: flex; gap: ${gallery.spacing};">`,
                }, ...combinedNodes, {
                  type: "html",
                  value: `</div>`,
                })
              })
          }
        },
      ]
    },
  }
}

function isImageFile(filePath: string) {
  const ext: string = path.extname(filePath).toLowerCase()
  return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"].includes(ext)
}
