import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";
export async function proxy(request: NextRequest) { const env = getPublicEnv(); if (!env) return NextResponse.next(); let response = NextResponse.next({ request }); const client = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } }); await client.auth.getClaims(); return response; }
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
