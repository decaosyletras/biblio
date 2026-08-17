begin;

alter table public.authors
  add column if not exists stripe_pro_active boolean not null default false,
  add column if not exists complimentary_pro boolean not null default false;

-- Reconstruye la fuente Stripe desde los registros administrados por el
-- servidor. past_due conserva PRO mientras Stripe intenta recuperar el pago.
update public.authors as author
set stripe_pro_active = exists (
  select 1
  from public.author_payments as payment
  where payment.author_id = author.id
    and payment.status in ('active', 'trialing', 'past_due')
);

-- Conserva cualquier PRO anterior que no proceda de una suscripcion vigente
-- convirtiendolo en una cortesia explicita.
update public.authors
set complimentary_pro = true
where pro = true
  and stripe_pro_active = false;

create or replace function public.sync_author_effective_pro()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.pro := coalesce(new.stripe_pro_active, false)
    or coalesce(new.complimentary_pro, false);
  return new;
end;
$$;

drop trigger if exists sync_author_effective_pro_on_write
  on public.authors;

create trigger sync_author_effective_pro_on_write
before insert or update of pro, stripe_pro_active, complimentary_pro
on public.authors
for each row
execute function public.sync_author_effective_pro();

-- Normaliza el valor efectivo despues de instalar el trigger.
update public.authors
set pro = stripe_pro_active or complimentary_pro;

commit;
