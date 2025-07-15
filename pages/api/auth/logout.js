export default async function handler(req, res) {
  const token = req.cookies.token;

  try {
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0");

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
