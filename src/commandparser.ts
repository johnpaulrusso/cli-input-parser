import { CLINeedHelp, CLIParseError } from './error';
import {
  CommandConfig,
  SeparatedRawInput,
  ParsedInput,
  ParserConfig,
} from './types';

export class CommandParser {
  config: CommandConfig | undefined;
  input: SeparatedRawInput;
  parsed: ParsedInput;
  argIndex: number = 0;

  constructor(input: SeparatedRawInput, config: ParserConfig) {
    this.input = input;
    this.config = config.supportedCommands.find(
      (c) => c.name === input.command || c.alias === input.command,
    );
    if (!this.config) {
      throw new CLIParseError(`Unrecognized command: ${input.command}`);
    }
    this.parsed = new ParsedInput();
    this.parsed.command = this.config.name;
  }

  parse(): ParsedInput {
    this.processArgs();
    return this.parsed;
  }

  processArgs() {
    while (this.argIndex < this.input.args.length) {
      const arg = this.input.args[this.argIndex];
      this.throwIfNeedsHelp();
      if (arg.startsWith('-')) {
        this.parseFlaggedArgument();
      } else {
        this.parseNonFlaggedArgument();
      }
      ++this.argIndex;
    }
  }

  private throwIfNeedsHelp() {
    const arg = this.input.args[this.argIndex];
    if (arg === '-h' || arg === '--help') {
      throw new CLINeedHelp(this.input.command);
    }
  }

  private parseFlaggedArgument() {
    if (!this.config) {
      throw new CLIParseError(`Unrecognized command: ${this.input.command}`);
    }
    const arg = this.input.args[this.argIndex];
    const flag = this.config.flags.find((f) => {
      return arg === `-${f.character}` || arg === `--${f.verbose}`;
    });
    if (flag) {
      if (flag.accepts == undefined) {
        this.parsed.flaggedArgs.push({ flag: flag.character });
      } else if (this.argIndex <= this.input.args.length - 2) {
        const nextArg = this.input.args[++this.argIndex];
        if (flag.accepts instanceof RegExp) {
          if (flag.accepts.test(nextArg)) {
            this.parsed.flaggedArgs.push({
              flag: flag.character,
              value: nextArg,
            });
          } else {
            throw new CLIParseError(`Invalid argument after flag ${arg}`);
          }
        } else {
          if (flag.accepts.includes(nextArg)) {
            this.parsed.flaggedArgs.push({
              flag: flag.character,
              value: nextArg,
            });
          } else {
            throw new CLIParseError(`Invalid argument after flag ${arg}`);
          }
        }
      } else {
        throw new CLIParseError(`Expected argument after flag ${arg}`);
      }
    } else {
      throw new CLIParseError(`Unsupported flag ${arg}`);
    }
  }

  private parseNonFlaggedArgument() {
    if (!this.config) {
      throw new CLIParseError(`Unrecognized command: ${this.input.command}`);
    }
    const arg = this.input.args[this.argIndex];
    if (this.config.accepts == undefined) {
      throw new CLIParseError(`Invalid argument ${arg}`);
    } else if (this.config.accepts instanceof RegExp) {
      if (!this.config.accepts.test(arg)) {
        throw new CLIParseError(`Invalid argument ${arg}`);
      } else {
        this.parsed.flaglessArgs.push(arg);
      }
    } else {
      if (!this.config.accepts.includes(arg)) {
        throw new CLIParseError(`Invalid argument ${arg}`);
      } else {
        this.parsed.flaglessArgs.push(arg);
      }
    }
  }
}
