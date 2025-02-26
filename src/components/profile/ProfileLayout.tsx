
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-[1fr,300px] gap-6">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};
