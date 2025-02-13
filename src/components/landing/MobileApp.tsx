import React from "react";

export const MobileApp: React.FC = () => {
  return (
    <div className="bg-[rgba(255,243,240,1)] flex w-full items-center gap-[40px_80px] justify-center flex-wrap py-10 max-md:max-w-full">
      <div className="self-stretch flex min-w-60 flex-col items-stretch w-[519px] my-auto max-md:max-w-full">
        <div className="w-full text-[#6153BD] max-md:max-w-full">
          <h2 className="text-5xl font-black max-md:max-w-full max-md:text-[40px]">
            Available on mobile!
          </h2>
          <p className="text-2xl font-bold mt-5 max-md:max-w-full">
            Download the HelloWorld! application for full functionality!
          </p>
          <p className="text-[#FF6A48] text-base font-medium mt-5 max-md:max-w-full">
            Use our geolocation features to sign everyone in when you're
            visiting somewhere, and meet other users in real life!
          </p>
        </div>
        <div className="flex gap-[40px_45px] mt-[60px] max-md:mt-10">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/e1233f73e0767232cf4449a3ac79e34be8760c9c96cabadefed62a70ef92d8d1?placeholderIfAbsent=true"
            className="aspect-[3.36] object-contain w-[191px] shrink-0"
            alt="Download on the App Store"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/8303c9adc4aa022ec378a8ffa90c0c56ef54f4187ce2c94cae5b7c30a9e397b4?placeholderIfAbsent=true"
            className="aspect-[2.99] object-contain w-[170px] fill-black stroke-[1.415px] stroke-[#A6A6A6] shrink-0"
            alt="Get it on Google Play"
          />
        </div>
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/15213543995800ab5779faa256cfb40c6fa851510125a88fc447c7f81af1678c?placeholderIfAbsent=true"
        className="aspect-[1] object-contain w-[550px] self-stretch min-w-60 my-auto max-md:max-w-full"
        alt="Mobile app showcase"
      />
    </div>
  );
};
