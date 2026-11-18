import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const AUTH_PAGES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/dashboard"];

// 頁面層級的導向：未登入進受保護頁面 → /login；已登入進登入頁 → /dashboard
// Landing page（/）所有人都能看。真正的資料權限檢查在 API route 內再做一次
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isAuthPage && !isProtected) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
