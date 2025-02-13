
import React from "react";
import { ArrowRight, Globe, MessageSquare, Users } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Globe className="w-12 h-12 text-[#6153BD]" />,
      title: "Rejoignez la communauté mondiale",
      description: "Créez votre profil gratuitement et indiquez les langues que vous parlez et celles que vous souhaitez apprendre."
    },
    {
      icon: <Users className="w-12 h-12 text-[#6153BD]" />,
      title: "Trouvez des correspondants",
      description: "Découvrez des personnes du monde entier qui parlent la langue que vous voulez apprendre et qui souhaitent apprendre votre langue."
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-[#6153BD]" />,
      title: "Commencez à échanger",
      description: "Commencez à discuter, pratiquez votre langue cible, partagez votre culture et créez des liens durables."
    }
  ];

  return (
    <section className="py-20 px-[220px] max-md:px-5">
      <h2 className="text-[#6153BD] text-5xl font-black text-center mb-16 max-md:text-[40px]">
        Comment ça marche ?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-6">{step.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
            {index < steps.length - 1 && (
              <ArrowRight className="hidden md:block w-8 h-8 text-[#6153BD] absolute transform translate-x-[200px] translate-y-[50px]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
