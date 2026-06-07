-- Polla Mundial 2026 - políticas RLS y permisos
-- Ejecuta este archivo después de supabase/schema.sql.

begin;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.bonus_predictions enable row level security;
alter table public.settings enable row level security;

-- Limpieza idempotente de políticas

drop policy if exists profiles_select_public on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;

drop policy if exists matches_read_authenticated on public.matches;
drop policy if exists matches_admin_insert on public.matches;
drop policy if exists matches_admin_update on public.matches;
drop policy if exists matches_admin_delete on public.matches;

drop policy if exists predictions_select_own on public.predictions;
drop policy if exists predictions_select_admin on public.predictions;
drop policy if exists predictions_insert_own_open on public.predictions;
drop policy if exists predictions_update_own_open on public.predictions;
drop policy if exists predictions_admin_update on public.predictions;
drop policy if exists predictions_admin_delete on public.predictions;

drop policy if exists bonus_select_own on public.bonus_predictions;
drop policy if exists bonus_select_admin on public.bonus_predictions;
drop policy if exists bonus_insert_own_open on public.bonus_predictions;
drop policy if exists bonus_update_own_open on public.bonus_predictions;
drop policy if exists bonus_admin_update on public.bonus_predictions;
drop policy if exists bonus_admin_delete on public.bonus_predictions;

drop policy if exists settings_select_authenticated on public.settings;
drop policy if exists settings_admin_insert on public.settings;
drop policy if exists settings_admin_update on public.settings;
drop policy if exists settings_admin_delete on public.settings;

-- profiles
create policy profiles_select_public
on public.profiles
for select
to authenticated
using (true);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy profiles_admin_update
on public.profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- matches
create policy matches_read_authenticated
on public.matches
for select
to authenticated
using (true);

create policy matches_admin_insert
on public.matches
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy matches_admin_update
on public.matches
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy matches_admin_delete
on public.matches
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- predictions
create policy predictions_select_own
on public.predictions
for select
to authenticated
using (auth.uid() = user_id);

create policy predictions_select_admin
on public.predictions
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy predictions_insert_own_open
on public.predictions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.is_match_open_for_predictions(match_id)
);

create policy predictions_update_own_open
on public.predictions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.is_match_open_for_predictions(match_id)
);

create policy predictions_admin_update
on public.predictions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy predictions_admin_delete
on public.predictions
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- bonus_predictions
create policy bonus_select_own
on public.bonus_predictions
for select
to authenticated
using (auth.uid() = user_id);

create policy bonus_select_admin
on public.bonus_predictions
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy bonus_insert_own_open
on public.bonus_predictions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.is_bonus_open()
);

create policy bonus_update_own_open
on public.bonus_predictions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.is_bonus_open()
);

create policy bonus_admin_update
on public.bonus_predictions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy bonus_admin_delete
on public.bonus_predictions
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- settings
create policy settings_select_authenticated
on public.settings
for select
to authenticated
using (true);

create policy settings_admin_insert
on public.settings
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy settings_admin_update
on public.settings
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy settings_admin_delete
on public.settings
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- Privilegios del API. Nunca se necesita service_role en frontend.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.matches from anon, authenticated;
revoke all on table public.predictions from anon, authenticated;
revoke all on table public.bonus_predictions from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on public.leaderboard_view from anon, authenticated;
revoke all on public.predictions_export_view from anon, authenticated;

grant usage on schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, alias) on table public.profiles to authenticated;

grant select, insert, update, delete on table public.matches to authenticated;

grant select on table public.predictions to authenticated;
grant insert (user_id, match_id, predicted_home_score, predicted_away_score) on table public.predictions to authenticated;
grant update (predicted_home_score, predicted_away_score) on table public.predictions to authenticated;
grant delete on table public.predictions to authenticated;

grant select on table public.bonus_predictions to authenticated;
grant insert (user_id, champion, runner_up, top_scorer, surprise_team) on table public.bonus_predictions to authenticated;
grant update (champion, runner_up, top_scorer, surprise_team) on table public.bonus_predictions to authenticated;
grant delete on table public.bonus_predictions to authenticated;

grant select, insert, update, delete on table public.settings to authenticated;

grant select on public.leaderboard_view to authenticated;
grant select on public.predictions_export_view to authenticated;

grant execute on function public.recalculate_match_points(bigint) to authenticated;
grant execute on function public.recalculate_bonus_points() to authenticated;
grant execute on function public.recalculate_all_points() to authenticated;
grant execute on function public.admin_override_prediction_points(bigint, integer, boolean, boolean) to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;

commit;
