# The Social Buzz Website

Website for The Social Buzz, a Dubai creative marketing agency.

- Website: https://the-social-buzz.netlify.app
- Repository: https://github.com/ammerafaq-lang/the-social-buzz-website
- Production branch: `main`
- Netlify project: `the-social-buzz`
- Netlify project ID: `b2629412-4ca2-405d-b1ff-cf4005cd1b23`

## Stack

Static HTML, CSS and JavaScript. No build step or application dependencies. Netlify's publish directory is `.`.

## Features

- Responsive black, white and Social Buzz blue visual identity
- Content category filters and accessible detail dialogs
- Creative services and founder positioning
- Example calendar, creative brief and project flow with keyboard-accessible tabs
- Mobile navigation, focus management, skip link and reduced-motion support
- Netlify project enquiry form with spam honeypot, validation, sending and error feedback
- Search metadata, structured data, sitemap, robots file and favicon
- Privacy, enquiry success and custom 404 pages

## Local preview

From the project folder, run `npx netlify-cli dev --dir .`. Netlify Forms submissions require a deployed site; local preview does not confirm delivery to the production inbox.

## Content

Category graphics describe the kinds of content we create. They are not presented as completed client case studies. Published work links to `@filmsbyafaq` on Instagram. The founder graphic and category covers can be replaced with approved photos, films and client case studies when those assets are available. The workflow tabs are clearly labelled examples, not a client portal.

## Deployment and enquiries

Deploy this repository to the existing project ID above. Keep form detection enabled in Netlify. Check that the `project-enquiry` form is registered after deployment; submissions are available in the project's Forms dashboard. Email notifications, if wanted, are configured separately in Netlify.

Public routes are `/`, `/privacy`, `/success` and the custom 404 page. `/home` redirects to `/`. Keep canonical metadata, `robots.txt` and `sitemap.xml` aligned if the production domain changes.

Do not commit deployment credentials, local `.netlify` state or environment files.
