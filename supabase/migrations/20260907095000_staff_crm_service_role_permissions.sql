begin;

grant usage on schema public to service_role;

grant select, insert, update, delete
on table public.staff_clients
to service_role;

grant select, insert
on table public.admin_audit_logs
to service_role;

commit;
