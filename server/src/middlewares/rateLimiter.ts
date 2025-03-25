
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/sitesDataTypes';


const modelRateLimits: Record<string, number> = {
  'Order': 100,
  'default': 60 
};

const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes


export const dataRateLimiter = () => {
  const modelRequestCounts: Record<string, Record<string, { count: number, resetTime: number }>> = {};

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId || 'anonymous';
    const modelName = req.modelName || 'unknown';
    
    // Initialize tracking for this model if it doesn't exist
    if (!modelRequestCounts[modelName]) {
      modelRequestCounts[modelName] = {};
    }
    
    // Initialize or get user tracking for this model
    if (!modelRequestCounts[modelName][userId]) {
      modelRequestCounts[modelName][userId] = {
        count: 0,
        resetTime: Date.now() + TIME_WINDOW
      };
    }
    
    const userTracking = modelRequestCounts[modelName][userId];
    
    // Reset counter if time window has passed
    if (Date.now() > userTracking.resetTime) {
      userTracking.count = 0;
      userTracking.resetTime = Date.now() + TIME_WINDOW;
    }
    
    // Get appropriate limit for this model
    const limit = modelRateLimits[modelName] || modelRateLimits.default;
    
    // Check if user has exceeded the limit
    if (userTracking.count >= limit) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Try again later`
      });
    }
    
    // Increment the counter
    userTracking.count++;

    next();
  };
};
