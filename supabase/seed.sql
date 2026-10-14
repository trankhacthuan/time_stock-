-- DEMO ONLY. Run through `supabase db reset` on a local/test project.
-- This seed deliberately creates no usable password or real personal data.
begin;
insert into auth.users(id,aud,role,email,created_at,updated_at) values ('00000000-0000-0000-0000-000000000001','authenticated','authenticated','ledger-actor@superstock.invalid',now(),now()) on conflict(id) do nothing;
insert into public.profiles(id,display_name,role,is_active) values ('00000000-0000-0000-0000-000000000001','Tác nhân dữ liệu DEMO','admin',false) on conflict(id) do update set display_name=excluded.display_name;

insert into public.categories(id,code,name) values
('10000000-0000-0000-0000-000000000001','ANLIEN','Đồ ăn liền'),('10000000-0000-0000-0000-000000000002','THUCPHAM','Thực phẩm khô/đóng gói'),('10000000-0000-0000-0000-000000000003','DOUONG','Đồ uống'),('10000000-0000-0000-0000-000000000004','GIADUNG','Gia dụng'),('10000000-0000-0000-0000-000000000005','CHAMSOC','Hóa mỹ phẩm/chăm sóc cá nhân'),('10000000-0000-0000-0000-000000000006','KHAC','Đồ dùng khác') on conflict(code) do update set name=excluded.name;
insert into public.suppliers(id,code,name,contact_note) values
('20000000-0000-0000-0000-000000000001','NCC-DEMO-01','Nhà cung cấp Demo An Việt','Dữ liệu giả lập'),('20000000-0000-0000-0000-000000000002','NCC-DEMO-02','Nhà cung cấp Demo Lam Sơn','Dữ liệu giả lập'),('20000000-0000-0000-0000-000000000003','NCC-DEMO-03','Nhà cung cấp Demo Minh Hải','Dữ liệu giả lập'),('20000000-0000-0000-0000-000000000004','NCC-DEMO-04','Nhà cung cấp Demo Tân Phú','Dữ liệu giả lập') on conflict(code) do update set name=excluded.name;
insert into public.warehouses(id,code,name,location_note) values ('30000000-0000-0000-0000-000000000001','KHO-CHINH','Kho chính','Địa điểm giả lập'),('30000000-0000-0000-0000-000000000002','KHO-PHU','Kho phụ','Địa điểm giả lập') on conflict(code) do update set name=excluded.name;
insert into public.products(id,sku,name,category_id,unit,barcode,reference_cost,reference_price,minimum_stock,tracks_batches) values
('40000000-0000-0000-0000-000000000001','SKU-0001','Mì ăn liền vị bò','10000000-0000-0000-0000-000000000001','gói','8930000000001',3500,5000,24,true),
('40000000-0000-0000-0000-000000000002','SKU-0002','Cháo ăn liền','10000000-0000-0000-0000-000000000001','gói','8930000000002',4500,6500,18,true),
('40000000-0000-0000-0000-000000000003','SKU-0003','Phở ăn liền','10000000-0000-0000-0000-000000000001','gói','8930000000003',5500,7500,18,true),
('40000000-0000-0000-0000-000000000004','SKU-0004','Gạo thơm 5 kg','10000000-0000-0000-0000-000000000002','bao','8930000000004',85000,105000,8,false),
('40000000-0000-0000-0000-000000000005','SKU-0005','Đường tinh luyện 1 kg','10000000-0000-0000-0000-000000000002','gói','8930000000005',18000,23000,12,false),
('40000000-0000-0000-0000-000000000006','SKU-0006','Muối tinh 500 g','10000000-0000-0000-0000-000000000002','gói','8930000000006',4500,7000,12,false),
('40000000-0000-0000-0000-000000000007','SKU-0007','Dầu ăn 1 lít','10000000-0000-0000-0000-000000000002','chai','8930000000007',32000,41000,10,true),
('40000000-0000-0000-0000-000000000008','SKU-0008','Nước mắm 500 ml','10000000-0000-0000-0000-000000000002','chai','8930000000008',28000,37000,10,true),
('40000000-0000-0000-0000-000000000009','SKU-0009','Nước suối 500 ml','10000000-0000-0000-0000-000000000003','chai','8930000000009',2800,5000,48,true),
('40000000-0000-0000-0000-000000000010','SKU-0010','Nước ngọt có ga','10000000-0000-0000-0000-000000000003','lon','8930000000010',6500,10000,36,true),
('40000000-0000-0000-0000-000000000011','SKU-0011','Trà xanh đóng chai','10000000-0000-0000-0000-000000000003','chai','8930000000011',7000,11000,30,true),
('40000000-0000-0000-0000-000000000012','SKU-0012','Nước rửa chén 750 ml','10000000-0000-0000-0000-000000000004','chai','8930000000012',22000,31000,8,false),
('40000000-0000-0000-0000-000000000013','SKU-0013','Túi rác cuộn','10000000-0000-0000-0000-000000000004','cuộn','8930000000013',12000,19000,10,false),
('40000000-0000-0000-0000-000000000014','SKU-0014','Khăn giấy hộp','10000000-0000-0000-0000-000000000004','hộp','8930000000014',14000,22000,12,false),
('40000000-0000-0000-0000-000000000015','SKU-0015','Miếng rửa chén','10000000-0000-0000-0000-000000000004','gói','8930000000015',7000,12000,10,false),
('40000000-0000-0000-0000-000000000016','SKU-0016','Dầu gội 650 ml','10000000-0000-0000-0000-000000000005','chai','8930000000016',68000,89000,6,false),
('40000000-0000-0000-0000-000000000017','SKU-0017','Kem đánh răng 180 g','10000000-0000-0000-0000-000000000005','tuýp','8930000000017',26000,39000,8,false),
('40000000-0000-0000-0000-000000000018','SKU-0018','Xà phòng bánh','10000000-0000-0000-0000-000000000005','bánh','8930000000018',9000,15000,10,false),
('40000000-0000-0000-0000-000000000019','SKU-0019','Pin AA vỉ 4 viên','10000000-0000-0000-0000-000000000006','vỉ','8930000000019',18000,29000,8,false),
('40000000-0000-0000-0000-000000000020','SKU-0020','Bóng đèn LED 9W','10000000-0000-0000-0000-000000000006','bóng','8930000000020',24000,39000,6,false)
on conflict(sku) do update set name=excluded.name,reference_cost=excluded.reference_cost,minimum_stock=excluded.minimum_stock;

insert into public.product_suppliers(product_id,supplier_id,is_default) select id,'20000000-0000-0000-0000-000000000001',true from public.products where sku between 'SKU-0001' and 'SKU-0008' on conflict(product_id,supplier_id) do update set is_default=true;
insert into public.product_suppliers(product_id,supplier_id,is_default) select id,'20000000-0000-0000-0000-000000000002',true from public.products where sku between 'SKU-0009' and 'SKU-0011' on conflict(product_id,supplier_id) do update set is_default=true;
insert into public.product_suppliers(product_id,supplier_id,is_default) select id,'20000000-0000-0000-0000-000000000003',true from public.products where sku between 'SKU-0012' and 'SKU-0018' on conflict(product_id,supplier_id) do update set is_default=true;
insert into public.product_suppliers(product_id,supplier_id,is_default) select id,'20000000-0000-0000-0000-000000000004',true from public.products where sku between 'SKU-0019' and 'SKU-0020' on conflict(product_id,supplier_id) do update set is_default=true;

insert into public.inventory_balances(warehouse_id,product_id,quantity)
select '30000000-0000-0000-0000-000000000001',id,case when sku in ('SKU-0003','SKU-0018') then 0 when sku in ('SKU-0005','SKU-0010','SKU-0016') then 4 else 40 end from public.products
on conflict(warehouse_id,product_id,batch_id) do update set quantity=excluded.quantity;

insert into public.stock_receipts(id,code,warehouse_id,supplier_id,occurred_at,status,note,created_by,confirmed_by,confirmed_at)
values('50000000-0000-0000-0000-000000000001','PN-DEMO-001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',now()-interval '8 days','confirmed','Dữ liệu DEMO','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',now()-interval '8 days') on conflict(code) do nothing;
insert into public.stock_receipt_items(receipt_id,product_id,quantity,unit_cost) select '50000000-0000-0000-0000-000000000001',id,50,reference_cost from public.products on conflict do nothing;
insert into public.stock_movements(movement_kind,warehouse_id,product_id,quantity_delta,quantity_before,quantity_after,reference_unit_cost,source_type,source_id,source_item_id,actor_id,occurred_at)
select 'receipt','30000000-0000-0000-0000-000000000001',i.product_id,50,0,50,i.unit_cost,'receipt',i.receipt_id,i.id,'00000000-0000-0000-0000-000000000001',now()-interval '8 days' from public.stock_receipt_items i where i.receipt_id='50000000-0000-0000-0000-000000000001' on conflict(source_type,source_id,source_item_id,movement_kind) do nothing;
insert into public.stock_issues(id,code,warehouse_id,occurred_at,reason,status,note,created_by,confirmed_by,confirmed_at)
values('50000000-0000-0000-0000-000000000002','PX-DEMO-001','30000000-0000-0000-0000-000000000001',now()-interval '2 days','Xuất sử dụng DEMO','confirmed','Dữ liệu DEMO','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',now()-interval '2 days') on conflict(code) do nothing;
insert into public.stock_issue_items(issue_id,product_id,quantity) select '50000000-0000-0000-0000-000000000002',p.id,50-b.quantity from public.products p join public.inventory_balances b on b.product_id=p.id and b.warehouse_id='30000000-0000-0000-0000-000000000001' where b.quantity<50 on conflict do nothing;
insert into public.stock_movements(movement_kind,warehouse_id,product_id,quantity_delta,quantity_before,quantity_after,source_type,source_id,source_item_id,actor_id,reason,occurred_at)
select 'issue','30000000-0000-0000-0000-000000000001',i.product_id,-i.quantity,50,50-i.quantity,'issue',i.issue_id,i.id,'00000000-0000-0000-0000-000000000001','Xuất sử dụng DEMO',now()-interval '2 days' from public.stock_issue_items i where i.issue_id='50000000-0000-0000-0000-000000000002' on conflict(source_type,source_id,source_item_id,movement_kind) do nothing;
commit;
