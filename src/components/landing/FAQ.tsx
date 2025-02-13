
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Comment fonctionne l'échange linguistique ?",
      answer: "Le principe est simple : vous aidez quelqu'un à apprendre votre langue maternelle, et en échange, cette personne vous aide à apprendre la sienne. C'est un échange mutuel et enrichissant !"
    },
    {
      question: "Est-ce vraiment 100% gratuit ?",
      answer: "Oui ! HelloWorld! est et restera toujours 100% gratuit, sans publicités ni fonctionnalités premium. Nous croyons que l'apprentissage des langues et l'échange culturel doivent être accessibles à tous."
    },
    {
      question: "Quel est le niveau requis pour commencer ?",
      answer: "Aucun niveau minimum n'est requis ! Que vous soyez débutant ou avancé, vous trouverez des partenaires adaptés à votre niveau. L'important est d'être motivé pour apprendre et partager."
    },
    {
      question: "Comment sont protégées mes données personnelles ?",
      answer: "La protection de vos données est notre priorité. Nous utilisons un cryptage de bout en bout pour vos messages et ne partageons jamais vos informations personnelles avec des tiers."
    },
    {
      question: "Puis-je pratiquer plusieurs langues en même temps ?",
      answer: "Absolument ! Vous pouvez apprendre autant de langues que vous le souhaitez et communiquer avec des locuteurs natifs de différents pays."
    }
  ];

  return (
    <section className="py-20 px-[220px] max-md:px-5">
      <h2 className="text-[#6153BD] text-5xl font-black text-center mb-16 max-md:text-[40px]">
        Questions fréquentes
      </h2>
      <Accordion type="single" collapsible className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-bold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
