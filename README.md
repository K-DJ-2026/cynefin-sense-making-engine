# Cynefin Sense-Making Engine

Vercel-ready MVP web app for testing a Cynefin-based sense-making operating system.

## What is included

- Next.js App Router project
- Responsive MVP dashboard UI
- Story Bank, Cynefin Mapping, Probe Portfolio, Signal Dashboard, Leadership Cockpit sections
- Functional specification in `docs/Functional_Spec_v1.md`

## Documentation

- [1-page quick start manual](docs/Quick_Start_1_Page_ko.md)
- [Full user manual](docs/User_Manual_ko.md)
- [Functional specification v1](docs/Functional_Spec_v1.md)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

Import this repository in Vercel. Vercel should auto-detect Next.js and use:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output: Next.js default
