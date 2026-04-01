/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import * as EventApi from './EventApi';

const eventUrl = '/governance/event';
const deleteMock = jest.fn();
const getMock = jest.fn();
const patchMock = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  delete: deleteMock,
  get: getMock,
  patch: patchMock,
}));

describe('Event API', () => {
  it('getEventList should call api with correct parameters', async () => {
    const params = { page: 1 };

    await EventApi.getEventList(params);

    expect(getMock).toBeCalledWith(`${eventUrl}${encodeQueryString(params)}`);
  });

  it('updateEvent should call api with correct parameters', async () => {
    const update = { status: 'active' };
    const eventId = '123';

    await EventApi.updateEvent(eventId, update);

    expect(patchMock).toBeCalledWith(`${eventUrl}/${eventId}`, update);
  });

  it('deleteEvent should call api with correct parameters', async () => {
    const eventId = '123';

    await EventApi.deleteEvent(eventId);

    expect(deleteMock).toBeCalledWith(`${eventUrl}/${eventId}`);
  });
});
