const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cookieparser = require('cookie-parser');
const authMiddleware = require('./authMiddleware');
//importing modules

const app=express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieparser());
//linking html public folder
app.use(express.static(path.join(__dirname,"public")));

const db = mysql.createConnection(
    {
        host:"localhost",
        user:"root",
        password:"yourpassword",
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

app.post("/signup",async (req,res)=>{

    const {username,email,password}=req.body;
    if(!username || !email || !password ){
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\;:'",.<>/?]).{8,}$/;
    try{
        const hashedpassword = await bcrypt.hash(password,10);
        const query = "INSERT INTO users (username,email,password) VALUES (?,?,?)";
    db.query(query,[username,email,hashedpassword],(err,result)=>{
        if(err){
            console.log("Eroor ",err);
            return res.send("Signup Failed")
        }else{
        return res.send("Signup Succesfull");
        }
    })
    console.log("Signup recieved");
    console.log(username,email,password);

    }
    catch{
        console.log("Error hashing password :")
    }
    

})

//login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, result) => {
        if (err) {
            return res.json({ success: false, message: "Login Error" });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: "User Not Found" });
        }

        const user = result[0];
        const ismatch = await bcrypt.compare(password, user.password);

        if (ismatch) {
            res.cookie("session-user", user.username, {
                httpOnly: false,
                secure: false,
                maxAge: 1000 * 60 * 60
            });

            return res.json({
                success: true,
                username: user.username,
                message: "Login Successful"
            });
        }

        return res.json({
            success: false,
            message: "Wrong username or password"
        });
    });
});
app.get("/dashboard",authMiddleware,(req,res)=>{
   res.json({
     success: true,
    username: req.username
   })
});
app.post("/logout",(req,res)=>{
    res.clearCookie("session-user");
    return res.json({success:true,message:"Logged Out"});
})


app.listen(3001,()=>{
console.log(`Server running at http://localhost:3001`)
})
