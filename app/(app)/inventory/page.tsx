import { InventoryPage } from "@/components/resource-page";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;warehouse?:string}>}){return <InventoryPage query={await searchParams}/>}
