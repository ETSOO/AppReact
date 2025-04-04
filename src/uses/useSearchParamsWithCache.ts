import { IStorage, WindowStorage } from "@etsoo/shared";
import { useSearchParams } from "react-router-dom";

/**
 * Read search parameters with cache
 * @param cacheKey Cache key
 * @param storage Storage
 */
export function useSearchParamsWithCache(
  cacheKey?: string,
  storage?: IStorage
) {
  const [sp] = useSearchParams();

  const data = {};

  if (cacheKey) {
    storage ??= new WindowStorage();
    const paras = storage.getObject(cacheKey);
    if (paras) {
      Object.assign(data, paras);
    }
  }

  Object.assign(data, Object.fromEntries(sp.entries()));

  return data;
}
