"use client";
import { useEffect } from "react";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{console.error(error)},[error]);return <section className="panel"><p className="eyebrow">Có lỗi xảy ra</p><h1>Không thể hiển thị trang</h1><p className="muted">Dữ liệu của bạn chưa bị thay đổi. Hãy thử tải lại.</p><button className="button" onClick={reset}>Thử lại</button></section>}
