import { describe, expect, it, vi } from 'vitest'
import { collectPages } from './pagination'

describe('complete calendar pagination', () => {
  it('includes entries beyond the first page', async () => {
    const fetchPage = vi.fn(async (page) => ({ items: [page], page, size: 1, total: 3 }))
    expect((await collectPages(fetchPage)).items).toEqual([1, 2, 3])
    expect(fetchPage.mock.calls).toEqual([[1], [2], [3]])
  })
  it('propagates errors instead of presenting a partial calendar', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce({ items: [1], size: 1, total: 2 })
      .mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
    await expect(collectPages(fetchPage)).rejects.toMatchObject({ name: 'AbortError' })
  })
})
