import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { SelectedObj } from "../../models/ExchangeSportsState";
import {
  fetchCompetitions,
  fetchEventsByCompetition,
  setCompetition,
  setEventType,
  setExchEvent,
} from "../../store";

import { Skeleton } from "@material-ui/lab";
import { isMobile } from "react-device-detect";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ReactComponent as LiveSymbol } from "../../assets/images/icons/LiveSymbol.svg?react";
import EventDateDisplay from "../../common/EventDateDisplay/EventDateDisplay";
import EventName from "../../common/EventName/EventName";
import MarketEnabled from "../../common/MarketEnabled/MarketEnabled";
import { EventDTO } from "../../models/common/EventDTO";
import { RootState } from "../../models/RootState";
import {
  getSportLangKeyByName,
  SportIconMapInplay,
} from "../../util/stringUtil";
import {
  // unsubscribeAllWsforEvents,
  disconnectToWS,
  subscribeWsForEventOdds,
} from "../../webSocket/webSocket";
import ExchMobOddView from "../ExchOddButton/ExchMobOddView";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import "./ExchEventsTable.scss";
import moment from "moment";

type InplayEventsObj = {
  sportId: string;
  sportName: string;
  sportSlug: string;
  events: EventDTO[];
};

type StoreProps = {
  allowedConfig: number;
  inplayEvents: InplayEventsObj[];
  setEventType: (event: SelectedObj) => void;
  setCompetition: (event: SelectedObj) => void;
  setExchEvent: (event: SelectedObj) => void;
  fetchCompetitions: (eventTypeId: string) => void;
  fetchEventsByCompetition: (
    eventTypeId: string,
    competitionId: string
  ) => string;
  // addExchangeBet: (data: BsData) => void;
  // bets: BsData[];
  fetchingEvents: boolean;
  loggedIn: boolean;
  topicUrls: any;
  betFairWSConnected: boolean;
  mobBanners: any;
  langData: any;
};

export const EmptyOddsBlock = React.memo(() => {
  return (
    <React.Fragment>
      <div className="odds-block">
        <ExchOddBtn mainValue={null} oddType="back-odd" />
        <ExchOddBtn mainValue={null} oddType="lay-odd" />
      </div>
    </React.Fragment>
  );
});

const InplayEventsTable: React.FC<StoreProps> = (props) => {
  const {
    allowedConfig,
    inplayEvents,
    setEventType,
    setCompetition,
    setExchEvent,
    // addExchangeBet,
    // bets,
    fetchingEvents,
    loggedIn,
    topicUrls,
    betFairWSConnected,
    mobBanners,
    langData,
  } = props;
  const history = useHistory();
  const teamTypes = ["home", "draw", "away"];
  // const [openBetslip, setOpenBetslip] = useState<boolean>(true);
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");

  const tableFields = [
    {
      key: "schedle",
      Label: ":eventType",
      className: "schedule-cell schedule-cell-header br-inplay-start",
      align: "left",
      colSpan: 9,
    },
    // { key: 'teams', Label: 'Teams', className: 'teams-cell', align: 'left' },
    {
      key: "homeTeamOdds",
      Label: "1",
      className: "odds-cell-head web-view br-inplay-middle",
      align: "center",
      colSpan: 1,
    },
    {
      key: "drawOdds",
      Label: "X",
      className: "odds-cell-head web-view br-inplay-middle",
      align: "center",
      colSpan: 1,
    },
    {
      key: "awayTeamOdds",
      Label: "2",
      className: "odds-cell-head web-view br-inplay-end",
      align: "center",
      colSpan: 1,
    },
    // {
    //   key: 'more',
    //   Label: '',
    //   className: 'all-markets-link-cell',
    //   align: 'center',
    // },
  ];

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

    const teamLowerCase = team?.toLowerCase();
    const matchOdds = eventData.markets?.matchOdds?.[0];

    // Add safety checks
    if (!matchOdds || !matchOdds.runners) return null;

    for (let runner of matchOdds.runners) {
      let runnerLowCase = runner.runnerName.toLowerCase();
      if (
        runnerLowCase === teamLowerCase ||
        runnerLowCase.includes(teamLowerCase) ||
        runner.runnerId === teamId
      ) {
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

  const handleEventChange = (iEvent: InplayEventsObj, event: EventDTO) => {
    const competitionSlug = event.competitionName
      ? event.competitionName
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-")
      : "league";
    setEventType({
      id: iEvent.sportId,
      name: iEvent.sportName,
      slug: iEvent.sportSlug,
    });
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
        `/exchange_sports/virtuals/${iEvent.sportSlug}/${competitionSlug}/${
          event.eventSlug
        }/${btoa(`${event.sportId}:${event.competitionId}:${event.eventId}`)}`
      );
    } else {
      history.push(
        `/exchange_sports/${iEvent.sportSlug}/${competitionSlug}/${
          event.eventSlug
        }/${btoa(
          `${event.providerName}:${event.sportId}:${event.competitionId}:${
            event.eventId
          }:${moment(event.openDate).unix()}`
        )}`,
        {
          homeTeam: event?.homeTeam,
          awayTeam: event?.awayTeam,
          openDate: event?.openDate,
        }
      );
    }
  };

  useEffect(() => {
    if (loggedIn && inplayEvents.length > 0 && topicUrls?.matchOddsTopic) {
      for (let iEvent of inplayEvents) {
        const subs = [...wsChannels];
        updateMatchOddsTopic(
          topicUrls?.matchOddsTopic,
          topicUrls?.matchOddsBaseUrl
        );
        for (let sEvent of iEvent.events) {
          if (!subs.includes(sEvent.eventId)) {
            subs.push(sEvent.eventId);
            subscribeWsForEventOdds(
              topicUrls?.matchOddsTopic,
              sEvent.sportId,
              sEvent.competitionId,
              sEvent.eventId,
              sEvent.markets?.matchOdds?.[0]?.marketId
            );
          }
        }
        setWsChannels(subs);
      }
    }
  }, [betFairWSConnected, inplayEvents, loggedIn]);

  const GetSportIcon = ({ sportId }) => {
    const IconComponent = SportIconMapInplay[sportId];

    if (!IconComponent) {
      return null; // or a default icon/component
    }

    return (
      <div>
        <IconComponent width={24} height={24} className="ip-event-icon" />
      </div>
    );
  };

  return (
    <>
      <div className="events-table-ctn live-events-ctn">
        {inplayEvents.length > 0 ? (
          inplayEvents.map((iEvent, idx) => (
            <>
              {allowedConfig !== 0 ? (
                <>
                  <Accordion
                    className="eventType-accordion"
                    defaultExpanded={true}
                    key={idx}
                  >
                    <AccordionDetails className="inplay-events-tbl-container">
                      <div className="events-table-content table-ctn">
                        <TableContainer component={Paper}>
                          <Table className="events-table inplay-table">
                            <TableHead>
                              <TableRow>
                                {tableFields.map((tF, index) => (
                                  <TableCell
                                    key={tF.key + index}
                                    align={
                                      tF.align === "left" ? "left" : "center"
                                    }
                                    colSpan={tF.colSpan ? tF.colSpan : 1}
                                    className={tF.className}
                                  >
                                    {tF.Label === ":eventType" ? (
                                      <div className="icon-and-name">
                                        <GetSportIcon
                                          sportId={iEvent.sportId}
                                        />
                                        <div className="ip-event-name">
                                          {
                                            langData?.[
                                              getSportLangKeyByName(
                                                iEvent.sportName
                                              )
                                            ]
                                          }{" "}
                                        </div>
                                      </div>
                                    ) : (
                                      tF.Label
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {iEvent?.events.map((sEvent, idx) => (
                                <TableRow
                                  key={sEvent.eventId}
                                  onClick={() =>
                                    handleEventChange(iEvent, sEvent)
                                  }
                                  className="bgc-white"
                                >
                                  <TableCell
                                    className="schedule-cell ipe-time-display web-view"
                                    colSpan={1}
                                  >
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
                                  </TableCell>
                                  <TableCell
                                    className="teams-cell mob-et-b-c"
                                    colSpan={8}
                                  >
                                    <div
                                      className="all-markets-nav-link"
                                      key={"all-markets-link"}
                                      // onClick={() =>
                                      //   handleEventChange(iEvent, sEvent)
                                      // }
                                    >
                                      {sEvent?.homeTeam !== "" &&
                                      sEvent?.awayTeam !== "" ? (
                                        <>
                                          <div className=" team-name-ctn">
                                            <div className="temas-col">
                                              <EventName
                                                eventName={
                                                  sEvent?.customEventName
                                                    ? sEvent?.customEventName
                                                    : sEvent?.eventName ||
                                                      (sEvent?.homeTeam && sEvent?.awayTeam
                                                        ? `${sEvent.homeTeam} V ${sEvent.awayTeam}`
                                                        : "")
                                                }
                                                homeTeam={sEvent?.homeTeam}
                                                awayTeam={sEvent?.awayTeam}
                                                openDate={
                                                  sEvent?.customOpenDate
                                                    ? sEvent?.customOpenDate
                                                    : sEvent?.openDate
                                                }
                                                forcedInplay={
                                                  sEvent?.forcedInplay
                                                }
                                                status={sEvent?.status}
                                                sportId={sEvent?.sportId}
                                              />
                                            </div>
                                            <div className="enabled-markets">
                                              {sEvent.status === "IN_PLAY" ? (
                                                <div className="live-img">
                                                  {/* TODO: make this come from langData */}
                                                  <LiveSymbol
                                                    width={12}
                                                    height={12}
                                                  />
                                                </div>
                                              ) : null}
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.catId === "SR VIRTUAL"
                                                }
                                                marketType={"V"}
                                              />
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.markets
                                                    ?.enablePremium &&
                                                  sEvent?.catId !== "SR VIRTUAL"
                                                }
                                                marketType={"P"}
                                              />
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.markets
                                                    ?.enableMatchOdds
                                                }
                                                marketType={"MO"}
                                              />
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.markets
                                                    ?.enableBookmaker
                                                }
                                                marketType={"BM"}
                                              />
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.markets?.enableFancy
                                                }
                                                marketType={"F"}
                                              />
                                              <MarketEnabled
                                                marketEnabled={
                                                  sEvent?.markets?.enableToss
                                                }
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
                                        </>
                                      ) : (
                                        <div className="team-name">
                                          <div className="temas-col">
                                            <EventName
                                              eventName={
                                                sEvent?.customEventName
                                                  ? sEvent?.customEventName
                                                  : sEvent?.eventName ||
                                                    (sEvent?.homeTeam && sEvent?.awayTeam
                                                      ? `${sEvent.homeTeam} V ${sEvent.awayTeam}`
                                                      : "")
                                              }
                                              homeTeam={sEvent?.homeTeam}
                                              awayTeam={sEvent?.awayTeam}
                                              openDate={
                                                sEvent?.customOpenDate
                                                  ? sEvent?.customOpenDate
                                                  : sEvent?.openDate
                                              }
                                              forcedInplay={
                                                sEvent?.forcedInplay
                                              }
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
                                                sEvent?.markets
                                                  ?.enablePremium &&
                                                sEvent?.catId !== "SR VIRTUAL"
                                              }
                                              marketType={"P"}
                                            />
                                            <MarketEnabled
                                              marketEnabled={
                                                sEvent?.markets?.enableMatchOdds
                                              }
                                              marketType={"MO"}
                                            />
                                            <MarketEnabled
                                              marketEnabled={
                                                sEvent?.markets?.enableBookmaker
                                              }
                                              marketType={"BM"}
                                            />
                                            <MarketEnabled
                                              marketEnabled={
                                                sEvent?.markets?.enableFancy
                                              }
                                              marketType={"F"}
                                            />
                                            <MarketEnabled
                                              marketEnabled={
                                                sEvent?.markets?.enableToss
                                              }
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
                                                {sEvent.markets
                                                  ?.matchOdds?.[0] ? (
                                                  getOdds(sEvent, teamType) ? (
                                                    <>
                                                      {getOdds(
                                                        sEvent,
                                                        teamType
                                                      ).map((odd) => (
                                                        <ExchMobOddView
                                                          mainValue={odd.price}
                                                          subValue={odd.size}
                                                          oddType={
                                                            !sEvent.markets
                                                              ?.enableMatchOdds &&
                                                            sEvent.markets
                                                              ?.enablePremium
                                                              ? odd.type ===
                                                                "back-odd"
                                                                ? "premium-odd"
                                                                : "lay-odd"
                                                              : odd.type ===
                                                                "back-odd"
                                                              ? "back-odd"
                                                              : "lay-odd"
                                                          }
                                                          disable={sEvent.markets?.matchOdds?.[0]?.status
                                                            ?.toLowerCase()
                                                            .includes(
                                                              "suspended"
                                                            )}
                                                          valueType={
                                                            !sEvent.markets
                                                              ?.enableMatchOdds &&
                                                            sEvent.markets
                                                              ?.enablePremium
                                                              ? "premiumOdds"
                                                              : "matchOdds"
                                                          }
                                                          showSubValueinKformat={
                                                            true
                                                          }
                                                          // onClick={() => null}
                                                        />
                                                      ))}
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
                                  {!isMobile &&
                                    teamTypes.map((teamType, index) => (
                                      <TableCell
                                        className="odds-cell"
                                        align="center"
                                        colSpan={1}
                                        key={teamType + index}
                                      >
                                        {sEvent?.markets?.matchOdds?.[0] ? (
                                          getOdds(sEvent, teamType) ? (
                                            <div className="odds-block">
                                              {getOdds(sEvent, teamType).map(
                                                (odd) => (
                                                  <ExchOddBtn
                                                    mainValue={odd.price}
                                                    subValue={odd.size}
                                                    oddType={
                                                      odd.type === "back-odd"
                                                        ? "back-odd"
                                                        : "lay-odd"
                                                    }
                                                    disable={sEvent.markets?.matchOdds?.[0]?.status
                                                      ?.toLowerCase()
                                                      .includes("suspended")}
                                                    valueType="matchOdds"
                                                    showSubValueinKformat={true}
                                                    onClick={() => null}
                                                  />
                                                )
                                              )}
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
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </>
              ) : null}
            </>
          ))
        ) : !fetchingEvents ? (
          <div className="events-table-msg-text">
            {langData?.["no_events_txt"]}
          </div>
        ) : (
          Array.from({ length: 10 }).map((_) => (
            <Skeleton
              height={"20vh"}
              width="100%"
              style={{ marginBottom: "-40px" }}
            />
          ))
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    // bets: state.exchBetslip.bets,
    allowedConfig: state.common.allowedConfig,
    loggedIn: state.auth.loggedIn,
    fetchingEvents: state.exchangeSports.fetchingEvents,
    topicUrls: state?.exchangeSports?.topicUrls,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setEventType: (eType: SelectedObj) => dispatch(setEventType(eType)),
    setCompetition: (competition: SelectedObj) =>
      dispatch(setCompetition(competition)),
    setExchEvent: (event: SelectedObj) => dispatch(setExchEvent(event)),
    fetchCompetitions: (eventTypeId: string) =>
      dispatch(fetchCompetitions(eventTypeId)),
    fetchEventsByCompetition: (etId: string, cId: string) =>
      dispatch(fetchEventsByCompetition(etId, cId, [])),
    // addExchangeBet: (data: BsData) => dispatch(addExchangeBet(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InplayEventsTable);
