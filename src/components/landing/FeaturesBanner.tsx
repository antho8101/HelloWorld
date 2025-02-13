import React from "react";

export const FeaturesBanner: React.FC = () => {
  const features = [
    "Learn languages",
    "Find correspondents",
    "Meet friends for your travels",
    "All nationalities in one place",
    "100% Free",
  ];

  return (
    <div className="bg-[rgba(97,83,189,1)] flex w-full items-center gap-10 text-base text-white font-medium justify-center flex-wrap px-5 py-2.5 max-md:max-w-full">
      {features.map((feature, index) => (
        <div
          key={index}
          className="self-stretch flex min-h-[22px] items-center gap-2.5 justify-center my-auto"
        >
          <div className="self-stretch my-auto">{feature}</div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/76c077487fa25ad8a965e9acd12650509a2a9e38ff04b84f5fd9322b3d864ecd?placeholderIfAbsent=true"
            className="aspect-[1] object-contain w-[21px] self-stretch shrink-0 my-auto"
            alt=""
          />
        </div>
      ))}
    </div>
  );
};
