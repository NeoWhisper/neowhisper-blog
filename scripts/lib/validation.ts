/**
 * Functional validation utilities
 * Composable validators using predicate composition (DeMarco style)
 */

// Validator type: takes unknown, returns boolean with type guard
type Validator<T> = (value: unknown) => value is T;

// Predicate type for value checks
type Predicate<T> = (value: T) => boolean;

/**
 * Composes multiple validators with AND logic
 * All must pass for the composition to pass
 */
export const allOf =
  <T>(...validators: Validator<T>[]): Validator<T> =>
  (value: unknown): value is T =>
    validators.every((v) => v(value));

/**
 * Composes multiple validators with OR logic
 * At least one must pass
 */
export const anyOf =
  <T>(...validators: Validator<T>[]): Validator<T> =>
  (value: unknown): value is T =>
    validators.some((v) => v(value));

/**
 * Creates a validator that checks if value is a non-null object (not array)
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Creates a property validator for string fields
 */
export const hasStringProperty =
  (key: string): Validator<Record<string, unknown>> =>
  (value: unknown): value is Record<string, unknown> =>
    isObject(value) && typeof value[key] === "string";

/**
 * Creates a property validator for number fields
 */
export const hasNumberProperty =
  (key: string): Validator<Record<string, unknown>> =>
  (value: unknown): value is Record<string, unknown> =>
    isObject(value) && typeof value[key] === "number";

/**
 * Creates a property validator for optional fields
 */
export const hasOptionalProperty =
  <T>(
    key: string,
    typeCheck: (v: unknown) => v is T,
  ): Validator<Record<string, unknown>> =>
  (value: unknown): value is Record<string, unknown> =>
    isObject(value) && (value[key] === undefined || typeCheck(value[key]));

/**
 * Creates a validator for array length
 */
export const hasMinLength =
  <T>(min: number): Predicate<T[]> =>
  (arr: T[]): boolean =>
    arr.length >= min;

/**
 * Creates a validator for no duplicate values by key
 */
export const hasNoDuplicates =
  <T, K extends string | number>(keyFn: (item: T) => K): Predicate<T[]> =>
  (arr: T[]): boolean =>
    new Set(arr.map(keyFn)).size === arr.length;

/**
 * Creates a validator for array sum of property
 */
export const hasMinSum =
  <T>(keyFn: (item: T) => number, min: number): Predicate<T[]> =>
  (arr: T[]): boolean =>
    arr.reduce((sum, item) => sum + keyFn(item), 0) >= min;

/**
 * Composes a validator with a predicate
 * First validates type, then checks predicate
 */
export const withPredicate =
  <T>(validator: Validator<T>, predicate: Predicate<T>): Validator<T> =>
  (value: unknown): value is T =>
    validator(value) && predicate(value);

/**
 * Validation result type with detailed errors
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

/**
 * Creates a validation runner that returns detailed results
 */
export const createValidator =
  <T>(validator: Validator<T>, errorMessage: string) =>
  (value: unknown): ValidationResult<T> =>
    validator(value)
      ? { success: true, data: value as T }
      : { success: false, errors: [errorMessage] };
