import { NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { createClient } from "@/utils/supabase/server";
import { assertValid, sanitizeStoragePath } from "@/lib/admin/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const candidate = await requireCandidate();
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: document } = await supabase
    .from("application_documents")
    .select("id, application_id, storage_path")
    .eq("id", id)
    .maybeSingle<{ id: string; application_id: string; storage_path: string | null }>();

  if (!document?.storage_path) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("id", document.application_id)
    .eq("candidate_id", candidate.user.id)
    .maybeSingle();

  if (!application || !document.storage_path.startsWith(`${candidate.user.id}/`)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  let path: string;
  try {
    path = assertValid(sanitizeStoragePath(document.storage_path));
  } catch {
    return NextResponse.json({ error: "Document cannot be opened." }, { status: 400 });
  }

  const { data, error } = await supabase.storage.from("candidate-documents").createSignedUrl(path, 300);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Unable to open document." }, { status: 400 });
  return NextResponse.redirect(data.signedUrl);
}

