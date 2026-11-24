import { z } from 'zod'

/** Codes and ids only, which keeps the base64 below ASCII-safe and the URL short. */
const token = z.string().regex(/^[A-Za-z0-9_-]{1,32}$/)

export const addonConfigSchema = z.object({
  /** ISO country codes, e.g. IN */
  countries: z.array(token).min(1).max(30),
  /** Category ids, e.g. sports. Each becomes a row in Stremio, in this order. */
  genres: z.array(token).min(1).max(20),
  /** ISO 639-3 language codes, empty for any */
  languages: z.array(token).max(30).default([]),
  minHeight: z.number().int().min(0).max(2160).default(0),
  nsfw: z.boolean().default(false),
})

export type AddonConfig = z.infer<typeof addonConfigSchema>

export function encodeConfig(config: z.input<typeof addonConfigSchema>) {
  return btoa(JSON.stringify(config)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Null for anything that isn't a valid config, the caller answers 400. */
export function decodeConfig(value: string): AddonConfig | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const parsed = addonConfigSchema.safeParse(JSON.parse(atob(base64)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
