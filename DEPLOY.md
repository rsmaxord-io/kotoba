# Publishing this project

Everything here is plain static files: HTML, CSS, JavaScript and MP3.
There is no server, database or build step, so any static host can serve it.

Two sites live in this repository:

- `./` — the anime-industry explainer (`index.html`, `animators.html`, …)
- `./nihongo/` — the Kotoba Japanese course (`nihongo/index.html`)

---

## Option 1 — GitHub Pages (free, versioned, easiest to update)

Free for **public** repositories. HTTPS and a `username.github.io` address are included.

### If you want one repository for both sites

1. Create a public repository on GitHub, for example `kotoba`.
2. In this folder:

```bash
cd "/Users/sanoryouhei/Documents/Default Project"
git add .
git commit -m "Kotoba Japanese course and anime explainer"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/kotoba.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Save.
4. After a minute:
   - anime site: `https://YOUR-NAME.github.io/kotoba/`
   - Japanese course: `https://YOUR-NAME.github.io/kotoba/nihongo/`

### If you want a clean address for the course

Create a second public repository, for example `nihongo`, and push only that
folder to its root:

```bash
cd "/Users/sanoryouhei/Documents/Default Project/nihongo"
git init
git add .
git commit -m "Kotoba Japanese course"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/nihongo.git
git push -u origin main
```

Then enable Pages the same way. The course becomes
`https://YOUR-NAME.github.io/nihongo/`.

### Updating the live site

```bash
git add .
git commit -m "Update lessons"
git push
```

GitHub Pages redeploys automatically in about a minute.

### Limits

- Repository / published site: 1 GB (this project is about 45 MB)
- Soft bandwidth limit: 100 GB per month
- Soft build limit: 10 per hour
- Must be a public repository on the free plan

---

## Option 2 — Cloudflare Pages (free, unlimited bandwidth)

Better if the audio gets a lot of listeners, because bandwidth is not capped.
Works with public **or** private repositories. No credit card.

### Connect a repository

1. Sign up at <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick the repository.
4. Build settings:
   - Framework preset: **None**
   - Build command: leave empty
   - Build output directory: `/` (or `nihongo` if you publish only the course)
5. Deploy. You get `https://your-project.pages.dev`.

### Or upload without Git

1. **Workers & Pages → Create → Pages → Upload assets**.
2. Drag the `nihongo` folder (or the whole project folder).
3. Deploy. You get a `*.pages.dev` address immediately.

Re-uploading is needed after each change unless you connect Git.

### Limits

- Unlimited requests and bandwidth
- 500 deployments per month
- 20,000 files per deployment (this project has about 2,700)
- 25 MiB maximum per file (the largest audio file is well under 1 MB)

---

## Option 3 — Netlify Drop (fastest, no account needed to start)

1. Go to <https://app.netlify.com/drop>.
2. Drag the `nihongo` folder onto the page.
3. You get a temporary `*.netlify.app` address in seconds; create a free account
   to keep it and rename it.

Free plan: 100 GB bandwidth per month, HTTPS included.

---

## Which one to pick

| | GitHub Pages | Cloudflare Pages | Netlify |
|---|---|---|---|
| Cost | Free | Free | Free |
| Bandwidth | 100 GB/month (soft) | Unlimited | 100 GB/month |
| Private repo | No | Yes | Yes |
| Update | `git push` | `git push` or re-upload | re-upload / Git |
| Setup effort | Low | Low | Lowest |

For a course with 2,600 audio clips, **Cloudflare Pages** is the safest long-term
choice. **GitHub Pages** is the simplest if you want everything in one place and
expect modest traffic.

---

## Custom domain

A free host gives you a free subdomain (`*.github.io`, `*.pages.dev`,
`*.netlify.app`). A domain of your own, such as `kotoba.jp`, is the only part
that costs money — roughly ¥1,000–3,000 per year. All three hosts support
custom domains with free HTTPS; add the domain in the host's dashboard and
point a CNAME at it.

---

## Before you publish

- The internal listening pages (`audio-lab.html`, `kana-lab.html`) are excluded
  in `.gitignore` and will not be uploaded.
- `.nojekyll` already exists, so GitHub Pages will serve the files as they are.
- All links and audio paths are relative, so the site works at the repository
  root or under `/nihongo/` without changes.
