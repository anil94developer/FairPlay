import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import { SelectedObj } from "../../models/ExchangeSportsState";
import { RootState } from "../../models/RootState";
import {
  fetchEventsByCompetition,
  fetchEventsBySport,
  getExchangeEvents,
  setCompetition,
  setExchEvent,
} from "../../store";
import AddIcon from "@material-ui/icons/Add";

import moment from "moment";
import NoEventsIcon from "../../assets/images/No_events_icon.svg";
import EventDateDisplay from "../../common/EventDateDisplay/EventDateDisplay";
import EventName from "../../common/EventName/EventName";
import MarketEnabled from "../../common/MarketEnabled/MarketEnabled";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import { BRAND_NAME, PROVIDER_ID } from "../../constants/Branding";
import { EventDTO } from "../../models/common/EventDTO";
import {
  disconnectToWS,
  subscribeWsForEventOdds,
  unsubscribeAllWsforEvents,
} from "../../webSocket/webSocket";
import ExchMobOddView from "../ExchOddButton/ExchMobOddView";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import SEO from "../SEO/Seo";
import "./ExchEventsTable.scss";
import { isMobile } from "react-device-detect";
import {
  getSportLangKeyByName,
  SportIconMapInplay,
  SPToBFIdMap,
} from "../../util/stringUtil";
import CATALOG_API from "../../catalog-api";
import { Button, Tabs } from "@material-ui/core";
import { fetchFavEvents } from "../../store/exchangeSports/exchangeSportsActions";
import { Check } from "@material-ui/icons";
// import { events } from "../../description/events";
import { favourites } from "../../description/favourites";
import USABET_API from "../../api-services/usabet-api";
import { EXCHANGE_EVENT_TYPES, EXCH_SPORTS_MAP } from "../../constants/ExchangeEventTypes";

type StoreProps = {
  events: EventDTO[];
  selectedEventType: SelectedObj;
  selectedCompetition: SelectedObj;
  fetchEventsByCompetition: (
    sportId: string,
    competitionId: string,
    events: EventDTO[]
  ) => void;
  setExchEvent: (event: SelectedObj) => void;
  setCompetition: (competition: SelectedObj) => void;
  fetchEventsBySport: (sportId: string, events: EventDTO[]) => void;
  fetchingEvents: boolean;
  allowedConfig: number;
  loggedIn: boolean;
  betFairWSConnected: boolean;
  topicUrls: any;
  loading: boolean;
  langData: any;
};

enum Status {
  LIVE = "LIVE",
  UPCOMING = "UPCOMING",
  VIRTUAL = "VIRTUAL",
}
const EventsTable: React.FC<StoreProps> = (props) => {
  const {
     
    allowedConfig,
    selectedEventType,
    selectedCompetition,
    fetchEventsByCompetition,
    setExchEvent,
    setCompetition,
    fetchEventsBySport,
    fetchingEvents,
    loggedIn,
    topicUrls,
    betFairWSConnected,
    loading,
    langData,
  } = props;

  const history = useHistory();
  const pathParams = useParams();
  const pathLocation = useLocation();
  const teamTypes = ["home", "draw", "away"];
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [eventsData, setEventsData] = useState([]);
  const [eventName, setEventName] = useState<string>("");
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
  const [eventFilter, setEventFilter] = useState<Status>();
  const [favouriteEvents, setFavouriteEvents] = useState<EventDTO[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const enrichedUpcomingEventIdsRef = useRef<Set<string>>(new Set());

  const tableFields = [
    {
      key: "schedle",
      Label: "Match Schedule",
      langKey: "match_schedule",
      className: "schedule-cell-header br-inplay-start",
      align: "left",
      colSpan: 1,
    },
    // {
    //   key: 'teams',
    //   Label: '',
    //   className: 'odds-cell-head teams-cell',
    //   align: 'left',
    // },
    {
      key: "homeTeamOdds",
      Label: "1",
      className: "odds-cell-head schedule-cell br-inplay-middle",
      align: "center",
      colSpan: 2,
    },
    {
      key: "drawOdds",
      Label: "X",
      className: "odds-cell-head br-inplay-middle",
      align: "center",
      colSpan: 2,
    },
    {
      key: "awayTeamOdds",
      Label: "2",
      className: "odds-cell-head br-inplay-end",
      align: "center",
      colSpan: 2,
    },
    // {
    //   key: 'more',
    //   Label: '',
    //   className: 'odds-cell-head all-markets-link-cell',
    //   align: 'center',
    // },
  ];
  const getOdds = (eventData: EventDTO, teamType: string) => {
    const team =
      teamType === "home"
        ? eventData.homeTeam
        : teamType === "away"
        ? eventData.awayTeam
        : teamType;

    const teamId =
      teamType === "home"
        ? eventData.homeTeamId
        : teamType === "away"
        ? eventData.awayTeamId
        : teamType;

    // Normalize team name for matching
    const normalizeName = (name: string) => {
      if (!name) return "";
      return name.toLowerCase().trim().replace(/\s+/g, " ");
    };

    const teamNormalized = normalizeName(team || "");
    
    // Check both eventData.matchOdds (direct) and eventData.markets?.matchOdds?.[0] (nested)
    const matchOdds = eventData.matchOdds || eventData.markets?.matchOdds?.[0];

    // Add safety checks
    if (!matchOdds || !matchOdds.runners || matchOdds.runners.length === 0) {
      return null;
    }

    // For "draw" team type, look for runners with "draw" in the name
    if (teamType === "draw") {
      for (let runner of matchOdds.runners) {
        const runnerName = normalizeName(runner.runnerName || "");
        if (runnerName.includes("draw") || runnerName === "draw") {
        return [
          {
            type: "back-odd",
              price: runner?.backPrices?.[0]?.price,
              size: runner?.backPrices?.[0]?.size,
              outcomeId: runner?.runnerId,
              outcomeName: runner.runnerName,
            },
            {
              type: "lay-odd",
              price: runner?.layPrices?.[0]?.price,
              size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
              outcomeName: runner.runnerName,
            },
          ];
        }
      }
      return null;
    }

    // For home/away teams, try multiple matching strategies
    for (let runner of matchOdds.runners) {
      const runnerName = normalizeName(runner.runnerName || "");
      
      // Skip draw runners when looking for home/away
      if (runnerName.includes("draw")) {
        continue;
      }

      // Strategy 1: Exact match
      if (runnerName === teamNormalized) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }

      // Strategy 2: Runner name contains team name
      if (teamNormalized && runnerName.includes(teamNormalized)) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }

      // Strategy 3: Team name contains runner name
      if (teamNormalized && teamNormalized.includes(runnerName)) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }

      // Strategy 4: Match by runnerId if teamId is available
      if (teamId && runner.runnerId === teamId) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }
    }

    // If no match found and we have runners, try positional matching
    // First non-draw runner = home, second non-draw runner = away
    if (matchOdds.runners.length >= 2) {
      const nonDrawRunners = matchOdds.runners.filter(
        (r: any) => !normalizeName(r.runnerName || "").includes("draw")
      );
      
      if (teamType === "home" && nonDrawRunners.length > 0) {
        const runner = nonDrawRunners[0];
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }
      
      if (teamType === "away" && nonDrawRunners.length > 1) {
        const runner = nonDrawRunners[1];
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
        ];
      }
    }

    return null;
  };

  useEffect(() => {
    if (!pathParams["competition"]) {
      setCompetition({ id: "", name: "", slug: "" });
    } else {
      // Extract competition from URL and set it in Redux
      // This will be used for filtering matches
      const competitionSlug = pathParams["competition"];
      // Check if series_id is in URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const seriesId = urlParams.get("series_id");
      
      if (seriesId) {
        // If series_id is in URL, we'll use it for filtering
        // The competition name will be set from API data in updateEvents
        if (process.env.NODE_ENV === 'development') {
          console.log('[ExchEventsTable] Found series_id in URL:', seriesId);
        }
      }
    }
  }, [pathParams]);

  useEffect(() => {
    setEventFilter(null);
  }, [pathLocation?.pathname]);

  const updateMatchOddsTopic = (
    currentTopic: string,
    currentBaseUrl: string
  ) => {
    if (
      matchOddsTopic !== currentTopic ||
      matchOddsBaseUrl !== currentBaseUrl
    ) {
      disconnectToWS();
      setMatchOddsTopic(currentTopic);
      setMatchOddsBaseUrl(currentBaseUrl);
    }
  };

  // Helper function to get sport ID from URL slug
  const getSportIdFromUrl = (): string | null => {
    const pathname = pathLocation?.pathname || "";
    // Extract slug from URL like /exchange_sports/cricket -> "cricket"
    const match = pathname.match(/\/exchange_sports\/([^\/]+)/);
    if (match && match[1]) {
      const slug = match[1].toLowerCase();
      // Try to find sport ID from EXCH_SPORTS_MAP or EXCHANGE_EVENT_TYPES
      if (EXCH_SPORTS_MAP[slug]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ExchEventsTable] getSportIdFromUrl - Found ID from EXCH_SPORTS_MAP:`, {
            slug: slug,
            id: EXCH_SPORTS_MAP[slug]
          });
        }
        return EXCH_SPORTS_MAP[slug];
      }
      const sportType = EXCHANGE_EVENT_TYPES.find(
        (sport) => sport.slug.toLowerCase() === slug
      );
      if (sportType) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ExchEventsTable] getSportIdFromUrl - Found ID from EXCHANGE_EVENT_TYPES:`, {
            slug: slug,
            id: sportType.id,
            name: sportType.name
          });
        }
        return sportType.id;
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ExchEventsTable] getSportIdFromUrl - No ID found for slug:`, slug);
      }
    }
    return null;
  };

  // Helper function to get sport slug from URL
  const getSportSlugFromUrl = (): string | null => {
    const pathname = pathLocation?.pathname || "";
    const match = pathname.match(/\/exchange_sports\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    return null;
  };

  const searchEvent = async (val) => {
    console.log(val);
    setEventsData(events);
  };

  useEffect(() => {
    if (eventName) searchEvent(eventName);
  }, [eventName]);

  const updateEvents = async () => {
    setLoadingMatches(true);
    try {
      const response = await USABET_API.get("/match/homeMatchesV2");

      // Check for invalid token response
      if (response?.data) {
        const data = response.data;
        if (
          data.status === false &&
          data.logout === true &&
          (data.msg?.includes("Invalid token") ||
           data.msg?.includes("access token is invalid") ||
           data.message?.includes("Invalid token") ||
           data.message?.includes("access token is invalid"))
        ) {
          console.warn("[ExchEventsTable] Invalid token detected in updateEvents, redirecting to login");
          sessionStorage.clear();
          history.replace("/login");
          return;
        }
      }

      // Handle different API response structures
      let allMatches: any[] = [];
      
      if (response?.data?.status === true && Array.isArray(response.data.data)) {
        allMatches = response.data.data;
      } else if (Array.isArray(response?.data?.data) && response?.data?.status === true) {
        allMatches = response.data.data;
      } else if (Array.isArray(response?.data)) {
        allMatches = response.data;
      }

      if (allMatches.length > 0) {
        let filteredMatches = allMatches;

        // Get sport info from URL (e.g., "cricket" from /exchange_sports/cricket)
        const urlSlug = getSportSlugFromUrl();
        const urlSportId = getSportIdFromUrl();
        // alert(urlSlug + " " + urlSportId);
        // Get sport name from slug
        let targetSportName = selectedEventType.name;
        if (urlSlug) {
          const sportType = EXCHANGE_EVENT_TYPES.find(
            (sport) => sport.slug.toLowerCase() === urlSlug
          );
          if (sportType) {
            targetSportName = sportType.name;
          }
        }
        
        // Use URL-based sport ID if available, otherwise use selectedEventType
        const targetSportId = urlSportId || selectedEventType.id;

        // Map of sport names that are equivalent (e.g., "Soccer" = "Football")
        const sportNameAliases: { [key: string]: string[] } = {
          "Football": ["Soccer", "Football"],
          "Soccer": ["Soccer", "Football"],
          "GreyHound": ["Greyhound Racing", "GreyHound", "Greyhound"],
          "Greyhound Racing": ["Greyhound Racing", "GreyHound", "Greyhound"],
          "Horse Racing": ["Horse Racing", "Horse Race"],
          "Tennis": ["Tennis"],
        };

        console.log(`[ExchEventsTable] Filtering by URL:`, {
          urlSlug: urlSlug,
          urlSportId: urlSportId,
          targetSportId: targetSportId,
          targetSportName: targetSportName,
          totalMatches: allMatches.length,
        });
       
        // Filter by sport from URL (e.g., cricket, football, etc.)
        if (urlSlug && urlSportId) {
          // Log sample matches before filtering to see what sport IDs are in the API
          if (process.env.NODE_ENV === 'development' && allMatches.length > 0) {
            const sampleSportIds = [...new Set(allMatches.slice(0, 20).map((m: any) => ({
              sport_id: m.sport_id,
              sportId: m.sportId,
              sport_name: m.sport_name || m.sportName,
              raw_sport_id: m.sport_id,
              raw_sportId: m.sportId,
              type_sport_id: typeof m.sport_id,
              type_sportId: typeof m.sportId,
            })))];
            console.log(`[ExchEventsTable] Sample sport IDs from API (first 20 matches):`, sampleSportIds);
            console.log(`[ExchEventsTable] Target sport ID for filtering:`, {
              targetSportId: targetSportId,
              targetSportIdType: typeof targetSportId,
              urlSlug: urlSlug,
              urlSportId: urlSportId,
            });
          }
         
          filteredMatches = allMatches.filter((match: any) => {
            // Try multiple ways to get sport ID (handle both string and number)
            const apiSportId = String(match.sport_id ?? match.sportId ?? "").trim();
            const apiSportName = String(match.sport_name ?? match.sportName ?? "").trim();
            
            // Also try as number for comparison
            const apiSportIdNum = match.sport_id ?? match.sportId;
            const targetSportIdNum = targetSportId ? Number(targetSportId) : null;
            
            // Match by sport ID (exact match) - PRIMARY FILTER
            // Try both string and number comparison
            const idMatchString = apiSportId === targetSportId;
            const idMatchNumber = targetSportIdNum !== null && apiSportIdNum !== null && 
                                  Number(apiSportIdNum) === targetSportIdNum;
            const idMatch = idMatchString || idMatchNumber;
            
            if (!idMatch) {
              return false; // If ID doesn't match, exclude
            }
            
            // ID matches - include the match
            // Name matching is only for logging/debugging, not a requirement
            if (process.env.NODE_ENV === 'development' && apiSportName && targetSportName) {
              const normalizedApiSportName = apiSportName.toLowerCase().trim();
              const normalizedTargetSportName = targetSportName.toLowerCase().trim();
              
              // Log if names don't match (for debugging)
              if (normalizedApiSportName !== normalizedTargetSportName) {
                // Check if names are aliases
                const targetAliases = sportNameAliases[targetSportName] || [targetSportName];
                const apiAliases = sportNameAliases[apiSportName] || [apiSportName];
                const hasMatchingAlias = targetAliases.some(alias => 
                  apiAliases.some(apiAlias => 
                    alias.toLowerCase() === apiAlias.toLowerCase()
                  )
                );
                
                if (!hasMatchingAlias) {
                  console.log(`[ExchEventsTable] Sport ID matches but name differs:`, {
                    apiSportId: apiSportId,
                    apiSportIdNum: apiSportIdNum,
                    apiSportName: apiSportName,
                    targetSportId: targetSportId,
                    targetSportName: targetSportName,
                    matchName: match.match_name || match.matchName,
                  });
                }
              }
            }
            
            return true; // Include match if ID matches
          });

          console.log(`[ExchEventsTable] Filtered by sport:`, {
            sport: targetSportName,
            targetSportId: targetSportId,
            urlSlug: urlSlug,
            totalMatchesBeforeFilter: allMatches.length,
            filteredCount: filteredMatches.length,
            sampleMatch: filteredMatches[0] ? {
              sportId: filteredMatches[0].sport_id || filteredMatches[0].sportId,
              sportIdType: typeof (filteredMatches[0].sport_id || filteredMatches[0].sportId),
              sportName: filteredMatches[0].sport_name || filteredMatches[0].sportName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
            allFilteredSportIds: [...new Set(filteredMatches.map((m: any) => m.sport_id || m.sportId))],
          });
        }

        // Filter by competition/series if competition slug is in URL
        if (pathParams["competition"]) {
          const competitionSlug = pathParams["competition"].toLowerCase();
          
          // Get series_id from URL query parameter if available
          const urlParams = new URLSearchParams(window.location.search);
          const urlSeriesId = urlParams.get("series_id");
          
          // First, try to find competition from API data and extract series_id
          let targetSeriesId: string | null = urlSeriesId || null;
          let targetSeriesName: string | null = null;
          const isPseudoCompetitionSeries =
            !!targetSeriesId &&
            String(targetSeriesId).trim() === String(targetSportId).trim();

          // If series_id equals sport_id (common for racing feeds), it is not a real series filter.
          // Example URL: /exchange_sports/horseracing/horse-racing?series_id=7
          // In this case we should NOT filter by series_id, otherwise we hide valid events.
          if (isPseudoCompetitionSeries) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[ExchEventsTable] Detected pseudo competition series_id (equals sport_id). Skipping series filter.", {
                competitionSlug,
                targetSeriesId,
                targetSportId,
              });
            }
          }
          
          // If we have series_id from URL, find the series name from API data
          if (targetSeriesId && !isPseudoCompetitionSeries) {
            const competitionMatch = filteredMatches.find((match: any) => {
              const matchSeriesId = String(match.series_id || match.seriesId || match.competitionId || match.competition_id || "").trim();
              return matchSeriesId === targetSeriesId;
            });
            
            if (competitionMatch) {
              targetSeriesName = competitionMatch.series_name || competitionMatch.seriesName || competitionMatch.competitionName || competitionMatch.competition_name || "";
            }
    } else {
            // Find the first match to get series_id by slug
            const competitionMatch = filteredMatches.find((match: any) => {
              const matchSeriesName = (match.series_name || match.seriesName || match.competitionName || match.competition_name || "").toLowerCase();
              const matchCompetitionSlug = matchSeriesName
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-");
              return matchCompetitionSlug === competitionSlug;
            });
            
            // Extract series_id and series_name from the match
            if (competitionMatch) {
              targetSeriesId = String(competitionMatch.series_id || competitionMatch.seriesId || competitionMatch.competitionId || competitionMatch.competition_id || "").trim();
              targetSeriesName = competitionMatch.series_name || competitionMatch.seriesName || competitionMatch.competitionName || competitionMatch.competition_name || "";
            }
          }
          
          // Set competition in Redux if not already set or if it's different
          if (!isPseudoCompetitionSeries && targetSeriesId && targetSeriesName && 
              (!selectedCompetition.id || selectedCompetition.id !== targetSeriesId || selectedCompetition.slug !== competitionSlug)) {
            setCompetition({
              id: targetSeriesId,
              name: targetSeriesName,
              slug: competitionSlug,
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[ExchEventsTable] Set competition from URL:', {
                seriesId: targetSeriesId,
                seriesName: targetSeriesName,
                slug: competitionSlug,
                fromUrlParam: !!urlSeriesId
              });
            }
          }
          
          // Filter matches by series_id (primary method - most reliable)
          if (!isPseudoCompetitionSeries && targetSeriesId) {
            const beforeFilterCount = filteredMatches.length;
            
            // Log sample data before filtering
            if (process.env.NODE_ENV === 'development' && beforeFilterCount > 0) {
              console.log('[ExchEventsTable] Before series_id filter:', {
                targetSeriesId: targetSeriesId,
                urlSeriesId: urlSeriesId,
                sampleMatches: filteredMatches.slice(0, 5).map((m, idx) => ({
                  index: idx,
                  matchName: m.match_name || m.matchName,
                  series_id: m.series_id,
                  seriesId: m.seriesId,
                  competitionId: m.competitionId,
                  competition_id: m.competition_id,
                  series_name: m.series_name,
                  seriesName: m.seriesName,
                  allFields: Object.keys(m).filter(k => k.toLowerCase().includes('series') || k.toLowerCase().includes('competition'))
                }))
              });
            }
            
            filteredMatches = filteredMatches.filter((match: any) => {
              // Try all possible field names for series_id
              const matchSeriesId = String(
                match.series_id || 
                match.seriesId || 
                match.competitionId || 
                match.competition_id ||
                ""
              ).trim();
              
              const isMatch = matchSeriesId === targetSeriesId;
              
              return isMatch;
            });
            
            console.log(`[ExchEventsTable] Filtered by series_id:`, {
              targetSeriesId: targetSeriesId,
              urlSeriesId: urlSeriesId,
              beforeFilter: beforeFilterCount,
              afterFilter: filteredMatches.length,
              filteredMatches: filteredMatches.slice(0, 3).map(m => ({
                matchName: m.match_name || m.matchName,
                seriesId: m.series_id || m.seriesId,
                seriesName: m.series_name || m.seriesName
              }))
            });
          } else if (!isPseudoCompetitionSeries && selectedCompetition.id) {
            // Fallback: use selectedCompetition.id if we have it
            filteredMatches = filteredMatches.filter((match: any) => {
              const matchSeriesId = String(match.series_id || match.seriesId || match.competitionId || match.competition_id || "").trim();
              return matchSeriesId === selectedCompetition.id;
            });
          } else if (!isPseudoCompetitionSeries) {
            // Last resort: match by slug
            filteredMatches = filteredMatches.filter((match: any) => {
              const matchSeriesName = (match.series_name || match.seriesName || match.competitionName || match.competition_name || "").toLowerCase();
              const matchCompetitionSlug = matchSeriesName
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-");
              return matchCompetitionSlug === competitionSlug;
            });
          }
          
          console.log(`[ExchEventsTable] Final filtered by competition/series:`, {
            competitionSlug: competitionSlug,
            urlSeriesId: urlSeriesId,
            targetSeriesId: targetSeriesId,
            selectedCompetitionId: selectedCompetition.id,
            filteredCount: filteredMatches.length,
            totalMatchesBeforeFilter: allMatches.length,
            sampleMatch: filteredMatches[0] ? {
              seriesId: filteredMatches[0].series_id || filteredMatches[0].seriesId,
              seriesName: filteredMatches[0].series_name || filteredMatches[0].seriesName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
          });
        }

        // Transform API data to EventDTO format
        const transformedEvents: EventDTO[] = filteredMatches.map((match: any) => {
          // Extract team names from match_name if available
          let homeTeam = match.homeTeam || match.home_team || "";
          let awayTeam = match.awayTeam || match.away_team || "";
          
          const matchName = match.match_name || match.matchName || "";
          if (matchName && !homeTeam && !awayTeam) {
            const teamMatch = matchName.match(/^(.+?)\s+v\s+(.+)$/i);
            if (teamMatch) {
              homeTeam = teamMatch[1].trim();
              awayTeam = teamMatch[2].trim();
            }
          }
          
          // Get event name - prioritize match_name from API response
          let eventName = match.match_name || match.matchName || match.eventName || match.event_name || "";
          if (!eventName && homeTeam && awayTeam) {
            eventName = `${homeTeam} V ${awayTeam}`;
          } else if (!eventName) {
            eventName = match.match_id || match.matchId || match.eventId || match.event_id || "Event";
          }

          // Get match date - prioritize match_date from API response
          const matchDate = match.match_date || match.matchDate;
          const openDate = match.openDate || match.open_date || matchDate || new Date().toISOString();

          // Get sport info from API response
          const apiSportId = match.sport_id || match.sportId || selectedEventType.id;
          const apiSportName = match.sport_name || match.sportName || selectedEventType.name;

          // Transform runners from API format to matchOdds format
          // API format: runners[].selection_name, runners[].ex.availableToBack[], runners[].ex.availableToLay[]
          // Expected format: matchOdds.runners[].runnerName, matchOdds.runners[].backPrices[], matchOdds.runners[].layPrices[]
          const transformedRunners = (match.runners || []).map((runner: any) => {
            const availableToBack = runner.ex?.availableToBack || [];
            const availableToLay = runner.ex?.availableToLay || [];
            
            // Helper function to parse price and size
            const parsePrice = (val: any): number | null => {
              if (val === "--" || val === null || val === undefined || val === "") return null;
              const num = typeof val === "number" ? val : parseFloat(String(val));
              return isNaN(num) ? null : num;
            };
            
            return {
              runnerId: String(runner.selectionId || runner.selection_id || ""),
              runnerName: runner.selection_name || runner.selectionName || runner.name || "",
              status: runner.status || "ACTIVE",
              backPrices: availableToBack
                .filter((price: any) => {
                  const priceVal = parsePrice(price.price);
                  return priceVal !== null && priceVal > 0;
                })
                .map((price: any) => ({
                  price: parsePrice(price.price),
                  size: parsePrice(price.size),
                }))
                .filter((p: any) => p.price !== null), // Final filter to ensure we have valid prices
              layPrices: availableToLay
                .filter((price: any) => {
                  const priceVal = parsePrice(price.price);
                  return priceVal !== null && priceVal > 0;
                })
                .map((price: any) => ({
                  price: parsePrice(price.price),
                  size: parsePrice(price.size),
                }))
                .filter((p: any) => p.price !== null), // Final filter to ensure we have valid prices
            };
          });

          // Create matchOdds object if we have runners
          const matchOdds = transformedRunners.length > 0 ? {
            marketId: match.market_id || match.marketId || "",
            marketName: match.market_name || match.marketName || "Match Odds",
            status: match.status || "UPCOMING",
            runners: transformedRunners,
          } : undefined;

          return {
            eventId: match.match_id || match.matchId || match.eventId || match.event_id || "",
            eventName: eventName,
            eventSlug: eventName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            sportId: apiSportId,
            sportName: apiSportName,
            competitionId: match.series_id || match.competitionId || match.competition_id || "",
            competitionName: match.series_name || match.competitionName || match.competition_name || "",
            openDate: openDate,
            status: match.status || "UPCOMING",
            providerName: match.providerName || match.provider_name || "BetFair",
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            marketId: match.market_id || match.marketId || "",
            markets: match.markets || {},
            enabled: match.is_active !== 0 && match.enabled !== false,
            forcedInplay: match.manual_inplay || match.forcedInplay || match.forced_inplay || false,
            virtualEvent: match.virtualEvent || match.virtual_event || false,
            favorite: match.is_favorites || match.favorite || false,
            inplay: match.inplay || match.inPlay || match.in_play || false,
            runners: match.runners || [],
            totalMatched: match.totalMatched || 0,
            matchOdds: matchOdds, // Add transformed matchOdds
            ...match, // Include any additional fields from API
          };
        });
          // alert(transformedEvents.length);
        console.log(`[ExchEventsTable] updateEvents - Setting ${transformedEvents.length} events to state`);
        setEvents(transformedEvents);

        // Also update Redux store for compatibility
    if (!pathParams["competition"]) {
          const sportIdToUse = SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
            : selectedEventType.id;
          fetchEventsBySport(sportIdToUse, transformedEvents);
        } else if (selectedCompetition.id) {
          const sportIdToUse = SPToBFIdMap[selectedEventType.id]
            ? SPToBFIdMap[selectedEventType.id]
            : selectedEventType.id;
          fetchEventsByCompetition(sportIdToUse, selectedCompetition.id, transformedEvents);
        }
    } else {
        console.log(`[ExchEventsTable] updateEvents - No matches found, clearing events`);
        setEvents([]);
      }
    } catch (error: any) {
      console.error("Error fetching events in updateEvents:", error);
      
      // Check for invalid token in error response
      if (error?.response?.data) {
        const data = error.response.data;
        if (
          data.status === false &&
          data.logout === true &&
          (data.msg?.includes("Invalid token") ||
           data.msg?.includes("access token is invalid") ||
           data.message?.includes("Invalid token") ||
           data.message?.includes("access token is invalid"))
        ) {
          console.warn("[ExchEventsTable] Invalid token in error, redirecting to login");
          sessionStorage.clear();
          history.replace("/login");
          return;
        }
      }
      
      setEvents([]);
    } finally {
      setLoadingMatches(false);
    }
  };



  // Fetch matches from API based on selected sport
  const fetchMatchesFromAPI = async () => {
    //alert("fetchMatchesFromAPI");
    // if (!selectedEventType.id) {
    //   return;
    // }

    setLoadingMatches(true);
    try {
       
      // Check if this is horseracing page (sport_id "7" or slug "horseracing")
      const urlSlug = getSportSlugFromUrl();
      const urlSportId = getSportIdFromUrl();

      console.log("[ExchEventsTable] URL slug:", urlSlug);
      console.log("[ExchEventsTable] URL sport ID:", urlSportId);
      console.log("[ExchEventsTable] Selected event type:", selectedEventType);
      const isHorseRacing = 
        urlSlug === "horseracing" || 
        urlSportId === "7" || 
        selectedEventType.id === "7" ||
        selectedEventType.slug === "horseracing";

      let allMatches: any[] = [];
 
        // Use regular API for other sports
        const response = await USABET_API.get("/match/homeMatchesV2");

        // Handle different API response structures:
        // Structure 1: { data: [...], status: true } - response.data.data is array, response.data.status is true
        // Structure 2: { data: { data: [...], status: true } } - nested
        // Structure 3: response.data is directly the array
        console.log(`[ExchEventsTable] API Response structure:`, {
          hasData: !!response?.data,
          dataIsArray: Array.isArray(response?.data),
          hasDataData: !!response?.data?.data,
          dataDataIsArray: Array.isArray(response?.data?.data),
          dataStatus: response?.data?.status,
          responseStatus: response?.status,
          sampleData: response?.data?.[0] || response?.data?.data?.[0],
        });
        
        if (response?.data?.status === true && Array.isArray(response.data.data)) {
          // Structure: { data: { data: [...], status: true } }
          allMatches = response.data.data;
        } else if (Array.isArray(response?.data?.data) && response?.data?.status === true) {
          // Same as above, different check order
          allMatches = response.data.data;
        } else if (Array.isArray(response?.data)) {
          // Direct structure: response.data is the array
          allMatches = response.data;
        }
      
  

      if (allMatches.length > 0) {
        // Get sport info from URL (e.g., "cricket" from /exchange_sports/cricket)
        const urlSlug = getSportSlugFromUrl();
        const urlSportId = getSportIdFromUrl();
        
        // Get sport name from slug
        let targetSportName = selectedEventType.name;
        if (urlSlug) {
          const sportType = EXCHANGE_EVENT_TYPES.find(
            (sport) => sport.slug.toLowerCase() === urlSlug
          );
          if (sportType) {
            targetSportName = sportType.name;
          }
        }
        
        // Use URL-based sport ID if available, otherwise use selectedEventType
        const targetSportId = urlSportId || selectedEventType.id;

        // Map of sport names that are equivalent (e.g., "Soccer" = "Football")
        const sportNameAliases: { [key: string]: string[] } = {
          "Football": ["Soccer", "Football"],
          "Soccer": ["Soccer", "Football"],
          "GreyHound": ["Greyhound Racing", "GreyHound", "Greyhound"],
          "Greyhound Racing": ["Greyhound Racing", "GreyHound", "Greyhound"],
          "Horse Racing": ["Horse Racing", "Horse Race"],
          "Tennis": ["Tennis"],
        };

        // Filter by sport from URL (e.g., cricket, football, etc.)
        // Skip filtering for horseracing since API already returns filtered data
        let filteredMatches = allMatches;
        if (isHorseRacing) {
          // For horseracing, use all matches directly (already filtered by API)
          filteredMatches = allMatches;
           
          console.log(`[ExchEventsTable] fetchMatchesFromAPI - Filtered by URL sport:`, filteredMatches);
        } else if (urlSlug && urlSportId) {
          // Log sample matches before filtering to see what sport IDs are in the API
          if (process.env.NODE_ENV === 'development' && allMatches.length > 0) {
            const sampleSportIds = [...new Set(allMatches.slice(0, 20).map((m: any) => ({
              sport_id: m.sport_id,
              sportId: m.sportId,
              sport_name: m.sport_name || m.sportName,
              raw_sport_id: m.sport_id,
              raw_sportId: m.sportId,
              type_sport_id: typeof m.sport_id,
              type_sportId: typeof m.sportId,
            })))];
            console.log(`[ExchEventsTable] fetchMatchesFromAPI - Sample sport IDs from API (first 20 matches):`, sampleSportIds);
            console.log(`[ExchEventsTable] fetchMatchesFromAPI - Target sport ID for filtering:`, {
              targetSportId: targetSportId,
              targetSportIdType: typeof targetSportId,
              urlSlug: urlSlug,
              urlSportId: urlSportId,
            });
          }
          
          filteredMatches = allMatches.filter((match: any) => {
            // Try multiple ways to get sport ID (handle both string and number)
            const apiSportId = String(match.sport_id ?? match.sportId ?? "").trim();
            const apiSportName = String(match.sport_name ?? match.sportName ?? "").trim();
            
            // Also try as number for comparison
            const apiSportIdNum = match.sport_id ?? match.sportId;
            const targetSportIdNum = targetSportId ? Number(targetSportId) : null;
            
            // Match by sport ID (exact match) - PRIMARY FILTER
            // Try both string and number comparison
            const idMatchString = apiSportId === targetSportId;
            const idMatchNumber = targetSportIdNum !== null && apiSportIdNum !== null && 
                                  Number(apiSportIdNum) === targetSportIdNum;
            const idMatch = idMatchString || idMatchNumber;
            
            if (!idMatch) {
              return false; // If ID doesn't match, exclude
            }
            
            // ID matches - include the match
            // Name matching is only for logging/debugging, not a requirement
            if (process.env.NODE_ENV === 'development' && apiSportName && targetSportName) {
              const normalizedApiSportName = apiSportName.toLowerCase().trim();
              const normalizedTargetSportName = targetSportName.toLowerCase().trim();
              
              // Log if names don't match (for debugging)
              if (normalizedApiSportName !== normalizedTargetSportName) {
                // Check if names are aliases
                const targetAliases = sportNameAliases[targetSportName] || [targetSportName];
                const apiAliases = sportNameAliases[apiSportName] || [apiSportName];
                const hasMatchingAlias = targetAliases.some(alias => 
                  apiAliases.some(apiAlias => 
                    alias.toLowerCase() === apiAlias.toLowerCase()
                  )
                );
                
                if (!hasMatchingAlias) {
                  console.log(`[ExchEventsTable] fetchMatchesFromAPI - Sport ID matches but name differs:`, {
                    apiSportId: apiSportId,
                    apiSportIdNum: apiSportIdNum,
                    apiSportName: apiSportName,
                    targetSportId: targetSportId,
                    targetSportName: targetSportName,
                    matchName: match.match_name || match.matchName,
                  });
                }
              }
            }
            
            return true; // Include match if ID matches
          });

          console.log(`[ExchEventsTable] fetchMatchesFromAPI - Filtered by URL sport:`, {
            urlSlug: urlSlug,
            urlSportId: urlSportId,
            targetSportId: targetSportId,
            targetSportIdType: typeof targetSportId,
            targetSportName: targetSportName,
            totalMatches: allMatches.length,
            filteredCount: filteredMatches.length,
            sampleMatch: filteredMatches[0] ? {
              sportId: filteredMatches[0].sport_id || filteredMatches[0].sportId,
              sportIdType: typeof (filteredMatches[0].sport_id || filteredMatches[0].sportId),
              sportName: filteredMatches[0].sport_name || filteredMatches[0].sportName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
            allFilteredSportIds: [...new Set(filteredMatches.map((m: any) => m.sport_id || m.sportId))],
          });
    } else {
          console.log(`[ExchEventsTable] fetchMatchesFromAPI - No URL filter, showing all matches:`, {
            urlPath: pathLocation?.pathname,
            totalMatches: allMatches.length,
          });
        }

        // Filter by competition/series if competition slug is in URL
        if (pathParams["competition"]) {
          const competitionSlug = pathParams["competition"].toLowerCase();
          
          // Get series_id from URL query parameter if available
          const urlParams = new URLSearchParams(window.location.search);
          const urlSeriesId = urlParams.get("series_id");
          
          // First, try to find competition from API data and extract series_id
          let targetSeriesId: string | null = urlSeriesId || null;
          let targetSeriesName: string | null = null;
          const isPseudoCompetitionSeries =
            !!targetSeriesId &&
            String(targetSeriesId).trim() === String(targetSportId).trim();

          // If series_id equals sport_id (common for racing feeds), it is not a real series filter.
          if (isPseudoCompetitionSeries) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[ExchEventsTable] fetchMatchesFromAPI - Detected pseudo competition series_id (equals sport_id). Skipping series filter.", {
                competitionSlug,
                targetSeriesId,
                targetSportId,
              });
            }
          }
          
          // If we have series_id from URL, find the series name from API data
          if (targetSeriesId && !isPseudoCompetitionSeries) {
            const competitionMatch = filteredMatches.find((match: any) => {
              const matchSeriesId = String(match.series_id || match.seriesId || match.competitionId || match.competition_id || "").trim();
              return matchSeriesId === targetSeriesId;
            });
            
            if (competitionMatch) {
              targetSeriesName = competitionMatch.series_name || competitionMatch.seriesName || competitionMatch.competitionName || competitionMatch.competition_name || "";
            }
          } else {
            // Find the first match to get series_id by slug
            const competitionMatch = filteredMatches.find((match: any) => {
              const matchSeriesName = (match.series_name || match.seriesName || match.competitionName || match.competition_name || "").toLowerCase();
              const matchCompetitionSlug = matchSeriesName
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-");
              return matchCompetitionSlug === competitionSlug;
            });
            
            // Extract series_id and series_name from the match
            if (competitionMatch) {
              targetSeriesId = String(competitionMatch.series_id || competitionMatch.seriesId || competitionMatch.competitionId || competitionMatch.competition_id || "").trim();
              targetSeriesName = competitionMatch.series_name || competitionMatch.seriesName || competitionMatch.competitionName || competitionMatch.competition_name || "";
            }
          }
          
          // Set competition in Redux if not already set or if it's different
          if (!isPseudoCompetitionSeries && targetSeriesId && targetSeriesName && 
              (!selectedCompetition.id || selectedCompetition.id !== targetSeriesId || selectedCompetition.slug !== competitionSlug)) {
            setCompetition({
              id: targetSeriesId,
              name: targetSeriesName,
              slug: competitionSlug,
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[ExchEventsTable] fetchMatchesFromAPI - Set competition from URL:', {
                seriesId: targetSeriesId,
                seriesName: targetSeriesName,
                slug: competitionSlug,
                fromUrlParam: !!urlSeriesId
              });
            }
          }
          
          // Filter matches by series_id (primary method - most reliable)
          if (!isPseudoCompetitionSeries && targetSeriesId) {
            const beforeFilterCount = filteredMatches.length;
            
            // Log sample data before filtering
            if (process.env.NODE_ENV === 'development' && beforeFilterCount > 0) {
              console.log('[ExchEventsTable] fetchMatchesFromAPI - Before series_id filter:', {
                targetSeriesId: targetSeriesId,
                urlSeriesId: urlSeriesId,
                sampleMatches: filteredMatches.slice(0, 5).map((m, idx) => ({
                  index: idx,
                  matchName: m.match_name || m.matchName,
                  series_id: m.series_id,
                  seriesId: m.seriesId,
                  competitionId: m.competitionId,
                  competition_id: m.competition_id,
                  series_name: m.series_name,
                  seriesName: m.seriesName,
                }))
              });
            }
            
            const matchesBeforeSeriesFilter = [...filteredMatches];
            filteredMatches = filteredMatches.filter((match: any, index: number) => {
              // Try all possible field names for series_id
              const matchSeriesId = String(
                match.series_id || 
                match.seriesId || 
                match.competitionId || 
                match.competition_id ||
                ""
              ).trim();
              
              const isMatch = matchSeriesId === targetSeriesId;
              
              // Debug logging for first few matches
              if (process.env.NODE_ENV === 'development' && index < 3) {
                console.log('[ExchEventsTable] fetchMatchesFromAPI - Series ID comparison:', {
                  matchSeriesId: matchSeriesId,
                  targetSeriesId: targetSeriesId,
                  isMatch: isMatch,
                  matchName: match.match_name || match.matchName,
                });
              }
              
              return isMatch;
            });
            
            console.log(`[ExchEventsTable] fetchMatchesFromAPI - Filtered by series_id:`, {
              targetSeriesId: targetSeriesId,
              urlSeriesId: urlSeriesId,
              beforeFilter: beforeFilterCount,
              afterFilter: filteredMatches.length,
              filteredMatches: filteredMatches.slice(0, 3).map(m => ({
                matchName: m.match_name || m.matchName,
                seriesId: m.series_id || m.seriesId,
                seriesName: m.series_name || m.seriesName
              }))
            });
          } else if (!isPseudoCompetitionSeries && selectedCompetition.id) {
            // Fallback: use selectedCompetition.id if we have it
            filteredMatches = filteredMatches.filter((match: any) => {
              const matchSeriesId = String(match.series_id || match.seriesId || match.competitionId || match.competition_id || "").trim();
              return matchSeriesId === selectedCompetition.id;
            });
          } else if (!isPseudoCompetitionSeries) {
            // Last resort: match by slug
            filteredMatches = filteredMatches.filter((match: any) => {
              const matchSeriesName = (match.series_name || match.seriesName || match.competitionName || match.competition_name || "").toLowerCase();
              const matchCompetitionSlug = matchSeriesName
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-");
              return matchCompetitionSlug === competitionSlug;
            });
          }
          
          console.log(`[ExchEventsTable] fetchMatchesFromAPI - Final filtered by competition/series:`, {
            competitionSlug: competitionSlug,
            urlSeriesId: urlSeriesId,
            targetSeriesId: targetSeriesId,
            selectedCompetitionId: selectedCompetition.id,
            filteredCount: filteredMatches.length,
            totalMatchesBeforeFilter: allMatches.length,
            sampleMatch: filteredMatches[0] ? {
              seriesId: filteredMatches[0].series_id || filteredMatches[0].seriesId,
              seriesName: filteredMatches[0].series_name || filteredMatches[0].seriesName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
          });
        }

        // Transform API data to EventDTO format
        // API response structure: match_id, match_name, match_date, sport_id, sport_name, series_id, series_name, etc.
        const transformedEvents: EventDTO[] = filteredMatches.map((match: any) => {
          // Extract team names from match_name if available (e.g., "Canterbury Kings v Central Stags")
          let homeTeam = match.homeTeam || match.home_team || "";
          let awayTeam = match.awayTeam || match.away_team || "";
          
          // Try to parse team names from match_name if not directly available
          const matchName = match.match_name || match.matchName || "";
          if (matchName && !homeTeam && !awayTeam) {
            const teamMatch = matchName.match(/^(.+?)\s+v\s+(.+)$/i);
            if (teamMatch) {
              homeTeam = teamMatch[1].trim();
              awayTeam = teamMatch[2].trim();
            }
          }
          
          // Get event name - prioritize match_name from API response
          let eventName = match.match_name || match.matchName || match.eventName || match.event_name || "";
          if (!eventName && homeTeam && awayTeam) {
            eventName = `${homeTeam} V ${awayTeam}`;
          } else if (!eventName) {
            eventName = match.match_id || match.matchId || match.eventId || match.event_id || "Event";
          }

          // Get match date - prioritize match_date from API response
          const matchDate = match.match_date || match.matchDate;
          const openDate = match.openDate || match.open_date || matchDate || new Date().toISOString();

          // Get sport info directly from API response (no filtering)
          // For horseracing, ensure sportId is "7"
          const apiSportId = isHorseRacing 
            ? "7" 
            : (match.sport_id || match.sportId || selectedEventType.id || "");
          const apiSportName = match.sport_name || match.sportName || selectedEventType.name || "";

          // Transform runners from API format to matchOdds format
          // API format: runners[].selection_name, runners[].ex.availableToBack[], runners[].ex.availableToLay[]
          // Expected format: matchOdds.runners[].runnerName, matchOdds.runners[].backPrices[], matchOdds.runners[].layPrices[]
          const transformedRunners = (match.runners || []).map((runner: any) => {
            const availableToBack = runner.ex?.availableToBack || [];
            const availableToLay = runner.ex?.availableToLay || [];
            
            // Helper function to parse price and size
            const parsePrice = (val: any): number | null => {
              if (val === "--" || val === null || val === undefined || val === "") return null;
              const num = typeof val === "number" ? val : parseFloat(String(val));
              return isNaN(num) ? null : num;
            };
            
            return {
              runnerId: String(runner.selectionId || runner.selection_id || ""),
              runnerName: runner.selection_name || runner.selectionName || runner.name || "",
              status: runner.status || "ACTIVE",
              backPrices: availableToBack
                .filter((price: any) => {
                  const priceVal = parsePrice(price.price);
                  return priceVal !== null && priceVal > 0;
                })
                .map((price: any) => ({
                  price: parsePrice(price.price),
                  size: parsePrice(price.size),
                }))
                .filter((p: any) => p.price !== null), // Final filter to ensure we have valid prices
              layPrices: availableToLay
                .filter((price: any) => {
                  const priceVal = parsePrice(price.price);
                  return priceVal !== null && priceVal > 0;
                })
                .map((price: any) => ({
                  price: parsePrice(price.price),
                  size: parsePrice(price.size),
                }))
                .filter((p: any) => p.price !== null), // Final filter to ensure we have valid prices
            };
          });

          // Create matchOdds object if we have runners
          const matchOdds = transformedRunners.length > 0 ? {
            marketId: match.market_id || match.marketId || "",
            marketName: match.market_name || match.marketName || "Match Odds",
            status: match.status || "UPCOMING",
            runners: transformedRunners,
          } : undefined;

          return {
            eventId: match.match_id || match.matchId || match.eventId || match.event_id || "",
            eventName: eventName,
            eventSlug: eventName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            sportId: apiSportId,
            sportName: apiSportName,
            competitionId: match.series_id || match.competitionId || match.competition_id || "",
            competitionName: match.series_name || match.competitionName || match.competition_name || "",
            openDate: openDate,
            status: match.status || "UPCOMING",
            providerName: match.providerName || match.provider_name || "BetFair",
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            marketId: match.market_id || match.marketId || "",
            markets: match.markets || {},
            enabled: match.is_active !== 0 && match.enabled !== false,
            forcedInplay: match.manual_inplay || match.forcedInplay || match.forced_inplay || false,
            virtualEvent: match.virtualEvent || match.virtual_event || false,
            favorite: match.is_favorites || match.favorite || false,
            inplay: match.inplay || match.inPlay || match.in_play || false,
            runners: match.runners || [],
            totalMatched: match.totalMatched || 0,
            matchOdds: matchOdds, // Add transformed matchOdds
            ...match, // Include any additional fields from API
          };
        });

        console.log(`[ExchEventsTable] Transformed all matches:`, {
          totalTransformed: transformedEvents.length,
          sports: [...new Set(transformedEvents.map(e => e.sportName))],
        });

        // Set events in local state
        if (transformedEvents.length > 0) {
          console.log(`[ExchEventsTable] fetchMatchesFromAPI - Setting ${transformedEvents.length} events to state`);
          console.log(`[ExchEventsTable] Sample transformed events:`, transformedEvents.slice(0, 2));
          setEvents(transformedEvents);
          
          // Also update Redux store for compatibility - CRITICAL for rendering
          // For horseracing, ensure we use sport ID "7" (not mapped)
          const currentSportId = isHorseRacing ? "7" : (selectedEventType.id || "");
          // Don't map sport ID for horseracing - use "7" directly
          const sportIdToUse = isHorseRacing 
            ? "7" 
            : (SPToBFIdMap[currentSportId] ? SPToBFIdMap[currentSportId] : currentSportId);
          
          console.log(`[ExchEventsTable] Updating Redux store with events:`, {
            isHorseRacing: isHorseRacing,
            currentSportId: currentSportId,
            sportIdToUse: sportIdToUse,
            selectedEventTypeId: selectedEventType.id,
            eventCount: transformedEvents.length,
            hasCompetition: !!pathParams["competition"],
            competitionId: selectedCompetition.id,
            sampleEventSportId: transformedEvents[0]?.sportId,
          });
          
          // Always update Redux store - this is critical for rendering
          // For horseracing, always use fetchEventsBySport with sport ID "7"
          if (isHorseRacing || !pathParams["competition"]) {
            fetchEventsBySport(sportIdToUse, transformedEvents);
          } else if (selectedCompetition.id) {
            fetchEventsByCompetition(sportIdToUse, selectedCompetition.id, transformedEvents);
          } else {
            // Fallback: update Redux store
            fetchEventsBySport(sportIdToUse, transformedEvents);
          }
        } else {
          console.log(`[ExchEventsTable] No matches found, clearing events`);
          setEvents([]);
          
          // Also clear Redux store
          const currentSportId = selectedEventType.id;
          const sportIdToUse = SPToBFIdMap[currentSportId]
            ? SPToBFIdMap[currentSportId]
            : currentSportId;
          
          if (!pathParams["competition"]) {
            fetchEventsBySport(sportIdToUse, []);
          } else if (selectedCompetition.id) {
            fetchEventsByCompetition(sportIdToUse, selectedCompetition.id, []);
          }
        }
      } else {
        console.warn(`[ExchEventsTable] No matches found in API response`, {
          allMatchesCount: allMatches.length,
          isHorseRacing: isHorseRacing,
        });
        // Clear events in local state
        setEvents([]);
        // Also clear Redux store
        const currentSportId = selectedEventType.id;
        const sportIdToUse = SPToBFIdMap[currentSportId]
          ? SPToBFIdMap[currentSportId]
          : currentSportId;
        
        if (!pathParams["competition"]) {
          fetchEventsBySport(sportIdToUse, []);
        } else if (selectedCompetition.id) {
          fetchEventsByCompetition(sportIdToUse, selectedCompetition.id, []);
        }
      }
    } catch (error: any) {
      console.error("Error fetching matches from API:", error);
      
      // Check for invalid token in error response
      if (error?.response?.data) {
        const data = error.response.data;
        if (
          data.status === false &&
          data.logout === true &&
          (data.msg?.includes("Invalid token") ||
           data.msg?.includes("access token is invalid") ||
           data.message?.includes("Invalid token") ||
           data.message?.includes("access token is invalid"))
        ) {
          console.warn("[ExchEventsTable] Invalid token in error, redirecting to login");
          sessionStorage.clear();
          history.replace("/login");
          return;
        }
      }
      
      // Clear events in local state on error
      setEvents([]);
      // Also clear Redux store
      const currentSportId = selectedEventType.id;
      const sportIdToUse = SPToBFIdMap[currentSportId]
        ? SPToBFIdMap[currentSportId]
        : currentSportId;
      
      if (!pathParams["competition"]) {
        fetchEventsBySport(sportIdToUse, []);
      } else if (selectedCompetition.id) {
        fetchEventsByCompetition(sportIdToUse, selectedCompetition.id, []);
      }
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (!pathParams["competition"]) {
      // Fetch from API for all sports based on selectedEventType
      console.log(`[ExchEventsTable] useEffect triggered - fetching matches for selectedEventType:`, selectedEventType);
      fetchMatchesFromAPI();
    } else {
      // When competition is in URL, fetch and filter by series_id
      console.log(`[ExchEventsTable] useEffect triggered - competition in URL, fetching matches:`, {
        competition: pathParams["competition"],
        urlParams: window.location.search
      });
      fetchMatchesFromAPI();
    }
  }, [selectedEventType.id, selectedEventType.slug, pathParams["competition"], pathLocation?.search]);

  useEffect(() => {
    if (pathParams["competition"] && !events) {
      // Fetch from API when competition is selected but no events are available
      updateEvents();
    }
  }, [selectedCompetition]);

  // useEffect(() => {
  //   updateEvents();
  // }, [loggedIn]);

  useEffect(() => {
    let refreshInterval = setInterval(() => {
      // Fetch from API for all sports
      if (!pathParams["competition"]) {
        fetchMatchesFromAPI();
      } else {
      updateEvents();
      }
    }, 60 * 1000);
    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedEventType, pathParams]);

  // Unsubscribe Web socket messages
  useEffect(() => {
    unsubscribeAllWsforEvents();
    setWsChannels([]);
  }, [selectedEventType]);

  useEffect(() => {
    if (pathParams["competition"]) {
      unsubscribeAllWsforEvents();
      setWsChannels([]);
    }
  }, [selectedCompetition, pathParams]);

  useEffect(() => {
    if (loggedIn && topicUrls?.matchOddsTopic) {
      // Get sport slug from URL to dynamically determine if we should subscribe to WebSocket
      const urlSlug = getSportSlugFromUrl();
      const sportIdFromUrl = getSportIdFromUrl();
      // Check if current sport matches URL slug or if selectedEventType matches URL
      const shouldSubscribe = 
        (urlSlug && selectedEventType.slug === urlSlug) ||
        (sportIdFromUrl && selectedEventType.id === sportIdFromUrl);
      
      if (shouldSubscribe && events) {
        updateMatchOddsTopic(
          topicUrls?.matchOddsTopic,
          topicUrls?.matchOddsBaseUrl
        );
        let subs = [...wsChannels];
        for (let event of events) {
          if (
            event.status === "IN_PLAY" &&
            !wsChannels.includes(event.eventId)
          ) {
            subs.push(event.eventId);
            subscribeWsForEventOdds(
              topicUrls?.matchOddsTopic,
              event.sportId,
              event.competitionId,
              event.eventId,
              event.matchOdds?.marketId
            );
          }
        }
        setWsChannels(subs);
      }
    }
  }, [betFairWSConnected, events, selectedEventType, loggedIn, pathLocation]);

  const getCompetitionSlug = (competitionName: string) => {
    return competitionName
      ?.toLocaleLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/ +/g, " ")
      .trim()
      .split(" ")
      .join("-");
  };

  const disableFutureEvents = (date: any) => {
    let dt = date;
    dt = moment.utc(date).toString();

    let retDate = moment(dt);
    retDate = retDate.local();

    return moment(retDate).diff(moment(), "minutes") > 60 * 24 * 2
      ? true
      : false;
  };

  const handleEventChange = (event: EventDTO) => {
    // Store market_id in sessionStorage if available for next navigation
    if (event.marketId) {
      sessionStorage.setItem("last_market_id", event.marketId);
      console.log("[ExchEventsTable] Stored market_id in sessionStorage:", event.marketId);
    }
    
    setCompetition({
      id: event.competitionId,
      name: event.competitionName,
      slug: getCompetitionSlug(event.competitionName),
    });
    setExchEvent({
      id: event.eventId,
      name: event.eventName,
      slug: event.eventSlug,
    });
    history.push(
      event?.providerName?.toLowerCase() === "sportradar" &&
        event?.catId === "SR VIRTUAL"
        ? loggedIn
          ? `/exchange_sports/virtuals/${
              selectedEventType.slug
            }/${getCompetitionSlug(event.competitionName)}/${
              event.eventSlug
            }/${btoa(
              `${event.sportId}:${event.competitionId}:${event.eventId}`
            )}`
          : "/login"
        : `/exchange_sports/${selectedEventType.slug}/${getCompetitionSlug(
            event.competitionName
          )}/${event.eventSlug}/${btoa(
            `${event.providerName}:${event.sportId}:${event.competitionId}:${
              event.eventId
            }:${moment(event.openDate).unix()}`
          )}`
    );
  };

  const getEvents = (status: Status) => {
    switch (status) {
      case Status.LIVE:
        return events.filter(
          (event) =>
            ((event?.sportId != "2" &&
              moment(event?.openDate).diff(moment(), "seconds") <= 0) ||
              event?.forcedInplay ||
              event?.status == "IN_PLAY" ||
              (event?.sportId === "2" &&
                moment(event?.openDate).diff(moment(), "minutes") <= 5)) &&
            !event.virtualEvent
        );
        break;
      case Status.UPCOMING:
        // Only show events that are truly upcoming (not started yet)
        return events.filter((event) => {
          // Exclude virtual events
          if (event.virtualEvent || event.catId === "SR VIRTUAL") return false;
          
          // Exclude events that are already in play
          if (event.status === "IN_PLAY" || event.status === "INPLAY" || event.status === "IN-PLAY") return false;
          if (event.forcedInplay || event.forcedInPlay || event.inplay || event.inPlay || event.in_play) return false;
          
          // Check if event has started based on openDate
          if (event.openDate) {
            const now = moment();
            const eventTime = moment(event.openDate);
            
            // For tennis (sportId === "2"), check if more than 5 minutes in the future
            if (event.sportId === "2") {
              return eventTime.diff(now, "minutes") > 5;
            }
            
            // For other sports, check if event time is in the future (not started yet)
            return eventTime.diff(now, "seconds") > 0;
          }
          
          // Fallback: only show if status is explicitly "UPCOMING" and not in play
          return event.status === "UPCOMING" && 
                 !event.forcedInplay && 
                 !event.forcedInPlay;
        });
        break;
      case Status.VIRTUAL:
        return events?.filter(
          (event) => event.catId === "SR VIRTUAL" || event.virtualEvent
        );
        break;
      default:
        return events;
        break;
    }
  };

  // Fetch upcoming match market details for events that don't have runner/odds data yet.
  // Triggered when user selects the Upcoming filter.
  useEffect(() => {
    const shouldEnrich =
      eventFilter === Status.UPCOMING && Array.isArray(events) && events.length > 0;
    if (!shouldEnrich) return;

    let cancelled = false;

    const enrichUpcoming = async () => {
      try {
        // Only enrich events missing matchOdds runners (common for Horse Racing / Greyhound)
        const candidates = getEvents(Status.UPCOMING).filter((e: any) => {
          const eventId = String(e?.eventId || "");
          if (!eventId) return false;
          if (enrichedUpcomingEventIdsRef.current.has(eventId)) return false;

          const hasRunners =
            (e?.matchOdds?.runners && e.matchOdds.runners.length > 0) ||
            (e?.markets?.matchOdds?.[0]?.runners &&
              e.markets.matchOdds[0].runners.length > 0);
          if (hasRunners) return false;

          const matchId = String(e?.eventId || e?.match_id || e?.matchId || "");
          const marketId = String(
            (e as any)?.market_id || (e as any)?.marketId || e?.marketId || ""
          );

          return !!matchId && !!marketId;
        });

        if (candidates.length === 0) return;

        // Limit requests per click to avoid flooding the API
        const batch = candidates.slice(0, 10);

        const parsePrice = (val: any): number | null => {
          if (val === "--" || val === null || val === undefined || val === "") return null;
          const num = typeof val === "number" ? val : parseFloat(String(val));
          return isNaN(num) ? null : num;
        };

        const results = await Promise.allSettled(
          batch.map(async (e: any) => {
            const matchId = String(e?.eventId || e?.match_id || e?.matchId || "");
            const marketId = String(
              (e as any)?.market_id || (e as any)?.marketId || e?.marketId || ""
            );

            const resp = await USABET_API.post("/match/matchDetailsOpen", {
              market_id: marketId,
              match_id: matchId,
            });

            const payload = resp?.data;
            const rows = payload?.status === true && Array.isArray(payload?.data) ? payload.data : [];
            const first = rows?.[0];

            return { eventId: String(e?.eventId || ""), details: first };
          })
        );

        if (cancelled) return;

        setEvents((prev) => {
          if (!Array.isArray(prev) || prev.length === 0) return prev;

          const next = [...prev];

          for (const res of results) {
            if (res.status !== "fulfilled") continue;
            const { eventId, details } = res.value || {};
            if (!eventId) continue;

            enrichedUpcomingEventIdsRef.current.add(eventId);

            if (!details) continue;

            const transformedRunners = (details.runners || []).map((runner: any) => {
              const availableToBack = runner.ex?.availableToBack || [];
              const availableToLay = runner.ex?.availableToLay || [];
              return {
                runnerId: String(runner.selectionId || runner.selection_id || ""),
                runnerName: runner.selection_name || runner.selectionName || runner.name || "",
                status: runner.status || "ACTIVE",
                backPrices: availableToBack
                  .map((p: any) => ({ price: parsePrice(p.price), size: parsePrice(p.size) }))
                  .filter((p: any) => p.price !== null && p.price > 0),
                layPrices: availableToLay
                  .map((p: any) => ({ price: parsePrice(p.price), size: parsePrice(p.size) }))
                  .filter((p: any) => p.price !== null && p.price > 0),
              };
            });

            const matchOdds =
              transformedRunners.length > 0
                ? {
                    marketId: details.market_id || details.marketId || "",
                    marketName: details.market_name || details.marketName || "Match Odds",
                    status: details.status || "UPCOMING",
                    runners: transformedRunners,
                  }
                : undefined;

            const idx = next.findIndex((x) => String((x as any)?.eventId) === eventId);
            if (idx >= 0) {
              next[idx] = {
                ...(next[idx] as any),
                // keep original event fields, but attach detailed runners/market status
                matchOdds: matchOdds,
                ...(details?.status ? { status: details.status } : {}),
              };
            }
          }

          return next;
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[ExchEventsTable] Failed to enrich upcoming events via matchDetailsOpen:", err);
        }
      }
    };

    enrichUpcoming();

    return () => {
      cancelled = true;
    };
  }, [eventFilter, events, pathLocation?.pathname]);

  useEffect(() => {
    setFavouriteEvents(favourites);
  });

  const GetSportIcon = ({ sportId }) => {
    const IconComponent = SportIconMapInplay[sportId];

    if (!IconComponent) {
      return null; // or a default icon/component
    }

    return (
      <div style={{ height: "fit-content", width: "fit-content" }}>
        <IconComponent width={24} height={24} className="ip-event-icon" />
      </div>
    );
  };

  return (
    <div className="events-table-ctn">
      <SEO
        title={`${BRAND_NAME}`}
        description={"Sports list"}
        name={`Sports list`}
        type={"Sports List"}
        link={pathLocation?.pathname}
      />

      {events?.length > 0 ? (
        <div className="events-table-content table-ctn">
          {(() => {
            // Get all inplay events from the current events list
            const allInplayEvents = events.filter((event) => {
              // Check if event is inplay
              const isInplay = 
                event.inplay === true || 
                event.inPlay === true || 
                event.in_play === true ||
                event.status === "IN_PLAY" || 
                event.status === "INPLAY" ||
                event.forcedInplay === true ||
                event.forcedInPlay === true;
              
              return isInplay;
            });
            
            // Filter for early inplay matches (started within last 2 hours)
            const now = moment();
            const earlyInplayEvents = allInplayEvents
              .filter((event) => {
                const matchDate = event.match_date || (event as any).matchDate;
                const openDate = event.openDate || event.open_date || matchDate;
                if (!openDate) return false;
                
                const eventTime = moment(openDate);
                const hoursSinceStart = now.diff(eventTime, "hours");
                
                // Only include matches that started within the last 2 hours (early inplay)
                return hoursSinceStart >= 0 && hoursSinceStart <= 2;
              })
              .sort((a, b) => {
                // Sort by match date ascending (earliest first)
                const aDate = a.customOpenDate
                  ? moment(a.customOpenDate)
                  : moment(a.openDate || (a as any).match_date);
                const bDate = b.customOpenDate
                  ? moment(b.customOpenDate)
                  : moment(b.openDate || (b as any).match_date);
                return aDate.diff(bDate, "seconds");
              })
              .slice(0, 10); // Limit to max 10 items
            
            return earlyInplayEvents.length > 0 ? (
            <Tabs variant="scrollable" className="favourite-events">
                {earlyInplayEvents.map((event, index) => (
                <button
                    key={`early-inplay-${event.eventId}-${index}`}
                  className="favourite-event-item"
                  onClick={() => handleEventChange(event)}
                >
                  <span className="event-name">
                    {event?.customEventName
                      ? event.customEventName
                      : event.eventName}
                  </span>
                </button>
              ))}
            </Tabs>
            ) : null;
          })()}
          <TableContainer component={Paper}>
            <Table className="events-table">
              <TableHead className="et-head">
                <TableRow className="status-btns">
                  <TableCell colSpan={12} className="status-btns-cell">
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 8px",
                      }}
                    >
                      <div className="icon-and-name">
                        <GetSportIcon sportId={selectedEventType?.id} />
                        <div className="ip-event-name">
                          {
                            langData?.[
                              getSportLangKeyByName(selectedEventType?.name)
                            ]
                          }{" "}
                        </div>
                      </div>
                      <div
                        style={{
                          alignItems: "center",
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <Button
                          className={
                            eventFilter === Status.LIVE
                              ? "active status-btn"
                              : "status-btn"
                          }
                          onClick={() =>
                            setEventFilter(
                              eventFilter === Status.LIVE ? null : Status.LIVE
                            )
                          }
                        >
                          {eventFilter === Status.LIVE ? (
                            <Check style={{ height: "16px" }} />
                          ) : (
                            <AddIcon style={{ height: "16px" }} />
                          )}
                          Live
                        </Button>
                        <Button
                          className={
                            eventFilter === Status.VIRTUAL
                              ? "active status-btn"
                              : "status-btn"
                          }
                          onClick={() =>
                            setEventFilter(
                              eventFilter === Status.VIRTUAL
                                ? null
                                : Status.VIRTUAL
                            )
                          }
                        >
                          {eventFilter === Status.VIRTUAL ? (
                            <Check style={{ height: "16px" }} />
                          ) : (
                            <AddIcon style={{ height: "16px" }} />
                          )}
                          Virtual
                        </Button>
                        <Button
                          className={
                            eventFilter === Status.UPCOMING
                              ? "active status-btn"
                              : "status-btn"
                          }
                          onClick={() =>
                            setEventFilter(
                              eventFilter === Status.UPCOMING
                                ? null
                                : Status.UPCOMING
                            )
                          }
                        >
                          {eventFilter === Status.UPCOMING ? (
                            <Check style={{ height: "16px" }} />
                          ) : (
                            <AddIcon style={{ height: "16px" }} />
                          )}
                          Upcoming
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {getEvents(eventFilter).map((sEvent, idx) => (
                  <TableRow
                    key={sEvent?.eventId}
                    className="bgc-white markets-team-cell-pointer"
                    onClick={() => handleEventChange(sEvent)}
                  >
                    <TableCell className="teams-cell mob-et-b-c ">
                      <div
                        className="all-markets-nav-link"
                        key={"all-markets-link"}
                      >
                        {sEvent.homeTeam !== "" && sEvent.awayTeam !== "" ? (
                          <>
                            {!isMobile && (
                              <div className="web-view team-name-ctn">
                                <div className="temas-col">
                                  <EventDateDisplay
                                    openDate={
                                      sEvent?.customOpenDate
                                        ? sEvent?.customOpenDate
                                        : sEvent?.openDate
                                    }
                                    forcedInplay={sEvent?.forcedInplay}
                                    status={sEvent?.status}
                                    sportId={sEvent?.sportId}
                                  />
                                  <EventName
                                    eventName={sEvent?.customEventName
                                      ? sEvent?.customEventName
                                      : sEvent?.eventName}
                                    homeTeam={sEvent.homeTeam}
                                    awayTeam={sEvent?.awayTeam}
                                    openDate={
                                      sEvent?.customOpenDate
                                        ? sEvent?.customOpenDate
                                        : sEvent?.openDate
                                    }
                                    forcedInplay={sEvent?.forcedInplay}
                                    status={sEvent?.status}
                                    sportId={sEvent?.sportId}
                                  />
                                </div>
                                <div className="enabled-markets">
                                  <MarketEnabled
                                    marketEnabled={
                                      sEvent?.catId === "SR VIRTUAL"
                                    }
                                    marketType={"V"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={
                                      sEvent?.enablePremium &&
                                      sEvent?.catId !== "SR VIRTUAL"
                                    }
                                    marketType={"P"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.enableMatchOdds}
                                    marketType={"MO"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.enableBookmaker}
                                    marketType={"BM"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.enableFancy}
                                    marketType={"F"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.enableToss}
                                    marketType={"T"}
                                  />
                                  <MarketEnabled
                                    marketEnabled={
                                      sEvent?.virtualEvent &&
                                      sEvent.catId != "VIRTUAL"
                                    }
                                    marketType={"V2"}
                                  />
                                </div>
                              </div>
                            )}
                            {isMobile && (
                              <div className="mob-view">
                                <div className="event-details-ctn">
                                  <div className="event-name mob-event-name">
                                    <div className="event-name-and-link">
                                      <EventName
                                        eventName={
                                          sEvent?.customEventName
                                            ? sEvent?.customEventName
                                            : sEvent?.eventName
                                        }
                                        openDate={
                                          sEvent?.customOpenDate
                                            ? sEvent?.customOpenDate
                                            : sEvent?.openDate
                                        }
                                        forcedInplay={sEvent?.forcedInplay}
                                        status={sEvent?.status}
                                        sportId={sEvent?.sportId}
                                      />
                                    </div>
                                  </div>

                                  <div className="enabled-markets">
                                    <MarketEnabled
                                      marketEnabled={
                                        sEvent?.catId === "SR VIRTUAL"
                                      }
                                      marketType={"V"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={
                                        sEvent?.enablePremium &&
                                        sEvent?.catId !== "SR VIRTUAL"
                                      }
                                      marketType={"P"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.enableMatchOdds}
                                      marketType={"MO"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.enableBookmaker}
                                      marketType={"BM"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.enableFancy}
                                      marketType={"F"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.enableToss}
                                      marketType={"T"}
                                    />
                                    <MarketEnabled
                                      marketEnabled={
                                        sEvent?.virtualEvent &&
                                        sEvent.catId != "VIRTUAL"
                                      }
                                      marketType={"V2"}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="team-name">
                            <div className="temas-col">
                              <EventDateDisplay
                                openDate={
                                  sEvent?.customOpenDate
                                    ? sEvent?.customOpenDate
                                    : sEvent?.openDate
                                }
                                forcedInplay={sEvent.forcedInplay}
                                status={sEvent?.status}
                                sportId={sEvent?.sportId}
                              />
                              <div className="team-names">
                                {sEvent.eventName}
                              </div>
                            </div>
                            <div className="enabled-markets">
                              <MarketEnabled
                                marketEnabled={sEvent?.catId === "SR VIRTUAL"}
                                marketType={"V"}
                              />
                              <MarketEnabled
                                marketEnabled={
                                  sEvent?.enablePremium &&
                                  sEvent?.catId !== "SR VIRTUAL"
                                }
                                marketType={"P"}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.enableMatchOdds}
                                marketType={"MO"}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.enableBookmaker}
                                marketType={"BM"}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.enableFancy}
                                marketType={"F"}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.enableToss}
                                marketType={"T"}
                              />
                              <MarketEnabled
                                marketEnabled={
                                  sEvent?.virtualEvent &&
                                  sEvent.catId != "VIRTUAL"
                                }
                                marketType={"V2"}
                              />
                            </div>
                          </div>
                        )}
                        {isMobile && (
                          <div className="mob-odds-row new-odds-row">
                            <EventDateDisplay
                              openDate={
                                sEvent?.customOpenDate
                                  ? sEvent?.customOpenDate
                                  : sEvent?.openDate
                              }
                              forcedInplay={sEvent?.forcedInplay}
                              status={sEvent?.status}
                              sportId={sEvent?.sportId}
                            />
                            {teamTypes.map((teamType, index) => (
                              <div
                                className="mob-odds-block"
                                key={teamType + index}
                              >
                                <div className="mob-exchange-btn-odd-row">
                                  {sEvent.matchOdds ? (
                                    getOdds(sEvent, teamType) ? (
                                      <>
                                        {getOdds(sEvent, teamType).map(
                                          (odd) => (
                                            <ExchMobOddView
                                              mainValue={odd.price}
                                              oddType={
                                                odd.type === "back-odd"
                                                  ? "back-odd"
                                                  : "lay-odd"
                                              }
                                              disable={
                                                sEvent.matchOdds.status
                                                  .toLowerCase()
                                                  .includes("suspended") ||
                                                disableFutureEvents(
                                                  sEvent.openDate
                                                )
                                              }
                                            />
                                          )
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <ExchMobOddView
                                          mainValue={null}
                                          oddType="back-odd"
                                          disable={true}
                                        />
                                        <ExchMobOddView
                                          mainValue={null}
                                          oddType="lay-odd"
                                          disable={true}
                                        />
                                      </>
                                    )
                                  ) : (
                                    <>
                                      <ExchMobOddView
                                        mainValue={null}
                                        oddType="back-odd"
                                        disable={true}
                                      />
                                      <ExchMobOddView
                                        mainValue={null}
                                        oddType="lay-odd"
                                        disable={true}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {teamTypes.map((teamType, index) => (
                      <TableCell
                        className="odds-cell"
                        align="center"
                        colSpan={2}
                        key={teamType + index}
                      >
                        {sEvent.matchOdds ? (
                          getOdds(sEvent, teamType) ? (
                            <div className="odds-block">
                              {getOdds(sEvent, teamType).map((odd, idx) => (
                                <ExchOddBtn
                                  key={idx}
                                  mainValue={odd.price}
                                  subValue={odd.size}
                                  oddType={
                                    odd.type === "back-odd"
                                      ? "back-odd"
                                      : "lay-odd"
                                  }
                                  valueType="matchOdds"
                                  showSubValueinKformat={true}
                                  disable={
                                    sEvent.matchOdds.status
                                      .toLowerCase()
                                      .includes("suspended") ||
                                    disableFutureEvents(sEvent.openDate)
                                  }
                                  onClick={() => null}
                                />
                              ))}
                            </div>
                          ) : (
                            <EmptyOddsBlock />
                          )
                        ) : (
                          <EmptyOddsBlock />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {getEvents(eventFilter).length === 0 && !fetchingEvents && (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="no-data-cell"
                      style={{
                        textAlign: "center",
                        textTransform: "uppercase",
                        padding: "16px 0 16px 0",
                        fontWeight: "bold",
                      }}
                    >
                      {langData?.["no_data_to_display"]?.toLowerCase()} for{" "}
                      {langData?.[eventFilter?.toLowerCase()]?.toLowerCase()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : !fetchingEvents ? (
        <NoDataComponent
          title={langData?.["no_events_display_txt"]}
          bodyContent={langData?.["no_events_placed"]}
          noDataImg={NoEventsIcon}
        />
      ) : null}
    </div>
  );
};

function EmptyOddsBlock() {
  return (
    <React.Fragment>
      <div className="odds-block">
        <ExchOddBtn mainValue={null} oddType="back-odd" />
        <ExchOddBtn mainValue={null} oddType="lay-odd" />
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state: RootState) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;

  // Get sport ID for filtering - handle horseracing (sport_id "7")
  // For horseracing, use "7" directly (not mapped)
  const sportIdForFilter = eventType.id === "7" || eventType.slug === "horseracing"
    ? "7"
    : (SPToBFIdMap[eventType.id] ? SPToBFIdMap[eventType.id] : eventType.id);

  const eventsFromRedux = getExchangeEvents(
      state.exchangeSports.events,
    sportIdForFilter,
      competition.id
  ) || [];
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[mapStateToProps] Getting events from Redux:`, {
      eventTypeId: eventType.id,
      eventTypeSlug: eventType.slug,
      sportIdForFilter: sportIdForFilter,
      competitionId: competition.id,
      eventsCount: eventsFromRedux.length,
      hasEventsInRedux: !!state.exchangeSports.events[sportIdForFilter],
      allSportIdsInRedux: Object.keys(state.exchangeSports.events || {}),
    });
  }

  return {
    events: eventsFromRedux,
    selectedEventType: eventType,
    selectedCompetition: competition,
    fetchingEvents: state.exchangeSports.fetchingEvents,
    allowedConfig: state.common.allowedConfig,
    topicUrls: state?.exchangeSports?.topicUrls,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
    loading: state.auth.loading,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchEventsByCompetition: (
      sportId: string,
      competitionId: string,
      events: EventDTO[]
    ) => dispatch(fetchEventsByCompetition(sportId, competitionId, events)),
    setExchEvent: (event: SelectedObj) => dispatch(setExchEvent(event)),
    setCompetition: (competition: SelectedObj) =>
      dispatch(setCompetition(competition)),
    // addExchangeBet: (data: BsData) => dispatch(addExchangeBet(data)),
    fetchEventsBySport: (sportId: string, events: EventDTO[]) =>
      dispatch(fetchEventsBySport(sportId, events)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsTable);
