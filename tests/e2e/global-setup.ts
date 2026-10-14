import { mkdir, writeFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

export default async function globalSetup() {
  loadEnvConfig(process.cwd());
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!secret) throw new Error("Thiếu cấu hình Supabase cho E2E");
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const email=`e2e-${Date.now()}@superstock.invalid`; const password=`E2e!${crypto.randomUUID()}Aa1`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"E2E SuperStock"}});
  if(error||!data.user) throw error??new Error("Không tạo được E2E user");
  const {error:profileError}=await admin.from("profiles").update({role:"admin",is_active:true}).eq("id",data.user.id);
  if(profileError) throw profileError;
  await mkdir("test-results",{recursive:true});
  await writeFile("test-results/e2e-user.json",JSON.stringify({id:data.user.id,email,password}),"utf8");
}
