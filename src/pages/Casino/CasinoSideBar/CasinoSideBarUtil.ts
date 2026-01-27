import allCategoryIcon from "../../../assets/images/casino_tabs/view-all-svgrepo-com 1.svg";
import indianIcon from "../../../assets/images/casino_tabs/rupee.svg";
import slotIcon from "../../../assets/images/casino_tabs/ic_slots.svg";
import dragonTigerIcon from "../../../assets/images/casino_tabs/dragon-tiger.svg";
import teenpattiIcon from "../../../assets/images/casino_tabs/teenpatti.svg";
import andarBaharIcon from "../../../assets/images/casino_tabs/andar-bahar.svg";
import othersIcon from "../../../assets/images/casino_tabs/others.svg";
import lotteryIcon from "../../../assets/images/casino_tabs/lottery.svg";
import livePokerIcon from "../../../assets/images/casino_tabs/live-poker.svg";
import liveLobbyIcon from "../../../assets/images/casino_tabs/live-lobby.svg";
import crashGameIcon from "../../../assets/images/casino_tabs/crash-game.svg";
import casualGameIcon from "../../../assets/images/casino_tabs/casual-game.svg";
import scratchCardIcon from "../../../assets/images/casino_tabs/scratch-card.svg";
import liveBlackjackIcon from "../../../assets/images/casino_tabs/live-blackjack.svg";
import liveBacarratIcon from "../../../assets/images/casino_tabs/live-bacarrat.svg";
import liveSicBoIcon from "../../../assets/images/casino_tabs/live-sic-bo.svg";
import liveRouletteIcon from "../../../assets/images/casino_tabs/live-roulette.svg";
import fishShootingIcon from "../../../assets/images/casino_tabs/fish-shooting.svg";
import virtualCasinoIcon from "../../../assets/images/casino_tabs/virtual-casino.svg";
import tvGamesIcon from "../../../assets/images/casino_tabs/tv-games.svg";
import liveDiceIcon from "../../../assets/images/casino_tabs/live-dice.svg";
import liveGameShowIcon from "../../../assets/images/casino_tabs/live-game-show.svg";
import cricketWarIcon from "../../../assets/images/casino_tabs/ic_cricketwar.svg";
import cards32Icon from "../../../assets/images/casino_tabs/ic_32cards.svg";
import bingoIcon from "../../../assets/images/casino_tabs/ic_bingo.svg";
import dealOrNoDealIcon from "../../../assets/images/casino_tabs/ic_dealornodeal.svg";
import hiLoIcon from "../../../assets/images/casino_tabs/ic_hi_low.svg";
import lucky7Icon from "../../../assets/images/casino_tabs/ic_lucky7.svg";
import monopolyIcon from "../../../assets/images/casino_tabs/ic_monopoly.svg";
import slotsIcon from "../../../assets/images/casino_tabs/ic_slots.svg";
import rummyIcon from "../../../assets/images/casino_tabs/ic_rummy.svg";
import aviatorIcon from "../../../assets/images/casino_tabs/ic_aviator.svg";
import minesIcon from "../../../assets/images/casino_tabs/ic_mine.svg";
import ColorGameIcon from "../../../assets/images/casino_tabs/ic_color.svg";
import FunGameIcon from "../../../assets/images/casino_tabs/ic_fungames.svg";
import ChickenGamesIcon from "../../../assets/images/casino_tabs/chicken_games.svg";
import ColorPredictionIcon from "../../../assets/images/casino_tabs/color_prediction.svg";

export const tabs = [
  {
    icon: allCategoryIcon,
    tabValue: 0,
    title: "All",
    titleKey: "all",
    filterParams: ["all"],
  },
  {
    icon: aviatorIcon,
    tabValue: 1,
    title: "Aviator",
    titleKey: "aviator",
    filterParams: ["aviator"],
  },
  {
    icon: minesIcon,
    tabValue: 2,
    title: "Mines",
    titleKey: "mines",
    filterParams: ["mines"],
  },
  {
    icon: ColorGameIcon,
    tabValue: 3,
    title: "Color Games",
    titleKey: "color_games",
    filterParams: ["color game"],
  },
  // {
  //   icon: indianIcon,
  //   tabValue: 4,
  //   title: 'Indian',
  //   titleKey: 'indian',
  //   filterParams: ['indian games'],
  // },
  {
    icon: dragonTigerIcon,
    tabValue: 5,
    title: "Dragon Tiger",
    titleKey: "dragon_tiger",
    filterParams: ["dragon tiger"],
  },
  // {
  //   icon: slotIcon,
  //   tabValue: 7,
  //   title: 'Slot',
  //   filterParams: ['slot'],
  // },
  {
    icon: andarBaharIcon,
    tabValue: 8,
    title: "Andarbahar",
    titleKey: "andar_bahar",
    filterParams: ["andarbahar", "andar_bahar", "andar bahar"],
  },
  {
    icon: teenpattiIcon,
    tabValue: 9,
    title: "Teenpatti",
    titleKey: "teenpatti",
    filterParams: ["teenpatti"],
  },
  {
    icon: lotteryIcon,
    tabValue: 15,
    title: "Lottery",
    titleKey: "lottery",
    filterParams: ["lottery"],
  },
  {
    icon: livePokerIcon,
    tabValue: 18,
    title: "Live Poker",
    titleKey: "live_poker",
    filterParams: ["live poker"],
  },
  {
    icon: liveLobbyIcon,
    tabValue: 19,
    title: "Live Lobby",
    titleKey: "live_lobby",
    filterParams: ["live lobby"],
  },
  {
    icon: crashGameIcon,
    tabValue: 20,
    title: "Crash Game",
    titleKey: "crash_game",
    filterParams: ["crash games"],
  },
  {
    icon: casualGameIcon,
    tabValue: 21,
    title: "Casual Game",
    titleKey: "casual_game",
    filterParams: ["casual games"],
  },
  {
    icon: scratchCardIcon,
    tabValue: 22,
    title: "Scratch Cards",
    titleKey: "scratch_cards",
    filterParams: ["scratch card", "scratch cards"],
  },
  {
    icon: liveBlackjackIcon,
    tabValue: 24,
    title: "Live Blackjack",
    titleKey: "live_blackjack",
    filterParams: ["live blackjack"],
  },
  {
    icon: liveBacarratIcon,
    tabValue: 26,
    title: "Live Baccarat",
    titleKey: "live_baccarat",
    filterParams: ["live baccarat"],
  },
  {
    icon: liveSicBoIcon,
    tabValue: 27,
    title: "Live Sic Bo",
    titleKey: "live_sic_bo",
    filterParams: ["live sic bo"],
  },
  {
    icon: liveRouletteIcon,
    tabValue: 29,
    title: "Live Roulette",
    titleKey: "live_roulette",
    filterParams: ["live roulette"],
  },
  // {
  //   icon: fishShootingIcon,
  //   tabValue: 30,
  //   title: 'Fish Shooting',
  //   titleKey: 'fish_shooting',
  //   filterParams: ['Fish Shooting'],
  // },
  {
    icon: virtualCasinoIcon,
    tabValue: 31,
    title: "Virtual Casino",
    titleKey: "virtual_casino",
    filterParams: ["Virtual Casino"],
  },
  {
    icon: tvGamesIcon,
    tabValue: 32,
    title: "Tv Games",
    titleKey: "tv_games",
    filterParams: ["Tv Games"],
  },
  {
    icon: liveDiceIcon,
    tabValue: 33,
    title: "Live Dice",
    titleKey: "live_dice",
    filterParams: ["Live Dice"],
  },
  {
    icon: liveGameShowIcon,
    tabValue: 34,
    title: "Live Game Show",
    titleKey: "live_ga_shows",
    filterParams: ["Live Game Shows"],
  },
  {
    icon: othersIcon,
    tabValue: 35,
    title: "Table",
    titleKey: "table",
    filterParams: ["table"],
  },
  {
    icon: othersIcon,
    tabValue: 36,
    title: "Live",
    titleKey: "live",
    filterParams: ["Live"],
  },
  {
    icon: othersIcon,
    tabValue: 37,
    title: "Virtual",
    titleKey: "virtual",
    filterParams: ["Virtual"],
  },
  {
    icon: othersIcon,
    tabValue: 38,
    title: "Live Dealer",
    titleKey: "live_dealer",
    filterParams: ["Live Dealer"],
  },
  {
    icon: othersIcon,
    tabValue: 39,
    title: "Lobby",
    titleKey: "lobby",
    filterParams: ["Lobby"],
  },
  // {
  //   icon: othersIcon,
  //   tabValue: 40,
  //   title: 'Live Wheel of Fortune',
  //   titleKey: 'live_wheel_of_fortune',
  //   filterParams: ['Live Wheel of Fortune'],
  // },
  // {
  //   icon: othersIcon,
  //   tabValue: 41,
  //   title: 'Live Games',
  //   titleKey: 'live_games',
  //   filterParams: ['Live Games'],
  // },
  {
    icon: othersIcon,
    tabValue: 42,
    title: "Wheel of Fortune",
    titleKey: "wheel_of_fortune",
    filterParams: ["Wheel of Fortune"],
  },
  {
    icon: othersIcon,
    tabValue: 43,
    title: "32cards",
    titleKey: "32cards",
    filterParams: ["32cards"],
  },
  {
    icon: othersIcon,
    tabValue: 44,
    title: "Baccarat",
    titleKey: "baccarat",
    filterParams: ["baccarat"],
  },
  {
    icon: othersIcon,
    tabValue: 45,
    title: "Poker",
    titleKey: "poker",
    filterParams: ["poker"],
  },
  {
    icon: othersIcon,
    tabValue: 46,
    title: "Blackjack",
    titleKey: "blackjack",
    filterParams: ["blackjack"],
  },
  {
    icon: othersIcon,
    tabValue: 47,
    title: "Lucky7",
    titleKey: "lucky7",
    filterParams: ["lucky7"],
  },
  {
    icon: othersIcon,
    tabValue: 48,
    title: "Roulette",
    titleKey: "roulette",
    filterParams: ["roulette"],
  },
  {
    icon: othersIcon,
    tabValue: 49,
    title: "Sicbo",
    titleKey: "sicbo",
    filterParams: ["sicbo"],
  },
  // {
  //   icon: othersIcon,
  //   tabValue: 50,
  //   title: 'Video Slots',
  //   titleKey: 'video_slots',
  //   filterParams: ['Video Slots'],
  // },
  // {
  //   icon: othersIcon,
  //   tabValue: 51,
  //   title: 'Live Popular',
  //   titleKey: 'live_popular',
  //   filterParams: ['Live Popular'],
  // },
  {
    icon: othersIcon,
    tabValue: 51,
    title: "Casual Games",
    titleKey: "casual_games",
    filterParams: ["Casual Games"],
  },
  {
    icon: cricketWarIcon,
    tabValue: 53,
    title: "Cricketwar",
    titleKey: "cricketwar",
    filterParams: ["Cricketwar"],
  },
  // {
  //   icon: crashGameIcon,
  //   tabValue: 54,
  //   title: 'Crash',
  //   filterParams: ['Crash'],
  // },
  {
    icon: slotIcon,
    tabValue: 55,
    title: "Slots",
    titleKey: "slots",
    filterParams: ["Slots"],
  },
  {
    icon: slotsIcon,
    tabValue: 56,
    title: "Slot games",
    titleKey: "slot_games",
    filterParams: ["slot games"],
  },
  {
    icon: bingoIcon,
    tabValue: 57,
    title: "Bingo",
    titleKey: "bingo",
    filterParams: ["bingo"],
  },
  {
    icon: hiLoIcon,
    tabValue: 58,
    title: "Hi Lo",
    titleKey: "hilo",
    filterParams: ["hi lo", "hilo"],
  },
  {
    icon: monopolyIcon,
    tabValue: 59,
    title: "Monopoly",
    titleKey: "monopoly",
    filterParams: ["monopoly"],
  },
  {
    icon: dealOrNoDealIcon,
    tabValue: 60,
    title: "Deal Or No Deal",
    titleKey: "deal_or_no_deal",
    filterParams: ["deal or no deal"],
  },
  {
    icon: rummyIcon,
    tabValue: 61,
    title: "Rummy",
    titleKey: "rummy",
    filterParams: ["rummy"],
  },
  {
    icon: othersIcon,
    tabValue: 52,
    title: "Others",
    titleKey: "others",
    filterParams: ["others"],
  },
];

export const categoryIcons = {
  all: allCategoryIcon,
  aviator: aviatorIcon,
  mines: minesIcon,
  colorgames: ColorGameIcon,
  dragontiger: dragonTigerIcon,
  andarbahar: andarBaharIcon,
  teenpatti: teenpattiIcon,
  lottery: lotteryIcon,
  livepoker: livePokerIcon,
  livelobby: liveLobbyIcon,
  crashgames: crashGameIcon,
  casualgames: casualGameIcon,
  scratchcards: scratchCardIcon,
  liveblackjack: liveBlackjackIcon,
  livebaccarat: liveBacarratIcon,
  livesicbo: liveSicBoIcon,
  liveroulette: liveRouletteIcon,
  virtualcasino: virtualCasinoIcon,
  tvgames: tvGamesIcon,
  livedice: liveDiceIcon,
  livegameshows: liveGameShowIcon,
  table: othersIcon,
  live: othersIcon,
  lobby: liveLobbyIcon,
  wheel_of_fortune: othersIcon,
  ["32cards"]: cards32Icon,
  blackjack: liveBlackjackIcon,
  lucky7: lucky7Icon,
  roulette: liveRouletteIcon,
  sicbo: liveSicBoIcon,
  cricketwar: cricketWarIcon,
  slots: slotIcon,
  slotgames: slotsIcon,
  bingo: bingoIcon,
  hilo: hiLoIcon,
  monopoly: monopolyIcon,
  dealornodeal: dealOrNoDealIcon,
  rummy: rummyIcon,
  fungames: FunGameIcon,
  chickengames: ChickenGamesIcon,
  colorprediction: ColorPredictionIcon,
  others: othersIcon,
};

export const getCasinoCategoryIcon = (categoryName: string) => {
  const formattedCategoryName = categoryName.toLowerCase().replace(/\s+/g, "");
  return categoryIcons[formattedCategoryName] || othersIcon;
};
