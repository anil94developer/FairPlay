import React from "react";
import Mac88 from "../../assets/images/provider_img/mac88.webp";
import Mac88Virtual from "../../assets/images/provider_img/mac88-virtual.webp";
import FunGames from "../../assets/images/provider_img/fun-games.webp";
import Evolution from "../../assets/images/provider_img/evolution-gaming.webp";
import Spribe from "../../assets/images/provider_img/spribe.webp";
import Turbo from "../../assets/images/provider_img/turbo-games.webp";
import Smartsoft from "../../assets/images/provider_img/smartsoft.webp";
import Ezugi from "../../assets/images/provider_img/ezugi.webp";
import Jili from "../../assets/images/provider_img/Jili.webp";
import AeSexy from "../../assets/images/provider_img/sexy.webp";
import Playtech from "../../assets/images/provider_img/playtech.webp";
import Betsoft from "../../assets/images/provider_img/betsoft.webp";
import Gamzix from "../../assets/images/provider_img/gamzix.webp";
import BetGames from "../../assets/images/provider_img/betgamestv.webp";
import MacExcite from "../../assets/images/provider_img/mac_excite.webp";
import Live88 from "../../assets/images/provider_img/live88.webp";
import King from "../../assets/images/provider_img/kingmaker.webp";
import RG from "../../assets/images/provider_img/royal-gaming.webp";

import { ReactComponent as CricketIcon } from "../../assets/images/sidebar/cricket.svg?react";
import { ReactComponent as FootballIcon } from "../../assets/images/sidebar/football.svg?react";
import { ReactComponent as TennisIcon } from "../../assets/images/sidebar/tennis.svg?react";
import { ReactComponent as KabaddiIcon } from "../../assets/images/sidebar/kabaddi.svg?react";
import { ReactComponent as BasketballIcon } from "../../assets/images/sidebar/basketball.svg?react";
import { ReactComponent as BaseballIcon } from "../../assets/images/sidebar/baseball.svg?react";
import { ReactComponent as GreyhoundIcon } from "../../assets/images/sidebar/grey_hound.svg?react";
import { ReactComponent as HorseRaceIcon } from "../../assets/images/sidebar/horse_racing.svg?react";
import { ReactComponent as VolleyballIcon } from "../../assets/images/sidebar/volleyball.svg?react";
import { ReactComponent as DartsIcon } from "../../assets/images/sidebar/darts.svg?react";
import { ReactComponent as FutsalIcon } from "../../assets/images/sidebar/futsal.svg?react";
import { ReactComponent as TableTennisIcon } from "../../assets/images/sidebar/table_tennis.svg?react";
import { ReactComponent as BinaryIcon } from "../../assets/images/sidebar/binary.svg?react";
import { ReactComponent as PoliticsIcon } from "../../assets/images/sidebar/politics.svg?react";
import { ReactComponent as IceHockeyIcon } from "../../assets/images/sidebar/ice-hockey.svg?react";
import { ReactComponent as MMAIcon } from "../../assets/images/sidebar/mma.svg?react";
import { ReactComponent as RugbyIcon } from "../../assets/images/sidebar/rugby.svg?react";
import { ReactComponent as CasinoIcon } from "../../assets/images/sidebar/casino.svg?react";
import { ReactComponent as DimondIcon } from "../../assets/images/sidebar/dimond.svg?react";

export const HomeProvidersIcons = [
  { icon: Mac88, subProviderName: "MAC88" },
  { icon: FunGames, subProviderName: "FUN GAMES" },
  { icon: Mac88Virtual, subProviderName: "MAC88 VIRTUALS" },
  { icon: Spribe, subProviderName: "SPRIBE" },
  { icon: Evolution, subProviderName: "EVOLUTION" },
  { icon: Turbo, subProviderName: "TURBO" },
  { icon: Smartsoft, subProviderName: "SMARTSOFT" },
  { icon: Ezugi, subProviderName: "EZUGI" },
  { icon: Jili, subProviderName: "JILI" },
  { icon: AeSexy, subProviderName: "AE SEXY" },
  // { icon: Playtech, subProviderName: 'PLAYTECH' },
  { icon: Betsoft, subProviderName: "BETSOFT" },
  { icon: Gamzix, subProviderName: "GAMZIX" },
  { icon: BetGames, subProviderName: "BetGames_TV" },
  { icon: MacExcite, subProviderName: "MAC EXCITE" },
  { icon: Live88, subProviderName: "Bombay Live" },
  { icon: King, subProviderName: "KINGMAKER" },
  // { icon: RG, subProviderName: 'ROYAL GAMING' },
];

export const HomeMobProvidersIcons = [
  { icon: Mac88, subProviderName: "MAC88" },
  { icon: Evolution, subProviderName: "EVOLUTION" },
  { icon: Turbo, subProviderName: "TURBO" },
  { icon: Smartsoft, subProviderName: "SMARTSOFT" },
  // { icon: Playtech, subProviderName: 'PLAYTECH' },
  { icon: Jili, subProviderName: "JILI" },
  { icon: FunGames, subProviderName: "FUN GAMES" },
  { icon: Spribe, subProviderName: "SPRIBE" },
  { icon: AeSexy, subProviderName: "AE SEXY" },
  { icon: MacExcite, subProviderName: "MAC EXCITE" },
  { icon: Gamzix, subProviderName: "GAMZIX" },
  { icon: BetGames, subProviderName: "BetGames_TV" },
  { icon: Mac88Virtual, subProviderName: "MAC88 VIRTUALS" },
  { icon: Ezugi, subProviderName: "EZUGI" },
  { icon: Betsoft, subProviderName: "BETSOFT" },
  { icon: Live88, subProviderName: "Bombay Live" },
  // { icon: King, subProviderName: 'KINGMAKER' },
  // { icon: RG, subProviderName: 'ROYAL GAMING' },
];

// Sport icons mapping - includes all variations of sport IDs
export const sportIconsMap: { [key: string]: React.ComponentType<any> } = {
  // Cricket
  "4": CricketIcon,
  "sr:sport:21": CricketIcon,
  
  // Football/Soccer
  "1": FootballIcon,
  "sr:sport:1": FootballIcon,
  
  // Tennis
  "2": TennisIcon,
  "sr:sport:5": TennisIcon,
  
  // Kabaddi
  "99994": KabaddiIcon,
  "sr:sport:138": KabaddiIcon,
  
  // Basketball
  "7522": BasketballIcon,
  "sr:sport:2": BasketballIcon,
  
  // Baseball
  "7511": BaseballIcon,
  
  // Greyhound Racing
  "4339": GreyhoundIcon,
  
  // Horse Racing
  "7": HorseRaceIcon,
  
  // Volleyball
  "sr:sport:23": VolleyballIcon,
  
  // Darts
  "sr:sport:22": DartsIcon,
  
  // Futsal
  "sr:sport:29": FutsalIcon,
  
  // Table Tennis
  "sr:sport:20": TableTennisIcon,
  
  // Binary
  "99990": BinaryIcon,
  
  // Politics
  "2378961": PoliticsIcon,
  
  // Ice Hockey
  "sr:sport:4": IceHockeyIcon,
  
  // MMA
  "sr:sport:117": MMAIcon,
  
  // Rugby
  "sr:sport:12": RugbyIcon,
  
  // Casino
  "-100": CasinoIcon,
  
  // QTech/Dimond
  "QT": DimondIcon,
  "qtech": DimondIcon,
  "dimond": DimondIcon,
  "diamond": DimondIcon,
};

export const sportNamesMap: { [key: string]: string } = {
  // Cricket
  "4": "Cricket",
  "sr:sport:21": "Cricket",
  
  // Football/Soccer
  "1": "Football",
  "sr:sport:1": "Football",
  
  // Tennis
  "2": "Tennis",
  "sr:sport:5": "Tennis",
  
  // Kabaddi
  "99994": "Kabaddi",
  "sr:sport:138": "Kabaddi",
  
  // Basketball
  "7522": "Basketball",
  "sr:sport:2": "Basketball",
  
  // Baseball
  "7511": "Baseball",
  
  // Greyhound Racing
  "4339": "Greyhound",
  
  // Horse Racing
  "7": "Horse Race",
  
  // Volleyball
  "sr:sport:23": "Volleyball",
  
  // Darts
  "sr:sport:22": "Darts",
  
  // Futsal
  "sr:sport:29": "Futsal",
  
  // Table Tennis
  "sr:sport:20": "Table Tennis",
  
  // Binary
  "99990": "Binary",
  
  // Politics
  "2378961": "Politics",
  
  // Ice Hockey
  "sr:sport:4": "Ice Hockey",
  
  // MMA
  "sr:sport:117": "MMA",
  
  // Rugby
  "sr:sport:12": "Rugby",
  
  // Casino
  "-100": "Casino",
  
  // QTech/Dimond
  "QT": "Dimond",
  "qtech": "Dimond",
  "dimond": "Dimond",
  "diamond": "Dimond",
};

// Map sport names to icons (for fallback when sportId doesn't match)
const sportNameToIconMap: { [key: string]: React.ComponentType<any> } = {
  "Cricket": CricketIcon,
  "cricket": CricketIcon,
  "Football": FootballIcon,
  "football": FootballIcon,
  "Soccer": FootballIcon,
  "soccer": FootballIcon,
  "Tennis": TennisIcon,
  "tennis": TennisIcon,
  "Kabaddi": KabaddiIcon,
  "kabaddi": KabaddiIcon,
  "Basketball": BasketballIcon,
  "basketball": BasketballIcon,
  "Baseball": BaseballIcon,
  "baseball": BaseballIcon,
  "Greyhound": GreyhoundIcon,
  "greyhound": GreyhoundIcon,
  "Greyhound Racing": GreyhoundIcon,
  "greyhound racing": GreyhoundIcon,
  "Horse Race": HorseRaceIcon,
  "horse race": HorseRaceIcon,
  "Horse Racing": HorseRaceIcon,
  "horse racing": HorseRaceIcon,
  "Volleyball": VolleyballIcon,
  "volleyball": VolleyballIcon,
  "Darts": DartsIcon,
  "darts": DartsIcon,
  "Futsal": FutsalIcon,
  "futsal": FutsalIcon,
  "Table Tennis": TableTennisIcon,
  "table tennis": TableTennisIcon,
  "Binary": BinaryIcon,
  "binary": BinaryIcon,
  "Politics": PoliticsIcon,
  "politics": PoliticsIcon,
  "Ice Hockey": IceHockeyIcon,
  "ice hockey": IceHockeyIcon,
  "MMA": MMAIcon,
  "mma": MMAIcon,
  "Rugby": RugbyIcon,
  "rugby": RugbyIcon,
  "Casino": CasinoIcon,
  "casino": CasinoIcon,
  "QTech": DimondIcon,
  "qtech": DimondIcon,
  "Dimond": DimondIcon,
  "dimond": DimondIcon,
  "Diamond": DimondIcon,
  "diamond": DimondIcon,
};

// Helper function to get sport icon with fallback
export const getSportIcon = (
  sportId: string | number | undefined | null,
  sportName?: string | undefined | null
): React.ComponentType<any> => {
  // Convert sportId to string and trim
  const sportIdStr = sportId ? String(sportId).trim() : "";
  
  // Try sportId first
  if (sportIdStr) {
    // Try direct match first
    if (sportIconsMap[sportIdStr]) {
      return sportIconsMap[sportIdStr];
    }
    
    // Try to normalize sport ID (handle variations like "sr_sport_2" vs "sr:sport:2")
    const normalizedId = sportIdStr.replace(/_/g, ":");
    if (normalizedId !== sportIdStr && sportIconsMap[normalizedId]) {
      return sportIconsMap[normalizedId];
    }
  }
  
  // Fallback to sportName if sportId didn't match
  if (sportName) {
    const normalizedName = String(sportName).trim();
    
    // Try exact match first
    if (sportNameToIconMap[normalizedName]) {
      return sportNameToIconMap[normalizedName];
    }
    
    // Try case-insensitive match
    const lowerName = normalizedName.toLowerCase();
    if (sportNameToIconMap[lowerName]) {
      return sportNameToIconMap[lowerName];
    }
    
    // Try partial match (e.g., "Horse Racing" contains "Horse")
    for (const [key, icon] of Object.entries(sportNameToIconMap)) {
      if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
        return icon;
      }
    }
  }
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[getSportIcon] No icon found for sportId: "${sportIdStr}", sportName: "${sportName}". Using Cricket icon as fallback.`);
  }
  
  // Final fallback to Cricket icon if nothing matches
  return CricketIcon;
};

// Helper function to get sport name with fallback
export const getSportName = (
  sportId: string | number | undefined | null,
  sportName?: string | undefined | null
): string => {
  // Convert sportId to string and trim
  const sportIdStr = sportId ? String(sportId).trim() : "";
  
  // Try sportId first
  if (sportIdStr) {
    // Try direct match first
    if (sportNamesMap[sportIdStr]) {
      return sportNamesMap[sportIdStr];
    }
    
    // Try to normalize sport ID
    const normalizedId = sportIdStr.replace(/_/g, ":");
    if (normalizedId !== sportIdStr && sportNamesMap[normalizedId]) {
      return sportNamesMap[normalizedId];
    }
  }
  
  // Fallback to provided sportName if sportId didn't match
  if (sportName) {
    return String(sportName).trim();
  }
  
  // Final fallback to "Sport" if nothing matches
  return "Sport";
};
