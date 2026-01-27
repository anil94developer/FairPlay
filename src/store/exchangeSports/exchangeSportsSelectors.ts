import moment from "moment";
import { LINE_MARKETS } from "../../constants/LineMarkets";
import { EventDTO } from "../../models/common/EventDTO";
import { MatchOddsDTO } from "../../models/common/MatchOddsDTO";
import { EventType } from "../../models/EventType";
import {
  CompetitionEventTypeMap,
  EventsMap,
  SecondaryMarketsMap,
  SecondaryMatchOddsMap,
  PremiumMarketsMap,
} from "../../models/ExchangeSportsState";
import { SPORTS_MAP } from "../../constants/ExchangeEventTypes";

export const eventTypesNameMap: { [key: string]: string } = {
  "4": "Cricket",
  "2": "Tennis",
  "1": "Football",
  "7": "Horse Racing",
  "4339": "GreyHound",
  "7522": "Basketball",
  "7511": "Baseball",
  sr_sport_29: "Futsal",
  sr_sport_22: "Darts",
  sr_sport_23: "Volleyball",
  sr_sport_20: "Table Tennis",
  "99990": "Binary",
  "2378961": "Politics",
  sr_sport_4: "Ice Hockey",
  "99994": "Kabaddi",
  sr_sport_117: "MMA",
  sr_sport_12: "Rugby",
};

type InplayEventsObj = {
  sportId: string;
  sportName: string;
  sportSlug: string;
  events: EventDTO[];
  priority?: number;
};

export const getCompetitionsByEventType = (
  competitions: CompetitionEventTypeMap,
  eventTypeId: string
) => {
  return competitions[eventTypeId] ? competitions[eventTypeId] : null;
};

export const getExchangeEvents = (
  allEvents: EventsMap,
  eventTypeId: string,
  competitionId?: string,
  pageNo?: number,
  pageSize?: number
) => {
  if (allEvents[eventTypeId]) {
    let events: EventDTO[] = [];
    if (competitionId) {
      if (allEvents[eventTypeId][competitionId]) {
        for (let eventId of Object.keys(
          allEvents[eventTypeId][competitionId]
        )) {
          const eData = allEvents[eventTypeId][competitionId][eventId];
          const dateDiff = moment(eData.openDate).diff(moment(), "days");
          const dateDiffinSecs = moment(eData.openDate).diff(
            moment(),
            "seconds"
          );
          if (
            eData.matchOdds &&
            eData.matchOdds.status.toLowerCase() !== "closed" &&
            (dateDiff >= 0 || eData.status === "IN_PLAY") &&
            !(dateDiffinSecs < 0 && eData.status !== "IN_PLAY")
          ) {
            events.push(eData);
          }
        }
      }
    } else {
      for (let competitionId of Object.keys(allEvents[eventTypeId])) {
        for (let eventId of Object.keys(
          allEvents[eventTypeId][competitionId]
        )) {
          const eData = allEvents[eventTypeId][competitionId][eventId];
          const dateDiff = moment(eData.openDate).diff(moment(), "days");
          const dateDiffinSecs = moment(eData.openDate).diff(
            moment(),
            "seconds"
          );
          // if (
          //   eData.matchOdds &&
          //   eData.matchOdds.status.toLowerCase() !== 'closed' &&
          //   (dateDiff >= 0 || eData.matchOdds.inplay) &&
          //   !(dateDiffinSecs < 0 && !eData.matchOdds.inplay)
          // ) {
          //   events.push(eData);
          // }
          events.push(eData);
        }
      }
    }
    if (events.length > 0) {
      events.sort((a, b) => {
        const aOpenDate = a.customOpenDate
          ? moment(a.customOpenDate)
          : moment(a.openDate);
        const bOpenDate = b.customOpenDate
          ? moment(b.customOpenDate)
          : moment(b.openDate);
        return aOpenDate.diff(bOpenDate, "seconds") > 0 ? 1 : -1;
      });
      if (pageNo && pageSize) {
        return events.slice((pageNo - 1) * pageSize, pageNo * pageSize);
      } else {
        return events;
      }
    }
  }
  return null;
};

export const getEventsListByCompetition = (
  allEvents: EventsMap,
  eventTypeId: string,
  competitionId?: string
) => {
  if (allEvents[eventTypeId]) {
    let events: EventType[] = [];
    if (competitionId && allEvents[eventTypeId][competitionId]) {
      for (let eventId of Object.keys(allEvents[eventTypeId][competitionId])) {
        const e = allEvents[eventTypeId][competitionId][eventId];
        if (e.matchOdds.status.toLowerCase() !== "closed") {
          events.push({
            id: e.eventId,
            name: e.eventName,
            slug: e.eventSlug,
          });
        }
      }
    } else {
      for (let competitionId of Object.keys(allEvents[eventTypeId])) {
        for (let eventId of Object.keys(
          allEvents[eventTypeId][competitionId]
        )) {
          const e = allEvents[eventTypeId][competitionId][eventId];
          if (e.matchOdds.status.toLowerCase() !== "closed") {
            events.push({
              id: e.eventId,
              name: e.eventName,
              slug: e.eventSlug,
            });
          }
        }
      }
    }
    return events;
  }
  return null;
};

export const getInplayEvents = (allEvents: EventsMap, contentConfig: any) => {
  for (let key in allEvents) {
    if (key == "7" || key == "4339") {
      delete allEvents[key];
    }
  }
  let inplayEvents: InplayEventsObj[] = [];
  for (let etId of Object.keys(allEvents)) {
    let events: EventDTO[] = [];
    var sport = contentConfig?.sports?.filter(
      (item: any) =>
        item.name.toLowerCase() === eventTypesNameMap[etId]?.toLowerCase()
    )[0];
    for (let cId of Object.keys(allEvents[etId])) {
      for (let eId of Object.keys(allEvents[etId][cId])) {
        const eData = allEvents[etId][cId][eId];

        // display forced inplay events as well
        if (
          (eData.sportId != "2" &&
            moment(eData.openDate).diff(moment(), "seconds") <= 0) ||
          eData.forcedInplay ||
          eData.status == "IN_PLAY" ||
          (eData.sportId === "2" &&
            moment(eData.openDate).diff(moment(), "minutes") <= 5)
        ) {
          events.push(eData);
        }
      }
    }

    var disable = sport ? sport.disabled : false;
    if (events.length > 0 && !disable) {
      events.sort((a, b) => {
        const aOpenDate = a.customOpenDate
          ? moment(a.customOpenDate)
          : moment(a.openDate);
        const bOpenDate = b.customOpenDate
          ? moment(b.customOpenDate)
          : moment(b.openDate);
        return aOpenDate.diff(bOpenDate, "seconds") > 0 ? 1 : -1;
      });
      inplayEvents.push({
        sportId: etId,
        sportName: eventTypesNameMap[etId],
        sportSlug: eventTypesNameMap[etId]?.toLowerCase(),
        events: events,
        priority: sport
          ? sport.priority
          : SPORTS_MAP.get(eventTypesNameMap[etId])?.priority,
      });
    }
  }

  inplayEvents.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return inplayEvents;
};

export const getUpcomingEvents = (allEvents: EventsMap, contentConfig: any) => {
  for (let key in allEvents) {
    if (key == "7" || key == "4339") {
      delete allEvents[key];
    }
  }
  let upcomingEvents: InplayEventsObj[] = [];
  for (let etId of Object.keys(allEvents)) {
    let events: EventDTO[] = [];
    var sport = contentConfig?.sports?.filter(
      (item: any) =>
        item.name.toLowerCase() === eventTypesNameMap[etId]?.toLowerCase()
    )[0];
    let count = 0;
    let maxCount = 5;
    for (let cId of Object.keys(allEvents[etId])) {
      for (let eId of Object.keys(allEvents[etId][cId])) {
        const eData = allEvents[etId][cId][eId];
        // skip forced inplay in upcoming section
        if (
          (eData.sportId != "2"
            ? moment(eData.openDate).diff(moment(), "seconds") > 0
            : moment(eData.openDate).diff(moment(), "minutes") > 5) &&
          !eData.forcedInplay &&
          eData.status != "IN_PLAY"
          // && count < maxCount
        ) {
          events.push(eData);
          count++;
        }
      }
    }

    var disable = sport ? sport.disabled : false;
    if (events.length > 0 && !disable) {
      events.sort((a, b) => {
        const aOpenDate = a.customOpenDate
          ? moment(a.customOpenDate)
          : moment(a.openDate);
        const bOpenDate = b.customOpenDate
          ? moment(b.customOpenDate)
          : moment(b.openDate);
        return aOpenDate.diff(bOpenDate, "seconds") > 0 ? 1 : -1;
      });
      upcomingEvents.push({
        sportId: etId,
        sportName: eventTypesNameMap[etId],
        sportSlug: eventTypesNameMap[etId]?.toLowerCase(),
        events: events,
        priority: sport
          ? sport.priority
          : SPORTS_MAP.get(eventTypesNameMap[etId])?.priority,
      });
    }
  }

  upcomingEvents.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  return upcomingEvents;
};

export const getCupWinnerEvents = (
  allEvents: EventsMap,
  contentConfig: any
) => {
  for (let key in allEvents) {
    if (key == "7" || key == "4339") {
      delete allEvents[key];
    }
  }
  let cupWinnerMarkets: InplayEventsObj[] = [];
  for (let etId of Object.keys(allEvents)) {
    let events: EventDTO[] = [];
    var sport = contentConfig?.sports?.filter(
      (item) =>
        item.name.toLowerCase() === eventTypesNameMap[etId]?.toLowerCase()
    )[0];

    let count = 0;
    let maxCount = 5; // to fetch only 5 events from each sports
    for (let cId of Object.keys(allEvents[etId])) {
      for (let eId of Object.keys(allEvents[etId][cId])) {
        const eData = allEvents[etId][cId][eId];
        if (eData.status === "UPCOMING" && count < maxCount) {
          events.push(eData);
          count++;
        }
      }
    }

    var disable = sport ? sport.disabled : false;
    if (events.length > 0 && !disable) {
      events.sort((a, b) => {
        const aOpenDate = a.customOpenDate
          ? moment(a.customOpenDate)
          : moment(a.openDate);
        const bOpenDate = b.customOpenDate
          ? moment(b.customOpenDate)
          : moment(b.openDate);
        return aOpenDate.diff(bOpenDate, "seconds") > 0 ? 1 : -1;
      });
      cupWinnerMarkets.push({
        sportId: etId,
        sportName: eventTypesNameMap[etId],
        sportSlug: eventTypesNameMap[etId]?.toLowerCase(),
        events: events,
        priority: sport
          ? sport.priority
          : SPORTS_MAP.get(eventTypesNameMap[etId])?.priority,
      });
    }
  }

  cupWinnerMarkets.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  return cupWinnerMarkets;
};

export const getAllMarketsByEvent = (
  allEvents: EventsMap,
  eventTypeId: string,
  competitionId: string,
  eventId: string
) => {
  competitionId = competitionId?.includes(":")
    ? competitionId?.split(":").join("_")
    : competitionId;
  eventId = eventId?.includes(":") ? eventId?.split(":").join("_") : eventId;
  if (
    allEvents[eventTypeId] &&
    allEvents[eventTypeId][competitionId] &&
    allEvents[eventTypeId][competitionId][eventId]
  ) {
    return { ...allEvents[eventTypeId][competitionId][eventId] };
  }
  return null;
};

export const getBookmakerMarketsByEvent = (
  secondaryMarketsMap: SecondaryMarketsMap,
  eventId: string
) => {
  if (secondaryMarketsMap[eventId]) {
    return secondaryMarketsMap[eventId].bookmakers;
  }
  return null;
};

export const getFancyMarketsByEvent = (
  secondaryMarketsMap: SecondaryMarketsMap,
  eventId: string
) => {
  if (secondaryMarketsMap[eventId]) {
    return [...secondaryMarketsMap[eventId].fancyMarkets];
  }
  return null;
};

export const isFancyMarketSuspended = (
  secondaryMarketsMap: SecondaryMarketsMap,
  eventId: string
) => {
  if (secondaryMarketsMap[eventId]) {
    return secondaryMarketsMap[eventId].fancySuspended;
  }
  return false;
};

export const isFancyMarketDisabled = (
  secondaryMarketsMap: SecondaryMarketsMap,
  eventId: string
) => {
  if (secondaryMarketsMap[eventId]) {
    return secondaryMarketsMap[eventId].fancyDisabled;
  }
  return false;
};

export const getSecondaryMarketsByEvent = (
  secondaryMarketsMap: SecondaryMarketsMap,
  eventId: string
) => {
  if (secondaryMarketsMap[eventId]) {
    return secondaryMarketsMap[eventId];
  }
  return null;
};

export const getSecondaryMatchOddsByEvent = (
  secondaryMatchOddsMap: SecondaryMatchOddsMap,
  eventId: string
) => {
  let secondaryMatchOdds: MatchOddsDTO[] = [];
  for (let mo of Object.keys(secondaryMatchOddsMap)) {
    if (
      mo.startsWith(eventId) &&
      !LINE_MARKETS.includes(secondaryMatchOddsMap[mo].marketName)
    ) {
      secondaryMatchOdds.push(secondaryMatchOddsMap[mo]);
    }
  }
  secondaryMatchOdds.sort((a, b) => {
    const aDesc = a.marketName;
    const bDesc = b.marketName;
    if (aDesc > bDesc) return 1;
    else if (aDesc < bDesc) return -1;
    return 0;
  });
  return secondaryMatchOdds;
};

export const getLineMarketsByEvent = (
  secondaryMatchOddsMap: SecondaryMatchOddsMap,
  eventId: string
) => {
  let secondaryMatchOdds: MatchOddsDTO[] = [];
  for (let mo of Object.keys(secondaryMatchOddsMap)) {
    if (
      mo.startsWith(eventId) &&
      LINE_MARKETS.includes(secondaryMatchOddsMap[mo].marketName)
    ) {
      secondaryMatchOdds.push(secondaryMatchOddsMap[mo]);
    }
  }
  secondaryMatchOdds.sort((a, b) => {
    const aDesc = a.marketName;
    const bDesc = b.marketName;
    if (LINE_MARKETS.indexOf(aDesc) > LINE_MARKETS.indexOf(bDesc)) return 1;
    else if (LINE_MARKETS.indexOf(aDesc) < LINE_MARKETS.indexOf(bDesc))
      return -1;
    return 0;
  });
  return secondaryMatchOdds;
};

export const getPremiumMarkets = (
  premiumMarketsMap: PremiumMarketsMap,
  eventId: string
) => {
  // const premiumMarketsData = premiumMarketsMap[eventId];
  const sEventId = eventId?.includes("_")
    ? eventId?.split("_").join(":")
    : eventId;
  const premiumMarketsData = premiumMarketsMap[sEventId];
  return { ...premiumMarketsData };
};
