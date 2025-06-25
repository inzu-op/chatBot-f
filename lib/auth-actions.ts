"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error);
    redirect("/error");
  }

  // Check if profile exists, create if it doesn't
  if (authData.user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.full_name || 'User',
          email: authData.user.email,
          avatar_url: authData.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't redirect on profile error, user can still use the app
      }
    }
  }

  revalidatePath("/", "layout");
  if (authData.user) {
    redirect(`/${authData.user.id}`);
  }
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const data = {
    email: email,
    password: password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        email: email,
      },
    },
  };

  const { data: authData, error: authError } = await supabase.auth.signUp(data);

  if (authError) {
    console.error("Auth error:", authError);
    redirect("/error");
  }

  // Create profile in profiles table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: `${firstName} ${lastName}`,
        email: email,
        avatar_url: null,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't redirect on profile error, user can still use the app
    }
  }

  revalidatePath("/", "layout");
  if (authData.user) {
    redirect(`/${authData.user.id}`);
  }
}

export async function signout() {
  const supabase =await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: true };
  }

  return { url: data.url };
}

export async function makeServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}