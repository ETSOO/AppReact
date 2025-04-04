import { IStorage, WindowStorage } from "@etsoo/shared";
import { useInRouterContext, useSearchParams } from "react-router-dom";

/**
 * Read search parameters with cache
 * @param cacheKey Cache key
 * @param storage Storage
 */
export function useSearchParamsWithCache(
  cacheKey?: string,
  storage?: IStorage
) {
  const data = {};

  if (cacheKey) {
    storage ??= new WindowStorage();
    const paras = storage.getObject(cacheKey);
    if (paras) {
      Object.assign(data, paras);
    }
  }

  if (useInRouterContext()) {
    const [sp] = useSearchParams();
    Object.assign(data, Object.fromEntries(sp.entries()));
  }

  return data;
}
