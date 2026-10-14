import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export default async function PrivateLayout({children}:{children:React.ReactNode}){const supabase=await createSupabaseServerClient();if(!supabase)return <SetupRequired/>;const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");const {data:p}=await supabase.from("profiles").select("display_name,role,is_active").eq("id",user.id).single();if(!p?.is_active)return <main className="setup"><section className="setupCard"><h1>Tài khoản chưa hoạt động</h1><p>Liên hệ Admin để được cấp quyền.</p></section></main>;return <AppShell name={p.display_name} role={p.role}>{children}</AppShell>}
