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
import { NavLink, useHistory, useParams } from "react-router-dom";
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

const EventsTable: React.FC<StoreProps> = (props) => {
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

  const pathParams = useParams<any>();
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [eventData, setEventData] = useState<EventDTO[]>([]);
  const [compitationsList, setCompitationsList] = useState<{}>({});
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);
  const [value, setValue] = React.useState("");
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
  const history = useHistory();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

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
    if (!pathParams["competition"]) {
      setCompetition({ id: "", name: "", slug: "" });
    }
  }, [pathParams]);

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

  return (
    <div className="events-table-ctn race-events-ctn">
      <div className="heading">
        <div>{langData?.[getSportLangKeyByName(selectedEventType?.name)]}</div>
      </div>
      <div>
        {eventData?.length > 0 ? (
          <div className="events-table-content table-ctn">
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              {Object?.keys(compitationsList)?.map((key, idx) => (
                <Tab className="com-tab" label={key} value={key} />
              ))}
            </Tabs>

            <TableContainer component={Paper} className="border-radius">
              <Table className="events-table mt-0">
                <TableBody>
                  {compitationsList[value]?.length > 0 ? (
                    handleEventData(compitationsList[value])?.map(
                      (sEvent, idx) => (
                        <>
                          {sEvent.sportId === selectedEventType.id &&
                          sEvent.raceMarkets?.length > 0 ? (
                            <TableRow
                              key={`idx-${sEvent.eventName}`}
                              className="extra-table"
                            >
                              <TableCell className="team-name-cell table-cell-last">
                                <div className="team">{sEvent.eventName}</div>

                                <div className="web-view race-market-times">
                                  {sEvent.raceMarkets?.map((mr, idx) => (
                                    <>
                                      {idx < 8 ? (
                                        <NavLink
                                          className="market-time"
                                          key={"all-markets-link"}
                                          onClick={() =>
                                            handleEventChange(sEvent)
                                          }
                                          to={`/exchange_sports/${
                                            selectedEventType.slug
                                          }/${getCompetitionSlug(
                                            sEvent.competitionName
                                          )}/${sEvent.eventSlug}/${btoa(
                                            `${sEvent.providerName}:${sEvent.sportId}:${sEvent.competitionId}:${sEvent.eventId}:${mr.marketTime}`
                                          )}`}
                                          id={mr.marketId}
                                        >
                                          <div
                                            className={
                                              isLive(mr.marketTime)
                                                ? "market-time live"
                                                : "market-time"
                                            }
                                          >
                                            {formatTime(mr.marketTime)}
                                          </div>
                                        </NavLink>
                                      ) : null}
                                    </>
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
                                  {sEvent.raceMarkets?.map((mr, idx) => (
                                    <>
                                      {idx < 4 ? (
                                        <NavLink
                                          className="all-markets-nav-link"
                                          key={"all-markets-link"}
                                          onClick={() =>
                                            handleEventChange(sEvent)
                                          }
                                          to={`/exchange_sports/${
                                            selectedEventType.slug
                                          }/${getCompetitionSlug(
                                            sEvent.competitionName
                                          )}/${sEvent.eventSlug}/${btoa(
                                            `${sEvent.providerName}:${sEvent.sportId}:${sEvent.competitionId}:${sEvent.eventId}:${mr.marketTime}`
                                          )}`}
                                          id={mr.marketId}
                                        >
                                          <div
                                            className={
                                              isLive(mr.marketTime)
                                                ? "market-time live"
                                                : "market-time"
                                            }
                                          >
                                            {formatTime(mr.marketTime)}
                                          </div>
                                        </NavLink>
                                      ) : null}
                                    </>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </>
                      )
                    )
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

export default connect(mapStateToProps, mapDispatchToProps)(EventsTable);
