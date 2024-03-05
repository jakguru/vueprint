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
