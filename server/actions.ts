"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { documentSchema } from "@/lib/validation/documents";

type Supabase = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

async function authenticated(): Promise<{ supabase: Supabase; userId: string; role: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/settings");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).single();
  if (!profile?.is_active) redirect("/login");
  return { supabase, userId: user.id, role: profile.role };
}

function requireRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) throw new Error("Bạn không có quyền thực hiện thao tác này.");
}

export async function signIn(_: unknown, formData: FormData) {
  const input = z.object({ email: z.email(), password: z.string().min(8) }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Email hoặc mật khẩu chưa hợp lệ." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase chưa được cấu hình." };
  const { error } = await supabase.auth.signInWithPassword(input.data);
  if (error) return { error: "Không thể đăng nhập. Kiểm tra lại thông tin." };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}

const draftInput = z.object({
  kind: z.enum(["receipt", "issue"]),
  warehouseId: z.uuid(),
  supplierId: z.union([z.uuid(), z.literal("")]).optional(),
  occurredAt: z.string().min(1),
  reason: z.string().trim().max(300).optional(),
  note: z.string().trim().max(1000).optional(),
  items: z.string().transform((value, ctx) => {
    try { return JSON.parse(value); } catch { ctx.addIssue({ code: "custom", message: "Danh sách hàng không hợp lệ" }); return z.NEVER; }
  }),
});

export async function createDraft(formData: FormData) {
  const raw = draftInput.safeParse(Object.fromEntries(formData));
  const kind = formData.get("kind") === "issue" ? "issue" : "receipt";
  const base = `/stock/${kind === "receipt" ? "inbound" : "outbound"}/new`;
  if (!raw.success) redirect(`${base}?error=invalid`);
  const parsed = documentSchema.safeParse({
    warehouseId: raw.data.warehouseId,
    supplierId: raw.data.supplierId || null,
    occurredAt: new Date(raw.data.occurredAt).toISOString(),
    note: raw.data.note,
    items: raw.data.items,
  });
  if (!parsed.success || (kind === "issue" && !raw.data.reason)) redirect(`${base}?error=invalid`);
  const { supabase, role } = await authenticated();
  requireRole(role, ["admin", "warehouse_manager", "warehouse_staff"]);
  const { data: id, error } = await supabase.rpc("create_stock_document", {
    p_type: kind,
    p_warehouse_id: parsed.data.warehouseId,
    p_supplier_id: kind === "receipt" ? parsed.data.supplierId ?? null : null,
    p_occurred_at: parsed.data.occurredAt,
    p_reason: kind === "issue" ? raw.data.reason : null,
    p_note: parsed.data.note || null,
    p_items: parsed.data.items,
  });
  if (error || !id) redirect(`${base}?error=save`);
  revalidatePath(`/stock/${kind === "receipt" ? "inbound" : "outbound"}`);
  redirect(`/stock/${kind === "receipt" ? "inbound" : "outbound"}/${id}?created=1`);
}

const adjustmentInput = z.object({
  warehouseId: z.uuid(), occurredAt: z.string().min(1), reason: z.string().trim().min(3).max(300), note: z.string().trim().max(1000).optional(),
  items: z.string().transform((value, ctx) => { try { return JSON.parse(value); } catch { ctx.addIssue({ code: "custom", message: "Dòng kiểm kê không hợp lệ" }); return z.NEVER; } }),
});
const adjustmentItems = z.array(z.object({ productId: z.uuid(), batchId: z.uuid().nullable().optional(), countedQuantity: z.coerce.number().nonnegative().multipleOf(0.001) })).min(1);

export async function createAdjustment(formData: FormData) {
  const raw = adjustmentInput.safeParse(Object.fromEntries(formData));
  if (!raw.success) redirect("/stock/adjustments?error=invalid");
  const items = adjustmentItems.safeParse(raw.data.items);
  if (!items.success) redirect("/stock/adjustments?error=invalid");
  const { supabase, role } = await authenticated();
  requireRole(role, ["admin", "warehouse_manager"]);
  const { data: id, error } = await supabase.rpc("create_stock_adjustment", {
    p_warehouse_id: raw.data.warehouseId,
    p_occurred_at: new Date(raw.data.occurredAt).toISOString(),
    p_reason: raw.data.reason,
    p_note: raw.data.note || null,
    p_items: items.data,
  });
  if (error || !id) redirect("/stock/adjustments?error=save");
  const { error: confirmError } = await supabase.rpc("confirm_stock_adjustment", { p_id: id });
  if (confirmError) redirect("/stock/adjustments?error=confirm");
  revalidatePath("/stock/adjustments"); revalidatePath("/inventory"); revalidatePath("/dashboard");
  redirect("/stock/adjustments?success=1");
}

export async function confirmDocument(formData: FormData) {
  const input = z.object({ id: z.uuid(), kind: z.enum(["receipt", "issue"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) return;
  const { supabase, role } = await authenticated();
  requireRole(role, ["admin", "warehouse_manager"]);
  const { error } = await supabase.rpc(input.data.kind === "receipt" ? "confirm_stock_receipt" : "confirm_stock_issue", { p_id: input.data.id });
  const path = `/stock/${input.data.kind === "receipt" ? "inbound" : "outbound"}/${input.data.id}`;
  if (error) redirect(`${path}?error=confirm`);
  revalidatePath(path); revalidatePath("/inventory"); revalidatePath("/dashboard");
  redirect(`${path}?confirmed=1`);
}

export async function cancelDocument(formData: FormData) {
  const input = z.object({ id: z.uuid(), kind: z.enum(["receipt", "issue", "adjustment"]), reason: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(formData));
  if (!input.success) return;
  const { supabase, role } = await authenticated();
  requireRole(role, ["admin", "warehouse_manager"]);
  const { error } = await supabase.rpc("cancel_stock_document", { p_type: input.data.kind, p_id: input.data.id, p_reason: input.data.reason });
  const path = input.data.kind === "receipt" ? `/stock/inbound/${input.data.id}` : input.data.kind === "issue" ? `/stock/outbound/${input.data.id}` : "/stock/adjustments";
  if (error) redirect(`${path}?error=cancel`);
  revalidatePath(path); revalidatePath("/inventory"); revalidatePath("/dashboard");
  redirect(`${path}?cancelled=1`);
}

const resourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("categories"), id: z.string().optional(), code: z.string().trim().min(2).max(30), name: z.string().trim().min(2).max(120), isActive: z.string().optional() }),
  z.object({ kind: z.literal("suppliers"), id: z.string().optional(), code: z.string().trim().min(2).max(30), name: z.string().trim().min(2).max(160), contactNote: z.string().trim().max(500).optional(), isActive: z.string().optional() }),
  z.object({ kind: z.literal("warehouses"), id: z.string().optional(), code: z.string().trim().min(2).max(30), name: z.string().trim().min(2).max(160), locationNote: z.string().trim().max(500).optional(), isActive: z.string().optional() }),
  z.object({ kind: z.literal("products"), id: z.string().optional(), sku: z.string().trim().min(2).max(50), name: z.string().trim().min(2).max(180), categoryId: z.uuid(), unit: z.string().trim().min(1).max(30), barcode: z.string().trim().max(80).optional(), referenceCost: z.coerce.number().nonnegative(), referencePrice: z.coerce.number().nonnegative(), minimumStock: z.coerce.number().nonnegative(), tracksBatches: z.string().optional(), isActive: z.string().optional() }),
]);

export async function saveResource(formData: FormData) {
  const input = resourceSchema.safeParse(Object.fromEntries(formData));
  const kind = String(formData.get("kind"));
  if (!input.success || !["categories","suppliers","warehouses","products"].includes(kind)) redirect(`/${kind}?error=invalid`);
  const { supabase, role } = await authenticated();
  requireRole(role, ["admin", "warehouse_manager"]);
  const d = input.data;
  let payload: Record<string, unknown>;
  if (d.kind === "products") payload = { sku:d.sku, name:d.name, category_id:d.categoryId, unit:d.unit, barcode:d.barcode || null, reference_cost:d.referenceCost, reference_price:d.referencePrice, minimum_stock:d.minimumStock, tracks_batches:d.tracksBatches === "on", is_active:d.isActive !== "off" };
  else if (d.kind === "suppliers") payload = { code:d.code, name:d.name, contact_note:d.contactNote || null, is_active:d.isActive !== "off" };
  else if (d.kind === "warehouses") payload = { code:d.code, name:d.name, location_note:d.locationNote || null, is_active:d.isActive !== "off" };
  else payload = { code:d.code, name:d.name, is_active:d.isActive !== "off" };
  const query = d.id ? supabase.from(d.kind).update(payload).eq("id", d.id) : supabase.from(d.kind).insert(payload);
  const { error } = await query;
  if (error) redirect(`/${d.kind}?error=save`);
  revalidatePath(`/${d.kind}`);
  redirect(`/${d.kind}?success=1`);
}

export async function updateUser(formData: FormData) {
  const input = z.object({ id: z.uuid(), role: z.enum(["admin","warehouse_manager","warehouse_staff","viewer"]), isActive: z.enum(["true","false"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/users?error=invalid");
  const { supabase, role, userId } = await authenticated();
  requireRole(role, ["admin"]);
  if (input.data.id === userId && input.data.isActive === "false") redirect("/users?error=self");
  const { error } = await supabase.from("profiles").update({ role: input.data.role, is_active: input.data.isActive === "true" }).eq("id", input.data.id);
  if (error) redirect("/users?error=save");
  revalidatePath("/users");
  redirect("/users?success=1");
}
