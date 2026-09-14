export const getCurrentUser = async (req, res) => {
    try{
        return await res.json(req.user);
    }catch(error){
        console.error("Error getting current user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}