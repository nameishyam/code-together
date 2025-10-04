"use client";

import { ModeToggle } from "@/components/theme/ModeToggle";
import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { toast } from "sonner";

export default function Navbar() {
  const handleClick = () => {
    if (isLoggedIn()) {
      localStorage.clear();
      window.location.href = "/login";
    } else {
      toast.error("You are not logged in");
    }
  };

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 border-b">
      <button
        className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Code Together
      </button>
      <div className="flex items-center gap-2">
        {isLoggedIn() ? (
          <Button
            className="hover:bg-red-600 dark:hover:bg-red-400"
            onClick={handleClick}
          >
            Logout
          </Button>
        ) : (
          <Button onClick={() => (window.location.href = "/login")}>
            Login
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
