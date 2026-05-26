function sanitizeCellValue(value: unknown): string {
  const str = String(value ?? "");
  return str.replace(/"/g, '""');
}

export function buildCsvContent(data: Record<string, unknown>[]): string {
  if (data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [headers.map((h) => `"${sanitizeCellValue(h)}"`).join(",")];

  for (const row of data) {
    const rowValues = headers.map((header) => `"${sanitizeCellValue(row[header])}"`);
    csvRows.push(rowValues.join(","));
  }

  return csvRows.join("\r\n");
}

export type DownloadCsvOptions = {
  /** Prefix UTF-8 BOM for Excel compatibility (default: true) */
  includeBom?: boolean;
};

export function downloadCsv(
  data: Record<string, unknown>[],
  filename: string,
  options?: DownloadCsvOptions
): void {
  if (data.length === 0) {
    return;
  }

  const includeBom = options?.includeBom !== false;
  const csvContent = buildCsvContent(data);
  const output = includeBom ? `\uFEFF${csvContent}` : csvContent;

  const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 100);
}
