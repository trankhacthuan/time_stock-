import { readFile, rm } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

export default async function globalTeardown() {
  loadEnvConfig(process.cwd());
  try {
    const user=JSON.parse(await readFile("test-results/e2e-user.json","utf8")) as {id:string};
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const secret=process.env.SUPABASE_SECRET_KEY;
    if(url&&secret) await createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}).auth.admin.deleteUser(user.id);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  } finally { await rm("test-results/e2e-user.json",{force:true}); }
}
