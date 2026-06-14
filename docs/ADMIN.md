# Admin Guide

The blog admin is a **local-only** editor. It runs when you start the dev server and is not functional on the live GitHub Pages site (which is static).

## Setup

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and set your credentials:

```
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=any-random-string-at-least-32-characters
```

3. Start the dev server:

```bash
npm run dev
```

This starts:
- **Next.js** at [http://localhost:3007](http://localhost:3007)
- **Admin API** at `http://127.0.0.1:3008` (proxied through Next.js at `/api/admin/*`)

## Logging in

Open [http://localhost:3007/admin](http://localhost:3007/admin) and enter your `ADMIN_PASSWORD`.

## Creating and editing posts

1. From the dashboard, click **New post** or **Edit** on an existing post.
2. Fill in metadata (title, date, category, tags, excerpt).
3. Use the **English** / **Korean** tabs to write content in each language.
4. Click **Save** to write Markdown files to `content/posts/`.

### Content features

| Feature | How to use |
|---------|------------|
| **Images** | Click **Image** in the toolbar to upload. Files are saved to the post's `res/images/` folder. |
| **Link preview** | Click **Link preview**, enter a URL. Inserts `[preview](url)` which renders as a preview card. |
| **Video embed** | Click **Video**, enter a YouTube or Vimeo URL. Inserts `[video](url)` — videos are linked, not uploaded. |
| **Regular links** | Standard Markdown: `[text](url)` |

### Post file structure

```
content/posts/yyyy/mm/post-slug/
  en/post-slug.md
  ko/post-slug.md
  res/images/
```

Link preview metadata is cached in frontmatter as `linkPreviews` when you save.

## Previewing locally

After saving, preview your post at:

```
http://localhost:3007/blog/yyyy/mm/post-slug/
```

Use the language toggle in the header to switch between English and Korean.

## Publishing to GitHub Pages

When your post is ready:

1. Click **Publish** in the editor (commits and pushes to `main`), or
2. Run manually:

```bash
npm run deploy
```

GitHub Actions builds the static site and deploys to [https://woneui-hong.github.io/](https://woneui-hong.github.io/).

## Security notes

- Never commit `.env.local`.
- The admin password is only checked on your local machine.
- Admin routes on the live site have no API backend and cannot modify content.
