create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.ai_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default clock_timestamp(),
  request_count integer not null default 0,
  updated_at timestamptz not null default clock_timestamp(),
  constraint ai_rate_limits_key_hash_check check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint ai_rate_limits_request_count_check check (request_count >= 0)
);

revoke all on private.ai_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on private.ai_rate_limits to service_role;

create or replace function public.consume_ai_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_row private.ai_rate_limits%rowtype;
begin
  if p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid rate limit key';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception 'invalid rate limit';
  end if;

  if p_window_seconds is null or p_window_seconds < 60 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit window';
  end if;

  insert into private.ai_rate_limits as rl (
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_key_hash,
    v_now,
    1,
    v_now
  )
  on conflict (key_hash) do update
  set
    window_started_at = case
      when rl.window_started_at + make_interval(secs => p_window_seconds) <= v_now then v_now
      else rl.window_started_at
    end,
    request_count = case
      when rl.window_started_at + make_interval(secs => p_window_seconds) <= v_now then 1
      else rl.request_count + 1
    end,
    updated_at = v_now
  returning * into v_row;

  allowed := v_row.request_count <= p_limit;
  remaining := greatest(p_limit - v_row.request_count, 0);
  reset_at := v_row.window_started_at + make_interval(secs => p_window_seconds);
  return next;
end;
$$;

revoke execute on function public.consume_ai_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(text, integer, integer) to service_role;
