export const CATEGORIES = {
  FOOD: {
    words: ["PIZZA", "BURGER", "PASTA", "SUSHI", "TACO", "SALAD", "STEAK", "RAMEN", "DONUT", "WAFFLE", "LASAGNA", "HOTDOG", "FRIES", "NACHOS", "KEBAB", "CURRY", "DIMSUM", "PAELLA", "FALAFEL", "RISOTTO"],
    hint: "Delicious things you can eat 🍕"
  },
  FRUITS: {
    words: ["APPLE", "BANANA", "ORANGE", "CHERRY", "MANGO", "GRAPE", "LEMON", "PEACH", "BERRY", "MELON", "KIWI", "PAPAYA", "GUAVA", "PLUM", "FIGS", "DATES", "COCONUT", "APRICOT", "LYCHEE", "DURIAN"],
    hint: "Sweet and healthy nature snacks 🍎"
  },
  ANIMALS: {
    words: ["TIGER", "LION", "ZEBRA", "PANDA", "KOALA", "EAGLE", "SHARK", "WHALE", "SNAKE", "HORSE", "GIRAFFE", "MONKEY", "RABBIT", "TURTLE", "DOLPHIN", "PARROT", "WOLF", "BEAR", "FOX", "DEER"],
    hint: "Wild creatures from around the world 🦁"
  },
  OBJECTS: {
    words: ["PHONE", "WATCH", "CHAIR", "TABLE", "GLASS", "BOTTLE", "CAMERA", "LAPTOP", "KEYBOARD", "MOUSE", "MIRROR", "WALLET", "PENCIL", "REMOTE", "PILLOW", "BLANKET", "HAMMER", "SCISSOR", "CANDLE", "CLOCK"],
    hint: "Common things you find in a room 🏠"
  },
  CITIES: {
    words: ["PARIS", "TOKYO", "LONDON", "DUBAI", "ROME", "BERLIN", "MADRID", "SEOUL", "CAIRO", "SYDNEY", "NEWYORK", "MOSCOW", "BEIJING", "MUMBAI", "TORONTO", "CHICAGO", "BANGKOK", "VIENNA", "ATHENS", "LISBON"],
    hint: "Famous places people love to visit ✈️"
  },
  COLORS: {
    words: ["RED", "BLUE", "GREEN", "YELLOW", "ORANGE", "PURPLE", "PINK", "BLACK", "WHITE", "BROWN", "CYAN", "MAGENTA", "SILVER", "GOLD", "INDIGO", "VIOLET", "AZURE", "BEIGE", "CRIMSON", "TEAL"],
    hint: "Things you see in a vibrant painting 🎨"
  },
  BEDROOM: {
    words: ["BED", "PILLOW", "SHEET", "LAMP", "DESK", "CHAIR", "RUG", "CLOSET", "MIRROR", "ALARM", "BOOK", "SHELF", "DRESSER", "CURTAIN", "PLANT", "POSTER", "PHONE", "LAPTOP", "FAN", "CLOCK"],
    hint: "Items you find in your bedroom 🛌"
  },
  TRAVEL: {
    words: ["PLANE", "TRAIN", "BUS", "SHIP", "CAR", "BIKE", "MAP", "PASSPORT", "TICKET", "HOTEL", "RESORT", "BEACH", "MOUNTAIN", "CITY", "FOREST", "ISLAND", "CAMERA", "BACKPACK", "GUIDE", "TOUR"],
    hint: "Things related to traveling the world ✈️"
  },
  SPORTS: {
    words: ["SOCCER", "TENNIS", "BOXING", "GOLF", "RUGBY", "HOCKEY", "SKATING", "SURFING", "KARATE", "CHESS", "CRICKET", "SQUASH", "FENCING", "SAILING", "DIVING", "CYCLING", "ARCHERY", "BOWLING", "ROWING", "DARTS"],
    hint: "Games that test skill and strength ⚽"
  },
  PLANETS: {
    words: ["MARS", "VENUS", "EARTH", "SATURN", "JUPITER", "URANUS", "NEPTUNE", "PLUTO", "MERCURY", "SUN", "MOON", "TITAN", "EUROPA", "IO", "CERES", "ERIS", "MAKEMAKE", "HAUMEA", "GANYMEDE", "CALLISTO"],
    hint: "Celestial bodies in our solar system 🪐"
  },
  KITCHEN: {
    words: ["KNIFE", "FORK", "SPOON", "PLATE", "OVEN", "STOVE", "FRIDGE", "MIXER", "TOAST", "PAN", "KETTLE", "GRATER", "WHISK", "POT", "BOWL", "CUP", "MUG", "TRAY", "SINK", "TIMER"],
    hint: "Common items you find in a kitchen 🍳"
  },
  EURO_PLAYERS: {
    words: ["MESSI", "MBAPPE", "HAALAND", "KROOS", "MODRIC", "KANE", "SALAH", "PEDRI", "BELLING", "SAKA", "RODRI", "FODEN", "WIRTZ", "MUSIALA", "YAMAL", "GAVI", "RICE", "PALMER", "LEWAN", "VINICIUS"],
    hint: "Famous football players in Europe ⚽"
  },
  BRANDS: {
    words: ["NIKE", "ADIDAS", "APPLE", "GOOGLE", "TESLA", "SONY", "ROLEX", "GUCCI", "PRADA", "ZARA", "PUMA", "SAMSUNG", "TOYOTA", "HONDA", "CANON", "DISNEY", "NETFLIX", "AMAZON", "COCA", "PEPSI"],
    hint: "Global brands everyone knows 🏷️"
  }
};

export const WORD_SEARCH_IMAGE = "https://imgs.crazygames.com/word-search-lyg_16x9/20240306053554/word-search-lyg_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop";
export const BATTLE_ROYALE_IMAGE = "https://imgs.crazygames.com/battle-royale-survival_16x9/20231124031245/battle-royale-survival_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop";

export const GRID_SIZE = 10;

export interface Player {
  username: string;
  points: number;
  wordsFound: number;
  joinTime: number; // timestamp
  foundWordsList?: { word: string; time: number }[];
  avatar?: string;
  color?: string;
  badges?: { type: string; text: string; active: boolean }[];
}

export interface FoundWord {
  word: string;
  player: string;
  cells: { r: number; c: number }[];
  color: string;
}

export const BG_MUSIC_TRACKS = [
  { id: 1, name: "Victory Lap", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
  { id: 2, name: "Cyber Chase", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  { id: 3, name: "Neon Runner", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
  { id: 4, name: "Power Up", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
  { id: 5, name: "Final Boss", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { id: 6, name: "Speed Demon", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
  { id: 7, name: "Hyper Drive", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" },
  { id: 8, name: "Level Up", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3" },
  { id: 9, name: "Boss Fight", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 10, name: "Game Over", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
];

export const SFX = {
  WORD_FOUND: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  LEVEL_COMPLETE: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
};
