export interface SharedInput {
  field: string; // El nombre del campo en los datos
  label: string; // El encabezado del campo
  type: 'text' | 'button' | 'number' | 'date' | 'select' ; // Tipo de input
  formControlName: string; // El nombre del control en los datos
  optionsValue?: any[]; // Campo opcional para el value del select
  optionsLabel?: any[]; // Campo opcional para el label de los items del select
  loadOptions?: (selectedValue: any) => void;
}
