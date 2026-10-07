# Vicki Lawrence — Digital Archive

Premium multi-page archive experience for Vicki Lawrence, built around television, comedy, music, stage work and career history.

## Included
- Cinematic responsive public website
- 3D/atmospheric hero with accessible carousel
- Live visitor support chat
- Private admin control center
- Announcements, events, requests and media management UI
- Invoice creator with print/PDF export
- Supabase-ready Auth, Realtime, Storage and RLS schema
- Reduced-motion and keyboard-accessible interactions

## Admin
Deploy `/admin/` separately and protect the deployment with Vercel Authentication/SSO. Configure the Supabase project URL and publishable key in the private admin app. Never expose a service-role key in browser code.

## Supabase
Run `supabase/schema.sql` in the project database, then create the first admin account and set its `app_metadata.role` to `admin` using a trusted server-side/admin workflow.

## Assets
Approved/licensed Vicki Lawrence photography, logos, icons and signature assets must be supplied before public production use. The repository does not fabricate those assets.

## Status
Production-ready front-end foundation; Supabase-backed dynamic publishing becomes live after the project's credentials, policies and authorized content are configured.
