import mongoose from 'mongoose';

const startServer = async () => {
  try {
    const dbURI = `${process.env.MONGODB_URL}/youtube`;
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};

export default startServer;
