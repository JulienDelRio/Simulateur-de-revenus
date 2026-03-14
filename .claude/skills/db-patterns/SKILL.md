---
name: db-patterns
description: Database schema design, migration strategy, query patterns, and index guidelines
---

# Skill: Database Patterns

Database design and query conventions for this project.

> **See also**: `.claude/rules/code-quality.md` (N+1 queries, performance)

## Schema Naming

- Tables: plural snake_case (`properties`, `saved_searches`, `user_alerts`)
- Columns: singular snake_case (`created_at`, `price_cents`, `is_active`)
- Primary keys: `id` (auto-increment or UUID — pick one, stay consistent)
- Foreign keys: `<singular_table>_id` (e.g., `user_id`, `property_id`)
- Timestamps: always include `created_at` and `updated_at`

## Migration Strategy

- One migration per logical change
- Migrations must be reversible (provide `up` and `down`)
- Never modify a migration that has been committed to `main`
- Name pattern: `YYYYMMDDHHMMSS_<description>` (e.g., `20260225120000_create_properties_table`)

<!-- TODO: choose migration tool when stack is decided (Knex, Prisma, TypeORM, etc.) -->

## Query Patterns

### Avoid N+1

Always eager-load or batch-load related data. Never query inside a loop:

```
// BAD: N+1
for (const property of properties) {
  property.images = await db.getImages(property.id);
}

// GOOD: batch load
const images = await db.getImagesByPropertyIds(propertyIds);
```

### Pagination

- Use offset/limit for simple cases
- Use cursor-based pagination for large datasets or real-time data
- Always enforce a `LIMIT` — never return unbounded results

### Soft Delete

- Use `deleted_at` timestamp (nullable) instead of hard delete for user data
- Filter out soft-deleted rows by default in queries

## Index Guidelines

- Always index foreign keys
- Index columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses
- Add composite indexes for common multi-column queries
- Don't over-index — each index slows writes

## Money

- Store monetary values as integers in cents (`price_cents INTEGER`)
- Convert to display format only at the presentation layer

<!-- TODO: define initial schema when data models are specified -->
