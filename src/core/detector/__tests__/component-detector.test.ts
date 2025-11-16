/**
 * Tests for component detector
 */

import { ComponentDetector } from '../component-detector';

describe('ComponentDetector', () => {
  let detector: ComponentDetector;

  beforeEach(() => {
    detector = new ComponentDetector();
  });

  describe('isPressable', () => {
    it('should detect button nodes', () => {
      const node = { name: 'Button', type: 'FRAME' };
      expect(detector.isPressable(node)).toBe(true);
    });

    it('should detect btn nodes', () => {
      const node = { name: 'submit_btn', type: 'FRAME' };
      expect(detector.isPressable(node)).toBe(true);
    });

    it('should not detect regular frames', () => {
      const node = { name: 'Container', type: 'FRAME' };
      expect(detector.isPressable(node)).toBe(false);
    });
  });

  describe('isImage', () => {
    it('should detect vector nodes', () => {
      const node = { type: 'VECTOR', name: 'Icon' };
      expect(detector.isImage(node)).toBe(true);
    });

    it('should detect nodes with image fills', () => {
      const node = {
        type: 'RECTANGLE',
        name: 'Photo',
        fills: [{ type: 'IMAGE', visible: true }]
      };
      expect(detector.isImage(node)).toBe(true);
    });

    it('should detect by naming', () => {
      const node = { type: 'FRAME', name: 'profile_image' };
      expect(detector.isImage(node)).toBe(true);
    });
  });

  describe('isTextInput', () => {
    it('should detect input nodes', () => {
      const node = { name: 'email_input', type: 'FRAME' };
      expect(detector.isTextInput(node)).toBe(true);
    });

    it('should detect textfield nodes', () => {
      const node = { name: 'username_textfield', type: 'FRAME' };
      expect(detector.isTextInput(node)).toBe(true);
    });
  });

  describe('getComponentType', () => {
    it('should return correct component type', () => {
      expect(detector.getComponentType({ name: 'Button', type: 'FRAME' })).toBe('TouchableOpacity');
      expect(detector.getComponentType({ type: 'VECTOR', name: 'Icon' })).toBe('Image');
      expect(detector.getComponentType({ type: 'TEXT', name: 'Label' })).toBe('Text');
      expect(detector.getComponentType({ type: 'FRAME', name: 'Container' })).toBe('View');
    });
  });

  describe('getRequiredProps', () => {
    it('should return props for TouchableOpacity', () => {
      const props = detector.getRequiredProps({}, 'TouchableOpacity');
      expect(props.activeOpacity).toBe(0.7);
      expect(props.onPress).toBeDefined();
    });

    it('should return props for Image', () => {
      const props = detector.getRequiredProps({}, 'Image');
      expect(props.source).toBeDefined();
      expect(props.resizeMode).toBe('cover');
    });

    it('should return props for TextInput', () => {
      const props = detector.getRequiredProps({ name: 'Email' }, 'TextInput');
      expect(props.placeholder).toBeDefined();
      expect(props.onChangeText).toBeDefined();
    });
  });
});
