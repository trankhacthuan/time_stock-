import { z } from "zod";
export const documentItemSchema = z.object({ productId: z.uuid(), batchId: z.uuid().nullable().optional(), quantity: z.coerce.number().positive().multipleOf(0.001), unitCost: z.coerce.number().nonnegative().multipleOf(0.01).optional() });
export const documentSchema = z.object({ warehouseId: z.uuid(), supplierId: z.uuid().nullable().optional(), occurredAt: z.iso.datetime(), note: z.string().trim().max(1000).optional(), items: z.array(documentItemSchema).min(1) });
export function csvWithBom(headers: string[], rows: (string | number)[][]) { const q = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`; return `\uFEFF${[headers, ...rows].map((r) => r.map(q).join(",")).join("\r\n")}`; }
