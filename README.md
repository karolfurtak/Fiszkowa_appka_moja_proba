# 10xCards

[![Project Status: In Development](https://img.shields.io/badge/status-in%20development-yellowgreen.svg)](https://github.com/karolfurtak/Fiszkowa_appka_moja_proba)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A modern web application designed to accelerate the creation of educational flashcards using AI. 10xCards helps students and learners leverage the power of spaced repetition without the tedious manual effort of card creation.

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

The primary goal of 10xCards is to solve a common problem for students, especially those in technical, linguistic, and medical fields: the time-consuming nature of creating high-quality flashcards. By automating this process, 10xCards lowers the barrier to entry for using spaced repetition, one of the most effective methods for long-term knowledge retention. Users can simply paste text, and the application's AI will generate a set of interactive, multiple-choice flashcards, organized into decks and ready for study.

## Tech Stack

The project is built with a modern, scalable, and efficient technology stack:

- **Frontend**:
  - [Astro](https://astro.build/)
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Shadcn/ui](https://ui.shadcn.com/)

- **Backend & Database**:
  - [Supabase](https://supabase.com/)

- **AI Model Communication**:
  - [OpenRouter.ai](https://openrouter.ai/)

- **CI/CD & Hosting**:
  - [GitHub Actions](https://github.com/features/actions)
  - [DigitalOcean](https://www.digitalocean.com/)

## Getting Started Locally

To set up and run this project on your local machine, follow these steps.

### Prerequisites

- **Node.js**: Version `24.11.1` is required. We recommend using a version manager like `nvm`.
  ```sh
  nvm use
  ```
- **npm**: Should be installed with Node.js.

### 1. Clone the Repository

```sh
git clone https://github.com/karolfurtak/Fiszkowa_appka_moja_proba.git
cd Fiszkowa_appka_moja_proba
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env` in the root of the project and add the following environment variables. You can get these keys from your respective service provider dashboards.

```
# Supabase
# Find these in your Supabase project settings
PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# OpenRouter.ai
# Your secret key for accessing AI models
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
```

### 4. Run the Development Server

Once the setup is complete, you can start the local development server:

```sh
npm run dev
```

The application should now be running at `http://localhost:4321`.

## Setup Instructions

For detailed installation and configuration instructions, including:
- How to install Supabase CLI
- How to run Supabase from the command line
- Database migration setup
- Troubleshooting common issues

Please refer to the [SETUP.md](SETUP.md) file.

## Available Scripts

The following scripts are available in the `package.json`:

- `npm run dev` or `npm start`: Starts the application in development mode.
- `npm run build`: Builds the application for production.
- `npm run preview`: Runs a local server to preview the production build.
- `npm run astro`: Provides access to the Astro CLI for various commands.

## Project Scope

### In Scope (MVP)
-   Web application with a desktop-first approach.
-   User registration and authentication (email/password).
-   AI-powered flashcard generation from pasted text.
-   Manual creation of flashcards.
-   Organization of flashcards into decks.
-   A simple spaced repetition algorithm for learning.
-   Ability to add images to flashcards via URL.

### Out of Scope (Post-MVP)
-   Dedicated mobile applications.
-   Application for ANBERNIC RG40XX V.
-   Importing content from files (e.g., PDF, DOCX).
-   Sharing decks between users.
-   Advanced text editor with rich formatting.
-   Uploading images from a local disk.
-   Integrations with other educational platforms.

## Project Status

This project is currently **in the MVP development phase**. Core features are being built and refined.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
