export default function roleMiddleware(allowed = []) {
  // allowed: array of roles e.g. ['admin','clerk']
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (allowed.length === 0 || allowed.includes(req.user.role)) return next();
    return res.status(403).json({ error: "Forbidden - insufficient role" });
  };
}
