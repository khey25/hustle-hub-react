import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetches rows, runs optional search, and groups them by tier
export async function fetchTieredData(tableName, searchQuery = "") {
    let query = supabase.from(tableName).select('*');

    if (searchQuery && searchQuery.trim() !== "") {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
        console.error(`Supabase error fetching ${tableName}:`, error.message);
        throw error;
    }

    const grouped = {};
    (data || []).forEach(item => {
        const tier = item.tier || "Uncategorized";
        if (!grouped[tier]) {
            grouped[tier] = [];
        }
        grouped[tier].push(item);
    });

    return grouped;
}

// Fetches a flat list of rows (for Empire goals and Matchmaker)
export async function fetchFlatData(tableName) {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Supabase error fetching ${tableName}:`, error.message);
        throw error;
    }
    return data || [];
}

// Phase 5 CRUD Operations (Create, Update, Delete)
export async function createRecord(tableName, newRecord) {
    const { data, error } = await supabase.from(tableName).insert([newRecord]).select();
    if (error) throw error;
    return data[0];
}

export async function updateRecord(tableName, primaryKeyColumn, primaryKeyValue, updates) {
    const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq(primaryKeyColumn, primaryKeyValue)
        .select();
    if (error) throw error;
    return data[0];
}

export async function deleteRecord(tableName, primaryKeyColumn, primaryKeyValue) {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(primaryKeyColumn, primaryKeyValue);
    if (error) throw error;
    return true;
}


// (Bookmarks, Owned Assets, Community Reviews)

export const TABLE_TO_COLUMN = {
    gta_businesses: 'business_name',
    gta_heists: 'heist_name',
    gta_contact: 'contact_name',
    gta_goals: 'gta_goal_name',
    stardew_animal_products: 'animal_product_name',
    stardew_artisan_goods: 'artisan_good_name',
    stardew_goals: 'stardew_goal_name',
    stardew_crops: 'crop_name',
};

function getForeignKeyColumn(tableName) {
    const col = TABLE_TO_COLUMN[tableName];
    if (!col) throw new Error(`Unsupported table name: ${tableName}`);
    return col;
}

// 1. Check both Bookmark & Owned status at once (for DetailModal)
export async function checkUserItemStatus(userId, tableName, itemName) {
    if (!userId) return { isBookmarked: false, isOwned: false };
    const col = getForeignKeyColumn(tableName);

    const [bookmarkRes, ownedRes] = await Promise.all([
        supabase
            .from('user_bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq(col, itemName)
            .limit(1),
        supabase
            .from('user_owned_assets')
            .select('id')
            .eq('user_id', userId)
            .eq(col, itemName)
            .limit(1),
    ]);

    if (bookmarkRes.error) throw bookmarkRes.error;
    if (ownedRes.error) throw ownedRes.error;

    return {
        isBookmarked: (bookmarkRes.data || []).length > 0,
        isOwned: (ownedRes.data || []).length > 0,
    };
}

// 2. Bookmarks
export async function fetchUserBookmarks(userId, tableName = null) {
    if (!userId) return [];
    let query = supabase.from('user_bookmarks').select('*').eq('user_id', userId);

    if (tableName) {
        const col = getForeignKeyColumn(tableName);
        query = query.not(col, 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function toggleBookmark(userId, tableName, itemName) {
    const col = getForeignKeyColumn(tableName);

    const { data: existing, error: fetchError } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq(col, itemName)
        .limit(1);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
            .from('user_bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq(col, itemName);
        if (deleteError) throw deleteError;
        return false; // Removed
    } else {
        const { error: insertError } = await supabase
            .from('user_bookmarks')
            .insert([{ user_id: userId, [col]: itemName }]);
        if (insertError) throw insertError;
        return true; // Added
    }
}

// 3. Owned Assets (Empire Portfolio)
export async function fetchUserOwnedAssets(userId, tableName = null) {
    if (!userId) return [];
    let query = supabase.from('user_owned_assets').select('*').eq('user_id', userId);

    if (tableName) {
        const col = getForeignKeyColumn(tableName);
        query = query.not(col, 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function toggleOwnedAsset(userId, tableName, itemName, purchasePrice = null) {
    const col = getForeignKeyColumn(tableName);

    const { data: existing, error: fetchError } = await supabase
        .from('user_owned_assets')
        .select('id')
        .eq('user_id', userId)
        .eq(col, itemName)
        .limit(1);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
            .from('user_owned_assets')
            .delete()
            .eq('user_id', userId)
            .eq(col, itemName);
        if (deleteError) throw deleteError;
        return false; // No longer owned
    } else {
        const { error: insertError } = await supabase
            .from('user_owned_assets')
            .insert([{
                user_id: userId,
                [col]: itemName,
                purchase_price: purchasePrice,
            }]);
        if (insertError) throw insertError;
        return true; // Marked as owned
    }
}

// Shared Relational Join Helper (Joins all 8 game tables via Foreign Keys)
const PROFILE_RELATIONAL_SELECT = `
    *,
    ${Object.keys(TABLE_TO_COLUMN).map(table => `${table}(*)`).join(', ')}
`;

function extractJoinedItem(row) {
    if (!row) return null;
    for (const table of Object.keys(TABLE_TO_COLUMN)) {
        const joined = Array.isArray(row[table]) ? row[table][0] : row[table];
        if (joined) {
            return {
                recordId: row.id,
                tableName: table,
                item: joined,
                raw: row,
            };
        }
    }
    return null;
}

// 4. Community Reviews (Guest 5-cap, Star/Game filters, 12-item pagination, CRUD)
export async function fetchCommunityReviews({
    isGuest = false,
    starFilter = 'all',
    gameFilter = 'all',
    offset = 0,
    limit = 12,
} = {}) {
    let query = supabase
        .from('community_reviews')
        .select(PROFILE_RELATIONAL_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false });

    if (isGuest) {
        query = query.limit(5);
    } else {
        if (starFilter !== 'all') {
            query = query.eq('rating', Number(starFilter));
        }

        if (gameFilter === 'gta') {
            query = query.or(
                'business_name.not.is.null,heist_name.not.is.null,contact_name.not.is.null'
            );
        } else if (gameFilter === 'stardew') {
            query = query.or(
                'crop_name.not.is.null,artisan_good_name.not.is.null,animal_product_name.not.is.null'
            );
        }

        query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
        reviews: (data || []).map(extractJoinedItem).filter(Boolean),
        totalCount: count || 0,
    };
}

export async function createReview(userId, tableName, itemName, rating, reviewText = null) {
    const col = getForeignKeyColumn(tableName);
    const cleanedText = reviewText && reviewText.trim() !== '' ? reviewText.trim() : null;

    const { data, error } = await supabase
        .from('community_reviews')
        .insert([{
            user_id: userId,
            [col]: itemName,
            rating,
            review_text: cleanedText,
        }])
        .select(PROFILE_RELATIONAL_SELECT)
        .single();

    if (error) throw error;
    return extractJoinedItem(data);
}

export async function updateReview(reviewId, rating, reviewText = null) {
    const cleanedText = reviewText && reviewText.trim() !== '' ? reviewText.trim() : null;

    const { data, error } = await supabase
        .from('community_reviews')
        .update({
            rating,
            review_text: cleanedText,
        })
        .eq('id', reviewId)
        .select(PROFILE_RELATIONAL_SELECT)
        .single();

    if (error) throw error;
    return extractJoinedItem(data);
}

export async function deleteReview(reviewId) {
    const { error } = await supabase
        .from('community_reviews')
        .delete()
        .eq('id', reviewId);

    if (error) throw error;
    return true;
}

// 5. Profile Page Relational Fetcher
export async function fetchUserProfileContent(userId) {
    if (!userId) return { owned: [], bookmarked: [], reviews: [] };

    const [ownedRes, bookmarkRes, reviewsRes] = await Promise.all([
        supabase
            .from('user_owned_assets')
            .select(PROFILE_RELATIONAL_SELECT)
            .eq('user_id', userId)
            .order('acquired_at', { ascending: false }),
        supabase
            .from('user_bookmarks')
            .select(PROFILE_RELATIONAL_SELECT)
            .eq('user_id', userId),
        supabase
            .from('community_reviews')
            .select(PROFILE_RELATIONAL_SELECT)
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
    ]);

    if (ownedRes.error) throw ownedRes.error;
    if (bookmarkRes.error) throw bookmarkRes.error;
    if (reviewsRes.error) throw reviewsRes.error;

    return {
        owned: (ownedRes.data || []).map(extractJoinedItem).filter(Boolean),
        bookmarked: (bookmarkRes.data || []).map(extractJoinedItem).filter(Boolean),
        reviews: (reviewsRes.data || []).map(extractJoinedItem).filter(Boolean),
    };
}