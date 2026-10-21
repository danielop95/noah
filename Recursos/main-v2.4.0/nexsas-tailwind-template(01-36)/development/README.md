# Next SaaS HTML Template

A comprehensive, modern HTML template collection for SaaS businesses, startups, and web applications. This project provides 1800+ beautifully designed pages across 50+ industry-specific themes, each with complete inner pages including authentication, pricing, blog, contact, and more.

## 🚀 Features

- **1800+ HTML Pages** - Extensive collection of pages across multiple themes
- **50+ Industry Themes** - Pre-built templates for various industries (AI, Finance, Marketing, etc.)
- **Complete Page Sets** - Each theme includes home, about, pricing, blog, contact, authentication, and more
- **Modern Design** - Clean, professional design with dark/light mode support
- **Responsive Layout** - Mobile-first approach with Tailwind CSS
- **Interactive Components** - Smooth animations, sliders, and interactive elements
- **Component-Based Architecture** - Modular HTML components for easy customization
- **Vite Build System** - Fast development and optimized production builds
- **Component Injection** - Seamless component inclusion using `<Component>` tags

## 📁 Project Structure

```
next-sass-html/
├── public/                          # Static assets
│   ├── images/                      # Image assets (946+ files)
│   ├── fonts/                      # Custom font files
│   ├── vendor/                     # Third-party JavaScript libraries
│   └── video/                      # Video assets
├── src/
│   ├── components/                 # HTML components
│   │   ├── pages/                  # Page-specific components
│   │   │   ├── crypto-marketing/   # Crypto marketing theme components
│   │   │   ├── ai-gadgets/         # AI gadgets theme components
│   │   │   ├── ai-agency/          # AI agency theme components
│   │   │   ├── ai-application/     # AI application theme components
│   │   │   ├── online-banking/     # Online banking theme components
│   │   │   ├── authentication-page/# Authentication components
│   │   │   └── [50+ more themes]   # Additional theme folders
│   │   └── shared/                 # Shared components
│   │       ├── head-links.htm      # Common head section
│   │       ├── cta/                # Call-to-action components
│   │       ├── button/             # Button variants
│   │       ├── menu-icon/          # Menu icons
│   │       └── [more shared components]
│   ├── js/                         # JavaScript modules
│   │   ├── animation/              # Animation scripts
│   │   ├── common/                 # Common utilities
│   │   └── utils/                  # Utility functions
│   ├── styles/                     # CSS stylesheets
│   │   ├── base.css                # Base styles
│   │   ├── variables.css           # CSS variables
│   │   └── vendor/                 # Vendor styles
│   └── main.js                     # Main JavaScript entry point
├── *.html                          # 1800+ HTML page files
│   ├── crypto-marketing.html       # Crypto marketing home page
│   ├── crypto-marketing-about.html # Crypto marketing about page
│   ├── crypto-marketing-pricing.html
│   ├── ai-gadgets.html
│   ├── ai-gadgets-login.html
│   ├── online-banking-use-case.html
│   └── [1800+ more pages]
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
└── README.md                       # Project readme file
```

## 🎨 Available Themes

The project includes 50+ industry-specific themes, each with a complete set of pages:

### AI & Technology Themes

- **AI Agency** - `ai-agency.html`, `ai-agency-about.html`, etc.
- **AI Application** - `ai-application.html`, `ai-application-features.html`, etc.
- **AI Chatbot** - `ai-chatbot.html`, `ai-chatbot-integration.html`, etc.
- **AI Gadgets** - `ai-gadgets.html`, `ai-gadgets-login.html`, etc.
- **AI Resume Builder** - `ai-resume-builder.html`, `ai-resume-builder-pricing.html`, etc.
- **AI Software** - `ai-software.html`, `ai-software-features.html`, etc.

### Finance & Banking Themes

- **Online Banking** - `online-banking.html`, `online-banking-use-case.html`, etc.
- **Wealth Management** - `wealth-management.html`, `wealth-management-pricing.html`, etc.
- **Investment Management** - `investment-management.html`, etc.
- **Forex Trading** - `forex-trading.html`, etc.
- **Payment Solution** - `payment-solution.html`, etc.
- **Personal Finance** - `personal-finance.html`, etc.
- **Decentralized Finance** - `decentralized-finance.html`, etc.

### Marketing & Business Themes

- **Crypto Marketing** - `crypto-marketing.html`, `crypto-marketing-about.html`, etc.
- **Digital Marketing** - `digital-marketing.html`, etc.
- **Email Marketing** - `email-marketing.html`, etc.
- **Social Media Management** - `social-media-management.html`, etc.
- **Lead Capture** - `lead-capture.html`, etc.

### Software & SaaS Themes

- **Analytics & Reporting** - `analytics-and-reporting.html`, etc.
- **Cloud Software** - `cloud-software.html`, etc.
- **Security Software** - `security-software.html`, etc.
- **Time Tracking** - `time-tracking.html`, etc.
- **Property Management Software** - `property-management-software.html`, etc.
- **Risk Management Software** - `risk-management-software.html`, etc.
- **Mobile Management Software** - `mobile-management-software.html`, etc.

### And Many More...

- App Builder, App Development, Creative Portfolio, Data Visualization, Insurance, Messaging Platform, Mortgage Services, POS System, Smart Solutions, Web Hosting, and more!

## 📄 Page Types

Each theme typically includes the following page types:

- **Home Page** - `[theme-name].html`
- **About** - `[theme-name]-about.html`
- **Features** - `[theme-name]-features.html`
- **Pricing** - `[theme-name]-pricing.html`
- **Blog** - `[theme-name]-blog.html`
- **Blog Details** - `[theme-name]-blog-details.html`
- **Contact** - `[theme-name]-contact.html`
- **Login** - `[theme-name]-login.html`
- **Signup** - `[theme-name]-signup.html`
- **Services** - `[theme-name]-services.html`
- **Service Details** - `[theme-name]-service-details.html`
- **Team** - `[theme-name]-team.html`
- **Team Details** - `[theme-name]-team-details.html`
- **Case Study** - `[theme-name]-case-study.html`
- **Case Study Details** - `[theme-name]-case-study-details.html`
- **Testimonial** - `[theme-name]-testimonial.html`
- **FAQ** - `[theme-name]-faq.html`
- **Documentation** - `[theme-name]-documentation.html`
- **Integration** - `[theme-name]-integration.html`
- **Use Case** - `[theme-name]-use-case.html`
- **And more...**

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## 📦 Installation

1. **Extract the template files** to your local development environment

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## 🚀 Development

### Start Development Server

Run the development server with hot reload:

```bash
npm run dev
# or
yarn dev
```

The development server will start at `http://localhost:5173` (or the next available port) and automatically open in your browser.

### Accessing Pages

You can access any of the 1800+ pages by navigating to the corresponding HTML file:

- **Crypto Marketing Home**: `http://localhost:5173/crypto-marketing.html`
- **AI Gadgets Login**: `http://localhost:5173/ai-gadgets-login.html`
- **Online Banking Use Case**: `http://localhost:5173/online-banking-use-case.html`
- And so on...

## 🏗️ Building for Production

### Build the Project

Create optimized production build:

```bash
npm run build
# or
yarn build
```

The built files will be generated in the `dist/` directory with all components properly injected and assets optimized.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

This will serve the built files from the `dist/` directory.

## 🎨 Customization

### Component System

The project uses a component-based architecture with the `<Component>` tag for including reusable HTML components:

```html
<!doctype html>
<html lang="en">
  <head>
    <Component src="src/components/shared/head-links.htm" />
    <title>Your Page Title || Nexsas</title>
  </head>
  <body>
    <Component src="src/components/pages/[theme-name]/header.htm" />
    <main>
      <Component src="src/components/pages/[theme-name]/hero.htm" />
      <!-- More components -->
    </main>
    <Component src="src/components/pages/[theme-name]/footer.htm" />
  </body>
</html>
```

### Component Attributes

Components support attributes that can be passed to the included component:

```html
<Component
  src="src/components/shared/cta/cta-v1.htm"
  class="dark:bg-background-6 bg-white"
  badge-class="hidden"
  cta-heading="Build a complete website"
  description="Start your free trial today"
  cta-btn-text="Get started"
/>
```

### Adding New Pages

1. Create a new HTML file in the root directory (e.g., `my-theme-home.html`)
2. Use the component system to include shared and theme-specific components:
   ```html
   <Component src="src/components/shared/head-links.htm" />
   <Component src="src/components/pages/my-theme/header.htm" />
   <Component src="src/components/pages/my-theme/hero.htm" />
   <Component src="src/components/pages/my-theme/footer.htm" />
   ```

### Creating New Theme Components

1. Create a new folder in `src/components/pages/` (e.g., `my-theme/`)
2. Add component files (e.g., `header.htm`, `hero.htm`, `footer.htm`)
3. Reference them in your HTML pages using the `<Component>` tag

### Modifying Styles

- **Tailwind CSS**: Modify `src/styles/` files for custom styles
- **Component Styles**: Edit individual component CSS files
- **Variables**: Update `src/styles/variables.css` for theme customization
- **Dark Mode**: Styles support dark mode using Tailwind's `dark:` prefix

### Adding Animations

- Create new animation files in `src/js/animation/`
- Import and initialize in `src/main.js`
- Use existing animation utilities from `src/js/common/`

## 🛠️ Technologies Used

- **Vite** - Build tool and development server
- **vite-plugin-html-inject** - Component injection system
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies
- **Swiper.js** - Touch slider library
- **GSAP** - Animation library
- **Lenis** - Smooth scrolling library
- **Leaflet** - Maps library

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📧 Support & Contact

If you encounter any issues or need assistance with this template:

- **Email Support**: [hello@pixel71.com](mailto:hello@pixel71.com)
- **Documentation**: Check the included documentation files
- **Customization Help**: Contact us for custom development services

## 📄 License

This template is licensed for commercial use. Please refer to the license terms included with your purchase.

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format
```

## 💡 Tips

- **Component Reusability**: Leverage shared components in `src/components/shared/` across different themes
- **Theme Customization**: Each theme has its own component folder, making it easy to customize specific themes
- **Dark Mode**: All components support dark mode - toggle using the theme switcher
- **Responsive Design**: All pages are mobile-first and fully responsive
- **Performance**: The build process optimizes assets and minifies JavaScript for production

---

**Happy coding! 🎉**
