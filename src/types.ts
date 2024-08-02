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

export interface ParsedInput {
  command: string;
  flaggedArgs: Array<{
    flag: string;
    value?: unknown;
  }>;
  flaglessArgs: unknown[];
}
