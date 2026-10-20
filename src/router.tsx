import { QueryClient } from "@tanstack/react-query"
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { AppShell } from "@/components"
import {
  AboutPage,
  CategoryPage,
  CheckPage,
  ContactPage,
  CookiesPage,
  DownloadPage,
  EditorialPage,
  FileWorkspacePage,
  FilesPage,
  FixPage,
  GuideIndexPage,
  GuidePage,
  HomePage,
  LimitationsPage,
  NotFoundPage,
  PdfCompressorPage,
  PhotoCompressorPage,
  PhotoToPdfPage,
  SignaturePage,
  ImageDimensionsPage,
  PrivacyPage,
  QuickToolsPage,
  RequirementsPage,
  TermsPage,
} from "@/pages"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare",
  component: CategoryPage,
})

const requirementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare/requirements",
  component: RequirementsPage,
})

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare/files",
  component: FilesPage,
})

const fileWorkspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare/file/$slotId",
  component: FileWorkspacePage,
})

const checkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare/check",
  component: CheckPage,
})

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prepare/download",
  component: DownloadPage,
})

const fixRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fix",
  component: () => <FixPage />,
})

const fixRequirementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fix/requirements",
  component: () => <FixPage stage="requirements" />,
})

const fixFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fix/file",
  component: () => <FixPage stage="file" />,
})

const fixResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fix/result",
  component: () => <FixPage stage="result" />,
})

const quickToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quick-tools",
  component: () => <QuickToolsPage />,
})

const photoCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/photo-compressor",
  component: PhotoCompressorPage,
})

const imageDimensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quick-tools/image-dimensions",
  component: ImageDimensionsPage,
})

const signatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quick-tools/signature",
  component: SignaturePage,
})

const pdfCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-compressor",
  component: PdfCompressorPage,
})

const photoToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/photo-to-pdf",
  component: PhotoToPdfPage,
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
})

const limitationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/limitations",
  component: LimitationsPage,
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
})

const editorialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editorial",
  component: EditorialPage,
})

const cookiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cookies",
  component: CookiesPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
})

const guidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guides",
  component: GuideIndexPage,
})

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guides/$slug",
  component: GuidePage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  categoryRoute,
  requirementsRoute,
  filesRoute,
  fileWorkspaceRoute,
  checkRoute,
  downloadRoute,
  fixRoute,
  fixRequirementsRoute,
  fixFileRoute,
  fixResultRoute,
  quickToolsRoute,
  photoCompressorRoute,
  imageDimensionsRoute,
  signatureRoute,
  pdfCompressorRoute,
  photoToPdfRoute,
  privacyRoute,
  limitationsRoute,
  termsRoute,
  editorialRoute,
  cookiesRoute,
  aboutRoute,
  contactRoute,
  guidesRoute,
  guideRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
