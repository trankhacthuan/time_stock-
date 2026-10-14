# US-001 — Design

Catalog, warehouse, batch, balance, document/items, movement ledger và RBAC. Balance là projection; movement là bằng chứng bất biến. Server Component đọc Supabase. Mutation parse Zod rồi gọi RPC. RPC lấy `auth.uid()`, kiểm role, khóa dữ liệu, ghi balance + movement + trạng thái trong một transaction.

CSS variables + CSS Modules-compatible global primitives; Be Vietnam Pro/Inter self-hosted; navy/blue/light neutral. Audit lưu actor/source/reason/time. Chỉ Admin/Quản lý kho xác nhận, đảo hoặc điều chỉnh.
