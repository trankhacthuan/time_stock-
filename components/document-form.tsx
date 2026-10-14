import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createDraft } from "@/server/actions";
import { InventoryEditor } from "@/components/inventory-editor";

export async function DocumentForm({ kind, error }: { kind: "receipt" | "issue"; error?: string }) {
  const supabase = await createSupabaseServerClient();
  const [{ data: warehouses }, { data: products }, { data: suppliers }] = supabase ? await Promise.all([
    supabase.from("warehouses").select("id,code,name").eq("is_active", true).order("name"),
    supabase.from("products").select("id,sku,name,unit").eq("is_active", true).order("name"),
    supabase.from("suppliers").select("id,code,name").eq("is_active", true).order("name"),
  ]) : [{ data: [] }, { data: [] }, { data: [] }];
  return <InventoryEditor mode={kind} products={products ?? []} warehouses={warehouses ?? []} suppliers={suppliers ?? []} occurredAt={new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).slice(0, 16)} action={createDraft} error={error}/>;
}
