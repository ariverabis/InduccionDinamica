export interface SelectProps {
  label?: string;
  options?: string[];
  value?: string;
  onChange?: (v: string) => void;
}
