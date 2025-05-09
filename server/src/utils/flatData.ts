export const flattenData = (
    data: Object[],
    resource: string,
    availableColumnsType: Record<string, any>
  ): Record<string, any>[] => {
    const flattenObject = (obj: Object, prefix: string = ''): Record<string, any> => {
      return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value === null) {
          const finalKey = prefix ? `${prefix.split('.').pop()}.${key}` : `${resource}.${key}`;
          acc[finalKey] = null;
        } else if (typeof value === 'bigint') {
          // Convert BigInt to string to make it serializable
          const finalKey = prefix ? `${prefix.split('.').pop()}.${key}` : `${resource}.${key}`;
          acc[finalKey] = value.toString();
        } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          Object.assign(acc, flattenObject(value, newKey));
        } else {
          const finalKey = prefix ? `${prefix.split('.').pop()}.${key}` : `${resource}.${key}`;
          acc[finalKey] = value;
        }
        return acc;
      }, {});
    };
  
    const sortObjectKeysByReference = (
      subset: Record<string, any>,
      reference: Record<string, any>
    ): Record<string, any> => {
      const sorted: Record<string, any> = {};
      
      for (const refKey of Object.keys(reference)) {
        // Match by the last two parts of the key
        const refKeyParts = refKey.split('.');
        const refKeyEnd = refKeyParts.slice(-2).join('.');
        
        for (const subsetKey of Object.keys(subset)) {
          const subsetKeyParts = subsetKey.split('.');
          const subsetKeyEnd = subsetKeyParts.slice(-2).join('.');
          
          if (subsetKeyEnd === refKeyEnd) {
            sorted[subsetKey] = subset[subsetKey];
            delete subset[subsetKey];
            break;
          }
        }
      }
      
      // Add any remaining keys
      Object.assign(sorted, subset);
      
      return sorted;
    };
  
    return data.map((obj) => {
      const flattened = flattenObject(obj);
      return sortObjectKeysByReference(flattened, availableColumnsType);
    });
  };
  
