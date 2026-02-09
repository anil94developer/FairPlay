import {
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
} from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import { BRAND_DOMAIN } from "../../constants/Branding";
import { SelectedObj } from "../../models/ExchangeSportsState";
import { RootState } from "../../models/RootState";
import { AuthResponse } from "../../models/api/AuthResponse";
import { EventDTO } from "../../models/common/EventDTO";
import {
  fetchEventsByCompetition,
  fetchEventsBySport,
  getExchangeEvents,
  setCompetition,
  setExchEvent,
} from "../../store";
import SVLS_API from "../../svls-api";
import USABET_API from "../../api-services/usabet-api";
import { formatTime, getSportLangKeyByName } from "../../util/stringUtil";
import {
  disconnectToWS,
  subscribeWsForEventOdds,
  unsubscribeAllWsforEvents,
} from "../../webSocket/webSocket";
import TrendingGames from "../ProviderSidebar/TrendingGames";

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
  loggedIn: boolean;
  topicUrls: any;
  betFairWSConnected: boolean;
  langData: any;
};

const ExchRaceTable: React.FC<StoreProps> = (props) => {
  const {
    events,
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
    langData,
  } = props;


  console.log("=============================",JSON.stringify(fetchingEvents));
  const pathParams = useParams<any>();
  const location = useLocation();
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [eventData, setEventData] = useState<EventDTO[]>([]);
  const [compitationsList, setCompitationsList] = useState<{}>({});
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);
  const [value, setValue] = React.useState("");
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
  const [racingMarkets, setRacingMarkets] = useState<any[]>([]);
  const history = useHistory();

  const tableFields = [
    {
      key: "teams",
      Label: "Races",
      className: "teams-cell race-name-cell-head",
      align: "left",
    },
    {
      key: "markets",
      Label: "",
      className: "odds-cell-head tab-view",
      align: "left",
      colSpan: 1,
    },
  ];

  useEffect(() => {
    fetchRacingMarkets();
    if (!pathParams["competition"]) {
      setCompetition({ id: "", name: "", slug: "" });
    }
  }, [pathParams, location.pathname]);

  // Fetch racing markets - determine sport_id from URL path
  // greyhound: sport_id "4339"
  // horseracing: sport_id "7"
  const fetchRacingMarkets = async () => {
    try {
      // Get sport_id from URL path
      const pathname = location?.pathname || "";
      let sportId = "7"; // Default to horseracing
      
      if (pathname.includes("/greyhound")) {
        sportId = "4339";
      } else if (pathname.includes("/horseracing")) {
        sportId = "7";
      }
      
      console.log("[ExchRaceEventsTable] Fetching racing markets with sport_id:", sportId, "from pathname:", pathname);
      
      const response = await USABET_API.post("/market/allRacingMarkets", {
        sport_id: sportId
      });

      console.log("[ExchRaceEventsTable] Racing markets API response:", response?.data);

      // Handle different response structures
      let racingMarkets: any[] = [];
      
      if (response?.data?.status === true) {
        if (Array.isArray(response.data.data)) {
          racingMarkets = response.data.data;
        } else if (response.data.data && typeof response.data.data === 'object') {
          // If data is an object, try to extract array from it
          racingMarkets = Array.isArray(response.data.data.data) 
            ? response.data.data.data 
            : [response.data.data];
        } else if (Array.isArray(response.data)) {
          racingMarkets = response.data;
        }
      } else if (Array.isArray(response?.data)) {
        // Direct array response
        racingMarkets = response.data;
      }
      
      console.log("[ExchRaceEventsTable] Racing markets fetched:", {
        count: racingMarkets.length,
        firstItem: racingMarkets[0],
        sampleData: racingMarkets.slice(0, 2),
      });
      setRacingMarkets(racingMarkets);
      // return racingMarkets;
    } catch (error: any) {
      console.error("[ExchRaceEventsTable] Error fetching racing markets:", error);
      if (error?.response?.data) {
        console.error("[ExchRaceEventsTable] Racing markets error response:", error.response.data);
      }
      return [];
    }
  };

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

  const updateEvents = () => {
    if (!pathParams["competition"]) {
      if (
        selectedEventType.id &&
        events &&
        selectedEventType.id === events[0]?.sportId
      )
        fetchEventsBySport(selectedEventType.id, events);
    } else {
      if (
        selectedEventType.id &&
        events &&
        selectedEventType.id === events[0]?.sportId
      ) {
        fetchEventsByCompetition(
          selectedEventType.id,
          selectedCompetition.id,
          events
        );
      }
    }
  };

  useEffect(() => {
    if (!pathParams["competition"]) {
      fetchEventsBySport(selectedEventType.id, events);
    }
  }, [selectedEventType]);

  useEffect(() => {
    if (pathParams["competition"] && !events) {
      fetchEventsByCompetition(
        selectedEventType.id,
        selectedCompetition.id,
        events
      );
    }
  }, [selectedCompetition]);

  useEffect(() => {
    updateEvents();
  }, [loggedIn]);

  useEffect(() => {
    let refreshInterval = setInterval(() => {
      updateEvents();
    }, 60000);
    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedEventType]);

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
      if (selectedEventType.id === "4" && events) {
        let subs = [...wsChannels];
        for (let event of events) {
          if (
            event.status === "IN_PLAY" &&
            !wsChannels.includes(event.eventId)
          ) {
            subs.push(event.eventId);
            updateMatchOddsTopic(
              topicUrls?.matchOddsTopic,
              topicUrls?.matchOddsBaseUrl
            );
            subscribeWsForEventOdds(
              topicUrls?.matchOddsTopic,
              event.sportId,
              event.competitionId,
              event.eventId,
              event.matchOdds?.marketId,
              event.providerName
            );
          }
        }
        setWsChannels(subs);
      }
    }
  }, [betFairWSConnected, events, selectedEventType, loggedIn]);

  useEffect(() => {
    if (events) {
      setEventData([...events]);
      setCompitations(events);
    }
  }, [events]);

  const getCompetitionSlug = (competitionName: string) => {
    return competitionName
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/ +/g, " ")
      .trim()
      .split(" ")
      .join("-");
  };

  const handleEventChange = (event: EventDTO) => {
    // Store market_id in sessionStorage if available for next navigation
    if (event.marketId) {
      sessionStorage.setItem("last_market_id", event.marketId);
      console.log("[ExchRaceEventsTable] Stored market_id in sessionStorage:", event.marketId);
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
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log("=============================",JSON.stringify(newValue));
    setValue(newValue);
   
  };

  const handleEventData = (data) => {
    return data.sort((a, b) => {
      if (a.inPlay && !b.inPlay) return -1;
      if (!a.inPlay && b.inPlay) return 1;
    });
  };

  const isLive = (date: Date) => {
    let duration = moment.duration(moment(date).diff(moment()));
    return duration?.asMinutes() < 10 ? true : false;
  };

  const setCompitations = (events: EventDTO[]) => {
    let compitations: { [key: number]: EventDTO[] } = {};
    const unique = [
      ...new Set(events.map((item) => item?.competitionId?.split("_")[0])),
    ];
    for (let key of unique) {
      compitations[key] =
        events?.filter((item) => item?.competitionId?.startsWith(key + "_")) ??
        [];
    }
    const sorted = Object.keys(compitations)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = compitations[key];
        return accumulator;
      }, {});

    setCompitationsList(sorted);
    value === "" && setValue(unique[0]);
  };

  // Process racing markets data - group by country code and venue
  const processRacingMarkets = () => {
    if (!racingMarkets || racingMarkets.length === 0) return {};
    
    const groupedByCountry: { [key: string]: any[] } = {};
    
    racingMarkets.forEach((market: any) => {
      const countryCode = market.country_code || market.countryCode || "OTHER";
      
      if (!groupedByCountry[countryCode]) {
        groupedByCountry[countryCode] = [];
      }
      
      // Get venue name - use venue field from API
      const venue = market.venue || market.venue_name || market.venueName || "Unknown";
      const marketStartTime = market.market_start_time || market.marketStartTime || market.start_time || market.startTime;
      const matchId = market.match_id || market.matchId || "";
      const marketId = market.market_id || market.marketId || "";
      
      // Group by venue (same venue = same event)
      // Find existing venue in this country group
      let existingVenue = groupedByCountry[countryCode].find(
        (e: any) => e.venue === venue
      );
      
      if (!existingVenue) {
        existingVenue = {
          venue: venue,
          countryCode: countryCode,
          markets: [],
          matchId: matchId,
        };
        groupedByCountry[countryCode].push(existingVenue);
      }
      
      // Add market to venue
      if (marketStartTime) {
        existingVenue.markets.push({
          marketTime: marketStartTime,
          marketId: marketId,
          matchId: matchId,
        });
      }
    });
    
    // Sort markets by time for each venue
    Object.keys(groupedByCountry).forEach((countryCode) => {
      groupedByCountry[countryCode].forEach((venue) => {
        venue.markets.sort((a: any, b: any) => {
          const timeA = moment(a.marketTime).valueOf();
          const timeB = moment(b.marketTime).valueOf();
          return timeA - timeB;
        });
      });
    });
    
    // Set default tab value if not set
    if (value === "" && Object.keys(groupedByCountry).length > 0) {
      setValue(Object.keys(groupedByCountry)[0]);
    }
    
    return groupedByCountry;
  };

  // Format event name with country code and date from first market time
  const formatEventName = (venue: string, countryCode: string, firstMarketTime: string | Date) => {
    const formattedDate = firstMarketTime 
      ? moment(firstMarketTime).format("Do MMM") // "7th Feb"
      : "";
    return venue ? `${venue} (${countryCode}) ${formattedDate}`.trim() : `(${countryCode}) ${formattedDate}`.trim();
  };

  return (
    <div className="events-table-ctn race-events-ctn">
      <div className="heading">
        <div>{langData?.[getSportLangKeyByName(selectedEventType?.name)]}</div>
      </div>
      <div>
        {racingMarkets?.length > 0 ? (
          <div className="events-table-content table-ctn">
            {(() => {
              const groupedMarkets = processRacingMarkets();
              const countryCodes = Object.keys(groupedMarkets);
              
              return (
                <>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    {countryCodes.map((countryCode, idx) => (
                      <Tab 
                        key={countryCode} 
                        className="com-tab" 
                        label={countryCode} 
                        value={countryCode} 
                      />
                    ))}
                  </Tabs>

                  <TableContainer component={Paper} className="border-radius">
                    <Table className="events-table mt-0">
                      <TableBody>
                        {groupedMarkets[value]?.length > 0 ? (
                          groupedMarkets[value].map((venueData, venueIdx) => {
                            const firstMarketTime = venueData.markets?.[0]?.marketTime;
                            const formattedVenueName = formatEventName(
                              venueData.venue || "Unknown",
                              venueData.countryCode,
                              firstMarketTime
                            );
                            
                            return (
                              <TableRow
                                key={`venue-${venueIdx}-${venueData.venue}`}
                                className="extra-table"
                              >
                                <TableCell className="team-name-cell table-cell-last">
                                  <div className="team">
                                    {formattedVenueName}
                                  </div>

                                  <div className="web-view race-market-times">
                                    {venueData.markets?.slice(0, 8).map((market: any, marketIdx: number) => (
                                      <NavLink
                                        key={`market-${marketIdx}-${market.marketId}`}
                                        className="market-time"
                                        onClick={() => {
                                          const eventDTO: EventDTO = {
                                            eventId: market.matchId || "",
                                            eventName: venueData.venue || "Unknown",
                                            eventSlug: (venueData.venue || "unknown").toLowerCase().replace(/\s+/g, "-"),
                                            sportId: "7",
                                            competitionId: "",
                                            competitionName: venueData.venue || "",
                                            openDate: market.marketTime || new Date().toISOString(),
                                            status: "UPCOMING",
                                            providerName: "BetFair",
                                          } as EventDTO;
                                          handleEventChange(eventDTO);
                                        }}
                                        to={`/exchange_sports/${
                                          selectedEventType.slug
                                        }/${getCompetitionSlug(
                                          venueData.venue || "unknown"
                                        )}/${(venueData.venue || "unknown").toLowerCase().replace(/\s+/g, "-")}/${btoa(
                                          `BetFair:7::${market.matchId || ""}:${moment(market.marketTime).unix()}`
                                        )}`}
                                        id={market.marketId}
                                      >
                                        <div
                                          className={
                                            isLive(market.marketTime)
                                              ? "market-time live"
                                              : "market-time"
                                          }
                                        >
                                          {formatTime(market.marketTime)}
                                        </div>
                                      </NavLink>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="odds-cell mob-view race-markets"
                                  align="left"
                                  colSpan={2}
                                  key="market-time-cell"
                                >
                                  <div className="race-market-times">
                                    {venueData.markets?.slice(0, 4).map((market: any, marketIdx: number) => (
                                      <NavLink
                                        key={`market-mob-${marketIdx}-${market.marketId}`}
                                        className="all-markets-nav-link"
                                        onClick={() => {
                                          const eventDTO: EventDTO = {
                                            eventId: market.matchId || "",
                                            eventName: venueData.venue || "Unknown",
                                            eventSlug: (venueData.venue || "unknown").toLowerCase().replace(/\s+/g, "-"),
                                            sportId: "7",
                                            competitionId: "",
                                            competitionName: venueData.venue || "",
                                            openDate: market.marketTime || new Date().toISOString(),
                                            status: "UPCOMING",
                                            providerName: "BetFair",
                                          } as EventDTO;
                                          handleEventChange(eventDTO);
                                        }}
                                        to={`/exchange_sports/${
                                          selectedEventType.slug
                                        }/${getCompetitionSlug(
                                          venueData.venue || "unknown"
                                        )}/${(venueData.venue || "unknown").toLowerCase().replace(/\s+/g, "-")}/${btoa(
                                          `BetFair:7::${market.matchId || ""}:${moment(market.marketTime).unix()}`
                                        )}`}
                                        id={market.marketId}
                                      >
                                        <div
                                          className={
                                            isLive(market.marketTime)
                                              ? "market-time live"
                                              : "market-time"
                                          }
                                        >
                                          {formatTime(market.marketTime)}
                                        </div>
                                      </NavLink>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell align="center" colSpan={8}>
                              {langData?.["inplay_matches_not_found"]}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              );
            })()}

            {isMobile ? <TrendingGames langData={langData} /> : null}
          </div>
        ) : !fetchingEvents ? (
          <NoDataComponent
            title={langData?.["no_events_display_txt"]}
            bodyContent={""}
            noDataImg={undefined}
          />
        ) : null}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;
  return {
    events: getExchangeEvents(
      state.exchangeSports.events,
      eventType.id,
      competition.id
    ),
    selectedEventType: eventType,
    selectedCompetition: competition,
    fetchingEvents: state.exchangeSports.fetchingEvents,
    topicUrls: state?.exchangeSports?.topicUrls,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
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
    fetchEventsBySport: (sportId: string, events: EventDTO[]) =>
      dispatch(fetchEventsBySport(sportId, events)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchRaceTable);
