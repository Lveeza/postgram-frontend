# Postgram Frontend — README.md

---

## Overview

**Postgram Frontend** is the user interface for **Postgram**, a full-stack social media portfolio application. Built with **React**, **Vite**, and styled with modern utility classes, this interface communicates with the Laravel backend API to provide a seamless social networking experience featuring authentication, real-time-like post feeds, comments, likes, and profile management.

---

## Tech Stack & Tools

- **Core Framework:** React (with Vite for fast bundling and HMR)
- **Styling:** Tailwind CSS
- **State Management & Data Fetching:** Axios / Context API
- **Icons & UI Utilities:** Lucide React (or equivalent modern icon library)
- **Linting:** Oxlint / ESLint

---

## Key Features

- **User Authentication:** Secure login and registration with token-based authentication (Laravel Sanctum).
- **Interactive Feed:** View, create, like, and comment on posts seamlessly.
- **Media Uploads:** Support for image attachments optimized for post creation.
- **Responsive Design:** Mobile-first, fully responsive layout styled with Tailwind CSS.
- **Optimized Build:** Powered by Vite for lightning-fast HMR and optimized production builds.

---

## Project Structure

```text
postgram-frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons, and global styles
│   ├── components/     # Reusable UI components (Navbar, PostCard, Modal, etc.)
│   ├── context/        # Authentication & global state contexts
│   ├── pages/          # View components (Home, Login, Register, Profile)
│   ├── services/       # API integration layer (Axios configuration)
│   ├── App.jsx         # Root component & routing setup
│   └── main.jsx        # Application entry point
├── .env                # Environment variables
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration

```

---

## Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) and **npm** installed on your machine.

### Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/postgram-frontend.git
cd postgram-frontend

```

2. **Install dependencies:**

```bash
npm install

```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and point it to your backend API:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api

```

4. **Run the Development Server:**

```bash
npm run dev

```

Open your browser and navigate to `http://localhost:5173`.

---

## Available Scripts

- `npm run dev` — Starts the Vite development server with HMR.
- `npm run build` — Bundles the application for production into the `dist` folder.
- `npm run lint` — Runs Oxlint/ESLint to check for code quality issues.
- `npm run preview` — Locally preview the production build.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/your-username/postgram-frontend/issues).

---

## License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
