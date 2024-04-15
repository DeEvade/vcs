# VCS - Voice Communication System

This is a Next.js project using React, Typescript and Chakra UI as a basic component library.

The app is split into different components under the src/components directory. The top level file is src/app/page.tsx, which renders a "Header", "FrequenciesGrid", "Rolesgrid" and a "Footer".

## Prerequisites

-   **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
-   **Node Version Manager (nvm)**: Helps to manage and switch between multiple Node.js versions easily. Install nvm by following the instructions on [nvm GitHub repository](https://github.com/nvm-sh/nvm).

-   **Node.js**: Version 18.x is required for this project.

## Getting started

1.  **Clone the repository and move into the folder:**

    ```bash
    git clone <repository-url>
    cd vcs
    ```

2.  **Install Node.js using nvm and use Node version 18**

    ```bash
    nvm install 18
    nvm use 18
    ```

3.  **Install dependencies from package.json:**

    ```bash
    npm install
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

    > You can start editing the page by modifying `src/app/page.tsx` or any component. The page auto-updates as you edit the file.

## Auto format on save

To ensure code consistency, a .prettierrc file is included. To set up VS Code to automatically format on save using these settings:

1. Install the Prettier - Code formatter extension in VS Code.
2. Open VS Code settings (JSON) by pressing Ctrl+Shift+P or Cmd+Shift+P, then typing Preferences: Open Workspace Settings (JSON).
3. Add the following to the JSON file:

```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "[javascript]": {
        "editor.formatOnSave": true
    },
    "[typescript]": {
        "editor.formatOnSave": true
    },
    "[javascriptreact]": {
        "editor.formatOnSave": true
    },
    "[typescriptreact]": {
        "editor.formatOnSave": true
    }
}
```

4. Now, whenever you save a file, Prettier will format it according to the rules specified in .prettierrc.

## Learn More about Next and React

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
-   [About React contexts for component information sharing](https://react.dev/learn/passing-data-deeply-with-context) - Information about React context used e.g. for the "push to talk" state.
