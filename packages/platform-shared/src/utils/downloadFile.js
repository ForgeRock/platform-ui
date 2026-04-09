/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ExcelJS from 'exceljs';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

export function downloadFile(file, fileType, fileName) {
  const data = file;
  const blob = new Blob([data], { type: `data:${fileType}` });
  const a = document.createElement('a');

  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = [`data:${fileType}`, a.download, a.href].join(':');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function getFileNameFromContentDisposition(contentDisposition) {
  return contentDisposition
    .split(';')
    .find((n) => n.trim().includes('filename='))
    .replace('filename=', '')
    .trim();
}

/**
 * Converts data to CSV format and triggers a download of the file.
 *
 * @param {Object[]} data - The data to be converted and downloaded.
 * @param {string} fileName - The name of the file to be downloaded.
 */
function downloadAsCSV(data, fileName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  const columns = Object.keys(data[0] || {}).map((key) => ({ header: key, key }));
  worksheet.columns = columns;
  worksheet.addRows(data);
  return workbook.csv.writeBuffer().then((csv) => {
    downloadFile(csv, 'text/csv', fileName);
  });
}

/**
 * Converts data to XLSX format and triggers a download of the file.
 *
 * @param {Object[]} data - The data to be converted and downloaded.
 * @param {string} fileName - The name of the file to be downloaded.
 * @param {string} title - The title to be used in the file (for XLSX).
 */
function downloadAsXLSX(data, fileName, title = 'Excel Export') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);
  const columns = Object.keys(data[0] || {}).map((key) => ({ header: key, key, width: 20 }));
  worksheet.columns = columns;

  // Add title and spacing
  worksheet.spliceRows(1, 0, [title]);
  const titleCell = worksheet.getCell('A1');
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  worksheet.mergeCells(1, 1, 1, columns.length); // Merge cells for the title
  worksheet.spliceRows(2, 0, []); // Add an empty row after the title
  worksheet.views = [
    { state: 'frozen', ySplit: 3 }, // freezes above row 3
  ];
  worksheet.getRow(3).font = { bold: true };

  // Add data
  data.forEach((item) => { worksheet.addRow(item); });
  return workbook.xlsx.writeBuffer().then((buffer) => {
    downloadFile(buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileName);
  });
}

/**
 * Converts data to PDF format and triggers a download of the file.
 *
 * @param {Object[]} data - The data to be converted and downloaded.
 * @param {string} fileName - The name of the file to be downloaded.
 * @param {string} title - The title to be used in the file (for PDF).
 */
async function downloadAsPDF(data, fileName, title) {
  try {
    // Lazy load PDF packages
    const [{ jsPDF: JSPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new JSPDF({
      orientation: 'landscape',
      unit: 'pt',
    });
    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map((row) => Object.values(row)),
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fontStyle: 'bold', fillColor: [220, 220, 220] },
      // handle long tables across pages
      didDrawPage: () => {
        // optional header/footer
        doc.setFontSize(10);
        doc.text(title, 40, 20);
      },
    });
    const blob = doc.output('blob');
    downloadFile(blob, 'application/pdf', fileName);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.exportError'));
  }
}

/**
 * Handler function to download data in the specified file type.
 *
 * @param {Object[]} data - The data to be downloaded.
 * @param {string} fileType - The type of file to download ('csv', 'xlsx', or 'pdf').
 * @param {string} fileName - The name of the file to be downloaded.
 * @param {string} title - The title to be used in the file (for PDF).
 * @throws Will throw an error if the file type is unsupported.
 */
export function downloadAsType(data, fileType, fileName, title) {
  const MAX_ROWS = fileType === 'pdf' ? 1000 : 10000; // Limit rows based on file type
  const truncatedData = data.slice(0, MAX_ROWS); // Truncate data if it exceeds the maximum row limit
  switch (fileType) {
    case 'xlsx':
      return downloadAsXLSX(truncatedData, fileName, title);
    case 'pdf':
      return downloadAsPDF(truncatedData, fileName, title);
    case 'csv':
    default:
      return downloadAsCSV(truncatedData, fileName);
  }
}
