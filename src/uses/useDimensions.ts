import { DomUtils } from '@etsoo/shared';
import React from 'react';

/**
 * Calculate element dimensions
 * @param observeResize Is observing resize event
 */
export function useDimensions<E extends Element>(
    observeResize: boolean = false
) {
    // References for a HTML elements passed to its 'ref' property
    const ref = React.useRef<E>(null);

    // Dimensions and update state
    const [dimensions, updateDimensions] = React.useState<DOMRect>();

    // Resize event timeout seed
    // Readonly object data, hold Class similar properties
    const [data] = React.useState<{ seed: number }>({ seed: 0 });

    // Clear resize timeout
    function clearResizeTimeout() {
        if (data.seed > 0) {
            window.clearTimeout(data.seed);
            data.seed = 0;
        }
    }

    // Setup resize timeout
    function setResizeTimeout(handler: TimerHandler) {
        // Clear first
        clearResizeTimeout();

        // Start a new timeout
        data.seed = window.setTimeout(handler, 100);
    }

    // Check for update
    const checkUpdate = () => {
        if (ref.current) {
            const d = ref.current.getBoundingClientRect();
            if (!DomUtils.dimensionEqual(dimensions, d)) {
                if (d.width <= 0 || d.height <= 0) {
                    // Return false from watch will setTimeout for later update
                    setResizeTimeout(checkUpdate);
                } else {
                    updateDimensions(d);
                }
            }
        }
    };

    // Calcuate when layout is ready
    React.useEffect(() => {
        // Init update dimensions
        checkUpdate();

        // Resize event handler
        const resizeHandler = () => {
            setResizeTimeout(checkUpdate);
        };

        // Add event listener when supported
        if (observeResize) {
            window.addEventListener('resize', resizeHandler);
        }

        return () => {
            // Clear timeout
            clearResizeTimeout();

            // Remove the event listener
            if (observeResize) {
                window.removeEventListener('resize', resizeHandler);
            }
        };
    }, []);

    // Return
    return {
        ref,
        dimensions
    };
}
