export function responsesToCsv(responses) {
  const headers = [
    'id',
    'created_at',
    'score',
    'profile_type',
    'barriers',
    'expectations',
    'answers',
  ];

  const rows = responses.map((response) => [
    response.id,
    response.created_at,
    response.score,
    response.profile_type,
    (response.barriers ?? []).join('; '),
    (response.expectations ?? []).join('; '),
    JSON.stringify(response.answers ?? {}),
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([`\uFEFF${csvText}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
