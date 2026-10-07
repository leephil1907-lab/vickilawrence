# Vicki Lawrence — Premium Celebrity Archive Design System

## Product intent
This is a premium, multi-page celebrity archive for Vicki Lawrence — actress, comedian and singer. It must feel like a digital estate, editorial archive and theatre experience, not a SaaS landing page.

## Creative direction
- Classic Hollywood archive meets contemporary editorial web design.
- The site is navigational: every route is a destination with its own visual world.
- 3D scenery is atmospheric and purposeful. It must communicate context, not exist as decoration.
- Use progressive enhancement: full WebGL/Three.js on capable devices, CSS/parallax fallback elsewhere.
- Never fabricate biography details, reviews, events, quotes, products or social proof.

## Palette
- Cream: #f7f3ea
- White: #ffffff
- Royal blue: #1f4e8c
- Deep blue: #143a68
- Plum: #5b3a72
- Marigold: #d99a26
- Marigold light: #f2c15b
- Charcoal: #22242a
- Muted: #6a6f79

## Typography
- Display: editorial serif with strong contrast.
- UI/body: clean geometric sans-serif.
- Metadata: uppercase, tracked, compact.
- Use dramatic type scale but preserve readability.

## Layout
- Full-width scenery/header moments.
- Editorial max-width 1240px.
- Asymmetric grids where useful.
- Avoid repetitive card grids.
- Large photography and negative space.
- Navigation remains available on every page.

## Motion
- UI hover: 180–250ms.
- Image reveal: 500–700ms.
- Route transition: 650–900ms.
- Scene transition: 900–1400ms.
- Stagger reveals by 50–90ms.
- Respect prefers-reduced-motion.
- Motion should explain state changes: doors, film reels, curtains, archive drawers, theatre lights.

## 3D scenery
The shared scene can represent a vintage television/theatre archive:
- curved stage floor
- floating framed photographs
- television frame
- film strip
- marquee lights
- dust particles
- soft volumetric-style gradients
- camera parallax
- page-specific accent objects

Keep geometry lightweight and provide a CSS fallback.

## Navigation language
Home / About / Works / Gallery / News / Events / Fan Club / Contact.
On desktop, use an editorial rail or glass navigation.
On mobile, use a full-screen archive menu with numbered destinations.

## Page worlds
- Home: theatre + television archive.
- About: backstage/dressing-room archive.
- Works: film/television catalog wall.
- Gallery: photography exhibition.
- News: press desk / newspaper archive.
- Events: theatre marquee.
- Fan Club: membership lounge.
- Contact: backstage correspondence desk.

## Accessibility
- Keyboard navigable.
- Visible focus states.
- Semantic landmarks.
- Reduced-motion mode.
- Alt text for meaningful images.
- No hover-only essential interactions.
- Touch targets >= 44px.
