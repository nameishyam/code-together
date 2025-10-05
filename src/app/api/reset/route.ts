import { sendMailServices } from "@/lib/email";
import { supabaseServer } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";
export async function PATCH(req: Request) {
  try {
    const { email, newPassword } = await req.json();
    const { data: existingUser, error: fetchError } = await supabaseServer
      .from("users")
      .select("id, uname")
      .eq("email", email)
      .single();
    if (fetchError || !existingUser) {
      return new Response(
        JSON.stringify({ error: "No user found with this email" }),
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabaseServer
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
      });
    }
    const info = await sendMailServices(
      email,
      "Password Reset Successful",
      `Hello ${existingUser.uname},\n\nYour password has been successfully reset.`
    );
    return new Response(
      JSON.stringify({ message: "Password reset successful", info }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
