import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/health",
  "/api/files/(.*)",
  "/api/conversations", // list/create conversations can be hit to bootstrap; routes still auth check
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth.protect()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}


