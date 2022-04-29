/** Used as a reference to the global object. */
let root: any = ((typeof window === 'function' || typeof window === 'object') && window) || this;

/** Detect free variable `define`. */
// @ts-ignore
const freeDefine = typeof define === 'function' && typeof define.amd === 'object' && define.amd && define;

/** Detect free variable `exports`. */
// @ts-ignore
const freeExports = (typeof exports === 'function' || typeof exports === 'object') && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
// @ts-ignore
const freeModule = (typeof module === 'function' || typeof module === 'object') && module && !module.nodeType && module;

/** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
// @ts-ignore
const freeGlobal = freeExports && freeModule && typeof global === 'object' && global;
if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
}

export {
    freeDefine,
    freeExports,
    freeGlobal,
    freeModule,
    root,
}
