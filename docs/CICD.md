# CI/CD Platform Guide

StoryForge AI V3 uses GitHub Actions for continuous integration and delivery.

## CI Workflow (`.github/workflows/ci.yml`)
- Build → ESLint → TypeScript check (`tsc --noEmit`)
- Jest unit & integration test suite
- Security scanning: Snyk dependencies, Gitleaks secrets, Trivy containers
- CycloneDX 1.5 SBOM generation

## CD Workflow (`.github/workflows/cd-production.yml`)
- **Canary Phase**: Deploys 10% traffic canary build
- **Evaluation Window**: 5-minute health check window monitoring error rates
- **Blue/Green Promotion**: Atomic promotion to 100% traffic upon zero errors
- **Auto-Rollback**: Automatic Helm rollback if error rate exceeds 1% during rollout
