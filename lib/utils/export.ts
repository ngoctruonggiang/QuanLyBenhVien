export function exportToCSV(
  rows: Record<string, any>[],
  filename = "export.csv",
) {
  if (!rows || rows.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );

  const escape = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csv = [headers.map(escape).join(",")]
    .concat(rows.map((row) => headers.map((h) => escape(row[h])).join(",")))
    .join("\n");

  if (typeof window === "undefined") {
    return csv;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.click();
  URL.revokeObjectURL(url);
}
