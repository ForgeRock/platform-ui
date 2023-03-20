import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as GovernanceEnduserApi from './GovernanceEnduserApi';

describe('Governance Enduser API', () => {
  it('should call Direct Reports Endpoint with correct payload and url', async () => {
    const get = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      get,
    }));
    const data = { result: [], totalCount: 0 };
    get.mockReturnValue(Promise.resolve(data));
    const userId = 'testid';
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'username', sortDir: 'asc',
    };
    const res = await GovernanceEnduserApi.getDirectReports(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/get-direct-reports?pageNumber=1&pageSize=10&sortBy=username&sortDir=asc');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
