create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  content_markdown text not null,
  category text not null default 'Recruitment Insights',
  author_name text not null default 'Red Stone Editorial Team',
  cover_image_url text,
  image_alt text,
  seo_title text,
  meta_description text,
  keywords text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists blog_posts_publication_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_featured_idx on public.blog_posts (featured, published_at desc) where status = 'published';

create or replace function public.touch_blog_post_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
before update on public.blog_posts
for each row execute function public.touch_blog_post_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now());

grant select on public.blog_posts to anon, authenticated;

insert into public.blog_posts (
  slug, title, description, content_markdown, category, author_name,
  seo_title, meta_description, keywords, status, featured, published_at
) values
(
  'prepare-overseas-job-interview',
  'How to Prepare for an Overseas Job Interview',
  'Practical interview preparation for candidates applying to international employers, including documents, examples, communication and responsible presentation.',
  '## Know the role\n\nReview the vacancy carefully before the interview. Identify the employer requirements, core duties, working conditions and the experience that best matches the position. Prepare clear examples that demonstrate reliability, safety awareness, communication and practical competence.\n\n## Prepare your documents\n\nKeep your CV, certificates, references and employment dates consistent. Employers may ask detailed questions about previous workplaces, responsibilities, equipment used and reasons for leaving. If you do not know an answer, say so rather than inventing information.\n\n## Practice concise examples\n\nUse short real examples from your experience. Explain the situation, what you were responsible for, what action you took and the result. This helps an international employer understand your capability even when the interview is brief.\n\n## Be honest and professional\n\nDo not exaggerate experience, qualifications, language ability or licences. Responsible recruitment depends on accurate information and employers may verify documents or references later in the process.\n\n## Prepare for online interviews\n\nTest your internet connection, camera, microphone and meeting link in advance. Choose a quiet location, use a professional background and join early. Keep your passport and other sensitive documents private unless the verified recruitment process specifically requires them.',
  'Candidate Guidance',
  'Red Stone Editorial Team',
  'Overseas Job Interview Preparation: Candidate Guide',
  'Learn how to prepare for an overseas job interview with practical guidance on documents, examples, online interviews, honesty and employer expectations.',
  array['overseas job interview','international job interview','candidate interview preparation','jobs abroad'],
  'published', true, '2026-08-22T09:00:00Z'
),
(
  'recruitment-scam-warning-signs',
  'Recruitment Scam Warning Signs',
  'How candidates can identify suspicious job offers, payment demands, impersonation and unsafe requests while protecting personal documents.',
  '## Verify the recruitment channel\n\nCheck that communication comes through official Red Stone channels and that the vacancy or recruitment instruction can be independently confirmed. When unsure, contact the agency using contact details published on the official website rather than replying to the suspicious message.\n\n## Question pressure and guarantees\n\nBe cautious when someone demands urgent payment, refuses to provide clear job details, promises a guaranteed visa or pressures you to send money before you can verify the recruitment process. Legitimate recruitment should provide enough information for you to understand what you are paying for and who is receiving the payment.\n\n## Protect passwords and payment credentials\n\nNever share an M-Pesa PIN, bank PIN, one-time password, card security code or account password with a recruiter. A legitimate payment flow should allow you to enter confidential credentials privately on your own device.\n\n## Protect identity documents\n\nPassports, certificates, police-clearance records and medical information can be sensitive. Submit them only through verified channels when they are genuinely required for an application or compliance step.\n\n## Report suspicious activity\n\nKeep screenshots, phone numbers, payment references and messages if you suspect impersonation or fraud. Report the incident through the official Red Stone complaints or fraud-awareness channels and, where appropriate, to the relevant payment provider or authority.',
  'Fraud Awareness',
  'Red Stone Editorial Team',
  'Recruitment Scam Warning Signs: Protect Yourself',
  'Learn the warning signs of recruitment scams, fake job offers, suspicious payment requests and impersonation, and how to protect documents and accounts.',
  array['recruitment scam warning signs','fake job offers','job scam Kenya','recruitment fraud','jobs abroad safety'],
  'published', true, '2026-08-22T10:00:00Z'
),
(
  'documents-for-international-recruitment',
  'Documents Commonly Needed for International Recruitment',
  'A practical overview of identity, career, qualification and compliance documents candidates may need during international recruitment.',
  '## Identity and contact information\n\nCandidates are commonly asked for accurate identity details, contact information and a current passport or other identity document when the recruitment stage requires it. Names and dates should be consistent across records.\n\n## CV and employment history\n\nA current CV should explain your work history, duties, skills and relevant achievements clearly. Employment letters and references can help an employer confirm experience where required.\n\n## Education and professional qualifications\n\nCertificates, diplomas, trade qualifications, licences and professional registrations may be required depending on the occupation. Regulated professions can also require destination-specific recognition or licensing.\n\n## Compliance documents\n\nSome vacancies or destinations may require police clearance, medical examinations, biometrics, translations, attestations or other compliance records. These requirements vary and should be confirmed for the actual job and destination.\n\n## Keep documents accurate and secure\n\nDo not alter or falsify records. Keep clear copies and submit sensitive documents only through approved recruitment or official government channels. Specific requirements can change, so current employer and authority instructions should always be checked.',
  'Documents',
  'Red Stone Editorial Team',
  'International Recruitment Documents: Candidate Checklist',
  'Understand common documents needed for international recruitment, including CVs, identity records, qualifications, police clearance and compliance documents.',
  array['international recruitment documents','jobs abroad documents','candidate document checklist','work visa recruitment documents'],
  'published', false, '2026-08-22T11:00:00Z'
)
on conflict (slug) do nothing;
