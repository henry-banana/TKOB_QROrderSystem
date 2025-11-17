# 05-infra — Documentation Skeleton

This folder documents CI and deployment.

## File: CI.md

```md
# Continuous Integration

## 1. Overview
<!-- TODO: Which CI system is used and what it does -->

## 2. Pipeline Steps
<!-- TODO: List steps (lint, test, build, openapi validation, security scan, etc.) -->

## 3. Required Checks
<!-- TODO: Which jobs must pass before merging -->

## 4. Debugging Failures
<!-- TODO: How to inspect logs and common failures -->
```

## File: DEPLOYMENT_RUNBOOK.md

```md
# Deployment Runbook

## 1. Environments
<!-- TODO: Describe local, staging, production -->

## 2. Deployment Flow
<!-- TODO: Describe how code goes from PR to production -->

## 3. Deployment Steps
<!-- TODO: Detailed steps for deploying a new version -->

## 4. Rollback Procedure
<!-- TODO: How to rollback a bad deployment -->

## 5. Pre- and Post-Deploy Checklists
<!-- TODO: Items to check before and after deployments -->
```