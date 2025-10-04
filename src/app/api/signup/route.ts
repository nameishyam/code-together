import { supabaseServer } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { uname, email, password } = await req.json();
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("uname")
      .eq("uname", uname)
      .single();
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already exists" }), {
        status: 400,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabaseServer.from("users").insert([
      {
        uname,
        email,
        password: hashedPassword,
      },
    ]);
    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(error.message);
    }
    return new Response(JSON.stringify({ message: "User created", data }), {
      status: 201,
    });
  } catch (error: unknown) {
    let errorMsg = "";
    if (error instanceof Error && error.message) {
      errorMsg = error.message;
    } else {
      errorMsg = "An unknown error occurred";
    }
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
    });
  }
}
