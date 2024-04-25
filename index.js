require("dotenv").config({})
const express = require('express');
const cors = require("cors");
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const port = process.env.PORT || 3030;
const mainRoutes = require('./src/routes/');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "../public")));
app.use('/', mainRoutes)

app.listen(port ,() =>{
    console.log("server running on port "+port);
})