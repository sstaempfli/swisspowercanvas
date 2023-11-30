
export interface Margin {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface ChartProps {
  width: number;
  height: number;
  margin: Partial<Margin>;
}

export const defaultMargin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 30,
};

export const defaultChartProps = {
  width: 700,
  height: 500,
  margin: defaultMargin,
};

export type extent = [number, number];
export type extent2D = [extent, extent];
