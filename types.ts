export interface RawPackingItem {
    name: string;
    source?: 'user' | 'ai';
}

export interface PackingItem extends RawPackingItem {
    id: string;
    packed: boolean;
}

export interface RawPackingCategory {
    category: string;
    items: RawPackingItem[];
}

export interface PackingCategory extends RawPackingCategory {
    id: string;
    items: PackingItem[];
}

export type PackingList = PackingCategory[];

export interface TripHistoryItem {
  id: string;
  tripDescription: string;
  packingList: PackingList;
  createdAt: string; // ISO String
}

export type TripHistory = TripHistoryItem[];

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'text';
}

export interface ClarificationAnswer {
  questionId: string;
  answer: boolean | string;
}
