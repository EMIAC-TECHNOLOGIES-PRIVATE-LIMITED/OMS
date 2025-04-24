
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/sitesDataTypes';
import { httpClient } from '../utils/httpClient';



const modelRateLimits: Record<string, number> = {
  'Order': 150,
  'default': 150,
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
      try {
        const url = process.env.RATE_LIMITER_URL || 'http://localhost:3000/rate-limiter';
        const data = {
          user: req.user?.email,
          tabel: modelName,
          count: userTracking.count,
        };

        httpClient.post(url, data)
          .then((response) => {

          })
          .catch((error) => {
            console.error('Error sending rate limit data:', error);
          });
      } catch (error) {
        console.error('Error sending rate limit data:', error);
      }
    }

    userTracking.count++;
    next();
  };
};
