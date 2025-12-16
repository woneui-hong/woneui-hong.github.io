# InsightFlow Landing Page

Next.js 14+ landing page for Business Automation Consultancy emphasizing Work Prioritization (WP) before Digital/AI Transformation.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

The output will be in the `out` directory (static export for GitHub Pages).

### Deploy to GitHub Pages

1. Build the project: `npm run build`
2. The `out` directory contains the static files
3. Configure GitHub Pages to serve from the `out` directory

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main landing page
│   └── globals.css     # Global styles
├── components/
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── Philosophy.tsx  # Core philosophy (WP → Opt → AX)
│   ├── Services.tsx    # Services cards
│   ├── Referral.tsx    # Referral program section
│   └── Footer.tsx      # Footer with contact info
└── public/             # Static assets
```

## Key Features

- **Responsive Design:** Mobile-first approach
- **Smooth Animations:** Framer Motion for entrance animations
- **Philosophy Emphasis:** Visual hierarchy showing WP → Optimization → Automation sequence
- **Referral Program:** Highlighted section with distinct background
- **Professional Design:** Minimalist, trustworthy, essentialist aesthetic

## Customization

- Update contact information in `components/Footer.tsx`
- Modify colors in `tailwind.config.js`
- Adjust animations in component files
- Update content in respective component files

