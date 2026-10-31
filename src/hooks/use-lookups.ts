import { useQuery } from '@tanstack/react-query'
import { lookupsQuery } from '@/lib/catalog/queries'

export function useLookups() {
  return useQuery(lookupsQuery()).data
}
