/*
 * Supabase browser client
 *
 * IMPORTANT:
 *
 * This file is loaded by the browser.
 *
 * Only use your Supabase:
 *
 * - Project URL
 * - Publishable/anon key
 *
 * DO NOT put your service-role key here.
 */

const SUPABASE_URL =
    "https://pwbpynyqdivryqcyerzt.supabase.co";


const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3YnB5bnlxZGl2cnlxY3llcnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NDQ5MDYsImV4cCI6MjEwNTEyMDkwNn0.cgvQs8cM4VyVWFvqwUC0HBmJM3zp_ibS_lfbOSoU-Kg";


/*
 * Create Supabase client
 */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );