import { isHostType } from "./helpers/isHostType";
import { freeDefine, root } from "./Environment";
import { Context } from "./types/Context";

/**
 * An object used to flag environments/features.
 *
 * @type {Object}
 */
export interface Support {

  /**
   * Detect if running in a browser environment.
   *
   * @type {boolean}
   */
  browser: boolean;

  /**
   * Test if able to run a snippet of JavaScript via script injection.
   *
   * @type {boolean}
   */
  canInjectScript: boolean;
  /**
   * Detect if the Timers API exists.
   *
   * @type {boolean}
   */
  timeout: boolean;

  /**
   * Detect if function decompilation is support.
   *
   * @type {boolean}
   */
  decompilation: boolean;
}

export function getSupport(context: Context): Support {
  let decompilation = false;
  try {
    // Safari 2.x removes commas in object literals from `Function#toString` results.
    // See http://webk.it/11609 for more details.
    // Firefox 3.6 and Opera 9.25 strip grouping parentheses from `Function#toString` results.
    // See http://bugzil.la/559438 for more details.
    decompilation = Function(
      ('return (' + (function (x) { return { 'x': '' + (1 + x) + '', 'y': 0 }; }) + ')')
        // Avoid issues with code added by Istanbul.
        .replace(/__cov__[^;]+;/g, '')
    )()(0).x === '1';
  } catch (e) { }

  return {
    browser: isHostType(context, 'document') && context.document && isHostType(context, 'navigator') && !isHostType(context, 'phantom'),
    timeout: isHostType(context, 'setTimeout') && isHostType(context, 'clearTimeout'),
    canInjectScript: freeDefine ? (root.define.amd !== undefined) : (root.Benchmark !== undefined),
    decompilation,
  }
}
