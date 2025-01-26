export const transformDates = <T extends unknown>(obj: T): T => {
    if (!obj) return obj;
    
    if (obj instanceof Date) {
      return obj.toISOString() as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => transformDates(item)) as T;
    }
    
    if (typeof obj === 'object') {
      const transformed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        transformed[key] = transformDates(value);
      }
      return transformed as T;
    }
    
    return obj;
  };