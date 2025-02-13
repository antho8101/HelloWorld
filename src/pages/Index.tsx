
import React from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturesBanner } from "@/components/landing/FeaturesBanner";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { LanguagesAvailable } from "@/components/landing/LanguagesAvailable";
import { FAQ } from "@/components/landing/FAQ";
import { CommunityGrid } from "@/components/landing/CommunityGrid";
import { CallToAction } from "@/components/landing/CallToAction";
import { MobileApp } from "@/components/landing/MobileApp";

const Index = () => {
  return (
    <main className="min-h-screen">
      <div className="bg-[rgba(255,243,240,1)] flex w-full flex-col items-stretch p-5 max-md:max-w-full">
        <Header />
        <Hero />
      </div>
      <FeaturesBanner />
      <CommunityGrid />
      <LanguagesAvailable />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CallToAction />
      <MobileApp />
    </main>
  );
};

export default Index;
