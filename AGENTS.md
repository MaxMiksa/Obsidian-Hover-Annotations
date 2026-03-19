# Local Notes

## PowerShell Inline Node
- Symptom: Complex `node -e "..."` commands fail in PowerShell with parser errors before Node runs.
- Cause: PowerShell re-parses nested quotes, brackets, and backticks inside inline JavaScript.
- Fix: Prefer a here-string piped to Node, for example `@'...js...'@ | node`, instead of `node -e`.
