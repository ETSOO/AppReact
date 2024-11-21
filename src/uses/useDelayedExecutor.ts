import { DelayedExecutorType, ExtendUtils } from "@etsoo/shared";
import React from "react";

/**
 * Create delayed executor
 */
export function useDelayedExecutor<P extends any[]>(
  func: (...args: P) => void,
  delayMiliseconcs: number
) {
  const ref = React.useRef<DelayedExecutorType<P>>();
  if (ref.current == null)
    ref.current = ExtendUtils.delayedExecutor(func, delayMiliseconcs);
  return ref.current;
}
