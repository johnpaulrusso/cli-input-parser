export class CLIParseError extends Error {
  constructor(message: string) {
    super(message); // Call the parent constructor with the message
    this.name = 'CLIParseError'; // Set the error name
    Object.setPrototypeOf(this, CLIParseError.prototype); // Restore prototype chain
  }
}

export class CLINeedHelp extends Error {
  constructor(command: string) {
    super(command); // Call the parent constructor with the message
    this.name = 'CLINeedHelp'; // Set the error name
    Object.setPrototypeOf(this, CLINeedHelp.prototype); // Restore prototype chain
  }
}
