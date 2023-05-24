const express = require('express');
const app = express();
const routers = require('./routes/indexRouter');
const  {homeConfig} = require('./configs/indexConfig');
const cors = require('cors');
const cookieParser = require('cookie-parser');




homeConfig();
const port = process.env.PORT || 3000;


app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(routers);
console.log(process.env.PORT);






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});