# RDP Portfolio

A React, TypeScript, and Vite portfolio with a protected admin dashboard, Firebase-backed content and analytics, Cloudinary uploads, and Netlify Functions.

## Local development

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Plain Vite development uses the portfolio data in `src/data/portfolio.ts` when Netlify Functions are unavailable. Production continues to load saved portfolio content from the protected `portfolio` function.

To test Netlify Functions locally, use Netlify Dev and provide the server variables listed in `.env.example`:

```bash
npx netlify dev
```

## Environment variables

Configure these as server-side environment variables in Netlify:

```text
FIREBASE_DATABASE_URL
FIREBASE_API_KEY
FIREBASE_SERVICE_EMAIL
FIREBASE_SERVICE_PASSWORD
CLOUDINARY_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GITHUB_TOKEN
```

Do not prefix these names with `VITE_`. A `VITE_` variable is available to browser code and must never contain a Cloudinary API secret, Firebase service password, token, or other private credential.

If older `VITE_CLOUDINARY_*` or `VITE_FIREBASE_*` entries still exist in the Netlify dashboard, replace them with the server-side names above and redeploy without the old values.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
