// A range as typed: a field may be empty or not a number yet.
export interface RangeDraft {
  id: number;
  from: string;
  to: string;
  step: string;
}

export interface RangeFieldsProps {
  range: RangeDraft;
  invalid: boolean;
  onChange: (range: RangeDraft) => void;
  onRemove?: () => void;
}
