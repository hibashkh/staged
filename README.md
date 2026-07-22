# Staged

**Staged** is an AI-powered renovation visualization app. Upload a photo of an empty or
outdated room, pick a design style (or upload an inspiration photo), and get back:

- A photorealistic "after" image of your room restyled — same layout, walls, windows,
  and fixtures, just redesigned.
- A shoppable furniture list matched to real retailers (IKEA, Castlery, Muji, Taobao),
  automatically fitted to a budget you set.
- An optional video walkthrough of the restyled room.

It's built for homeowners planning a renovation, property agents who want to show buyers
how an unfurnished unit could look, and interior designers/contractors aligning on a
client's vision before work begins.

---

## Features

### 1. AI Room Restyling
Upload a photo of a room and pick one of four preset styles — **Scandi**, **Muji**,
**Luxe**, or **Industrial**. The app:
1. Detects the room type (bedroom, kitchen, living room, etc.) so it preserves the
   room's function and built-in fixtures.
2. Detects the room's layout/shape (walls, windows, doors, open floor area) so generated
   furniture is placed naturally.
3. Generates a restyled "after" image via image-to-image generation, keeping the original
   room's geometry and camera angle.

### 2. Inspiration Mode
Don't like the presets? Pick **Inspiration**, upload any reference photo (a Pinterest
find, a friend's home, a hotel room), and Agnes AI's vision model describes that photo's
style, palette, materials, and lighting — then applies that description to restyle your
room to match.

### 3. Room Details & Custom Additions
Specify the room type and optionally add specific furniture/decor items you want included
(e.g. "a reading nook", "indoor plants", "a piano") — these are woven into the restyle
prompt alongside the chosen style.

### 4. Budget-Aware Shopping List
After restyling, the app extracts the furniture/decor visible in the new image and matches
each item to a product catalog (`data/products.json`) by category and style. If you set a
budget, items are kept cheapest-first until the budget is met — anything over budget is
shown without a product match. The UI shows total cost vs. your budget.

### 5. Video Walkthrough (optional)
Generate a slow camera-pan walkthrough video of the restyled room, similar to a real
estate listing tour.

### 6. Regenerate
Not happy with a result? Hit "Generate again" to re-run the same inputs through the
pipeline for a fresh variant.

### 7. Projects
Group multiple rooms (living room, bedroom, kitchen, etc.) under a single **Project**
representing one house/unit. The project remembers the chosen style, room type, and
budget so subsequent rooms in the same project reuse them automatically. The gallery
groups past stagings by project.

### 8. Accounts
Sign up with an email and password to get a private workspace — your rooms and projects
are stored server-side and scoped to your account, so they're only visible to you and
persist across devices/browsers.

---

## How It Uses Agnes AI

Every step of the pipeline is powered by [Agnes AI](https://apihub.agnes-ai.com), chaining
multiple models together:

| Step | Model | Purpose |
|---|---|---|
| 1. Detect room type | `agnes-2.0-flash` (vision) | Identifies the room type so the restyle preserves its function and fixtures |
| 2. Detect room layout | `agnes-2.0-flash` (vision) | Describes the room's shape, walls, windows, doors, and open floor area for natural furniture placement |
| 3. Describe inspiration style | `agnes-2.0-flash` (vision) | When using Inspiration Mode, converts a reference photo into a restyle instruction |
| 4. Restyle the room | `agnes-image-2.1-flash` | Image-to-image generation that redesigns the room photo in place (falls back to text-to-image if needed) |
| 5. Extract items | `agnes-2.0-flash` (vision) | Reads the restyled image and lists the furniture/decor pieces present, for shopping matches |
| 6. Generate video | `agnes-video-v2.0` | Produces a panning walkthrough video from the restyled image |

All Agnes calls live in [`lib/agnes.ts`](lib/agnes.ts).

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS, with a custom "clay" accent palette and `Plus Jakarta Sans` /
  `Fraunces` fonts (see [`tailwind.config.ts`](tailwind.config.ts) and
  [`app/layout.tsx`](app/layout.tsx))
- **Database**: SQLite via [Prisma](https://www.prisma.io/) (`prisma/schema.prisma`) —
  users, projects, and rooms are persisted server-side; generated images are written to
  `public/uploads/<userId>/`
- **Auth**: Custom email/password auth — `bcryptjs` for password hashing, `jose` for
  signed JWT session cookies, enforced by [`middleware.ts`](middleware.ts) and
  [`lib/auth.ts`](lib/auth.ts)
- **State management**: [Zustand](https://github.com/pmndrs/zustand) as an in-memory
  client cache, hydrated from the server on load (no more localStorage)
- **AI**: Agnes AI (`agnes-2.0-flash`, `agnes-image-2.1-flash`, `agnes-video-v2.0`)

---

## Project Structure

```
app/
  page.tsx                 Main page — upload form, before/after view, shop grid, gallery
  layout.tsx               Root layout — fonts, header
  login/page.tsx           Sign-in page
  signup/page.tsx          Sign-up page
  api/
    auth/
      register/route.ts   POST: create an account, set session cookie
      login/route.ts       POST: verify credentials, set session cookie
      logout/route.ts      POST: clear session cookie
      me/route.ts           GET: current signed-in user
    rooms/
      generate/route.ts    POST: restyle a room, extract items, match products, persist
      video/route.ts       POST: generate a walkthrough video, persist to the room
      route.ts              GET: list the signed-in user's rooms
      [id]/route.ts          DELETE: remove a room (row + image files)
    projects/
      route.ts               GET/POST: list / create projects
      [id]/route.ts          PATCH/DELETE: update defaults / remove a project
components/
  SiteHeader.tsx            Signed-in user + sign-out
  UploadForm.tsx            Photo upload, style picker, room details, budget, project picker
  StylePicker.tsx           Style selection (Scandi / Muji / Luxe / Industrial / Inspiration)
  RoomDetailsForm.tsx        Room type + additional furniture/decor inputs
  ProjectPicker.tsx          Select or create a project
  BeforeAfterSlider.tsx      Before/after image comparison slider
  ShopGrid.tsx                Shoppable furniture list with prices and links
  VideoPlayer.tsx             Video walkthrough player / loading / error states
  Gallery.tsx                  Past stagings grouped by project
lib/
  agnes.ts                  All Agnes AI API calls (room detection, restyling, item
                            extraction, listing copy, video generation)
  auth.ts                    Session cookie signing/verification (jose), password hashing
  prisma.ts                  Prisma client singleton
  storage.ts                  Saves/deletes generated images under public/uploads/
  serializers.ts              Prisma row -> frontend type conversion
  types.ts                  Shared TypeScript types (Room, Project, Style, Product, etc.)
  roomOptions.ts            Room type and furniture options for the UI
data/
  products.json             Mock furniture catalog (name, category, style, retailer, price)
store/
  useRoomStore.ts            In-memory Zustand cache, hydrated from the server on load
prisma/
  schema.prisma               User / Project / Room models (SQLite)
middleware.ts                 Redirects unauthenticated page requests to /login
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An Agnes AI API key

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:
   ```bash
   AGNES_API_KEY=your_api_key_here
   AGNES_BASE_URL=https://apihub.agnes-ai.com/v1   # optional, this is the default

   DATABASE_URL="file:./dev.db"
   AUTH_SECRET=some-random-32-byte-hex-string        # used to sign session cookies
   ```
   Prisma's CLI reads `DATABASE_URL` from a plain `.env` file (not `.env.local`), so also
   add a `.env` with just that line.

3. Create the database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign up for an account.

### Build for production

```bash
npm run build
npm run start
```

---

## Usage

1. Sign up (or sign in) — each account has its own private rooms and projects.
2. Upload a photo of an empty or outdated room (click or drag-and-drop).
3. Optionally, select or create a Project to group this room with others in the same
   house/unit.
4. Choose the room type and any specific furniture/decor you'd like added.
5. Pick a style — Scandi, Muji, Luxe, Industrial, or Inspiration (upload a reference
   photo).
6. Optionally set a furniture budget.
7. Optionally check "Also generate a video walkthrough".
8. Click **Stage this room**. The restyled image, shoppable furniture list, and (if
   requested) video will appear below.
9. Use **Generate again** to get a different variant, or browse past stagings in the
   gallery at the bottom.

---

## Mock Product Catalog

`data/products.json` contains a sample furniture catalog used for shopping
recommendations, with entries across Scandi, Muji, Luxe, and Industrial styles covering
categories like sofas, armchairs, tables, lighting, rugs, mirrors, and more. Replace or
extend this file to integrate a real product feed.
