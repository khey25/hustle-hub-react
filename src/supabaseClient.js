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