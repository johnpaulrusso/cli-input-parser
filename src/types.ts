export interface SeparatedRawInput {
  command: string;
  args: string[];
}

export interface CommandConfig {
  name: string;
  alias?: string; //Optional shorter version of command. Ex: add-two-numbers -> add2
  description?: string; //Command description.
  flags: Array<{
    character: string; //-<char>
    verbose: string; //--<verbose>
    accepts?: string[] | RegExp;
    acceptsDescription?: string; //If accepts is a regexp, use this for the human readable format.
    description?: string; //Description of the flag.
  }>;
  accepts?: string[] | RegExp;
  //This is an array incase there are multiple un-flagged arguments.
  arguments?: Array<{
    name: string;
    acceptsDescription?: string; //If accepts is a regexp, use this for the human readable format.
    description?: string;
  }>;
  examples?: string[]; //Array of example commands.
}

export interface ParserConfig {
  supportedCommands: CommandConfig[];
}

export class ParsedInput {
  command: string;
  flaggedArgs: Array<{
    flag: string;
    value?: string;
  }>;
  flaglessArgs: string[];

  constructor() {
    this.command = '';
    this.flaggedArgs = [];
    this.flaglessArgs = [];
  }

  hasFlag(flag: string): boolean {
    return this.flaggedArgs.findIndex((a) => a.flag === flag) > -1;
  }

  hasFlagWithValue(flag: string): boolean {
    const arg = this.flaggedArgs.find((f) => f.flag === flag);
    return arg ? (arg.value ? true : false) : false;
  }

  getFlagValue(flag: string): string {
    const arg = this.flaggedArgs.find((f) => f.flag === flag);
    return arg ? (arg.value ?? '') : '';
  }
}
