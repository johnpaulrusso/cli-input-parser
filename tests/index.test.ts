import { ParserConfig } from '../src/types'
import { CLIParser } from '../src/cliparser'
import { CLINeedHelp, CLIParseError } from '../src/error';

const testConfig: ParserConfig = {
    supportedCommands: [
      {
        name: 'test1',
        flags: [
          {
            character: 'v',
            verbose: 'verbose',
          },
        ],
        accepts: ['dev', 'prod', 'Two Words'],
      },
      {
        name: 'test2',
        flags: [
          {
            character: 'v',
            verbose: 'verbose',
          },
        ],
        accepts: /^(?:[1-9]|[1-9][0-9])$/,
      },
      {
        name: 'test3',
        flags: [
          {
            character: 'v',
            verbose: 'verbose',
          },
        ],
      },
      {
        name: 'test4',
        flags: [
          {
            character: 'm',
            verbose: 'mode',
            accepts: ['dev', 'prod'],
          },
        ],
      },
      {
        name: 'test5',
        flags: [
          {
            character: 'n',
            verbose: 'number',
            accepts: /^(?:[1-9]|[1-9][0-9])$/,
          },
        ],
      },
      {
        name: 'test6',
        flags: [
          {
            character: 'm',
            verbose: 'mode',
            accepts: ['dev', 'prod'],
          },
          {
            character: 'n',
            verbose: 'number',
            accepts: /^(?:[1-9]|[1-9][0-9])$/,
          },
        ],
        accepts: ['Bob', 'Alice', 'John'],
      },
      {
        name: 'test7',
        flags: [
          {
            character: 'm',
            verbose: 'mode',
            accepts: ['dev', 'prod'],
          },
          {
            character: 'n',
            verbose: 'number',
            accepts: /^(?:[1-9]|[1-9][0-9])$/,
          },
        ],
        accepts: ['Bob', 'Alice', 'John'],
      },
    ],
  };
  
const parser = new CLIParser(testConfig);

  //Raining day cases
test.only('Test new parser unrecognized command', () => {
    const raw1 = "unrecognized -u";
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Unrecognized command: unrecognized'));
});

test.only('Test new parser need help', () => {
    const raw1 = "test1 -h";
    
    expect(() => parser.parse(raw1)).toThrow(CLINeedHelp);

    const raw2 = "test1 --help";
    
    expect(() => parser.parse(raw2)).toThrow(CLINeedHelp);
});

test.only('Test new parser unrecognized flag', () => {
    const raw1 = "test1 -u";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Unsupported flag -u'));
});

test.only('Test new parser missing value after flag', () => {
    const raw1 = "test4 -m";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Expected argument after flag -m'));
});

test.only('Test new parser missing value after flag', () => {
    const raw1 = "test5 -n";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Expected argument after flag -n'));
});

test.only('Test new parser unsupported value after flag - accepts string list', () => {
    const raw1 = "test4 -m unsupported";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument after flag -m'));
});

test.only('Test new parser unsupported value after flag - accepts regex', () => {
    const raw1 = "test5 -n unsupported";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument after flag -n'));
});

test.only('Test new parser non-flagged unsupported arguement - accepts string list', () => {
    const raw1 = "test1 noflag";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument noflag'));
});

test.only('Test new parser non-flagged unsupported arguement - accepts regex', () => {
    const raw1 = "test2 noflag";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument noflag'));
});

test.only('Test new parser expecting no non-flagged arguments', () => {
    const raw1 = "test3 noflag";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument noflag'));
});

test.only('Test parse two args without quotes', () => {
    const raw1 = "test1 -v Two Words";
    
    expect(() => parser.parse(raw1))
        .toThrow(new CLIParseError('Invalid argument Two'));
});

//Sunny day cases
test.only('Test new parser flag that does not expect a value', () => {
    const raw1 = "test1 -v prod";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test1');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(1);
    expect(parsed.flaggedArgs[0].flag).toBe('v');
    expect(parsed.flaglessArgs[0]).toBe('prod');
});

test.only('Test new parser flag that does not expect a value', () => {
    const raw1 = "test2 --verbose 12";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test2');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(1);
    expect(parsed.flaggedArgs[0].flag).toBe('v');
    expect(parsed.flaglessArgs[0]).toBe('12');
    expect(parsed.hasFlagWithValue('v')).toBeFalsy();
});

test.only('Test new parser flag that does expect a value from a string list', () => {
    const raw1 = "test4 --mode dev";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test4');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(0);
    expect(parsed.flaggedArgs[0].flag).toBe('m');
    expect(parsed.flaggedArgs[0].value).toBe('dev');
});

test.only('Test new parser flag that does expect a value based on a regex', () => {
    const raw1 = "test5 -n 25";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test5');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(0);
    expect(parsed.flaggedArgs[0].flag).toBe('n');
    expect(parsed.flaggedArgs[0].value).toBe('25');
});

test.only('Test new parser complex command', () => {
    const raw1 = "test6 -n 25 --mode prod Alice John";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test6');
    expect(parsed.flaggedArgs.length).toBe(2);
    expect(parsed.flaglessArgs.length).toBe(2);
    expect(parsed.flaggedArgs[0].flag).toBe('n');
    expect(parsed.flaggedArgs[0].value).toBe('25');
    expect(parsed.flaggedArgs[1].flag).toBe('m');
    expect(parsed.flaggedArgs[1].value).toBe('prod');
    expect(parsed.flaglessArgs[0]).toBe('Alice');
    expect(parsed.flaglessArgs[1]).toBe('John');

    expect(parsed.hasFlag('n')).toBeTruthy();
    expect(parsed.hasFlag('m')).toBeTruthy();
    expect(parsed.hasFlagWithValue('n')).toBeTruthy();
    expect(parsed.hasFlagWithValue('m')).toBeTruthy();
    expect(parsed.getFlagValue('n')).toBe('25');
    expect(parsed.getFlagValue('m')).toBe('prod');
    expect(parsed.hasFlag('v')).toBeFalsy();
});

test.only('Test parse single quoted argument', () => {
    const raw1 = "test1 -v \'Two Words\'";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test1');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(1);
    expect(parsed.flaggedArgs[0].flag).toBe('v');
    expect(parsed.flaglessArgs[0]).toBe('Two Words');
});

test.only('Test parse double quoted argument', () => {
    const raw1 = "test1 -v \"Two Words\"";
    
    const parsed = parser.parse(raw1)
    expect(parsed.command).toBe('test1');
    expect(parsed.flaggedArgs.length).toBe(1);
    expect(parsed.flaglessArgs.length).toBe(1);
    expect(parsed.flaggedArgs[0].flag).toBe('v');
    expect(parsed.flaglessArgs[0]).toBe('Two Words');
});