const express = require('express');
const path = require('path');
const mysql = require('mysql2');
//importing modules

const app=express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
//linking html public folder
app.use(express.static(path.join(__dirname,"public")));

const db = mysql.createConnection(
    {
        host:"localhost",
        user:"root",
        password:"bannu@Bhar12121",
        database:"authdb"
    }
)
db.connect(err=>{
    if(err){
        console.log("Db error",err);
    }
    console.log("Db connected");
})

//signup

app.post("/signup",(req,res)=>{

    const {username,email,password}=req.body;
    const query = "INSERT INTO users (username,email,password) VALUES (?,?,?)";
    db.query(query,[username,email,password],(err,result)=>{
        if(err){
            console.log("Eroor ",err);
            return res.send("Signup Failed")
        }
        res.send("Signup Succesfull");

    })
    console.log("Signup recieved");
    console.log(username,email,password);

    return res.send("Sign up succesfull :");


})

//login

app.post("/login",(req,res)=>{
    const {email,password}=req.body;
    const query = "SELECT * FROM users where email = ?";
    db.query(query,[email],(err,result)=>{
        if(err){
           return  res.send("Login Error");
        }
        if(result.length === 0) {
            return res.send("User Not Found: ")
        }
        console.log(result)
        const user = result[0];
        if(user.password!=password){
            return res.send("WRong password:");
        }
       return res.json({
        success:true,
        username:user.username,
        message:"Login Succesfull"
       })
    })
    console.log("Login REcieved :")
    console.log(email,password)
   
})

app.listen(3001,()=>{
console.log(`Server running at http://localhost:3001`)
})