const express=require('express');
const app=express();
app.use(express.json());
const port=3000;



app.listen(port,()=>{
    console.log("hello dear friend");
});

app.get("/status", (request, response) => {
    console.log("hello dear teachers");
    const status = {
       "Status": "Running",
       "suits":"okdonedone"
    };
    
    response.send(status);
 });