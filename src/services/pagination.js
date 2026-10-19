/** Load all pages for views that need a complete calendar or booking map. */
export async function collectPages(fetchPage) {
  const first = await fetchPage(1)
  if (Array.isArray(first)) return first
  const items = [...first.items]
  let page = 1
  let current = first
  while (page * current.size < current.total) {
    current = await fetchPage(++page)
    if (!current.items.length) break
    items.push(...current.items)
  }
  return { ...first, items, total: items.length }
}
