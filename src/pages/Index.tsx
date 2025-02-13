
import React from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturesBanner } from "@/components/landing/FeaturesBanner";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CommunityTitle } from "@/components/landing/CommunityTitle";
import { CommunityGrid } from "@/components/landing/CommunityGrid";
import { ProfilesGrid } from "@/components/landing/ProfilesGrid";
import { LanguagesAvailable } from "@/components/landing/LanguagesAvailable";
import { MobileApp } from "@/components/landing/MobileApp";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  return (
    <div className="bg-[rgba(255,243,240,1)]">
      <Header />
      <Hero />
      <FeaturesBanner />
      <HowItWorks />
      <CommunityTitle memberCount={0} />
      <CommunityGrid />
      <ProfilesGrid onProfileClick={handleProfileClick} />
      <LanguagesAvailable />
      <MobileApp />
      <Testimonials />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
