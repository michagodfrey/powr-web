// Provides the common layout structure for all pages
// Includes header and main content area with consistent styling
import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />
      <main className="pt-4">{children}</main>
    </div>
  );
};

export default Layout;
