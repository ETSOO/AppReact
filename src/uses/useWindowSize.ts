import React from "react";

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
    let lastSize: ISize;
    let requestAnimationFrameSeed = 0;

    const resizeHandler = () => {
      lastSize = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      };

      if (!ticking) {
        requestAnimationFrameSeed = window.requestAnimationFrame(() => {
          ticking = false;
          requestAnimationFrameSeed = 0;

          if (lastSize.width != size.width || lastSize.height != size.height) {
            setSize(lastSize);
          }
        });
        ticking = true;
      }
    };

    window.addEventListener("resize", resizeHandler, {
      passive: true,
      capture: false
    });

    return () => {
      // Cancel animation frame
      if (requestAnimationFrameSeed > 0)
        window.cancelAnimationFrame(requestAnimationFrameSeed);

      // Remove resize event
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  // Return
  return size;
};
