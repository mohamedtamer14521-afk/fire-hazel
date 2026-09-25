/**
 * HAZEL // SUPABASE PRODUCTION CLIENT & CLOUD DATA ENGINE
 * Egyptian Streetwear Brand • @fire_hazel1 • Cairo Flagship Atelier
 */

const SUPABASE_STORAGE_URL_KEY = 'hazel_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'hazel_supabase_anon_key';
const SUPABASE_BUCKET_NAME = 'product-media';

// Default / Embedded Fallback Config (Can be overwritten in Admin -> Connect Cloud)
const DEFAULT_SUPABASE_URL = 'https://ddyvrbunikuamfdhvhew.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-DMZQ90UJXci-zEhgtzB6w_kjNwhSkD';

let _supabaseInstance = null;

/**
 * Initialize or Retrieve Supabase Client Instance
 */
function getSupabase() {
  if (_supabaseInstance) return _supabaseInstance;

  const url = localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;

  if (url && anonKey && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      _supabaseInstance = window.supabase.createClient(url.trim(), anonKey.trim());
      return _supabaseInstance;
    } catch (err) {
      console.warn('Supabase initialization failed:', err);
      return null;
    }
  }
  return null;
}

/**
 * Check if Supabase connection is actively configured
 */
function isSupabaseConfigured() {
  const url = localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.includes('supabase.co') && anonKey.length > 20);
}

/**
 * Save Supabase Credentials
 */
function saveSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim());
  if (anonKey) localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
  _supabaseInstance = null; // Reset cached client
}

/**
 * Clear Supabase Credentials (Disconnect)
 */
function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
  localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
  _supabaseInstance = null;
}

/**
 * Fetch All Products from Supabase `products` Table
 */
async function fetchProductsFromCloud() {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching products from Supabase:', error);
      return null;
    }

    // Map database column names to local camelCase product schema
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      category: row.category || 'Outerwear',
      tag: row.tag,
      price: Number(row.price),
      sizes: row.sizes || ['S', 'M', 'L'],
      primaryImage: (row.images && row.images[0]) ? row.images[0] : './puffer-front.jpg',
      secondaryImage: (row.images && row.images[1]) ? row.images[1] : '',
      images: row.images || [],
      status: row.status || 'DROP 004 // ACTIVE',
      statusType: row.status_type || 'badge-warning',
      inStock: row.in_stock !== false,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('Supabase products fetch failed:', err);
    return null;
  }
}

/**
 * Upsert Product into Supabase `products` Table
 */
async function upsertProductInCloud(product) {
  const sb = getSupabase();
  if (!sb) return null;

  // Build images array preserving staged order
  let images = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images.filter(img => typeof img === 'string' && img.trim().length > 0);
  } else {
    if (product.primaryImage) images.push(product.primaryImage);
    if (product.secondaryImage && !images.includes(product.secondaryImage)) images.push(product.secondaryImage);
  }

  const payload = {
    title: product.title,
    category: product.category || 'Outerwear',
    tag: product.tag,
    price: Number(product.price),
    sizes: product.sizes || ['S', 'M', 'L'],
    images: images,
    status: product.status || 'DROP 004 // ACTIVE',
    status_type: product.statusType || 'badge-warning',
    in_stock: product.inStock !== false,
    updated_at: new Date().toISOString()
  };

  // If UUID exists and is valid, include id for update
  if (product.id && product.id.length === 36 && product.id.includes('-')) {
    payload.id = product.id;
  }

  try {
    const { data, error } = await sb
      .from('products')
      .upsert(payload)
      .select();

    if (error) {
      console.error('Error upserting product in Supabase:', error);
      throw error;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('Failed to save product to Supabase cloud:', err);
    throw err;
  }
}

/**
 * Delete Product from Supabase `products` Table
 */
async function deleteProductFromCloud(id) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete failed:', err);
    return false;
  }
}

/**
 * Toggle Product In-Stock Status in Supabase
 */
async function toggleProductStockInCloud(id, inStock) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('products')
      .update({ in_stock: inStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating stock in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Stock update failed:', err);
    return false;
  }
}

/**
 * Upload Image to Supabase Storage `product-media` Bucket
 */
async function uploadImageToStorage(file) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client is not configured.');

  const fileExt = file.name.split('.').pop();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedFileName}`;

  try {
    const { data, error } = await sb.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    // Get Public URL
    const { data: urlData } = sb.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase storage:', err);
    throw err;
  }
}

/**
 * Upload Showroom Gallery Image to Supabase Storage `product-media/showroom/`
 */
async function uploadShowroomMediaToStorage(file) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client is not configured.');

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `showroom/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedFileName}`;

  try {
    const { data, error } = await sb.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase showroom upload error:', error);
      throw error;
    }

    const { data: urlData } = sb.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload showroom image to Supabase storage:', err);
    throw err;
  }
}

/**
 * Admin Authentication Gateways via Supabase Auth
 */
async function signInAdmin(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client is not configured.');

  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password: password
  });

  if (error) {
    console.error('Admin Sign In error:', error);
    throw error;
  }
  return data;
}

async function signOutAdmin() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

async function getAdminSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data && data.session ? data.session : null;
}

function onAuthStateChange(callback) {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.auth.onAuthStateChange(callback);
}

/**
 * Fetch Site Settings (Live Text Content CMS) from Supabase
 */
async function fetchSiteSettingsFromCloud() {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('site_settings')
      .select('*')
      .eq('id', 'main_config')
      .single();

    if (error) {
      console.warn('Error fetching site_settings from Supabase:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase site_settings fetch failed:', err);
    return null;
  }
}

/**
 * Update Site Settings in Supabase
 */
async function updateSiteSettingsInCloud(settings) {
  const sb = getSupabase();
  if (!sb) return null;

  const payload = {
    id: 'main_config',
    ticker_text: settings.ticker_text,
    hero_headline: settings.hero_headline,
    hero_subheadline: settings.hero_subheadline,
    showroom_hours: settings.showroom_hours,
    showroom_coords: settings.showroom_coords,
    showroom_address: settings.showroom_address,
    developer_credit: settings.developer_credit,
    developer_phone: settings.developer_phone,
    whatsapp_number: settings.whatsapp_number,
    vip_alert_status: settings.vip_alert_status,
    showroom_gallery: Array.isArray(settings.showroom_gallery) ? settings.showroom_gallery : [],
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await sb
      .from('site_settings')
      .upsert(payload)
      .select();

    if (error) {
      console.error('Error saving site_settings in Supabase:', error);
      throw error;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('Failed to update site settings in Supabase:', err);
    throw err;
  }
}

// Global Export
window.HazelSupabase = {
  getSupabase,
  isSupabaseConfigured,
  saveSupabaseConfig,
  clearSupabaseConfig,
  fetchProductsFromCloud,
  upsertProductInCloud,
  deleteProductFromCloud,
  toggleProductStockInCloud,
  uploadImageToStorage,
  uploadShowroomMediaToStorage,
  signInAdmin,
  signOutAdmin,
  getAdminSession,
  onAuthStateChange,
  fetchSiteSettingsFromCloud,
  updateSiteSettingsInCloud
};
