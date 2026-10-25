import { RawUserData, MergedUser, MergeStats, MatchType } from '../types';
import { getImageUrl, normalizeMobile, toEnglishNumber, cleanNid } from './sheetService';

/**
 * Creates normalized lookup keys for matching
 */
function extractKeys(user: RawUserData): {
  usernameKey: string | null;
  nidKey: string | null;
  mobileKey: string | null;
  custKey: string | null;
} {
  const usernameKey = user.username && user.username.trim() !== ''
    ? user.username.trim().toLowerCase().replace(/[@\s]/g, '')
    : null;

  const validNid = cleanNid(user.nid, user.mobile);
  const nidKey = validNid.length >= 8 ? validNid : null;

  const cleanMob = normalizeMobile(user.mobile);
  const mobileKey = cleanMob.length >= 10 ? cleanMob : null;

  const custKey = user.cust_id && user.cust_id.trim() !== ''
    ? user.cust_id.trim().toLowerCase().replace(/[\s-]/g, '')
    : null;

  return { usernameKey, nidKey, mobileKey, custKey };
}

/**
 * High-performance smart data merger combining Bengali & English sheets
 */
export function mergeDatasets(
  banglaList: RawUserData[],
  englishList: RawUserData[]
): {
  mergedUsers: MergedUser[];
  stats: MergeStats;
} {
  const map = new Map<string, {
    bn?: RawUserData;
    en?: RawUserData;
    matchType: MatchType;
    matchKey: string;
  }>();

  // Auxiliary index maps for multi-property linking
  const usernameToEntry = new Map<string, string>();
  const nidToEntry = new Map<string, string>();
  const mobileToEntry = new Map<string, string>();
  const custToEntry = new Map<string, string>();

  // Pass 1: Ingest all Bangla records
  banglaList.forEach((bnUser, index) => {
    const { usernameKey, nidKey, mobileKey, custKey } = extractKeys(bnUser);
    const entryId = usernameKey 
      ? `user_${usernameKey}`
      : nidKey 
        ? `nid_${nidKey}`
        : mobileKey 
          ? `mob_${mobileKey}`
          : `bn_idx_${index}_${bnUser.id}`;

    if (map.has(entryId)) {
      // If same key exists in Bangla list (e.g. duplicate username with alternate phone), combine info
      const existing = map.get(entryId)!;
      if (existing.bn) {
        if (bnUser.mobile && existing.bn.mobile && !existing.bn.mobile.includes(bnUser.mobile)) {
          existing.bn.mobile = `${existing.bn.mobile}, ${bnUser.mobile}`;
        }
        if (!existing.bn.nid && bnUser.nid) existing.bn.nid = bnUser.nid;
        if (!existing.bn.address && bnUser.address) existing.bn.address = bnUser.address;
        if (!existing.bn.image && bnUser.image) existing.bn.image = bnUser.image;
      }
    } else {
      map.set(entryId, {
        bn: { ...bnUser },
        matchType: 'bangla_only',
        matchKey: entryId
      });
    }

    if (usernameKey) usernameToEntry.set(usernameKey, entryId);
    if (nidKey) nidToEntry.set(nidKey, entryId);
    if (mobileKey) mobileToEntry.set(mobileKey, entryId);
    if (custKey) custToEntry.set(custKey, entryId);
  });

  // Pass 2: Ingest English records & match against existing Bangla entries
  englishList.forEach((enUser, index) => {
    const { usernameKey, nidKey, mobileKey, custKey } = extractKeys(enUser);

    let matchedEntryId: string | null = null;

    if (usernameKey && usernameToEntry.has(usernameKey)) {
      matchedEntryId = usernameToEntry.get(usernameKey)!;
    } else if (nidKey && nidToEntry.has(nidKey)) {
      matchedEntryId = nidToEntry.get(nidKey)!;
    } else if (mobileKey && mobileToEntry.has(mobileKey)) {
      matchedEntryId = mobileToEntry.get(mobileKey)!;
    } else if (custKey && custToEntry.has(custKey)) {
      matchedEntryId = custToEntry.get(custKey)!;
    }

    if (matchedEntryId && map.has(matchedEntryId)) {
      // Found match! Merge together
      const existing = map.get(matchedEntryId)!;
      existing.en = enUser;
      existing.matchType = 'merged';
    } else {
      // New English-only record
      const newEntryId = usernameKey 
        ? `user_${usernameKey}`
        : nidKey 
          ? `nid_${nidKey}`
          : mobileKey 
            ? `mob_${mobileKey}`
            : `en_idx_${index}_${enUser.id}`;

      map.set(newEntryId, {
        en: enUser,
        matchType: 'english_only',
        matchKey: newEntryId
      });

      if (usernameKey) usernameToEntry.set(usernameKey, newEntryId);
      if (nidKey) nidToEntry.set(nidKey, newEntryId);
      if (mobileKey) mobileToEntry.set(mobileKey, newEntryId);
      if (custKey) custToEntry.set(custKey, newEntryId);
    }
  });

  // Pass 3: Build finalized, structured MergedUser records
  const result: MergedUser[] = [];
  let serial = 1;

  map.forEach((entry) => {
    const bn = entry.bn;
    const en = entry.en;

    const username = bn?.username || en?.username || '';
    const nid = cleanNid(en?.nid, en?.mobile) || cleanNid(bn?.nid, bn?.mobile) || '';
    
    const nameBn = bn?.name || '';
    const nameEn = en?.name || '';
    const name = nameBn || nameEn || username || 'অজানা গ্রাহক';

    const addressBn = bn?.address || '';
    const addressEn = en?.address || '';
    const address = addressBn || addressEn || '';

    const mobileBn = bn?.mobile || '';
    const mobileEn = en?.mobile || '';
    const mobile = mobileBn || mobileEn || '';

    const custId = en?.cust_id || (bn as any)?.cust_id || '';
    const sn = en?.sn || (bn as any)?.sn || '';

    const rawImage = en?.image || bn?.image || '';
    const image = getImageUrl(rawImage);

    result.push({
      serial: serial++,
      username,
      nid,
      name,
      nameBn,
      nameEn,
      address,
      addressBn,
      addressEn,
      mobile,
      mobileBn,
      mobileEn,
      image,
      custId,
      sn,
      bnId: bn?.id ?? '',
      enId: en?.id ?? '',
      matchType: entry.matchType,
      matchKey: entry.matchKey,
      bnRaw: bn,
      enRaw: en
    });
  });

  // Calculate statistics
  const matchedCount = result.filter(u => u.matchType === 'merged').length;
  const banglaOnlyCount = result.filter(u => u.matchType === 'bangla_only').length;
  const englishOnlyCount = result.filter(u => u.matchType === 'english_only').length;
  const withPhotoCount = result.filter(u => !!u.image).length;
  const withNidCount = result.filter(u => !!u.nid).length;

  const totalMerged = result.length;
  const matchRatePercentage = totalMerged > 0 
    ? Math.round((matchedCount / totalMerged) * 100) 
    : 0;

  const stats: MergeStats = {
    totalMerged,
    totalBangla: banglaList.length,
    totalEnglish: englishList.length,
    matchedCount,
    banglaOnlyCount,
    englishOnlyCount,
    withPhotoCount,
    withNidCount,
    matchRatePercentage
  };

  return { mergedUsers: result, stats };
}

/**
 * Filter users according to view mode, search string, and match filter
 */
export function filterAndSearchUsers(
  users: MergedUser[],
  searchQuery: string,
  viewMode: 'merged' | 'bangla' | 'english' | 'side-by-side',
  matchFilter: 'all' | 'merged_only' | 'bangla_only' | 'english_only' | 'has_bangla' | 'has_english' | 'has_photo' | 'has_nid',
  sortBy: 'serial' | 'name' | 'match' | 'nid' | 'mobile'
): MergedUser[] {
  let list = [...users];

  // Apply ViewMode base restriction if viewing single language
  if (viewMode === 'bangla') {
    list = list.filter(u => !!u.bnRaw || !!u.nameBn || u.matchType === 'bangla_only' || (u.matchType === 'merged' && (!!u.nameBn || !!u.addressBn || !!u.mobileBn)));
  } else if (viewMode === 'english') {
    list = list.filter(u => !!u.enRaw || !!u.nameEn || u.matchType === 'english_only' || (u.matchType === 'merged' && (!!u.nameEn || !!u.addressEn || !!u.mobileEn)));
  }

  // Apply sub-filter
  if (matchFilter === 'merged_only') {
    list = list.filter(u => u.matchType === 'merged');
  } else if (matchFilter === 'has_bangla' || matchFilter === 'bangla_only') {
    // Shows all users from Bangla sheet
    list = list.filter(u => !!u.bnRaw || !!u.nameBn || u.matchType === 'bangla_only' || (u.matchType === 'merged' && (!!u.nameBn || !!u.addressBn || !!u.mobileBn)));
  } else if (matchFilter === 'has_english') {
    // Shows all users from English sheet
    list = list.filter(u => !!u.enRaw || !!u.nameEn || u.matchType === 'english_only' || (u.matchType === 'merged' && (!!u.nameEn || !!u.addressEn || !!u.mobileEn)));
  } else if (matchFilter === 'english_only') {
    list = list.filter(u => u.matchType === 'english_only');
  } else if (matchFilter === 'has_photo') {
    list = list.filter(u => !!u.image);
  } else if (matchFilter === 'has_nid') {
    list = list.filter(u => !!u.nid && u.nid.trim() !== '');
  }

  // Apply Search Query across all fields
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const qNum = toEnglishNumber(q);

    list = list.filter(u => {
      const searchBlob = [
        u.name,
        u.nameBn,
        u.nameEn,
        u.username,
        u.nid,
        u.mobile,
        u.mobileBn,
        u.mobileEn,
        u.address,
        u.addressBn,
        u.addressEn,
        u.custId,
        String(u.sn),
        String(u.serial)
      ].join(' ').toLowerCase();

      return searchBlob.includes(q) || (qNum && searchBlob.includes(qNum));
    });
  }

  // Apply Sorting
  list.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'bn');
    }
    if (sortBy === 'match') {
      const order: Record<MatchType, number> = { merged: 0, bangla_only: 1, english_only: 2 };
      return order[a.matchType] - order[b.matchType];
    }
    if (sortBy === 'nid') {
      return (a.nid || '').localeCompare(b.nid || '');
    }
    if (sortBy === 'mobile') {
      return (a.mobile || '').localeCompare(b.mobile || '');
    }
    return a.serial - b.serial;
  });

  return list;
}
