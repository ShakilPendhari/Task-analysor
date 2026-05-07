# Task Tracker App

## Objective
This project is a high-performance task tracking application designed to help users efficiently manage, prioritize, and log their daily tasks. It is built to be fast, reliable, and accessible offline, ensuring productivity is maintained even in unstable network conditions.

## Tech Stack
- **Frontend:** React 19, Vite, Vanilla CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Networking:** Axios
- **PWA Capabilities:** vite-plugin-pwa (offline support, installability)

## Progressive Web App (PWA)
This project is configured as a PWA using `vite-plugin-pwa`. It supports offline access and installation.

- **To build the PWA:** Run `npm run build`.
- **To preview:** Run `npm run preview`.

Check your browser's "Application" tab in DevTools to see the Service Worker and Manifest status.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
