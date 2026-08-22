import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  await requireStaff();
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("application_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const bucket = String(document.bucket ?? document.storage_bucket ?? "candidate-documents");
  const path = String(document.storage_path ?? document.file_path ?? document.path ?? "");

  if (bucket !== "candidate-documents" || !path || path.includes("..")) {
    return NextResponse.json({ error: "Document cannot be opened." }, { status: 400 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("candidate-documents")
    .createSignedUrl(path, 300);

  if (signedUrlError || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to create a temporary document link." }, { status: 400 });
  }

  return NextResponse.redirect(data.signedUrl);
}
