import React from 'react';

interface ISize {
    width: number;
    height: number;
}

/**
 * Detect window size
 * @returns Window size
 */
export const useWindowSize = () => {
    // State
    const [size, setSize] = React.useState<ISize>({
        width: 0,
        height: 0
    });

    React.useEffect(() => {
        let ticking = false;
        let lastKnownSize: ISize;
        let requestAnimationFrameSeed = 0;

        const resizeHandler = () => {
            lastKnownSize = {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };

            if (!ticking) {
                requestAnimationFrameSeed = window.requestAnimationFrame(() => {
                    setSize(lastKnownSize);
                    ticking = false;
                    requestAnimationFrameSeed = 0;
                });
                ticking = true;
            }
        };

        window.addEventListener('resize', resizeHandler);

        return () => {
            // Cancel animation frame
            if (requestAnimationFrameSeed > 0)
                window.cancelAnimationFrame(requestAnimationFrameSeed);

            // Remove scroll event
            window.removeEventListener('resize', resizeHandler);
        };
    }, []);

    // Return
    return size;
};
