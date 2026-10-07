# Vicki Lawrence — Digital Archive

Premium multi-page **dynamic digital archive** for Vicki Lawrence, built around television, comedy, music, stage work and career history.

## Included
- Cinematic responsive public website
- Three.js archive worlds with CSS fallbacks and reduced-motion support
- WebGL-inspired image depth, atmospheric lighting and kinetic editorial motion
- Curated Cormorant Garamond / DM Sans / Manrope typography
- Accessible hero carousel
- Live visitor support chat
- Private admin control center
- Announcements, events, requests and media management UI
- Invoice creator with print/PDF export
- Supabase Auth, Realtime, Storage and RLS-backed live publishing
- Reduced-motion and keyboard-accessible interactions

## Admin
Deploy `/admin/` separately and protect the deployment with Vercel Authentication/SSO. Configure the Supabase project URL and publishable key in the private admin app. Never expose a service-role key in browser code.

## Supabase
Run `supabase/schema.sql` in the project database, then create the first admin account and set its `app_metadata.role` to `admin` using a trusted server-side/admin workflow.

## Assets
Approved/licensed Vicki Lawrence photography, logos, icons and signature assets must be supplied before public production use. The repository does not fabricate those assets.

## Status
Dynamic production architecture is in place: public pages can receive live Supabase announcements, events and gallery updates, while immersive Three.js scenes enhance the editorial experience. Official/licensed photography, authorized content, Supabase provider configuration and final deployment verification remain required before public launch.
