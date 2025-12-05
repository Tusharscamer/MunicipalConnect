/**
 * OTP Service for mobile authentication
 * In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
 */

// In-memory store for OTPs (use Redis in production)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number
 * @param {String} phone - Phone number
 * @param {String} otp - OTP code
 * @returns {Promise<Boolean>} Success status
 */
export const sendOTP = async (phone, otp) => {
  try {
    // TODO: Integrate with SMS gateway
    // For now, log the OTP (in production, send via SMS)
    console.log(`[OTP Service] OTP for ${phone}: ${otp}`);
    
    // Store OTP with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpStore.set(phone, { otp, expiresAt });
    
    // In production, use actual SMS service:
    // await smsService.sendSMS(phone, `Your MunicipalConnect OTP is: ${otp}. Valid for 5 minutes.`);
    
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};

/**
 * Verify OTP
 * @param {String} phone - Phone number
 * @param {String} otp - OTP code to verify
 * @returns {Boolean} Verification status
 */
export const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);
  if (!stored) {
    return false;
  }
  
  if (new Date() > stored.expiresAt) {
    otpStore.delete(phone);
    return false; // OTP expired
  }
  
  if (stored.otp !== otp) {
    return false; // Invalid OTP
  }
  
  // OTP verified, remove it
  otpStore.delete(phone);
  return true;
};

/**
 * Clear expired OTPs (cleanup function)
 */
export const clearExpiredOTPs = () => {
  const now = new Date();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
};

// Cleanup expired OTPs every 10 minutes
setInterval(clearExpiredOTPs, 10 * 60 * 1000);

