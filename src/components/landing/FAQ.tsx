
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
      question: "What can I do on HelloWorld!?",
      answer: "HelloWorld! offers multiple ways to connect: practice languages with native speakers, make new friends worldwide, exchange postcards and gifts, or even find romance! You choose how you want to interact based on your interests."
    },
    {
      question: "Is it really free to use?",
      answer: "Yes! HelloWorld! is free to use with no ads or premium features. We run annual fundraising campaigns (1-2 times per year) where we kindly ask users to contribute at least $1 to help maintain the platform, but this is completely optional and doesn't affect your access to features."
    },
    {
      question: "What if I'm not fluent in any foreign language?",
      answer: "That's perfectly fine! While many users are here to practice languages, you can also connect based on shared interests, friendship, or cultural exchange. The important thing is being open to meeting people from different cultures."
    },
    {
      question: "How is my personal data protected?",
      answer: "Your data protection is our priority. We use end-to-end encryption for your messages and never share your personal information with third parties."
    },
    {
      question: "How do I find people with similar interests?",
      answer: "When creating your profile, you can specify your interests and what you're looking for (language practice, friendship, cultural exchange, or romance). Our matching system will help you find people who share your interests and goals."
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
