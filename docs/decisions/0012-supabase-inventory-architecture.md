# 0012 Supabase inventory architecture

Date: 2026-10-14

## Status

Accepted for SuperStock MVP.

## Decision

Supabase PostgreSQL/Auth theo yêu cầu sản phẩm. Next.js dùng `@supabase/ssr`; browser chỉ nhận URL và publishable key. `@supabase/server` được cài theo yêu cầu nhưng không dùng trong Next.js vì package không cung cấp adapter Next. RLS bảo vệ mọi bảng. Tồn chỉ thay đổi qua `SECURITY DEFINER` RPC với `search_path` cố định, quyền nội bộ và transaction PostgreSQL.

`inventory_balances` là projection theo kho/sản phẩm/lô; `stock_movements` là ledger bất biến. Quantity là `numeric(14,3)`. Chỉ admin/warehouse_manager xác nhận, đảo hoặc điều chỉnh.

## Consequences

Logic cốt lõi ở database chống bypass/concurrency. Integration phải chạy với database riêng hoặc trong transaction rollback. Secret chỉ nằm server-side và file môi trường bị git-ignore.
