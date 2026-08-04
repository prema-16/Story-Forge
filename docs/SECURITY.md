# Security Hardening & Vulnerability Management

StoryForge AI V3 enforces OWASP ASVS 4.0 Level 2 compliance across all microservices.

## Key Controls
- **OWASP ASVS 4.0**: 21 controls evaluated with 90%+ pass rate
- **SBOM**: CycloneDX 1.5 document listing all NPM and container dependencies
- **WAF**: Pattern inspection for SQLi, XSS, and Path Traversal
- **Anomaly Detection**: Real-time IP reputation tracking and automated IP blocking
