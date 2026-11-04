/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RoleMiningSessionApi from './RoleMiningSessionApi';

let get;
let post;
let patch;
let del;
const sessionUrl = '/governance/popRoleMining/sessions';
const userPropertiesUrl = '/governance/popRoleMining/userProperties';
const data = { result: [], totalCount: 0 };

describe('Role Mining Session API', () => {
  beforeEach(() => {
    get = jest.fn();
    post = jest.fn();
    patch = jest.fn();
    del = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      get,
      post,
      patch,
      delete: del,
    }));
    get.mockReturnValue(Promise.resolve(data));
    post.mockReturnValue(Promise.resolve(data));
    patch.mockReturnValue(Promise.resolve(data));
    del.mockReturnValue(Promise.resolve(data));
  });

  it('should call the session list endpoint with the correct url and no params', async () => {
    await RoleMiningSessionApi.getRoleMiningSessionList();
    expect(get).toBeCalledWith(sessionUrl);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call the session list endpoint with the correct url including query params', async () => {
    await RoleMiningSessionApi.getRoleMiningSessionList({ _pagedResultsOffset: 0, _pageSize: 10 });
    expect(get).toBeCalledWith(`${sessionUrl}?_pagedResultsOffset=0&_pageSize=10`);
  });

  it('should call the get session endpoint with the correct url', async () => {
    await RoleMiningSessionApi.getRoleMiningSession('session-1');
    expect(get).toBeCalledWith(`${sessionUrl}/session-1`);
  });

  it('should call the create session endpoint with the correct url and body', async () => {
    const session = { filterCriteria: { department: 'engineering' } };
    await RoleMiningSessionApi.createRoleMiningSession(session);
    expect(post).toBeCalledWith(sessionUrl, session);
  });

  it('should call the run session endpoint with the correct url', async () => {
    await RoleMiningSessionApi.runRoleMiningSession('session-1');
    expect(post).toBeCalledWith(`${sessionUrl}/session-1/run`);
  });

  it('should call the session roles endpoint with the correct url', async () => {
    await RoleMiningSessionApi.getRoleMiningSessionRoles('session-1');
    expect(get).toBeCalledWith(`${sessionUrl}/session-1/roles`);
  });

  it('should call the delete session endpoint with the correct url', async () => {
    await RoleMiningSessionApi.deleteRoleMiningSession('session-1');
    expect(del).toBeCalledWith(`${sessionUrl}/session-1`);
  });

  it('should call the user properties endpoint with the correct url', async () => {
    await RoleMiningSessionApi.getRoleMiningUserProperties();
    expect(get).toBeCalledWith(userPropertiesUrl);
  });

  it('should call the user property values endpoint with the correct url', async () => {
    await RoleMiningSessionApi.getRoleMiningUserPropertyValues('department');
    expect(get).toBeCalledWith(`${userPropertiesUrl}/department/values`);
  });

  it('should call the user property values endpoint with query params', async () => {
    await RoleMiningSessionApi.getRoleMiningUserPropertyValues('department', { _pageSize: 50 });
    expect(get).toBeCalledWith(`${userPropertiesUrl}/department/values?_pageSize=50`);
  });
});
