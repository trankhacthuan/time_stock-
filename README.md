# SuperStock

Ứng dụng quản lý kho siêu thị nội bộ bằng Next.js App Router, TypeScript và Supabase. Giao diện tiếng Việt; dữ liệu thật qua RLS/RPC, không fallback sang mock khi thiếu cấu hình.

## Yêu cầu

- Node.js 22+ và pnpm 11+
- Một Supabase project cho development, hoặc Supabase CLI/Docker để chạy local

## Cài đặt và chạy

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm exec supabase start
pnpm exec supabase db reset
pnpm dev
```

Điền `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trong `.env.local`. Với project dùng key legacy, anon key tương ứng publishable key; service-role key tương ứng secret key nhưng chỉ được đặt server-side. Không commit `.env.local`, không đưa secret vào browser hoặc chat.

Migration: `supabase/migrations/202610140001_initial_inventory.sql`. Seed chỉ dành cho local/test, idempotent theo natural/fixed keys, tạo 20 sản phẩm demo và một actor ledger không thể đăng nhập. Sau khi tự tạo tài khoản đầu tiên trong Supabase Auth, cấp Admin một lần bằng SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<UUID tài khoản của bạn>';
```

Không chạy seed demo trên production. Thiết lập backup/retention/hosting production vẫn là quyết định còn mở.

## Kiểm tra

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:release
```

Integration tests cho RPC/RLS chạy trên Supabase local; test E2E tạo một tài khoản Auth tạm thời trên project cấu hình rồi tự xóa sau khi chạy. Migration bảo vệ nhập/xuất/điều chỉnh bằng `SECURITY DEFINER`, `auth.uid()`, row locks, unique movement key và transaction PostgreSQL.

## Phạm vi hiện tại

Đã có auth SSR, route guard, dashboard, CRUD catalog có tìm kiếm/phân trang, tồn theo kho, phiếu nhập-xuất nhiều dòng, xác nhận/đảo qua RPC, form điều chỉnh, ledger, báo cáo CSV, quản trị vai trò/trạng thái, schema/RLS/RPC, seed demo và E2E desktop/mobile/reduced-motion có axe.

Ngoài MVP hiện tại: tự động FEFO, giao diện quản lý lô/hạn dùng chi tiết, mời tài khoản qua email, phân kho theo nhân viên, Lighthouse và triển khai production frontend. Tài khoản mới được tạo trong Supabase Auth; ứng dụng không tự gửi lời mời khi chưa có yêu cầu rõ ràng.

Giá trị tồn là giá trị theo giá vốn tham khảo, không phải báo cáo kế toán.
