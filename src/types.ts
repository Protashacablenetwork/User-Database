export type ViewMode = 'merged' | 'bangla' | 'english' | 'side-by-side';
export type DisplayLayout = 'table' | 'cards';

export type MatchType = 
  | 'merged'          // Matched across both Bangla and English
  | 'bangla_only'     // Only found in Bangla sheet
  | 'english_only';   // Only found in English sheet

export interface RawUserData {
  id: string | number;
  username?: string;
  name?: string;
  nid?: string;
  mobile?: string;
  address?: string;
  image?: string;
  cust_id?: string;
  sn?: string | number;
  [key: string]: any;
}

export interface BanglaUserData {
  id: string | number;
  name?: string;
  address?: string;
  mobile?: string;
  image?: string;
  nid?: string;
  username?: string;
  [key: string]: any;
}

export interface EnglishUserData {
  id: string | number;
  name?: string;
  address?: string;
  mobile?: string;
  image?: string;
  cust_id?: string;
  sn?: string | number;
  nid?: string;
  username?: string;
  [key: string]: any;
}

export interface MergedUser {
  serial: number;
  username: string;
  nid: string;
  name: string;
  nameBn: string;
  nameEn: string;
  address: string;
  addressBn: string;
  addressEn: string;
  mobile: string;
  mobileBn: string;
  mobileEn: string;
  image: string;
  custId: string;
  sn: string | number;
  bnId: string | number;
  enId: string | number;
  matchType: MatchType;
  matchKey: string;
  matchScore?: number;
  bnRaw?: BanglaUserData;
  enRaw?: EnglishUserData;
}

export interface MergeStats {
  totalMerged: number;
  totalBangla: number;
  totalEnglish: number;
  matchedCount: number;
  banglaOnlyCount: number;
  englishOnlyCount: number;
  withPhotoCount: number;
  withNidCount: number;
  matchRatePercentage: number;
}

export interface SheetConfig {
  banglaSheetId: string;
  englishSheetId: string;
  banglaCsvUrl: string;
  englishCsvUrl: string;
  sheetName: string;
}
