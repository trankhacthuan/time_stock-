"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
export function createSupabaseBrowserClient() { const env = getPublicEnv(); if (!env) throw new Error("Supabase chưa được cấu hình."); return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
