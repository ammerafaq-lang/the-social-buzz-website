# The Social Buzz

Creative agency website and Ammer Afaq’s portfolio, built from the supplied 2026 portfolio PDF, original logos and business card.

- Live website: https://the-social-buzz.netlify.app/
- Repository: https://github.com/ammerafaq-lang/the-social-buzz-website
- Production branch: `main`
- Netlify project: `the-social-buzz`
- Netlify project ID: `b2629412-4ca2-405d-b1ff-cf4005cd1b23`

## Build and preview

Run `node scripts/build.mjs`, then serve `dist` with a static server, for example `python -m http.server 8080 --directory dist`.

The build uses only Node’s standard library. Netlify runs the same build command and publishes `dist`. Commits to `main` trigger the existing production deployment. No package installation is required.

## Editing the website

- `src/home.html`: agency homepage, services, workflow examples, selected work and enquiry form.
- `src/work.html`: full portfolio with category filters and project viewers.
- `src/founder.html`: biography, professional skills, personal contacts and press features.
- `data/portfolio.json`: all 27 projects, their original links, four press features and contact/social details.
- `scripts/build.mjs`: shared navigation, footer, project cards, metadata and generated routes.
- `styles.css` and `script.js`: responsive design, accessible navigation, filters, dialogs, video playback and form behavior.
- `assets/`: optimized real portfolio images and supplied logo artwork. The large original PDF is intentionally excluded from the repository.

Generated output belongs in `dist`, which is ignored by git. Do not edit generated pages directly.

## Source notes

The original white and black logos retain the supplied lettering, frame, dot and underline. The palette uses the supplied blue-to-black gradient. Portfolio images are extracted from the PDF and optimized as WebP. Descriptive project titles do not claim unprovided client results or business outcomes.

All 26 project hyperlinks present in the PDF are preserved. Several were stored as PDF file links and have been normalized to HTTPS. The third reel on page 7 (`work-14`, the Reone team) has no hyperlink annotation; it is displayed as a portfolio still, without an invented destination. Add its URL to the data when available.

Film titles were checked against the linked YouTube videos. The first PDF screenshot depicts a private jet, but its hyperlink leads to a Palm Jumeirah mansion film; the public card uses the linked film’s official YouTube thumbnail, with supplied brand artwork as a fallback. The original screenshot and the discrepancy remain recorded in the data. Duplicate overlapping annotations on the press page were resolved using the destinations matching each article screenshot. The four press features link to the original articles or reel.

Founder contact details and the unified `@filmsbyafaq` social handle come from the PDF. Company email, Instagram, LinkedIn handle and domain label come from the supplied business card. `thesocialbuzz.ae` is brand text; the connected production domain remains the Netlify URL above. Update canonical metadata in the build if a custom domain is connected.

## Enquiries and routes

The `project-enquiry` Netlify form includes a spam honeypot, native validation, sending/error feedback and a success page. Keep form detection enabled; submissions are collected in the existing project’s Forms dashboard. Email notifications are managed separately in Netlify. Do not submit test enquiries to the production inbox without intent to send one.

Routes: `/`, `/work/`, `/founder/`, `/privacy`, `/success`, and the custom 404 page. `/home` redirects to `/`. The build generates the sitemap and robots file.

Do not commit credentials, local `.netlify` state, environment files or generated output.
