/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import overflowTitle from './overflowTitle';

describe('overflowTitle directive', () => {
  let mockElement;
  let mockBinding;
  let resizeObserverCallback;

  beforeEach(() => {
    // Mock element with overflow properties
    mockElement = {
      scrollWidth: 100,
      clientWidth: 100,
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      _overflowObserver: null,
    };

    mockBinding = {
      value: 'Test Title Text',
    };

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation((callback) => {
      resizeObserverCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inserted hook', () => {
    it('should add title attribute when text overflows', () => {
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;

      overflowTitle.inserted(mockElement, mockBinding);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');
    });

    it('should not add title attribute when text does not overflow', () => {
      mockElement.scrollWidth = 100;
      mockElement.clientWidth = 100;

      overflowTitle.inserted(mockElement, mockBinding);

      expect(mockElement.setAttribute).not.toHaveBeenCalled();
      // removeAttribute is called to ensure no title exists when not overflowing
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });

    it('should create ResizeObserver and observe element', () => {
      overflowTitle.inserted(mockElement, mockBinding);

      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockElement._overflowObserver).toBeDefined();
      expect(mockElement._overflowObserver.observe).toHaveBeenCalledWith(mockElement);
    });

    it('should handle resize events and add title when overflow occurs', () => {
      mockElement.scrollWidth = 100;
      mockElement.clientWidth = 100;

      overflowTitle.inserted(mockElement, mockBinding);

      // Initially no overflow
      expect(mockElement.setAttribute).not.toHaveBeenCalled();

      // Simulate resize that causes overflow
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;
      resizeObserverCallback();

      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');
    });

    it('should handle resize events and remove title when overflow resolves', () => {
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;

      overflowTitle.inserted(mockElement, mockBinding);

      // Initially has overflow
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');

      // Simulate resize that resolves overflow
      mockElement.scrollWidth = 80;
      mockElement.clientWidth = 100;
      resizeObserverCallback();

      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });
  });

  describe('update hook', () => {
    it('should add title attribute when text overflows on update', () => {
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;

      overflowTitle.update(mockElement, mockBinding);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');
    });

    it('should remove title attribute when text does not overflow on update', () => {
      mockElement.scrollWidth = 80;
      mockElement.clientWidth = 100;

      overflowTitle.update(mockElement, mockBinding);

      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });

    it('should update title with new binding value when overflowing', () => {
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;
      mockBinding.value = 'New Title Text';

      overflowTitle.update(mockElement, mockBinding);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'New Title Text');
    });

    it('should handle edge case where scrollWidth equals clientWidth', () => {
      mockElement.scrollWidth = 100;
      mockElement.clientWidth = 100;

      overflowTitle.update(mockElement, mockBinding);

      expect(mockElement.setAttribute).not.toHaveBeenCalled();
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });
  });

  describe('unbind hook', () => {
    it('should disconnect ResizeObserver when element is unbound', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
      };
      mockElement._overflowObserver = mockObserver;

      overflowTitle.unbind(mockElement);

      expect(mockObserver.disconnect).toHaveBeenCalled();
      expect(mockElement._overflowObserver).toBeUndefined();
    });

    it('should handle unbind when no observer exists', () => {
      mockElement._overflowObserver = null;

      expect(() => {
        overflowTitle.unbind(mockElement);
      }).not.toThrow();
    });

    it('should handle unbind when observer is undefined', () => {
      delete mockElement._overflowObserver;

      expect(() => {
        overflowTitle.unbind(mockElement);
      }).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lifecycle: insert, update, unbind', () => {
      // Insert with overflow
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;
      overflowTitle.inserted(mockElement, mockBinding);
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');

      // Store reference to observer before unbind
      const observer = mockElement._overflowObserver;

      // Update with new value
      mockBinding.value = 'Updated Title';
      overflowTitle.update(mockElement, mockBinding);
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Updated Title');

      // Unbind
      overflowTitle.unbind(mockElement);
      expect(observer.disconnect).toHaveBeenCalled();
      expect(mockElement._overflowObserver).toBeUndefined();
    });

    it('should handle text that changes from overflowing to not overflowing', () => {
      // Initial state: overflowing
      mockElement.scrollWidth = 150;
      mockElement.clientWidth = 100;
      overflowTitle.inserted(mockElement, mockBinding);
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');

      // Update: no longer overflowing
      mockElement.scrollWidth = 80;
      mockElement.clientWidth = 100;
      overflowTitle.update(mockElement, mockBinding);
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });

    it('should handle responsive viewport changes via ResizeObserver', () => {
      mockElement.scrollWidth = 100;
      mockElement.clientWidth = 100;
      overflowTitle.inserted(mockElement, mockBinding);

      // Simulate viewport shrink causing overflow
      mockElement.clientWidth = 80;
      resizeObserverCallback();
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Test Title Text');

      // Simulate viewport expand resolving overflow
      mockElement.clientWidth = 120;
      resizeObserverCallback();
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('title');
    });
  });
});
