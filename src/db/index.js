import mongoose from 'mongoose';
const startServer = async () => {
    try {
      const dbURI = 'mongodb+srv://vikaspatel0609:vscoder123@cluster0.auhcfkw.mongodb.net/youtube';
      await mongoose.connect(dbURI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error starting the server:', error);
    }
  };
  
  export default startServer;