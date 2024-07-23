import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/gonespral",
      LinkedIn: "https://linked.in/gonespral",
      Hackaday: "https://hackaday.io/projects/hacker/297599"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    // Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.Search()),
    // Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    //Component.DesktopOnly(Component.Graph()), 
    // Component.RecentNotes({ title: "Recents", limit: 5}),
    // Component.DesktopOnly(Component.Explorer()),
    // Component.DesktopOnly(Component.TableOfContents()),
    //Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.Search()),
    //Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    //Component.DesktopOnly(Component.Graph()), 
    // Component.DesktopOnly(Component.RecentNotes({ title: "Recently Added", limit: 5})),
  ],
}
