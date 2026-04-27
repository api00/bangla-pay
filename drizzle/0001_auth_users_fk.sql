-- Cross-schema FK from public.creators.user_id → auth.users.id.
-- Drizzle cannot own auth.users, so this runs as a manual migration after `db:push`.
-- Apply via Supabase SQL editor OR `psql "$DATABASE_URL" -f drizzle/0001_auth_users_fk.sql`.

ALTER TABLE "creators"
  ADD CONSTRAINT "creators_user_id_auth_users_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "auth"."users"("id")
  ON DELETE CASCADE;
