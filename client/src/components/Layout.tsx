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
