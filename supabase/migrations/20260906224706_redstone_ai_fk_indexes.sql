create index if not exists ai_conversations_staff_client_idx
  on public.ai_conversations(staff_client_id)
  where staff_client_id is not null;

create index if not exists ai_handoffs_conversation_status_idx
  on public.ai_handoffs(conversation_id, status);

create index if not exists ai_handoffs_assigned_staff_idx
  on public.ai_handoffs(assigned_staff_id)
  where assigned_staff_id is not null;
