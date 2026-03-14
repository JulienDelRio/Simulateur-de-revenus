---
name: api-conventions
description: REST API design patterns, endpoint naming, status codes, and error handling
---

# Skill: API Conventions

REST API design conventions for this project.

> **See also**: `.claude/rules/coding-style.md` (naming), `.claude/rules/code-quality.md` (performance)

## Endpoint Naming

- Use plural nouns for resources: `/properties`, `/users`, `/searches`
- Nest sub-resources: `/properties/:id/images`
- Use kebab-case for multi-word paths: `/saved-searches`
- No verbs in URLs — use HTTP methods instead

## HTTP Methods

| Method | Purpose | Success Code |
|--------|---------|-------------|
| GET | Read resource(s) | 200 |
| POST | Create resource | 201 |
| PUT | Full replace | 200 |
| PATCH | Partial update | 200 |
| DELETE | Remove resource | 204 |

## Request/Response Format

- JSON body for all requests and responses
- Use camelCase for JSON keys
- Wrap collections in a `data` array with pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

## Error Response Structure

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "price", "message": "Must be a positive number" }
    ]
  }
}
```

Standard error codes:

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Missing/invalid auth |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Duplicate or state conflict |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Versioning

<!-- TODO: choose versioning strategy when stack is decided (URL prefix /api/v1 vs header) -->

## Pagination

- Default page size: 20
- Max page size: 100
- Use `page` and `pageSize` query parameters
- Always return `pagination` metadata on list endpoints

## Filtering and Sorting

- Filter via query params: `GET /properties?city=Paris&minPrice=200000`
- Sort via `sort` param: `GET /properties?sort=-price` (prefix `-` for descending)

<!-- TODO: define allowed filter/sort fields per resource when models are defined -->
