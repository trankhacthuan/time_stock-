import { InventoryEditor } from "@/components/inventory-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdjustment } from "@/server/actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [{ data: warehouses }, { data: products }] = supabase ? await Promise.all([
    supabase.from("warehouses").select("id,code,name").eq("is_active", true).order("name"),
    supabase.from("products").select("id,sku,name,unit").eq("is_active", true).order("name"),
  ]) : [{ data: [] }, { data: [] }];
  return <>
    {query.success && <p className="alert success" role="status">Đã ghi nhận điều chỉnh và cập nhật tồn kho.</p>}
    <InventoryEditor mode="adjustment" products={products ?? []} warehouses={warehouses ?? []} occurredAt={new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).slice(0, 16)} action={createAdjustment} error={query.error}/>
  </>;
}
