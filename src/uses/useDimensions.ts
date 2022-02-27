import { DomUtils } from '@etsoo/shared';
import React from 'react';
import { useDelayedExecutor } from './useDelayedExecutor';

interface states {
    count: number;
    indices: number[];
}

/**
 * Calculate element(s) dimensions
 * @param elements Observed elments count
 * @param updateCallback Update callback
 * @param miliseconds Miliseconds to wait before update
 * @param equalCallback Equall callback
 */
export function useDimensions(
    elements: number,
    updateCallback?: (target: Element, rect: DOMRect) => boolean | void,
    miliseconds: number = 50,
    equalCallback: (
        d1?: DOMRect,
        d2?: DOMRect
    ) => boolean = DomUtils.dimensionEqual
) {
    // State
    const [state, setState] = React.useState<states>({
        count: 0,
        indices: []
    });

    // Dimentions
    const dimensions =
        React.useRef<[React.RefCallback<Element>, Element?, DOMRect?][]>();
    if (dimensions.current == null) {
        // Init
        const init: [React.RefCallback<Element>, Element?, DOMRect?][] = [];
        for (let e = 0; e < elements; e++) {
            init.push(
                ((index): [React.RefCallback<Element>] => {
                    return [
                        (instance) => {
                            if (instance != null) {
                                // Current element
                                const currentElement = init[index][1];

                                if (currentElement != null) {
                                    // Same target, return
                                    if (currentElement == instance) return;

                                    // Cancel observation
                                    resizeObserver.unobserve(currentElement);
                                }

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
        dimensions.current = init;
    }

    const delayed = useDelayedExecutor(setState, miliseconds);

    // Observer
    const resizeObserver = new ResizeObserver((entries) => {
        // Update Rect
        const indices: number[] = [];
        const init = dimensions.current!;

        entries.forEach((entry) => {
            const index = init.findIndex((item) => item[1] === entry.target);
            if (index !== -1) {
                // Previous rect
                const pre = init[index][2];

                // New rect
                const rect = entry.target.getBoundingClientRect();

                // Check equal
                if (!equalCallback(pre, rect)) {
                    // Update callback
                    if (updateCallback) {
                        // Return false means no further push
                        if (updateCallback(entry.target, rect) === false)
                            return;
                    }

                    // Update rect
                    init[index][2] = rect;

                    // Push for update
                    indices.push(index);
                }
            }
        });

        // Update state
        if (indices.length > 0) {
            // Count only for unique update
            const update = { count: state.count + 1, indices };
            delayed.call(undefined, update);
        }
    });

    // Layout ready
    React.useEffect(() => {
        return () => {
            // Clear the observer
            resizeObserver.disconnect();
            delayed.clear();
        };
    }, []);

    // Return
    return { dimensions: dimensions.current, state };
}
