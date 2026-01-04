# Security Standards

## Input Validation
- Always validate and sanitize user input
- Use parameterized queries for database operations
- Validate on both client and server side
- Whitelist allowed values rather than blacklisting

## Authentication & Authorization
- Never store passwords in plain text
- Use secure session management
- Implement proper CORS policies
- Apply principle of least privilege

## Sensitive Data
- Never log sensitive information (passwords, tokens, PII)
- Use environment variables for secrets
- Encrypt sensitive data at rest and in transit
- Implement proper error messages that don't leak information

## Dependencies
- Keep dependencies up to date
- Review security advisories regularly
- Use lock files for reproducible builds
- Audit dependencies for known vulnerabilities
