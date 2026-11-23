-- 우리 집 육아용품: 구매 기록(구매처·영수증)을 남겨두고, 필요 없어지면 바로 판매글로 전환

create table owned_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  title text not null,
  brand text,
  category_id text not null,
  store text,                         -- 구매처 (예: 쿠팡, 이마트, 베이비페어)
  purchased_on date,
  purchase_price int check (purchase_price >= 0),
  receipt_path text,                  -- receipts 버킷(비공개) 경로
  photo_path text,                    -- listing-photos 버킷 경로 (제품 사진)
  memo text,
  listing_id uuid references listings on delete set null,  -- 판매글로 전환되면 연결
  created_at timestamptz not null default now()
);
create index owned_items_owner_idx on owned_items (owner_id, created_at desc);

alter table owned_items enable row level security;
create policy "본인 육아용품만" on owned_items for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- 판매글에 구매 기록 연결 + 영수증 확인 배지
alter table listings add column owned_item_id uuid references owned_items on delete set null;
alter table listings add column has_receipt boolean not null default false;

-- 영수증은 비공개 버킷 (본인만 조회)
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
  on conflict (id) do nothing;

create policy "본인 영수증 조회" on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "본인 영수증 업로드" on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "본인 영수증 삭제" on storage.objects for delete
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
