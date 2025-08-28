# AI Ad Copy Builder

A web-based tool built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS** to streamline the creation of Google Ads Responsive Search Ads (RSA).

## Features
- Generate RSA ad copy quickly and consistently.
- User-friendly interface with a single-page design.
- Built with Next.js `app/` router and TypeScript.
- Styled using Tailwind CSS and PostCSS.

## Project Structure
AI-Ad-Copy-Builder/
│
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Main page entry
│ │ └── globals.css # Global styles
│ │
│ └── components/ # Reusable UI components
│ └── GoogleAdsRSABuilder.tsx
│
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json

bash
Copy code

## Requirements
- Node.js v18+
- npm v9+ or yarn

## Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/AI-Ad-Copy-Builder.git
cd AI-Ad-Copy-Builder
npm install
Usage
Run the development server:

bash
Copy code
npm run dev
The app will be available at http://localhost:3000.

Build for production:

bash
Copy code
npm run build
npm start
Available Scripts
npm run dev – Start development server with hot reload

npm run build – Create an optimised production build

npm start – Run production server

npm run lint – Run linter checks

Contributing
Contributions are welcome. Fork the repo, make your changes, and open a pull request.

Licence
This project is licensed under the terms described in LICENSE.md.