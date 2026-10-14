export const roles = ["admin", "warehouse_manager", "warehouse_staff", "viewer"] as const;
export type Role = (typeof roles)[number];
export const canConfirm = (role: Role) => role === "admin" || role === "warehouse_manager";
export function stockState(quantity: number, minimum: number) { return quantity <= 0 ? "out" as const : quantity <= minimum ? "low" as const : "ok" as const; }
export const formatVnd = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
