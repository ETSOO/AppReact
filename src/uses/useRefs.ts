import { DataTypes } from "@etsoo/shared";
import React from "react";

/**
 * Create multiple refs
 * @param fields Fields
 * @returns Result
 */
export function useRefs<F extends ReadonlyArray<string>, T = HTMLInputElement>(
  fields: F
): DataTypes.DI<F, React.RefObject<T | null>> {
  const refs: Record<string, React.RefObject<T | null>> = {};
  fields.forEach((field) => (refs[field] = React.useRef<T>(null)));
  return refs as any;
}
