import * as slaService from "../services/slaService.js";
import Request from "../models/Request.js";

/**
 * Check SLA status for a specific request
 * GET /api/sla/request/:requestId
 */
export const checkRequestSLA = async (req, res) => {
  try {
    const { requestId } = req.params;
    const slaStatus = await slaService.checkSLA(requestId);
    res.json(slaStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Check all SLA breaches for a department
 * GET /api/sla/breaches?departmentId=...
 */
export const getSLABreaches = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const breaches = await slaService.checkAllSLAs(departmentId || null);
    res.json({ breaches, count: breaches.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get SLA hours for a category
 * GET /api/sla/hours?serviceType=...&departmentId=...
 */
export const getSLAHours = async (req, res) => {
  try {
    const { serviceType, departmentId } = req.query;
    if (!serviceType) {
      return res.status(400).json({ message: "serviceType is required" });
    }
    const hours = await slaService.getSLAHours(serviceType, departmentId);
    res.json({ serviceType, departmentId, slaHours: hours });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

