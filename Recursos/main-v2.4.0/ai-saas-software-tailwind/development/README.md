# AI SaaS Software HTML Template

A modern, responsive HTML template for AI SaaS products and software businesses. Built with **Nexsas** branding, this single-theme project includes a full set of marketing, product, and auth pages with a component-based architecture and Tailwind CSS.

## Features

- **17 HTML Pages** – Home, about, features, pricing, blog, services, team, use cases, auth, and more
- **Component-Based Architecture** – Reusable HTML components via `<Component>` tags
- **Tailwind CSS v4** – Utility-first styling with `@tailwindcss/vite`
- **Vite Build** – Fast dev server and optimized production builds
- **Responsive & Modern** – Mobile-first layout and clean design
- **No Framework Lock-in** – Vanilla JS; easy to integrate with any backend

## Project Structure

```
ai-saas-software-tailwind/
├── public/                          # Static assets
│   ├── images/                      # Images, logos, icons
│   ├── fonts/                       # Font files
│   └── vendor/                      # Third-party JS (GSAP, Swiper, etc.)
├── src/
│   ├── components/                  # HTML components
│   │   ├── home/                    # Home page sections
│   │   │   ├── hero.htm
│   │   │   ├── clients.htm
│   │   │   ├── services.htm
│   │   │   ├── about.htm
│   │   │   ├── core-features.htm
│   │   │   ├── pricing.htm
│   │   │   ├── blog.htm
│   │   │   ├── team.htm
│   │   │   └── ...
│   │   ├── shared/                  # Shared across pages
│   │   │   ├── head-links.htm
│   │   │   ├── header.htm
│   │   │   ├── footer.htm
│   │   │   ├── cta.htm
│   │   │   ├── menu-icon/
│   │   │   └── modal/
│   │   ├── blog/                    # Blog page components
│   │   ├── team/                    # Team page components
│   │   ├── services/                # Services page components
│   │   ├── features/                # Features page components
│   │   ├── pricing/                 # Pricing page components
│   │   ├── use-case/                # Use case page components
│   │   ├── about/                   # About page components
│   │   └── reegistration/           # Login & signup
│   ├── js/
│   │   ├── animation/               # Animations (CTA, reveal, smooth scroll, etc.)
│   │   └── utils/                   # Utilities (footer, marquee, swiper, etc.)
│   ├── styles/
│   │   ├── main.css                 # Main CSS entry
│   │   ├── variable.css
│   │   ├── common.css
│   │   ├── typography.css
│   │   └── vendor/
│   └── main.js                     # JS entry point
├── index.html                       # Home
├── about-us.html
├── features.html
├── pricing.html
├── process.html
├── services.html
├── service-details.html
├── blog.html
├── blog-details.html
├── team.html
├── team-details.html
├── use-case.html
├── use-case-details.html
├── contact-us.html
├── login.html
├── signup.html
├── 404.html
├── package.json
├── vite.config.js
└── README.md
```

## Pages

| Page            | File                 | Description              |
|-----------------|----------------------|--------------------------|
| Home            | `index.html`         | Landing with hero, features, pricing, CTA |
| About           | `about-us.html`      | About and mission        |
| Features        | `features.html`      | Product features         |
| Pricing         | `pricing.html`       | Pricing plans            |
| Process         | `process.html`       | How it works             |
| Services        | `services.html`      | Services listing         |
| Service details | `service-details.html` | Single service page   |
| Blog            | `blog.html`         | Blog listing             |
| Blog details    | `blog-details.html` | Single post              |
| Team            | `team.html`         | Team listing             |
| Team details    | `team-details.html` | Team member page         |
| Use cases       | `use-case.html`     | Use case listing         |
| Use case details| `use-case-details.html` | Single use case     |
| Contact         | `contact-us.html`   | Contact form             |
| Login           | `login.html`        | Login form               |
| Sign up         | `signup.html`       | Registration             |
| 404             | `404.html`          | Not found                |

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## Installation

1. Clone or extract the project.

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

## Development

Start the dev server (with hot reload):

```bash
npm run dev
# or
yarn dev
```

The app runs at **http://localhost:5173** (or the next free port) and usually opens in the browser.

### Opening all pages

Use the included script to open every HTML page in the browser:

```bash
# PowerShell (Windows)
.\open-all-pages.ps1

# Bash (Git Bash / WSL)
./open-all-pages.sh
```

## Building for production

Build:

```bash
npm run build
# or
yarn build
```

Output is in **`dist/`** with injected components and processed assets.

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

Optional deploy to Vercel:

```bash
npm run deploy
# or
yarn deploy
```

## Customization

### Using components

Pages use `<Component>` to include partials:

```html
<!doctype html>
<html lang="en">
  <head>
    <Component src="src/components/shared/head-links.htm" />
    <title>AI SaaS Software || Nexsas</title>
  </head>
  <body>
    <Component src="src/components/shared/header.htm" />
    <main class="bg-background-7">
      <Component src="src/components/home/hero.htm" />
      <!-- more components -->
    </main>
    <Component src="src/components/shared/footer.htm" />
  </body>
</html>
```

### Adding a new page

1. Add a new `.html` file in the project root (e.g. `faq.html`).
2. Reuse shared components: `head-links.htm`, `header.htm`, `footer.htm`.
3. Add page-specific components from `src/components/` or create new ones.

### Styles

- **Tailwind** – Edit `src/styles/` (e.g. `variable.css`, `common.css`, `typography.css`).
- **Main entry** – `src/styles/main.css` imports Tailwind and project styles.

### Scripts

- **Entry** – `src/main.js` imports animation and utils.
- **Animation** – `src/js/animation/` (e.g. reveal, smooth scroll, CTA).
- **Utils** – `src/js/utils/` (footer, marquee, swiper, navigation, etc.).

## Tech stack

- **Vite** – Dev server and build
- **vite-plugin-html-inject** – `<Component>` injection
- **Tailwind CSS v4** – Styling
- **Vanilla JavaScript** – No front-end framework
- **Swiper** – Sliders/carousels
- **GSAP** – Animations
- **Vanilla Infinite Marquee** – Marquee sections

## Browser support

- Chrome, Firefox, Safari, Edge (current versions)

## Quick reference

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Deploy (Vercel)
npm run deploy

# Format
npm run format
```

---

**Nexsas – AI SaaS Software Template**
