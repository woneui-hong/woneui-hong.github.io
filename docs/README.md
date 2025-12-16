# woneui-hong.github.io

Personal portfolio and blog site for **Won Eui Hong** - Business Automation Consultant & Investment Analyst based in Edmonton, Canada.

## Project Overview

This repository contains a **Next.js** website with static export for GitHub Pages deployment.

> **Note:** Jekyll configuration files are preserved in `config/jekyll/` for future use, but Jekyll is not currently active in this project.

## Project Structure

```
woneui-hong.github.io/
├── src/                    # Next.js source code
│   ├── app/               # Next.js App Router pages
│   └── components/        # React components
│
├── content/               # Jekyll content files (preserved, not active)
│   ├── _includes/        # Jekyll includes
│   ├── _data/            # Jekyll data files
│   └── index.md          # Jekyll homepage
│
├── resources/            # Static resources
│   ├── images/           # Image assets
│   └── public/           # Next.js public folder
│
├── styles/               # Style-related files
│   ├── globals.css       # Global CSS styles
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── config/               # Configuration files
│   ├── jekyll/          # Jekyll configuration (preserved, not active)
│   ├── nextjs/          # Next.js configuration
│   └── docker/          # Docker configuration
│
└── docs/                 # Documentation
    ├── commands.md       # Development commands
    └── README-NEXTJS.md  # Next.js specific docs
```

## Tech Stack

### Next.js Stack (Active)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React

### Jekyll Stack (Preserved, Not Active)
- **Framework:** Jekyll (GitHub Pages)
- **Theme:** Minimal Mistakes
- **Status:** Configuration files preserved in `config/jekyll/` for future use

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Next.js Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npx serve out
```

The development server will start at [http://localhost:3000](http://localhost:3000).

## Deployment

### GitHub Pages

The site is configured for GitHub Pages deployment:
- Next.js builds to `out/` directory (static export)
- Configure GitHub Pages to serve from the `out` directory

## Configuration Files

Key configuration files are maintained in both:
- **Source location:** `config/` directory (for version control)
- **Root location:** Copied to root (for framework requirements)

When updating configurations:
1. Edit files in `config/` directory
2. Copy updated files to root if needed

## Root Directory Files

The root directory contains only essential files:

**Next.js Required:**
- `package.json`, `package-lock.json` - Dependencies
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

**Project Files:**
- `README.md` - This file
- `LICENSE` - License information
- `.gitignore` - Git ignore rules
- `.eslintrc.json` - ESLint configuration

**Auto-generated:**
- `next-env.d.ts` - TypeScript definitions (gitignored)

## Restoring Jekyll (If Needed)

If you want to use Jekyll in the future:

1. Copy Jekyll files to root:
   ```bash
   cp config/jekyll/Gemfile config/jekyll/Gemfile.lock config/jekyll/_config.yml .
   ```

2. Install Jekyll dependencies:
   ```bash
   bundle install
   ```

3. Update `_config.yml` to uncomment `source: content`

4. Run Jekyll:
   ```bash
   bundle exec jekyll serve
   ```

## License

See [LICENSE](LICENSE) file for details.
