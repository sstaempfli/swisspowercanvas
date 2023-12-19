import React from "react";

interface TooltipProps {
  year: number;
  power: number;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ year, power, x, y }) => {
  if (x === 0 && y === 0) {
    return <></>;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        backgroundColor: "white",
        border: "1px solid black",
        padding: "5px",
        pointerEvents: "none",
      }}
    >
      <div>Year: {year}</div>
      <div>Power installed: {power} kW</div>
    </div>
  );
};

export default Tooltip;
