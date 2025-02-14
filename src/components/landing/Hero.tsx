
import React from "react";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="self-center flex w-[1290px] max-w-full items-center gap-[40px_140px] flex-wrap py-10">
      <div className="self-stretch flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto max-md:max-w-full">
        <div className="w-full text-[#6153BD] max-md:max-w-full">
          <h1 className="text-[64px] font-black max-md:max-w-full max-md:text-[40px]">
            Make friends all over the world!
          </h1>
          <p className="text-2xl font-bold mt-5 max-md:max-w-full">
            100% free and ad-free | Chat with penpals from all over the world,
            learn and improve your foreign languages by exchanging with native
            speakers from other countries.
          </p>
        </div>
        <div className="flex gap-5 text-base font-bold mt-[60px] max-md:mt-10">
          <button 
            onClick={() => navigate("/auth", { state: { mode: 'signup' } })}
            className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)]"
          >
            <span className="self-stretch my-auto">
              Get started, it's free!
            </span>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/7d78f96c3ce4ab978c40c9b5511a8a4b0dfa3dccd81b91a6c1676cf268303c66?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-[21px] self-stretch shrink-0 my-auto"
              alt=""
            />
          </button>
          <button 
            onClick={() => navigate("/auth")}
            className="self-stretch bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white"
          >
            Login
          </button>
        </div>
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/823f5d3be2c760b994db89a5c501425a5ab7293c9ce74d29d7ac3b2ac9e2f80d?placeholderIfAbsent=true"
        className="aspect-[1] object-contain w-[550px] self-stretch min-w-60 my-auto max-md:max-w-full"
        alt="Friends connecting worldwide illustration"
      />
    </section>
  );
};
