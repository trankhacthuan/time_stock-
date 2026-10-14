import { DocumentForm } from "@/components/document-form";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){return <DocumentForm kind="receipt" error={(await searchParams).error}/>}
