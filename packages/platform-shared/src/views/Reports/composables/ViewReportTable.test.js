/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useViewReportTable from './ViewReportTable';

describe('Export Report composable', () => {
  it('Formats table data successfully when fetching data from the API', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({ result: [{ status: 'All', count: 0 }] }));
    const {
      fetchViewReport,
      tableItems,
    } = useViewReportTable();
    // Checking default values before fetching
    expect(tableItems.value).toHaveLength(0);
    await fetchViewReport('template-name', 'job_123abc', {});
    // Checking new values after fetching
    expect(tableItems.value).toHaveLength(1);
  });

  it('Displays an error message when the report has expired', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({ message: 'Report expired' }));
    const {
      fetchViewReport,
      expiredMessage,
      isExpired,
    } = useViewReportTable();
    // Checking default values before fetching
    expect(isExpired.value).toBe(false);
    expect(expiredMessage.value).toBe('');
    await fetchViewReport('template-name', 'job_123abc', {});
    // Checking new values after fetching
    expect(isExpired.value).toBe(true);
    expect(expiredMessage.value).not.toHaveLength(0);
  });

  it('Raise a flag when report has no data fo fill the table', async () => {
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({ result: [] }));
    const {
      fetchViewReport,
      isTableEmpty,
    } = useViewReportTable();
    // Checking default values before fetching
    expect(isTableEmpty.value).toBe(false);
    await fetchViewReport('template-name', 'job_123abc', {});
    // Checking new values after fetching
    expect(isTableEmpty.value).toBe(true);
  });
});
