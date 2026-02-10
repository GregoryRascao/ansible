export class MongoNotFoundException extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'MongoNotFoundException';
  }
}
