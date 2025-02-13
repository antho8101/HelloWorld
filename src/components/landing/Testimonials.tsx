
import React from "react";
import { Star } from "lucide-react";

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marie",
      country: "France",
      text: "Thanks to HelloWorld!, I was able to improve my Japanese by chatting with Yuki. We've become true friends!",
      stars: 5,
      languages: "French ↔️ Japanese"
    },
    {
      name: "Carlos",
      country: "Brazil",
      text: "An incredible experience! I learned German much faster than with traditional courses.",
      stars: 5,
      languages: "Portuguese ↔️ German"
    },
    {
      name: "Sarah",
      country: "Australia",
      text: "The best way to learn a language and discover new cultures. I recommend it 100%!",
      stars: 5,
      languages: "English ↔️ Spanish"
    }
  ];

  return (
    <section className="bg-[rgba(255,243,240,1)] py-20 px-[220px] max-md:px-5">
      <h2 className="text-[#6153BD] text-5xl font-black text-center mb-16 max-md:text-[40px]">
        What Our Users Say
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
