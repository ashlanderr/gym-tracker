export type EmptyDayKind = "first" | "today" | "past" | "future";

export interface EmptyDayProps {
  kind: EmptyDayKind;
}
