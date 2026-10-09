import React, { useRef, useState, useCallback } from 'react';

/**
 * Hook hỗ trợ kéo rê chuột (drag-to-scroll) và lăn chuột ngang (wheel-to-scroll)
 * Giải quyết triệt để vấn đề không kéo ngang được trên Zalo Simulator & Desktop WebView
 */
export const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 3) {
      setHasMoved(true);
    }
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  // Hỗ trợ lăn chuột dọc tự động chuyển thành cuộn ngang
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!ref.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      ref.current.scrollLeft += e.deltaY;
    }
  }, []);

  return {
    ref,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onWheel,
    },
    isDragging,
    hasMoved,
  };
};

