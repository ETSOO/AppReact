import { useLocation } from "react-router-dom";

/**
 * Location state
 * @param T Type of state
 * @returns State
 * @throws Error if state is null or undefined
 */
export function useLocationState<T>() {
  const location = useLocation();

  if (location.state == null) {
    throw new Error(`useLocationState: ${location.pathname} state is required`);
  }

  return location.state as T;
}
