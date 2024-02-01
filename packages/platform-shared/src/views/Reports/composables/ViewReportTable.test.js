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
});
