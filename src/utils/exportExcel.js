export function toExcelCell(value) {
  return value == null || value === '' ? '-' : String(value)
}

export function exportRowsToExcel(filename, rows) {
  const headers = Object.keys(rows[0] || { 数据: '暂无数据' })
  const bodyRows = rows.length ? rows : [{ 数据: '暂无数据' }]
  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>
            ${bodyRows.map((row) => `<tr>${headers.map((header) => `<td>${toExcelCell(row[header])}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
