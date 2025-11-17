# 02-api — Documentation Skeleton

This folder documents the public API of the platform.

## File: OPENAPI.md

```md
# API Overview & Conventions

## 1. Introduction
<!-- TODO: Describe OpenAPI usage and where openapi.yaml lives -->

## 2. Domains & Main Resources
<!-- TODO: Briefly describe auth, tenants, menus, tables, orders, payments -->

## 3. API Conventions
<!-- TODO: Base URL, versioning, authentication, status codes, error format -->

## 4. Client Generation & Usage
<!-- TODO: How to generate clients / validate spec -->
```

## File: openapi.yaml

```yaml
# OpenAPI 3.0 specification for the REST API.
# TODO:
# - Define components/schemas for Tenant, User, MenuCategory, MenuItem, Table, Order, OrderItem, PaymentIntent
# - Define paths for auth, menus, tables & QR, orders, payments
# - Add example requests/responses
openapi: "3.0.0"
info:
  title: Unified Restaurant Ordering API
  version: "1.0.0"
paths: {}
components: {}
```