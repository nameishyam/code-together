export default async function doWake() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/wake`, {
      method: "GET",
    });
    if (res.ok) {
      console.log("server mounted");
    }
  } catch (error) {
    console.log(error);
  }
}
