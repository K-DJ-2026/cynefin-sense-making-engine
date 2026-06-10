# Cynefin Sense-Making Engine

Vercel-ready MVP web app for Cynefin-based sense-making: capturing field stories, interpreting issues with evidence, designing safe-to-fail probes, recording emerging signals, and preserving learning.

## Current MVP Capabilities

- **Story Bank**: capture field stories, save them to the browser, search them, delete them, and use AI Assist to structure raw observations.
- **Cynefin Map**: map issues through a 3-step flow: Domain Mix, Evidence-based Interpretation, and Confidence Check.
- **Evidence Log**: save interpretation entries so domain judgments remain traceable instead of becoming one-off slider settings.
- **Probe Portfolio**: design safe-to-fail experiments, track progress/status, and use AI Assist to turn issues into probe ideas.
- **Signal Dashboard**: record weak signals, set direction/strength, and use AI Assist to clarify signal meaning and likely implications.
- **Learning Memory**: review accumulated stories, probes, signals, and interpretation patterns.
- **Local MVP Persistence**: data is stored in the browser with `localStorage` for immediate Vercel testing.

## How to Use

Start with the manuals:

- [1-page quick start manual](docs/Quick_Start_1_Page_ko.md)
- [Full user manual](docs/User_Manual_ko.md)
- [Functional specification v1](docs/Functional_Spec_v1.md)

Recommended first workflow:

1. Add real observations in **Story Bank**.
2. Open **Cynefin Map** and adjust the Domain Mix based on evidence.
3. Write or generate the interpretation rationale with **AI Assist**.
4. Save the interpretation to the Evidence Log.
5. Create a **Safe-to-Fail Experiment** in Probe Portfolio.
6. Record follow-up changes in **Signal Dashboard**.

## MVP Limitations

- This is a single-user browser MVP, not a production multi-user platform.
- Data is saved locally in the current browser only.
- AI Assist is currently rule-based in the frontend; it does not call an external LLM API yet.
- Authentication, database persistence, file attachments, collaboration, and workshop mode are future backend features.

## Run Locally

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

No environment variables are required for the current MVP.
