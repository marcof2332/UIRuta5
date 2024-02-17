
export interface TableColumn {
  field: string; // El nombre del campo en los datos
  header: string; // El encabezado de la columna
  type: 'text' | 'button' | 'select' | 'date' | 'time'; // Tipo de columna
  action?: (item: any) => void; // Función personalizada para acciones de columna
  icon?: string; // Icono para columnas de botón
  color?: 'mat-warn' | 'mat-primary' | 'mat-accent'
  valueGetter?: (row: any) => any; // Función para obtener el valor del campo en los datos
}
