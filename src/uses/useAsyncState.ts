import React from "react";

export function useAsyncState<S = undefined>(): [
  S | undefined,
  (newState: React.SetStateAction<S | undefined>) => Promise<S | undefined>
];

/**
 * Returns a stateful value, and a async function to update it.
 * @param initialState initial stat
 * @returns Current state and update action
 */
export function useAsyncState<S>(
  initialState: S | (() => S)
): [S, (newState: React.SetStateAction<S>) => Promise<S>];

/**
 * Returns a stateful value, and a async function to update it.
 * @param initialState initial stat
 * @returns Current state and update action
 */
export function useAsyncState<S>(
  initialState?: S | (() => S)
): [
  S | undefined,
  (newState: React.SetStateAction<S | undefined>) => Promise<S | undefined>
] {
  // State
  const [state, setState] = React.useState(initialState);

  // Resolve sate
  const resolveState =
    React.useRef<(value: S | undefined | PromiseLike<S | undefined>) => void>(
      null
    );

  // Is mounted or not
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // When state update
  React.useEffect(() => {
    if (resolveState.current) {
      resolveState.current(state);
    }
  }, [state]);

  const setAsyncState = React.useCallback(
    (newState: React.SetStateAction<S | undefined>) =>
      new Promise<S | undefined>((resolve) => {
        if (isMounted.current) {
          resolveState.current = resolve;
          setState(newState);
        }
      }),
    []
  );

  return [state, setAsyncState];
}
