begin;

grant select on table public.application_documents to service_role;
grant select on table public.candidate_notes to service_role;
grant update on table public.application_payment_waivers to service_role;

commit;
