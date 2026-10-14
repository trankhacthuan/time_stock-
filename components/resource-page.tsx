import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveResource } from "@/server/actions";

type ResourceKind = "products" | "categories" | "suppliers" | "warehouses";
type Row = Record<string, unknown>;
const defs = {
  products: { title:"Sản phẩm", subtitle:"Danh mục hàng hóa và ngưỡng tồn", select:"id,sku,name,category_id,unit,barcode,reference_cost,reference_price,minimum_stock,tracks_batches,is_active,categories(name)", headers:["Mã SKU","Tên sản phẩm","Đơn vị","Giá vốn","Tồn tối thiểu","Trạng thái"] },
  categories: { title:"Danh mục", subtitle:"Nhóm sản phẩm đang quản lý", select:"id,code,name,is_active,updated_at", headers:["Mã","Tên danh mục","Trạng thái","Cập nhật"] },
  suppliers: { title:"Nhà cung cấp", subtitle:"Đối tác cung ứng", select:"id,code,name,contact_note,is_active", headers:["Mã","Tên","Ghi chú","Trạng thái"] },
  warehouses: { title:"Kho hàng", subtitle:"Điểm lưu trữ trong hệ thống đa kho", select:"id,code,name,location_note,is_active", headers:["Mã","Tên kho","Vị trí","Trạng thái"] },
} as const;

function relationName(value: unknown) { return value && typeof value === "object" && "name" in value ? String(value.name) : "—"; }
function values(kind: ResourceKind, row: Row) {
  if(kind === "products") return [row.sku, <span key="name"><strong>{String(row.name)}</strong><br/><small className="muted">{relationName(row.categories)}</small></span>, row.unit, `${Number(row.reference_cost).toLocaleString("vi-VN")} ₫`, row.minimum_stock, row.is_active ? "Đang kinh doanh" : "Ngừng"];
  if(kind === "categories") return [row.code,row.name,row.is_active ? "Hoạt động" : "Ngừng",new Date(String(row.updated_at)).toLocaleDateString("vi-VN")];
  if(kind === "suppliers") return [row.code,row.name,row.contact_note || "—",row.is_active ? "Hoạt động" : "Ngừng"];
  return [row.code,row.name,row.location_note || "—",row.is_active ? "Hoạt động" : "Ngừng"];
}

function Fields({ kind, row, categories }: { kind: ResourceKind; row?: Row; categories: {id:string;name:string}[] }) {
  const active = row ? Boolean(row.is_active) : true;
  return <>
    <input type="hidden" name="kind" value={kind}/>{row?.id && <input type="hidden" name="id" value={String(row.id)}/>} 
    {kind === "products" ? <>
      <div className="formGrid"><label className="field">SKU<input className="input" name="sku" defaultValue={String(row?.sku ?? "")} required maxLength={50}/></label><label className="field">Tên sản phẩm<input className="input" name="name" defaultValue={String(row?.name ?? "")} required maxLength={180}/></label></div>
      <div className="formGrid"><label className="field">Danh mục<select className="input" name="categoryId" defaultValue={String(row?.category_id ?? "")} required><option value="">Chọn danh mục</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="field">Đơn vị<input className="input" name="unit" defaultValue={String(row?.unit ?? "")} required maxLength={30}/></label></div>
      <div className="formGrid"><label className="field">Mã vạch<input className="input" name="barcode" defaultValue={String(row?.barcode ?? "")} maxLength={80}/></label><label className="field">Giá vốn tham khảo<input className="input" type="number" min="0" step="0.01" name="referenceCost" defaultValue={String(row?.reference_cost ?? 0)} required/></label></div>
      <div className="formGrid"><label className="field">Giá bán tham khảo<input className="input" type="number" min="0" step="0.01" name="referencePrice" defaultValue={String(row?.reference_price ?? 0)} required/></label><label className="field">Tồn tối thiểu<input className="input" type="number" min="0" step="0.001" name="minimumStock" defaultValue={String(row?.minimum_stock ?? 0)} required/></label></div>
      <div className="formGrid"><label className="field">Theo dõi lô<select className="input" name="tracksBatches" defaultValue={row?.tracks_batches ? "on" : "off"}><option value="off">Không</option><option value="on">Có</option></select></label><label className="field">Trạng thái<select className="input" name="isActive" defaultValue={active ? "on" : "off"}><option value="on">Đang kinh doanh</option><option value="off">Ngừng kinh doanh</option></select></label></div>
    </> : <>
      <div className="formGrid"><label className="field">Mã<input className="input" name="code" defaultValue={String(row?.code ?? "")} required maxLength={30}/></label><label className="field">Tên<input className="input" name="name" defaultValue={String(row?.name ?? "")} required maxLength={160}/></label></div>
      {kind === "suppliers" && <label className="field">Ghi chú liên hệ<textarea className="input" name="contactNote" defaultValue={String(row?.contact_note ?? "")} rows={2} maxLength={500}/></label>}
      {kind === "warehouses" && <label className="field">Vị trí<textarea className="input" name="locationNote" defaultValue={String(row?.location_note ?? "")} rows={2} maxLength={500}/></label>}
      <label className="field">Trạng thái<select className="input" name="isActive" defaultValue={active ? "on" : "off"}><option value="on">Hoạt động</option><option value="off">Ngừng hoạt động</option></select></label>
    </>}
  </>;
}

export async function ResourcePage({ kind, query }: { kind: ResourceKind; query?: {q?:string;page?:string;error?:string;success?:string} }) {
  const definition = defs[kind]; const supabase = await createSupabaseServerClient(); const page = Math.max(1, Number(query?.page) || 1); const size = 20;
  let request = supabase?.from(kind).select(definition.select, { count:"exact" }).range((page-1)*size, page*size-1).order(kind === "products" ? "name" : "code");
  const q = query?.q?.trim().slice(0,80); if(request && q) request = request.or(`${kind === "products" ? "sku" : "code"}.ilike.%${q.replaceAll(",", "") }%,name.ilike.%${q.replaceAll(",", "")}%`);
  const [{data,error,count}, {data:categoryRows}] = supabase ? await Promise.all([request!, supabase.from("categories").select("id,name").eq("is_active",true).order("name")]) : [{data:[],error:null,count:0},{data:[]}];
  const rows = (data ?? []) as unknown as Row[]; const categories = categoryRows ?? []; const pages = Math.max(1, Math.ceil((count ?? 0)/size));
  return <>
    <header className="pageHead"><div><p className="eyebrow">Dữ liệu nền</p><h1>{definition.title}</h1><p className="muted">{definition.subtitle}</p></div></header>
    {query?.success && <p className="alert success" role="status">Đã lưu thay đổi.</p>}{query?.error && <p className="alert danger" role="alert">Không thể lưu. Mã có thể đã tồn tại hoặc dữ liệu chưa hợp lệ.</p>}
    <details className="panel createPanel"><summary className="button">+ Thêm mới</summary><form className="form compact" action={saveResource}><Fields kind={kind} categories={categories}/><button className="button">Lưu</button></form></details>
    <form className="filterbar"><input className="input" name="q" defaultValue={q} aria-label={`Tìm ${definition.title.toLowerCase()}`} placeholder="Tìm theo mã hoặc tên…"/><button className="button secondary">Tìm kiếm</button>{q&&<Link className="button secondary" href={`/${kind}`}>Xóa lọc</Link>}</form>
    {error ? <p className="alert danger">Không thể tải dữ liệu. Vui lòng thử lại.</p> : <div className="tableWrap"><table className="table"><thead><tr>{definition.headers.map((header)=><th key={header}>{header}</th>)}<th>Thao tác</th></tr></thead><tbody>{rows.map((row)=><tr key={String(row.id)}>{values(kind,row).map((value,index)=><td key={index}>{value as React.ReactNode}</td>)}<td><details className="rowEditor"><summary className="textButton">Sửa</summary><form className="popover form compact" action={saveResource}><Fields kind={kind} row={row} categories={categories}/><button className="button">Cập nhật</button></form></details></td></tr>)}</tbody></table>{!rows.length&&<div className="empty">Chưa có dữ liệu phù hợp.</div>}</div>}
    <nav className="pagination" aria-label="Phân trang"><Link className="button secondary" aria-disabled={page<=1} href={`/${kind}?page=${Math.max(1,page-1)}${q?`&q=${encodeURIComponent(q)}`:""}`}>← Trước</Link><span>Trang {page}/{pages} · {count ?? 0} bản ghi</span><Link className="button secondary" aria-disabled={page>=pages} href={`/${kind}?page=${Math.min(pages,page+1)}${q?`&q=${encodeURIComponent(q)}`:""}`}>Sau →</Link></nav>
    {kind === "products"&&<p className="muted footnote">Tồn kho không được sửa trực tiếp tại sản phẩm. Dùng phiếu điều chỉnh có lý do.</p>}
  </>;
}

export async function InventoryPage({query}:{query?:{q?:string;warehouse?:string}}) {
  const supabase=await createSupabaseServerClient(); let request=supabase?.from("inventory_balances").select("id,quantity,updated_at,products(id,sku,name,unit,minimum_stock),warehouses(id,name)").order("quantity");
  if(request&&query?.warehouse) request=request.eq("warehouse_id",query.warehouse); const [{data},{data:warehouses}]=supabase?await Promise.all([request!,supabase.from("warehouses").select("id,name").eq("is_active",true).order("name")]):[{data:[]},{data:[]}];
  const term=query?.q?.trim().toLocaleLowerCase("vi"); const rows=((data??[]) as unknown as Array<Row>).filter((row)=>!term||relationName(row.products).toLocaleLowerCase("vi").includes(term)||String((row.products as Row)?.sku??"").toLocaleLowerCase("vi").includes(term));
  return <><header className="pageHead"><div><p className="eyebrow">Số dư theo kho</p><h1>Tồn kho</h1><p className="muted">Projection đối soát từ sổ biến động</p></div><Link className="button secondary" href="/stock/adjustments">Điều chỉnh tồn</Link></header><form className="filterbar"><input className="input" name="q" defaultValue={query?.q} placeholder="SKU hoặc tên sản phẩm"/><select className="input" name="warehouse" defaultValue={query?.warehouse}><option value="">Tất cả kho</option>{warehouses?.map((warehouse)=><option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><button className="button secondary">Lọc</button></form><div className="tableWrap"><table className="table"><thead><tr><th>SKU</th><th>Sản phẩm</th><th>Kho</th><th>Số lượng</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>{rows.map((row)=>{const product=row.products as Row;const warehouse=row.warehouses as Row;const quantity=Number(row.quantity),minimum=Number(product?.minimum_stock);const state=quantity<=0?["out","Hết hàng"]:quantity<=minimum?["low","Tồn thấp"]:["ok","Bình thường"];return <tr key={String(row.id)}><td>{String(product?.sku)}</td><td><strong>{String(product?.name)}</strong></td><td>{String(warehouse?.name)}</td><td>{quantity.toLocaleString("vi-VN")} {String(product?.unit)}</td><td><span className={`badge ${state[0]}`}>{state[1]}</span></td><td>{new Date(String(row.updated_at)).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}</td></tr>})}</tbody></table>{!rows.length&&<div className="empty">Chưa có số dư tồn kho phù hợp.</div>}</div></>;
}
