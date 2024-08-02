### Usage

##### Step 1. Create a configuration
The configuration specifies a list of supported commands. For each supported command, optional flagged arguments can be specified. Additionally, for flagged arguments and non-flagged arguments, the expected/accepted format can be specified with either a string list or regular expression. Flagged arguments are any arguments that start with a dash. See some examples below.
```javascript
const config: ParserConfig = {
    supportedCommands: [
      //example1 -m/--mode <string> -n/--number <number> [arg1 ... argN]
      {
        name: 'example1',
        flags: [
          {
            character: 'm', //-m
            verbose: 'mode', //--mode
            accepts: ['dev', 'prod'], //Accepts dev or prod
          },
          {
            character: 'n', //-n
            verbose: 'number', //--number
            accepts: /^(?:[1-9]|[1-9][0-9])$/, //Accepts 1-99
          },
        ],
        //Accepts non, flagged, and/or arguments
        accepts: ['non', 'flagged', 'arguments'],
      },
      //Ex: example2 -v/--verbose
      {
        name: 'example2',
        flags: [
          {
            character: 'v', //-m
            verbose: 'verbose', //--verbose
          },
        ],
      },
    ],
  };
```

##### Step 2. Create a parser
A valid configuration must be passed to the parser on construction.
```javascript
import { CLIParser } from 'cli-input-parser'
const parser = new CLIParser(config);
```

##### Step 3. Parse some input
A valid configuration must be passed to the parser on construction.
```javascript
import { CLIParser } from 'cli-input-parser'
const input = 'my-command -a arg';
const parsed = parser.parse(input);
```

##### Step 4. Use the parsed input
Let's take a look at the typing of the parsed input below.
```javascript
export interface ParsedInput {
  command: string;
  flaggedArgs: Array<{
    flag: string;
    value?: unknown;
  }>;
  flaglessArgs: unknown[];
}
```
Arguments are collected and separated as flagged (starts with '-') or non-flagged arguments. Flagged arguments may optionally contain a value. 

```javascript
//Example to get the -m/--mode arg from example 1 above.
let mode = '';
if(parsed.hasFlagWithValue('m')){
    mode = parsed.getFlagValue('m');
}
```

```javascript
//Example to get the -v/--verbose arg from example 2 above.
let verbose = parsed.hasFlag('v');
```

### Error Handling

##### Help

Any command passed the -h or --help argument will throw the CLINeedsHelp error. It is currently the users responsibilty to handle this error. In the future I may build help messages into the configuration.

##### Other

All other errors when calling parse will throw the CLIParseError error.
