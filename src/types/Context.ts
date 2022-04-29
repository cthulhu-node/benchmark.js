import { AnyObject } from "./AnyObject";

export interface Context {
  Array: Array<any>;
  Date: Date;
  Function: Function;
  Math: Math;
  Object: Object;
  RegExp: RegExp;
  String: typeof String;
  phantom: any;
  chrome: any;
  chromium: any;
  document: Document;
  navigator: Navigator;
  process: NodeJS.Process;
  runtime: any;
  setTimeout: ((fn: Function, timer: number) => void);
  clearTimeout: ((id?: number) => void);
}

export function getContext(root: AnyObject): Context {
  return {
    Array: root.Array,
    Date: root.Date,
    Function: root.Function,
    Math: root.Math,
    Object: root.Object,
    RegExp: root.RegExp,
    String: root.String,
    phantom: root.phantom,
    chrome: root.chrome,
    chromium: root.chromium,
    document: root.document,
    navigator: root.navigator,
    process: root.process,
    runtime: root.runtime,
    setTimeout: root.setTimeout,
    clearTimeout: root.clearTimeout,
  }
}