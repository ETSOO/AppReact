import { DomUtils } from '@etsoo/shared';
import React from 'react';

const createRef = (
    source: [React.RefCallback<Element>, Element?, DOMRect?][],
    index: number
): [React.RefCallback<Element>] => {
    return [
        (instance) => {
            if (instance != null) source[index][1] = instance;
        }
    ];
};

interface states {
    count: number;
    indices: number[];
    seed?: number;
}

/**
 * Calculate element(s) dimensions
 * @param elements Observed elments count
 * @param miliseconds Miliseconds to wait before update
 */
export function useDimensions(elements: number, miliseconds: number = 50) {
    // State
    const [state, setState] = React.useState<states>({
        count: 0,
        indices: []
    });

    // Observer
    const resizeObserver = new ResizeObserver((entries) => {
        // Update Rect
        const indices: number[] = [];
        entries.forEach((entry) => {
            const index = init.findIndex((item) => item[1] === entry.target);
            if (index !== -1) {
                const rect = entry.target.getBoundingClientRect();
                if (!DomUtils.dimensionEqual(init[index][2], rect)) {
                    init[index][2] = rect;
                    indices.push(index);
                }
            }
        });

        // Update state
        if (indices.length > 0) {
            const update = { count: state.count + 1, indices, seed: undefined };
            if (miliseconds > 0) {
                if (state.seed != null) {
                    clearTimeout(state.seed);
                }
                state.seed = window.setTimeout(
                    (localUpdate: states) => {
                        setState(localUpdate);
                    },
                    miliseconds,
                    update
                );
            } else {
                setState(update);
            }
        }
    });

    // Init
    const init: [React.RefCallback<Element>, Element?, DOMRect?][] = [];
    for (let e = 0; e < elements; e++) {
        init.push(
            ((index): [React.RefCallback<Element>] => {
                return [
                    (instance) => {
                        if (instance != null) {
                            // Update element
                            init[index][1] = instance;

                            // Start observe
                            resizeObserver.observe(instance);
                        }
                    }
                ];
            })(e)
        );
    }

    // Dimensions
    const [dimensions] = React.useState(init);

    // Layout ready
    React.useEffect(() => {
        return () => {
            // Clear the observer
            resizeObserver.disconnect();

            if (state.seed != null) {
                clearTimeout(state.seed);
            }
        };
    }, []);

    // Return
    return { dimensions, state };
}
