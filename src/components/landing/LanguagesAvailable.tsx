
import React from "react";
import { Globe } from "lucide-react";

export const LanguagesAvailable: React.FC = () => {
  // Liste non exhaustive des langues les plus parlées
  const popularLanguages = [
    "English", "Español", "Français", "Deutsch", "日本語", 
    "한국어", "中文", "العربية", "Português", "Italiano",
    "Русский", "हिन्दी", "Türkçe", "Nederlands", "Polski"
  ];

  return (
    <section className="bg-[rgba(255,243,240,1)] py-20 px-[220px] max-md:px-5">
      <div className="text-center mb-16">
        <h2 className="text-[#6153BD] text-5xl font-black mb-6 max-md:text-[40px]">
          Toutes les langues du monde
        </h2>
        <div className="flex items-center justify-center gap-4 mb-8">
          <Globe className="w-8 h-8 text-[#6153BD]" />
          <p className="text-xl font-bold text-gray-600">
            Des utilisateurs du monde entier prêts à échanger avec vous
          </p>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Que vous souhaitiez apprendre une langue très répandue ou une langue plus rare,
          vous trouverez forcément des locuteurs natifs prêts à vous aider dans votre apprentissage.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {popularLanguages.map((language, index) => (
          <div
            key={index}
            className="bg-white px-6 py-3 rounded-full shadow-sm border-2 border-[#6153BD] text-[#6153BD] font-bold"
          >
            {language}
          </div>
        ))}
        <div className="bg-[#6153BD] px-6 py-3 rounded-full shadow-sm text-white font-bold">
          Et bien d'autres...
        </div>
      </div>
    </section>
  );
};
