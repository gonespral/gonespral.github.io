// Transforms data from the Obsidian Image Gallery plugin into Embeds
// Plugin here: https://github.com/lucaorio/obsidian-image-gallery

import { QuartzTransformerPlugin } from "../types"
import { Root, Code, Image, Parent } from "mdast"
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
  height?: number;
  radius?: number;
}

export interface GalleryCodeNodeData {
  blockIndex: number
  images: Array<Image>
  columns: number
  spacing: string
  height: number
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
            // Create an array that can store info on where all of the gallery code blocks live.
            // we'll use this info later to replace them with our images.
            let galleryData = new Array<GalleryCodeNodeData>()

            // Search the tree for any Code Blocks that may exist
            visit(tree, "code", (node: Code, index) => {
              // Confirm the code block is for the img-gallery.
              if (node && node.lang === opts.language && index != null) {
                // Parse the img-gallery as YAML
                const data = yaml.load(node.value, {
                  schema: yaml.JSON_SCHEMA,
                }) as ImgGalleryParsedData

                // If a path is specified in the block, we're in business!
                if (data.path) {
                  const imageFolderPath = resolve(ctx.argv.directory, data.path)

                  // Confirm there's actually something there.
                  if (
                    fs.existsSync(imageFolderPath) &&
                    fs.statSync(imageFolderPath).isDirectory()
                  ) {
                    // Retrieve all image files
                    const imagesPaths = fs.readdirSync(imageFolderPath).filter(isImageFile)

                    // Create a new Gallery Data item so we know where the block lives and can replace
                    // it with images later.
                    let currentGalleryIndex =
                      galleryData.push({
                        blockIndex: index,
                        images: new Array<Image>(),
                        columns: data.columns || 3,  // Default to 3 columns if not specified
                        spacing: data.spacing || "10px",  // Default to 10px spacing if not specified
                        height: data.height || 240,  // Default height of 240px if not specified
                        radius: data.radius || 8  // Default radius of 8px if not specified
                      } as GalleryCodeNodeData) - 1

                    // Go through each image we find and store its data as an Image Node.
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

            // If we didn't have any actual images, just leave now.
            if (galleryData.length === 0) {
              return
            }

            // Sort them from bottom to top, so we don't modify anything before we reach the next one.
            galleryData
              .sort((a, b) => b.blockIndex - a.blockIndex)
              .forEach((gallery) => {
                // Create a grid structure with columns and spacing
                const gridContainer = {
                  type: "html",
                  value: `<div class="image-gallery" style="display: grid; grid-template-columns: repeat(${gallery.columns}, 1fr); gap: ${gallery.spacing};">`,
                }
                const gridEnd = {
                  type: "html",
                  value: `</div>`,
                }

                const imageNodes = gallery.images.map(image => ({
                  type: "html",
                  value: `<a href="${image.url}" class="lightbox"><img src="${image.url}" style="width: 100%; height: ${gallery.height}px; object-fit: cover; border-radius: ${gallery.radius}px;" /></a>`
                }))

                // Remove the Code block and put in the grid container, images, and grid end
                tree.children.splice(gallery.blockIndex, 1, gridContainer, ...imageNodes, gridEnd)
              })
          }
        },
      ]
    },
  }
}

// Determine if a file is an image based on its extension.  (This is not foolproof, but good enough...)
function isImageFile(filePath: string) {
  const ext: string = path.extname(filePath).toLowerCase()
  return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"].includes(ext)
}
