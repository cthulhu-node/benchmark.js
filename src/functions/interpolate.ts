import { AnyObject } from "../AnyObject";

const numbeRE =  /\d+/;
const poundRE = /\#/g;
/**
 * Interpolates a given template string.
 */
export function interpolateByTemplateData(templateData: AnyObject) {
  const interpolationRegExp = {};

  return function (value) {

    // Replaces all occurrences of `#` with a unique number and template tokens with content.
    var result = value.replace(poundRE, numbeRE.exec(templateData.uid));
    var keys = Object.keys(templateData);
    for (var i = 0, il = keys.length; i < il; ++i) {
      if (result.indexOf('${' + keys[i] + '}') === -1) {
        continue;
      }

      result = result.replace(
        interpolationRegExp[keys[i]] || (interpolationRegExp[keys[i]] = new RegExp('\\$\\{' + keys[i] + '\\}', 'g')),
        templateData[keys[i]]
      );
    }
    return result;
  }
}