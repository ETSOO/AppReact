import React from 'react';

/**
 * Returns a stateful value, and a async function to update it.
 * @param initialState initial stat
 * @returns Current state and update action
 */
export function useAsyncState<S>(
    initialState: S | (() => S)
): [S, (newState: React.SetStateAction<S>) => Promise<S>] {
    // State
    const [state, setState] = React.useState(initialState);

    // Resolve sate
    const resolveState = React.useRef<(value: S | PromiseLike<S>) => void>();

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
        (newState: React.SetStateAction<S>) =>
            new Promise<S>((resolve) => {
                if (isMounted.current) {
                    resolveState.current = resolve;
                    setState(newState);
                }
            }),
        []
    );

    return [state, setAsyncState];
}
