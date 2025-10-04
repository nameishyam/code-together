"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    uname: ``,
    email: ``,
    password: ``,
  });
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log(res);
      const data = await res.json();
      if (res.status === 400 || !res.ok) {
        toast.error(data.error || "Username already exists");
        return;
      }
      toast.success("User created successfully!");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>
            Enter your email below to create a new account
          </CardDescription>
          <CardAction>
            <Button variant="link">
              <a href="/login">Login</a>
            </Button>
          </CardAction>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="uname">Username</Label>
                  <Input
                    id="text"
                    type="text"
                    placeholder="xyz"
                    required
                    value={formData.uname}
                    onChange={(e) =>
                      setFormData({ ...formData, uname: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </CardFooter>
          </div>
        </form>
      </Card>
    </div>
  );
}
