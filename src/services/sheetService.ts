import { RawUserData } from '../types';
import { FALLBACK_BANGLA_CSV, FALLBACK_ENGLISH_CSV } from '../data/fallbackData';

/**
 * Format Google Drive or external link into a directly viewable image URL
 */
export function getImageUrl(link: string | undefined | null, highRes: boolean = false): string {
  if (!link || typeof link !== 'string' || link.trim() === '') return '';
  const trimmed = link.trim();

  // Already standard image URL
  if (/\.(jpe?g|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  // Google Drive format 1: /file/d/{id}/...
  let fileId: string | null = null;
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) fileId = match1[1];

  // Google Drive format 2: ?id={id}
  if (!fileId) {
    const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) fileId = match2[1];
  }

  // Google Drive format 3: drive.google.com/open?id={id} or /uc?id={id}
  if (!fileId && trimmed.includes('drive.google.com')) {
    const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match3) fileId = match3[1];
  }

  if (fileId) {
    const sizeParam = highRes ? 'w1000-h1000' : 'w400-h400';
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sizeParam}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return '';
}

/**
 * Clean & normalize Bangladeshi phone numbers
 */
export function normalizeMobile(phone: any): string {
  if (!phone) return '';
  let str = String(phone).trim();
  // Convert Bengali numerals to English if any
  str = toEnglishNumber(str);
  str = str.replace(/[^0-9]/g, '');

  if (str.startsWith('880')) {
    str = str.substring(2);
  }
  if (str.length === 10 && (str.startsWith('1') || str.startsWith('9') || str.startsWith('8') || str.startsWith('7') || str.startsWith('6') || str.startsWith('5') || str.startsWith('4') || str.startsWith('3'))) {
    str = '0' + str;
  }
  return str;
}

export function toEnglishNumber(num: string | number): string {
  if (num === null || num === undefined) return '';
  return String(num)
    .replace(/০/g, '0').replace(/১/g, '1').replace(/২/g, '2')
    .replace(/৩/g, '3').replace(/৪/g, '4').replace(/৫/g, '5')
    .replace(/৬/g, '6').replace(/৭/g, '7').replace(/৮/g, '8').replace(/৯/g, '9');
}

export function toBengaliNumber(num: string | number): string {
  if (num === null || num === undefined) return '';
  return String(num)
    .replace(/0/g, '০').replace(/1/g, '১').replace(/2/g, '২')
    .replace(/3/g, '৩').replace(/4/g, '৪').replace(/5/g, '৫')
    .replace(/6/g, '৬').replace(/7/g, '৭').replace(/8/g, '৮').replace(/9/g, '৯');
}

/**
 * Clean & validate Bangladeshi National ID (NID)
 * Ensures phone numbers are not mistakenly treated as NID
 */
export function cleanNid(rawNid: any, mobilePhone?: string): string {
  if (rawNid === null || rawNid === undefined) return '';
  let str = String(rawNid).trim();
  if (!str || str === 'null' || str === 'undefined' || str === '—' || str === '-') return '';
  
  // Convert Bengali numerals to English
  str = toEnglishNumber(str);
  str = str.replace(/[^0-9A-Za-z]/g, '');

  if (!str) return '';

  // If phone number is available, check if NID is actually the same phone number
  const normMob = mobilePhone ? normalizeMobile(mobilePhone) : '';
  if (normMob) {
    if (str === normMob || str === '88' + normMob || '0' + str === normMob) {
      return ''; // Discard phone number from NID field
    }
  }

  // If NID starts with 013/014/015/016/017/018/019 and is exactly 11 digits, it is a mobile number
  if (/^01[3-9]\d{8}$/.test(str)) {
    return ''; // Discard mobile number from NID field
  }

  return str;
}

/**
 * Parses Google Sheets GViz API JSON output
 */
function parseGvizJSON(json: any): RawUserData[] {
  if (!json || !json.table || !json.table.rows) return [];

  const cols = json.table.cols || [];
  const rows = json.table.rows || [];

  const colMap: Record<string, number> = {};
  
  // Check if header contains SL / SN / ক্রমিক
  const hasSlCol = cols.some((col: any) => {
    const l = (col.label || col.id || '').trim().toLowerCase();
    return l.includes('ক্রমিক') || l === 'sl' || l === 'sn';
  });

  cols.forEach((col: any, index: number) => {
    const label = (col.label || col.id || '').trim().toLowerCase();
    
    if (label.includes('ক্রমিক') || label === 'sl' || label === 'sn') {
      colMap['sl'] = index;
    } else if (label === 'id' && hasSlCol) {
      // In sheets with SL and ID (e.g. SL, ID, Name...), ID column is the username/code (pcn771, etc.)
      colMap['username'] = index;
    } else if (label.includes('ইউজার') || label === 'username' || label === 'user' || label === 'user id' || label === 'user_id' || label === 'pppoe') {
      colMap['username'] = index;
    } else if (label === 'id' && !hasSlCol) {
      colMap['id'] = index;
    }

    if (label.includes('নাম') || label.includes('গ্রাহক') || label === 'name' || label.includes('customer name') || label.includes('client name')) {
      colMap['name'] = index;
    }
    if (label === 'nid' || label.includes('এনআইডি') || label.includes('জাতীয় পরিচয়পত্র') || label.includes('জাতীয় পরিচয়পত্র') || label.includes('national id')) {
      colMap['nid'] = index;
    }
    if (label.includes('মোবাইল') || label.includes('মোবাইল') || label === 'mobile' || label === 'phone' || label.includes('ফোন') || label.includes('contact')) {
      colMap['mobile'] = index;
    }
    if (label.includes('ঠিকানা') || label === 'address' || label.includes('গ্রাম') || label.includes('village') || label.includes('location')) {
      colMap['address'] = index;
    }
    if (label.includes('ছবি') || label === 'image' || label === 'photo' || label === 'picture' || label.includes('drive')) {
      colMap['image'] = index;
    }
    if (label.includes('cust') || label.includes('customer id') || label === 'cust_id') {
      colMap['cust_id'] = index;
    }
  });

  const users: RawUserData[] = [];
  rows.forEach((row: any, idx: number) => {
    const c = row.c;
    if (!c) return;

    const getVal = (key: string) => {
      const colIndex = colMap[key];
      if (colIndex === undefined || colIndex >= c.length) return '';
      const cell = c[colIndex];
      if (!cell) return '';
      return cell.f !== undefined && cell.f !== null 
        ? String(cell.f).trim() 
        : cell.v !== undefined && cell.v !== null 
          ? String(cell.v).trim() 
          : '';
    };

    const id = getVal('sl') || getVal('id') || (idx + 1);
    const username = getVal('username');
    const name = getVal('name');
    const mobile = normalizeMobile(getVal('mobile'));
    const rawNid = getVal('nid');
    const nid = cleanNid(rawNid, mobile);
    const address = getVal('address');
    const rawImage = getVal('image');
    const image = getImageUrl(rawImage);
    const cust_id = getVal('cust_id');
    const sn = getVal('sl');

    if (name || username || mobile || nid || address) {
      users.push({
        id,
        username,
        name,
        nid,
        mobile,
        address,
        image,
        cust_id,
        sn
      });
    }
  });

  return users;
}

/**
 * Parses published CSV from Google Sheets
 */
function parseCSV(csvText: string): RawUserData[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const colMap: Record<string, number> = {};

  const hasSlCol = headers.some(h => h === 'sl' || h === 'sn' || h.includes('ক্রমিক'));

  headers.forEach((h, index) => {
    if (h.includes('ক্রমিক') || h === 'sl' || h === 'sn' || h === 'no') {
      colMap['sl'] = index;
    } else if (h === 'id' && hasSlCol) {
      // In sheets with SL and ID (e.g. SL,ID,Name...), ID column is the username/code (pcn771, etc.)
      colMap['username'] = index;
    } else if (h.includes('ইউজার') || h === 'username' || h === 'user' || h === 'user_id' || h === 'user id' || h === 'pppoe') {
      colMap['username'] = index;
    } else if (h === 'id' && !hasSlCol) {
      colMap['id'] = index;
    }

    if (h.includes('নাম') || h.includes('গ্রাহক') || h === 'name' || h.includes('customer name') || h.includes('client name')) {
      colMap['name'] = index;
    }
    if (h === 'nid' || h.includes('এনআইডি') || h.includes('জাতীয় পরিচয়পত্র') || h.includes('জাতীয় পরিচয়পত্র') || h.includes('national id')) {
      colMap['nid'] = index;
    }
    if (h.includes('মোবাইল') || h.includes('মোবাইল') || h === 'mobile' || h === 'phone' || h.includes('ফোন') || h.includes('contact')) {
      colMap['mobile'] = index;
    }
    if (h.includes('ঠিকানা') || h === 'address' || h.includes('গ্রাম') || h.includes('village') || h.includes('location')) {
      colMap['address'] = index;
    }
    if (h.includes('ছবি') || h === 'image' || h === 'photo' || h === 'picture' || h.includes('drive')) {
      colMap['image'] = index;
    }
    if (h.includes('cust') || h.includes('customer id') || h === 'cust_id') {
      colMap['cust_id'] = index;
    }
  });

  const users: RawUserData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const getVal = (key: string) => {
      const idx = colMap[key];
      if (idx === undefined || idx >= values.length) return '';
      return values[idx].trim();
    };

    const id = getVal('sl') || getVal('id') || i;
    const username = getVal('username');
    const name = getVal('name');
    const mobile = normalizeMobile(getVal('mobile'));
    const rawNid = getVal('nid');
    const nid = cleanNid(rawNid, mobile);
    const address = getVal('address');
    const rawImage = getVal('image');
    const image = getImageUrl(rawImage);
    const cust_id = getVal('cust_id');
    const sn = getVal('sl');

    if (name || username || mobile || nid || address) {
      users.push({
        id,
        username,
        name,
        nid,
        mobile,
        address,
        image,
        cust_id,
        sn
      });
    }
  }

  return users;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Fetch sheet data directly from published CSV or GViz endpoint with high-speed failover.
 * Supported on both cloud deployments and localhost development environments.
 */
export async function fetchSheetData(
  sheetId: string, 
  csvBackupUrl: string, 
  sheetType: 'bangla' | 'english'
): Promise<{ data: RawUserData[]; source: string }> {
  // Strategy 1: Local Dev Server Proxy (available when running on localhost / Vite dev server)
  if (csvBackupUrl) {
    try {
      const proxyLocalUrl = `/api/sheets-proxy?url=${encodeURIComponent(csvBackupUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(proxyLocalUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const csvText = await res.text();
        const users = parseCSV(csvText);
        if (users.length > 0) {
          return { data: users, source: 'Google Sheets (Local Proxy)' };
        }
      }
    } catch {
      // Local dev proxy not active or failed, proceed to direct fetch
    }
  }

  // Strategy 2: Direct Published CSV URL
  if (csvBackupUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(csvBackupUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const csvText = await res.text();
        const users = parseCSV(csvText);
        if (users.length > 0) {
          return { data: users, source: 'Google Sheets (Live CSV)' };
        }
      }
    } catch (err) {
      console.warn(`Direct CSV fetch failed for ${sheetType}, trying alternate routes:`, err);
    }
  }

  // Strategy 3: GViz endpoint direct
  if (sheetId && sheetId.length > 5) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(gvizUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonStr = text.substring(start, end + 1);
          const parsed = JSON.parse(jsonStr);
          const users = parseGvizJSON(parsed);
          if (users.length > 0) {
            return { data: users, source: 'Google Sheets (GViz Direct)' };
          }
        }
      }
    } catch (err) {
      console.warn(`Direct GViz fetch failed for ${sheetType}:`, err);
    }

    // Try GViz via CORS proxy
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(gvizUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonStr = text.substring(start, end + 1);
          const parsed = JSON.parse(jsonStr);
          const users = parseGvizJSON(parsed);
          if (users.length > 0) {
            return { data: users, source: 'Google Sheets (GViz Proxy)' };
          }
        }
      }
    } catch (err) {
      console.warn(`GViz proxy fetch failed for ${sheetType}:`, err);
    }
  }

  // Strategy 4: CSV via external proxy fallback
  if (csvBackupUrl) {
    try {
      const proxyCsv = `https://api.allorigins.win/raw?url=${encodeURIComponent(csvBackupUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res2 = await fetch(proxyCsv, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res2.ok) {
        const csvText = await res2.text();
        const users = parseCSV(csvText);
        if (users.length > 0) {
          return { data: users, source: 'Google Sheets (CSV Proxy)' };
        }
      }
    } catch (err2) {
      console.warn(`Proxy CSV fetch failed for ${sheetType}:`, err2);
    }
  }

  // Strategy 5: Embedded Real Dataset Snapshot (guarantees localhost works even offline)
  try {
    const fallbackText = sheetType === 'bangla' ? FALLBACK_BANGLA_CSV : FALLBACK_ENGLISH_CSV;
    if (fallbackText) {
      const users = parseCSV(fallbackText);
      if (users.length > 0) {
        return { data: users, source: 'অফলাইন ব্যাকআপ ডেটা (লোকাল)' };
      }
    }
  } catch (offlineErr) {
    console.warn(`Offline snapshot parsing failed for ${sheetType}:`, offlineErr);
  }

  return { data: [], source: 'Google Sheets (কানেকশন সমস্যা)' };
}
