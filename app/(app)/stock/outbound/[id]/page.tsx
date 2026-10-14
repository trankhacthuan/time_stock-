import { DocumentDetail } from "@/components/document-detail";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;created?:string;confirmed?:string;cancelled?:string}>}){return <DocumentDetail id={(await params).id} kind="issue" message={await searchParams}/>}
