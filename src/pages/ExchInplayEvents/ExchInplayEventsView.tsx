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
import { Notification } from "../../models/Notification";
// import "../../assets/global_styles/marquee.scss";
import AdminNotification from "../../components/AdminNotifications/AdminNotification";
import CloseIcon from "@material-ui/icons/Close";
import { ReactComponent as ScrollIcons } from "../../assets/images/Notifications/notifi-scroll-icon.svg?react";
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
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();
  const windowSize = useWindowSize();

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

  const fetchUpcomingEvents = () => {
    const startDate = moment().toISOString();
    const endDate = moment().add(3, "d").toISOString();
    fetchEventsInDateRange(startDate, endDate);
  };

  useEffect(() => {
    clearAllEvents();
    clearExchcngeBets();
  }, []);

  useEffect(() => {
    updateEvents(statusNew);
  }, [statusNew]);

  useEffect(() => {
    setFavouriteEvents(favourites);
  });

  useEffect(() => {
    loggedIn && fetchNotifications();
  }, [loggedIn, notificationUpdated]);

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
      const response = await USABET_API.get("/match/homeMatchesV2");

      if (response?.data?.status === true && Array.isArray(response.data.data)) {
        // Filter for inplay events only
        const inplayEvents = response.data.data.filter((event: any) => {
          // Primary check: inplay flag
          if (event.inplay === true || event.inPlay === true || event.in_play === true) {
            return true;
          }
          
          // Secondary check: status is IN_PLAY
          if (event.status === "IN_PLAY") {
            return true;
          }
          
          // Tertiary check: forcedInplay flag
          if (event.forcedInplay === true || event.forced_inplay === true) {
            return true;
          }
          
          // Fallback: Check if event has started based on match_date or openDate
          const matchDate = event.match_date || event.matchDate;
          const openDate = event.openDate || event.open_date || matchDate;
          if (openDate) {
            const sportId = event.sportId || event.sport_id || "";
            const eventTime = moment(openDate);
            const now = moment();
            
            // For tennis (sportId "2"), check if within 5 minutes
            if (sportId === "2") {
              return eventTime.diff(now, "minutes") <= 5;
            }
            
            // For other sports, check if event has started (openDate is in the past)
            return eventTime.diff(now, "seconds") <= 0;
          }
          
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

          // Get homeTeam and awayTeam
          const homeTeam = event.homeTeam || event.home_team || "";
          const awayTeam = event.awayTeam || event.away_team || "";
          
          // Get event name - prioritize match_name, then eventName/event_name
          let eventName = event.match_name || event.matchName || event.eventName || event.event_name || "";
          if (!eventName && homeTeam && awayTeam) {
            eventName = `${homeTeam} V ${awayTeam}`;
          } else if (!eventName) {
            eventName = event.eventId || event.event_id || "Event";
          }

          // Get match date - prioritize match_date, then openDate/open_date
          const matchDate = event.match_date || event.matchDate;
          const openDate = event.openDate || event.open_date || matchDate || new Date().toISOString();

          // Transform to EventDTO format
          const eventDTO: EventDTO = {
            eventId: event.eventId || event.event_id || "",
            eventName: eventName,
            eventSlug: eventName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            sportId: sportId,
            sportName: sportName,
            competitionId: event.competitionId || event.competition_id || "",
            competitionName: event.competitionName || event.competition_name || "",
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
            ...event, // Include any additional fields from API
          };

          sport.events.push(eventDTO);
        });

        const transformedInplayEvents = Array.from(groupedEventsMap.values());
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
        return upcomingEvents
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
                  {sideHeaderTabs?.map(
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
                          {langData?.[sport.langKey]}
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
