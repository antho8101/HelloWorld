
export interface Profile {
  id?: string;  // Add ID property
  image: string;
  name: string;
  age: number;
  location: string;
  gender: "male" | "female";
  messages: number;
  isOnline: boolean;
}

export const staticProfiles: Profile[] = [
  {
    id: "1",
    image: "https://i.pravatar.cc/150?img=1",
    name: "Sophie",
    age: 28,
    location: "Paris, France",
    gender: "female",
    messages: 245,
    isOnline: true
  },
  {
    id: "2",
    image: "https://i.pravatar.cc/150?img=5",
    name: "Emma",
    age: 24,
    location: "Lyon, France",
    gender: "female",
    messages: 198,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=9",
    name: "Clara",
    age: 31,
    location: "Bordeaux, France",
    gender: "female",
    messages: 167,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=13",
    name: "Thomas",
    age: 29,
    location: "Marseille, France",
    gender: "male",
    messages: 156,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=17",
    name: "Lucas",
    age: 27,
    location: "Toulouse, France",
    gender: "male",
    messages: 143,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=21",
    name: "Léa",
    age: 26,
    location: "Nice, France",
    gender: "female",
    messages: 134,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=25",
    name: "Hugo",
    age: 32,
    location: "Nantes, France",
    gender: "male",
    messages: 129,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=29",
    name: "Marie",
    age: 25,
    location: "Lille, France",
    gender: "female",
    messages: 123,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=33",
    name: "Antoine",
    age: 30,
    location: "Strasbourg, France",
    gender: "male",
    messages: 118,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=37",
    name: "Julie",
    age: 28,
    location: "Rennes, France",
    gender: "female",
    messages: 112,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=41",
    name: "Nicolas",
    age: 33,
    location: "Montpellier, France",
    gender: "male",
    messages: 108,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=45",
    name: "Camille",
    age: 27,
    location: "Grenoble, France",
    gender: "female",
    messages: 103,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=49",
    name: "Pierre",
    age: 31,
    location: "Dijon, France",
    gender: "male",
    messages: 98,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=53",
    name: "Sarah",
    age: 29,
    location: "Angers, France",
    gender: "female",
    messages: 95,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=57",
    name: "Maxime",
    age: 28,
    location: "Le Mans, France",
    gender: "male",
    messages: 92,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=61",
    name: "Charlotte",
    age: 26,
    location: "Reims, France",
    gender: "female",
    messages: 89,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=65",
    name: "Alexandre",
    age: 32,
    location: "Metz, France",
    gender: "male",
    messages: 86,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=69",
    name: "Laura",
    age: 25,
    location: "Tours, France",
    gender: "female",
    messages: 83,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=73",
    name: "Gabriel",
    age: 30,
    location: "Caen, France",
    gender: "male",
    messages: 81,
    isOnline: true
  },
  {
    image: "https://i.pravatar.cc/150?img=77",
    name: "Marine",
    age: 27,
    location: "Orléans, France",
    gender: "female",
    messages: 78,
    isOnline: false
  },
  {
    image: "https://i.pravatar.cc/150?img=81",
    name: "Paul",
    age: 29,
    location: "Rouen, France",
    gender: "male",
    messages: 75,
    isOnline: true
  }
];

