
# Market Intelligence War Room

A sophisticated, real-time, gamified web application that transforms market research into an engaging, competitive corporate war game.

## Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or later)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup and Installation

1.  **Clone the repository or download the files** into a new directory on your local machine.

2.  **Create an Environment File**:
    -   In the root directory of the project, create a new file named `.env`.
    -   Add your Google Gemini API key to this file. The project is configured to use the variable `VITE_API_KEY`.

    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    **Important**: Do not share this file or commit it to version control.

3.  **Install Dependencies**:
    -   Open your terminal in the project's root directory.
    -   Run the following command to install all the necessary packages defined in `package.json`:

    ```bash
    npm install
    ```

## Running the Application

Once the installation is complete, you can start the local development server:

```bash
npm run dev
```

This will start the Vite development server. It will print a URL in your terminal (usually `http://localhost:5173`). Open this URL in your web browser to view and interact with the application.

## Available Scripts

-   `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
-   `npm run build`: Compiles and bundles the application for production into the `dist` folder.
-   `npm run preview`: Serves the production build locally to preview it.
