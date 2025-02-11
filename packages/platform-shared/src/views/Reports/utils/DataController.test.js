/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ReportsApiHelper from './ReportsApiHelper';
import DATA_CONTROLLER from './DataController';

const { AM, IDM, IGA } = DATA_CONTROLLER;

describe('DATA_CONTROLLER', () => {
  it('should contain the expected properties within each controller service', () => {
    const AM_KEYS = ['amconfig', 'trees'];
    const IDM_KEYS = ['fetch', 'application', 'group', 'oauth2application', 'organization', 'role', 'teammember', 'user'];
    const IGA_KEYS = ['certification', 'entitlement', 'policy', 'request', 'rule', 'violation'];
    expect(Object.keys(DATA_CONTROLLER).length).toBe(3);
    expect(Object.keys(AM)).toEqual(AM_KEYS);
    expect(Object.keys(IDM)).toEqual(IDM_KEYS);
    expect(Object.keys(IGA)).toEqual(IGA_KEYS);
  });

  it('should contain the expected API functions for AM entities', () => {
    expect(AM.trees).toHaveProperty('fetch', ReportsApiHelper.requestTrees);
    expect(AM.amconfig).toHaveProperty('fetch', ReportsApiHelper.getAMTreesConfig);
  });

  it('should contain the expected API functions for IDM entities', () => {
    expect(IDM).toHaveProperty('fetch', ReportsApiHelper.managedResourcePropertyRequest);
    expect(IDM.oauth2application).toHaveProperty('fetch', ReportsApiHelper.getOauth2Clients);
    expect(IDM.teammember).toHaveProperty('fetch', ReportsApiHelper.getTeamMembers);
  });

  it('should contain the expected API functions for IGA entities', () => {
    expect(IGA.certification).toHaveProperty('fetch', ReportsApiHelper.getCertificationsForReports);
    expect(IGA.entitlement).toHaveProperty('fetch', ReportsApiHelper.getGovernanceResource);
    expect(IGA.policy).toHaveProperty('fetch', ReportsApiHelper.getGovPolicyList);
    expect(IGA.request).toHaveProperty('fetch', ReportsApiHelper.getRequestTypesForReports);
    expect(IGA.rule).toHaveProperty('fetch', ReportsApiHelper.getGovPolicyRuleList);
  });
});
