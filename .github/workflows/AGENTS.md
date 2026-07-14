# Workflow instructions

- Pin every third-party action to a full commit SHA and retain the upstream version in a comment. Owned reusable workflow callers may follow the owner's established branch policy.
- Default to `permissions: contents: read`; grant writes only on the job that needs them. Never run untrusted pull-request code with privileged `pull_request_target` permissions.
- Use `.node-version`, npm cache support from `actions/setup-node`, and `npm ci --force` for this repository's documented TypeScript peer exception.
- CI must build, typecheck, run real tests with enforced coverage, check generated documentation, and retain ESLint 9 compatibility.
- Set bounded timeouts and concurrency for CI, docs deployment, scheduled workflows, and releases.
- The release workflow must use npm trusted publishing (`id-token: write`) and provenance. Do not add `NPM_TOKEN` or another long-lived registry secret.
- Publish the exact tarball that passed `release:check`. Do not push a version commit or tag before npm accepts the package; push the matching commit and tag atomically afterward.
- Use `main` as the only default branch. Run `npm run lint:actions`, `npm run lint:yaml`, and `npm run lint:yamllint` after workflow edits.
