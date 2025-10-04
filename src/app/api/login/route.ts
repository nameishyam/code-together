import { supabaseServer } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { uname, password } = await req.json();
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("uname", uname)
      .single();
    if (error || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 400 }
      );
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({ message: "Login successful", user: { uname: user.uname, email: user.email } }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
