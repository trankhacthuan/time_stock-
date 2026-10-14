\set ON_ERROR_STOP on
begin;
insert into auth.users(id,aud,role,email,created_at,updated_at) values('00000000-0000-0000-0000-000000000099','authenticated','authenticated','rpc-test@superstock.invalid',now(),now()) on conflict(id) do nothing;
insert into public.profiles(id,display_name,role,is_active) values('00000000-0000-0000-0000-000000000099','RPC test','admin',true) on conflict(id) do update set role='admin',is_active=true;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000099',true);
set local role authenticated;

insert into public.stock_receipts(id,code,warehouse_id,supplier_id,created_by) values('90000000-0000-0000-0000-000000000001','PN-TEST-ATOMIC','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000099');
insert into public.stock_receipt_items(id,receipt_id,product_id,quantity,unit_cost) values('91000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000004',5,85000);
select public.confirm_stock_receipt('90000000-0000-0000-0000-000000000001');
do $$ begin assert (select quantity=45 from public.inventory_balances where warehouse_id='30000000-0000-0000-0000-000000000001' and product_id='40000000-0000-0000-0000-000000000004' and batch_id is null),'receipt balance mismatch'; assert (select count(*)=1 from public.stock_movements where source_id='90000000-0000-0000-0000-000000000001'),'receipt movement mismatch'; begin perform public.confirm_stock_receipt('90000000-0000-0000-0000-000000000001'); raise exception 'retry should have failed'; exception when others then if sqlerrm='retry should have failed' then raise; end if; end; end $$;

insert into public.stock_issues(id,code,warehouse_id,reason,created_by) values('90000000-0000-0000-0000-000000000002','PX-TEST-ATOMIC','30000000-0000-0000-0000-000000000001','Kiểm thử','00000000-0000-0000-0000-000000000099');
insert into public.stock_issue_items(id,issue_id,product_id,quantity) values('91000000-0000-0000-0000-000000000002','90000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000004',6);
select public.confirm_stock_issue('90000000-0000-0000-0000-000000000002');
do $$ begin assert (select quantity=39 from public.inventory_balances where warehouse_id='30000000-0000-0000-0000-000000000001' and product_id='40000000-0000-0000-0000-000000000004' and batch_id is null),'issue balance mismatch'; begin update public.inventory_balances set quantity=999 where product_id='40000000-0000-0000-0000-000000000004'; raise exception 'direct balance update should fail'; exception when insufficient_privilege then null; end; begin delete from public.stock_movements where source_id='90000000-0000-0000-0000-000000000001'; raise exception 'movement delete should fail'; exception when insufficient_privilege then null; end; end $$;

select public.cancel_stock_document('issue','90000000-0000-0000-0000-000000000002','Đảo phiếu kiểm thử');
select public.cancel_stock_document('receipt','90000000-0000-0000-0000-000000000001','Đảo phiếu kiểm thử');
do $$ begin assert (select quantity=40 from public.inventory_balances where warehouse_id='30000000-0000-0000-0000-000000000001' and product_id='40000000-0000-0000-0000-000000000004' and batch_id is null),'reversal balance mismatch'; assert (select count(*)=2 from public.stock_movements where movement_kind='reversal' and source_id in ('90000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000002')),'reversal movement mismatch'; end $$;

insert into public.stock_issues(id,code,warehouse_id,reason,created_by) values('90000000-0000-0000-0000-000000000003','PX-TEST-OVERSELL','30000000-0000-0000-0000-000000000001','Kiểm thử vượt tồn','00000000-0000-0000-0000-000000000099');
insert into public.stock_issue_items(id,issue_id,product_id,quantity) values('91000000-0000-0000-0000-000000000003','90000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000004',41);
do $$ begin begin perform public.confirm_stock_issue('90000000-0000-0000-0000-000000000003'); raise exception 'oversell should fail'; exception when others then if sqlerrm='oversell should fail' then raise; end if; end; assert (select quantity=40 from public.inventory_balances where warehouse_id='30000000-0000-0000-0000-000000000001' and product_id='40000000-0000-0000-0000-000000000004' and batch_id is null),'failed issue changed balance'; assert (select status='draft' from public.stock_issues where id='90000000-0000-0000-0000-000000000003'),'failed issue changed status'; end $$;

insert into public.stock_adjustments(id,code,warehouse_id,reason,created_by) values('90000000-0000-0000-0000-000000000004','DC-TEST-ATOMIC','30000000-0000-0000-0000-000000000001','Kiểm kê test','00000000-0000-0000-0000-000000000099');
insert into public.stock_adjustment_items(id,adjustment_id,product_id,counted_quantity) values('91000000-0000-0000-0000-000000000004','90000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000004',42);
select public.confirm_stock_adjustment('90000000-0000-0000-0000-000000000004');
select public.cancel_stock_document('adjustment','90000000-0000-0000-0000-000000000004','Đảo kiểm kê test');
do $$ begin assert (select quantity=40 from public.inventory_balances where warehouse_id='30000000-0000-0000-0000-000000000001' and product_id='40000000-0000-0000-0000-000000000004' and batch_id is null),'adjustment reversal mismatch'; end $$;

do $$ declare v_id uuid; begin
  v_id := public.create_stock_document('receipt','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',now(),null,'Tạo nguyên tử',
    '[{"productId":"40000000-0000-0000-0000-000000000005","quantity":2,"unitCost":1000},{"productId":"40000000-0000-0000-0000-000000000006","quantity":3,"unitCost":2000}]'::jsonb);
  assert (select count(*)=2 from public.stock_receipt_items where receipt_id=v_id),'atomic receipt did not create all items';
  begin
    perform public.create_stock_document('receipt','30000000-0000-0000-0000-000000000001',null,now(),null,null,
      '[{"productId":"40000000-0000-0000-0000-000000000005","quantity":2,"unitCost":1000},{"productId":"40000000-0000-0000-0000-000000000005","quantity":3,"unitCost":2000}]'::jsonb);
    raise exception 'duplicate lines should have failed';
  exception when unique_violation then null; end;
  assert (select count(*)=1 from public.stock_receipts where note='Tạo nguyên tử'),'failed document left partial header';

  v_id := public.create_stock_adjustment('30000000-0000-0000-0000-000000000001',now(),'Kiểm kê qua RPC',null,
    '[{"productId":"40000000-0000-0000-0000-000000000005","countedQuantity":12}]'::jsonb);
  assert (select count(*)=1 from public.stock_adjustment_items where adjustment_id=v_id),'atomic adjustment item missing';
end $$;
rollback;
select 'RPC/RLS integration checks passed' as result;
