/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as VioaltionApi from './ViolationApi';

const post = jest.fn();
const get = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
  post,
}));
const data = { result: [], totalCount: 0 };
post.mockReturnValue(Promise.resolve(data));
get.mockReturnValue(Promise.resolve(data));

describe('ViolationsApi API', () => {
  it('should call getViolationList with correct payload and url', async () => {
    const queryParams = {
      pageNumber: 0, pageSize: 10, queryFilter: 'nome co test',
    };
    const targetFilter = {
      operator: 'AND',
      operand: [{
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.status',
          targetValue: 'pending',
        },
      }],
    };
    const res = await VioaltionApi.getViolationList(queryParams, targetFilter);
    expect(post).toHaveBeenCalledWith('/governance/violation/search?_pageNumber=0&_pageSize=10&_queryFilter=nome%20co%20test', { targetFilter });
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call getViolationList with correct payload and url for end user', async () => {
    const queryParams = {
      _pageNumber: 0, _pageSize: 10, _queryFilter: 'nome co test',
    };
    const targetFilter = {
      operator: 'AND',
      operand: [{
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.status',
          targetValue: 'pending',
        },
      }],
    };
    const res = await VioaltionApi.getViolationListEndUser(queryParams, targetFilter);
    expect(post).toHaveBeenCalledWith('/governance/user/violation/search?_pageNumber=0&_pageSize=10&_queryFilter=nome%20co%20test', { targetFilter });
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call getViolation with correct url', async () => {
    const res = await VioaltionApi.getViolation('testId');
    expect(get).toHaveBeenCalledWith('/governance/violation/testId');
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call commentViolation with correct payload and url', async () => {
    const comment = { comment: 'testComment' };
    const res = await VioaltionApi.commentViolation('testId', 'testPhase', comment);
    expect(post).toHaveBeenCalledWith('/governance/violation/testId/phases/testPhase/comment', { comment });
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call forwardViolation with correct payload and url', async () => {
    const permissions = { testPermissions: true };
    const comment = { comment: 'testComment' };

    const res = await VioaltionApi.forwardViolation('testId', 'testPhase', 'newActorId', permissions, comment);
    expect(post).toHaveBeenCalledWith('/governance/violation/testId/phases/testPhase/reassign', { updatedActors: [{ id: 'newActorId', permissions }], comment });
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call allowException with correct url when payload has exceptionExpirationDate', async () => {
    const payload = {
      comment: 'testComment',
      exceptionExpirationDate: '2024-12-17',
    };
    const res = await VioaltionApi.allowException('testId', 'testPhase', payload);
    expect(post).toHaveBeenCalledWith('/governance/violation/testId/phases/testPhase/exception', payload);
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call allowException with correct url when payload does not have exceptionExpirationDate', async () => {
    const payload = { comment: 'testComment' };
    const res = await VioaltionApi.allowException('testId', 'testPhase', payload);
    expect(post).toHaveBeenCalledWith('/governance/violation/testId/phases/testPhase/allow', payload);
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call revokeException with correct dataObject and url', async () => {
    const dataObject = {
      ids: ['test-id'],
      comment: 'testComment',
    };

    const res = await VioaltionApi.revokeException(dataObject);
    expect(post).toHaveBeenCalledWith('/governance/violation/cancel-exception', dataObject);
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  it('should call remediate with correct dataObject and url', async () => {
    const dataObject = {
      ids: ['1', '2'],
    };

    const res = await VioaltionApi.remediate('12345', '6789', { ids: ['1', '2'] });
    expect(post).toHaveBeenCalledWith('/governance/violation/12345/phases/6789/remediate', dataObject);
    expect(BaseApi.generateIgaApi).toHaveBeenCalled();
    expect(res).toEqual(data);
  });
});
