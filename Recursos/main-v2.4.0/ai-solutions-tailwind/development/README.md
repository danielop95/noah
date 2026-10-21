# AI Solutions HTML Template

A modern, responsive HTML template for AI solutions and software businesses. Built with **Nexsas** branding, this single-theme project includes a full set of marketing, product, and auth pages with a component-based architecture and Tailwind CSS.

## Features

- **15 HTML Pages** – Home, about, services, projects, blog, pricing, FAQ, contact, auth, and more
- **Component-Based Architecture** – Reusable HTML components via `<Component>` tags
- **Tailwind CSS v4** – Utility-first styling with `@tailwindcss/vite`
- **Vite Build** – Fast dev server and optimized production builds
- **Responsive & Modern** – Mobile-first layout and clean design
- **No Framework Lock-in** – Vanilla JS; easy to integrate with any backend

## Project Structure

```
ai-solutions-tailwind/
├── public/                          # Static assets
│   ├── images/                       # Images, logos, icons
│   ├── fonts/                        # Font files
│   ├── vendor/                       # Third-party JS (GSAP, Swiper, etc.)
│   └── video/                        # Video assets
├── src/
│   ├── components/                   # HTML components
│   │   ├── home/                     # Home page sections
│   │   │   ├── hero.htm
│   │   │   ├── our-impact.htm
│   │   │   ├── empowering-business.htm
│   │   │   ├── innovative-solutions.htm
│   │   │   ├── portfolio.htm
│   │   │   ├── testimonial.htm
│   │   │   ├── faq.htm
│   │   │   ├── cta.htm
│   │   │   └── ...
│   │   ├── shared/                   # Shared across pages
│   │   │   ├── head-links.htm
│   │   │   ├── header.htm
│   │   │   ├── footer.htm
│   │   │   ├── menu-icon/
│   │   │   └── modal/
│   │   ├── about/                    # About page components
│   │   ├── blog/                     # Blog page components
│   │   ├── blog-details/             # Blog details components
│   │   ├── contact/                  # Contact page components
│   │   ├── faq/                      # FAQ page components
│   │   ├── pricing/                  # Pricing page components
│   │   ├── projects/                 # Projects page components
│   │   ├── project-details/          # Project details components
│   │   ├── services/                 # Services page components
│   │   ├── services-details/         # Service details components
│   │   ├── login/                    # Login page components
│   │   ├── signup/                   # Signup page components
│   │   └── not-found/                # 404 page components
│   ├── js/
│   │   ├── animation/                # Animations (header, swiper, marquee, etc.)
│   │   ├── button/                   # Button behavior
│   │   ├── common/                   # Common utilities
│   │   ├── glowing-cards/            # Glowing card effects
│   │   ├── integration/              # Integration scripts
│   │   └── utils/                    # Utilities (footer, accordion, modal, etc.)
│   ├── styles/
│   │   ├── main.css                  # Main CSS entry
│   │   ├── variable.css
│   │   ├── common.css
│   │   ├── typography.css
│   │   ├── accordion.css
│   │   ├── glowing-card.css
│   │   ├── custom-swiper.css
│   │   ├── navigation-menu.css
│   │   ├── icon-fonts.css
│   │   └── vendor/
│   └── main.js                       # JS entry point
├── index.html                        # Home
├── about.html
├── services.html
├── service-details.html
├── projects.html
├── project-details.html
├── blog.html
├── blog-details.html
├── pricing.html
├── faq.html
├── contact.html
├── login.html
├── signup.html
├── team-details.html
├── 404.html
├── package.json
├── vite.config.js
├── post-build.js
└── README.md
```

## Pages

| Page             | File                 | Description                 |
|------------------|----------------------|-----------------------------|
| Home             | `index.html`         | Landing with hero, impact, portfolio, CTA |
| About            | `about.html`         | About and mission          |
| Services         | `services.html`      | Services listing           |
| Service details  | `service-details.html` | Single service page      |
| Projects         | `projects.html`      | Projects listing           |
| Project details  | `project-details.html` | Single project page      |
| Blog             | `blog.html`          | Blog listing               |
| Blog details     | `blog-details.html`  | Single post                |
| Pricing          | `pricing.html`       | Pricing plans              |
| FAQ              | `faq.html`           | Frequently asked questions |
| Contact          | `contact.html`       | Contact form               |
| Team details     | `team-details.html`  | Team member page           |
| Login            | `login.html`         | Login form                 |
| Sign up          | `signup.html`        | Registration               |
| 404              | `404.html`           | Not found                  |

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

## Building for production

Build:

```bash
npm run build
# or
yarn build
```

Output is in **`dist/`** with injected components and processed assets. The build uses `post-build.js` for any post-processing.

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
    <title>AI Solutions - Nexsas</title>
  </head>
  <body>
    <Component src="src/components/shared/header.htm" />
    <main class="bg-background-6">
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
- **Animation** – `src/js/animation/` (header, swiper, marquee, etc.).
- **Utils** – `src/js/utils/` (footer, accordion, modal, navbar, smooth scrolling, etc.).
- **Other** – `src/js/button/`, `src/js/glowing-cards/`, `src/js/integration/`.

## Tech stack

- **Vite** – Dev server and build
- **vite-plugin-html-inject** – `<Component>` injection
- **Tailwind CSS v4** – Styling
- **Vanilla JavaScript** – No front-end framework
- **Swiper** – Sliders/carousels
- **GSAP** – Animations
- **Terser** – Vendor script minification (post-build)

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

**Nexsas – AI Solutions Template**
