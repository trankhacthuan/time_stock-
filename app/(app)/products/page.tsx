import { ResourcePage } from "@/components/resource-page";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string;error?:string;success?:string}>}){return <ResourcePage kind="products" query={await searchParams}/>}
