# Admin Erp Frontend

A modern, fast, and feature-rich React frontend application for managing an organisation. This project is built using React 19, Vite, TypeScript, and features a robust stack for styling, state management, and API integration.

## 🚀 Tech Stack

- **Core:** [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [PrimeReact](https://primereact.org/) for pre-built UI components
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Global State) & [TanStack React Query](https://tanstack.com/query/latest) (Server State/API Data)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Form Handling & Validation:** [React Hook Form](https://react-hook-form.com/) with [Joi](https://joi.dev/) validation
- **Animations:** [Motion (Framer Motion)](https://motion.dev/)
- **Charting:** [Chart.js](https://www.chartjs.org/)

## 📂 Project Structure

The project follows a feature-based architecture to keep code modular and scalable:

```
src/
├── assets/         # Static assets (images, fonts, global icons)
├── config/         # Application-wide configurations and constants
├── features/       # Feature-specific modules (each contains its own pages, components, etc.)
│   ├── home/       # Home/Dashboard functionality
│   ├── hrms/       # Human Resource Management System
│   ├── master/     # Master data management
│   ├── settings/   # Application and user settings
│   └── students/   # Student management system
├── services/       # API services and global utilities
├── shared/         # Shared/reusable components, hooks, and utilities across features
└── types/          # Global TypeScript type definitions
```

## 🛠 Prerequisites

Make sure you have the following installed on your machine:

- **Node.js**: v20 or higher (Docker uses v24)
- **npm** (comes with Node.js)

## 🏃 Getting Started

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd ums-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173` (or the port specified by Vite).

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Type-checks the TypeScript code and builds the app for production.
- `npm run build-local`: Similar to build, but uses the local environment configuration.
- `npm run preview`: Bootstraps a local web server to preview the production build.
- `npm run lint`: Runs ESLint to find and fix problems in your code.
- `npm run type-check`: Runs TypeScript compiler to verify typings without emitting files.

## 🐳 Docker Support

The project includes Docker configuration for easy deployment and containerized development.

### Running with Docker Compose

Start the application using Docker Compose:

```bash
docker compose up --build
```

The application will be available at `http://localhost:5200`.

### Building and Running Docker Image Manually

1. Build the image:

   ```bash
   docker build -t ums-frontend .
   ```

   _(Note: Use `--platform=linux/amd64` if building on an ARM machine like Mac M1/M2 for an AMD64 cloud provider.)_

2. Run the container:
   ```bash
   docker run -p 5200:5200 ums-frontend
   ```

## 🧹 Code Quality

- **ESLint** & **Prettier**: Configured to ensure consistent code styling and catch issues early.
- **Husky** & **lint-staged**: Pre-commit hooks are set up to run Prettier and format fi
