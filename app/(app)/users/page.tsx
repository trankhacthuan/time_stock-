import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateUser } from "@/server/actions";

const roles = [
  ["admin","Admin"], ["warehouse_manager","Quản lý kho"], ["warehouse_staff","Nhân viên kho"], ["viewer","Chỉ xem"],
] as const;

export default async function Page({searchParams}:{searchParams:Promise<{error?:string;success?:string}>}) {
  const query=await searchParams; const supabase=await createSupabaseServerClient();
  const {data:profiles,error}=supabase?await supabase.from("profiles").select("id,display_name,role,is_active,created_at").order("created_at"):{data:[],error:null};
  return <><header className="pageHead"><div><p className="eyebrow">Quản trị</p><h1>Người dùng</h1><p className="muted">Admin phân quyền và khóa/mở tài khoản. Tài khoản mới được tạo trong Supabase Auth.</p></div></header>
    {query.success&&<p className="alert success" role="status">Đã cập nhật quyền người dùng.</p>}{query.error&&<p className="alert danger" role="alert">{query.error==="self"?"Bạn không thể tự khóa tài khoản đang dùng.":"Không thể cập nhật. Chỉ Admin được phép thao tác."}</p>}
    {error?<p className="alert danger">Không thể tải người dùng.</p>:<div className="tableWrap"><table className="table"><thead><tr><th>Tên hiển thị</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{profiles?.map((profile)=><tr key={profile.id}><td><strong>{profile.display_name}</strong></td><td>{roles.find(([value])=>value===profile.role)?.[1]}</td><td><span className={`badge ${profile.is_active?"ok":"out"}`}>{profile.is_active?"Hoạt động":"Đã khóa"}</span></td><td>{new Date(profile.created_at).toLocaleDateString("vi-VN")}</td><td><details className="rowEditor"><summary className="textButton">Phân quyền</summary><form className="popover form compact" action={updateUser}><input type="hidden" name="id" value={profile.id}/><label className="field">Vai trò<select className="input" name="role" defaultValue={profile.role}>{roles.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="field">Trạng thái<select className="input" name="isActive" defaultValue={String(profile.is_active)}><option value="true">Hoạt động</option><option value="false">Khóa</option></select></label><button className="button">Cập nhật</button></form></details></td></tr>)}</tbody></table>{!profiles?.length&&<div className="empty">Chưa có người dùng.</div>}</div>}
    <p className="notice footnote">Để tránh gửi email ngoài ý muốn, ứng dụng không tự mời tài khoản. Tạo người dùng tại Authentication → Users trong Supabase; hồ sơ sẽ tự sinh và xuất hiện tại đây.</p>
  </>;
}
