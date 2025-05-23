/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const reportRunsStub = [{
  createDate: '2023-10-22T20:10:16.901960639Z',
  exportCsvStatus: 'EXPORT_SUCCESS',
  exportJsonStatus: null,
  parameters: '{"org_names":["Sales"]}',
  reportConfig: '{"parameters": {"org_names": {}}}',
  runId: 'job_0123',
  status: 'COMPLETED_SUCCESS',
},
{
  createDate: '2023-10-18T20:10:16.901960639Z',
  exportCsvStatus: null,
  exportJsonStatus: null,
  reportConfig: '{ "parameters": {"applications": {}} }',
  runId: 'job_4567',
  status: 'COMPLETED_SUCCESS',
},
{
  createDate: '2023-10-21T20:10:16.901960639Z',
  exportCsvStatus: null,
  exportJsonStatus: null,
  reportConfig: '{ "parameters": {"treeName": {}} }',
  runId: 'job_8910',
  status: 'COMPLETED_FAILED',
},
{
  createDate: '2023-10-20T20:11:16.901960639Z',
  exportCsvStatus: 'EXPORT_SUCCESS',
  exportJsonStatus: null,
  reportConfig: '{ "parameters": {"treeResult": {}} }',
  runId: 'job_1112',
  status: 'EXPIRED',
}];

export default reportRunsStub;
