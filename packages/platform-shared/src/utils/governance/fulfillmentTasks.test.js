/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import { getBasicFilter, getPriorityFilter, getActivePhaseFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getTaskFilter, buildTaskDisplay } from './fulfillmentTasks';

jest.mock('dayjs');

describe('getTaskFilter', () => {
  it('generates filter object with assignee, priorities, and taskName', () => {
    const filter = {
      assignee: 'user123',
      priorities: {
        high: true, medium: false, low: true, none: false,
      },
      taskName: 'task1',
    };
    const expectedFilter = {
      operand: [
        getBasicFilter('EQUALS', 'decision.actors.active.id', 'user123'),
        getPriorityFilter(filter.priorities),
        getActivePhaseFilter('task1'),
      ],
      operator: 'AND',
    };

    expect(getTaskFilter(filter)).toStrictEqual(expectedFilter);
  });

  it('generates filter object with only assignee', () => {
    const filter = { assignee: 'user123' };
    const expectedFilter = {
      operand: [getBasicFilter('EQUALS', 'decision.actors.active.id', 'user123')],
      operator: 'AND',
    };

    expect(getTaskFilter(filter)).toStrictEqual(expectedFilter);
  });

  it('generates filter object with only priorities', () => {
    const filter = {
      priorities: {
        high: true, medium: false, low: true, none: false,
      },
    };
    const expectedFilter = {
      operand: [getPriorityFilter(filter.priorities)],
      operator: 'AND',
    };

    expect(getTaskFilter(filter)).toStrictEqual(expectedFilter);
  });

  it('generates filter object with only taskName', () => {
    const filter = { taskName: 'task1' };
    const expectedFilter = {
      operand: [getActivePhaseFilter('task1')],
      operator: 'AND',
    };

    expect(getTaskFilter(filter)).toStrictEqual(expectedFilter);
  });

  it('returns empty filter object if no filter criteria provided', () => {
    const filter = {};
    const expectedFilter = {
      operand: [],
      operator: 'AND',
    };

    expect(getTaskFilter(filter)).toStrictEqual(expectedFilter);
  });
});

describe('buildTaskDisplay', () => {
  it('converts task objects to display format', () => {
    const tasks = [
      {
        id: 'task1',
        phases: [{ name: 'phase1' }],
        decision: {
          phases: [{ name: 'phase1', displayName: 'Phase 1', startDate: '2023-01-01' }],
          actors: {
            active: [{
              phase: 'phase1', givenName: 'John', sn: 'Doe', userName: 'jdoe',
            }],
            inactive: [],
          },
        },
        request: { common: { priority: 'high' } },
      },
    ];

    // i18n.global.t.mockReturnValue('John Doe');
    dayjs.mockReturnValue({ format: () => 'Jan 1, 2023' });

    const expectedDisplay = [
      {
        details: {
          id: 'task1',
          assignee: 'John Doe',
          name: 'Phase 1',
          priority: 'high',
          assignedDate: 'Jan 1, 2023',
        },
        rawData: tasks[0],
      },
    ];

    expect(buildTaskDisplay(tasks)).toStrictEqual(expectedDisplay);
  });

  it('handles tasks with missing phase information', () => {
    const tasks = [
      {
        id: 'task1',
        phases: [],
        decision: {
          phases: [],
          actors: { active: [], inactive: [] },
        },
        request: { common: { priority: 'high' } },
      },
    ];

    const expectedDisplay = [
      {
        details: {
          id: 'task1',
          assignee: '',
          name: '',
          priority: 'high',
          assignedDate: '',
        },
        rawData: tasks[0],
      },
    ];

    expect(buildTaskDisplay(tasks)).toStrictEqual(expectedDisplay);
  });
});