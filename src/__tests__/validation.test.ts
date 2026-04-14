import {
  validateStatus,
  validateDateFormat,
  validateTaskCreate,
  validateTaskUpdate,
  getValidationErrors,
  isNonEmptyString,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateStatus', () => {
    it('should return true for valid status "pending"', () => {
      expect(validateStatus('pending')).toBe(true);
    });

    it('should return true for valid status "in_progress"', () => {
      expect(validateStatus('in_progress')).toBe(true);
    });

    it('should return true for valid status "completed"', () => {
      expect(validateStatus('completed')).toBe(true);
    });

    it('should return true for valid status "cancelled"', () => {
      expect(validateStatus('cancelled')).toBe(true);
    });

    it('should return false for invalid status', () => {
      expect(validateStatus('invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateStatus('')).toBe(false);
    });
  });

  describe('validateDateFormat', () => {
    it('should return true for valid date format YYYY-MM-DD', () => {
      expect(validateDateFormat('2024-01-15')).toBe(true);
    });

    it('should return true for valid date format with zeros', () => {
      expect(validateDateFormat('2024-01-01')).toBe(true);
    });

    it('should return true for valid date format at end of year', () => {
      expect(validateDateFormat('2024-12-31')).toBe(true);
    });

    it('should return false for invalid date format with slashes', () => {
      expect(validateDateFormat('2024/01/15')).toBe(false);
    });

    it('should return false for invalid date format DD-MM-YYYY', () => {
      expect(validateDateFormat('15-01-2024')).toBe(false);
    });

    it('should return false for invalid date format MM/DD/YYYY', () => {
      expect(validateDateFormat('01/15/2024')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateDateFormat('')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(validateDateFormat(123 as unknown as string)).toBe(false);
    });

    it('should return false for incomplete date', () => {
      expect(validateDateFormat('2024-01')).toBe(false);
    });
  });

  describe('validateTaskCreate', () => {
    describe('title validation', () => {
      it('should succeed with valid title', () => {
        const result = validateTaskCreate({ title: 'Valid Task' });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when title is missing', () => {
        const result = validateTaskCreate({} as unknown);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should fail when title is empty string', () => {
        const result = validateTaskCreate({ title: '' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title cannot be empty');
      });

      it('should fail when title is too long', () => {
        const result = validateTaskCreate({ title: 'a'.repeat(201) });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title must be 200 characters or less');
      });

      it('should fail when title is not a string', () => {
        const result = validateTaskCreate({ title: 123 } as unknown);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title must be a string');
      });
    });

    describe('description validation', () => {
      it('should succeed without description', () => {
        const result = validateTaskCreate({ title: 'Task' });
        expect(result.success).toBe(true);
      });

      it('should succeed with valid description', () => {
        const result = validateTaskCreate({ title: 'Task', description: 'Valid description' });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when description is too long', () => {
        const result = validateTaskCreate({ title: 'Task', description: 'a'.repeat(1001) });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Description must be 1000 characters or less');
      });

      it('should fail when description is not a string', () => {
        const result = validateTaskCreate({ title: 'Task', description: 123 } as unknown);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Description must be a string');
      });
    });

    describe('dueDate validation', () => {
      it('should succeed without dueDate', () => {
        const result = validateTaskCreate({ title: 'Task' });
        expect(result.success).toBe(true);
      });

      it('should succeed with valid dueDate', () => {
        const result = validateTaskCreate({ title: 'Task', dueDate: '2024-12-31' });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail with invalid dueDate format', () => {
        const result = validateTaskCreate({ title: 'Task', dueDate: '12/31/2024' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Due date must be in YYYY-MM-DD format');
      });

      it('should fail when dueDate is not a string', () => {
        const result = validateTaskCreate({ title: 'Task', dueDate: 123 } as unknown);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Due date must be a string');
      });
    });

    describe('status validation', () => {
      it('should succeed without status (defaults to pending)', () => {
        const result = validateTaskCreate({ title: 'Task' });
        expect(result.success).toBe(true);
      });

      it('should succeed with valid status', () => {
        const result = validateTaskCreate({ title: 'Task', status: 'completed' });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail with invalid status', () => {
        const result = validateTaskCreate({ title: 'Task', status: 'invalid' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Status must be one of: pending, in_progress, completed, cancelled');
      });
    });

    describe('combined validation', () => {
      it('should fail with multiple validation errors', () => {
        const result = validateTaskCreate({ description: 'a'.repeat(1001), status: 'invalid' } as unknown);
        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength(2);
      });

      it('should succeed with all valid fields', () => {
        const result = validateTaskCreate({
          title: 'Valid Task',
          description: 'Valid description',
          dueDate: '2024-12-31',
          status: 'pending',
        });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('validateTaskUpdate', () => {
    it('should succeed with empty update (all fields optional)', () => {
      const result = validateTaskUpdate({});
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('title validation', () => {
      it('should succeed with valid title', () => {
        const result = validateTaskUpdate({ title: 'Updated Title' });
        expect(result.success).toBe(true);
      });

      it('should fail with empty title', () => {
        const result = validateTaskUpdate({ title: '' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title cannot be empty');
      });

      it('should fail with too long title', () => {
        const result = validateTaskUpdate({ title: 'a'.repeat(201) });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Title must be 200 characters or less');
      });
    });

    describe('description validation', () => {
      it('should succeed with valid description', () => {
        const result = validateTaskUpdate({ description: 'Updated description' });
        expect(result.success).toBe(true);
      });

      it('should fail with too long description', () => {
        const result = validateTaskUpdate({ description: 'a'.repeat(1001) });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Description must be 1000 characters or less');
      });
    });

    describe('dueDate validation', () => {
      it('should succeed with valid dueDate', () => {
        const result = validateTaskUpdate({ dueDate: '2024-12-31' });
        expect(result.success).toBe(true);
      });

      it('should fail with invalid dueDate format', () => {
        const result = validateTaskUpdate({ dueDate: 'invalid' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Due date must be in YYYY-MM-DD format');
      });
    });

    describe('status validation', () => {
      it('should succeed with valid status', () => {
        const result = validateTaskUpdate({ status: 'completed' });
        expect(result.success).toBe(true);
      });

      it('should fail with invalid status', () => {
        const result = validateTaskUpdate({ status: 'invalid' });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Status must be one of: pending, in_progress, completed, cancelled');
      });
    });
  });

  describe('getValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const errors = ['Title is required', 'Status must be one of: pending, in_progress, completed, cancelled'];
      const result = getValidationErrors(errors);

      expect(result.message).toBe('Validation failed');
      expect(result.errors).toEqual(errors);
      expect(result.details).toHaveLength(2);
      expect(result.details[0].field).toBe('Title');
      expect(result.details[1].field).toBe('Status');
    });

    it('should handle unknown fields', () => {
      const errors = ['Some unknown error'];
      const result = getValidationErrors(errors);

      expect(result.details[0].field).toBe('Unknown');
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty string', () => {
      expect(isNonEmptyString('hello')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(isNonEmptyString('   ')).toBe(false);
    });

    it('should return false for non-string types', () => {
      expect(isNonEmptyString(123 as unknown as string)).toBe(false);
      expect(isNonEmptyString(null as unknown as string)).toBe(false);
      expect(isNonEmptyString(undefined as unknown as string)).toBe(false);
      expect(isNonEmptyString({} as unknown as string)).toBe(false);
    });
  });
});
