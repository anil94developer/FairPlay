import { BRAND_DOMAIN, BRAND_NAME } from "./Branding";

export const ContactList: { [key: string]: string } = {
  BetfairXXX: "+44 7883 309261",
};

export const FOOTER_LISTS = [
  {
    name: "About",
    items: [
      { name: `About ${BRAND_NAME}`, url: "/home" },
      { name: "B2B", url: "/home" },
      { name: "Responsible Gambling", url: "/home" },
      { name: "Licensing", url: "/home" },
    ],
  },
  {
    name: "Help & Support",
    items: [
      { name: "Help Center", url: "/home" },
      { name: "Live Chat", url: "/home" },
      { name: "Online Slots", url: "/home" },
      { name: "Deposits", url: "/home" },
      { name: "FAQ", url: "/home" },
      { name: "Contact Us", url: "/home" },
    ],
  },
];

export const SPORTS_FOOTER_LISTS = [
  {
    name: "Sports",
    items: [
      { name: "Cricket", id: 4, url: "/exchange_sports/cricket" },
      { name: "Football", id: 1, url: "/exchange_sports/soccer" },
      { name: "Tennis", id: 2, url: "/exchange_sports/tennis" },
    ],
  },
];

export const CASINO_FOOTER_LISTS = [
  {
    name: "Live Casino",
    items: [
      { name: "Poker", url: "/casino" },
      { name: "Blackjack", url: "/casino" },
      { name: "Baccarat", url: "/casino" },
      { name: "Roulette", url: "/casino" },
      { name: "Andar Bahar", url: "/casino" },
      { name: "Teenpatti", url: "/casino" },
    ],
  },
];

export const SPORTSBOOK_SPORTS = [
  "cricket",
  "football",
  "tennis",
  "badminton",
  "baseball",
  "basketball",
  "rugby",
  "snooker",
  "ice hockey",
];

export const STUDIO_SPORTS = [
  "speedy7",
  "war Of Bets",
  "pocker",
  "baccarat",
  "wheel",
  "lucky7",
  "dice Duel",
];

export const SPORT_RULES = [
  {
    name: "speedy7",
    rules: [
      `Speedy 7 consists of seven betting rounds. During each betting round the player can predict the card to be dealt next`,

      `First betting round. The first betting round begins before the first card is dealt, during which the player can place a bet for only one of the betting options available,
       predicting the next opened card (this rule applies to all betting rounds).`,

      `The announcement of the first betting round result. Once the first betting round is completed, the first card is dealt and the outcome of the betting round is determined,
        the cumulative winnings are calculated, and the new betting round starts.`,

      `The second betting round. Updated odds are displayed before the second betting round starts.`,
      `Players who win in the first betting round can make one of the following actions:`,
      `Continue playing by predicting the next card.`,
      `Cash out (there will be a dedicated button for that). In this case, the accumulated winning will be paid out.`,
    ],
  },
  {
    name: "war Of Bets",
    rules: [
      `Rules of War of Bets`,
      `One card is dealt to the Player position.`,
      `The dealer is then dealt his card.`,
      `Whoever has the higher card, wins.`,
      `Aces are counted as High, a two or deuce is the lowest you can get.`,
      `The game is played with 6 decks of cards that have been manually shuffled before they are placed in the dealing show.`,
    ],
  },
  {
    name: "pocker",
    rules: [
      `Draw – one dealing of cards which begins when the dealer scans the first card and places it at the first Position (Hand 1) and ends when the dealer places the last community card face-up, announces the winner(s) and puts all the face-up cards back to the deck.
       Before the start of each draw the dealer announces the beginning of the draw and shuffles the cards.`,
      `Position (Pocket cards – Hand 1-6) – two cards placed face-up on the table. A total of six (6) Positions (Hands) participate in a draw and are numbered from 1 to 6.`,
      `Betting outcome – possible interpretation of the outcome of one draw expressed as odds which may change in the course of the draw depending on the change of the mathematical probability of the outcome`,
      `Betting round – time allocated for user bets to be accepted. A new betting round begins after each change in the gameplay (before and after the Pocket cards are dealt, after the Flop and after the Turn).`,
      `Board – five (5) community cards that every Position (Hand) uses to form the best Combination.`,
      `Combination (Hand rankings) – five (5) cards made of two (2) pocket cards and five (5) community cards. See par. 2.4. for Hand strength from the lowest to the highest.`,
      `Flop – the first three (3) community cards which are dealt after all six (6) Positions receive their pocket cards and the second betting round.`,
      `Turn – the fourth community card which is dealt after the third betting round.`,
      `River – the fifth community card which is dealt after the fourth betting round.`,
      `Discarded card – card dealt face-down from top of the deck before opening flop, turn, and river.`,
      `Kicker – a card that does not itself take part in determining the rank of the hand, but may be used to break ties between hands of the same rank.`,
    ],
  },
  {
    name: "baccarat",
    rules: [
      `“Bet-on-Baccarat” is a real-time game with almost the same procedure and rules as Baccarat (or Punto Banco).`,
      `The game is played between two sides – the Player and the Banker. The dealer deals two cards face-up to each side in every draw of the game. Cards are dealt one at a time and the Player always receives the first card. In special situations the third card is dealt to the Player and (or) the Banker. The goal of the game is to collect a total sum of points as close as possible or equal to 9 (nine) after no more cards can be dealt according to the rules.
       A Tie occurs if the Player and the Banker have the same number of points.`,
      `The value of numerical cards from Deuce (2) to Nine (9) is equal to the number of points of the given card. The value of Face cards and Ten (10) is zero (0). Ace has a value of 1 (one) point. All card points are summed up to calculate the total sum of player’s points. If the total sum is expressed in a double-digit figure, the score of the Player is the right digit of the total of the cards.`,
    ],
  },
  {
    name: "wheel",
    rules: [
      `Presenter introduces the Wheel of Fortune, spins it counter-clockwise and then spins it clockwise with a light hand stroke. Only one spin is made during a draw except for cases when the spin must be repeated.`,
      `Presenter’s spin (and the draw) is valid if the wheel makes at least three (3) full spins clockwise. Full clockwise spins are counted by the spins counter and a green light is lit when the wheel makes three (3) full spins. The spin starts when the wheel starts spinning clockwise and the pointer leaves the sector where it was previously standing. The result of the draw is the sector’s number or symbol where the pointer lands after the wheel stops turning.`,
      `There is only one betting round and players can place their bets on all available outcomes for the upcoming draw. A betting round takes place between the game draws and lasts about two minutes. Draws of the game run every 3 minutes daily.`,
    ],
  },
  {
    name: "lucky7",
    rules: [
      `Terms- Game machine – a mechanical device used to hold, mix and randomly select the winning balls of the draw.`,
      `Balls – a set of forty two (42) yellow and black balls used for the game. There are 21 balls of each colour and the balls are numbered from 1 to 42. Total sum of the numbers on the balls is 903. The total sum of the numbers on the yellow balls is 451 and the total sum of the numbers on the black balls is 452.`,
      `Drum of the game machine – a part of the game machine where all the balls are placed after the presentation. Later, the balls are shuffled and the winning balls are randomly selected.Tube – a part of the game machine where all balls are placed after the presentation. Later the balls are mixed and the winning balls are drawn.`,
      `Odds – numerical expression determined by the game organizer, which is multiplied by the amount of the player’s stake to calculate the winnings.`,
      `RULES -winning balls out of 42 are randomly drawn into the game tube.`,
      `The draw is deemed to have taken place when at least 7 winning balls are selected. In all other cases the draw is void and all the stakes are returned.`,
      `If more than 7 balls are placed in the tube only the first 7 balls are named and the other balls in the tube are ignored.`,
    ],
  },
  {
    name: "dice Duel",
    rules: [
      `Dice Duel is a simple real time dice–rolling game adapted for betting with a wide selection of outcomes.Game process-Two – one red and one blue dice with sides numbered from 1 to 6 pips are used in the game. The presenter puts the dice into a dice box, shuffles and rolls them on the game table. Dice are rolled only once during a draw except in special cases when the roll has to be repeated. A roll is deemed to have taken place when both dice stand on one of their sides and clearly make a two dice combination.The result of the draw is the two dice combination determined by the color of the dice and the pip numbers on the top side of each dice after they are rolled on the table.
  There is only one betting round and players can place their bets on all available outcomes for the upcoming draw. A betting round takes place between the game draws and lasts about 40 seconds. Draws of the game run every 60 seconds daily.`,
    ],
  },
  {
    name: "cricket",
    rules: [
      "Twenty 20: all scheduled overs must be played for undecided markets to be settled unless the innings has reached its natural conclusion.T20/ODIs/Limited Overs matches; bets will be void if it has not been possible to complete at least 80% of the overs scheduled to be bowled due to external factors, including bad weather unless settlement of the bet has already been determined. 80% and above of agreed scheduled overs bowled is considered to be a full innings, and markets settled accordingly.",
      `In drawn first-class matches, bets will be void if fewer than 200 overs have been bowled, unless settlement of the bet has already been determined.`,
      `In the case of weather affected matches or other external factors, the Duckworth Lewis method will be applied, and all markets will be paid out on the official result of the match as determined by the governing body's official competition rules. If a match is declared a 'no result' bets will be void and staked money returned to the customer. If a match/market is canceled before a ball being bowled, and it is not rescheduled within 36 hours, bets on the match will be classified as void.`,
      `Runs in 1st over: The 1st over must be completed for the bets to stand unless settlement has already been determined. If an innings ends during an over then that over will be deemed to be complete unless the innings is ended due to external factors, including bad weather, in cases all bets will be void, unless settlement already has been determined. In first-class matches, the market refers only to each team's innings. Extras and penalty runs in the particular over count towards settlement.`,
      `Runs off 1st delivery: the result will be determined by the number of runs added to the team total, or the first ball of the match. For settlement purposes, all illegal balls count as  a delivery`,
      `Most Fours; Only 'fours' scored from the bat ( off any delivery ) will count toward to total 'four'  count. overthrows and 'fours' s all run will not count towards the market. fours in a super over do not count. In first-class games, only fours in the first innings will count.`,
    ],
  },
  {
    name: "football",
    rules: [
      `Unless otherwise stated, all Pre-match bets on American Football are determined on the basis of the result after the extra (over) time. This does not apply to Live-betting where all bets are settled after Regular time unless otherwise stated.`,
      `In case of any delay (rain, darkness…) all markets remain unsettled and the trading will be continued as soon as the match continues.
      All offered players are considered as runners.`,
      `If no further touchdown is scored, the market will be voided.`,
    ],
  },
  {
    name: "tennis",
    rules: [
      "Sprint matches based on historical information. All matches are between top tier historical and present tennis players. Please Note: the names appear before and during the match are fictional",
      `The format of the match is one set shootout`,
      `All matches will start at a score of 0-0`,
      `After the match is finished, a unique message will be delivered with Player names, Tournament name, Match date, Set number and score.`,
    ],
  },
  {
    name: "badminton",
    rules: [
      `In the case of a match not being finished, all undecided markets are considered void.`,
      `If a match is interrupted or postponed and is not continued within 48h after initial kick-off date, betting will be void `,
      `If markets remain open with an incorrect score which has a significant impact on the prices, we reserve the right to void betting.`,
      `If a team retires all undecided markets are considered void.`,
      `If the players/teams are displayed incorrectly, we reserve the right to void betting.`,
    ],
  },
  {
    name: "baseball",
    rules: [
      `Which team wins race to x points?- If an inning ends before the Xth point is reached (incl. extra innings), this market is considered void (cancelled).`,
      `Who scores the Xth point- If an inning ends before the Xth point is reached (incl. extra innings), this market is considered void (cancelled)`,
    ],
  },
  {
    name: "basketball",
    rules: [
      `Who scores Xth point? (incl. ot)- If a match ends before the Xth is reached, this market is considered void (cancelled).`,
      `Who scores Xth point? (incl. ot)- If a match ends before the Xth is reached, this market is considered void (cancelled).`,
      `Will there be overtime?- Market will be settled as yes if at the end of regular time the match finishes in a draw, regardless of whether or not overtime is played.`,
    ],
  },
  {
    name: "rugby",
    rules: [
      `If a match is interrupted and continued within 48h after the initial kickoff, all open bets will be settled with the final result (The bet can be voided, before 48 hours has passed, in agreement between the client and Sportsbet.io). Otherwise, all undecided bets are considered void.`,
      `Regular 80 Minutes: Markets are based on the result at the end of a scheduled 80 minutes play unless otherwise stated. This includes any added injury or stoppage time but does not include extra-time, time allocated for a penalty shootout or sudden death.`,
    ],
  },
  {
    name: "snooker",
    rules: [
      `In the case of a retirement of a player or disqualification, all undecided markets are considered void.`,
      `In case of a re-rack settlement stays if the outcome was determined before the re-rack.`,
      `No fouls or free balls are considered for settlement of any Potted-Colour market.`,
      `In case of a frame starting but not being completed, all frame related markets will be voided unless the outcome has already been determined.`,
    ],
  },
  {
    name: "ice hockey",
    rules: [
      `All markets (except period, overtime and penalty shootout markets) are considered for regular time only unless it is mentioned in the market.`,
      `If a match is interrupted and continued within 48h after initial kickoff all open bets will be settled with the final result (The bet can be voided, before 48 hours has passed, in agreement between the client and Sportsbet.io). Otherwise all undecided bets are considered void.`,
      `In the event of a game being decided by a penalty shootout, then one goal will be added to the winning team's score and the game total for settlement purposes. This applies to all markets including overtime and penalty shootout`,
    ],
  },
];
