/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RoleApi from './RoleApi';

let get;
let post;
let put;
let patch;
let del;
const data = { result: [], totalCount: 0 };

describe('Role API', () => {
  beforeEach(() => {
    get = jest.fn();
    post = jest.fn();
    put = jest.fn();
    patch = jest.fn();
    del = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      get,
      post,
      put,
      patch,
      delete: del,
    }));
    post.mockReturnValue(Promise.resolve(data));
    get.mockReturnValue(Promise.resolve(data));
    put.mockReturnValue(Promise.resolve(data));
    patch.mockReturnValue(Promise.resolve(data));
    del.mockReturnValue(Promise.resolve(data));
  });

  it('should get a list of roles with the correct url', async () => {
    await RoleApi.getRoleList('role', { roleStatus: 'active' });
    expect(get).toBeCalledWith('governance/role?roleStatus=active');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should get role data by id with the correct url', async () => {
    await RoleApi.getRoleDataById('roleId', 'draft', 'members');
    expect(get).toBeCalledWith('governance/role/roleId/draft/members');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should delete a role with the correct url', async () => {
    await RoleApi.deleteRole('roleId', 'draft');
    expect(del).toBeCalledWith('governance/role/roleId/draft');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should create a role with the correct url and payload', async () => {
    const payload = { role: { name: 'My Role' } };
    await RoleApi.createRole(payload);
    expect(post).toBeCalledWith('governance/role', payload);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should modify a role with the correct url and payload', async () => {
    const payload = { role: { name: 'My Role' } };
    await RoleApi.modifyRole('roleId', 'draft', payload);
    expect(put).toBeCalledWith('governance/role/roleId/draft', payload);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should publish a role with the correct url and payload', async () => {
    const payload = { role: { name: 'My Role' } };
    await RoleApi.publishRole('roleId', 'draft', payload);
    expect(patch).toBeCalledWith('governance/role/roleId/draft', payload);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should check role similarity on create with the correct url and payload', async () => {
    const payload = {
      entitlements: ['ent1', 'ent2'],
      excludeRoleId: 'candidateId',
      threshold: 30,
      limit: 10,
    };
    await RoleApi.getRoleSimilarity(payload);
    expect(post).toBeCalledWith('governance/role/similarity', payload);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should check role similarity on update with the correct url', async () => {
    await RoleApi.getRoleSimilarityById('roleId', 'draft');
    expect(get).toBeCalledWith('governance/role/roleId/draft/similarity');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should pass the threshold as a query parameter when checking similarity on update', async () => {
    await RoleApi.getRoleSimilarityById('roleId', 'draft', { threshold: 50 });
    expect(get).toBeCalledWith('governance/role/roleId/draft/similarity?threshold=50');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });
});
