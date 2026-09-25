export interface DialogProps {
  /** Pregunta o acción, en sentence case y sin mayúsculas sostenidas. */
  title?: string;
  /** Cuerpo explicativo: qué pasa al confirmar y cómo revertirlo. */
  children?: React.ReactNode;
  open?: boolean;
  /** Verbo en infinitivo: «Publicar», «Enviar pedido». */
  confirmLabel?: string;
  /** Pasa `null` para un diálogo de un solo botón. */
  cancelLabel?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** `true` posiciona el scrim dentro del contenedor padre (para especímenes y tarjetas). */
  inline?: boolean;
}

export declare function Dialog(props: DialogProps): JSX.Element | null;
