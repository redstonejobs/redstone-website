-- Enable mandatory application verification payment enforcement.

alter table public.application_payment_settings
  alter column payment_enforcement_enabled set default true;

update public.application_payment_settings
set
  payment_enforcement_enabled = true,
  updated_at = now()
where id = true;
