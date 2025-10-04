"use client";

import { ModeToggle } from "@/components/theme/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLoggedIn, getUser } from "@/lib/auth";
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

  const user = getUser() ? (getUser() as { uname: string }).uname : "Guest";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/user.svg" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{user}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleClick}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
