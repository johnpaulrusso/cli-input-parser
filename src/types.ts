export interface SeparatedRawInput {
  command: string;
  args: string[];
}

export interface CommandConfig {
  name: string;
  flags: Array<{
    character: string; //-<char>
    verbose: string; //--<verbose>
    accepts?: string[] | RegExp;
  }>;
  accepts?: string[] | RegExp;
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
