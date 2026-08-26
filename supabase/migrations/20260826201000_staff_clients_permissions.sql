begin;

grant usage on schema public to authenticated;

grant select, insert, update
on table public.staff_clients
to authenticated;

commit;