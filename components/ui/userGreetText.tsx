"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "./button";
import Link from "next/link";

const UserGreetText = ({ className }: { className?: string }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className={`flex items-center justify-end w-full lg:w-auto ${className}`}>
      {isLoading ? (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Loading...
        </span>
      ) : user ? (
        <div className=" items-center">
          {/* <span className="text-[10px] md:text-[13px] font-semibold text-black dark:text-white">
            Hello,{" "}
            <span className="font-mono text-black dark:text-white">
              {user.user_metadata?.full_name || user.email || "User"}
            </span>
          </span> */}
          {/* <Button
            className="bg-red-600 hover:bg-red-700 text-white shadow-md"
            onClick={handleLogout}
          >
            Logout
          </Button> */}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" passHref>
            <Button
              asChild
              className="p-5"
            >
              <a>Login</a>
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button
              asChild
              className="p-5"
            >
              <a>Signup</a>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserGreetText;