'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const LogoutPage =  () => {
    const router = useRouter();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return <div>You have logged out... redirecting in a sec.</div>
};

export default LogoutPage;