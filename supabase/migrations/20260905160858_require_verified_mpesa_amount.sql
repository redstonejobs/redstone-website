begin;

create or replace function public.record_mpesa_callback(
  p_checkout_request_id text,
  p_merchant_request_id text,
  p_result_code text,
  p_result_description text,
  p_payload_hash text,
  p_provider_receipt text,
  p_verified_amount numeric,
  p_verified_phone text,
  p_provider_confirmed_success boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.application_payments%rowtype;
  v_failure_status text;
begin
  if nullif(trim(coalesce(p_checkout_request_id, '')), '') is null then
    raise exception 'checkout_request_id_required';
  end if;

  if nullif(trim(coalesce(p_payload_hash, '')), '') is null then
    raise exception 'payload_hash_required';
  end if;

  select *
    into v_payment
  from public.application_payments
  where checkout_request_id = p_checkout_request_id
  for update;

  if v_payment.id is null then
    insert into public.application_payment_callbacks (
      provider,
      checkout_request_id,
      merchant_request_id,
      result_code,
      payload_hash
    )
    values (
      'mpesa',
      p_checkout_request_id,
      p_merchant_request_id,
      p_result_code,
      p_payload_hash
    )
    on conflict (payload_hash) do nothing;

    return jsonb_build_object('ok', false, 'status', 'unknown_payment', 'should_finalize', false);
  end if;

  insert into public.application_payment_callbacks (
    payment_id,
    provider,
    checkout_request_id,
    merchant_request_id,
    result_code,
    payload_hash
  )
  values (
    v_payment.id,
    'mpesa',
    p_checkout_request_id,
    p_merchant_request_id,
    p_result_code,
    p_payload_hash
  )
  on conflict (payload_hash) do nothing;

  if v_payment.status = 'paid' then
    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', 'paid', 'should_finalize', false);
  end if;

  if v_payment.status not in ('initiated', 'pending') then
    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_payment.status, 'should_finalize', false);
  end if;

  if p_result_code = '0' then
    if p_provider_confirmed_success is not true then
      return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_payment.status, 'should_finalize', false);
    end if;

    if v_payment.provider <> 'mpesa'
      or v_payment.purpose <> 'CV_DOCUMENT_VERIFICATION'
      or v_payment.currency <> 'KES'
      or v_payment.amount <> 2000
    then
      raise exception 'payment_record_mismatch';
    end if;

    if p_verified_amount is null
      or p_verified_amount <> v_payment.amount
    then
      raise exception 'payment_amount_conflict';
    end if;

    if p_verified_phone is not null
      and v_payment.phone_number is not null
      and p_verified_phone <> v_payment.phone_number
    then
      raise exception 'payment_phone_conflict';
    end if;

    update public.application_payments
      set status = 'paid',
          provider_receipt = nullif(trim(coalesce(p_provider_receipt, '')), ''),
          result_code = p_result_code,
          result_description = p_result_description,
          paid_at = now()
    where id = v_payment.id;

    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', 'paid', 'should_finalize', true);
  end if;

  v_failure_status := case
    when p_result_code = '1032' then 'cancelled'
    when p_result_code = '1037' then 'expired'
    else 'failed'
  end;

  update public.application_payments
    set status = v_failure_status,
        result_code = p_result_code,
        result_description = p_result_description,
        failed_at = now()
  where id = v_payment.id
    and status in ('initiated', 'pending');

  update public.applications
    set status = 'ready_for_payment',
        updated_at = now()
  where id = v_payment.application_id
    and status = 'payment_pending';

  return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_failure_status, 'should_finalize', false);
end;
$$;

revoke execute on function public.record_mpesa_callback(text, text, text, text, text, text, numeric, text, boolean)
from public, anon, authenticated;

grant execute on function public.record_mpesa_callback(text, text, text, text, text, text, numeric, text, boolean)
to service_role;

commit;
