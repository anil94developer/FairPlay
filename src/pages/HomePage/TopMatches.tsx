import React, { useMemo } from "react";
import { EventDTO } from "../../models/common/EventDTO";
import {
  FavoriteEventDTO,
  adaptFavoriteEventToEventDTO,
} from "../../models/common/FavoriteEventDTO";

import MarketEnabled from "../../common/MarketEnabled/MarketEnabled";
import ExchOddBtn from "../../components/ExchOddButton/ExchOddButton";
import LiveEvent from "../../assets/images/liveEvent.gif";
import { useHistory } from "react-router";
import { eventTypesNameMap } from "../../store/exchangeSports/exchangeSportsSelectors";
import "./TopMatches.scss";
import moment from "moment";
import { isMobile } from "react-device-detect";
import { getSportIcon, getSportName } from "./HomePageUtils";
import CarouselComponent from "../../common/CarouselComponent/CarouselComponent";

type Props = {
  favouriteEvents: FavoriteEventDTO[];
  displayHeader: string;
  langData: any;
  loggedIn: boolean;
  setCompetition: Function;
  setExchEvent: Function;
};

const TopMatches: React.FC<Props> = ({
  favouriteEvents,
  displayHeader,
  langData,
  loggedIn,
  setCompetition,
  setExchEvent,
}) => {
  const history = useHistory();
  const teamTypes = ["home", "draw", "away"];

  const getOdds = (eventData: EventDTO, teamType: string) => {
    const team =
      teamType === "home"
        ? eventData?.homeTeam
        : teamType === "away"
        ? eventData?.awayTeam
        : teamType;
    for (let runner of eventData?.matchOdds?.runners) {
      if (
        runner?.runnerName?.toLowerCase() === team?.toLowerCase() ||
        runner?.runnerName?.toLowerCase().includes(team?.toLowerCase())
      ) {
        return [
          {
            type: "back-odd",
            price: runner?.backPrices?.[0]?.price,
            size: runner?.backPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner?.runnerName,
          },
          {
            type: "lay-odd",
            price: runner?.layPrices?.[0]?.price,
            size: runner?.layPrices?.[0]?.size,
            outcomeId: runner?.runnerId,
            outcomeName: runner?.runnerName,
          },
        ];
      }
    }
    return null;
  };

  const handleEventChange = (event: any) => {
    // Generate competition slug
    const competitionSlug = event.competitionName
      ? event.competitionName
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-")
      : "league";

    // Generate event slug if not present
    let eventSlug = event.eventSlug;
    if (!eventSlug && event.eventName) {
      eventSlug = event.eventName
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/ +/g, " ")
        .trim()
        .split(" ")
        .join("-");
    }
    if (!eventSlug && event.eventId) {
      eventSlug = event.eventId.toString();
    }
    if (!eventSlug) {
      eventSlug = "event";
    }

    // Get sport slug from sportId or sportName
    let sportSlug = "";
    if (event?.sportId && eventTypesNameMap[event.sportId]) {
      sportSlug = eventTypesNameMap[event.sportId].toLowerCase().replace(/\s+/g, "-");
    } else if (event?.sportName) {
      sportSlug = event.sportName.toLowerCase().replace(/\s+/g, "-");
    } else {
      sportSlug = "cricket"; // Default fallback
    }

    // Set competition and event in Redux store
    setCompetition({
      id: event.competitionId,
      name: event.competitionName,
      slug: competitionSlug,
    });

    setExchEvent({
      id: event.eventId,
      name: event.eventName,
      slug: eventSlug,
    });

    // Get provider name (default to USABET if not provided)
    const providerName = event?.providerName || "USABET";

    // Navigate based on event type
    if (event?.providerName?.toLowerCase() === "sportradar" && !loggedIn) {
      history.push("/login");
    } else if (event?.catId === "SR VIRTUAL") {
      // Virtual events route
      const eventInfo = btoa(
        `${event.sportId}:${event.competitionId}:${event.eventId}`
      );
      history.push(
        `/exchange_sports/virtuals/${sportSlug}/${competitionSlug}/${eventSlug}/${eventInfo}`
      );
    } else {
      // Regular events route
      // Format: providerName:sportId:competitionId:eventId
      const eventInfo = btoa(
        `${providerName}:${event.sportId}:${event.competitionId}:${event.eventId}`
      );
      
      history.push(
        `/exchange_sports/${sportSlug}/${competitionSlug}/${eventSlug}/${eventInfo}`,
        {
          homeTeam: event?.homeTeam,
          awayTeam: event?.awayTeam,
          openDate: event?.openDate,
          sportId: event?.sportId,
          sportName: event?.sportName,
          competitionId: event?.competitionId,
          competitionName: event?.competitionName,
          eventId: event?.eventId,
          eventName: event?.eventName,
        }
      );
    }
  };
  // Convert FavoriteEventDTO to EventDTO format for component compatibility
  const adaptedEvents: EventDTO[] = useMemo(() => {
    const events = favouriteEvents.map((event) => adaptFavoriteEventToEventDTO(event));
    
    // Debug logging in development to see what sportIds and sportNames we're getting
    if (process.env.NODE_ENV === 'development' && events.length > 0) {
      console.log('[TopMatches] Sample events with sport data:', events.slice(0, 3).map(e => ({
        eventId: e.eventId,
        eventName: e.eventName,
        sportId: e.sportId,
        sportIdType: typeof e.sportId,
        sportName: e.sportName,
        sportNameType: typeof e.sportName
      })));
    }
    
    return events;
  }, [favouriteEvents]);
  if (!favouriteEvents || favouriteEvents.length === 0) {
    return null;
  }

  return (
    <div className="top-matches-ctn">
      <div className="border-shadow-container">
        <span className="text">{displayHeader}</span>
      </div>

      <CarouselComponent
        className="top-matches-slider"
        enableAutoScroll={false}
        isInfinite={false}
        // dependencies={[adaptedEvents]}
      >
        {adaptedEvents.map((event) => (
          <div
            key={event.eventId}
            className="top-match-card"
            onClick={() => {
              console.log('[TopMatches] Clicked event:', {
                eventId: event.eventId,
                eventName: event.eventName,
                sportId: event.sportId,
                sportName: event.sportName,
                competitionId: event.competitionId,
                competitionName: event.competitionName,
                providerName: event.providerName,
              });
              handleEventChange(event);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="match-info">
              <div className="category-and-live">
                <div className="category-name-container">
                  <div className="sport-icon-container">
                    {(() => {
                      const IconComponent = getSportIcon(event.sportId, event.sportName);
                      const sportName = getSportName(event.sportId, event.sportName);
                      
                      // Debug logging in development
                      if (process.env.NODE_ENV === 'development' && (!event.sportId || !event.sportName)) {
                        console.log('[TopMatches] Event icon lookup:', {
                          eventId: event.eventId,
                          sportId: event.sportId,
                          sportName: event.sportName,
                          resolvedName: sportName
                        });
                      }
                      
                      return (
                        <>
                          <IconComponent
                            className="sport-icon"
                            style={{ height: '25px', width: 'auto' }}
                          />
                          <div className="sport-name-top-matches">
                            {sportName}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="market-types">
                    <MarketEnabled
                      marketEnabled={
                        event?.enablePremium && event?.catId !== "SR VIRTUAL"
                      }
                      marketType={"P"}
                    />
                    <MarketEnabled
                      marketEnabled={event?.enableMatchOdds}
                      marketType={"MO"}
                    />
                    <MarketEnabled
                      marketEnabled={event?.enableBookmaker}
                      marketType={"BM"}
                    />
                    <MarketEnabled
                      marketEnabled={event?.enableFancy}
                      marketType={"F"}
                    />
                    <MarketEnabled
                      marketEnabled={event?.enableToss}
                      marketType={"T"}
                    />
                  </div>
                </div>
              </div>

              <div className="competition-name-top-matches">
                {event.competitionName}
              </div>

              <div className="event-details">
                <div className="event-name-container">
                  <div className="team-names">
                    {event?.homeTeam && event?.awayTeam
                      ? `${event.homeTeam} V ${event.awayTeam}`
                      : event.eventName}
                  </div>
                  {(() => {
                    // Check multiple conditions for live status
                    const status = event?.status?.toUpperCase() || "";
                    const isInPlay = 
                      status === "IN_PLAY" || 
                      status === "INPLAY" || 
                      status === "IN-PLAY" ||
                      event?.forcedInplay === true ||
                      event?.forcedInPlay === true ||
                      event?.inplay === true ||
                      event?.inPlay === true ||
                      event?.in_play === true ||
                      event?.catId === "INPLAY" ||
                      event?.catId === "IN_PLAY";
                    
                    return isInPlay ? (
                      <img
                        src={LiveEvent}
                        alt="Live Event"
                        className="live-img-top-matches"
                      />
                    ) : null;
                  })()}
                </div>

                <div className="event-time-top-matches">
                  <div className="date-display-top-matches">
                    <div>
                      {moment(
                        moment(event?.openDate).format("DD MMM YYYY")
                      ).isSame(moment().format("DD MMM YYYY"))
                        ? "Today"
                        : moment(event?.openDate).format("DD MMM")}
                    </div>
                    <div>{moment(event?.openDate).format("hh:mm A")}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="odds-section">
              {teamTypes.map((teamType, index) => (
                <div key={teamType + index} className="team-odds">
                  {event?.matchOdds ? (
                    getOdds(event, teamType) ? (
                      getOdds(event, teamType).map((odd, oddIndex) => (
                        <ExchOddBtn
                          key={`${event.eventId}-${teamType}-${odd.type}-${odd.outcomeId || oddIndex}`}
                          mainValue={odd.price}
                          subValue={odd.size}
                          oddType={
                            odd.type === "back-odd" ? "back-odd" : "lay-odd"
                          }
                          disable={event.matchOdds.status
                            .toLowerCase()
                            .includes("suspended")}
                          valueType="matchOdds"
                          showSubValueinKformat={true}
                          onClick={() => null}
                        />
                      ))
                    ) : (
                      <>
                        <ExchOddBtn
                          mainValue={null}
                          oddType="back-odd"
                          disable={true}
                        />
                        <ExchOddBtn
                          mainValue={null}
                          oddType="lay-odd"
                          disable={true}
                        />
                      </>
                    )
                  ) : (
                    <>
                      <ExchOddBtn
                        mainValue={null}
                        oddType="back-odd"
                        disable={true}
                      />
                      <ExchOddBtn
                        mainValue={null}
                        oddType="lay-odd"
                        disable={true}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CarouselComponent>
    </div>
  );
};

export default TopMatches;
