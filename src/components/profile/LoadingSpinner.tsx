
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";

export const LoadingSpinner = () => {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
      </div>
      <Footer />
    </>
  );
};
