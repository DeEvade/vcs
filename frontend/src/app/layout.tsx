// Assuming you're using the new App Directory structure in Next.js with TypeScript

import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
//import theme from '../theme'; // Adjust the import path to your theme configuration
import { PTTProvider } from "../contexts/PTTContext";
import { model } from "@/models/Model";
import theme from "./theme";

interface LayoutProps {
  children: ReactNode; // Explicitly typing the `children` prop
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <title>VCS Training</title>
      <meta property="og:image" content="favicon.ico" />
      <body>
        <PTTProvider>
          <ChakraProvider theme={theme}>{children}</ChakraProvider>
        </PTTProvider>
      </body>
    </html>
  );
}
