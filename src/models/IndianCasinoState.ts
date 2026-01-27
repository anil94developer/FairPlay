export interface CasinoGameDTO {
  id?: string | number;
  name?: string;
  title?: string;
  provider?: string;
  category?: string;
  imageUrl?: string;
  gameUrl?: string;
  [key: string]: any;
}

export interface IndianCasinoState {
  selectedGame: CasinoGameDTO | null;
  games: CasinoGameDTO[];
  [key: string]: any;
}

export default IndianCasinoState;
