// Konfigurasi Supabase
const SUPABASE_URL = 'https://wgcwlxepopidvkifukay.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SNEv1Y_ttCOhkOqrhPy5XQ_izZhVL-e';

// Inisialisasi Klien
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
