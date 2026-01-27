import {
  SET_MULTIMARKET_EVENT_DATA,
  UPDATE_MULTIMARKET_SECONDARY_MARKETS,
  UPDATE_MULTIMARKET_SECONDARY_MATCH_ODDS,
  UPDATE_MULTIMARKET_BOOKMAKER_MARKETS,
  MULTI_SUSPENDED_MARKETS,
  MULTI_COMMISSION_MARKETS,
  TRIGGER_MULTI_FETCH_MARKETS,
  TRIGGER_MULTI_FETCH_ORDERS,
  TRIGGER_MULTI_BET_STATUS,
  // UPDATE_MULTIMARKET_FANCY_MARKETS,
} from "./multimarketActionTypes";
import { MatchOddsRunnerDTO } from "../../models/common/MatchOddsDTO";
import {
  BookmakerDTO,
  BookmakerRunnerDTO,
} from "../../models/common/BookmakerDTO";
import { ExchangePriceDTO } from "../../models/common/ExchangePriceDTO";
import {
  DisabledMarketDTOMap,
  SuspendedMarketDTOMap,
} from "../../models/common/SuspendedMarketDTO";
import { SuspendedMarketDTO } from "../../models/common/SuspendedMarketDTO";
import { CommissionMarketDTO } from "../../models/common/CommissionMarketDTO";
import { SecondaryMarketsMap } from "../../models/ExchangeSportsState";
import moment from "moment";

type Action = {
  type: string;
  payload: any;
};

const initialState = {
  multiMarketData: {},
  secondaryMultiMatchOddsMap: {},
  secondaryMultiMarketsMap: {},
  suspendedMarketsMap: {},
  disabledMarketsMap: {},
  triggerFetchMarkets: null,
  triggerFetchOrders: null,
  triggerBetStatus: null,
};

const getMatchOddsSet = (prices: ExchangePriceDTO[]) => {
  let pricesSet: ExchangePriceDTO[] = [];
  if (prices?.length > 0) {
    for (let i = 0; i < 3; i += 1) {
      if (prices[i]) pricesSet.push(prices[i]);
      else pricesSet.push({ price: null, size: null });
    }
  }
  return pricesSet;
};
// const getFancyCategory = (runnerName: string) => {
//   return 'session-market';
// };

const getSuspendValue = (
  suspendMarketsMap: SuspendedMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoMarketId: string,
  dtoSuspsend: boolean
) => {
  let suspend: boolean;
  let key = dtoEventId + ":" + dtoMarketId;

  // case: for storing initial state from markets api call
  if (dtoSuspsend !== undefined) {
    suspend = dtoSuspsend;
    suspendMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: dtoMarketId,
      suspend: dtoSuspsend,
    };
  } else {
    // case for odds updates from websockets
    // suspend field will not be present in odds update from websocket
    let suspendedMarket = suspendMarketsMap[key];
    if (!suspendedMarket) {
      suspend = false;
    } else if (suspendedMarket) {
      suspend = suspendedMarket.suspend;
    }
  }

  return suspend;
};

const getDisableValue = (
  disableMarketsMap: DisabledMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoMarketId: string,
  dtoDisable: boolean
) => {
  let disable: boolean;
  let key = dtoEventId + ":" + dtoMarketId;
  // case: for storing initial state from markets api call
  if (dtoDisable !== undefined) {
    disable = dtoDisable;
    disableMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: dtoMarketId,
      disable: dtoDisable,
    };
  } else {
    // case for odds updates from websockets
    // disable field will not be present in odds update from websocket
    let disabledMarket = disableMarketsMap[key];
    if (!disabledMarket) {
      disable = false;
    } else if (disabledMarket) {
      disable = disabledMarket.disable;
    }
  }

  return disable;
};

const multiMarketReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case MULTI_SUSPENDED_MARKETS: {
      let suspendedMarket: SuspendedMarketDTO = action.payload;
      let allSuspendedMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      const sportId = suspendedMarket.sportId;
      const competitionId = suspendedMarket.competitionId;
      const eventId = suspendedMarket.eventId;
      const marketType = suspendedMarket.marketType;
      const marketId = suspendedMarket.marketId;
      const key = eventId + ":" + marketId;
      allSuspendedMarketsMap[key] = suspendedMarket;

      // TODO: check if the return statement is required or not ??
      switch (marketType) {
        case "MATCH_ODDS": {
          // Set suspend in match odds markets data
          const allEvents = { ...state.multiMarketData };
          if (eventId && allEvents[`${sportId}-${competitionId}-${eventId}`]) {
            let matchOddsMarket =
              allEvents[`${sportId}-${competitionId}-${eventId}`]?.matchOdds;
            if (matchOddsMarket.marketId === marketId) {
              matchOddsMarket.suspend = suspendedMarket.suspend;
            }
          }

          // For secondary match odds data
          const allSecMatchOddsMap = { ...state.secondaryMultiMatchOddsMap };
          if (
            allSecMatchOddsMap[
              `${sportId}-${competitionId}-${eventId}-${marketId}`
            ]
          ) {
            let matchOddsMarket =
              allSecMatchOddsMap[
                `${sportId}-${competitionId}-${eventId}-${marketId}`
              ];
            matchOddsMarket.suspend = suspendedMarket.suspend;
          }

          return {
            ...state,
            multiMarketData: allEvents,
            secondaryMultiMatchOddsMap: allSecMatchOddsMap,
            suspendedMarketsMap: allSuspendedMarketsMap,
          };
        }
        case "BOOKMAKER": {
          // Set suspend in bookmaker markets data
          const marketsMap = { ...state.secondaryMultiMarketsMap };
          if (marketsMap[`${sportId}-${competitionId}-${eventId}`]) {
            let bookmakerMarkets =
              marketsMap[`${sportId}-${competitionId}-${eventId}`]?.bookmakers;
            if (bookmakerMarkets && bookmakerMarkets.length) {
              for (let bm of bookmakerMarkets) {
                if (bm.marketId === marketId)
                  bm.suspend = suspendedMarket.suspend;
              }
            }
          }
          return {
            ...state,
            secondaryMultiMarketsMap: marketsMap,
            suspendedMarketsMap: allSuspendedMarketsMap,
          };
        }
        default:
          console.log(
            "SuspendMarket:Multi-Market: Invalid market type: ",
            marketType
          );
      }

      return {
        ...state,
        suspendedMarketsMap: allSuspendedMarketsMap,
      };
    }

    case MULTI_COMMISSION_MARKETS: {
      let commissionMarket: CommissionMarketDTO = action.payload;
      const marketType = commissionMarket.marketType;
      const marketId = commissionMarket.marketId;
      let secondaryMarketsMap = { ...state.secondaryMultiMarketsMap };
      let secondaryMarkets =
        secondaryMarketsMap[
          `${commissionMarket.sportId}-${commissionMarket.competitionId}-${commissionMarket.eventId}`
        ];

      // TODO: check if the return statement is required or not ??
      switch (marketType) {
        case "BOOKMAKER": {
          // Set commission in bookmaker markets data
          let bookmakers = secondaryMarkets?.bookmakers;
          if (bookmakers && bookmakers.length) {
            for (let bm of bookmakers) {
              if (bm.marketId === marketId)
                bm.commissionEnabled = commissionMarket.commission;
            }
          }
          break;
        }
        default:
          console.log(
            "CommissionMarket:Multi-Market: Invalid market type: ",
            marketType
          );
      }

      return {
        ...state,
        secondaryMarketsMap: secondaryMarketsMap,
      };
    }

    case SET_MULTIMARKET_EVENT_DATA: {
      const events = action.payload.events || [action.payload];
      let data = { ...state.multiMarketData };

      let suspendMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };

      for (const eventPayload of events) {
        const { sportId, competitionId, eventId } = eventPayload;

        // Add events data
        if (eventPayload.eventData) {
          let eData;
          let limitMap = new Map();
          if (data[`${sportId}-${competitionId}-${eventId}`]) {
            eData = { ...data[`${sportId}-${competitionId}-${eventId}`] };
            limitMap.set(
              data[`${sportId}-${competitionId}-${eventId}`]?.matchOdds
                .marketId,
              data[`${sportId}-${competitionId}-${eventId}`]?.matchOdds
                ?.marketLimits
            );
          } else eData = { ...eventPayload.eventData };

          if (eData && eData.eventId && eData.eventId !== "undefined") {
            let homeTeam = eData.homeTeam ? eData.homeTeam : "";
            let awayTeam = eData.awayTeam ? eData.awayTeam : "";
            if (
              homeTeam === "" &&
              awayTeam === "" &&
              (eData.eventName?.toLowerCase().includes(" v ") ||
                eData.eventName?.toLowerCase().includes(" vs "))
            ) {
              homeTeam = eData.eventName?.toLowerCase().includes(" v ")
                ? eData.eventName.split(" v ")[0].trim()
                : eData.eventName.includes(" VS ")
                ? eData.eventName.split(" VS ")[0].trim()
                : eData.eventName.split(" Vs ")[0].trim();
              awayTeam = eData.eventName?.toLowerCase().includes(" v ")
                ? eData.eventName.split(" v ")[1].trim().split(" - ")[0]
                : eData.eventName.includes(" VS ")
                ? eData.eventName.split(" VS ")[1].trim().split(" - ")[0]
                : eData.eventName.includes("Vs")
                ? eData.eventName.split(" Vs ")[1].trim().split(" - ")[0]
                : eData.eventName.split(" vs ")[1].trim().split(" - ")[0];
            }

            // Set MatchOdds Data.
            const matchOddsData = eventPayload.matchOddsData;
            const runners: MatchOddsRunnerDTO[] = [];
            let suspend: boolean = getSuspendValue(
              suspendMarketsMap,
              eData?.providerId,
              eData?.sportId,
              eData?.competitionId,
              eData?.eventId,
              eData?.marketType,
              eData?.marketId,
              matchOddsData?.suspended
            );
            if (matchOddsData) {
              if (matchOddsData.runners && matchOddsData.runners.length > 0) {
                let i = 0;
                for (let e of matchOddsData.runners) {
                  if (e) {
                    let runnerName = e.runnerName ? e.runnerName : e.RunnerName;
                    if (runnerName === undefined) {
                      runnerName = "";
                    }

                    if (!runnerName.toLowerCase().includes("draw") && i === 0) {
                      if (runnerName === "") {
                        runnerName = homeTeam;
                      } else if (runnerName !== awayTeam) {
                        homeTeam = runnerName;
                      }
                    }

                    if (!runnerName.toLowerCase().includes("draw") && i !== 0) {
                      if (runnerName === "") {
                        runnerName = awayTeam;
                      } else if (runnerName !== homeTeam) {
                        awayTeam = runnerName;
                      }
                    }

                    i += 1;
                    runners.push({
                      runnerId: e.runnerId ? e.runnerId : e.runnerId,
                      runnerName: runnerName,
                      backPrices: getMatchOddsSet(e.backPrices),
                      layPrices: getMatchOddsSet(e.layPrices),
                      status: e.status,

                      clothNumber: e?.clothNumber,
                      jockeyName: e?.jockeyName,
                      runnerAge: e?.runnerAge,
                      runnerIcon: e?.runnerIcon,
                      stallDraw: e?.stallDraw,
                      trainerName: e?.trainerName,
                    });
                  }
                }
              }
              const bLimits = eData?.matchOdds?.limits;
              eData.matchOdds = {
                marketId: matchOddsData.marketId ? matchOddsData.marketId : "",
                marketName: matchOddsData.marketName
                  ? matchOddsData.marketName
                  : "",
                // inplay: matchOddsData.inplay ? matchOddsData.inplay : false,
                status: matchOddsData.status ? matchOddsData.status : "",
                runners: runners,
                limits: matchOddsData.limits ? matchOddsData?.limits : bLimits,
                marketLimits: matchOddsData?.marketLimits
                  ? matchOddsData?.marketLimits
                  : limitMap.get(matchOddsData?.marketId),
                suspend: suspend,
              };
            } else {
              let matchOdds = eData.matchOdds;
              if (matchOdds) {
                eData.matchOdds = {
                  marketId: matchOdds?.marketId,
                  marketName: matchOdds?.marketName,
                  // inplay: matchOdds?.inplay,
                  status: "SUSPENDED",
                  runners: matchOdds?.runners,
                  limits: matchOddsData?.limits,
                  marketLimits: matchOdds?.marketLimits
                    ? matchOdds?.marketLimits
                    : limitMap.get(matchOdds?.marketId),
                  suspend: true,
                };
              } else {
                eData.matchOdds = {
                  marketId: "",
                  marketName: "",
                  // inplay: false,
                  status: "SUSPENDED",
                  runners: [],
                  limits: null,
                  suspend: true,
                };
              }
            }
            // Set EventData
            eData.homeTeam = homeTeam;
            eData.awayTeam = awayTeam;
            eData.eventSlug = eData.eventSlug
              ? eData.eventSlug
              : eData.eventName
              ? eData.eventName
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, " ")
                  .replace(/ +/g, " ")
                  .trim()
                  .split(" ")
                  .join("-")
              : "";

            data[`${sportId}-${competitionId}-${eventId}`] = eData;
          }
        }
      }
      return {
        ...state,
        multiMarketData: data,
        suspendedMarketsMap: suspendMarketsMap,
      };
    }

    case UPDATE_MULTIMARKET_SECONDARY_MARKETS: {
      const { sportId, competitionId, eventId } = action.payload;
      const marketsMap = { ...state.secondaryMultiMarketsMap };
      let suspendMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };
      // Add event data
      if (action.payload.eventId) {
        if (!marketsMap[`${sportId}-${competitionId}-${eventId}`]) {
          marketsMap[`${sportId}-${competitionId}-${eventId}`] = {
            bookmakers: [],
            enableBookmaker: false,
            fancyMarkets: [],
            enableFancy: false,
          };
        }

        // Set BookmakerOdds Data.
        const bookMakerOddsData = action.payload.bookmakerOddsData;
        let bookMakerOdds: BookmakerDTO[] = [];
        if (bookMakerOddsData && bookMakerOddsData.length > 0) {
          for (let br of bookMakerOddsData) {
            let bmRunners: BookmakerRunnerDTO[] = [];
            let suspend: boolean = getSuspendValue(
              suspendMarketsMap,
              "-",
              sportId,
              competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.suspended
            );
            let disable: boolean = getDisableValue(
              disabledMarketsMap,
              "-",
              sportId,
              competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.disabled
            );
            for (let b of br.runners) {
              bmRunners.push({
                runnerId: b.runnerId ? b.runnerId : "",
                runnerName: b.runnerName ? b.runnerName : "",
                backPrice: b.backPrices[0]?.price,
                backSize: b.backPrices[0]?.size,
                layPrice: b.layPrices[0]?.price,
                laySize: b.layPrices[0]?.size,
                status: b.status ? b.status : "",
                sort: b.sort,
              });
            }
            bmRunners.sort((a, b) => {
              const aDesc = a.sort;
              const bDesc = b.sort;
              if (aDesc > bDesc) return 1;
              else if (aDesc < bDesc) return -1;
              else return 0;
            });
            bookMakerOdds.push({
              suspend: suspend,
              disable: disable,
              marketId: br.marketId ? br.marketId : "-1",
              marketName: br.marketName ? br.marketName : "Bookmaker",
              customMarketName: br.customMarketName
                ? br.customMarketName
                : "Bookmaker",
              runners: bmRunners,
              status: br.status ? br.status : "OPEN",
              commissionEnabled:
                br.commissionEnabled !== undefined
                  ? br.commissionEnabled
                  : false,
              marketLimits: br?.marketLimits,
            });
          }
        } else if (marketsMap[eventId]?.bookmakers[0]) {
          bookMakerOdds = marketsMap[eventId]?.bookmakers;
          for (let bm of bookMakerOdds) {
            bm.suspend = true;
            bm.disable = true;
            for (let br of bm.runners) {
              br.backPrice = "0";
              br.layPrice = "0";
            }
          }
        }
        bookMakerOdds.sort((a, b) => {
          const aDesc = a.marketName;
          const bDesc = b.marketName;
          if (aDesc > bDesc) return 1;
          else if (aDesc < bDesc) return -1;
          else return 0;
        });
        marketsMap[`${sportId}-${competitionId}-${eventId}`].bookmakers =
          bookMakerOdds;
        marketsMap[`${sportId}-${competitionId}-${eventId}`].enableBookmaker =
          action.payload.enableBookmaker;

        // Set Fancy markets data
        // const fancyOddsData = action.payload.sessionOddsData;
        // let fancyOdds: FancyMarketDTO[] = [];
        // if (fancyOddsData && fancyOddsData.length > 0) {
        //   for (let f of fancyOddsData) {
        //       fancyOdds.push({
        //         selectionId: f.selectionId ? f.selectionId : '',
        //         runnerName: f.runnerName ? f.runnerName : '',
        //         gameStatus: f.gameStatus ? f.gameStatus : '',
        //         layPrice: f.layPrice
        //           ? f.marketType === 'fancy3' || f.marketType === 'odd-even'
        //             ? f.layPrice.toFixed(2)
        //             : f.layPrice
        //           : null,
        //         backPrice: f.backPrice
        //           ? f.marketType === 'fancy3' || f.marketType === 'odd-even'
        //             ? f.backPrice.toFixed(2)
        //             : f.backPrice
        //           : null,
        //         laySize: f.laySize ? f.laySize : null,
        //         backSize: f.backSize ? f.backSize : null,
        //         category: getFancyCategory(f.runnerName),
        //       });
        //   }
        // } else if (
        //   marketsMap[`${sportId}-${competitionId}-${eventId}`]?.fancyMarkets
        // ) {
        //   fancyOdds =
        //     marketsMap[`${sportId}-${competitionId}-${eventId}`].fancyMarkets;
        //   for (let fMarket of fancyOdds) {
        //     fMarket.gameStatus = 'SUSPENDED';
        //   }
        // }
        // marketsMap[`${sportId}-${competitionId}-${eventId}`].fancyMarkets =
        //   fancyOdds;
        // marketsMap[`${sportId}-${competitionId}-${eventId}`].enableFancy =
        //   action.payload.enableFancy;
      }
      return {
        ...state,
        secondaryMultiMarketsMap: marketsMap,
        suspendedMarketsMap: suspendMarketsMap,
        disabledMarketsMap: disabledMarketsMap,
      };
    }

    // Data comes form websocket.
    case UPDATE_MULTIMARKET_SECONDARY_MATCH_ODDS: {
      const { sportId, competitionId, eventId } = action.payload;
      const marketId: string = action.payload.marketId;
      const allSecMatchOddsMap = { ...state.secondaryMultiMatchOddsMap };
      const matchOddsData = action?.payload?.matchOddsData;
      let suspendMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };

      let runners: MatchOddsRunnerDTO[] = [];
      let runnersData: MatchOddsRunnerDTO[] = allSecMatchOddsMap[
        `${sportId}-${competitionId}-${eventId}-${marketId}`
      ]?.runners?.length
        ? [
            ...allSecMatchOddsMap[
              `${sportId}-${competitionId}-${eventId}-${marketId}`
            ]?.runners,
          ]
        : [];
      if (matchOddsData) {
        let suspend: boolean = getSuspendValue(
          suspendMarketsMap,
          "-",
          sportId,
          competitionId,
          eventId,
          matchOddsData?.marketType,
          matchOddsData?.marketId,
          matchOddsData?.suspended
        );
        let disable: boolean = getDisableValue(
          disabledMarketsMap,
          "-",
          sportId,
          competitionId,
          eventId,
          matchOddsData?.marketType,
          matchOddsData?.marketId,
          matchOddsData?.disabled
        );
        if (matchOddsData?.runners && matchOddsData?.runners?.length > 0) {
          let data: any = {};
          for (let e of matchOddsData.runners) {
            if (e) {
              data = runnersData?.find(
                (item) => item?.runnerId === e?.runnerId
              );
              runners.push({
                runnerId: e?.runnerId,
                runnerName: e?.runnerName,
                backPrices: getMatchOddsSet(e.backPrices),
                layPrices: getMatchOddsSet(e.layPrices),
                status: e?.status,
                clothNumber: e?.clothNumber
                  ? e?.clothNumber
                  : data?.clothNumber ?? "",
                jockeyName: e?.jockeyName
                  ? e?.jockeyName
                  : data?.jockeyName ?? "",
                runnerAge: e?.runnerAge ? e?.runnerAge : data?.runnerAge ?? "",
                runnerIcon: e?.runnerIcon
                  ? e?.runnerIcon
                  : data?.runnerIcon ?? "",
                stallDraw: e?.stallDraw ? e?.stallDraw : data?.stallDraw ?? "",
                trainerName: e?.trainerName
                  ? e?.trainerName
                  : data?.trainerName ?? "",
              });
            }
          }
        }

        allSecMatchOddsMap[
          `${sportId}-${competitionId}-${eventId}-${marketId}`
        ] = {
          marketId: matchOddsData.marketId,
          marketName: matchOddsData.marketName,
          marketTime: matchOddsData.marketTime,
          // inplay: matchOddsData.inplay,
          status: matchOddsData.status,
          runners: runners,
          limits: matchOddsData.limits
            ? matchOddsData.limits
            : allSecMatchOddsMap[
                `${sportId}-${competitionId}-${eventId}-${marketId}`
              ]?.limits,
          marketLimits: matchOddsData?.marketLimits
            ? matchOddsData.marketLimits
            : allSecMatchOddsMap[
                `${sportId}-${competitionId}-${eventId}-${marketId}`
              ]?.marketLimits,
          suspend: suspend,
          disable: disable,
        };
      } else {
        let matchOdds =
          allSecMatchOddsMap[
            `${sportId}-${competitionId}-${eventId}-${marketId}`
          ];
        if (matchOdds) {
          allSecMatchOddsMap[
            `${sportId}-${competitionId}-${eventId}-${marketId}`
          ] = {
            marketId: matchOdds.marketId,
            marketName: matchOdds.marketName,
            marketTime: matchOddsData.marketTime,
            // inplay: matchOdds.inplay,
            status: "SUSPENDED",
            runners: matchOdds.runners,
            limits: matchOdds.limits,
            marketLimits: matchOdds?.marketLimits
              ? matchOdds.marketLimits
              : allSecMatchOddsMap[
                  `${sportId}-${competitionId}-${eventId}-${marketId}`
                ]?.marketLimits,
            suspend: true,
            disable: true,
          };
        } else {
          allSecMatchOddsMap[
            `${sportId}-${competitionId}-${eventId}-${marketId}`
          ] = {
            marketId: "",
            marketName: "",
            // inplay: false,
            status: "SUSPENDED",
            runners: [],
            limits: null,
            suspend: true,
          };
        }
      }

      const secMatchOddsMap = { ...state.secondaryMultiMatchOddsMap };
      secMatchOddsMap[`${sportId}-${competitionId}-${eventId}-${marketId}`] =
        allSecMatchOddsMap[
          `${sportId}-${competitionId}-${eventId}-${marketId}`
        ];

      return {
        ...state,
        secondaryMultiMatchOddsMap: secMatchOddsMap,
        suspendedMarketsMap: suspendMarketsMap,
        disabledMarketsMap: disabledMarketsMap,
      };
    }

    // Data comes from websocket.
    case UPDATE_MULTIMARKET_BOOKMAKER_MARKETS: {
      const { sportId, competitionId, eventId } = action.payload;
      //const eventId: string = action.payload.eventId;
      const marketsMap = { ...state.secondaryMultiMarketsMap };
      let suspendMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };
      if (action.payload.eventId) {
        if (!marketsMap[`${sportId}-${competitionId}-${eventId}`]) {
          marketsMap[`${sportId}-${competitionId}-${eventId}`] = {
            ...marketsMap[`${sportId}-${competitionId}-${eventId}`],
            bookmakers: [],
            enableBookmaker: false,
          };
        }

        // Set BookmakerOdds Data.
        const bookMakerOddsData =
          action?.payload?.bookmakerOddsData &&
          Array.isArray(action?.payload?.bookmakerOddsData)
            ? action?.payload?.bookmakerOddsData
            : [action?.payload?.bookmakerOddsData];
        let bookMakerOdds: BookmakerDTO[] = [];
        if (
          marketsMap[`${sportId}-${competitionId}-${eventId}`]?.bookmakers
            ?.length
        )
          bookMakerOdds =
            marketsMap[`${sportId}-${competitionId}-${eventId}`]?.bookmakers;
        if (bookMakerOddsData && bookMakerOddsData.length) {
          for (let br of bookMakerOddsData) {
            let bmRunners: BookmakerRunnerDTO[] = [];
            let suspend: boolean = getSuspendValue(
              suspendMarketsMap,
              "-",
              sportId,
              competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.suspended
            );
            let disable: boolean = getDisableValue(
              disabledMarketsMap,
              "-",
              sportId,
              competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.disabled
            );
            for (let b of br.runners) {
              bmRunners.push({
                runnerId: b.runnerId ? b.runnerId : "",
                runnerName: b.runnerName ? b.runnerName : "",
                backPrice: b.backPrices[0]?.price,
                backSize: b.backPrices[0]?.size,
                layPrice: b.layPrices[0]?.price,
                laySize: b.layPrices[0]?.size,
                status: b.status ? b.status : "",
                sort: b.sort,
              });
            }
            bmRunners.sort((a, b) => {
              const aDesc = a.sort;
              const bDesc = b.sort;
              if (aDesc > bDesc) return 1;
              else if (aDesc < bDesc) return -1;
              else return 0;
            });
            let index = bookMakerOdds?.length
              ? bookMakerOdds.findIndex((itm) => itm.marketId === br.marketId)
              : -1;
            if (index > -1)
              bookMakerOdds[index] = {
                suspend: suspend,
                disable: disable,
                marketId: br.marketId ? br.marketId : "-1",
                marketName: br.marketName ? br.marketName : "Bookmaker",
                customMarketName: br.customMarketName
                  ? br.customMarketName
                  : "Bookmaker",
                runners: bmRunners,
                status: br.status ? br.status : "OPEN",
                commissionEnabled:
                  br.commissionEnabled !== undefined
                    ? br.commissionEnabled
                    : bookMakerOdds[index].commissionEnabled,
                marketLimits: br?.marketLimits
                  ? br.marketLimits
                  : bookMakerOdds[index].marketLimits,
              };
            else
              bookMakerOdds.push({
                suspend: suspend,
                disable: disable,
                marketId: br.marketId ? br.marketId : "-1",
                marketName: br.marketName ? br.marketName : "Bookmaker",
                customMarketName: br.customMarketName
                  ? br.customMarketName
                  : "Bookmaker",
                runners: bmRunners,
                status: br.status ? br.status : "OPEN",
                commissionEnabled:
                  br.commissionEnabled !== undefined
                    ? br.commissionEnabled
                    : false,
                marketLimits: br?.marketLimits,
              });
          }
        }
        bookMakerOdds.sort((a, b) => {
          const aDesc = a.marketName;
          const bDesc = b.marketName;
          if (aDesc > bDesc) return 1;
          else if (aDesc < bDesc) return -1;
          else return 0;
        });
        marketsMap[`${sportId}-${competitionId}-${eventId}`].bookmakers =
          bookMakerOdds;
        marketsMap[`${sportId}-${competitionId}-${eventId}`].enableBookmaker =
          action.payload.enableBookmaker;
        return {
          ...state,
          secondaryMultiMarketsMap: marketsMap,
          suspendedMarketsMap: suspendMarketsMap,
          disabledMarketsMap: disabledMarketsMap,
        };
      }
    }

    // case UPDATE_MULTIMARKET_FANCY_MARKETS: {
    //   const { sportId, competitionId, eventId } = action.payload;
    //   //const eventId: string = action.payload.eventId;
    //   const fancyOddsData = action.payload.fancyUpdateData;
    //   const marketsMap = { ...state.secondaryMultiMarketsMap };

    //   // Add event data
    //   if (action.payload.eventId) {
    //     if (!marketsMap[`${sportId}-${competitionId}-${eventId}`]) {
    //       marketsMap[`${sportId}-${competitionId}-${eventId}`] = {
    //         ...marketsMap[`${sportId}-${competitionId}-${eventId}`],
    //         fancyMarkets: [],
    //         enableFancy: false,
    //       };
    //     }

    //     // Set Fancy markets data
    //     let fancyOdds: FancyMarketDTO[] = [];
    //     if (fancyOddsData && fancyOddsData.length > 0) {
    //       for (let f of fancyOddsData) {
    //           fancyOdds.push({
    //             selectionId: f.marketId ? f.marketId : '',
    //             runnerName: f.marketName ? f.marketName : '',
    //             gameStatus: f.status ? f.status : '',
    //             layPrice: f.noValue
    //               ? f.marketType === 'fancy3' || f.marketType === 'odd-even'
    //                 ? f.noValue.toFixed(2)
    //                 : f.noValue
    //               : null,
    //             backPrice: f.yesValue
    //               ? f.marketType === 'fancy3' || f.marketType === 'odd-even'
    //                 ? f.yesValue.toFixed(2)
    //                 : f.yesValue
    //               : null,
    //             laySize: f.noRate ? f.noRate : null,
    //             backSize: f.yesRate ? f.yesRate : null,
    //             category: getFancyCategory(f.category),
    //           });
    //       }
    //     } else if (
    //       marketsMap[`${sportId}-${competitionId}-${eventId}`].fancyMarkets
    //     ) {
    //       fancyOdds =
    //         marketsMap[`${sportId}-${competitionId}-${eventId}`].fancyMarkets;
    //       for (let fMarket of fancyOdds) {
    //         fMarket.gameStatus = 'SUSPENDED';
    //       }
    //     }

    //     fancyOdds.sort((a, b) => {
    //       const aDesc = a?.runnerName?.toLocaleLowerCase();
    //       const bDesc = b?.runnerName?.toLocaleLowerCase();
    //       if (aDesc > bDesc) return 1;
    //       else if (aDesc < bDesc) return -1;
    //       return 0;
    //     });
    //     marketsMap[`${sportId}-${competitionId}-${eventId}`].fancyMarkets =
    //       fancyOdds;
    //     // marketsMap[eventId].enableFancy = action.payload.enableFancy;
    //   }

    //   return {
    //     ...state,
    //     secondaryMultiMarketsMap: marketsMap,
    //   };
    // }

    case TRIGGER_MULTI_FETCH_MARKETS: {
      var limitKey = action.payload.data.limitKey;
      var trigger = false;

      if (action.payload?.accountPath) {
        if (action.payload.accountPath.includes(limitKey)) {
          trigger = true;
        }
      } else {
        const multiMarketData = state.multiMarketData;
        limitKey = limitKey.concat("/");
        var keys = Object.keys(multiMarketData);

        for (let key of keys) {
          const ids = key.split("-");
          const checkKey = limitKey.includes(`/EI/`)
            ? `/EI/${ids[2]}/`
            : limitKey.includes(`/CI/`)
            ? `/CI/${ids[1]}/`
            : limitKey.includes(`/SI/`)
            ? `/SI/${ids[0]}/`
            : limitKey.includes("/SPORTS/")
            ? `/SPORTS/`
            : null;

          if (checkKey && limitKey.includes(checkKey)) {
            trigger = true;
            break;
          }
        }
      }
      if (trigger) {
        return {
          ...state,
          triggerFetchMarkets: moment.now(),
        };
      }
    }

    case TRIGGER_MULTI_FETCH_ORDERS: {
      const multiMarketData = state.multiMarketData;
      if (multiMarketData) {
        var eventId = action.payload;
        var trigger = false;

        var keys = Object.keys(multiMarketData);
        for (let key of keys) {
          if (key.split("-")[2] == eventId) {
            trigger = true;
          }
        }

        if (trigger) {
          return {
            ...state,
            triggerFetchOrders: moment.now(),
          };
        }
      }
    }

    case TRIGGER_MULTI_BET_STATUS: {
      const multiMarketData = state.multiMarketData;
      if (multiMarketData) {
        var eventId = action.payload;
        var trigger = false;

        var keys = Object.keys(multiMarketData);
        for (let key of keys) {
          if (key.split("-")[2] == eventId) {
            trigger = true;
          }
        }

        if (trigger) {
          return {
            ...state,
            triggerBetStatus: moment.now(),
          };
        }
      }
    }

    default:
      return state;
  }
};

export default multiMarketReducer;
