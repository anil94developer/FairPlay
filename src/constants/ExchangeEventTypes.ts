export const EXCHANGE_EVENT_TYPES = [
  { id: "4", name: "Cricket", slug: "cricket" },
  { id: "1", name: "Football", slug: "football" },
  { id: "2", name: "Tennis", slug: "tennis" },
  { id: "7", name: "Horse Racing", slug: "horseracing" },
  {
    id: "4339",
    name: "GreyHound",
    slug: "greyhound",
  },
  {
    id: "7522",
    name: "basketball",
    slug: "basketball",
    enabled: true,
  },
  {
    id: "7511",
    name: "baseball",
    slug: "baseball",
    enabled: true,
  },
  {
    id: "sr_sport_29",
    name: "Futsal",
    slug: "futsal",
    enabled: true,
  },
  {
    id: "sr_sport_22",
    name: "Darts",
    slug: "darts",
    enabled: true,
  },
  {
    id: "sr_sport_23",
    name: "Volleyball",
    slug: "volleyball",
    enabled: true,
  },
  {
    id: "sr_sport_20",
    name: "Table Tennis",
    slug: "tabletennis",
    enabled: true,
  },
  {
    id: "99990",
    name: "Binary",
    slug: "binary",
    enabled: true,
  },
  {
    id: "2378961",
    name: "Politics",
    slug: "politics",
    enabled: true,
  },
  {
    id: "sr_sport_4",
    name: "Ice Hockey",
    slug: "icehockey",
    enabled: true,
  },
  {
    id: "99994",
    name: "Kabaddi",
    slug: "kabaddi",
    enabled: true,
  },
  {
    id: "sr_sport_117",
    name: "MMA",
    slug: "mma",
    enabled: true,
  },
  {
    id: "sr_sport_12",
    name: "Rugby",
    slug: "rugby",
    enabled: true,
  },
];

export const SPORTS_MAP = new Map([
  [
    "Cricket",
    { id: "4", name: "Cricket", slug: "cricket", priority: 0, disable: false },
  ],
  [
    "Football",
    {
      id: "1",
      name: "Football",
      slug: "football",
      priority: 1,
      disable: false,
    },
  ],
  [
    "Tennis",
    { id: "2", name: "Tennis", slug: "tennis", priority: 2, disable: false },
  ],
  [
    "Horse Racing",
    {
      id: "7",
      name: "Horse Racing",
      slug: "horseracing",
      priority: 3,
      disable: false,
    },
  ],
]);

export const EXCH_SPORTS_MAP = {
  tennis: "2",
  football: "1",
  soccer: "1",
  cricket: "4",
  horseracing: "7",
  greyhound: "4339",
  basketball: "7522",
  baseball: "7511",
  binary: "99990",
  politics: "2378961",
  kabaddi: "99994",
};
