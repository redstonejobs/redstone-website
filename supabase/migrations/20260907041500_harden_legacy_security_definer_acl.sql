-- Remove inherited PUBLIC/anonymous EXECUTE access from privileged helpers while
-- preserving authenticated application flows that perform their own auth checks.
revoke execute on function public.admin_assign_application(uuid, uuid, uuid, text) from public, anon;
revoke execute on function public.admin_update_application_status(uuid, text, uuid, text, jsonb) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_staff() from public, anon;

grant execute on function public.admin_assign_application(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.admin_update_application_status(uuid, text, uuid, text, jsonb) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Harden SECURITY DEFINER search paths. All referenced application objects are
-- schema-qualified inside these functions.
alter function public.admin_assign_application(uuid, uuid, uuid, text) set search_path = '';
alter function public.admin_update_application_status(uuid, text, uuid, text, jsonb) set search_path = '';
alter function public.is_admin() set search_path = '';
alter function public.is_staff() set search_path = '';
