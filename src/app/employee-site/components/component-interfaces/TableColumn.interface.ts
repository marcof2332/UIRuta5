
export interface TableColumn {
  field: string; // El nombre del campo en los datos
  header: string; // El encabezado de la columna
  type: 'text' | 'button' | 'select' | 'date'; // Tipo de columna
  action?: (item: any) => void; // Función personalizada para acciones de columna
  icon?: string; // Icono para columnas de botón
  color?: 'mat-warn' | 'mat-primary' | 'mat-accent'
}
