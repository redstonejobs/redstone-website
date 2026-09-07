# Red Stone AI Platform

## Purpose

Red Stone owns the AI orchestration layer instead of depending on a visual chatbot platform. The platform is designed to serve website chat first and later WhatsApp Cloud API, while sharing the existing Red Stone jobs, applications, candidate, and staff CRM data in Supabase.

## Architecture

```text
Website / WhatsApp / Admin
          |
          v
   Red Stone AI Gateway
          |
          v
       Worker Router
          |
   +------+------+-------------------+
   |             |                   |
 Faith       Country/Job        Application/
 Reception   Specialists        Document Workers
   |             |                   |
   +-------------+-------------------+
                 |
                 v
          OpenAI Responses API
                 |
                 v
             Supabase
                 |
       Human staff handoff queue
```

## First worker set

- `faith_reception` - main receptionist and lead intake
- `job_matching` - job-interest and destination routing
- `application_support` - application process support
- `document_verification` - document checklist/completeness support
- `canada` - Canada recruitment questions
- `australia` - Australia recruitment questions
- `new_zealand` - New Zealand recruitment questions
- `gulf` - UAE/Qatar/Saudi/Kuwait/Bahrain/Oman recruitment questions
- `medical_compliance` - medical/compliance process guidance
- `application_status` - application status support
- `human_handoff` - staff escalation

The router uses deterministic intent/country matching first. This keeps routine routing cheap and predictable. More complex tasks can use the reasoning model while routine conversations use the fast model.

## Models

Defaults are configurable with server-only environment variables:

- `AI_FAST_MODEL=gpt-5.6-luna`
- `AI_REASONING_MODEL=gpt-5.6-terra`

The OpenAI key is never sent to the browser.

## Database

Migration `20260906224233_redstone_ai_foundation.sql` adds:

- `ai_conversations` - channel/thread state and current worker
- `ai_messages` - inbound/outbound transcript records
- `ai_leads` - five-field lead intake, consent, stage, qualification completeness
- `ai_handoffs` - AI-to-staff queue
- `ai_worker_runs` - model/token/duration/error telemetry

All five tables have RLS enabled. `anon` and `authenticated` have no direct table privileges. The trusted server-side Supabase service-role client is the only initial application path.

## Internal gateway

`POST /api/internal/ai/chat`

The endpoint requires:

```http
Authorization: Bearer <AI_INTERNAL_SECRET>
Content-Type: application/json
```

Example body:

```json
{
  "channel": "api",
  "message": "I am interested in a driver job in Canada",
  "contact": {
    "fullName": "Example Candidate",
    "phone": "+254700000000",
    "email": "candidate@example.com",
    "jobInterest": "Driver",
    "countryInterest": "Canada",
    "consentToContact": true
  }
}
```

The response returns the conversation ID, selected worker, worker label, and AI reply. Supplying the returned `conversationId` on later requests continues the same stored conversation.

## Lead qualification

The first milestone measures contact completeness only. Each of the five intake fields contributes 20 points:

1. full name
2. phone
3. email
4. job interest
5. country interest

A score of 100 marks the lead `qualified`. This is **not** the same as a positive/placed client and must not be used to claim medical completion, hiring, sponsorship, visa approval, or payment status.

## Safety and trust rules

Workers are instructed to:

- never guarantee a job, visa, sponsorship, salary, or immigration decision
- never invent fees, openings, application statuses, or government requirements
- distinguish Red Stone process guidance from government rules
- avoid passwords, OTPs, PINs, and full card/payment security details
- create human handoff when requested
- rely on live system records before claiming an application/document/payment status

## Deployment secrets

Required before the AI gateway can produce responses:

- `OPENAI_API_KEY`
- `AI_INTERNAL_SECRET`
- existing `NEXT_PUBLIC_SUPABASE_URL`
- existing `SUPABASE_SERVICE_ROLE_KEY`

Do not place server-only secrets in variables prefixed with `NEXT_PUBLIC_`.

## Next milestones

1. Add automated tests for routing, validation, and persistence boundaries.
2. Connect verified live job search as AI tools instead of letting the model invent vacancies.
3. Build the website chat UI over a public rate-limited gateway.
4. Add staff handoff/inbox views in the Red Stone admin dashboard.
5. Add lead analytics and funnel conversion reporting.
6. Connect Meta WhatsApp Cloud API webhooks to the same AI service.
7. Add scheduled follow-ups only after explicit candidate consent and messaging-policy checks.
