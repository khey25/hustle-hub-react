import { useState, useEffect } from 'react';
import { fetchUserOwnedAssets, TABLE_TO_COLUMN } from '../supabaseClient';

export function useOwnedAssets(session, tableName) {
  const [ownedNames, setOwnedNames] = useState(new Set());
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId || !tableName) {
      setOwnedNames(new Set());
      return;
    }

    const col = TABLE_TO_COLUMN[tableName];
    fetchUserOwnedAssets(userId, tableName)
      .then((rows) => {
        setOwnedNames(new Set(rows.map((r) => r[col]).filter(Boolean)));
      })
      .catch((err) => console.error('Error loading owned assets:', err));
  }, [userId, tableName]);

  const isOwned = (itemName) => ownedNames.has(itemName);

  const setOwnedStatus = (itemName, owned) => {
    setOwnedNames((prev) => {
      const next = new Set(prev);
      if (owned) next.add(itemName);
      else next.delete(itemName);
      return next;
    });
  };

  return { isOwned, setOwnedStatus };
}