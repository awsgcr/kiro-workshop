# Testing Standards

## Test File Location
- Place test files in `__tests__/` directories
- Name test files as `*.test.ts` or `*.spec.ts`
- Mirror the source file structure in test directories

## Coverage Requirements
- Aim for 80% code coverage minimum
- Always test error cases and edge conditions
- Mock external dependencies (APIs, databases, file system)

## Test Structure
- Use descriptive test names that explain the expected behavior
- Follow Arrange-Act-Assert (AAA) pattern
- One assertion per test when possible
- Group related tests using `describe` blocks

## What to Test
- Happy path scenarios
- Edge cases (empty inputs, null values, boundaries)
- Error handling and exceptions
- Integration points between modules

## What NOT to Test
- Third-party library internals
- Simple getters/setters without logic
- Framework-generated code
