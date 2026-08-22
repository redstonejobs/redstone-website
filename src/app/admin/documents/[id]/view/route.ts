import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { adminWarn } from "@/lib/admin/logger";
import { assertValid, sanitizeStoragePath } from "@/lib/admin/validation";
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
    .select("id, bucket, storage_bucket, storage_path, file_path, path")
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const bucket = String(document.bucket ?? document.storage_bucket ?? "candidate-documents");
  const path = String(document.storage_path ?? document.file_path ?? document.path ?? "");

  if (bucket !== "candidate-documents") {
    adminWarn("blocked document bucket", { document_id: id, bucket });
    return NextResponse.json({ error: "Document cannot be opened." }, { status: 400 });
  }

  let safePath: string;
  try {
    safePath = assertValid(sanitizeStoragePath(path));
  } catch {
    adminWarn("blocked document path", { document_id: id });
    return NextResponse.json({ error: "Document cannot be opened." }, { status: 400 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("candidate-documents")
    .createSignedUrl(safePath, 300);

  if (signedUrlError || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to create a temporary document link." }, { status: 400 });
  }

  return NextResponse.redirect(data.signedUrl);
}
