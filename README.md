# portfolio

My personal site: [oryemkilama.okoryem.workers.dev](https://oryemkilama.okoryem.workers.dev)

A portfolio styled like a code editor, with four pages:

- `_hello`: who I am, with links to LinkedIn and GitHub
- `_about-me`: bio, interests (with travel videos) and education, plus my skills
- `_projects`: the things I've built, filterable by technology
- `_contact-me`: a message form that writes the email for you

## How it's built

Plain HTML, CSS and JavaScript. No framework and no build step.

| File | What it does |
| --- | --- |
| `index.html` | All four pages and the project write-ups |
| `styles.css` | The look |
| `script.js` | Tabs, the project filter, project panels, the about-me file tree and the contact form |
| `media/` | Screenshots and travel videos (720p H.264, made with ffmpeg) |
| `wrangler.jsonc` | Cloudflare Workers config (static assets only) |

The design is based on the free
[Portfolio for Developers Concept V.2.1](https://www.figma.com/community/file/1100794861710979147/portfolio-for-developers-concept-v-2-1)
by Yanka Darelova, reworked in black and white.

## Run it locally

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765.

## Deploy

Hosted on Cloudflare Workers (free plan):

```bash
npx wrangler deploy
```

After changing `styles.css` or `script.js`, bump the `?v=` number on their links in
`index.html` so browsers fetch the new files. `.assetsignore` keeps this README and the
config files off the public site.
