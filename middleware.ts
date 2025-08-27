import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/", "/api/webhooks/(.*)", "/api/conversations"])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth.protect()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}


