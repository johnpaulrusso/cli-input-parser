import { platform } from 'os';
import { CLINeedHelp, CLIParseError } from './error';
import {
  CommandConfig,
  CommandConfigV2,
  SeparatedRawInput,
  ParsedInput,
  ParserConfig,
  ParserConfigV2,
  ParsedCommand,
  ParsedFlag,
  FlagConfig,
  ParsedValue,
  ValueConfig,
} from './types';

export class CommandParser {
  config: CommandConfig | undefined;
  input: SeparatedRawInput;
  parsed: ParsedInput;
  argIndex: number = 0;

  constructor(input: SeparatedRawInput, config: ParserConfig) {
    this.input = input;
    this.config = config.supportedCommands.find(
      (c) => c.name === input.command,
    );
    if (!this.config) {
      throw new CLIParseError(`Unrecognized command: ${input.command}`);
    }
    this.parsed = new ParsedInput();
    this.parsed.command = input.command;
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

export class CommandParserV2 {
  config: CommandConfigV2 | undefined;
  input: SeparatedRawInput;
  parsed: ParsedCommand;
  argIndex: number = 0;
  valueConfigIndex: number = 0;

  constructor(input: SeparatedRawInput, config: ParserConfigV2) {
    this.input = input;
    this.config = config.supportedCommands.find(
      (c) => c.command === input.command,
    );
    if (!this.config) {
      throw this.getUnrecognizedCommandException();
    }
    this.parsed = new ParsedCommand();
    this.parsed.command = input.command;
  }

  parse(): ParsedCommand {
    this.processArgs();
    return this.parsed;
  }

  private processArgs() {
    if (!this.config) {
      throw this.getUnrecognizedCommandException();
    }

    while (this.argIndex < this.input.args.length) {
      const arg = this.input.args[this.argIndex];

      this.throwIfNeedsHelp();

      if (arg.startsWith('-')) {
        this.parsed.flags = this.parsed.flags.concat(this.parseFlag(arg));
      } else {
        if (this.valueConfigIndex >= this.config.values.length) {
          throw new CLIParseError(
            `Invalid argument ${arg} - No more arguments expected.`,
          );
        }
        const valueConfig = this.config.values[this.valueConfigIndex];
        this.parsed.values = this.parsed.values.concat(
          this.parseValue(arg, valueConfig),
        );
      }

      ++this.argIndex;
    }
  }

  private parseFlag(flagArgument: string): ParsedFlag[] {
    const MINIMUM_FLAG_STRING_LENGTH = 2;

    if (flagArgument.startsWith('--')) {
      //long-form flag. Possibly keyed!
      return [
        this.parseLongFormFlagArgument(
          flagArgument.substring(MINIMUM_FLAG_STRING_LENGTH),
        ),
      ];
    } else if (flagArgument.length > MINIMUM_FLAG_STRING_LENGTH) {
      //multiple short-form flags in a group. Keys not permitted.
      return this.parseShortFormFlagGroup(flagArgument.substring(1));
    } else {
      //This must be a short-form, un-keyed flag.
      return [this.parseShortFormFlag(flagArgument.substring(1))];
    }
  }

  private parseLongFormFlagArgument(longFlag: string): ParsedFlag {
    if (!this.config) {
      throw this.getUnrecognizedCommandException();
    }

    const flagConfig = this.config.flags.find((f) => {
      return longFlag === f.long;
    });

    if (!flagConfig) {
      throw new CLIParseError(`Unsupported flag argument --${longFlag}`);
    }

    if (flagConfig.isKey) {
      return this.parseKeyedFlagArgument(flagConfig);
    }

    return flagConfig as ParsedFlag;
  }

  private parseShortFormFlagGroup(flagGroup: string): ParsedFlag[] {
    const parsedFlags: ParsedFlag[] = [];
    for (let i = 0; i < flagGroup.length; ++i) {
      const shortFlag = flagGroup[i];

      if (!this.config) {
        throw this.getUnrecognizedCommandException();
      }

      const flagConfig = this.config.flags.find((f) => {
        return shortFlag === f.short;
      });

      if (!flagConfig) {
        throw new CLIParseError(`Unsupported flag argument -${shortFlag}`);
      }

      if (flagConfig.isKey) {
        throw new CLIParseError(
          `Flag argument -${shortFlag} may not be grouped with other flags. Expects a value.`,
        );
      }

      parsedFlags.push(flagConfig as ParsedFlag);
    }
    return parsedFlags;
  }

  private parseShortFormFlag(shortFlag: string): ParsedFlag {
    if (!this.config) {
      throw this.getUnrecognizedCommandException();
    }

    const flagConfig = this.config.flags.find((f) => {
      return shortFlag === f.short;
    });

    if (!flagConfig) {
      throw new CLIParseError(`Unsupported flag argument -${shortFlag}`);
    }

    if (flagConfig.isKey) {
      return this.parseKeyedFlagArgument(flagConfig);
    }

    return flagConfig as ParsedFlag;
  }

  private parseKeyedFlagArgument(flagConfig: FlagConfig): ParsedFlag {
    if (flagConfig.value === undefined) {
      throw new CLIParseError(`Invalid flag configuration missing value.`);
    }

    this.argIndex++;
    const parsedFlag: ParsedFlag = {
      short: flagConfig.short,
      long: flagConfig.long,
      isKey: flagConfig.isKey,
      value: this.parseValue(flagConfig.value),
    };

    return parsedFlag;
  }

  private parseValue(valueArgument: string, valueConfig: ValueConfig): ParsedValue {
    if(valueConfig.isArray) {
        return this.parseArrayValue(valueArgument, valueConfig.accepts);
    }else{
        return this.parseSingleValue(valueArgument, valueConfig.accepts);
    }
  }

  private parseSingleValue(rawValue: string, accepts: string[] | RegExp): ParsedValue {
    if(accepts instanceof RegExp && !accepts.test(rawValue)){
        throw new CLIParseError(`Invalid argument. Expected to match pattern: ${accepts.source}`);
    }else if(!(accepts instanceof RegExp) && !accepts.includes(rawValue)){
        throw new CLIParseError(`Invalid argument. Expected to match one of: ${accepts.toString()}`);
    }

    const parsedValue: ParsedValue = {
        isArray: false,
        value: rawValue
    }
    return parsedValue;
  }

  private getUnrecognizedCommandException() {
    return new CLIParseError(`Unrecognized command: ${this.input.command}`);
  }

  private throwIfNeedsHelp() {
    const arg = this.input.args[this.argIndex];
    if (arg === '-h' || arg === '--help') {
      throw new CLINeedHelp(this.input.command);
    }
  }
}
