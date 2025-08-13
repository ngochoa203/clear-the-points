# Clear The Points (React)

A tiny React game for the HAIBAZO entrance test. Click all numbered circles inside the board as fast as you can. When every circle disappears, an "ALL CLEARED" message appears and the final time is shown.

## Features

- Input to choose number of points (1–50)
- Start and Reset controls
- Non-overlapping circles placed randomly inside the board
- Live timer; freezes on completion
- Completion overlay with final time

## Run locally

```fish
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build

```fish
npm run build
npm run preview
```

## Deploy to Vercel (one-time)

1. Push this repo to GitHub.
2. Create a new project on https://vercel.com, import the GitHub repo.
3. Framework preset: Vite. Build command: `vite build` (default `npm run build`). Output directory: `dist`.
4. Deploy. Your production URL will be available after the first build.

## Notes

- If the chosen number of points is too high to place without overlap, the app will place as many as possible and show a small hint.
