import { AnyObject } from "./AnyObject";

export interface Context {
  Array: ArrayConstructor;
  Date: DateConstructor;
  Function: FunctionConstructor;
  Math: Math;
  Object: ObjectConstructor;
  RegExp: RegExpConstructor;
  String: StringConstructor;
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