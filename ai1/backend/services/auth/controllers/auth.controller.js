import { getAuth } from "firebase-admin/auth";
import app from "../config/firebase.js";
import User from "../models/user.js";
import redisClient from "../../../shared/redis.js";

export const login = async (req, res) => {
  try {
    const token = req.body.idToken || req.body.token;
    const bodyName = req.body.name; // Read name from request body

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const decodedToken = await getAuth(app).verifyIdToken(token);
    const session = crypto.randomUUID();

    // Fallback: body name -> decodedToken name -> email username -> "User"
    const resolvedName =
      bodyName ||
      decodedToken.name ||
      decodedToken.email?.split("@")[0] ||
      "User";

    let user = await User.findOne({ fireBaseId: decodedToken.uid });
    if (!user) {
      user = await User.create({
        name: resolvedName,
        email: decodedToken.email,
        fireBaseId: decodedToken.uid,
        avatar: decodedToken.picture || "",
      });
    } else if (!user.name || user.name === "User") {
      // Update name if it was previously unset
      user.name = resolvedName;
      await user.save();
    }

    await redisClient.set(
      `session:${session}`,
      JSON.stringify({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatar,
      }),
      "EX",
      60 * 60 * 24 * 7
    );

    res.cookie("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try{
    const session = req.cookies?.session;
    if (!session) {
      return res.status(400).json({ error: "No session found" });
    }

    await redisClient.del(`session: ${session} `);
    res.clearCookie("session");

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}