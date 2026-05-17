import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myvmvctteapfmuwgavgs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const neighborhoods = [
    { name: 'Outros', delivery_fee: 10.00 },
    { name: 'Vila Costa do Sol', delivery_fee: 6.00 },
    { name: 'Vila Marcelino', delivery_fee: 5.00 },
    { name: 'Jardim São Carlos', delivery_fee: 6.00 },
    { name: 'Parque Arnold Schatch', delivery_fee: 7.00 },
    { name: 'Jardim Nova São Carlos', delivery_fee: 7.00 },
    { name: 'Jardim Centenário', delivery_fee: 8.00 },
    { name: 'Cidade Universitária', delivery_fee: 6.00 },
    { name: 'Jardim Bandeirantes', delivery_fee: 6.00 },
    { name: 'Jardim Pacaembu', delivery_fee: 7.00 },
    { name: 'Vila Marina', delivery_fee: 5.00 },
    { name: 'Jardim Macarengo', delivery_fee: 5.00 },
    { name: 'Jardim Beatriz', delivery_fee: 8.00 },
    { name: 'Parque Sabará', delivery_fee: 7.00 },
    { name: 'Jardim das Torres', delivery_fee: 9.00 },
    { name: 'Vila Carmem', delivery_fee: 6.00 },
    { name: 'Jardim Ricetti', delivery_fee: 6.00 },
    { name: 'Jardim Tangará', delivery_fee: 7.00 },
    { name: 'Jardim Medeiros', delivery_fee: 8.00 },
    { name: 'Azulville', delivery_fee: 8.00 },
    { name: 'Jardim Hikare', delivery_fee: 7.00 }
  ];

  for (const n of neighborhoods) {
    const { error } = await supabase.from('neighborhoods').insert([n]);
    if (error && error.code !== '23505') {
      console.error('Error inserting', n.name, error);
    }
  }
  console.log('Done inserting neighborhoods');
}

run();
