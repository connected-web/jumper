## Jumper

Jumper is a multi-repository maintenance tool.

![A knitted jumper](./jumper.jpg)

## Prerequisites
- [`node`](https://nodejs.org/en/) > `12`
- [`npm`](https://www.npmjs.com/) > `6`
- [`hub`](https://github.com/github/hub) > `2.14` with a github personal access token set on your env, e.g. GITHUB_TOKEN="xyz"

## What does Jumper do?

- From the command line
- In parallel
- Runs a selected strategy `--strategy`
- Against multiple repositories specified by `--repoList`
- And then creates log files

## Getting started

You can use the latest version of this tool using the following command in the terminal:
```
npx github:connected-web/jumper
```

This should output text similar to: 
```
[JUMPER CLI] Starting process
Usage: -r <repolist.txt> -s <audit> -r <tvpx-200>

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  ...[and more]
```

### Running the audit strategy

Create a text file containing a list of repositories that you wish you audit, e.g. `repolist.txt`:

```
connected-web/diplo
connected-web/ownership
connected-web/quick-score
```

Then to run the audit strategy on these repositories against against the reference `ownership`, use the following command: 

```
npx github:connected-web/jumper --strategy audit --repoList ./repolist.txt --reference ownership
```

The above command will clone the repositories into a temporary `repos` folder, and automatically runs `npm audit fix --force` on each repository. It will then commit the changes and then raise a pull request using `hub`. Logs for each operation performed will be created in a temporary `./logs` folder.

Other strategies are available, see the [Available Strategies](#available-strategies) section below.

## Flags and Args

### -s / --strategy

Choose a strategy from the [index of available keys](./src/strategies/index.js). To see more about what each strategy does, see the [Available Strategies](#available-strategies) section below.

### -l / --repoList

The filename containing the list of github repos to run strategies against; in the format org/reponame, one per line. See [Specifying Repositories](#specifying-repositories) section below.

### -r / --reference [optional]

Optional. Ideally a unique reference to the work this tool usage is related to.  This reference can be used by strategies performing commits and similar actions. 

## Specifying Repositories

You can specify the repos to run in the repolist.txt or your own text file, utilising the `--repoList ./filename.txt` argument. 

In the file, include a return character separated list of GitHub repositories in the format `[organisation]/[repository name]`, e.g. `repolist.txt`:

```
connected-web/diplo
connected-web/ownership
connected-web/quick-score
```

## Available Strategies

### Audit

Uses `npm audit fix --force` to update each repos and then create a PR.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy audit`

See the [audit strategy source code](./src/strategies/audit.strategy.js) for the full list of commands.

### Checkout

Uses `git clone git@github.com:${repo}.git` to clone a list of repos into the subfolder `repos/${repo}`.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy checkout`

See the [checkout strategy source code](./src/strategies/checkout.strategy.js) for the full list of commands.

### Hello

Uses `echo "Hello ${repo}` to print out the name of each repo. This is a super-safe example of a jumper strategy that you can use to build your own strategies.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy hello`

See the [hello strategy source code](./src/strategies/hello.strategy.js) to see how this works.

### Linting

Checks for a lint command in `package.json`; then uses `npm uninstall standard`, and `npm install -D standard`, before running `npm run lint`, and raising a PR. The idea is to upgrade the linter, and then apply any new linting rules. Quite often this will lead to unfixable linting errors; but the PR still gets created, and can be reviewed and fixed from there.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy linting --reference ownership`

See the [linting strategy source code](./src/strategies/linting.strategy.js) to see how this works.

### PR Checker

Looks for a `test` command in `package.json` and then a `.github/workflows/pr-check.yml` file. If the `test` command is found, but not the `pr-check.yml` file; then this strategy will create the `pr-check.yml` file based on a local template; and a raise a PR on each repo checked.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy pr-checker`

See the [rebuild strategy source code](./src/strategies/rebuild.strategy.js) for the full list of commands.

### Rebuild

Uses `npm uninstall ${a} ${b} ${b}` to remove all dependencies, and then reinstalls the latest available versions using `npm install ${a} ${b} ${c}`. Processes dependencies and devDependencies separately. After updating package.json in each repo it will raise a PR.

Example: `npx github:connected-web/jumper --repoList repolist.txt --strategy rebuild`

See the [rebuild strategy source code](./src/strategies/rebuild.strategy.js) for the full list of commands.

## General development

If wanting to contribute to the project, we recommend creating a new branch and raising a pull-request for us to review. 

The project has linting, which can be run using `npm run lint`. 

It also includes lightweight tests that can be run with `rpm run test`

## Adding a new strategy

Currently we only support the provided [Available Strategies](#available-strategies), to write your own please create a pull request against this project. In future we may add support for loading a strategy from a local JavaScript file.
