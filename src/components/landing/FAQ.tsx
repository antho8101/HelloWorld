
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
      question: "How does language exchange work?",
      answer: "The principle is simple: you help someone learn your native language, and in return, they help you learn theirs. It's a mutual and enriching exchange!"
    },
    {
      question: "Is it really 100% free?",
      answer: "Yes! HelloWorld! is and will always be 100% free, with no ads or premium features. We believe language learning and cultural exchange should be accessible to everyone."
    },
    {
      question: "What level do I need to start?",
      answer: "No minimum level required! Whether you're a beginner or advanced, you'll find partners suited to your level. The important thing is being motivated to learn and share."
    },
    {
      question: "How is my personal data protected?",
      answer: "Your data protection is our priority. We use end-to-end encryption for your messages and never share your personal information with third parties."
    },
    {
      question: "Can I practice multiple languages at once?",
      answer: "Absolutely! You can learn as many languages as you want and communicate with native speakers from different countries."
    }
  ];

  return (
    <section className="py-20 px-[220px] max-md:px-5">
      <h2 className="text-[#6153BD] text-5xl font-black text-center mb-16 max-md:text-[40px]">
        Frequently Asked Questions
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
