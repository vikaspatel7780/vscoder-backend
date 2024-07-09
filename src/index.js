import { app } from './app.js';
import startServer from './db/index.js';

startServer().
then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is runnning at port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log('mongoodb connection error',error);
})

