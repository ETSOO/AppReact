import React from "react";
import { useLocation } from "react-router";
import { IScrollPos, useWindowScroll } from "../uses/useWindowScroll";

const urls: Record<string, IScrollPos | undefined> = {};

/**
 * Scroll restoration
 */
export function ScrollRestoration() {
  // Location key
  const { key } = useLocation();

  // Mounted
  const mounted = React.useRef(false);

  // Detect scroll
  const data = useWindowScroll();
  if (mounted.current) {
    urls[key] = data;
  }

  // Setup
  React.useEffect(() => {
    const pos = urls[key];
    if (pos) {
      window.scrollTo(pos.x, pos.y);
    }

    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [key]);

  return <React.Fragment />;
}
