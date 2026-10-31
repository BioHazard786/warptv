import { db } from '@/lib/catalog/db'
import type { FavoriteRow, HistoryRow } from '@/lib/catalog/types'

interface UserDataFile {
  app: 'warptv'
  version: 1
  favorites: FavoriteRow[]
  history: HistoryRow[]
}

export async function exportUserData() {
  const data: UserDataFile = {
    app: 'warptv',
    version: 1,
    favorites: await db.favorites.toArray(),
    history: await db.history.toArray(),
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'warptv-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

export async function importUserData(file: File) {
  const data = JSON.parse(await file.text()) as Partial<UserDataFile>
  if (data.app !== 'warptv' || !Array.isArray(data.favorites) || !Array.isArray(data.history)) {
    throw new Error("This doesn't look like a WarpTV export.")
  }
  await db.transaction('rw', db.favorites, db.history, async () => {
    await db.favorites.bulkPut(data.favorites!)
    await db.history.bulkPut(data.history!)
  })
  return { favorites: data.favorites.length, history: data.history.length }
}
