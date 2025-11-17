# 03-architecture — Documentation Skeleton

This folder explains how the system is structured and how data is modeled.

## File: ARCHITECTURE.md

```md
# System Architecture

## 1. Overview
<!-- TODO: High-level description of layers (Client, Gateway, Services, Data, External, Monitoring) -->

## 2. Component View
<!-- TODO: Describe each service (Auth, Tenant, Menu, Order, Payment, QR, Notification) and its responsibilities -->

## 3. Deployment View
<!-- TODO: Describe environments and how services are deployed -->

## 4. Cross-Cutting Concerns
<!-- TODO: Auth & multi-tenancy, logging, monitoring, error handling -->

## 5. Related Documents
<!-- TODO: Links to ER_DIAGRAM.md, order state machine, QR flow, ADRs -->
```

## File: ER_DIAGRAM.md

```md
# Database ER Diagram

## 1. Overview
<!-- TODO: Explain multi-tenant approach (tenant_id on key tables) -->

## 2. Main Tables
<!-- TODO: List tables and short descriptions (tenants, users, tables, menu_categories, menu_items, orders, order_items, payments, etc.) -->

## 3. Relationships
<!-- TODO: Describe relationships between tables -->

## 4. Diagram
<!-- TODO: Embed Mermaid ER diagram or link to image -->

## 5. Constraints & Indexes
<!-- TODO: Note important PK/FK and indexes -->
```