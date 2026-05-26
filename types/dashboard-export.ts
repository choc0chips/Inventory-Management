export type DashboardExportFilters = {
  product?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
};

export type InventoryExportRow = Record<string, string | number>;

export type MovementExportRow = Record<string, string | number>;

export type DashboardExportData = {
  inventory: InventoryExportRow[];
  movements: MovementExportRow[];
};
