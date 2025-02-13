import React from "react";
import { UserProfile } from "./UserProfile";

export const CommunityGrid: React.FC = () => {
  const profiles = [
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/230e3c3d2ce5ed39703b4b55fed6ab3220b2b5b2f628d9f76b5aad2e718bcb90",
      name: "Dmitry",
      age: 34,
      location: "Minsk, Belarus",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/15f50657f144c91c7e09b0efaa7450296e25906ec5c89533470e41af8996d1a0",
      name: "Anna",
      age: 22,
      location: "Moscow, Russia",
    },
    // Add all other profiles here...
  ];

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:max-w-full max-md:px-5">
      <div className="self-center flex flex-col items-center max-md:max-w-full">
        <h2 className="text-[#6153BD] text-5xl font-black max-md:max-w-full max-md:text-[40px]">
          Join a large community
        </h2>
        <p className="text-[#FF6A48] text-xl font-bold">
          Already 3,485 members!
        </p>
      </div>
      <div className="flex w-full flex-col items-stretch text-black justify-center mt-20 max-md:max-w-full max-md:mt-10">
        <div className="flex w-full items-center gap-[39px] justify-between flex-wrap max-md:max-w-full">
          {profiles.map((profile, index) => (
            <UserProfile key={index} {...profile} />
          ))}
        </div>
      </div>
    </section>
  );
};
