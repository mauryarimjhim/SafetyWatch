const express=require('express');
const cors=require('cors');
const app = express();
app.use(cors());

//api route 
app.get('/analytics',(req,res)=>{
    const city=req.query.city;
    let data={};
    if(city==="Noida")
    {
        data = {
            pie:[
                {name:"Theft",value:30},
                {name:"Robbery",value:20},
            ],
            line:  [
                {month:"Jan", crimes:40},
                {month:"Feb",crimes:50},
            ],
            bar:[
                {area:"Sector 62",crimes:60},
            ]
        };
    }
    res.json(data);
});
app.listen(5000,()=>console.log("Server running on port 5000"));