export interface TextareaProps {
  label?: string;
  value?: string;
  placeholder?: string;
  /** Alto en líneas; 3 por defecto. */
  rows?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export declare function Textarea(props: TextareaProps): JSX.Element;
