# npm-replace-versions

<p>
  <a aria-label="Made by QRANOKO" href="https://qranoko.jp">
    <img src="https://img.shields.io/badge/MADE%20BY%20QRANOKO-212121.svg?style=for-the-badge&labelColor=212121">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/npm-replace-versions">
    <img alt="" src="https://img.shields.io/npm/v/npm-replace-versions.svg?style=for-the-badge&labelColor=212121">
  </a>
  <a aria-label="License" href="https://github.com/qrac/npm-replace-versions/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/npm-replace-versions.svg?style=for-the-badge&labelColor=212121">
  </a>
</p>

Update and unify the version of all package.json in the project.

## Installation

Install globally:

```sh
$ npm install -g npm-replace-versions
```

Or run with [npx](https://docs.npmjs.com/cli/v7/commands/npx):

```sh
$ npx npm-replace-versions
```

## Usage

```sh
$ rev

✔ Which is the tag of the release? › Major
✔ Major version: … 0.1.1


/package.json 0.1.0 -> 0.1.1


✔ Start overwriting?? › Yes
✔ Done
```

```sh
# shortcut
$ rev 0.1.1

/package.json 0.1.0 -> 0.1.1


✔ Start overwriting? › Yes
✔ Done
```

## Options

| option     | default           | detail                                                |
| ---------- | ----------------- | ----------------------------------------------------- |
| `--root`   | `process.cwd()`   | Change where to start looking                         |
| `--files`  | `**/package.json` | Glob target file                                      |
| `--ignore` | `node_modules`    | Glob ignore file                                      |
| `--deps`   | `undefined`       | Replace dependencies (ex: `--deps packageA,packageB`) |

## License

- MIT

## Credit

- Author: [Qrac](https://qrac.jp)
- Organization: [QRANOKO](https://qranoko.jp)
