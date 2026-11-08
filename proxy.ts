import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Signed-in app routes (the (app) and (onboarding) route groups) */
const isAppRoute = createRouteMatcher([
  "/library(.*)",
  "/notes(.*)",
  "/books(.*)",
  "/study(.*)",
  "/voice(.*)",
  "/referrals(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/affiliates/dashboard(.*)",
]);

const REF_COOKIE = "hn_ref";
const REF_PATTERN = /^HN[A-Z0-9]{7}$/;

export default clerkMiddleware(async (auth, req) => {
  if (isAppRoute(req)) await auth.protect();

  // Referral attribution (UI_ENGINEERING.md #16): first touch wins, 30 days, HttpOnly
  const ref = req.nextUrl.searchParams.get("ref")?.toUpperCase();
  if (ref && REF_PATTERN.test(ref) && !req.cookies.has(REF_COOKIE)) {
    const res = NextResponse.next();
    res.cookies.set(REF_COOKIE, ref, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
