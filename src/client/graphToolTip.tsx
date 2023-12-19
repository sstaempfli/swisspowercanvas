import React, { useRef, useEffect, useState } from "react";

interface TooltipProps {
  year: number;
  power: number;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ year, power, x, y }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipDimensions, setTooltipDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipDimensions({
        width: tooltipRef.current.offsetWidth,
        height: tooltipRef.current.offsetHeight,
      });
    }
  }, [year, power]);

  if (x === 0 && y === 0) {
    return <></>;
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        top: y - tooltipDimensions.height - 10,
        left: x - tooltipDimensions.width / 2,
        backgroundColor: "white",
        border: "1px solid black",
        padding: "5px",
        pointerEvents: "none",
      }}
    >
      <div>Year: {year}</div>
      <div>Power installed: {Math.round(power)} kW</div>
    </div>
  );
};

export default Tooltip;
