# Simple Bump package.json version

![Coverage](badges/coverage.svg)

This GitHub Action bumps the version number in your `package.json` file.

## Features

- Automatically increments the version number.
- Supports major, minor, and patch increments.
- Easy to integrate into your CI/CD pipeline.

## Version Reset Logic

When the version number is bumped, the following reset logic is applied:

- If the `major` version is incremented, both `minor` and `patch` numbers are reset to `0`.
  - Example: `1.2.3` becomes `2.0.0`
- If the `minor` version is incremented, the `patch` number is reset to `0`.
  - Example: `1.2.3` becomes `1.3.0`
- If the `patch` version is incremented, no other numbers are reset.
  - Example: `1.2.3` becomes `1.2.4`

## Usage

To use this action, create a workflow file (e.g., `.github/workflows/bump-version.yml`) in your repository:

```yaml
name: Bump Version

on:
  push:
    branches:
      - main

jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Bump version
        uses: gedclack/simple-bump-package-json@v1
        id: bump-version
        with:
          bump-type: patch # options: major, minor, patch

      - name: Commit & push changes
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git commit -am "Bump to v${{ steps.bump-version.outputs.new-version }}"
          git push
```

## Inputs

- `bump-type`: The type of version bump to perform (`major`, `minor`, `patch`). Default is `patch`.

## Outputs

- `new-version`: The new version number. e.g., `2.1.28`

## License

This project is licensed under the MIT License.
