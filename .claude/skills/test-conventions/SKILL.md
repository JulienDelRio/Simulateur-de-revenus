---
name: test-conventions
description: Testing standards, naming patterns, file structure, and coverage expectations
---

# Skill: Test Conventions

Testing standards and patterns for this project.

## Test File Location

- Co-locate test files next to the source file: `PropertyCard.test.tsx` beside `PropertyCard.tsx`
- For integration/e2e tests, use a top-level `tests/` directory:

```
tests/
  integration/
  e2e/
```

<!-- TODO: finalize test directories when test framework is chosen -->

## Naming Pattern

Test names follow: **`should <expected behavior> when <condition>`**

```
describe("PropertyCard", () => {
  it("should display the price when property has a price", () => { ... });
  it("should show 'Price on request' when price is null", () => { ... });
  it("should call onFavorite when the heart icon is clicked", () => { ... });
});
```

## Test Structure: Arrange-Act-Assert

```
it("should return filtered properties when filters are applied", () => {
  // Arrange
  const properties = [makeProperty({ city: "Paris" }), makeProperty({ city: "Lyon" })];
  const filters = { city: "Paris" };

  // Act
  const result = filterProperties(properties, filters);

  // Assert
  expect(result).toHaveLength(1);
  expect(result[0].city).toBe("Paris");
});
```

## What to Mock

**Mock**:
- External HTTP calls (APIs, scrapers)
- Database (in unit tests)
- Time/date-dependent logic
- Third-party services

**Don't mock**:
- The module under test
- Simple utility functions
- Data structures and transformations

## Test Categories

| Category | Scope | Speed | When to run |
|----------|-------|-------|------------|
| Unit | Single function/component | Fast | Every commit |
| Integration | Multiple modules together | Medium | Every commit |
| E2E | Full user flow | Slow | Before merge |

## Coverage Expectations

- New code: aim for 80%+ coverage
- Critical paths (auth, payments, data integrity): 90%+
- Don't chase 100% — diminishing returns on trivial code

## Test Data

- Use factory functions (`makeProperty()`, `makeUser()`) to create test data
- Avoid hardcoded magic values — use descriptive variable names
- Keep test data minimal — only set fields relevant to the test

<!-- TODO: set up test framework and configure coverage thresholds when stack is chosen -->
