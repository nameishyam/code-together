"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/client-wrapper";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function Home() {
  const { isLoggedIn } = useAuth();

  const handleSessionJoin = (sessionId: string) => {
    window.location.href = `/dashboard/${sessionId}`;
  };

  const handleSessionCreate = () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to create a session.");
      return;
    }
    const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((n) => (n % 10).toString())
      .join("");
    Cookies.set("sessionId", sessionId);
    window.location.href = `/dashboard/${sessionId}`;
  };

  return (
    <div className="min-h-[80vh] bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Welcome to Code Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A real-time collaborative code editor built with Next.js and
            WebSockets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <div className="bg-card border border-border p-6 rounded-lg hover:border-foreground/20 transition-colors">
            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
              Real-time Collaboration
            </h3>
            <p className="text-muted-foreground">
              Create or join coding sessions, write code together, and see
              changes instantly
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg hover:border-foreground/20 transition-colors">
            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
              Multi-language Support
            </h3>
            <p className="text-muted-foreground">
              Supports multiple programming languages with syntax highlighting
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg hover:border-foreground/20 transition-colors">
            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
              Built-in Compiler
            </h3>
            <p className="text-muted-foreground">
              Run and test your code directly in the browser with compiler
              support
            </p>
          </div>
        </div>

        <div className="text-center">
          {isLoggedIn ? (
            <>
              <p className="text-lg text-foreground mb-8">
                Get started by creating a new session or joining an existing
                one!
              </p>
              <div className="flex gap-4 justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="hover: cursor-pointer">
                      Join Session
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Join Session</DialogTitle>
                      <DialogDescription>
                        Enter the session code to join an existing coding
                        session.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const sessionId = formData.get("sessionId") as string;
                        handleSessionJoin(sessionId);
                      }}
                      className="flex flex-col gap-4"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="sessionId">Session Code</Label>
                        <Input
                          id="sessionId"
                          name="sessionId"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                          <Button
                            type="submit"
                            variant="secondary"
                            className="hover: cursor-pointer"
                          >
                            Enter
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={handleSessionCreate}
                  className="hover: cursor-pointer"
                >
                  Create Session
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-foreground mb-8">
                Get started by logging in or signing up!
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  className="hover: cursor-pointer"
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Login
                </Button>
                <Button
                  className="hover: cursor-pointer"
                  onClick={() => {
                    window.location.href = "/signup";
                  }}
                >
                  Signup
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
