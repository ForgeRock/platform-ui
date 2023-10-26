/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as CertificationApi from './CertificationApi';

/**
 * @constant
 * @type {Object}
 * @default
 */
const DEFAULT_PARAMS = {
  certId: 'cert-id-test',
  lineItemId: 'line-item-test-id',
};

/**
 * @constant
 * @type {Object}
 * @default
 */
const DEFAULT_BODY_PARAMS = {
  comment: '',
  newActorId: 'new-actor-test-id',
};

/**
 * @constant
 * @type {Object}
 * @default
 */
const DEFAULT_POST_DATA = {
  message: 'Action complete.',
  idsNotActedOn: [],
};

const governanceBaseUrl = '/governance';
const governanceCertificationBaseUrl = `${governanceBaseUrl}/certification`;
const governanceCertItemsBaseUrl = `${governanceCertificationBaseUrl}/${DEFAULT_PARAMS.certId}/items`;
const governanceCertLineItemsBaseUrl = `${governanceCertItemsBaseUrl}/${DEFAULT_PARAMS.lineItemId}`;

const get = jest.fn();
const post = jest.fn();
const put = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({ get, post, put }));

describe('Governace API', () => {
  it('certifyItem called with right args', async () => {
    post.mockReturnValue(Promise.resolve(DEFAULT_POST_DATA));

    const response = await CertificationApi.certifyItem(DEFAULT_PARAMS.certId, DEFAULT_PARAMS.lineItemId);
    expect(post).toBeCalledWith(`${governanceCertLineItemsBaseUrl}/certify`);
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(response).toEqual(DEFAULT_POST_DATA);
  });

  it('revokeItem called with right args', async () => {
    post.mockReturnValue(Promise.resolve(DEFAULT_POST_DATA));

    const { comment } = DEFAULT_BODY_PARAMS;
    const response = await CertificationApi.revokeItem(DEFAULT_PARAMS.certId, DEFAULT_PARAMS.lineItemId);
    expect(post).toBeCalledWith(`${governanceCertLineItemsBaseUrl}/revoke`, { comment });
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(response).toEqual(DEFAULT_POST_DATA);
  });

  it('exceptionItem called with right args', async () => {
    post.mockReturnValue(Promise.resolve(DEFAULT_POST_DATA));

    const { comment } = DEFAULT_BODY_PARAMS;
    const response = await CertificationApi.exceptionItem(DEFAULT_PARAMS.certId, DEFAULT_PARAMS.lineItemId);
    expect(post).toBeCalledWith(`${governanceCertLineItemsBaseUrl}/exception`, { comment });
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(response).toEqual(DEFAULT_POST_DATA);
  });

  it('reassignItem called with right args', async () => {
    const certId = '95a7ce21-a7a8-4da8-b59c-a47574411809';
    const lineItemId = '9986d9a5-5ffd-4046-8643-c34a60cddb6e';
    const newActorId = 'managed/user/2cdfc1d4-a206-435b-b22e-a5ed8804f4af';
    const permissions = {
      accept: true,
      certify: true,
      challenge: true,
      comment: true,
      consult: true,
      delegate: true,
      exception: true,
      forward: true,
      reassign: true,
      removeActor: true,
      reset: true,
      revoke: true,
      save: true,
      signoff: true,
    };

    post.mockReturnValue(Promise.resolve(DEFAULT_POST_DATA));

    const response = await CertificationApi.reassignItem(
      certId,
      lineItemId,
      newActorId,
      permissions,
    );
    expect(post).toBeCalledWith(`${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/reassign`, { newActorId, permissions });
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(response).toEqual(DEFAULT_POST_DATA);
  });

  it('forwardItem called with right args', async () => {
    post.mockReturnValue(Promise.resolve(DEFAULT_POST_DATA));

    const response = await CertificationApi.forwardItem(
      DEFAULT_PARAMS.certId,
      DEFAULT_PARAMS.lineItemId,
      DEFAULT_BODY_PARAMS.comment,
      DEFAULT_BODY_PARAMS.newActorId,
    );
    expect(post).toBeCalledWith(`${governanceCertLineItemsBaseUrl}/forward`, DEFAULT_BODY_PARAMS);
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(response).toEqual(DEFAULT_POST_DATA);
  });

  it('saveComment called with right args', async () => {
    const certId = '95a7ce21-a7a8-4da8-b59c-a47574411809';
    const lineItemId = '9986d9a5-5ffd-4046-8643-c34a60cddb6e';
    const comment = 'test comment';
    const responseData = { comment };

    post.mockReturnValue(Promise.resolve(responseData));

    const response = await CertificationApi.saveComment(certId, lineItemId, comment);

    expect(post).toBeCalledWith(`${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/comment`, { comment });
    expect(response).toEqual(responseData);
  });

  it('activateCertification called with right args', async () => {
    const certId = '95a7ce21-a7a8-4da8-b59c-a47574411809';

    post.mockReturnValue(Promise.resolve({}));

    await CertificationApi.activateCertification(certId);

    expect(post).toBeCalledWith(`${governanceCertificationBaseUrl}/${certId}/activate`);
  });

  it('updateActors should call API correctly', async () => {
    const itemId = '9986d9a5-5ffd-4046-8643-c34a60cddb6e';
    const actors = [
      {
        userName: 'chughes',
        givenName: 'Chip',
        sn: 'Hughes',
        id: 'managed/user/9fba1739-950b-4e66-8308-bb46c6300074',
        mail: 'Chip.Hughes@ForgeRock.com',
        permissions: {
          comment: true,
          delegate: true,
          forward: true,
          reassign: true,
          consult: true,
          signoff: true,
          certify: true,
          exception: true,
          revoke: true,
          reset: true,
          save: true,
          removeActor: true,
          accept: true,
          challenge: true,
        },
      },
      {
        mail: 'aanderson@example.net',
        givenName: 'Alicia',
        id: 'managed/user/246dbf9c-cdb0-4dd4-8da1-ef1ee688eee2',
        sn: 'Anderson',
        userName: 'aanderson',
        permissions: {
          certify: true,
          revoke: true,
          exception: true,
          reset: true,
          comment: true,
          reassign: true,
          forward: true,
          signoff: true,
        },
      },
    ];
    put.mockReturnValue(Promise.resolve({}));

    await CertificationApi.updateActors(itemId, actors);

    expect(put).toHaveBeenCalledWith(`${governanceCertificationBaseUrl}/items/${itemId}/actors`, { actors });
  });

  it('getEntitlementDetails should call API correctly', async () => {
    const campaignId = '9986d9a5-5ffd-4046-8643-c34a60cddb6f';
    const itemId = '9986d9a5-5ffd-4046-8643-c34a60cddb6e';

    get.mockReturnValue(Promise.resolve({}));

    await CertificationApi.getEntitlementDetails(campaignId, itemId);

    expect(get).toHaveBeenCalledWith(`${governanceCertificationBaseUrl}/${campaignId}/items/${itemId}/entitlement`);
  });

  it('getCertificationCounts should call API correctly with primaryReviewerId if it is admin', async () => {
    const campaignId = 'campaignId';
    const actorId = 'actorId';
    const isAdmin = true;
    const taskStatus = 'active';

    get.mockReturnValue(Promise.resolve({}));

    await CertificationApi.getCertificationCounts(campaignId, actorId, isAdmin, taskStatus);

    expect(get).toHaveBeenCalledWith(`${governanceCertificationBaseUrl}/${campaignId}/items?getCount=true&isAdmin=${isAdmin}&taskStatus=${taskStatus}&primaryReviewerId=${actorId}`);
  });

  it('getCertificationCounts should call API correctly with actorId if it is not admin', async () => {
    const campaignId = 'campaignId';
    const actorId = 'actorId';
    const isAdmin = false;
    const taskStatus = 'active';

    get.mockReturnValue(Promise.resolve({}));

    await CertificationApi.getCertificationCounts(campaignId, actorId, isAdmin, taskStatus);

    expect(get).toHaveBeenCalledWith(`${governanceCertificationBaseUrl}/${campaignId}/items?getCount=true&isAdmin=${isAdmin}&taskStatus=${taskStatus}&actorId=${actorId}`);
  });
});
