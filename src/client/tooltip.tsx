import React from "react";

interface TooltipProps {
  name: string | null;
  power: string | null;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ name, power, x, y }) => {
  if (name === null) {
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
      <div>{name}</div>
      <div>{power}</div>
    </div>
  );
};

export default Tooltip;
