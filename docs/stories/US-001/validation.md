# US-001 — Validation

## Bằng chứng 2026-10-14

- `pnpm test:release`: pass — ESLint, TypeScript strict, 4 unit tests, 3 Playwright E2E và Next.js production build 20 routes.
- `pnpm exec supabase db reset`: pass trên Supabase local; migration và seed áp dụng thành công.
- `tests/integration/supabase.sql`: pass trên Supabase local trong transaction rollback; kiểm tra tạo phiếu nhiều dòng nguyên tử, nhập/xuất một lần, retry, từ chối vượt tồn, cấm ghi trực tiếp balance/movement, adjustment và reversal. Migration `202610140002_document_creation.sql` đã push lên hosted Supabase sau dry-run.
- Hosted seed đối soát: 20 sản phẩm, 6 danh mục, 4 nhà cung cấp, 2 kho, 20 balance, 40 movement.
- Playwright: pass ở desktop Chromium, Pixel 7 và `prefers-reduced-motion`; đăng nhập bằng tài khoản test tạm, mở dashboard, mở form phiếu nhập nhiều dòng và axe không có violation. Tài khoản test được xóa ở teardown.
- Design review: hành động chính tới phiếu nhập trong một bước từ dashboard; input có label/touch target 44px; mobile 375px tương đương Pixel 7 pass; font tự host Be Vietnam Pro/Inter hiển thị tiếng Việt; axe đã phát hiện và dẫn tới sửa overflow/tương phản sidebar.

## Chưa xác minh

Concurrency bằng hai connection đồng thời, Lighthouse/INP trên thiết bị thật, FEFO và giao diện quản lý lô chi tiết chưa xác minh.
