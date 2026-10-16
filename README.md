# Bipin Bista | Portfolio

Static portfolio site. No build step, no dependencies.

- **Light theme is the default.** A toggle in the nav switches to the dark theme; the choice is remembered in `localStorage`.
- **Hero:** an interactive 3D laptop built with pure CSS 3D (no libraries), in both themes. Its screen is a live copy of this site (`index.html?embed=1`). The lid opens once the boot screen has gone.
  - **Drag / swipe** to rotate 360° (with inertia) and tilt. **Move the cursor** to make it lean. Page scrolling gives it a gentle spin.
  - **Click or tap the screen** (or focus the laptop and press `Enter`) to *use* it: it turns to face you and the preview becomes scrollable and clickable. `Esc`, the **Exit screen** pill, or clicking elsewhere releases it. While released, the page always scrolls normally, so the laptop never traps your scroll.
  - **Closed lid?** Click the laptop or the *Tap to open* pill.
  - **Keyboard** (focus the laptop first): arrows turn/tilt, `L` lid, `F` / `Home` front view, `S` spin, `Enter` use screen.
  - **Buttons:** rotate left/right, Front, Lid, 360° spin.
- **Resilience:** if 3D or JavaScript is unavailable, or `laptop.js` fails to load, the hero shows a static screenshot of the laptop (`assets/screen-*.jpg`) instead of an empty space. If the live preview cannot load (for example a host sends `X-Frame-Options`), the screenshot stays on the screen instead of a blank panel.
- Also: skip-to-content link, back-to-top button, scroll cue, `Esc`/click-outside closes the mobile menu, click the boot screen to skip it.
- **Dark theme:** black (`#090908`) with a brass accent. The laptop screen switches to the dark copy of the site.

## Structure

```
index.html            page markup
css/style.css         all styles (light = :root, dark = html[data-theme="dark"])
js/main.js            animations, theme toggle
js/laptop.js          3D laptop hero
assets/               About photo, screen-dark.jpg / screen-light.jpg (laptop screen placeholders), og-hero.jpg (social share image)
.github/workflows/    GitHub Pages deploy
```

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a repo and push this folder to the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.
4. Custom domain (`bipinbista01.com.np`): add it under Settings → Pages, then create the DNS records GitHub lists. Optionally add a `CNAME` file containing the domain.

## Edit

- Hero typing phrases: search `var phrases` in `js/main.js`.
- Light colours: `:root` at the top of `css/style.css`. Dark colours: `html[data-theme="dark"]` near the bottom.
- If you change the page a lot, regenerate `assets/screen-dark.jpg` and `assets/screen-light.jpg` (1280x800 screenshots of `index.html?embed=1&theme=dark|light`) so the placeholder matches the live screen.
- Laptop size and lid angle: `W`, `D`, `L`, `OPEN` at the top of `js/laptop.js`. Drag, lean and scroll-spin speeds are in the same file.

## Troubleshooting

- **Hero looks empty or unstyled:** don't open the `.zip` directly. Extract the whole folder first, then open `index.html`, or better, run `python3 -m http.server 8000` and visit `http://localhost:8000`.
- **Laptop shows a still image:** that is the built-in fallback. Open the browser console (F12) for a `[laptop]` message; the usual causes are a browser/GPU with 3D transforms disabled or `js/laptop.js` returning 404 (check the file path and capitalisation on GitHub Pages).
- **Screen stays a screenshot:** the live preview did not report ready, usually because the host blocks framing of its own pages. Allow same-origin framing (`X-Frame-Options: SAMEORIGIN`).
