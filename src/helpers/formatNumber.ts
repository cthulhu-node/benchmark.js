const formatNumberRE = /(?=(?:\d{3})+$)(?!\b)/g;

export function formatNumber(number: number) {
  const stringifiedNumber = String(number).split('.');
  return stringifiedNumber[0].replace(formatNumberRE, ',') +
    (stringifiedNumber[1]
      ? '.' + stringifiedNumber[1]
      : '');
}
