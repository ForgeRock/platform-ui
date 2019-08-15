import { expect } from 'chai';
import ApplicationStore from '@/store/Application';

describe('Application Store', () => {
  it('authHeaders state management', () => {
    expect(ApplicationStore.state.authHeaders).to.equal(null);

    ApplicationStore.setAuthHeadersAction({ 'test-header': 'test' });

    expect(JSON.stringify(ApplicationStore.state.authHeaders)).to.equal(JSON.stringify({ 'test-header': 'test' }));

    ApplicationStore.clearAuthHeadersAction();

    expect(ApplicationStore.state.authHeaders).to.equal(null);
  });

  it('loginRedirect state management', () => {
    expect(ApplicationStore.state.loginRedirect).to.equal(null);

    ApplicationStore.setLoginRedirect('testUrl');

    expect(ApplicationStore.state.loginRedirect).to.equal('testUrl');

    ApplicationStore.clearLoginRedirect();
  });
});
