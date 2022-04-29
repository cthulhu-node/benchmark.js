export function has(obj: {[key: string]: any; }, key: string) {
    if (!obj) {
      return;
    }
  
    const keyParts: string[] = Array.isArray(key)
      ? key
      : key.indexOf('.') === -1 ? [key] : key.split('.');
  
    return !!obj && (
      keyParts.length > 1
        ? has(obj[keyParts[0]], keyParts.slice(1).join('.'))
        : obj.hasOwnProperty(key)
    );
  }