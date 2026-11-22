import { withAuth } from "@/lib/api";

export default withAuth(async (req, res) => {
  res.status(200).json({ user_id: req.user.user_id, username: req.user.username });
}, { methods: ["GET"] });
