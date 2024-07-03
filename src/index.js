import { app } from './app.js';
import startServer from './db/index.js';

startServer().
then(()=>{
    app.listen(5000,()=>{
        console.log('server is runnning at port: 5000')
    })
})
.catch((error)=>{
    console.log('mongoodb connection error',error);
})

