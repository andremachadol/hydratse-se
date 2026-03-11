# Releases and Rollback

This project uses commit-driven releases with semantic version tags.

## Commit convention

Use conventional commit prefixes:

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructuring without behavior change
- `docs:` documentation
- `test:` test changes
- `chore:` maintenance tasks

## Versioning

Semantic versioning (`MAJOR.MINOR.PATCH`):

- `patch`: bug fixes (`fix`)
- `minor`: new backward-compatible features (`feat`)
- `major`: breaking changes

## Create a release

1. Make sure working tree is clean.
2. Run one of:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

3. Review generated changes in:

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `app.json`

4. Commit, tag, and push:

```bash
git add CHANGELOG.md package.json package-lock.json app.json
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```

5. (Optional) Create a GitHub Release from the pushed tag.

## Rollback

To inspect or redeploy a previous release:

```bash
git checkout vX.Y.Z
```

To return to main:

```bash
git checkout main
```
