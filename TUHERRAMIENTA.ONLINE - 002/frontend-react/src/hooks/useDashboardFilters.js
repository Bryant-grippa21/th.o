import { useMemo, useState } from 'react';
import { normalizeText } from '../utils/formatters';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_DASHBOARD_FILTERS = {
  search: '',
  dateStart: toInputDate(firstDayOfMonth),
  dateEnd: toInputDate(today),
  states: [],
  cities: [],
  urbanizations: [],
  category: '',
  status: '',
  wholesaler: '',
  store: '',
  seller: '',
  operationType: '',
};

export const createInitialFilters = (overrides = {}) => ({
  ...DEFAULT_DASHBOARD_FILTERS,
  ...overrides,
});

export function useDashboardFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(() => createInitialFilters(initialFilters));

  const setFilterValue = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetDatesToToday = () => {
    const currentDay = toInputDate(new Date());
    setFilters((current) => ({ ...current, dateStart: currentDay, dateEnd: currentDay }));
  };

  const resetFilters = () => {
    setFilters(createInitialFilters(initialFilters));
  };

  return { filters, setFilters, setFilterValue, resetDatesToToday, resetFilters };
}

export const inSelectedList = (selectedValues = [], value) => {
  if (!selectedValues || selectedValues.length === 0) return true;
  return selectedValues.includes(value);
};

export const matchesSearch = (row, search, fields = []) => {
  const needle = normalizeText(search);
  if (!needle) return true;
  return fields.some((field) => normalizeText(row?.[field]).includes(needle));
};

export const isDateInsideRange = (dateValue, start, end) => {
  if (!dateValue) return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return true;
  if (start && date < new Date(`${start}T00:00:00`)) return false;
  if (end && date > new Date(`${end}T23:59:59`)) return false;
  return true;
};

export const useFilteredRows = (rows = [], filters = {}, config = {}) => {
  return useMemo(() => {
    const searchFields = config.searchFields || [];
    return rows.filter((row) => {
      if (!matchesSearch(row, filters.search, searchFields)) return false;
      if (config.dateField && !isDateInsideRange(row[config.dateField], filters.dateStart, filters.dateEnd)) return false;
      if (config.stateField && !inSelectedList(filters.states, row[config.stateField])) return false;
      if (config.cityField && !inSelectedList(filters.cities, row[config.cityField])) return false;
      if (config.urbanizationField && !inSelectedList(filters.urbanizations, row[config.urbanizationField])) return false;
      if (config.categoryField && filters.category && row[config.categoryField] !== filters.category) return false;
      if (config.statusField && filters.status && row[config.statusField] !== filters.status) return false;
      if (config.wholesalerField && filters.wholesaler && row[config.wholesalerField] !== filters.wholesaler) return false;
      if (config.storeField && filters.store && row[config.storeField] !== filters.store) return false;
      return true;
    });
  }, [rows, filters, config]);
};
