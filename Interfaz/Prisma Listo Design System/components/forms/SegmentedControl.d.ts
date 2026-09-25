export interface SegmentedOption {
  value: string;
  label: string;
  /** Icono opcional del set Prisma, p. ej. `<Icon name={12} size={16} />`. */
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  label?: string;
  /** Cadenas u objetos `{value, label, icon}`; 2–4 opciones cortas. */
  options?: (string | SegmentedOption)[];
  value?: string;
  onChange?: (value: string) => void;
}

export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
