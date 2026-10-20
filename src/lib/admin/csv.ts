type Cell = string | number | boolean | null | undefined | Date;

function escape(value: Cell) {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: Cell[][]) {
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
}

export function csvResponse(filename: string, csv: string) {
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
