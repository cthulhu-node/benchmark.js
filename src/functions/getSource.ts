import { isStringable } from "../helpers/isStringable";

/**
 * Gets the source code of a function.
 */
export function getSource(fn: Function, decompilationSupported: boolean) {
  let result = '';
  if (isStringable(fn)) {
    result = String(fn);
  } else if (decompilationSupported) {
    // Escape the `{` for Firefox 1.
    result = /^[^{]+\{([\s\S]*)\}\s*$/.exec(fn as unknown as string)[1];
  }
  // Trim string.
  result = (result || '').replace(/^\s+|\s+$/g, '');

  // Detect strings containing only the "use strict" directive.
  return /^(?:\/\*[\w\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result)
    ? ''
    : result;
}
