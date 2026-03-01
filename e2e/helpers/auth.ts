import { expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WORKER_SUFFIX = `${process.pid}.${Math.floor(Math.random() * 1_000_000)}`;
const ROLE_EMAIL: Record<'staff' | 'superuser', string> = {
  staff: process.env.E2E_STAFF_EMAIL ?? `e2e.staff.${WORKER_SUFFIX}@example.com`,
  superuser: process.env.E2E_SUPERUSER_EMAIL ?? `e2e.superuser.${WORKER_SUFFIX}@example.com`
};
const ROLE_PASSWORD: Record<'staff' | 'superuser', string> = {
  staff: process.env.E2E_STAFF_PASSWORD ?? 'E2eStaff!12345',
  superuser: process.env.E2E_SUPERUSER_PASSWORD ?? 'E2eSuperuser!12345'
};

const ensured = new Set<'staff' | 'superuser'>();

async function ensureAccount(role: 'staff' | 'superuser'): Promise<void> {
  if (ensured.has(role)) return;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for e2e auth setup.');
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  const createRes = await admin.auth.admin.createUser({
    email: ROLE_EMAIL[role],
    password: ROLE_PASSWORD[role],
    email_confirm: true
  });

  let userId: string | null = createRes.data.user?.id ?? null;
  if (createRes.error || !userId) {
    const usersRes = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersRes.error) throw createRes.error ?? usersRes.error;
    const existing = usersRes.data.users.find((u) => u.email?.toLowerCase() === ROLE_EMAIL[role].toLowerCase());
    if (!existing) throw createRes.error ?? new Error('Unable to create or find e2e staff user.');
    userId = existing.id;
    const updateRes = await admin.auth.admin.updateUserById(userId, {
      password: ROLE_PASSWORD[role],
      email_confirm: true
    });
    if (updateRes.error) throw updateRes.error;
  }

  const profileRes = await admin.from('profiles').select('user_id').eq('user_id', userId).maybeSingle();
  if (profileRes.error) throw profileRes.error;

  if (profileRes.data?.user_id) {
    const updateProfileRes = await admin.from('profiles').update({ role }).eq('user_id', userId);
    if (updateProfileRes.error) throw updateProfileRes.error;
  } else {
    const insertProfileRes = await admin.from('profiles').insert({ user_id: userId, role });
    if (insertProfileRes.error) throw insertProfileRes.error;
  }

  ensured.add(role);
}

export async function loginAsRole(page: Page, role: 'staff' | 'superuser'): Promise<void> {
  await ensureAccount(role);

  await page.goto('/');
  await page.getByRole('button', { name: 'Ingresar Staff' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.getByPlaceholder('staff@colegio.cl').fill(ROLE_EMAIL[role]);
  await dialog.getByPlaceholder('••••••••').fill(ROLE_PASSWORD[role]);
  await dialog.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('button', { name: /Salir|Cerrar sesión/ }).first()).toBeVisible({ timeout: 15000 });
}

export async function loginAsStaff(page: Page): Promise<void> {
  await loginAsRole(page, 'staff');
}

export async function loginAsSuperuser(page: Page): Promise<void> {
  await loginAsRole(page, 'superuser');
}
