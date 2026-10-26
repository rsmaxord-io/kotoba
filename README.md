# The Profitless Boom

A static, source-based explainer on the business of Japanese animation: production
committees, animator pay, and where the revenue from the industry's record years
actually ends up.

## What's here

| File | Purpose |
|---|---|
| `index.html` | Front page — the market-vs-production gap |
| `committee.html` | The production committee system and the rights flow |
| `animators.html` | Piece rates, income and hours survey data |
| `money.html` | Revenue streams and why studios don't capture growth |
| `sources.html` | Source list, definitions and method notes |
| `404.html` | Not-found page (used automatically by most static hosts) |
| `styles.css` | All styling |
| `script.js` | Progressive enhancement only — the site works without it |

No build step, no dependencies, no external requests. Every figure is FY2024 and
attributed on the sources page.

## Run locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 4173
# http://127.0.0.1:4173/
```

## Deploy

Any static host works. The folder is the site — upload it as-is.

- **Netlify Drop** — drag this folder onto <https://app.netlify.com/drop>
- **GitHub Pages** — push to a repo, then Settings → Pages → deploy from branch
- **Cloudflare Pages** — create a project and upload the folder

`.nojekyll` is included so GitHub Pages serves the files without Jekyll processing.

## License

Text and design: original work for this project. Figures belong to the cited
surveys and publications; check the source list before reusing them.
