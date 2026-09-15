import redisClient from "../../../shared/redis.js";

export  const protect = async(req, res, next) => {
 try{
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionData = await redisClient.get(`session: ${sessionId} `);
    if(!sessionData) {
      return res.status(401).json({ error: "Session Expired" });
    }
    req.user = JSON.parse(sessionData);
    next();
 }catch(error){
    console.error("Error in auth middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
 }
}