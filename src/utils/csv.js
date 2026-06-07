function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n;]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function rowsToCsv(rows) {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','));
  return [headers.join(','), ...body].join('\n');
}

export function downloadCsv(filename, rows) {
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
