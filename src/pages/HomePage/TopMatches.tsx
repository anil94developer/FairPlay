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
import { sportIconsMap, sportNamesMap } from "./HomePageUtils";
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
  // Convert FavoriteEventDTO to EventDTO format for component compatibility
  const adaptedEvents: EventDTO[] = useMemo(
    () => favouriteEvents.map((event) => adaptFavoriteEventToEventDTO(event)),
    [favouriteEvents]
  );
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
            onClick={() => handleEventChange(event)}
          >
            <div className="match-info">
              <div className="category-and-live">
                <div className="category-name-container">
                  <div className="sport-icon-container">
                    <img
                      src={sportIconsMap[event.sportId]}
                      alt={event.sportName}
                      className="sport-icon"
                      height={25}
                      loading="lazy"
                    />
                    <div className="sport-name-top-matches">
                      {sportNamesMap[event.sportId]}
                    </div>
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
                  {event.status === "IN_PLAY" && (
                    <img
                      src={LiveEvent}
                      alt="Live Event"
                      className="live-img-top-matches"
                    />
                  )}
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
