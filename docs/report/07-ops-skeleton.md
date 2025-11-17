# 07-ops — Documentation Skeleton

This folder documents how the system is monitored and how incidents are handled.

## File: MONITORING.md

```md
# Monitoring

## 1. Objectives
<!-- TODO: Explain what you want to detect early (downtime, slow API, payment issues, etc.) -->

## 2. Key Metrics
<!-- TODO: List important metrics (latency, error rates, throughput, DB health, payment success rate, etc.) -->

## 3. Dashboards
<!-- TODO: Describe or link to dashboards (API performance, DB, Stripe, etc.) -->

## 4. Alerts
<!-- TODO: Define alert rules (thresholds, durations) for critical metrics -->

## 5. Tools
<!-- TODO: Mention tools (Prometheus, Grafana, CloudWatch, etc.) -->
```

## File: ONCALL_RUNBOOK.md

```md
# On-call Runbook

## 1. Incident Severity Levels
<!-- TODO: Define SEV1/SEV2/SEV3 with examples -->

## 2. General On-call Process
<!-- TODO: Steps when an alert fires (ack, investigate, mitigate, communicate, resolve, postmortem) -->

## 3. Common Incident Playbooks
<!-- TODO: API down, DB overloaded, Stripe errors, QR validation failures, etc. -->

## 4. Communication
<!-- TODO: How to communicate incidents (channels, stakeholders) -->

## 5. Post-Incident Review
<!-- TODO: Checklist for writing postmortems and tracking follow-up actions -->
```