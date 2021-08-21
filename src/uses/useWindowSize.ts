import React from 'react';

/**
 * Detect window size
 * @param miliseconds Miliseconds delayed
 * @returns Window size
 */
export const useWindowSize = (miliseconds: number = 50) => {
    // State
    const [size, setSize] = React.useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0
    });
    const [state] = React.useState<{ seed?: number }>({});

    const resizeHandler = () => {
        if (state.seed != null) window.clearTimeout(state.seed);
        state.seed = window.setTimeout(() => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
            state.seed = undefined;
        }, miliseconds);
    };

    React.useEffect(() => {
        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
            if (state.seed != null) window.clearTimeout(state.seed);
        };
    }, []);

    // Return
    return size;
};
