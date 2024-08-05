# CLI Input Parser

A configuration-forward TypeScript library to parse command line inputs with support for flagged and non-flagged arguments.

## Table of Contents
1. [Summary](#summary)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Step 1: Create a Configuration](#step-1-create-a-configuration)
   - [Step 2: Create a Parser](#step-2-create-a-parser)
   - [Step 3: Parse Some Input](#step-3-parse-some-input)
   - [Step 4: Use the Parsed Input](#step-4-use-the-parsed-input)
4. [Error Handling](#error-handling)
   - [Help](#help)
   - [Other Errors](#other-errors)
5. [Contributing](#contributing)
6. [License](#license)

## Summary

The CLI Input Parser allows you to define a configuration for supported commands and their arguments, and then parse input strings based on this configuration. It supports flagged arguments (starting with a dash) and non-flagged arguments, with optional validation using string lists or regular expressions.

## Installation

To install the CLI Input Parser, use npm:

```sh
npm install cli-input-parser
```

## Usage

### Step 1: Create a Configuration

The configuration specifies a list of supported commands. Each command can have optional flagged arguments. Both flagged and non-flagged arguments can specify their expected/accepted formats using either a list of strings or a regular expression. Flagged arguments are those that start with a dash (`-`). Below are some examples:

```typescript
const config: ParserConfig = {
    supportedCommands: [
        // example1 -m/--mode <string> -n/--number <number> [arg1 ... argN]
        {
            name: 'example1',
            flags: [
                {
                    character: 'm', // -m
                    verbose: 'mode', // --mode
                    accepts: ['dev', 'prod'], // Accepts 'dev' or 'prod'
                },
                {
                    character: 'n', // -n
                    verbose: 'number', // --number
                    accepts: /^(?:[1-9]|[1-9][0-9])$/, // Accepts 1-99
                },
            ],
            accepts: ['non', 'flagged', 'arguments'],
        },
        // example2 -v/--verbose
        {
            name: 'example2',
            flags: [
                {
                    character: 'v', // -v
                    verbose: 'verbose', // --verbose
                },
            ],
        },
    ],
};
```

### Step 2: Create a Parser

A valid configuration must be passed to the parser upon construction.

```typescript
import { CLIParser } from 'cli-input-parser';
const parser = new CLIParser(config);
```

### Step 3: Parse Some Input

Use the parser to parse input strings based on the configuration.

```typescript
const input = 'example1 -m dev -n 42 argument1 argument2';
const parsed = parser.parse(input);
```

### Step 4: Use the Parsed Input

The parsed input separates flagged and non-flagged arguments. Here is the type definition of the parsed input:

```typescript
export interface ParsedInput {
    command: string;
    flaggedArgs: Array<{
        flag: string;
        value?: unknown;
    }>;
    flaglessArgs: unknown[];
}
```

To access specific flagged arguments:

```typescript
// Example to get the -m/--mode arg from example1 above.
let mode = '';
if (parsed.hasFlagWithValue('m')) {
    mode = parsed.getFlagValue('m');
}

// Example to check if -v/--verbose flag is present from example2 above.
let verbose = parsed.hasFlag('v');
```

## Error Handling

### Help

Any command passed with the `-h` or `--help` argument will throw the `CLINeedsHelp` error. Currently, it is the user's responsibility to handle this error. Future versions may include built-in help messages in the configuration.

### Other Errors

All other errors when calling `parse` will throw the `CLIParseError` error.

## Contributing

Contributions are welcome! Please submit pull requests or issues to the repository.

## License

This project is licensed under the MIT License.
