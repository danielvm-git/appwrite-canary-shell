# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING:** `sync-shell.sh` v2 copies `app/` (Todo React SPA) instead of `prototype/ds`. Consumers on shell 1.x must upgrade sync and set `VITE_*` env at build time.

<!-- big-release managed -->

## [1.0.0] - 2026-11-24

### Changed

- **feat:** stable shell contract 1.0.0 ([#2](https://github.com/danielvm-git/appwrite-canary-shell/issues/2)) ([524c23b](https://github.com/danielvm-git/appwrite-canary-shell/commit/524c23b1ed68acf75f41ec7faaab98c9fedb4d8d))

## [0.1.1] - 2026-11-24

### Fixed

- **fix:** prove patch release loop on production ([#1](https://github.com/danielvm-git/appwrite-canary-shell/issues/1)) ([aa89711](https://github.com/danielvm-git/appwrite-canary-shell/commit/aa8971126b351bca1dbf68b26335630878e1de6b))

## [0.1.0] - 2026-11-24

### Added

- **feat:** walking skeleton with Appwrite Sites deploy ([3e5027f](https://github.com/danielvm-git/appwrite-canary-shell/commit/3e5027feef200f9070a366e7f52fbd526dd6ff7b))
