/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ExcelJS from 'exceljs';
import JSPDF from 'jspdf';
import { downloadAsType } from './downloadFile';

jest.mock('exceljs');
jest.mock('jspdf');
jest.mock('jspdf-autotable');

describe('downloadFile utilities', () => {
  let mockCreateElement;
  let mockAppendChild;
  let mockRemoveChild;
  let mockClick;
  let mockCreateObjectURL;

  beforeEach(() => {
    mockClick = jest.fn();
    mockCreateObjectURL = jest.fn(() => 'mock-url');
    mockAppendChild = jest.fn();
    mockRemoveChild = jest.fn();

    mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      dataset: {},
    });

    global.URL.createObjectURL = mockCreateObjectURL;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    jest.clearAllMocks();
  });

  describe('downloadAsType - CSV', () => {
    it('should download data as CSV', async () => {
      const mockBuffer = Buffer.from('csv data');
      const mockWriteBuffer = jest.fn().mockResolvedValue(mockBuffer);
      const mockWorksheet = {
        columns: [],
        addRows: jest.fn(),
      };
      const mockWorkbook = {
        addWorksheet: jest.fn(() => mockWorksheet),
        csv: { writeBuffer: mockWriteBuffer },
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      const data = [{ name: 'John', age: 30 }];
      await downloadAsType(data, 'csv', 'test.csv');

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Sheet 1');
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(data);
      expect(mockWriteBuffer).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should truncate data to 10000 rows for CSV', async () => {
      const mockBuffer = Buffer.from('csv data');
      const mockWriteBuffer = jest.fn().mockResolvedValue(mockBuffer);
      const mockWorksheet = {
        columns: [],
        addRows: jest.fn(),
      };
      const mockWorkbook = {
        addWorksheet: jest.fn(() => mockWorksheet),
        csv: { writeBuffer: mockWriteBuffer },
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      const data = Array(15000).fill({ name: 'Test' });
      await downloadAsType(data, 'csv', 'test.csv');

      expect(mockWorksheet.addRows).toHaveBeenCalledWith(expect.arrayContaining([{ name: 'Test' }]));
      expect(mockWorksheet.addRows.mock.calls[0][0].length).toBe(10000);
    });
  });

  describe('downloadAsType - XLSX', () => {
    it('should download data as XLSX with title', async () => {
      const mockBuffer = Buffer.from('xlsx data');
      const mockWriteBuffer = jest.fn().mockResolvedValue(mockBuffer);
      const mockWorksheet = {
        columns: [],
        spliceRows: jest.fn(),
        getCell: jest.fn(() => ({ font: {}, alignment: {} })),
        mergeCells: jest.fn(),
        getRow: jest.fn(() => ({ font: {} })),
        addRow: jest.fn(),
        views: [],
      };
      const mockWorkbook = {
        addWorksheet: jest.fn(() => mockWorksheet),
        xlsx: { writeBuffer: mockWriteBuffer },
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      const data = [{ name: 'John', age: 30 }];
      await downloadAsType(data, 'xlsx', 'test.xlsx', 'My Report');

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('My Report');
      expect(mockWorksheet.spliceRows).toHaveBeenCalled();
      expect(mockWriteBuffer).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should use default title for XLSX if not provided', async () => {
      const mockBuffer = Buffer.from('xlsx data');
      const mockWriteBuffer = jest.fn().mockResolvedValue(mockBuffer);
      const mockWorksheet = {
        columns: [],
        spliceRows: jest.fn(),
        getCell: jest.fn(() => ({ font: {}, alignment: {} })),
        mergeCells: jest.fn(),
        getRow: jest.fn(() => ({ font: {} })),
        addRow: jest.fn(),
        views: [],
      };
      const mockWorkbook = {
        addWorksheet: jest.fn(() => mockWorksheet),
        xlsx: { writeBuffer: mockWriteBuffer },
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      const data = [{ name: 'John' }];
      await downloadAsType(data, 'xlsx', 'test.xlsx');

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Excel Export');
    });
  });

  describe('downloadAsType - PDF', () => {
    it('should download data as PDF', async () => {
      const mockOutput = jest.fn(() => new Blob());
      const mockDoc = {
        output: mockOutput,
        setFontSize: jest.fn(),
        text: jest.fn(),
      };

      JSPDF.mockImplementation(() => mockDoc);

      const data = [{ name: 'John', age: 30 }];
      await downloadAsType(data, 'pdf', 'test.pdf', 'My PDF');

      expect(JSPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'pt',
      });
      expect(mockOutput).toHaveBeenCalledWith('blob');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should truncate data to 1000 rows for PDF', async () => {
      const mockOutput = jest.fn(() => new Blob());
      const mockDoc = {
        output: mockOutput,
        setFontSize: jest.fn(),
        text: jest.fn(),
      };

      JSPDF.mockImplementation(() => mockDoc);

      const data = Array(2000).fill({ name: 'Test' });
      await downloadAsType(data, 'pdf', 'test.pdf', 'Title');

      expect(mockOutput).toHaveBeenCalled();
    });
  });
});
