
import React from "react";

export const CallToAction: React.FC = () => {
  return (
    <section className="px-[220px] max-md:px-5 mb-20">
      <div className="bg-[rgba(97,83,189,1)] flex w-full items-center gap-[40px_140px] justify-center flex-wrap mt-20 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-[3px] max-md:max-w-full max-md:mt-10 px-20 max-md:px-5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fa78890f77678498985bba2bba540ba5460da0e17102982364bee57f609356e6?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-[322px] self-stretch min-w-60 my-auto"
          alt="Join community illustration"
        />
        <div className="self-stretch flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto max-md:max-w-full">
          <h2 className="text-white text-5xl font-black max-md:max-w-full max-md:text-[40px]">
            So what are you waiting for? Join the community!
          </h2>
          <button className="bg-[rgba(254,207,196,1)] gap-2.5 text-base text-[#FF6A48] font-bold mt-10 px-5 py-2.5 rounded-[10px] border-[rgba(255,106,72,1)] border-solid border-2 w-fit transform transition-all duration-300 hover:scale-105 hover:shadow-md">
            Join the community
          </button>
        </div>
      </div>
    </section>
  );
};
