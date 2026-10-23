export interface LineChartProps {
  // In order of x. Both axes fit the points, so the line shows the shape of
  // the change rather than its size.
  points: { x: number; y: number }[];
  // Sets the size: the chart has none of its own.
  className?: string;
}
