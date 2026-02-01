# Data Model: Fullstack Unit Testing

**Feature**: 004-fullstack-unit-testing
**Date**: 2026-01-30

## Overview

This feature is infrastructure-focused and does not introduce new data entities. The "entities" involved are conceptual testing constructs, not persisted data.

## Conceptual Entities

### Test Suite

A logical grouping of tests, typically one per source file.

| Attribute | Type | Description |
|-----------|------|-------------|
| file | string | Path to test file |
| tests | TestCase[] | Collection of test cases |
| status | enum | passed, failed, skipped |
| duration | number | Total execution time (ms) |

### Test Case

An individual test assertion.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Test description |
| status | enum | passed, failed, skipped |
| duration | number | Execution time (ms) |
| error | string? | Failure message if failed |

### Coverage Report

Aggregated code coverage metrics.

| Attribute | Type | Description |
|-----------|------|-------------|
| lines | percentage | Line coverage (target: 80%) |
| branches | percentage | Branch coverage (target: 80%) |
| functions | percentage | Function coverage (target: 80%) |
| statements | percentage | Statement coverage (target: 80%) |
| uncoveredFiles | string[] | Files below threshold |

## State Transitions

```
Test Suite Lifecycle:
  [Discovered] → [Running] → [Passed | Failed | Skipped]
                    ↓
              [Error] (on timeout or setup failure)

Coverage Check:
  [Collected] → [Threshold Check] → [Pass | Fail]
```

## Relationships

```
TestRunner
  └── TestSuite (1:N)
        └── TestCase (1:N)
              └── Assertion (1:N)

CoverageReport
  └── FileReport (1:N)
        └── UncoveredLine (1:N)
```

## Notes

- No database storage required
- All data is transient (exists only during test execution)
- Coverage reports written to filesystem (HTML, LCOV formats)
