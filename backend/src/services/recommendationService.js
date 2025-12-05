import User from "../models/User.js";
import Team from "../models/Team.js";
import Request from "../models/Request.js";

/**
 * Recommend team members based on skills, availability, and shift timing
 * @param {String} serviceType - The service type/category of the request
 * @param {String} teamId - The team ID to get members from
 * @param {Number} requiredWorkers - Number of workers needed
 * @returns {Array} Recommended team members sorted by match score
 */
export const recommendTeamMembers = async (serviceType, teamId, requiredWorkers = 1) => {
  try {
    // Get the team and its members
    const team = await Team.findById(teamId).populate("members");
    if (!team || !team.members) {
      return [];
    }

    // Map service types to skills (can be extended)
    const serviceTypeToSkills = {
      "Pothole": ["plumber", "electrician", "general"],
      "Streetlight": ["electrician"],
      "Water Supply": ["plumber"],
      "Sanitation": ["cleaner", "general"],
      "Solid Waste": ["cleaner", "general"],
      "Roads": ["plumber", "general"],
      "Drainage": ["plumber", "general"],
    };

    const requiredSkills = serviceTypeToSkills[serviceType] || ["general"];
    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    // Score each member
    const scoredMembers = team.members
      .filter((member) => member.role === "team_member")
      .map((member) => {
        let score = 0;

        // Skill match (40% weight)
        const memberSkills = member.skills || [];
        const skillMatches = requiredSkills.filter((skill) =>
          memberSkills.some((ms) => ms.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ms.toLowerCase()))
        );
        score += (skillMatches.length / requiredSkills.length) * 40;

        // Availability (30% weight)
        const availability = member.availability || { status: "available" };
        if (availability.status === "available") {
          score += 30;
        } else if (availability.status === "busy") {
          // Check if busy period has ended
          if (availability.until && new Date(availability.until) < now) {
            score += 30;
          } else {
            score += 10; // Partially available
          }
        } else {
          score += 0; // Unavailable
        }

        // Shift timing (30% weight)
        const shiftTiming = member.shiftTiming || {};
        if (shiftTiming.days && shiftTiming.days.includes(currentDay)) {
          if (shiftTiming.start && shiftTiming.end) {
            const startTime = shiftTiming.start;
            const endTime = shiftTiming.end;
            if (currentTime >= startTime && currentTime <= endTime) {
              score += 30; // Currently in shift
            } else {
              score += 15; // On shift today but not currently
            }
          } else {
            score += 20; // Has shift today but no specific times
          }
        } else {
          score += 5; // Not on shift today
        }

        // Check current workload (bonus/penalty)
        // Count active tasks assigned to this member
        // This would require querying requests, but for now we'll skip it for performance

        return {
          member,
          score,
          skillMatches: skillMatches.length,
          availability: availability.status,
          inShift: shiftTiming.days?.includes(currentDay) || false,
        };
      })
      .filter((item) => item.score > 0) // Only include members with some match
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, requiredWorkers * 2); // Return top candidates (2x required for flexibility)

    return scoredMembers.map((item) => ({
      member: {
        _id: item.member._id,
        name: item.member.name,
        email: item.member.email,
        skills: item.member.skills,
        availability: item.member.availability,
        shiftTiming: item.member.shiftTiming,
      },
      score: item.score,
      skillMatches: item.skillMatches,
      availability: item.availability,
      inShift: item.inShift,
    }));
  } catch (error) {
    console.error("Error recommending team members:", error);
    return [];
  }
};

