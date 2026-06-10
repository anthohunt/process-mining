/**
 * Create the admin user in the fresh Supabase project.
 * Usage: SUPABASE_URL=.. SERVICE_KEY=.. ADMIN_PW=.. node scripts/create-admin.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SERVICE_KEY;
const PW = process.env.ADMIN_PW;
const EMAIL = 'admin@cartopm.fr';
if (!URL || !KEY || !PW) { console.error('Missing env'); process.exit(1); }

const admin = createClient(URL, KEY, { auth: { persistSession: false } });

(async () => {
  // already exists?
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find(u => u.email === EMAIL);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: PW, email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: 'admin' },
      app_metadata: { ...existing.app_metadata, role: 'admin' },
    });
    console.log('✅ admin updated:', EMAIL);
    return;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL, password: PW, email_confirm: true,
    user_metadata: { role: 'admin' }, app_metadata: { role: 'admin' },
  });
  if (error) throw error;
  console.log('✅ admin created:', data.user.email, '| role:', data.user.user_metadata.role);
})().catch(e => { console.error('❌', e.message || e); process.exit(1); });
