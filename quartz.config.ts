import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Gonçalo Nespral", //🌍 
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "gonespral.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Syne", // "Source Sans Pro",
        body: "Source Sans Pro", // "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: { // https://stephango.com/flexoki
        lightMode: {
          light: "#FFFCF0",
          lightgray: "rgb(242, 240, 229)",
          gray: "rgb(183, 181, 172)",
          darkgray: "rgb(111, 110, 105)",
          dark: "rgb(16, 15, 15)",
          secondary: "#2364AA",
          tertiary: "#3DA5D9",
          highlight: "rgba(22, 71, 127, 0)",
        },
        darkMode: {
          light: "rgb(16, 15, 15)",
          lightgray: "rgb(87, 86, 83)",
          gray: "rgb(135, 133, 128)",
          darkgray: "rgb(206, 205, 195)",
          dark: "rgb(206, 205, 195)",
          secondary: "#3DA5D9",
          tertiary: "#2364AA",
          highlight: "rgba(22, 71, 127, 0)",
        },
        // colors: {
        //   lightMode: {
        //     light: "#faf8f8",
        //     lightgray: "#e5e5e5",
        //     gray: "#b8b8b8",
        //     darkgray: "#4e4e4e",
        //     dark: "#2b2b2b",
        //     secondary: "#284b63",
        //     tertiary: "#84a59d",
        //     highlight: "rgba(143, 159, 169, 0.15)",
        //   },
        //   darkMode: {
        //     light: "#161618",
        //     lightgray: "#393639",
        //     gray: "#646464",
        //     darkgray: "#d4d4d4",
        //     dark: "#ebebec",
        //     secondary: "#7b97aa",
        //     tertiary: "#84a59d",
        //     highlight: "rgba(143, 159, 169, 0.15)",
        //   },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.GalleryTransformer(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
