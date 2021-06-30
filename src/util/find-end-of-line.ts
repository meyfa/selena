/**
 * Return the index of the next end-of-line character. An end-of-line character is either '\n' or '\r'.
 * If no such character exists, the line is assumed to end at the string end, and str.length is returned.
 *
 *
 * @param {string} str The subject.
 * @param {?number} position Optionally, a start index.
 * @returns {number} The position of the next end-of-line character, or, in absence of one, str.length.
 */
export function findEndOfLine (str: string, position?: number): number {
  const nPos = str.indexOf('\n', position)
  const rPos = str.indexOf('\r', position)

  return Math.min(
    str.length,
    nPos >= 0 ? nPos : str.length,
    rPos >= 0 ? rPos : str.length
  )
}
