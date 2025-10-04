import { supabaseServer } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { sendMailServices } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { uname, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabaseServer
      .from("users")
      .insert([{ uname, email, password: hashedPassword }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    const token = signToken({ id: data.id, uname: data.uname });
    const info = await sendMailServices(
      data.email,
      "Welcome to Code Together!",
      `Hello ${data.uname},\n\nThank you for signing up for Code Together! We're excited to have you on board.\n\nBest regards,\nSyam Gowtham 😊`
    );
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        token,
        user: { uname: data.uname, email: data.email },
        info,
      }),
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
