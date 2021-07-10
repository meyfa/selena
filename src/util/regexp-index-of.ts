/**
 * Like String.prototype.indexOf(), but with a regular expression.
 * I.e. find the first matching index of the given RegExp, with the possibility to define a starting index.
 *
 * @param str The subject.
 * @param regexp The regular expression to search for.
 * @param position Optionally, a start index.
 * @returns The position at which the RegExp first matched, or -1 if no match was found.
 */
export function regexpIndexOf (str: string, regexp: RegExp, position?: number): number {
  // string.indexOf() treats positions < 0 as equal to 0
  if (position == null || position <= 0) {
    return str.search(regexp)
  }
  // string.indexOf() treats positions greater than str.length as equal to str.length
  const offset = Math.min(position, str.length)
  const subIndex = str.slice(offset).search(regexp)
  if (subIndex < 0) {
    return subIndex
  }
  return offset + subIndex
}
