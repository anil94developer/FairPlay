export interface DcGameNew {
  id?: string | number;
  name?: string;
  title?: string;
  provider?: string;
  category?: string;
  imageUrl?: string;
  gameUrl?: string;
  [key: string]: any;
}

export default DcGameNew;
