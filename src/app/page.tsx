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
import { useAuth } from "@/components/client-wrapper";
import { toast } from "sonner";

export default function Home() {
  const { isLoggedIn } = useAuth();

  const handleSessionJoin = () => {
    toast.error("Feature coming soon!");
  };

  const handleSessionCreate = () => {
    toast.error("Feature coming soon!");
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
                    <Button variant="outline">Join Session</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Join Session</DialogTitle>
                      <DialogDescription>
                        Enter the session code to join an existing coding
                        session.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="text" className="sr-only">
                          Session Code
                        </Label>
                        <Input id="text" placeholder="••••••••" />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleSessionJoin}
                        >
                          Enter
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleSessionCreate}>Create Session</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-foreground mb-8">
                Get started by logging in or signing up!
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors border border-border"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Login
                </Button>
                <Button
                  className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors border border-border"
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
