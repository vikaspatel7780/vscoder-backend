import mongoose from 'mongoose';
const startServer = async () => {
    try {
      const dbURI = 'mongodb://127.0.0.1:27017/e-comm';
      await mongoose.connect(dbURI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error starting the server:', error);
    }
  };
  
  export default startServer;