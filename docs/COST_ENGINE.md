# AIOS Cost Engine & Budget Forecasting Documentation

## Overview
Tracks input/output tokens, per-request USD cost, user spend, organization budgets, and projects monthly spend forecasts.

## Cost Calculation
```
Total Cost = (Input Tokens / 1000 * CostPer1kInput) + (Output Tokens / 1000 * CostPer1kOutput) + MediaUnits
```
