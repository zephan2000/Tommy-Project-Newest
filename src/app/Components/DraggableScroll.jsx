// DraggableScroll.js
import React, { useRef, useState } from "react";

export function DraggableScroll({ children, style, ...rest }) {
  const scrollRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    console.log("Mouse down");
    setIsDown(true);
    scrollRef.current.classList.add("active");
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    scrollRef.current.classList.remove("active");
  };

  const handleMouseUp = () => {
    setIsDown(false);
    scrollRef.current.classList.remove("active");
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Adjust multiplier if needed
    console.log("Mouse move, walk:", walk);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      style={{
        overflowX: "auto",
        cursor: isDown ? "grabbing" : "grab",
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      {...rest}
    >
      {children}
    </div>
  );
}
