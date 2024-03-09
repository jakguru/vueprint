/**
 * Converts a list of strings into a human-readable list with commas and a glue word such as "and" before the last item
 * @param items The list of items to oxforidize
 * @param glue The word to use to join the last two items
 * @returns A string with the items joined by commas and the last two joined by the glue
 */
export const oxforidize = (items: string[], glue: string = 'and') => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  const last = items.pop()
  const secondToLast = items.pop()
  const main = items
    .filter((v) => 'undefined' !== typeof v)
    .map((v) => v.toString().trim())
    .join(', ')
    .trim()
  const end = [secondToLast, last]
    .filter((v) => 'undefined' !== typeof v)
    .map((v) => v!.toString().trim())
    .join(` ${glue} `)
    .trim()
  return [main, end].filter((v) => v.length > 0).join(', ')
}
