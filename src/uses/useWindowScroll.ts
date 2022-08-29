import React from 'react';

interface IScrollPos {
    x: number;
    y: number;
}

/**
 * Detect window scroll
 * @returns Scroll location
 */
export const useWindowScroll = () => {
    // State
    const [pos, setPos] = React.useState<IScrollPos>({
        x: window.pageXOffset,
        y: window.pageYOffset
    });

    React.useEffect(() => {
        let ticking = false;
        let lastPos: IScrollPos;
        let requestAnimationFrameSeed = 0;

        const scrollHandler = () => {
            lastPos = {
                x: window.pageXOffset,
                y: window.pageYOffset
            };

            if (!ticking) {
                requestAnimationFrameSeed = window.requestAnimationFrame(() => {
                    ticking = false;
                    requestAnimationFrameSeed = 0;

                    if (lastPos.x != lastPos.x || lastPos.y != lastPos.y) {
                        setPos(lastPos);
                    }
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, {
            passive: true,
            capture: false
        });

        return () => {
            // Cancel animation frame
            if (requestAnimationFrameSeed > 0)
                window.cancelAnimationFrame(requestAnimationFrameSeed);

            // Remove scroll event
            window.removeEventListener('scroll', scrollHandler);
        };
    }, []);

    // Return
    return pos;
};
