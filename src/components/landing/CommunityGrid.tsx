
import React from "react";
import { UserProfile } from "./UserProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CommunityGrid: React.FC = () => {
  // Dans un premier temps, on utilise des profils fictifs
  const staticProfiles = [
    // Ligne 1 - Femmes
    {
      image: "https://i.pravatar.cc/150?img=1",
      name: "Sophie",
      age: 28,
      location: "Paris, France",
      gender: "female",
      messages: 245
    },
    {
      image: "https://i.pravatar.cc/150?img=5",
      name: "Emma",
      age: 24,
      location: "Lyon, France",
      gender: "female",
      messages: 198
    },
    {
      image: "https://i.pravatar.cc/150?img=9",
      name: "Clara",
      age: 31,
      location: "Bordeaux, France",
      gender: "female",
      messages: 167
    },
    {
      image: "https://i.pravatar.cc/150?img=13",
      name: "Thomas",
      age: 29,
      location: "Marseille, France",
      gender: "male",
      messages: 156
    },
    {
      image: "https://i.pravatar.cc/150?img=17",
      name: "Lucas",
      age: 27,
      location: "Toulouse, France",
      gender: "male",
      messages: 143
    },
    {
      image: "https://i.pravatar.cc/150?img=21",
      name: "Léa",
      age: 26,
      location: "Nice, France",
      gender: "female",
      messages: 134
    },
    {
      image: "https://i.pravatar.cc/150?img=25",
      name: "Hugo",
      age: 32,
      location: "Nantes, France",
      gender: "male",
      messages: 129
    },
    // Ligne 2
    {
      image: "https://i.pravatar.cc/150?img=29",
      name: "Marie",
      age: 25,
      location: "Lille, France",
      gender: "female",
      messages: 123
    },
    {
      image: "https://i.pravatar.cc/150?img=33",
      name: "Antoine",
      age: 30,
      location: "Strasbourg, France",
      gender: "male",
      messages: 118
    },
    {
      image: "https://i.pravatar.cc/150?img=37",
      name: "Julie",
      age: 28,
      location: "Rennes, France",
      gender: "female",
      messages: 112
    },
    {
      image: "https://i.pravatar.cc/150?img=41",
      name: "Nicolas",
      age: 33,
      location: "Montpellier, France",
      gender: "male",
      messages: 108
    },
    {
      image: "https://i.pravatar.cc/150?img=45",
      name: "Camille",
      age: 27,
      location: "Grenoble, France",
      gender: "female",
      messages: 103
    },
    {
      image: "https://i.pravatar.cc/150?img=49",
      name: "Pierre",
      age: 31,
      location: "Dijon, France",
      gender: "male",
      messages: 98
    },
    {
      image: "https://i.pravatar.cc/150?img=53",
      name: "Sarah",
      age: 29,
      location: "Angers, France",
      gender: "female",
      messages: 95
    },
    // Ligne 3
    {
      image: "https://i.pravatar.cc/150?img=57",
      name: "Maxime",
      age: 28,
      location: "Le Mans, France",
      gender: "male",
      messages: 92
    },
    {
      image: "https://i.pravatar.cc/150?img=61",
      name: "Charlotte",
      age: 26,
      location: "Reims, France",
      gender: "female",
      messages: 89
    },
    {
      image: "https://i.pravatar.cc/150?img=65",
      name: "Alexandre",
      age: 32,
      location: "Metz, France",
      gender: "male",
      messages: 86
    },
    {
      image: "https://i.pravatar.cc/150?img=69",
      name: "Laura",
      age: 25,
      location: "Tours, France",
      gender: "female",
      messages: 83
    },
    {
      image: "https://i.pravatar.cc/150?img=73",
      name: "Gabriel",
      age: 30,
      location: "Caen, France",
      gender: "male",
      messages: 81
    },
    {
      image: "https://i.pravatar.cc/150?img=77",
      name: "Marine",
      age: 27,
      location: "Orléans, France",
      gender: "female",
      messages: 78
    },
    {
      image: "https://i.pravatar.cc/150?img=81",
      name: "Paul",
      age: 29,
      location: "Rouen, France",
      gender: "male",
      messages: 75
    }
  ];

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:max-w-full max-md:px-5">
      <div className="self-center flex flex-col items-center max-md:max-w-full">
        <h2 className="text-[#6153BD] text-5xl font-black max-md:max-w-full max-md:text-[40px]">
          Join a large community
        </h2>
        <p className="text-[#FF6A48] text-xl font-bold">
          Already {staticProfiles.length} active members!
        </p>
      </div>
      <div className="flex w-full flex-col items-stretch text-black justify-center mt-20 max-md:max-w-full max-md:mt-10">
        <div className="grid grid-cols-7 gap-8 max-md:grid-cols-2 max-sm:grid-cols-1">
          {staticProfiles.map((profile, index) => (
            <UserProfile
              key={index}
              image={profile.image}
              name={profile.name}
              age={profile.age}
              location={profile.location}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
