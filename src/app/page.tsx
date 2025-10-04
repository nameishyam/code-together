"use client";

import { Button } from "@/components/ui/button";

export default function Home() {
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
          <p className="text-lg text-foreground mb-8">
            Get started by creating a new session or joining an existing one!
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
        </div>
      </div>
    </div>
  );
}
