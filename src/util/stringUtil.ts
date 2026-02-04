import LiveImg from "../assets/images/sportsbook/icons/liveIcon.svg";

import BaseballImg from "../assets/images/sportsbook/baseball-live.png";
import BasketballImg from "../assets/images/sportsbook/basketball-inplay.png";
import CricketImg from "../assets/images/sportsbook/cricket-inplay.png";
import FootBallImg from "../assets/images/sportsbook/football-inplay.png";
import GreyHoundImg from "../assets/images/sportsbook/greyhound-live.png";
import HorseInplay from "../assets/images/sportsbook/horse-inplay.png";
import TennisImg from "../assets/images/sportsbook/tennis-inplay.png";

//new icon
import { ReactComponent as NewBaseballImg } from "../assets/images/sportsbook/new-inplay-icons/baseball.svg?react";
import { ReactComponent as NewBasketballImg } from "../assets/images/sportsbook/new-inplay-icons/baseketball.svg?react";
import { ReactComponent as NewCricketImg } from "../assets/images/sportsbook/new-inplay-icons/cricket.svg?react";
import { ReactComponent as NewFootBallImg } from "../assets/images/sportsbook/new-inplay-icons/football.svg?react";
import { ReactComponent as NewGreyHoundImg } from "../assets/images/sportsbook/new-inplay-icons/greyhound.svg?react";
import { ReactComponent as NewHorseInplay } from "../assets/images/sportsbook/new-inplay-icons/horse.svg?react";
import { ReactComponent as NewTennisImg } from "../assets/images/sportsbook/new-inplay-icons/tennis.svg?react";
import { ReactComponent as NewFutsalImg } from "../assets/images/sidebar/futsal.svg?react";
import { ReactComponent as NewDartsImg } from "../assets/images/sidebar/darts.svg?react";
import { ReactComponent as NewVolleyballImg } from "../assets/images/sidebar/volleyball.svg?react";
import { ReactComponent as NewTableTennisImg } from "../assets/images/sidebar/table_tennis.svg?react";
import { ReactComponent as PoliticsImg } from "../assets/images/sidebar/politics.svg?react";
import { ReactComponent as NewIceHockeyImg } from "../assets/images/sidebar/ice-hockey.svg?react";
import { ReactComponent as RugbyImg } from "../assets/images/sidebar/rugby.svg?react";
import { ReactComponent as MMAImg } from "../assets/images/sidebar/mma.svg?react";
import { ReactComponent as BinaryImg } from "../assets/images/sidebar/binary.svg?react";
import { ReactComponent as KabaddiImg } from "../assets/images/sidebar/kabaddi.svg?react";
import { ReactComponent as CasinoImg } from "../assets/images/sidebar/casino.svg?react";
import { ReactComponent as DimondImg } from "../assets/images/sidebar/dimond.svg?react";
import { BRAND_DOMAIN } from "../constants/Branding";

import moment from "moment/moment";
import { PlaceBetRequest } from "../models/BsData";
import { EventDTO } from "../models/common/EventDTO";

export function similarity(s1: string, s2: string) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }

  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export const OutcomeDescByEnumMap = {
  Lost: "Lost",
  Won: "Win",
  Open: "Unsettled",
  "11": "Unsettled",
  RolledBack: "Rolled Back",
  Voided: "Void",
  Abandoned: "Abandon",
  Lapse: "Lapsed",
  Cancelled: "Cancelled",
};

export const showThemes = (skins) =>
  skins.filter((skin) => skin !== "" && skin != null).length;

export const MarketTypeByEnumMap: { [key: string]: string } = {
  MATCH_ODDS: "Match odds",
  BOOKMAKER: "Bookmaker",
  FANCY: "Fancy",
  PREMIUM: "Premium",
  CASINO: "Casino",
  BINARY: "Binary",
  INDIAN_CASINO: "Indian Casino",
};

export enum AvailablePaymentGateways {
  ABCMONEY = "ABCMONEY",
  PGMAN = "PGMAN",
  XENONPAY = "XENONPAY",
  ZENPAY = "ZENPAY",
  ZENPAY1 = "ZENPAY1",
  ZENPAYCRYPTO = "ZENPAYCRYPTO",
  XEINPAY = "XEINPAY",
  XENONPAYZ = "XENONPAYZ",
  ZENPAY2 = "ZENPAY2",
  ZENPAYCRYPTOSEAMLESS = "ZENPAYCRYPTOSEAMLESS",
}

export enum AvailablePaymentMethods {
  UPI = "UPI",
  BANK_TRANSFER = "BANK_TRANSFER",
  BANK = "BANK",
}

export enum PaymentMethodLabels {
  UPI = "UPI",
  BANK = "Bank",
  BANK_TRANSFER = "Bank Transfer",
}

export const capitalize = (skin) => {
  return skin
    .split(" ")
    .map((t) => t[0].toUpperCase() + t.slice(1).toLowerCase())
    .join("");
};

export const capitalizeWord = (str: string) => {
  const words = str?.split(" ");
  for (let i = 0; i < words?.length; i++) {
    if (words?.[i]?.trim()?.length > 0) {
      words[i] = words?.[i]?.[0]?.toUpperCase() + words?.[i]?.substring(1);
    }
  }

  return words?.join(" ");
};

export const getSubDomain = (skin) =>
  BRAND_DOMAIN.toLowerCase().includes(skin) ? "www" : skin;

export function getOutcomeDescByEnumName(eventType: string) {
  return OutcomeDescByEnumMap[eventType];
}

export const ThousandFormatter = (num: any) => {
  if (num > 999) {
    return (num / 1000).toFixed() + "K";
  } else {
    return num;
  }
};

export const _findIndexByArray = (array: any, value: any) => {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === value) {
      return i;
    }
  }
};

export function formatTime(date: Date) {
  try {
    return moment(date).format("HH:mm");
  } catch (err) {
    console.log(date, err);
    return date;
  }
}

export const liveImagesMap = {
  "1": LiveImg,
  "2": LiveImg,
  "4": LiveImg,
  "7": LiveImg,
  "4339": LiveImg,
  "7522": LiveImg,
  "7511": LiveImg,
  "99990": LiveImg,
  "2378961": LiveImg,
  "99994": LiveImg,
};

export const SportIconMap = {
  "1": FootBallImg,
  "2": TennisImg,
  "4": CricketImg,
  "7": HorseInplay,
  "4339": GreyHoundImg,
  "7522": BasketballImg,
  "7511": BaseballImg,
  "99990": BaseballImg,
  "2378961": PoliticsImg,
  "99994": "",
};

export const SportIconMapInplay = {
  "1": NewFootBallImg,
  "sr:sport:1": NewFootBallImg, // SportRadar Soccer/Football
  "2": NewTennisImg,
  "sr:sport:5": NewTennisImg, // SportRadar Tennis
  "4": NewCricketImg,
  "sr:sport:21": NewCricketImg, // SportRadar Cricket
  "7": NewHorseInplay,
  "4339": NewGreyHoundImg,
  "sr:sport:2": NewBasketballImg,
  "7522": NewBasketballImg, // Basketball BetFair format
  "sr:sport:3": NewBaseballImg,
  "7511": NewBaseballImg, // Baseball BetFair format
  sr_sport_29: NewFutsalImg,
  sr_sport_22: NewDartsImg,
  "sr:sport:23": NewVolleyballImg,
  sr_sport_23: NewVolleyballImg, // Volleyball with underscore format
  "sr:sport:20": NewTableTennisImg,
  sr_sport_20: NewTableTennisImg, // Table Tennis with underscore format
  "99990": BinaryImg,
  "2378961": PoliticsImg,
  "sr:sport:4": NewIceHockeyImg,
  sr_sport_4: NewIceHockeyImg, // Ice Hockey with underscore format
  sr_sport_117: MMAImg,
  sr_sport_12: RugbyImg,
  "99994": KabaddiImg, // Kabaddi
  "sr:sport:138": KabaddiImg, // Kabaddi SportRadar format
  "-100": CasinoImg, // Casino
  "QT": DimondImg, // QTech/Dimond
  "qtech": DimondImg, // QTech/Dimond (lowercase variant)
  "dimond": DimondImg, // Dimond (alternative spelling)
  "diamond": DimondImg, // Diamond (alternative spelling)
  "casino": CasinoImg, // Casino (lowercase variant)
};

const SportIdByNameMap: { [key: string]: string } = {
  soccer: "1",
  football: "1",
  tennis: "2",
  cricket: "4",
  horse_racing: "7",
  horseracing: "7",
  grey_hound: "4339",
  greyhoundracing: "4339",
  basketball: "7522",
  baseball: "7511",
  binary: "99990",
  politics: "2378961",
  kabaddi: "99994",
};

export const SportIdByName: { [key: string]: string } = {
  "1": "Football",
  "sr:sport:1": "Football",
  "2": "Tennis",
  "sr:sport:5": "Tennis",
  "4": "Cricket",
  "sr:sport:21": "Cricket",
  "7": "HorseRacing",
  "4339": "GreyHound",
  "7522": "BasketBall",
  "7511": "BaseBall",
  "99990": "Binary",
  "2378961": "Politics",
  "99994": "Kabaddi",
  "sr:sport:138": "Kabaddi",
};

export const OutcomeDescMap = {
  "0": "Lost",
  "1": "Win",
  "2": "Unsettled",
  "11": "Unsettled",
  "3": "Rolled Back",
  "4": "Void",
  "5": "Lapsed",
  "6": "Cancelled",
};

export const MarketTypeMap: { [key: string]: string } = {
  "0": "Match odds",
  "1": "Book maker",
  "2": "Fancy",
  "3": "Premium Market",
  "4": "Casino",
  "5": "Binary",
  "6": "Indian Casino",
};

export const TransactionTypeMap = {
  "0": "Deposit",
  "1": "Withdraw",
  "2": "Settlement Deposit",
  "3": "Settlement Withdraw",
  "4": "Bet Placement",
  "5": "Bet Settlement",
  "6": "Rollback BR",
  "7": "Void BR",
  "8": "Casino BP",
  "9": "Casino BR",
  "10": "Casino RB",
  "11": "Win Commission",
  "12": "Win Commission Reversal",
  "13": "Indian Casino BP",
  "14": "Indian Casino BR",
  "15": "Commission Claim",
  "16": "Commission Deposit",
  "17": "Commission RB",
  "18": "Commission Void",
  "19": "Casino BP",
  "20": "Casino BR",
  "21": "Casino RB",
  "22": "-",
  "23": "Binary Bet Placement",
  "24": "Binary BR",
  "25": "Binary Bet RB",
  "26": "Bet Placement",
  "27": "BR",
  "28": "Bet Rollback",
  "29": "Bet Void",
  "30": "Bet Cancelled",
  "31": "Bet Expired",
  "32": "Bet Lapsed",
  "33": "Bet Deleted",
  "34": "Risk Update",
  "35": "Binary Bet Void",
  "36": "Sport Book Bet Placement",
  "37": "Sport Book BR",
  "38": "sport Book RB",
  "39": "Rolling Commission",
  "40": "Win Commission Update",
  "41": "Win Commission Update",
  "42": "Rollback Void BR",
  "44": "Commission Claim",
  "45": "Bonus Redeemed",
  "46": "Bonus Rollback",
  "47": "Refund",
  "48": "Affiliate Commission Redeemed",
  "49": "EVENT LOSSBACK",
  "50": "Abandon BR",
  "51": "Rollback Abandon BR",
  "54": "Funds Adjustment",
};

export function getTransactionNameByID(trans: string) {
  return TransactionTypeMap[trans];
}

export function getOutcomeDescName(eventType: string) {
  return OutcomeDescMap[eventType];
}

export function MarketTypeByID(id: string) {
  return MarketTypeMap[id] ? MarketTypeMap[id] : "Casino";
}

export function getSportNameByIdMap(eventType: string) {
  return SportNameByIdMap[eventType];
}

export const SportNameByIdMap: { [key: string]: string } = {
  "1": "soccer",
  "2": "tennis",
  "4": "cricket",
  "7522": "basketball",
  "7511": "baseball",
  "4339": "greyhoundracing",
  "7": "horseracing",
  "99990": "binary",
  "2378961": "politics",
  "99994": "kabaddi",
};

export function getSportLangKeyByName(type: string) {
  type = type?.replace(" ", "").toLowerCase();
  return SportLangKeyByName[type];
}

export const SportLangKeyByName: { [key: string]: string } = {
  cricket: "cricket",
  football: "football",
  tennis: "tennis",
  basketball: "basketball",
  baseball: "baseball",
  greyhound: "greyhound",
  horseracing: "horse_racing",
  volleyball: "volleyball",
  darts: "darts",
  futsal: "futsal",
  tabletennis: "table_tennis",
  binary: "binary",
  politics: "politics",
  icehockey: "ice_hockey",
  kabaddi: "kabaddi",
  rugby: "rugby",
};

export function getMarketLangKeyByName(type: string) {
  let formattedType = type?.replace(/[\s/?\d]/g, "")?.toLowerCase();
  return MarketLangKeyByName[formattedType];
}

export const MarketLangKeyByName: { [key: string]: string } = {
  matchodds: "match_odds",
  bookmaker: "bookmaker",
  minibookmaker: "mini_bookmaker",
  completedmatch: "completed_match",
  toss: "toss",
  overbookmaker: "over_bookmaker",
  fancy: "fancy",
  tiedmatch: "tied_match",
  premium: "premium",
  whowillwinthematch: "match_winner_txt",
  overunder: "over_under",
  overmarket: "over_market",
  completematch: "complete_match",
  firsthalfgoals: "first_half_goals",
  secondhalfgoals: "second_half_goals",
  halftime: "half_time",
};

export const demoUserPrefix = "zzzzsysdemo";

export const transactionTypesMap = {
  BET_PLACEMENT: "Bet Placement",
  BET_SETTLEMENT: "Bet Settlement",
  BINARY_BET_PLACEMENT: "Binary Bet Placement",
  BINARY_BET_ROLLBACK: "Binary Bet Rollback",
  BINARY_BET_SETTLEMENT: "Binary Bet Settlement",
  BINARY_BET_VOID: "Binary Bet Void",
  BONUS_REDEEMED: "Bonus Redeemed",
  BONUS_ROLLED_BACK: "Bonus Rolled Back",
  CASINO_BET_PLACEMENT: "Casino Bet Placement",
  CASINO_BET_ROLLBACK: "Casino Bet Rollback",
  CASINO_BET_SETTLEMENT: "Casino Bet Settlement",
  CLAIM_INCENTIVE: "Claim Incentive",
  COMMISSION_CLAIM: "Commission Claim",
  COMMISSION_DEPOSIT: "Commission Deposit",
  COMMISSION_ROLLBACK: "Commission Rollback",
  COMMISSION_VOID: "Commission Void",
  DEPOSIT: "Deposit",
  GAP_BET_PLACEMENT: "Gap Bet Placement",
  GAP_BET_ROLLBACK: "Gap Bet Rollback",
  GAP_BET_SETTLEMENT: "Gap Bet Settlement",
  INCENTIVE_TRANSFER: "Incentive Transfer",
  INDIAN_CASINO_BET_PLACEMENT: "Indian Casino Bet Placement",
  INDIAN_CASINO_BET_SETTLEMENT: "Indian Casino Bet Settlement",
  ROLLBACK_BET_SETTLEMENT: "Rollback Bet Settlement",
  ROLLBACK_VOID_BET_SETTLEMENT: "Rollback Void Bet Settlement",
  ROLLBACK_WIN_COMMISSION: "Rollback Win Commission",
  ROLLING_COMMISSION: "Rolling Commission",
  ROLLING_COMMISSION_ROLLBACK: "Rolling Commission Rollback",
  SAP_BET_CANCELLED: "SAP Bet Cancelled",
  SAP_BET_DELETED: "SAP Bet Deleted",
  SAP_BET_EXPIRED: "SAP Bet Expired",
  SAP_BET_LAPSED: "SAP Bet Lapsed",
  SAP_BET_PLACEMENT: "SAP Bet Placement",
  SAP_BET_ROLLBACK: "SAP Bet Rollback",
  SAP_BET_SETTLEMENT: "SAP Bet Settlement",
  SAP_BET_VOID: "SAP Bet Void",
  SAP_UPDATE_RISK: "SAP Update Risk",
  SETTLEMENT_DEPOSIT: "Settlement Deposit",
  SETTLEMENT_WITHDRAW: "Settlement Withdraw",
  SPORT_BOOK_BET_PLACEMENT: "Sport Book Bet Placement",
  SPORT_BOOK_BET_ROLLBACK: "Sport Book Bet Rollback",
  SPORT_BOOK_BET_SETTLEMENT: "Sport Book Bet Settlement",
  UN_KNOWN_TYPE: "Unknown Type",
  VOID_BET_SETTLEMENT: "Void Bet Settlement",
  WIN_COMMISSION: "Win Commission",
  WIN_COMMISSION_UPDATE: "Win Commission Update",
  WITHDRAW: "Withdraw",
};

export const transactionTypes = [
  { value: "BET_PLACEMENT", name: "Bet Placement" },
  { value: "BET_SETTLEMENT", name: "Bet Settlement" },
  { value: "BINARY_BET_PLACEMENT", name: "Binary Bet Placement" },
  { value: "BINARY_BET_ROLLBACK", name: "Binary Bet Rollback" },
  { value: "BINARY_BET_SETTLEMENT", name: "Binary Bet Settlement" },
  { value: "BINARY_BET_VOID", name: "Binary Bet Void" },
  { value: "BONUS_REDEEMED", name: "Bonus Redeemed" },
  { value: "BONUS_ROLLED_BACK", name: "Bonus Rolled Back" },
  { value: "CASINO_BET_PLACEMENT", name: "Casino Bet Placement" },
  { value: "CASINO_BET_ROLLBACK", name: "Casino Bet Rollback" },
  { value: "CASINO_BET_SETTLEMENT", name: "Casino Bet Settlement" },
  { value: "CLAIM_INCENTIVE", name: "Claim Incentive" },
  { value: "COMMISSION_CLAIM", name: "Commission Claim" },
  { value: "COMMISSION_DEPOSIT", name: "Commission Deposit" },
  { value: "COMMISSION_ROLLBACK", name: "Commission Rollback" },
  { value: "COMMISSION_VOID", name: "Commission Void" },
  { value: "DEPOSIT", name: "Deposit" },
  { value: "GAP_BET_PLACEMENT", name: "Gap Bet Placement" },
  { value: "GAP_BET_ROLLBACK", name: "Gap Bet Rollback" },
  { value: "GAP_BET_SETTLEMENT", name: "Gap Bet Settlement" },
  { value: "INCENTIVE_TRANSFER", name: "Incentive Transfer" },
  { value: "INDIAN_CASINO_BET_PLACEMENT", name: "Indian Casino Bet Placement" },
  {
    value: "INDIAN_CASINO_BET_SETTLEMENT",
    name: "Indian Casino Bet Settlement",
  },
  { value: "ROLLBACK_BET_SETTLEMENT", name: "Rollback Bet Settlement" },
  {
    value: "ROLLBACK_VOID_BET_SETTLEMENT",
    name: "Rollback Void Bet Settlement",
  },
  { value: "ROLLBACK_WIN_COMMISSION", name: "Rollback Win Commission" },
  { value: "ROLLING_COMMISSION", name: "Rolling Commission" },
  { value: "ROLLING_COMMISSION_ROLLBACK", name: "Rolling Commission Rollback" },
  { value: "SAP_BET_CANCELLED", name: "SAP Bet Cancelled" },
  { value: "SAP_BET_DELETED", name: "SAP Bet Deleted" },
  { value: "SAP_BET_EXPIRED", name: "SAP Bet Expired" },
  { value: "SAP_BET_LAPSED", name: "SAP Bet Lapsed" },
  { value: "SAP_BET_PLACEMENT", name: "SAP Bet Placement" },
  { value: "SAP_BET_ROLLBACK", name: "SAP Bet Rollback" },
  { value: "SAP_BET_SETTLEMENT", name: "SAP Bet Settlement" },
  { value: "SAP_BET_VOID", name: "SAP Bet Void" },
  { value: "SAP_UPDATE_RISK", name: "SAP Update Risk" },
  { value: "SETTLEMENT_DEPOSIT", name: "Settlement Deposit" },
  { value: "SETTLEMENT_WITHDRAW", name: "Settlement Withdraw" },
  {
    value: "SPORT_BOOK_BET_PLACEMENT",
    name: "Sport Book Bet Placement",
  },
  {
    value: "SPORT_BOOK_BET_ROLLBACK",
    name: "Sport Book Bet Rollback",
  },
  {
    value: "SPORT_BOOK_BET_SETTLEMENT",
    name: "Sport Book Bet Settlement",
  },
  {
    value: "UN_KNOWN_TYPE",
    name: "Unknown Type",
  },
  {
    value: "VOID_BET_SETTLEMENT",
    name: "Void Bet Settlement",
  },
  {
    value: "WIN_COMMISSION",
    name: "Win Commission",
  },
  {
    value: "WIN_COMMISSION_UPDATE",
    name: "Win Commission Update",
  },
  {
    value: "WITHDRAW",
    name: "Withdraw",
  },
];

export const SPToBFIdMap = {
  "sr:sport:1": "1",
  "sr:sport:5": "2",
  "sr:sport:21": "4",
  "sr:sport:2": "7522",
  "sr:sport:3": "7511",
  "sr:sport:29": "sr_sport_29",
  "sr:sport:22": "sr_sport_22",
  "sr:sport:23": "sr_sport_23",
  "sr:sport:20": "sr_sport_20",
  "sr:sport:4": "sr_sport_4",
  "sr:sport:138": "99994",
  "sr:sport:117": "sr_sport_117",
  "sr:sport:12": "sr_sport_12",
};

export const BFToSRIdMap = {
  "1": "sr:sport:1",
  "2": "sr:sport:5",
  "4": "sr:sport:21",
  "7522": "sr:sport:2",
  "7511": "sr:sport:3",
  sr_sport_29: "sr:sport:29",
  sr_sport_22: "sr:sport:22",
  sr_sport_23: "sr:sport:23",
  sr_sport_20: "sr:sport:20",
  sr_sport_4: "sr:sport:4",
  "99994": "sr:sport:138",
  sr_sport_117: "sr:sport:117",
  sr_sport_12: "sr:sport:12",
};

export const demoUser = () => {
  return getFieldFromToken(JwtToken.SUBJECT_NAME)?.startsWith(demoUserPrefix);
};

export const notDemoUser = () => {
  return !demoUser();
};

export enum JwtToken {
  ACCOUNT_ID = "aid",
  HOUSE_ID = "hid",
  SAP_TOKEN = "sap",
  CURRENCY_TYPE = "cur",
  PERMISSION = "perm",
  ROLE = "role",
  SUBJECT_NAME = "sub",
  OWNER_NAME = "owner",
  ACCOUNT_PATH = "path",
  MODE = "mode",
}

export const oddValueFormatter = (marketType, oddValue, sessionRuns) => {
  if (oddValue === -1) {
    return "-";
  }

  let res = "-";
  switch (marketType) {
    case "BOOKMAKER":
    case 1:
      res = Number(oddValue * 100 - 100).toFixed(2);
      break;
    case "FANCY":
    case 2: // fancy
      res = Number(sessionRuns).toFixed(2);
      break;
    case "BINARY":
    case 5: // binary
      res = Number(sessionRuns).toFixed(2);
      break;
    default:
      res = Number(oddValue).toFixed(2);
  }

  return res;
};

export const getFieldFromToken = (value: JwtToken) => {
  const token = sessionStorage.getItem("jwt_token");
  if (!token || !token.includes(".")) {
    return null;
  }

  try {
    const claim = token.split(".")[1];
    const decoded = JSON.parse(window.atob(claim));
    return decoded?.[value] ?? null;
  } catch {
    return null;
  }
};

export const fancyCategories = [
  "sessions",
  "wpmarket",
  "extramarket",
  "oddeven",
];

export const DepositTurnoverStatus = [
  { value: "AWARDED", name: "AWARDED" },
  { value: "REDEEMED", name: "REDEEMED" },
  { value: "CANCELLED", name: "CANCELLED" },
  { value: "IN_PROGRESS", name: "IN_PROGRESS" },
];

export const UPI_REGEX = /^[0-9]{12}$/;
export const RTGS_REGEX = /^[A-Z]{4}R[1-6][0-9]{2}[0-9]{8}[0-9]{8}$/;
export const NEFT_REGEX = /^[A-Z]{4}[NH][0-9]{2}[0-9]{3}[0-9]{6}$/;
export const USERNAME_REGEX =
  /^(?!.*(?:\d[-.\s]*){9})([a-zA-Z0-9][a-zA-Z0-9_@-]*)$/i;

export function replaceLeagueName(str: string) {
  if (!str) return str;

  // Remove "The Hundred - " prefix
  let result = str.replace(/The Hundred - /g, "");

  // Replace "indian premier league" with "IPL"
  result = result?.toLowerCase()?.replace(/indian premier league/g, "IPL");

  // Replace "pro kabaddi league cup winner" with "PKL Cup Winner"
  result = result
    ?.toLowerCase()
    ?.replace(/pro kabaddi league cup winner/g, "PKL Cup Winner");

  result = result?.toLowerCase()?.replace(/ world cup winner/g, "");

  return result;
}

export const normalizeInput = (str) => {
  if (!str) {
    return null;
  }
  return str.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
};

export const getRootDomain = () => {
  let hostname = window.location.hostname.replace(/www./g, "");
  const parts = hostname.split(".");

  // If it's an IP or localhost, return as is
  if (parts.length <= 2) return hostname;

  // Regex pattern to detect compound TLDs (more comprehensive)
  // Matches patterns like: co.xx, com.xx, org.xx, net.xx, edu.xx, gov.xx, ac.xx, etc.
  const compoundTLDPattern =
    /\.(co|com|org|net|edu|gov|ac|ne|or|gr|go)\.[a-z]{2,3}$/i;

  if (compoundTLDPattern.test(hostname)) {
    // For compound TLDs, return the last 3 parts (domain.compound.tld)
    return parts.slice(-3).join(".");
  }

  // Check for other multi-part patterns (like .k12.xx.us or .pvt.k12.xx.us)
  if (parts.length >= 4 && /^(k12|pvt)$/i.test(parts[parts.length - 3])) {
    return parts.slice(-4).join(".");
  }

  // Default case: return last 2 parts for standard TLDs
  return parts.slice(-2).join(".");
};

export const ValidateOdds = (eventData: EventDTO, bets: PlaceBetRequest[]) => {
  const matchOdds = eventData?.matchOdds?.runners;

  // Match Odds odd check
  if (matchOdds) {
    for (let bet of bets) {
      if (bet.marketType === "BM") {
        if (bet.oddValue < 0) return true;
      } else {
        if (bet.oddValue <= 1) return true;
      }
      if (
        bet?.marketType === "MO" &&
        eventData?.matchOdds?.marketId &&
        bet?.marketId === eventData.matchOdds.marketId
      ) {
        for (let mo of matchOdds) {
          if (mo.runnerId === bet.outcomeId) {
            if (bet.betType === "BACK") {
              if (mo?.backPrices) {
                if (bet.oddValue <= mo.backPrices[0]?.price) {
                  return false;
                } else {
                  return true;
                }
              }
            } else {
              if (mo?.layPrices) {
                console.log(mo.layPrices[0].price, "<=", bet.oddValue);
                if (mo.layPrices[0]?.price <= bet.oddValue) {
                  return false;
                } else {
                  return true;
                }
              }
            }
          }
        }
      }
    }
  }
};
