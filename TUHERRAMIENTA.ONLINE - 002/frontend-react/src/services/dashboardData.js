import { buildLocationLabel } from '../utils/formatters';

export const VALID_B2B_SALE_STATUSES = ['Despachado', 'Cobrado', 'Vencido'];
export const VALID_INVOICE_OPEN_STATUSES = ['Al día', 'Próxima a vencer', 'Vencida'];
export const VALID_INVOICE_CLOSED_STATUSES = ['Pagada', 'Cubierta por TH.O', 'Cedida a TH.O'];

export const withLocationLabel = (row) => ({
  ...row,
  locationLabel: buildLocationLabel({
    state: row.state,
    city: row.city,
    urbanization: row.urbanization,
  }),
});

export const calculateGrossMargin = ({ sales = 0, cost = 0 }) => {
  if (!sales) return 0;
  return ((sales - cost) / sales) * 100;
};

export const calculateMoraPercent = ({ overdue = 0, active = 0 }) => {
  if (!active) return 0;
  return (overdue / active) * 100;
};
