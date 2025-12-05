import * as recommendationService from "../services/recommendationService.js";

/**
 * Get recommended team members for a task
 * GET /api/recommendations/team/:teamId?serviceType=...&requiredWorkers=...
 */
export const getRecommendedMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { serviceType, requiredWorkers = 1 } = req.query;

    if (!serviceType) {
      return res.status(400).json({ message: "serviceType is required" });
    }

    const recommendations = await recommendationService.recommendTeamMembers(
      serviceType,
      teamId,
      Number(requiredWorkers)
    );

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

