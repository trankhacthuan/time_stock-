# SuperStock — Product Brief

SuperStock là ứng dụng nội bộ tiếng Việt để quản lý hàng hóa, tồn theo kho và chứng từ nhập/xuất/điều chỉnh có thể truy vết. MVP ưu tiên dữ liệu đúng, thao tác nhanh và quyền được kiểm tra ở cả server lẫn PostgreSQL.

## Người dùng và quyền

- `admin`: toàn quyền, gồm quản lý tài khoản/vai trò.
- `warehouse_manager`: quản lý danh mục, sản phẩm, nhà cung cấp, kho; xác nhận/đảo chứng từ và điều chỉnh.
- `warehouse_staff`: xem dữ liệu, tạo và sửa chứng từ nháp; không xác nhận.
- `viewer`: chỉ xem kho và báo cáo.

## Phạm vi MVP

Dashboard, catalog, nhiều kho, tồn, chứng từ nhập/xuất/điều chỉnh, ledger bất biến, báo cáo/CSV, Supabase Auth/SSR, RLS/RPC và dữ liệu demo giả lập. Ngoài phạm vi: POS, kế toán, thanh toán, email/SMS, social login và production deployment.

## Quyết định nghiệp vụ

- Số lượng `numeric(14,3)`; thời gian UTC, hiển thị `Asia/Ho_Chi_Minh`.
- `inventory_balances` là snapshot; `stock_movements` là ledger. Chỉ đổi cùng transaction RPC.
- Lô/hạn dùng được hỗ trợ ở schema/RPC; sản phẩm không theo lô dùng `batch_id = NULL`.
- Chỉ Admin/Quản lý kho xác nhận, đảo và điều chỉnh.
- Giá trị tồn dùng “giá vốn tham khảo”, không phải số liệu kế toán.

## Thiết kế

Wordmark SuperStock. Be Vietnam Pro + Inter vì rõ ở dashboard và hỗ trợ tiếng Việt. Navy + blue trên nền sáng; sidebar desktop, điều hướng gọn mobile; WCAG 2.1 AA, từ 320px.

## Tuyến chính

`/login`, `/dashboard`, `/inventory`, `/inventory/[id]`, `/products`, `/categories`, `/suppliers`, `/warehouses`, `/stock/inbound`, `/stock/outbound`, `/stock/adjustments`, `/stock/movements`, `/reports`, `/users`, `/settings`.

## Tiêu chí thành công

Retry không đổi tồn lần hai; xuất đồng thời không âm; client không ghi balance/movement hoặc tự nâng role; dashboard đối soát ledger; thiếu cấu hình hiển thị hướng dẫn và không dùng mock.

