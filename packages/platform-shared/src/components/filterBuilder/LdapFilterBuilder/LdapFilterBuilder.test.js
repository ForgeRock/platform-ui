/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import LdapFilterBuilder from './index';

const basicFilter = {
  operator: 'or',
  subfilters: [{
    operator: '=',
    field: '1',
    value: 'one',
  }],
};

const basicNotFilter = {
  operator: 'or',
  subfilters: [
    {
      operator: '!=',
      field: '1',
      value: 'one',
    },
  ],
};

const basicAndFilter = {
  operator: 'and',
  subfilters: [
    {
      operator: '=',
      field: '1',
      value: 'one',
    },
    {
      operator: '=',
      field: '2',
      value: 'two',
    },
  ],
};

const basicOrFilter = {
  operator: 'or',
  subfilters: [
    {
      operator: '=',
      field: '1',
      value: 'one',
    },
    {
      operator: '=',
      field: '2',
      value: 'two',
    },
  ],
};

describe('LdapFilterBuilder', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(LdapFilterBuilder, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        value: '(1=one)',
      },
    });
  });

  it('LdapFilterBuilder successfully loaded', () => {
    expect(wrapper.name()).toEqual('LdapFilterBuilder');
  });

  it('sets filter object on mount', () => {
    expect(wrapper.vm.queryFilter).toEqual(basicFilter);
  });

  describe('setFilterObject', () => {
    it('basic filter', () => {
      wrapper.vm.setFilterObject('(1=one)');
      expect(wrapper.vm.queryFilter).toEqual(basicFilter);
    });

    it('basic AND filter', () => {
      wrapper.vm.setFilterObject('(&(1=one)(2=two))');
      expect(wrapper.vm.queryFilter).toEqual(basicAndFilter);
    });

    it('basic OR filter', () => {
      wrapper.vm.setFilterObject('(|(1=one)(2=two))');
      expect(wrapper.vm.queryFilter).toEqual(basicOrFilter);
    });

    it('basic NOT filter', () => {
      wrapper.vm.setFilterObject('(!(1=one))');
      expect(wrapper.vm.queryFilter).toEqual(basicNotFilter);
    });

    it('detects complex not filter and changes to advanced editor', () => {
      wrapper.vm.setFilterObject('(!(|(1=one)(2=two)))');
      expect(wrapper.vm.allowBasic).toBe(false);
      expect(wrapper.vm.isBasic).toBe(false);
    });

    it('detects too many nesing levels and changes to advanced editor', () => {
      wrapper.vm.setFilterObject('(((((2=two)))))');
      expect(wrapper.vm.allowBasic).toBe(false);
      expect(wrapper.vm.isBasic).toBe(false);
    });

    // these came from https://confluence.atlassian.com/kb/how-to-write-ldap-search-filters-792496933.html
    describe('complex', () => {
      it('This will only synchronize users in the "CaptainPlanet" group', () => {
        const filterString = '(&(objectCategory=Person)(sAMAccountName=*)(memberOf=cn=CaptainPlanet,ou=users,dc=company,dc=com))';
        wrapper.vm.setFilterObject(filterString);
        expect(wrapper.vm.queryFilter).toEqual({
          operator: 'and',
          subfilters: [
            {
              operator: '=',
              field: 'objectCategory',
              value: 'Person',
            },
            {
              field: 'sAMAccountName',
              operator: '=',
              value: '*',
            },
            {
              operator: '=',
              field: 'memberOf',
              value: 'cn=CaptainPlanet,ou=users,dc=company,dc=com',
            },
          ],
        });
      });

      it('This will search for users who are a member of any or all the 4 groups (fire, wind, water, heart)', () => {
        const filterString = '(&(objectCategory=Person)(sAMAccountName=*)(|(memberOf=cn=fire,ou=users,dc=company,dc=com)(memberOf=cn=wind,ou=users,dc=company,dc=com)(memberOf=cn=water,ou=users,dc=company,dc=com)(memberOf=cn=heart,ou=users,dc=company,dc=com)))';
        wrapper.vm.setFilterObject(filterString);
        expect(wrapper.vm.queryFilter).toEqual({
          operator: 'and',
          subfilters: [
            {
              operator: '=',
              field: 'objectCategory',
              value: 'Person',
            },
            {
              field: 'sAMAccountName',
              operator: '=',
              value: '*',
            },
            {
              operator: 'or',
              subfilters: [
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=fire,ou=users,dc=company,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=wind,ou=users,dc=company,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=water,ou=users,dc=company,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=heart,ou=users,dc=company,dc=com',
                },
              ],
            },
          ],
        });
      });

      it('This will search for users that have an email address and are a member of any or all of the groups in the filter below', () => {
        const filterString = '(&(objectCategory=Person)(sAMAccountName=*)(mail=*)(|(memberOf=cn=fire,OU=Atlassian Groups,dc=xxxx,dc=com)(memberOf=cn=wind,OU=Atlassian Groups,dc=xxxx,dc=com)(memberOf=cn=water,OU=Atlassian Groups,dc=xxxx,dc=com)(memberOf=cn=heart,OU=Atlassian Groups,dc=xxxx,dc=xxxx)))';
        wrapper.vm.setFilterObject(filterString);
        expect(wrapper.vm.queryFilter).toEqual({
          operator: 'and',
          subfilters: [
            {
              operator: '=',
              field: 'objectCategory',
              value: 'Person',
            },
            {
              field: 'sAMAccountName',
              operator: '=',
              value: '*',
            },
            {
              field: 'mail',
              operator: '=',
              value: '*',
            },
            {
              operator: 'or',
              subfilters: [
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=fire,OU=Atlassian Groups,dc=xxxx,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=wind,OU=Atlassian Groups,dc=xxxx,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=water,OU=Atlassian Groups,dc=xxxx,dc=com',
                },
                {
                  operator: '=',
                  field: 'memberOf',
                  value: 'cn=heart,OU=Atlassian Groups,dc=xxxx,dc=xxxx',
                },
              ],
            },
          ],
        });
      });
    });
  });

  describe('toFilterString', () => {
    it('basic filter', () => {
      const filterString = wrapper.vm.toFilterString(basicFilter);
      expect(filterString).toEqual('(1=one)');
    });
    it('basic AND filter', () => {
      const filterString = wrapper.vm.toFilterString(basicAndFilter);
      expect(filterString).toEqual('(&(1=one)(2=two))');
    });
    it('basic OR filter', () => {
      const filterString = wrapper.vm.toFilterString(basicOrFilter);
      expect(filterString).toEqual('(|(1=one)(2=two))');
    });
    it('basic NOT filter', () => {
      const filterString = wrapper.vm.toFilterString(basicNotFilter);
      expect(filterString).toEqual('(!(1=one))');
    });
  });

  describe('isAdvancedFilter', () => {
    it('returns false when filter contains no NOT operators', () => {
      const complexNone = wrapper.vm.isAdvancedFilter(basicFilter);
      expect(complexNone).toBe(false);
    });
    it('returns false when filter contains NOT operator that is not complex', () => {
      const complexNone = wrapper.vm.isAdvancedFilter(basicNotFilter);
      expect(complexNone).toBe(false);
    });
    it('returns true when filter contains NOT operator that is complex', () => {
      const filter = {
        operator: 'not',
        subfilters: [
          {
            operator: 'or',
            subfilters: [{
              operator: '=',
              field: '1',
              value: 'one',
            }],
          },
        ],
      };
      const complexNone = wrapper.vm.isAdvancedFilter(filter);
      expect(complexNone).toBe(true);
    });

    it('returns true when filter contains an unrecognized operator', () => {
      const filter = {
        operator: 'or',
        subfilters: [
          {
            operator: 'badoperator',
            subfilters: [{
              operator: '=',
              field: '1',
              value: 'one',
            }],
          },
        ],
      };
      expect(wrapper.vm.isAdvancedFilter(filter)).toBe(true);
    });

    it('returns true when filter contains an unrecognized condition', () => {
      const filter = {
        operator: 'or',
        subfilters: [
          {
            operator: 'or',
            subfilters: [{
              operator: 'badcondition',
              field: '1',
              value: 'one',
            }],
          },
        ],
      };
      expect(wrapper.vm.isAdvancedFilter(filter)).toBe(true);
    });
  });

  describe('negateFilter', () => {
    it('changes operator to or and pushes negation into subfilter', () => {
      const negated = wrapper.vm.negateFilter(basicNotFilter);
      expect(negated).toEqual({
        operator: 'or',
        subfilters: [{ operator: '!=', field: '1', value: 'one' }],
      });
    });

    it('handles a top level "not" by nesting it in an "or" filter', () => {
      const negated = wrapper.vm.negateFilter({
        operator: 'not',
        subfilters: [{ operator: '=', field: '1', value: 'one' }],
      });
      expect(negated).toEqual({
        operator: 'or',
        subfilters: [{ operator: '!=', field: '1', value: 'one' }],
      });
    });

    it('handles a nested "not"', () => {
      const negated = wrapper.vm.negateFilter({
        operator: 'or',
        subfilters: [{
          operator: 'or',
          subfilters: [{
            operator: 'not',
            subfilters: [{ operator: '=', field: '1', value: 'one' }],
          }],
        }],
      });

      expect(negated).toEqual({
        operator: 'or',
        subfilters: [{
          operator: 'or',
          subfilters: [{ operator: '!=', field: '1', value: 'one' }],
        }],
      });
    });
  });
});
