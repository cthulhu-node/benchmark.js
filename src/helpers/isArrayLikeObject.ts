export function isArrayLikeObject(value: any): value is ArrayLike<any> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'length' in value &&
      typeof value.length === 'number' &&
      value.length > -1 &&
      value.length % 1 === 0 &&
      value.length <= Number.MAX_SAFE_INTEGER
    )
  }
  