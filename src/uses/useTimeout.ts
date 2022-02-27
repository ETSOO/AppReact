import { ExtendUtils } from '@etsoo/shared';
import React from 'react';

/**
 * For setTimeout to merge actions
 * @param action Action function
 * @param milliseconds Interval of milliseconds
 */
export const useTimeout = (
    action: (...args: any[]) => void,
    milliseconds: number
) => {
    // Delayed
    const d = ExtendUtils.delayedExecutor(action, milliseconds);

    // Merge into the life cycle
    React.useEffect(() => {
        d.call();

        return () => {
            d.clear();
        };
    }, []);

    // Return cancel method
    return {
        cancel: d.clear
    };
};
