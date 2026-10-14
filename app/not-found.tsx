import Link from "next/link";
export default function NotFound(){return <main className="setup"><section className="setupCard"><p className="eyebrow">404</p><h1>Không tìm thấy dữ liệu</h1><p className="muted">Bản ghi có thể đã bị xóa hoặc bạn không có quyền xem.</p><Link className="button" href="/dashboard">Về dashboard</Link></section></main>}
