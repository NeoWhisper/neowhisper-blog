/**
 * Unit tests for validation utilities (Phase 4)
 * Tests functional composition validators
 */

import {
  isObject,
  hasStringProperty,
  hasNumberProperty,
  hasMinLength,
  hasNoDuplicates,
  hasMinSum,
} from "./validation";

describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ id: "test" })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("returns false for arrays", () => {
    expect(isObject([])).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isObject("string")).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe("hasStringProperty", () => {
  const validator = hasStringProperty("id");

  it("returns true when property exists and is string", () => {
    expect(validator({ id: "test" })).toBe(true);
  });

  it("returns false when property is missing", () => {
    expect(validator({})).toBe(false);
  });

  it("returns false when property is not string", () => {
    expect(validator({ id: 123 })).toBe(false);
    expect(validator({ id: null })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(validator(null)).toBe(false);
    expect(validator("string")).toBe(false);
  });
});

describe("hasNumberProperty", () => {
  const validator = hasNumberProperty("count");

  it("returns true when property exists and is number", () => {
    expect(validator({ count: 42 })).toBe(true);
    expect(validator({ count: 0 })).toBe(true);
  });

  it("returns false for non-numbers", () => {
    expect(validator({ count: "42" })).toBe(false);
    expect(validator({ count: null })).toBe(false);
    expect(validator({ count: undefined })).toBe(false);
  });
});

describe("hasMinLength", () => {
  const validator = hasMinLength<string>(3);

  it("returns true when array meets minimum length", () => {
    expect(validator(["a", "b", "c"])).toBe(true);
    expect(validator(["a", "b", "c", "d"])).toBe(true);
  });

  it("returns false when array is too short", () => {
    expect(validator(["a", "b"])).toBe(false);
    expect(validator([])).toBe(false);
  });
});

describe("hasNoDuplicates", () => {
  const validator = hasNoDuplicates<{ id: string }, string>((item) => item.id);

  it("returns true for arrays with unique keys", () => {
    expect(validator([{ id: "a" }, { id: "b" }, { id: "c" }])).toBe(true);
  });

  it("returns false when duplicates exist", () => {
    expect(validator([{ id: "a" }, { id: "a" }, { id: "b" }])).toBe(false);
  });

  it("returns true for empty arrays", () => {
    expect(validator([])).toBe(true);
  });
});

describe("hasMinSum", () => {
  const validator = hasMinSum<{ value: number }>((item) => item.value, 100);

  it("returns true when sum meets minimum", () => {
    expect(validator([{ value: 50 }, { value: 60 }])).toBe(true);
    expect(validator([{ value: 100 }])).toBe(true);
  });

  it("returns false when sum is too low", () => {
    expect(validator([{ value: 30 }, { value: 40 }])).toBe(false);
    expect(validator([])).toBe(false);
  });
});
