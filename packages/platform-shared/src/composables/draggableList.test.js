/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import useDraggableList from './draggableList';

describe('useDraggableList', () => {
  let initialList;
  let getItemId;

  beforeEach(() => {
    initialList = [
      { id: 'a', label: 'Item A' },
      { id: 'b', label: 'Item B' },
      { id: 'c', label: 'Item C' },
    ];
    getItemId = (item) => item.id;
    // Mock document.querySelector and element.focus
    global.document = {
      querySelector: jest.fn(() => ({
        focus: jest.fn(),
      })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with the provided list', () => {
    const { draggableList } = useDraggableList(initialList, {});
    expect(draggableList.value).toEqual(initialList);
  });

  it('returns correct ARIA label', () => {
    const { listAriaLabel } = useDraggableList(initialList, {});
    expect(listAriaLabel).toBe('Draggable list');
    const { listAriaLabel: customLabel } = useDraggableList(initialList, { listAriaLabel: 'Custom Label' });
    expect(customLabel).toBe('Custom Label');
  });

  it('getItemProps returns correct props', () => {
    const { getItemProps } = useDraggableList(initialList, { getItemId });
    const props = getItemProps(initialList[1], 1);
    expect(props).toMatchObject({
      'list-item-id': 'b',
      role: 'listitem',
      tabindex: 0,
    });
    expect(typeof props.onKeydown).toBe('function');
  });

  it('moves item up with ArrowUp key', async () => {
    jest.spyOn(document, 'querySelector');
    const { draggableList, getItemProps } = useDraggableList(initialList, { getItemId });
    const props = getItemProps(initialList[1], 1);
    const event = { key: 'ArrowUp', preventDefault: jest.fn() };
    props.onKeydown(event);
    await nextTick();
    expect(draggableList.value.map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.querySelector).toHaveBeenCalledWith('[list-item-id="a"]');
  });

  it('moves item down with ArrowDown key', async () => {
    const { draggableList, getItemProps } = useDraggableList(initialList, { getItemId });
    const props = getItemProps(initialList[1], 1);
    const event = { key: 'ArrowDown', preventDefault: jest.fn() };
    props.onKeydown(event);
    await nextTick();
    expect(draggableList.value.map((i) => i.id)).toEqual(['a', 'c', 'b']);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.querySelector).toHaveBeenCalledWith('[list-item-id="c"]');
  });

  it('does not move item if move is out of bounds', () => {
    const { draggableList, getItemProps } = useDraggableList(initialList, { getItemId });
    // Try to move first item up
    const props = getItemProps(initialList[0], 0);
    const event = { key: 'ArrowUp', preventDefault: jest.fn() };
    props.onKeydown(event);
    expect(draggableList.value.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(event.preventDefault).not.toHaveBeenCalled();
    // Try to move last item down
    const lastProps = getItemProps(initialList[2], 2);
    const event2 = { key: 'ArrowDown', preventDefault: jest.fn() };
    lastProps.onKeydown(event2);
    expect(draggableList.value.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(event2.preventDefault).not.toHaveBeenCalled();
  });

  it('supports custom keyboard controls', () => {
    const { draggableList, getItemProps } = useDraggableList(initialList, {
      getItemId,
      keyboardControls: { moveUp: ['w'], moveDown: ['s'] },
    });

    // current item at index 1 = 'b'
    const props = getItemProps(initialList[1], 1);
    const upEvent = { key: 'w', preventDefault: jest.fn() };
    props.onKeydown(upEvent);

    // item 'b' moved up to index 0
    expect(draggableList.value.map((i) => i.id)).toEqual(['b', 'a', 'c']);
    const downEvent = { key: 's', preventDefault: jest.fn() };

    // current item at index 1 = 'a'
    props.onKeydown(downEvent);
    // item 'a' moved down to index 2
    expect(draggableList.value.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('focusElementByAttribute does nothing if element not found', () => {
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(null);
    const { getItemProps } = useDraggableList(initialList);
    const props = getItemProps(initialList[1], 1);
    const event = { key: 'ArrowUp', preventDefault: jest.fn() };
    props.onKeydown(event);
  });

  it('focusElementByAttribute focus element if found', () => {
    const mockFocus = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValueOnce({ focus: mockFocus });
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(document.createElement('div'));
    const { getItemProps } = useDraggableList(initialList);
    const props = getItemProps(initialList[1], 1);
    const event = { key: 'ArrowUp', preventDefault: jest.fn() };
    props.onKeydown(event);
    expect(mockFocus).toHaveBeenCalled();
  });
});
