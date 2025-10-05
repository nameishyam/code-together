import { sendMailServices } from "@/lib/email";

const sendOTP = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const info = await sendMailServices(
    email,
    "Your OTP Code",
    `Your OTP code is: ${otp}. It is valid for 10 minutes.`
  );
  return { otp, info };
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const { info, otp } = await sendOTP(email);
    return new Response(JSON.stringify({ message: "OTP sent", info, otp }), {
      status: 200,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
