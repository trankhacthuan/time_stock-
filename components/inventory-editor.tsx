"use client";

import { useMemo, useState } from "react";

type Product = { id: string; sku: string; name: string; unit: string };
type Option = { id: string; code: string; name: string };
type Line = { key: number; productId: string; quantity: string; unitCost: string; countedQuantity: string };

export function InventoryEditor({
  mode, products, warehouses, suppliers = [], occurredAt, action, error,
}: {
  mode: "receipt" | "issue" | "adjustment";
  products: Product[]; warehouses: Option[]; suppliers?: Option[]; occurredAt: string;
  action: (formData: FormData) => void | Promise<void>; error?: string;
}) {
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", quantity: "1", unitCost: "0", countedQuantity: "0" }]);
  const [nextKey, setNextKey] = useState(2);
  const selectedIds = useMemo(() => new Set(lines.map((line) => line.productId).filter(Boolean)), [lines]);
  const serialized = JSON.stringify(lines.map((line) => mode === "adjustment"
    ? { productId: line.productId, batchId: null, countedQuantity: Number(line.countedQuantity) }
    : { productId: line.productId, batchId: null, quantity: Number(line.quantity), ...(mode === "receipt" ? { unitCost: Number(line.unitCost) } : {}) }));
  const update = (key: number, patch: Partial<Line>) => setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
  const add = () => { setLines((current) => [...current, { key: nextKey, productId: "", quantity: "1", unitCost: "0", countedQuantity: "0" }]); setNextKey((value) => value + 1); };
  const remove = (key: number) => setLines((current) => current.length === 1 ? current : current.filter((line) => line.key !== key));
  const title = mode === "receipt" ? "Tạo phiếu nhập" : mode === "issue" ? "Tạo phiếu xuất" : "Ghi nhận kiểm kê";

  return <>
    <header className="pageHead"><div><p className="eyebrow">{mode === "adjustment" ? "Kiểm kê" : "Chứng từ nháp"}</p><h1>{title}</h1><p className="muted">{mode === "adjustment" ? "Tồn chỉ thay đổi sau khi RPC xác nhận nguyên tử." : "Phiếu chỉ tác động tồn sau khi người có quyền xác nhận."}</p></div></header>
    {error && <p className="alert danger" role="alert">{error === "confirm" ? "Không thể xác nhận: số liệu có thể không hợp lệ hoặc tồn không đủ." : "Không thể lưu. Vui lòng kiểm tra dữ liệu và thử lại."}</p>}
    <form className="panel form wide" action={action}>
      {mode !== "adjustment" && <input type="hidden" name="kind" value={mode}/>}<input type="hidden" name="items" value={serialized}/>
      <div className="formGrid">
        <div className="field"><label htmlFor="warehouseId">Kho</label><select className="input" id="warehouseId" name="warehouseId" required><option value="">Chọn kho</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} · {warehouse.name}</option>)}</select></div>
        <div className="field"><label htmlFor="occurredAt">Thời điểm nghiệp vụ</label><input className="input" id="occurredAt" name="occurredAt" type="datetime-local" defaultValue={occurredAt} required/></div>
      </div>
      {mode === "receipt" && <div className="field"><label htmlFor="supplierId">Nhà cung cấp</label><select className="input" id="supplierId" name="supplierId"><option value="">Không chọn</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.code} · {supplier.name}</option>)}</select></div>}
      {(mode === "issue" || mode === "adjustment") && <div className="field"><label htmlFor="reason">Lý do</label><input className="input" id="reason" name="reason" minLength={3} maxLength={300} required placeholder={mode === "issue" ? "Ví dụ: Xuất cho quầy bán" : "Ví dụ: Kiểm kê cuối ca"}/></div>}
      <div className="field"><label htmlFor="note">Ghi chú</label><textarea className="input" id="note" name="note" maxLength={1000} rows={2}/></div>
      <div className="lineHeader"><h2>Dòng hàng</h2><button className="button secondary" type="button" onClick={add}>+ Thêm dòng</button></div>
      <div className="lineList">{lines.map((line, index) => <div className="lineCard" key={line.key}>
        <strong>Dòng {index + 1}</strong>
        <div className="lineGrid">
          <div className="field"><label htmlFor={`product-${line.key}`}>Sản phẩm</label><select className="input" id={`product-${line.key}`} value={line.productId} onChange={(event) => update(line.key, { productId: event.target.value })} required><option value="">Chọn sản phẩm</option>{products.map((product) => <option key={product.id} value={product.id} disabled={selectedIds.has(product.id) && line.productId !== product.id}>{product.sku} · {product.name} ({product.unit})</option>)}</select></div>
          {mode === "adjustment" ? <div className="field"><label htmlFor={`counted-${line.key}`}>Số đếm thực tế</label><input className="input" id={`counted-${line.key}`} type="number" min="0" step="0.001" value={line.countedQuantity} onChange={(event) => update(line.key, { countedQuantity: event.target.value })} required/></div> : <div className="field"><label htmlFor={`quantity-${line.key}`}>Số lượng</label><input className="input" id={`quantity-${line.key}`} type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => update(line.key, { quantity: event.target.value })} required/></div>}
          {mode === "receipt" && <div className="field"><label htmlFor={`cost-${line.key}`}>Đơn giá tham khảo</label><input className="input" id={`cost-${line.key}`} type="number" min="0" step="0.01" value={line.unitCost} onChange={(event) => update(line.key, { unitCost: event.target.value })} required/></div>}
          <button className="iconButton" type="button" onClick={() => remove(line.key)} disabled={lines.length === 1} aria-label={`Xóa dòng ${index + 1}`}>×</button>
        </div>
      </div>)}</div>
      <button className="button" disabled={!products.length || !warehouses.length}>{mode === "adjustment" ? "Lưu và xác nhận điều chỉnh" : "Lưu phiếu nháp"}</button>
    </form>
  </>;
}
