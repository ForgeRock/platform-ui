/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import reportViewGuard from './reportViewGuard';

// In platform-shared tests the `@/` alias resolves to the shared store, which has no
// root `realm` — mock it the same way RealmMixin.test.js and AutoApi.test.js do.
jest.mock('@/store', () => ({
  state: {
    realm: 'alpha',
  },
}));

const to = {
  params: {
    id: 'job_123abc',
    state: 'published',
    template: 'template-name',
  },
};
const from = { name: 'Dashboard' };
let next;

describe('reportViewGuard', () => {
  beforeEach(() => {
    AutoApi.getReportRuns = jest.fn();
    next = jest.fn();
  });

  describe('@actions', () => {
    it('allows navigation when the run is visible (non-empty result)', async () => {
      AutoApi.getReportRuns.mockReturnValueOnce(Promise.resolve({ result: [{ id: 'job_123abc' }] }));
      await reportViewGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('redirects to Forbidden when getReportRuns rejects (e.g. 403)', async () => {
      AutoApi.getReportRuns.mockReturnValueOnce(Promise.reject(new Error('Request failed with status code 403')));
      await reportViewGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });

    it('redirects to Forbidden when result is an empty array', async () => {
      AutoApi.getReportRuns.mockReturnValueOnce(Promise.resolve({ result: [] }));
      await reportViewGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });

    it('redirects to Forbidden when result is missing', async () => {
      AutoApi.getReportRuns.mockReturnValueOnce(Promise.resolve({}));
      await reportViewGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });

    it('redirects to Forbidden when getReportRuns throws synchronously (fail closed)', async () => {
      AutoApi.getReportRuns.mockImplementationOnce(() => {
        throw new Error('unexpected failure');
      });
      await reportViewGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });
  });

  describe('@params', () => {
    it('calls getReportRuns with the params mapping matching the component mount call', async () => {
      AutoApi.getReportRuns.mockReturnValueOnce(Promise.resolve({ result: [{ id: 'job_123abc' }] }));
      await reportViewGuard(to, from, next);

      expect(AutoApi.getReportRuns).toHaveBeenCalledWith({
        name: 'template-name',
        realm: 'alpha',
        runId: 'job_123abc',
        templateType: 'published',
      });
    });
  });
});
