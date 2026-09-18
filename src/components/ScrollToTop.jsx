import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useLenis } from "lenis/react";

// Stores scroll Y per history entry (keyed by location.key)
const scrollPositions = new Map();

export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'
  const lenis = useLenis();

  const lenisRef = useRef(lenis);
  useEffect(() => { lenisRef.current = lenis; }, [lenis]);

  const prevKeyRef = useRef(null);

  useEffect(() => {
    const scrollTo = (y) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
    };

    const getScrollY = () =>
      lenisRef.current ? lenisRef.current.scroll : window.scrollY;

    // 1. Save the scroll position of the page we are LEAVING
    if (prevKeyRef.current !== null) {
      scrollPositions.set(prevKeyRef.current, getScrollY());
    }

    // 2. Update the tracked key immediately
    prevKeyRef.current = location.key;

    if (navType === "POP") {
      // Back / Forward → restore saved position.
      // Retry with delays because heavy pages (Home) need time to render
      // before the page is tall enough to accept the scroll value.
      const savedY = scrollPositions.get(location.key) ?? 0;

      const delays = [0, 100, 300, 600];
      const timers = delays.map((delay) =>
        setTimeout(() => scrollTo(savedY), delay)
      );

      return () => timers.forEach(clearTimeout);
    } else {
      // PUSH / REPLACE → always start at top
      scrollTo(0);
    }
  }, [location.key, navType]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
