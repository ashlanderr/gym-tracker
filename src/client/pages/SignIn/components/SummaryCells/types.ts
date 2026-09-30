export interface SummaryCell {
  label: string;
  value: string;
  meta: string;
}

export interface SummaryCellsProps {
  cells: SummaryCell[];
}
