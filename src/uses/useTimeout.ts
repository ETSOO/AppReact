import React from 'react';

/**
 * For setTimeout to merge actions
 * @param action Action function
 * @param milliseconds Interval of milliseconds
 */
export const useTimeout = (action: Function, milliseconds: number) => {
    // Time out seed
    let seed = 0;

    // Cancel function
    const cancel = () => {
        if (seed > 0) {
            clearTimeout(seed);
            seed = 0;
        }
    };

    // Merge into the life cycle
    React.useEffect(() => {
        seed = window.setTimeout(() => {
            action.call(null);
        }, milliseconds);

        return () => {
            cancel();
        };
    }, []);

    // Return cancel method
    return {
        cancel
    };
};