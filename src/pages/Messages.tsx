
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";

export const Messages = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">Messages</h1>
            <p>Coming soon...</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
