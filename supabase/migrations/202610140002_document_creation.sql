begin;

create or replace function public.create_stock_document(
  p_type text,
  p_warehouse_id uuid,
  p_supplier_id uuid default null,
  p_occurred_at timestamptz default now(),
  p_reason text default null,
  p_note text default null,
  p_items jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_code text;
  v_item jsonb;
  v_product uuid;
  v_batch uuid;
  v_quantity numeric(14,3);
  v_cost numeric(16,2);
begin
  if public.current_role() not in ('admin','warehouse_manager','warehouse_staff') then
    raise exception 'Bạn không có quyền tạo phiếu';
  end if;
  if p_type not in ('receipt','issue') then raise exception 'Loại phiếu không hợp lệ'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Phiếu phải có ít nhất một dòng hàng';
  end if;
  if p_type = 'issue' and length(trim(coalesce(p_reason,''))) = 0 then
    raise exception 'Phiếu xuất cần lý do';
  end if;

  v_code := (case when p_type='receipt' then 'PN-' else 'PX-' end)
    || to_char(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh','YYYYMMDD-HH24MISS-')
    || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));

  if p_type = 'receipt' then
    insert into public.stock_receipts(id,code,warehouse_id,supplier_id,occurred_at,note,created_by)
    values(v_id,v_code,p_warehouse_id,p_supplier_id,p_occurred_at,nullif(trim(p_note),''),auth.uid());
  else
    insert into public.stock_issues(id,code,warehouse_id,occurred_at,reason,note,created_by)
    values(v_id,v_code,p_warehouse_id,p_occurred_at,trim(p_reason),nullif(trim(p_note),''),auth.uid());
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product := (v_item->>'productId')::uuid;
    v_batch := nullif(v_item->>'batchId','')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    if v_quantity <= 0 then raise exception 'Số lượng phải lớn hơn 0'; end if;
    if not exists(select 1 from public.products where id=v_product and is_active) then
      raise exception 'Sản phẩm không tồn tại hoặc đã ngừng';
    end if;
    if v_batch is not null and not exists(select 1 from public.product_batches where id=v_batch and product_id=v_product) then
      raise exception 'Lô hàng không thuộc sản phẩm';
    end if;
    if p_type = 'receipt' then
      v_cost := coalesce((v_item->>'unitCost')::numeric,0);
      if v_cost < 0 then raise exception 'Đơn giá không hợp lệ'; end if;
      insert into public.stock_receipt_items(receipt_id,product_id,batch_id,quantity,unit_cost)
      values(v_id,v_product,v_batch,v_quantity,v_cost);
    else
      insert into public.stock_issue_items(issue_id,product_id,batch_id,quantity)
      values(v_id,v_product,v_batch,v_quantity);
    end if;
  end loop;
  return v_id;
end $$;

create or replace function public.create_stock_adjustment(
  p_warehouse_id uuid,
  p_occurred_at timestamptz,
  p_reason text,
  p_note text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_code text;
  v_item jsonb;
  v_product uuid;
  v_batch uuid;
  v_counted numeric(14,3);
begin
  if not public.is_manager() then raise exception 'Bạn không có quyền điều chỉnh tồn'; end if;
  if length(trim(coalesce(p_reason,''))) = 0 then raise exception 'Phiếu điều chỉnh cần lý do'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Phiếu phải có ít nhất một dòng hàng';
  end if;
  v_code := 'DC-' || to_char(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh','YYYYMMDD-HH24MISS-') || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.stock_adjustments(id,code,warehouse_id,occurred_at,reason,note,created_by)
  values(v_id,v_code,p_warehouse_id,p_occurred_at,trim(p_reason),nullif(trim(p_note),''),auth.uid());
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product := (v_item->>'productId')::uuid;
    v_batch := nullif(v_item->>'batchId','')::uuid;
    v_counted := (v_item->>'countedQuantity')::numeric;
    if v_counted < 0 then raise exception 'Số kiểm đếm không được âm'; end if;
    if not exists(select 1 from public.products where id=v_product and is_active) then raise exception 'Sản phẩm không tồn tại hoặc đã ngừng'; end if;
    insert into public.stock_adjustment_items(adjustment_id,product_id,batch_id,counted_quantity)
    values(v_id,v_product,v_batch,v_counted);
  end loop;
  return v_id;
end $$;

revoke all on function public.create_stock_document(text,uuid,uuid,timestamptz,text,text,jsonb) from public,anon;
revoke all on function public.create_stock_adjustment(uuid,timestamptz,text,text,jsonb) from public,anon;
grant execute on function public.create_stock_document(text,uuid,uuid,timestamptz,text,text,jsonb) to authenticated;
grant execute on function public.create_stock_adjustment(uuid,timestamptz,text,text,jsonb) to authenticated;

commit;
