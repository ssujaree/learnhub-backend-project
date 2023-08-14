const express = require('express');
const application=new express();
const PORT=8000;
application.get('/',(req,resp)=>{    
    resp.send(`Congrats ! Your Node Express server is running on PORT ${PORT}`);
});
application.listen(PORT,()=>{
    console.log(`Node express server is running on ${PORT}. Enjoy NodeJS`)
});