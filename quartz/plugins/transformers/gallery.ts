import { QuartzTransformerPlugin } from "../types"
import { Root, Code, Image } from "mdast"
import { visit } from "unist-util-visit"
import yaml from "js-yaml"
import fs from "fs"
import path from "path"
import { FilePath, slugifyFilePath } from "../../util/path"
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
  uniform?: boolean;
  shadow?: number; // Added shadow parameter
}

export interface GalleryCodeNodeData {
  blockIndex: number
  images: Array<Image>
  columns: number
  spacing: string
  radius: number
  uniform: boolean
  shadow: number // Added shadow parameter
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
                        radius: data.radius || 8,
                        uniform: data.uniform || false,
                        shadow: data.shadow || 0, // Default to 0 if not provided
                      } as GalleryCodeNodeData) - 1

                    imagesPaths.forEach((imagePath) => {
                      const url =  "/" + data.path + "/" + slugifyFilePath(imagePath as FilePath)
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
                  value: `<div class="image-column">`,
                }))
                const columnEnds = Array.from({ length: gallery.columns }, (_, i) => ({
                  type: "html",
                  value: `</div>`,
                }))

                let imageNodes = gallery.images.reduce((acc, image, index) => {
                  const columnIndex = index % gallery.columns
                  const shadowValue = gallery.shadow > 0 ? `0 4px 8px rgba(0, 0, 0, ${gallery.shadow})` : 'none';
                  const style = gallery.uniform
                    ? `width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: ${gallery.radius}px; box-shadow: ${shadowValue};`
                    : `width: 100%; object-fit: contain; border-radius: ${gallery.radius}px; box-shadow: ${shadowValue};`
                  acc[columnIndex].push({
                    type: "html",
                    value: `<div class="image-item"><img src="${image.url}" class="gallery-image" style="${style}" onclick="openPopup('${image.url}')" /></div>`
                  })
                  return acc
                }, Array.from({ length: gallery.columns }, () => []))

                let combinedNodes = []
                for (let i = 0; i < gallery.columns; i++) {
                  combinedNodes.push(columnContainers[i], ...imageNodes[i], columnEnds[i])
                }

                const overlayScript = `
                <style>
                .image-gallery {
                display: flex;
                gap: ${gallery.spacing};
                }

                .image-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: ${gallery.spacing};
                }

                .image-item img {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .image-item img:hover {
                transform: scale(0.97);
                }

                .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.3); /* Fallback for browsers that don't support backdrop-filter */
                background-size: cover;
                -webkit-backdrop-filter: blur(5px); /* Safari */
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                visibility: hidden;
                opacity: 0.5;
                transition: visibility 0s, opacity 0.3s ease;
                z-index: 1000;
                }

                .popup-overlay.visible {
                visibility: visible;
                opacity: 1;
                }

                .popup-content {
                max-width: 90%;
                max-height: 90%;
                display: flex;
                justify-content: center;
                align-items: center;
                }

                .popup-content img {
                width: 50%;
                height: auto;
                border-radius: ${gallery.radius}px;
                }
                </style>

                <script>
                function openPopup(url) {
                const overlay = document.getElementById('popup-overlay');
                const content = document.getElementById('popup-content');
                content.src = url;
                overlay.classList.add('visible');
                }

                function closePopup() {
                const overlay = document.getElementById('popup-overlay');
                overlay.classList.remove('visible');
                }
                </script>
                `;

                const popupHtml = `
                <div id="popup-overlay" class="popup-overlay" onclick="closePopup()">
                <div class="popup-content">
                  <img id="popup-content" src="" />
                </div>
                </div>
                `;

                tree.children.splice(gallery.blockIndex, 1, {
                  type: "html",
                  value: `<div class="image-gallery">`,
                }, ...combinedNodes, {
                  type: "html",
                  value: `</div>${overlayScript}${popupHtml}`,
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
