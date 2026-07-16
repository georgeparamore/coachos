-- CoachOS: e-signature audit trail for contracts
-- Adds evidence captured at sign time — not identity verification, just a
-- defensible record of what was signed, by whom (claimed), from where, and when.

alter table public.contracts
  add column if not exists body_sha256 text,
  add column if not exists viewed_at timestamptz,
  add column if not exists signer_ip text,
  add column if not exists signer_user_agent text;

-- Hash the agreement body automatically whenever it's set/changed, so the
-- hash always reflects exactly what the client was shown, even if the
-- template text is edited later for future contracts.
create or replace function public.hash_contract_body()
returns trigger
language plpgsql
as $$
begin
  new.body_sha256 = encode(digest(new.body, 'sha256'), 'hex');
  return new;
end;
$$;

drop trigger if exists contracts_hash_body on public.contracts;
create trigger contracts_hash_body
  before insert or update of body on public.contracts
  for each row execute procedure public.hash_contract_body();

-- Backfill existing rows, if any.
update public.contracts set body_sha256 = encode(digest(body, 'sha256'), 'hex') where body_sha256 is null;
