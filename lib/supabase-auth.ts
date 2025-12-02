'use client';

import { createClient } from '@/utils/supabase/client';

export async function signIn(email: string, password: string) {
    const supabase = createClient();
    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
    const supabase = createClient();
    return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
    const supabase = createClient();
    return await supabase.auth.signOut();
}

export async function getUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function updatePassword(newPassword: string) {
    const supabase = createClient();
    return await supabase.auth.updateUser({ password: newPassword });
}
