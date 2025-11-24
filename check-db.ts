import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars from .env.local manually since we are running a script
import fs from 'fs';
import path from 'path';

const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.local')));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking connection to:', envConfig.NEXT_PUBLIC_SUPABASE_URL);
    const { data, error } = await supabase.from('groups').select('id').limit(1);

    if (error) {
        console.error('❌ Error accessing groups table:', error.message);
        if (error.code === '42P01') {
            console.error('   -> This means the table "groups" does not exist. You need to run the SQL migration.');
        }
    } else {
        console.log('✅ Connection successful! "groups" table exists.');
    }
}

check();
