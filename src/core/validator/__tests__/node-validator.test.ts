/**
 * Tests for node validator
 */

import { NodeValidator } from '../node-validator';

describe('NodeValidator', () => {
  let validator: NodeValidator;

  beforeEach(() => {
    validator = new NodeValidator();
  });

  describe('validate', () => {
    it('should validate a correct node', () => {
      const node = {
        type: 'FRAME',
        name: 'Container',
        absoluteBoundingBox: { width: 100, height: 100 }
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing type', () => {
      const node = {
        name: 'Container'
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about missing name', () => {
      const node = {
        type: 'FRAME'
      };

      const result = validator.validate(node);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate color values', () => {
      const node = {
        type: 'FRAME',
        name: 'Container',
        backgroundColor: { r: 1.5, g: 0, b: 0, a: 1 } // Invalid r value
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(false);
    });

    it('should warn about zero dimensions', () => {
      const node = {
        type: 'FRAME',
        name: 'Container',
        absoluteBoundingBox: { width: 0, height: 100 }
      };

      const result = validator.validate(node);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateFile', () => {
    it('should validate a correct file', () => {
      const file = {
        name: 'Design',
        document: {
          type: 'DOCUMENT',
          name: 'Document',
          children: []
        }
      };

      const result = validator.validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should detect missing document', () => {
      const file = {
        name: 'Design'
      };

      const result = validator.validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
