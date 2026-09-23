export interface BodyCardProps {
  label: string;
  value: string;
  meta: string;
  points?: { x: number; y: number }[];
  onOpen: () => void;
  onAdd: () => void;
}
