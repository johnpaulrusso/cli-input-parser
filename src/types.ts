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

///START V2
export interface Argument {
  isRequired?: boolean;
}

export interface ValueConfig extends Argument {
  isArray: boolean;
  accepts: string[] | RegExp;
}

export interface FlagConfig extends Argument {
  short: string; //Ex: v used as -v
  long: string; //Ex: verbose used as --verbose
  isKey: boolean; //Set this to true if a value is expected.
  value?: ValueConfig;
}

export interface CommandConfigV2 {
  command: string;
  flags: FlagConfig[];
  values: ValueConfig[];
}

export interface ParserConfigV2 {
  supportedCommands: CommandConfigV2[];
}

export interface ParsedValue {
  isArray: boolean;
  value: string | string[];
}
export interface ParsedFlag {
  short: string; //Ex: v used as -v
  long: string; //Ex: verbose used as --verbose
  isKey: boolean;
  value?: ParsedValue;
}
export class ParsedCommand {
  command: string;
  flags: ParsedFlag[];
  values: ParsedValue[];

  constructor() {
    this.command = '';
    this.flags = [];
    this.values = [];
  }

  hasFlag(flag: string): boolean {
    return (
      this.flags.findIndex((f) => f.short === flag || f.long === flag) > -1
    );
  }

  hasFlagWithValue(flag: string): boolean {
    const arg = this.flags.find((f) => f.short === flag || f.long === flag);
    return arg ? (arg.value ? true : false) : false;
  }

  getFlagValue(flag: string): string | string[] {
    const arg = this.flags.find((f) => f.short === flag);
    if (!arg) {
      return '';
    }
    if (!arg.value) {
      return '';
    }
    return arg.value.value;
  }
}

export const example: CommandConfigV2 = {
  command: 'foo',
  flags: [
    {
      isRequired: false,
      short: 'v',
      long: 'verbose',
      isKey: false,
    },
    {
      isRequired: true,
      short: 'b',
      long: 'bar',
      isKey: true,
      value: {
        isArray: true,
        accepts: /^(?:[1-9]|[1-9][0-9])$/,
      },
    },
  ],
  values: [
    //formerly non-flagged args.
    {
      isRequired: true,
      isArray: false,
      accepts: ['Bob', 'Alice', 'John'],
    },
  ],
};
