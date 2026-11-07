# Vaibhav & Apurva — Wedding Invitation

A complete English wedding invitation for 9–10 December 2026 in Nagpur. Responsive ivory, wine and gold design, locally bundled photographs and fonts, live countdown, venue directions, downloadable five-event calendar, and native sharing with a copy-link fallback.

Includes light and dark themes with a header toggle. The initial theme follows the device setting, and an explicit selection is remembered locally. Theme setup runs before the styles load to avoid a flash of the wrong theme.

The supplied Kesariya flute instrumental is bundled as `assets/wedding-music.mp3`, loops at 35% volume, and attempts audible playback on opening. Browsers that block autoplay start it on the first tap/click or key interaction instead. The fixed music button pauses/resumes it; once muted, other interactions do not restart it during that visit. A fresh page load defaults to music enabled again. Playback controls are in `music.js`.

## Preview locally

Requires Node.js 18 or newer. No packages need to be installed.

```sh
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

## Deploy to Vercel

1. Upload this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use **Other** as the framework preset, **npm run build** as the build command and **dist** as the output directory. These settings are already included in `vercel.json`.
4. Click **Deploy**, then send the resulting production URL to your guests.

Alternatively, run `npx vercel --prod` in this folder and follow Vercel's prompts. The site requires no environment variables, database or paid services.

## Edit the invitation

- Text, family details, event times, map links and metadata: `index.html`.
- Colours, spacing and responsive layouts: `styles.css`.
- Countdown wedding date and share text: `app.js`.
- Calendar events: `assets/wedding-celebrations.ics` (UTC times; IST is UTC +05:30).
- Link preview image: `assets/social-preview.jpg`.

When changing event times, update both the page and calendar. The two map buttons search Google Maps using the venue names and addresses supplied in the original invitation; no unverified coordinates have been used.

## Photography

Decorative stock photographs from Unsplash are bundled locally, and do not depict the couple or claim to depict the actual venues:

- https://images.unsplash.com/photo-1519225421980-715cb0215aed
- https://images.unsplash.com/photo-1511795409834-ef04bbd61622
- https://images.unsplash.com/photo-1519167758481-83f550bb49b3

Fonts: Cormorant Garamond and DM Sans via Google Fonts, bundled locally with their SIL Open Font License. This is an invitation site; it does not collect RSVPs or guest information.

## Checks

```sh
npm run check
npm run build
```
