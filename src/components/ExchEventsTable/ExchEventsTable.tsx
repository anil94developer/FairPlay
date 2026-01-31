import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import React, { useEffect, useState } from "react";
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
    if (!eventData?.matchOdds?.runners) {
      return [];
    }
    for (let runner of eventData.matchOdds.runners) {
      if (
        runner.runnerName.toLowerCase() === team.toLowerCase() ||
        runner.runnerName.toLowerCase().includes(team.toLowerCase())
      ) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices[0]?.price,
            size: runner?.backPrices[0]?.size,
            outcomeId: runner.runnerId,
            outcomeName: runner.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices[0]?.price,
            size: runner?.layPrices[0]?.size,
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
        return EXCH_SPORTS_MAP[slug];
      }
      const sportType = EXCHANGE_EVENT_TYPES.find(
        (sport) => sport.slug.toLowerCase() === slug
      );
      if (sportType) {
        return sportType.id;
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
        alert(urlSlug + " " + urlSportId);
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

        console.log(`[ExchEventsTable] Filtering by URL:`, {
          urlSlug: urlSlug,
          urlSportId: urlSportId,
          targetSportId: targetSportId,
          targetSportName: targetSportName,
          totalMatches: allMatches.length,
        });
       
        // Filter by sport from URL (e.g., cricket, football, etc.)
        if (urlSlug && urlSportId) {
         
          filteredMatches = allMatches.filter((match: any) => {
            const apiSportId = String(match.sport_id || match.sportId || "").trim();
            const apiSportName = String(match.sport_name || match.sportName || "").trim();
            
            // Match by sport ID (exact match)
            const idMatch = apiSportId === targetSportId;
            
            // Match by sport name (case-insensitive)
            const normalizedApiSportName = apiSportName.toLowerCase();
            const normalizedTargetSportName = targetSportName.toLowerCase();
            const nameMatch = apiSportName && targetSportName &&
              (normalizedApiSportName === normalizedTargetSportName ||
               normalizedApiSportName.includes(normalizedTargetSportName) ||
               normalizedTargetSportName.includes(normalizedApiSportName));
            
            // Require both ID and name to match for strict filtering
            return idMatch && nameMatch;
          });

          console.log(`[ExchEventsTable] Filtered by sport:`, {
            sport: targetSportName,
            filteredCount: filteredMatches.length,
            sampleMatch: filteredMatches[0] ? {
              sportId: filteredMatches[0].sport_id || filteredMatches[0].sportId,
              sportName: filteredMatches[0].sport_name || filteredMatches[0].sportName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
          });
        }

        // Filter by competition if competition is selected
        if (pathParams["competition"] && selectedCompetition.id) {
          filteredMatches = filteredMatches.filter((match: any) => {
            const competitionId = String(match.series_id || match.competitionId || match.competition_id || "").trim();
            return competitionId === selectedCompetition.id;
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
    } catch (error) {
      console.error("Error fetching events in updateEvents:", error);
      setEvents([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Fetch matches from API based on selected sport
  const fetchMatchesFromAPI = async () => {
    if (!selectedEventType.id) {
      return;
    }

    setLoadingMatches(true);
    try {
      const response = await USABET_API.get("/match/homeMatchesV2");

      // Handle different API response structures:
      // Structure 1: { data: [...], status: true } - response.data.data is array, response.data.status is true
      // Structure 2: { data: { data: [...], status: true } } - nested
      // Structure 3: response.data is directly the array
      let allMatches: any[] = [];
      
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

      console.log(`[ExchEventsTable] Extracted matches:`, {
        count: allMatches.length,
        firstMatch: allMatches[0],
      });

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

        // Filter by sport from URL (e.g., cricket, football, etc.)
        let filteredMatches = allMatches;
        if (urlSlug && urlSportId) {
          filteredMatches = allMatches.filter((match: any) => {
            const apiSportId = String(match.sport_id || match.sportId || "").trim();
            const apiSportName = String(match.sport_name || match.sportName || "").trim();
            
            // Match by sport ID (exact match)
            const idMatch = apiSportId === targetSportId;
            
            // Match by sport name (case-insensitive)
            const normalizedApiSportName = apiSportName.toLowerCase();
            const normalizedTargetSportName = targetSportName.toLowerCase();
            const nameMatch = apiSportName && targetSportName &&
              (normalizedApiSportName === normalizedTargetSportName ||
               normalizedApiSportName.includes(normalizedTargetSportName) ||
               normalizedTargetSportName.includes(normalizedApiSportName));
            
            // Require both ID and name to match for strict filtering
            return idMatch && nameMatch;
          });

          console.log(`[ExchEventsTable] fetchMatchesFromAPI - Filtered by URL sport:`, {
            urlSlug: urlSlug,
            urlSportId: urlSportId,
            targetSportId: targetSportId,
            targetSportName: targetSportName,
            totalMatches: allMatches.length,
            filteredCount: filteredMatches.length,
            sampleMatch: filteredMatches[0] ? {
              sportId: filteredMatches[0].sport_id || filteredMatches[0].sportId,
              sportName: filteredMatches[0].sport_name || filteredMatches[0].sportName,
              matchName: filteredMatches[0].match_name || filteredMatches[0].matchName,
            } : null,
          });
    } else {
          console.log(`[ExchEventsTable] fetchMatchesFromAPI - No URL filter, showing all matches:`, {
            urlPath: pathLocation?.pathname,
            totalMatches: allMatches.length,
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
          const apiSportId = match.sport_id || match.sportId || "";
          const apiSportName = match.sport_name || match.sportName || "";

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
          setEvents(transformedEvents);
          
          // Also update Redux store for compatibility
          if (!pathParams["competition"]) {
            const currentSportId = selectedEventType.id;
            const sportIdToUse = SPToBFIdMap[currentSportId]
              ? SPToBFIdMap[currentSportId]
              : currentSportId;
            fetchEventsBySport(sportIdToUse, transformedEvents);
          }
        } else {
          console.log(`[ExchEventsTable] No matches found, clearing events`);
          setEvents([]);
        }
      } else {
        console.warn(`[ExchEventsTable] No matches found in API response`, {
          responseData: response?.data,
          responseStatus: response?.status,
          dataIsArray: Array.isArray(response?.data),
          dataDataIsArray: Array.isArray(response?.data?.data),
          dataStatus: response?.data?.status,
        });
        // Clear events in local state
        setEvents([]);
        // Also clear Redux store
        if (!pathParams["competition"]) {
          const sportIdToUse = SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
            : selectedEventType.id;
          fetchEventsBySport(sportIdToUse, []);
        }
      }
    } catch (error) {
      console.error("Error fetching matches from API:", error);
      // Clear events in local state on error
      setEvents([]);
      // Also clear Redux store
      if (!pathParams["competition"]) {
        const sportIdToUse = SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
          : selectedEventType.id;
        fetchEventsBySport(sportIdToUse, []);
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
    }
  }, [selectedEventType.id, selectedEventType.slug]);

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
        return events.filter(
          (event) => event.status === "UPCOMING" && !event.virtualEvent
        );
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
          {favouriteEvents?.length > 0 && (
            <Tabs variant="scrollable" className="favourite-events">
              {favouriteEvents.map((event) => (
                <button
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
          )}
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

  return {
    events: getExchangeEvents(
      state.exchangeSports.events,
      SPToBFIdMap[eventType.id] ? SPToBFIdMap[eventType.id] : eventType.id,
      competition.id
    ),
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
