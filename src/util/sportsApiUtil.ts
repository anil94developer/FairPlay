import USABET_API from "../api-services/usabet-api";
import { ReactComponent as Cricket } from "../assets/images/sidebar/cricket.svg?react";
import { ReactComponent as Football } from "../assets/images/sidebar/football.svg?react";
import { ReactComponent as Tennis } from "../assets/images/sidebar/tennis.svg?react";
import { ReactComponent as HorseRacing } from "../assets/images/sidebar/horse_racing.svg?react";
import { ReactComponent as GreyHound } from "../assets/images/sidebar/grey_hound.svg?react";
import { ReactComponent as Casino } from "../assets/images/sidebar/casino.svg?react";
import { ReactComponent as Dimond } from "../assets/images/sidebar/dimond.svg?react";

// Map sport names to icons
const sportIconMap: { [key: string]: any } = {
  Cricket: Cricket,
  Soccer: Football,
  Football: Football,
  Tennis: Tennis,
  "Horse Racing": HorseRacing,
  "Greyhound Racing": GreyHound,
  Casino: Casino,
  QTech: Dimond, // Using Dimond icon for QTech/Diamond
};

// Map sport names to slugs for routes
const sportSlugMap: { [key: string]: string } = {
  Cricket: "cricket",
  Soccer: "football",
  Football: "football",
  Tennis: "tennis",
  "Horse Racing": "horseracing",
  "Greyhound Racing": "greyhound",
  Casino: "casino",
  QTech: "qtech",
};

// Map sport names to lang keys
const sportLangKeyMap: { [key: string]: string } = {
  Cricket: "cricket",
  Soccer: "football",
  Football: "football",
  Tennis: "tennis",
  "Horse Racing": "horse_race",
  "Greyhound Racing": "greyhound",
  Casino: "casino",
  QTech: "qtech",
};

export interface SportApiData {
  name: string;
  sport_id: string;
  is_live_sport: number;
  providerCode: string | null;
}

export interface SportTabData {
  id: string;
  text: string;
  langKey: string;
  img: any;
  route: string;
  showWithoutLogin: boolean;
}

/**
 * Static sports data based on API response
 * Only includes sports with is_live_sport: 0 (excludes Casino and QTech)
 */
export const staticSportsData: SportApiData[] = [
  {
    name: "Cricket",
    sport_id: "4",
    is_live_sport: 0,
    providerCode: null,
  },
  {
    name: "Soccer",
    sport_id: "1",
    is_live_sport: 0,
    providerCode: null,
  },
  {
    name: "Tennis",
    sport_id: "2",
    is_live_sport: 0,
    providerCode: null,
  },
  {
    name: "Horse Racing",
    sport_id: "7",
    is_live_sport: 0,
    providerCode: null,
  },
  {
    name: "Greyhound Racing",
    sport_id: "4339",
    is_live_sport: 0,
    providerCode: null,
  },
];

/**
 * Get static sports data (no API call)
 */
export const getStaticSportsData = (): SportApiData[] => {
  return staticSportsData;
};

/**
 * Fetch sports from API
 */
export const fetchSportsFromAPI = async (): Promise<SportApiData[]> => {
  try {
    const response = await USABET_API.get("/sport/sports");
    if (response?.data?.status === true && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching sports from API:", error);
    return [];
  }
};

/**
 * Transform API sports data to tab format
 */
export const transformSportsToTabs = (sports: SportApiData[]): SportTabData[] => {
  return sports
    .map((sport) => {
      const sportName = sport.name;
      const slug = sportSlugMap[sportName] || sportName.toLowerCase().replace(/\s+/g, "-");
      const langKey = sportLangKeyMap[sportName] || sportName.toLowerCase().replace(/\s+/g, "_");
      
      return {
        id: sport.sport_id,
        text: sportName.toLowerCase().replace(/\s+/g, "_"),
        langKey: langKey,
        img: sportIconMap[sportName] || Cricket, // Default to Cricket icon if not found
        route: sport.is_live_sport === 1 ? (sportName === "Casino" ? "/casino" : "/virtual_sports") : `/exchange_sports/${slug}`,
        showWithoutLogin: true,
      };
    });
};

