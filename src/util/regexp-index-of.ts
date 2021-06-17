/**
 * Like String.prototype.indexOf(), but with a regular expression.
 * I.e. find the first matching index of the given RegExp, with the possibility to define a starting index.
 *
 * @param {string} str The subject.
 * @param {RegExp} regexp The regular expression to search for.
 * @param {?number} position Optionally, a start index.
 * @returns {number} The position at which the RegExp first matched, or -1 if no match was found.
 */
export function regexpIndexOf (str: string, regexp: RegExp, position?: number): number {
  if (position == null || position === 0) {
    return str.search(regexp)
  }
  const subIndex = str.slice(position).search(regexp)
  if (subIndex < 0) {
    return subIndex
  }
  return position + subIndex
}
