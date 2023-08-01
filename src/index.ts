import type { PromptObject } from "prompts"
import path from "node:path"
import fs from "fs-extra"
import fg from "fast-glob"
import { cac } from "cac"
import prompts from "prompts"
import pc from "picocolors"

type Options = {
  root: string
  files: string
  ignore: string
  deps: string
}
type PkgObject = {
  path: string
  absolutePath: string
  data: { [key: string]: string | { [key: string]: string } }
}

function pkgVersion() {
  const pkgURL = new URL("../package.json", import.meta.url)
  const data = JSON.parse(fs.readFileSync(pkgURL, "utf8"))
  return data.version as string
}

function splitUniqueStr(str: string): string[] {
  return str
    .trim()
    .split(" ")
    .filter((item: string) => item.trim() !== "")
    .reduce((unique: string[], item: string) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, [])
}

function resolveItems(root: string, items: string[], exclude: boolean) {
  return items.map((item) => path.join((exclude ? "!" : "") + root, item))
}

async function rewriteVersion(
  pkgs: PkgObject[],
  newVersion: string,
  deps: string[]
) {
  await Promise.all(
    pkgs.map(async (pkg) => {
      let data = { ...pkg.data }

      console.log("\n")

      if (data?.version) {
        const oldVersion = data.version
        const toMessage = ` ${oldVersion} -> ${newVersion}`
        data.version = newVersion
        console.log(pc.gray(pkg.absolutePath) + toMessage)
      }
      if (deps.length) {
        deps.map((dep) => {
          const dependencies = data?.dependencies as
            | { [key: string]: string }
            | undefined
          const devDependencies = data?.devDependencies as
            | { [key: string]: string }
            | undefined
          const peerDependencies = data?.peerDependencies as
            | { [key: string]: string }
            | undefined
          const depArray = [dependencies, devDependencies, peerDependencies]

          depArray.map((item) => {
            if (item && Object.hasOwn(item, dep)) {
              const oldVersion = item[dep].replace(/^\^/, "")
              const toMessage = ` ${item}.${dep} ${oldVersion} -> ${newVersion}`
              item[dep] = "^" + newVersion
              console.log(pc.gray(pkg.absolutePath) + toMessage)
            }
          })
        })
      }

      console.log("\n")

      const question: PromptObject = {
        type: "select",
        name: "override",
        message: "Start overwriting?",
        choices: [
          { title: "Yes", value: true },
          { title: "No", value: false },
        ],
        initial: 0,
      }
      const res = (await prompts(question)) as { override: boolean }

      if (res.override) {
        await fs
          .outputJson(pkg.path, data, { spaces: 2 })
          .then(() => {})
          .catch((err) => {
            console.error(err)
          })
        console.log(pc.bold(pc.green("✔ Done")))
      } else {
        console.log(pc.bold(pc.red("Cancelled")))
      }
    })
  )
}

async function main(inlineVersion: string, options: Options) {
  const files = splitUniqueStr(options.files)
  const ignore = splitUniqueStr(options.ignore)
  const deps = splitUniqueStr(options.deps)
  const resolvedFiles = resolveItems(options.root, files, false)
  const resolvedIgnore = resolveItems(options.root, ignore, true)
  const pkgFiles = await fg([...resolvedFiles, ...resolvedIgnore])

  if (!pkgFiles.length) {
    return console.log(pc.red("No package.json found."))
  }
  const pkgs: PkgObject[] = await Promise.all(
    pkgFiles.map(async (item) => {
      const absolutePath = item.replace(process.cwd(), "")
      const data: { [key: string]: string } = JSON.parse(
        await fs.readFile(item, "utf8")
      )
      return { path: item, absolutePath, data }
    })
  )
  const rootPkgPath = path.join(options.root, "package.json")
  const rootPkg = pkgs.find((item) => item.path === rootPkgPath) || pkgs[0]

  const oldVersion = (rootPkg.data?.version as String) || ""
  const alphaSpliter = "-alpha."
  const verArray = oldVersion.split(alphaSpliter)
  const majorVersion = verArray[0]
  const alphaVersion = verArray[1]

  if (inlineVersion) {
    await rewriteVersion(pkgs, inlineVersion, deps)
    return
  }
  const questions: PromptObject[] = [
    {
      type: "select",
      name: "tag",
      message: "Which is the tag of the release?",
      choices: [
        { title: "Major", value: "major" },
        { title: "Alpha", value: "alpha" },
      ],
      initial: alphaVersion ? 1 : 0,
    },
    {
      type: "text",
      name: "majorVersion",
      message: "Major version:",
      initial: majorVersion,
    },
    {
      type: (_, values) => (values.tag === "major" ? null : "text"),
      name: "alphaVersion",
      message: "Alpha version:",
      initial: alphaVersion,
    },
  ]
  const res = (await prompts(questions)) as {
    tag: string
    majorVersion: number
    alphaVersion?: number
  }
  const alphaStr = res.alphaVersion ? alphaSpliter + res.alphaVersion : ""
  const newVersion = res.majorVersion + alphaStr

  await rewriteVersion(pkgs, newVersion, deps)
}

const cli = cac("npm-replace-versions")

cli
  .command("[inlineVersion]", "Replace package.json versions of all packages")
  .option("--root [root]", "[string]", { default: process.cwd() })
  .option("--files [files]", "[string | string[]]", {
    default: "**/package.json",
  })
  .option("--ignore [ignore]", "[string | string[]]", {
    default: "node_modules",
  })
  .option("--deps [deps]", "[string | string[]]", {
    default: "",
  })
  .action(async (inlineVersion: string, options: Options) => {
    try {
      await main(inlineVersion, options)
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  })

cli.help()
cli.version(pkgVersion())
cli.parse()
