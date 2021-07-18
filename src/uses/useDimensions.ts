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

/**
 * Calculate element(s) dimensions
 * @elements Observed elments count
 */
export function useDimensions(elements: number) {
    // State
    const [state, setState] = React.useState<{
        count: number;
        indices: number[];
    }>({
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
            setState({ count: state.count + 1, indices });
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

    // Return
    return { dimensions, state };
}
