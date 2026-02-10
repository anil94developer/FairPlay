import { IonRow, IonCol } from "@ionic/react";
import React, { useCallback, useEffect, useState } from "react";
import InplayEventsTable from "../../components/ExchEventsTable/ExchInplayEventsTable";
import "./ExchInplayEventsView.scss";
import {
  clearAllEvents,
  clearExchcngeBets,
  fetchInplayEvents,
  fetchEventsInDateRange,
  getInplayEvents,
} from "../../store";
import { connect } from "react-redux";
import { EventDTO } from "../../models/common/EventDTO";
import { RootState } from "../../models/RootState";
import SEO from "../../components/SEO/Seo";
import { BRAND_DOMAIN, BRAND_NAME } from "../../constants/Branding";
import { useHistory, useLocation } from "react-router";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import {
  eventTypesNameMap,
  getCupWinnerEvents,
  getExchangeEvents,
  getUpcomingEvents,
} from "../../store/exchangeSports/exchangeSportsSelectors";
import moment from "moment";
type Notification = {
  message: string;
};
// import "../../assets/global_styles/marquee.scss";
import AdminNotification from "../../components/AdminNotifications/AdminNotification";
import CloseIcon from "@material-ui/icons/Close";
import ScrollIcons from "../../assets/images/Notifications/notifi-scroll-icon.svg";
import { AuthResponse } from "../../models/api/AuthResponse";
// import { Carousel } from 'react-responsive-carousel';
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";

// import ExchangeAllMarkets from '../ExchSportsBook/ExchangeAllMarkets';
import SocialMediaNew from "../../components/SocialMediaNew/SocialMediaNew";
import { useWindowSize } from "../../hooks/useWindowSize";
import { CancelRounded } from "@material-ui/icons";

import { sideHeaderTabs } from "../../components/SideHeader/SideHeaderUtil";
import { Tabs } from "@material-ui/core";
import { BFToSRIdMap, SportIconMap, SPToBFIdMap } from "../../util/stringUtil";
import { ReactComponent as NotificationsIcon } from "../../assets/images/icons/notification_icon.svg?react";
import { inplayEvents as mockDataSource } from "../../description/inplayEvents";
import { favourites } from "../../description/favourites";
import { notificationsData } from "../../description/notificationsData";
import {
  fetchFavEvents,
  setCompetition,
  setEventType,
  setExchEvent,
} from "../../store/exchangeSports/exchangeSportsActions";
import USABET_API from "../../api-services/usabet-api";
import { fetchSportsFromAPI, transformSportsToTabs, SportTabData } from "../../util/sportsApiUtil";

type InplayEventsObj = {
  sportId: string;
  sportName: string;
  sportSlug: string;
  events: EventDTO[];
};

type StoreProps = {
  clearAllEvents: () => void;
  clearExchcngeBets: () => void;
  // inplayEvents: InplayEventsObj[];
  upcomingEvents: InplayEventsObj[];
  cupWinnerEvents: InplayEventsObj[];
  fetchInplayEvents: () => void;
  fetchEventsInDateRange: (startDate, endDate) => void;
  loggedIn: boolean;
  notificationUpdated: number;
  langData: any;
  setCompetition: Function;
  setExchEvent: Function;
};

enum Status {
  LIVE_MATCH = "LIVE_MATCH",
  UPCOMING = "UPCOMING",
  CUP_WINNER = "CUP_WINNER",
  SPORT = "SPORT",
}

const ExchInplayEventsView: React.FC<StoreProps> = (props) => {
  const {
    clearAllEvents,
    clearExchcngeBets,
    upcomingEvents,
    cupWinnerEvents,
    fetchInplayEvents,
    fetchEventsInDateRange,
    loggedIn,
    notificationUpdated,
    langData,
    setCompetition,
    setExchEvent,
  } = props;
  
  const history = useHistory();
  const pathLocation = useLocation();
  const [statusNew, setStatusNew] = useState<Status>(Status.LIVE_MATCH);
  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [selectedSport, setSelectedSport] = useState<string>();
  const [carouselBanners, setCarouselBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);
  const [favouriteEvents, setFavouriteEvents] = useState<EventDTO[]>([]);
  const [inplayEvents, setInplayEvents] = useState<InplayEventsObj[]>([]);
  const [upcomingEventsFromAPI, setUpcomingEventsFromAPI] = useState<InplayEventsObj[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sportsTabs, setSportsTabs] = useState<SportTabData[]>(sideHeaderTabs);
  const windowSize = useWindowSize();

  const getSportTabLabel = (sport: SportTabData): string => {
    const candidates = [sport?.langKey, sport?.text].filter(Boolean) as string[];
    for (const key of candidates) {
      const val = langData?.[key];
      if (val) return val;
    }

    // Fallback: derive from route slug or raw text
    const routeSlug =
      typeof sport?.route === "string" && sport.route.includes("/exchange_sports/")
        ? sport.route.split("/exchange_sports/")[1]?.split("/")[0]
        : "";
    const raw = routeSlug || sport?.text || sport?.langKey || "Sport";

    return String(raw)
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const updateEvents = useCallback((statusnew) => {
    switch (statusnew) {
      case Status.LIVE_MATCH:
        // fetchInplayEvents(); // Removed fetchInplayEvents call
        break;
      case Status.UPCOMING:
        fetchUpcomingEvents();
        break;
      case Status.CUP_WINNER:
        // fetchInplayEvents();
        break;
    }
  }, []);

  const isMobile = window.innerWidth > 1120 ? false : true;

  const fetchNotifications = async () => {
    // const response = await SVLS_API.get("/catalog/v2/notifications/", {
    //   headers: {
    //     Authorization: sessionStorage.getItem("jwt_token"),
    //   },
    //   params: {
    //     type: "ACTIVE",
    //   },
    // });
    setNotifications(notificationsData);
  };

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    try {
      // Fetch upcoming matches for all sports from API
      const response = await USABET_API.get("/match/homeMatchesV2");
      
      // Handle different API response structures
      let allMatches: any[] = [];
      
      if (response?.data?.status === true && Array.isArray(response.data.data)) {
        allMatches = response.data.data;
      } else if (Array.isArray(response?.data?.data) && response?.data?.status === true) {
        allMatches = response.data.data;
      } else if (Array.isArray(response?.data)) {
        allMatches = response.data;
      } else if (response?.data && typeof response.data === 'object') {
        const dataKeys = Object.keys(response.data);
        for (const key of dataKeys) {
          if (Array.isArray(response.data[key])) {
            allMatches = response.data[key];
            break;
          }
        }
      }

      // Filter for upcoming events only (not in-play, not finished)
      const upcomingMatches = allMatches.filter((event: any) => {
        // Exclude in-play events
        if (event.inplay === true || event.inPlay === true || event.in_play === true) {
          return false;
        }
        
        const status = String(event.status || "").toUpperCase();
        if (status === "IN_PLAY" || status === "INPLAY" || status === "IN-PLAY") {
          return false;
        }
        
        // Exclude finished/closed events
        if (status === "FINISHED" || status === "CLOSED" || status === "SETTLED") {
          return false;
        }
        
        // Include upcoming events
        if (status === "UPCOMING" || status === "OPEN") {
          return true;
        }
        
        // Check if event date is in the future
        const matchDate = event.match_date || event.matchDate || event.openDate || event.open_date;
        if (matchDate) {
          const eventDate = moment(matchDate);
          const now = moment();
          // Include events that start in the future (at least 1 minute from now)
          return eventDate.diff(now, "minutes") > 1;
        }
        
        return false;
      });

      // Group upcoming matches by sport
      const groupedBySport = new Map<string, InplayEventsObj>();
      
      // Sport ID mapping from API response
      const sportIdMap: { [key: string]: { name: string; slug: string } } = {
        "4": { name: "Cricket", slug: "cricket" },
        "1": { name: "Soccer", slug: "football" },
        "2": { name: "Tennis", slug: "tennis" },
        "7": { name: "Horse Racing", slug: "horseracing" },
        "4339": { name: "Greyhound Racing", slug: "greyhound" },
      };

      upcomingMatches.forEach((event: any) => {
        const sportId = event.sportId || event.sport_id || "";
        const sportInfo = sportIdMap[sportId];
        
        // Only process sports from the API response (exclude Casino, QTech, etc.)
        if (!sportInfo || sportId === "-100" || sportId === "QT") {
          return;
        }

        if (!groupedBySport.has(sportId)) {
          groupedBySport.set(sportId, {
            sportId: sportId,
            sportName: sportInfo.name,
            sportSlug: sportInfo.slug,
            events: [],
          });
        }

        const sport = groupedBySport.get(sportId)!;
        
        // Get event name
        let eventName = event.match_name || event.matchName || event.eventName || event.event_name || "";
        let homeTeam = event.homeTeam || event.home_team || "";
        let awayTeam = event.awayTeam || event.away_team || "";
        
        if (!homeTeam || !awayTeam) {
          const matchNameParts = eventName.split(/\s+v(?:s)?\s+/i);
          if (matchNameParts.length === 2) {
            homeTeam = matchNameParts[0]?.trim() || "";
            awayTeam = matchNameParts[1]?.trim() || "";
          }
        }
        
        if (!eventName && homeTeam && awayTeam) {
          eventName = `${homeTeam} V ${awayTeam}`;
        } else if (!eventName) {
          eventName = event.eventId || event.event_id || "Event";
        }

        const matchDate = event.match_date || event.matchDate;
        const openDate = event.openDate || event.open_date || matchDate || new Date().toISOString();

        // Transform runners
        const transformedRunners = (event.runners || []).map((runner: any) => {
          const availableToBack = runner.ex?.availableToBack || [];
          const availableToLay = runner.ex?.availableToLay || [];
          
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
              .filter((p: any) => p.price !== null),
            layPrices: availableToLay
              .filter((price: any) => {
                const priceVal = parsePrice(price.price);
                return priceVal !== null && priceVal > 0;
              })
              .map((price: any) => ({
                price: parsePrice(price.price),
                size: parsePrice(price.size),
              }))
              .filter((p: any) => p.price !== null),
          };
        });

        const matchOdds = transformedRunners.length > 0 ? {
          marketId: event.market_id || event.marketId || "",
          marketName: event.market_name || event.marketName || "Match Odds",
          status: event.status || "UPCOMING",
          runners: transformedRunners,
        } : undefined;

        const eventDTO: EventDTO = {
          eventId: event.eventId || event.event_id || event.match_id || "",
          eventName: eventName,
          eventSlug: eventName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
          sportId: sportId,
          sportName: sportInfo.name,
          competitionId: event.competitionId || event.competition_id || event.series_id || "",
          competitionName: event.competitionName || event.competition_name || event.series_name || "",
          openDate: openDate,
          status: "UPCOMING",
          providerName: event.providerName || event.provider_name || "BetFair",
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          matchOdds: matchOdds as any,
        };

        sport.events.push(eventDTO);
      });

      // Convert map to array and sort by sport priority
      const upcomingEventsArray = Array.from(groupedBySport.values());
      
      // Sort events within each sport by date
      upcomingEventsArray.forEach((sport) => {
        sport.events.sort((a, b) => {
          const aDate = moment(a.openDate);
          const bDate = moment(b.openDate);
          return aDate.diff(bDate, "seconds");
        });
      });

      // Sort sports by priority (Cricket, Soccer, Tennis, Horse Racing, Greyhound)
      const sportPriority: { [key: string]: number } = {
        "4": 1,    // Cricket
        "1": 2,    // Soccer
        "2": 3,    // Tennis
        "7": 4,    // Horse Racing
        "4339": 5, // Greyhound
      };
      
      upcomingEventsArray.sort((a, b) => {
        const priorityA = sportPriority[a.sportId] || 999;
        const priorityB = sportPriority[b.sportId] || 999;
        return priorityA - priorityB;
      });

      console.log("[ExchInplayEventsView] Upcoming events fetched:", {
        totalMatches: upcomingMatches.length,
        sportsCount: upcomingEventsArray.length,
        eventsBySport: upcomingEventsArray.map(s => ({ sport: s.sportName, count: s.events.length }))
      });

      // Update state with upcoming events from API
      setUpcomingEventsFromAPI(upcomingEventsArray);
      
    } catch (error) {
      console.error("[ExchInplayEventsView] Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearAllEvents();
    clearExchcngeBets();
  }, []);

  useEffect(() => {
    updateEvents(statusNew);
  }, [statusNew]);

  // Fetch upcoming events on component mount for /exchange_sports page
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    setFavouriteEvents(favourites);
  });

  useEffect(() => {
    loggedIn && fetchNotifications();
  }, [loggedIn, notificationUpdated]);

  useEffect(() => {
    // Fetch sports from API to include Casino and QTech/Diamond
    const fetchSports = async () => {
      const sports = await fetchSportsFromAPI();
      if (sports.length > 0) {
        const transformedTabs = transformSportsToTabs(sports);
        setSportsTabs(transformedTabs);
      }
    };
    fetchSports();
  }, []);

  // Sport ID mapping for filtering
  const sportIdMap: { [key: string]: string[] } = {
    "4": ["4"], // Cricket
    "1": ["1"], // Football
    "2": ["2"], // Tennis
    "99994": ["99994"], // Kabaddi
    "sr:sport:2": ["sr:sport:2", "7511"], // Basketball (also includes some Baseball IDs)
    "7511": ["7511"], // Baseball
    "4339": ["4339"], // GreyHound
    "7": ["7"], // Horse Race
  };

  const fetchInplayMatches = async () => {
    setLoading(true);
    try {
      const response = await USABET_API.get("/match/homematchesV2");

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
          console.warn("[ExchInplayEventsView] Invalid token detected, redirecting to login");
          sessionStorage.clear();
          history.replace("/login");
          setLoading(false);
          return;
        }
      }

      // Handle different API response structures
      let allMatches: any[] = [];
      
      console.log(`[ExchInplayEventsView] API Response structure:`, {
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
      } else if (response?.data && typeof response.data === 'object') {
        // If response.data is an object, try to find an array property
        const dataKeys = Object.keys(response.data);
        for (const key of dataKeys) {
          if (Array.isArray(response.data[key])) {
            allMatches = response.data[key];
            break;
          }
        }
      }

      console.log(`[ExchInplayEventsView] Extracted matches:`, {
        count: allMatches.length,
        firstMatch: allMatches[0],
      });

      if (allMatches.length > 0) {
        // Filter for inplay events only - strict filtering
        const inplayEvents = allMatches.filter((event: any) => {
          // Primary check: inplay flag (most reliable indicator)
          if (event.inplay === true || event.inPlay === true || event.in_play === true) {
            return true;
          }
          
          // Secondary check: status is IN_PLAY or INPLAY
          const status = String(event.status || "").toUpperCase();
          if (status === "IN_PLAY" || status === "INPLAY" || status === "IN-PLAY") {
            return true;
          }
          
          // Tertiary check: forcedInplay flag (manually set to inplay)
          if (event.forcedInplay === true || event.forcedInPlay === true || event.forced_inplay === true) {
            return true;
          }
          
          // Exclude events that are explicitly not inplay
          if (status === "UPCOMING" || status === "SUSPENDED" || status === "CLOSED" || status === "FINISHED") {
            return false;
          }
          
          // Don't use date-based fallback for inplay detection - only use explicit flags
          // This ensures we only show events that are truly inplay, not just started
          return false;
        });

        // Transform API data to InplayEventsObj format
    const groupedEventsMap = new Map<string, InplayEventsObj>();

        inplayEvents.forEach((event: any) => {
      // Ensure we have a valid sportId
          const sportId = event.sportId || event.sport_id || "unknown";
          const sportName = event.sportName || event.sport_name || "Unknown Sport";

          if (!groupedEventsMap.has(sportId)) {
            groupedEventsMap.set(sportId, {
              sportId: sportId,
              sportName: sportName,
              sportSlug: sportName.toLowerCase().replace(/\s+/g, "-"),
              events: [],
            });
          }

          const sport = groupedEventsMap.get(sportId)!;

          // Get event name - prioritize match_name, then eventName/event_name
          let eventName = event.match_name || event.matchName || event.eventName || event.event_name || "";
          
          // Extract homeTeam and awayTeam from match_name if not directly available
          let homeTeam = event.homeTeam || event.home_team || "";
          let awayTeam = event.awayTeam || event.away_team || "";
          
          // If team names not available, try to extract from match_name (e.g., "India v USA")
          if (!homeTeam || !awayTeam) {
            const matchNameParts = eventName.split(/\s+v(?:s)?\s+/i);
            if (matchNameParts.length === 2) {
              homeTeam = matchNameParts[0]?.trim() || "";
              awayTeam = matchNameParts[1]?.trim() || "";
            }
          }
          
          // Fallback: construct event name from teams if we have them
          if (!eventName && homeTeam && awayTeam) {
            eventName = `${homeTeam} V ${awayTeam}`;
          } else if (!eventName) {
            eventName = event.eventId || event.event_id || "Event";
          }

          // Get match date - prioritize match_date, then openDate/open_date
          const matchDate = event.match_date || event.matchDate;
          const openDate = event.openDate || event.open_date || matchDate || new Date().toISOString();

          // Transform runners from API format to matchOdds format
          // API format: runners[].selection_name, runners[].ex.availableToBack[], runners[].ex.availableToLay[]
          // Expected format: matchOdds.runners[].runnerName, matchOdds.runners[].backPrices[], matchOdds.runners[].layPrices[]
          const transformedRunners = (event.runners || []).map((runner: any) => {
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
            marketId: event.market_id || event.marketId || "",
            marketName: event.market_name || event.marketName || "Match Odds",
            status: event.status || "UPCOMING",
            runners: transformedRunners,
          } : undefined;

          // Transform to EventDTO format
          const eventDTO: EventDTO = {
            eventId: event.eventId || event.event_id || event.match_id || "",
            eventName: eventName,
            eventSlug: eventName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            sportId: sportId,
            sportName: sportName,
            competitionId: event.competitionId || event.competition_id || event.series_id || "",
            competitionName: event.competitionName || event.competition_name || event.series_name || "",
            openDate: openDate,
            status: event.status || "UPCOMING",
            providerName: event.providerName || event.provider_name || "BetFair",
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            marketId: event.marketId || event.market_id || "",
            markets: event.markets || {},
            enabled: event.enabled !== false,
            forcedInplay: event.forcedInplay || event.forced_inplay || false,
            virtualEvent: event.virtualEvent || event.virtual_event || false,
            favorite: event.favorite || false,
            matchOdds: matchOdds, // Add transformed matchOdds
            ...event, // Include any additional fields from API (is_lock, etc.)
          };
          
          // Debug logging for first few events
          if (sport.events.length < 3) {
            console.log(`[ExchInplayEventsView] Transformed event ${sport.events.length + 1}:`, {
              eventName,
              homeTeam,
              awayTeam,
              matchOdds: matchOdds ? {
                marketId: matchOdds.marketId,
                runnersCount: matchOdds.runners.length,
                runners: matchOdds.runners.map(r => ({
                  name: r.runnerName,
                  backPrices: r.backPrices.length,
                  layPrices: r.layPrices.length,
                })),
              } : null,
              is_lock: event.is_lock,
              status: event.status,
            });
          }

          sport.events.push(eventDTO);
        });

        // Convert map to array and sort events inside each sport by match/open date (ascending)
        const transformedInplayEvents = Array.from(groupedEventsMap.values()).map(
          (sport) => {
            const sortedEvents = [...sport.events].sort((a, b) => {
              const aDate = a.customOpenDate
                ? moment(a.customOpenDate)
                : moment(a.openDate);
              const bDate = b.customOpenDate
                ? moment(b.customOpenDate)
                : moment(b.openDate);
              return aDate.diff(bDate, "seconds");
            });

            return {
              ...sport,
              events: sortedEvents,
            };
          }
        );

        setInplayEvents(transformedInplayEvents);
      } else {
        // Fallback to mock data if API fails or returns invalid data
        console.warn("API response invalid, using fallback data");
        const groupedEventsMap = new Map<string, InplayEventsObj>();
        mockDataSource.forEach((event: any) => {
          const sportId = event.sportId || "unknown";
          if (!groupedEventsMap.has(sportId)) {
            groupedEventsMap.set(sportId, {
              sportId: sportId,
              sportName: event.sportName || "Unknown Sport",
              sportSlug: (event.sportName || "unknown")
                .toLowerCase()
                .replace(/\s+/g, "-"),
              events: [],
            });
          }
          const sport = groupedEventsMap.get(sportId)!;
          const eventDTO: EventDTO = {
            ...event,
            eventSlug: event.eventName
              ? event.eventName.toLowerCase().replace(/\s+/g, "-")
              : "",
          };
          sport.events.push(eventDTO);
        });
        setInplayEvents(Array.from(groupedEventsMap.values()));
      }
    } catch (error) {
      console.error("Error fetching inplay matches:", error);
      // Fallback to mock data on error
      const groupedEventsMap = new Map<string, InplayEventsObj>();
      mockDataSource.forEach((event: any) => {
        const sportId = event.sportId || "unknown";
      if (!groupedEventsMap.has(sportId)) {
        groupedEventsMap.set(sportId, {
          sportId: sportId,
          sportName: event.sportName || "Unknown Sport",
          sportSlug: (event.sportName || "unknown")
            .toLowerCase()
            .replace(/\s+/g, "-"),
          events: [],
        });
      }
      const sport = groupedEventsMap.get(sportId)!;
      const eventDTO: EventDTO = {
        ...event,
        eventSlug: event.eventName
          ? event.eventName.toLowerCase().replace(/\s+/g, "-")
          : "",
      };
      sport.events.push(eventDTO);
    });
      setInplayEvents(Array.from(groupedEventsMap.values()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInplayMatches();
  }, []);

  useEffect(() => {
    // Refresh inplay matches every 30 seconds
    let refreshInterval = setInterval(() => {
      if (statusNew === Status.LIVE_MATCH || statusNew === Status.SPORT) {
        fetchInplayMatches();
      } else {
      updateEvents(statusNew);
      }
    }, 30000);
    return () => {
      clearInterval(refreshInterval);
    };
  }, [statusNew]);

  const handleStatusChange = (newValue) => {
    setStatusNew(newValue);
    if (newValue === Status.LIVE_MATCH) {
      setSelectedSport(undefined); // Reset sport filter when "All" is selected
    }
  };

  const getEvents = () => {
    switch (statusNew) {
      case Status.LIVE_MATCH:
        // Show all sports when "All" is selected
        return inplayEvents
          .map((sport) => ({
            ...sport,
            events: sport.events.filter((event) =>
              event?.eventName
                ?.toLowerCase()
                .includes(searchTerm?.toLowerCase())
            ),
          }))
          .filter((sport) => sport.events.length > 0);
      case Status.UPCOMING:
        // Use upcoming events from API if available, otherwise use Redux state
        const eventsToUse = upcomingEventsFromAPI.length > 0 ? upcomingEventsFromAPI : upcomingEvents;
        return eventsToUse
          .map((sport) => ({
            ...sport,
            events: sport.events.filter((event) =>
              event?.eventName
                ?.toLowerCase()
                .includes(searchTerm?.toLowerCase())
            ),
          }))
          .filter((sport) => sport.events.length > 0);
      case Status.SPORT:
        // Filter by selected sport
        const allowedSportIds = sportIdMap[selectedSport || ""] || [selectedSport];
        return inplayEvents
          .filter((sport) => {
            // Check if sport ID matches any of the allowed IDs
            return (
              allowedSportIds.includes(sport.sportId) ||
              sport.sportId === BFToSRIdMap[selectedSport || ""] ||
              sport.sportId.split("_").join(":") === selectedSport
            );
          })
          .map((sport) => {
            const matchingEvents = sport.events.filter((event) =>
              event?.eventName
                ?.toLowerCase()
                .includes(searchTerm?.toLowerCase())
            );
            return { ...sport, events: matchingEvents };
          })
          .filter((sport) => sport.events.length > 0);

      // case Status.CUP_WINNER:
      // return cupWinnerEvents;
    }
  };

  useEffect(() => {
    console.log(getEvents());
  }, [statusNew]);

  const getNotificationMessages = (notificationsList: Notification[]) => {
    return (
      <div className="marquee-new">
        {notificationsList.map((notifi) => {
          return (
            <div className="notifi-item">
              <img
                src={ScrollIcons}
                alt=""
                className="notifi-scroll-icon"
                loading="lazy"
                style={{
                  animationDuration: `${Math.max(
                    10,
                    notifi.message.length / 5
                  )}s`,
                }}
              />
              <span
                className="notifi-mssage"
                style={{
                  animationDuration: `${Math.max(
                    10,
                    notifi.message.length / 5
                  )}s`,
                }}
              >
                {notifi.message}
              </span>
              <img
                src={ScrollIcons}
                alt=""
                className="notifi-scroll-icon"
                loading="lazy"
                style={{
                  transform: "scaleX(-1)",
                  animationDuration: `${Math.max(
                    10,
                    notifi.message.length / 5
                  )}s`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const closeStlDialog = () => {
    setShowNotificationModal(false);
  };

  const navigateToLink = (data) => {
    if (
      data?.redirectionUrl == "/exchange_sports/inplay" ||
      data?.redirectionUrl == "/casino" ||
      data?.redirectionUrl == "/exchange_sports/cricket" ||
      data?.redirectionUrl == "/exchange_sports/tennis" ||
      data?.redirectionUrl == "/exchange_sports/football"
    ) {
      history.push(data?.redirectionUrl);
    } else if (data?.redirectionUrl == "nourl") {
    } else if (data.url) {
      history.push(data.url);
    } else {
      let url = data?.redirectionUrl;
      window.open(url, "_blank");
    }
  };

  const handleEventChange = (event: EventDTO) => {
    const competitionSlug = event.competitionName
      ? event.competitionName
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-")
      : "league";
    setCompetition({
      id: event.competitionId,
      name: event.competitionName,
      slug: competitionSlug,
    });
    setExchEvent({
      id: event.eventId,
      name: event.eventName,
      slug: event.eventSlug,
    });

    if (event?.providerName?.toLowerCase() === "sportradar" && !loggedIn) {
      history.push("/login");
    } else if (event?.catId === "SR VIRTUAL") {
      history.push(
        `/exchange_sports/virtuals/${eventTypesNameMap[
          event?.sportId
        ]?.toLowerCase()}/${competitionSlug}/${event.eventSlug}/${btoa(
          `${event.sportId}:${event.competitionId}:${event.eventId}`
        )}`
      );
    } else {
      history.push(
        `/exchange_sports/${eventTypesNameMap[
          event?.sportId
        ]?.toLowerCase()}/${competitionSlug}/${event.eventSlug}/${btoa(
          `${event.providerName}:${event.sportId}:${event.competitionId}:${event.eventId}`
        )}`,
        {
          homeTeam: event?.homeTeam,
          awayTeam: event?.awayTeam,
          openDate: event?.openDate,
        }
      );
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  const clearAll = () => {
    setSearchTerm("");
  };

  return (
    <div>
      <SEO
        title={BRAND_NAME}
        name={"Inplay events page"}
        description={"Inplay events page"}
        type={"Inplay events page"}
        link={pathLocation?.pathname}
      />
      <IonRow className="exch-inplay-events-view">
        <IonCol
          sizeLg={statusNew === Status.CUP_WINNER ? "11.8" : "9"}
          sizeMd={statusNew === Status.CUP_WINNER ? "10.8" : "8"}
          sizeXs="12"
          className="exch-inplay-events-table-section"
        >
          {notifications?.length > 0 ? (
            <div className="noti-header">
              <div
                className="animation-notifi"
                onClick={() => setShowNotificationModal(true)}
              >
                <NotificationsIcon
                  className="notification-icon"
                  style={{
                    position: "absolute",
                    left: "5px",
                    zIndex: 11111,
                    height: "30px",
                    width: "30px",
                    background: "var(--notification-bg)",
                    borderRadius: "20px",
                  }}
                />
                {getNotificationMessages(notifications)}
              </div>
              <div className="search-tab">
                {/* {isMobile && searchTerm !== undefined ? ( */}
                <div className="search-games-ctn">
                  <input
                    className="search-games-input gradient-border"
                    placeholder={langData?.["search_events"]}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <CancelRounded onClick={() => clearAll()} />
                </div>
              </div>
              {/* ) : null} */}
            </div>
          ) : null}

          {(() => {
            // Get all inplay events from all sports
            const allInplayEvents = getEvents()?.flatMap((sport) => sport.events || []) || [];
            
            // Filter for early inplay matches (started within last 2 hours)
            const now = moment();
            const earlyInplayEvents = allInplayEvents
              .filter((event) => {
                const matchDate = event.match_date || event.matchDate;
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
                  : moment(a.openDate || a.match_date);
                const bDate = b.customOpenDate
                  ? moment(b.customOpenDate)
                  : moment(b.openDate || b.match_date);
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
                      {event.eventName}
                    </span>
                  </button>
                ))}
              </Tabs>
            ) : null;
          })()}
          <div className="notifi-live-upcoming-tabs">
            <div className="inplay-status-tabs">
              <div className="time-tabs">
                <Tabs variant="scrollable" scrollButtons="off">
                  <button
                    className={`inplay-tab ${
                      Status.LIVE_MATCH === statusNew
                        ? "selected-inplay-tab"
                        : ""
                    }`}
                    onClick={() => {
                      handleStatusChange(Status.LIVE_MATCH);
                    }}
                  >
                    {langData?.["all"]}
                  </button>
                  {sportsTabs?.map(
                    (sport) =>
                      sport.text !== "Multi markets" && (
                        <button
                          className={`inplay-tab ${
                            selectedSport === sport.id &&
                            Status.LIVE_MATCH !== statusNew
                              ? "selected-inplay-tab"
                              : ""
                          }`}
                          onClick={() => {
                            setStatusNew(Status.SPORT);
                            setSelectedSport(sport.id);
                          }}
                        >
                          <sport.img className="sub-header-icons" />
                          {getSportTabLabel(sport)}
                        </button>
                      )
                  )}
                  {/* <button
                  className={`inplay-tab ${Status.UPCOMING === statusNew ? 'selected-inplay-tab' : ''
                    }`}
                  onClick={() => {
                    handleStatusChange(Status.UPCOMING);
                  }}
                >
                  {langData?.['upcoming']}
                </button> */}
                </Tabs>
                {/* <button
                  className={`inplay-tab ${
                    Status.CUP_WINNER === statusNew ? 'selected-inplay-tab' : ''
                  }`}
                  onClick={() => {
                    handleStatusChange(Status.CUP_WINNER);
                  }}
                >
                  CUP WINNER
                </button> */}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container" style={{ padding: "20px", textAlign: "center" }}>
              {langData?.["loading"] || "Loading..."}
            </div>
          ) : (
          <InplayEventsTable
            inplayEvents={getEvents()}
            mobBanners={apiWebBanners}
          />
          )}
          {/* )} */}
        </IonCol>
        {Status.CUP_WINNER !== statusNew && (
          <IonCol
            sizeLg="2.8"
            sizeMd="4"
            sizeXs="12"
            className="exch-providers pos-sticky-10"
          >
            <TrendingGames langData={langData} />
          </IonCol>
        )}
      </IonRow>
      {windowSize.width < 720 && (
        <div className="inplay-social-media">
          <SocialMediaNew />
        </div>
      )}
      <Dialog
        open={showNotificationModal}
        onClose={closeStlDialog}
        aria-labelledby="Settlements Dialog"
        fullScreen={false}
        fullWidth={true}
        maxWidth="md"
        className="stl-dialog"
      >
        <DialogTitle className="stl-dialog-title">
          <div className="title-close-icon">
            <div className="modal-title notification-title">
              {langData?.["notifications"]}
            </div>
            <IconButton
              className="close-btn"
              onClick={() => setShowNotificationModal(false)}
            >
              <CloseIcon className="close-icon" />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className="stl-dialog-content">
          <AdminNotification />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;
  return {
    // inplayEvents: getInplayEvents(
    //   state.exchangeSports.events,
    //   state.common.contentConfig
    // ),
    upcomingEvents: getUpcomingEvents(
      state.exchangeSports.events,
      state.common.contentConfig
    ),
    cupWinnerEvents: getCupWinnerEvents(
      state.exchangeSports.events,
      state.common.contentConfig
    ),
    events: getExchangeEvents(
      state.exchangeSports.events,
      SPToBFIdMap[eventType.id] ? SPToBFIdMap[eventType.id] : eventType.id,
      competition.id
    ),
    notificationUpdated: state.common.notificationUpdated,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    clearAllEvents: () => dispatch(clearAllEvents()),
    clearExchcngeBets: () => dispatch(clearExchcngeBets()),
    // fetchInplayEvents: () => dispatch(fetchInplayEvents()),
    fetchEventsInDateRange: (startDate, endDate) =>
      dispatch(fetchEventsInDateRange(startDate, endDate)),
    setExchEvent: (event: any) => dispatch(setExchEvent(event)),
    setCompetition: (competition: any) => dispatch(setCompetition(competition)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExchInplayEventsView);
