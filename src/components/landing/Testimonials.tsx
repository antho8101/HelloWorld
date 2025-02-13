
import React from "react";
import { Star } from "lucide-react";

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marie",
      country: "France",
      text: "Grâce à HelloWorld!, j'ai pu améliorer mon japonais en discutant avec Yuki. Nous sommes devenues de vraies amies !",
      stars: 5,
      languages: "Français ↔️ Japonais"
    },
    {
      name: "Carlos",
      country: "Brésil",
      text: "Une expérience incroyable ! J'ai appris l'allemand beaucoup plus rapidement qu'avec des cours traditionnels.",
      stars: 5,
      languages: "Portugais ↔️ Allemand"
    },
    {
      name: "Sarah",
      country: "Australie",
      text: "La meilleure façon d'apprendre une langue et de découvrir de nouvelles cultures. Je recommande à 100% !",
      stars: 5,
      languages: "Anglais ↔️ Espagnol"
    }
  ];

  return (
    <section className="bg-[rgba(255,243,240,1)] py-20 px-[220px] max-md:px-5">
      <h2 className="text-[#6153BD] text-5xl font-black text-center mb-16 max-md:text-[40px]">
        Ce qu'en pensent nos utilisateurs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              {[...Array(testimonial.stars)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FF6A48] text-[#FF6A48]" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">{testimonial.text}</p>
            <div className="flex flex-col">
              <span className="font-bold">{testimonial.name}</span>
              <span className="text-sm text-gray-500">{testimonial.country}</span>
              <span className="text-sm text-[#6153BD] mt-2">{testimonial.languages}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
