-- 아장(아기장터) 초기 DB 스키마 (Supabase / PostgreSQL)
-- Supabase SQL Editor에 붙여넣어 실행하세요.

create type condition_grade as enum ('S', 'A', 'B', 'C');
create type listing_status as enum ('selling', 'reserved', 'sold', 'hidden');

-- 회원 프로필 (auth.users 1:1)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null unique,
  region text,                      -- 동 단위 거래 지역
  phone_verified boolean not null default false,
  trust_score int not null default 50 check (trust_score between 0 and 100),
  created_at timestamptz not null default now()
);

-- 아이 정보 (월령 추천의 기준)
create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles on delete cascade,
  nickname text not null,
  birth_date date,
  due_date date,                    -- 출산 전이면 예정일
  check (birth_date is not null or due_date is not null)
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles on delete cascade,
  title text not null,
  brand text,
  category_id text not null,        -- src/data/catalog.ts 의 CATEGORIES id
  age_bands text[] not null default '{}', -- 복수 월령
  condition condition_grade not null,
  used_months int check (used_months >= 0),
  price int not null check (price >= 0),
  new_price int check (new_price >= 0),
  description text not null default '',
  region text,
  status listing_status not null default 'selling',
  safety_sensitive boolean not null default false,
  manufactured_on date,             -- 카시트 등 안전 제품
  model_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_age_bands_idx on listings using gin (age_bands);
create index listings_category_idx on listings (category_id, created_at desc);

create table listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings on delete cascade,
  storage_path text not null,       -- Supabase Storage 경로
  sort_order int not null default 0
);

create table likes (
  user_id uuid references profiles on delete cascade,
  listing_id uuid references listings on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- 채팅 (Supabase Realtime으로 구독)
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings on delete cascade,
  buyer_id uuid not null references profiles on delete cascade,
  seller_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references chat_rooms on delete cascade,
  sender_id uuid not null references profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_room_idx on messages (room_id, created_at);

-- 거래 후기 (신뢰 점수 계산 근거)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings on delete cascade,
  reviewer_id uuid not null references profiles on delete cascade,
  reviewee_id uuid not null references profiles on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, reviewer_id)
);

-- 신고·차단
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles on delete cascade,
  target_listing_id uuid references listings on delete set null,
  target_user_id uuid references profiles on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table blocks (
  blocker_id uuid references profiles on delete cascade,
  blocked_id uuid references profiles on delete cascade,
  primary key (blocker_id, blocked_id)
);

-- ===== Row Level Security =====
alter table profiles enable row level security;
alter table children enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table likes enable row level security;
alter table chat_rooms enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;

create policy "프로필 공개 조회" on profiles for select using (true);
create policy "본인 프로필 수정" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "본인 아이 정보만" on children for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

create policy "상품 공개 조회" on listings for select using (status <> 'hidden' or auth.uid() = seller_id);
create policy "본인 상품 관리" on listings for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "사진 공개 조회" on listing_photos for select using (true);
create policy "본인 상품 사진 관리" on listing_photos for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "본인 찜" on likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "참여자만 채팅방" on chat_rooms for select using (auth.uid() in (buyer_id, seller_id));
create policy "구매자가 채팅 시작" on chat_rooms for insert with check (auth.uid() = buyer_id);

create policy "참여자만 메시지 조회" on messages for select
  using (exists (select 1 from chat_rooms r where r.id = room_id and auth.uid() in (r.buyer_id, r.seller_id)));
create policy "참여자만 메시지 전송" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from chat_rooms r where r.id = room_id and auth.uid() in (r.buyer_id, r.seller_id)));

create policy "후기 공개 조회" on reviews for select using (true);
create policy "본인이 후기 작성" on reviews for insert with check (auth.uid() = reviewer_id);

create policy "본인 신고" on reports for insert with check (auth.uid() = reporter_id);
create policy "본인 차단" on blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- ===== 가입 시 프로필 자동 생성 =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', '아장맘' || substr(new.id::text, 1, 6)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger listings_touch before update on listings
  for each row execute function public.touch_updated_at();

-- ===== 실시간 채팅 =====
alter publication supabase_realtime add table messages;

-- ===== 상품 사진 저장소 =====
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
  on conflict (id) do nothing;

-- 경로 규칙: {user_id}/{파일명}
create policy "상품 사진 공개 조회" on storage.objects for select
  using (bucket_id = 'listing-photos');
create policy "본인 폴더에 사진 업로드" on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "본인 사진 삭제" on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
