/** Botón de acción Prisma. */
export interface ButtonProps {
  /** Button label */
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'disabled';
  size?: 'md' | 'sm';
  onClick?: () => void;
}
