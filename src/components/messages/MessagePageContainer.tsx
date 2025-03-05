
import React from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/landing/Header";

interface MessagePageContainerProps {
  children: React.ReactNode;
}

export const MessagePageContainer: React.FC<MessagePageContainerProps> = ({ 
  children 
}) => {
  return (
    <>
      <Header />
      <main className="bg-[#f9f5ff] min-h-[calc(100vh-64px-80px)]">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[600px]">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
