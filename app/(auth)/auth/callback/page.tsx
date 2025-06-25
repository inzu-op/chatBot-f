"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace(`/${user.id}/dashboard`);
      } else {
        router.replace("/login");
      }
    };
    checkUser();
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center text-center p-4">Signing you in...</div>;
} 