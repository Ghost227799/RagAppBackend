import mongoose from 'mongoose';

class MongoService {
  private static instance: MongoService;

  private constructor() {}

  public static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }

  public async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }
}

export default MongoService.getInstance();
