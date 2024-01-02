# npm-replace-versions

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
