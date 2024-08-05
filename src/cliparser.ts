import { CommandParser } from './commandparser';
import { CLIParseError } from './error';
import { ParsedInput, ParserConfig, SeparatedRawInput } from './types';

export class CLIParser {
  readonly config: ParserConfig;
  constructor(config: ParserConfig) {
    this.config = config;
  }

  parse(input: string): ParsedInput {
    const separatedInput = this.separateRawInput(input);
    const parser = new CommandParser(separatedInput, this.config);
    return parser.parse();
  }

  private separateRawInput = (input: string): SeparatedRawInput => {
    if (input === '') {
      throw new CLIParseError('No input provided');
    }

    const parts = this.splitString(input);
    if (parts.length === 0) {
      throw new CLIParseError('No input provided');
    }

    const command = parts[0];
    let args: string[] = [];

    if (parts.length > 1) {
      args = parts.slice(1);
    }

    return { command, args };
  };

  private splitString(input: string): string[] {
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const result: string[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      if (match[1] !== undefined) {
        // Double-quoted string without quotes
        result.push(match[1]);
      } else if (match[2] !== undefined) {
        // Single-quoted string without quotes
        result.push(match[2]);
      } else {
        // Unquoted word
        result.push(match[3]);
      }
    }

    return result;
  }
}
