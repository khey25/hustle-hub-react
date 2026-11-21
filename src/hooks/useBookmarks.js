import { useState, useEffect } from 'react';
import { fetchUserBookmarks, toggleBookmark, TABLE_TO_COLUMN } from '../supabaseClient';

export function useBookmarks(session, tableName) {
  const [bookmarkedNames, setBookmarkedNames] = useState(new Set());
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId || !tableName) {
      setBookmarkedNames(new Set());
      return;
    }

    const col = TABLE_TO_COLUMN[tableName];
    fetchUserBookmarks(userId, tableName)
      .then((rows) => {
        setBookmarkedNames(new Set(rows.map((r) => r[col]).filter(Boolean)));
      })
      .catch((err) => console.error('Error loading bookmarks:', err));
  }, [userId, tableName]);

  const isBookmarked = (itemName) => bookmarkedNames.has(itemName);

  const handleToggleBookmark = async (itemName) => {
    if (!userId) return;

    const wasBookmarked = bookmarkedNames.has(itemName);

    // Update UI immediately
    setBookmarkedNames((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(itemName);
      else next.add(itemName);
      return next;
    });

    try {
      await toggleBookmark(userId, tableName, itemName);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
      // Revert if the database call failed
      setBookmarkedNames((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(itemName);
        else next.delete(itemName);
        return next;
      });
    }
  };

  return { isBookmarked, handleToggleBookmark };
}