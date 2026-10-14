import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/global.css";
const display = localFont({ src: [{ path: "../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-600-normal.woff2", weight: "600" }, { path: "../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-700-normal.woff2", weight: "700" }], variable: "--font-display", display: "swap" });
const body = localFont({ src: "../node_modules/@fontsource-variable/inter/files/inter-vietnamese-wght-normal.woff2", variable: "--font-body", display: "swap" });
export const metadata: Metadata = { title: { default: "SuperStock", template: "%s · SuperStock" }, description: "Quản lý kho siêu thị chính xác và có thể truy vết", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>; }
