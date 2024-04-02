/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getThemeId,
  parseStage,
  setStageValue,
  isJSON,
} from './stage';

it('parses stage', () => {
  const objectString = '{"themeId":"testThemeId"}';
  const object = { themeId: 'testThemeId' };
  const string = 'themeId=testThemeId';

  expect(parseStage(null)).toEqual(null);
  expect(parseStage(objectString)).toEqual(object);
  expect(parseStage(object)).toEqual(object);
  expect(parseStage(string)).toEqual('themeId=testThemeId');
});

it('gets theme id', () => {
  const stageValueObject = { themeId: 'testThemeId', otherData: { test: 'test' } };
  const stageValueString = 'themeId=testThemeId';

  expect(getThemeId(null)).toEqual('');
  expect(getThemeId(stageValueString)).toEqual('testThemeId');
  expect(getThemeId(stageValueObject)).toEqual('testThemeId');
});

it('sets stage value', () => {
  const pageNode = {
    template: {
      stage: 'themeId=test',
    },
  };
  let id = 'pageNode';
  let key = 'themeId';
  let value = 'highlander';

  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"highlander"}');

  value = 'zardoz';
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz"}');

  id = 'subNode1';
  key = 'ValidatedCreatePasswordCallback.confirmPassword';
  value = true;
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz","ValidatedCreatePasswordCallback":[{"id":"subNode1","confirmPassword":true}]}');

  key = 'ValidatedCreatePasswordCallback.policyDisplayCheckmark';
  value = true;
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz","ValidatedCreatePasswordCallback":[{"id":"subNode1","confirmPassword":true,"policyDisplayCheckmark":true}]}');

  value = false;
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz","ValidatedCreatePasswordCallback":[{"id":"subNode1","confirmPassword":true}]}');

  id = 'subNode2';
  key = 'ValidatedCreatePasswordCallback.confirmPassword';
  value = true;
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz","ValidatedCreatePasswordCallback":[{"id":"subNode1","confirmPassword":true},{"id":"subNode2","confirmPassword":true}]}');

  value = false;
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz","ValidatedCreatePasswordCallback":[{"id":"subNode1","confirmPassword":true}]}');

  id = 'subNode1';
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('{"themeId":"zardoz"}');

  key = 'themeId';
  id = 'pageNode';
  value = '';
  setStageValue(pageNode, id, key, value);
  expect(pageNode.template.stage).toEqual('');
});

it('checks if string is a valid JSON', () => {
  const objectString = '{"themeId":"testThemeId"}';
  const object = { themeId: 'testThemeId' };
  const string = 'themeId=testThemeId';

  expect(isJSON(null)).toEqual(false);
  expect(isJSON(objectString)).toEqual(true);
  expect(isJSON(object)).toEqual(false);
  expect(isJSON(string)).toEqual(false);
});
