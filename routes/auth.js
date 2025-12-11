import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { roleAuth } from '../middleware/auth.js';
import dotenv from "dotenv";

import {adminRegister} from '../controllers/adminAuth.js'

dotenv.config();

const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite : "none",
    maxAge : 30 *24 *60 *60 *1000 // 30 days
}

const generateToken = (id, role) =>{
    return jwt.sign({id, role}, process.env.JWT_SECRET_KEY, {
        expiresIn : '30d'
    });
}



// Test route
router.get("/check", (req, res)=>{
    res.send("Auth route is working password: " + process.env.DB_PASSWORD);
    console.log("DB Password: " + process.env.DB_PASSWORD);
});



// Admin routes

router.post("/auth/admin_register",adminRegister);


// Register 
router.post("/register", async (req, res)=>{            
    const {username, email, password, age, role} = req.body;
     
    if(!username || !email || !password || !role){
        return res.status(400).json({message:"plese provide all values"});
    }

    const UserExists = await pool.query("select * from users where email = $1", [email]);
    if (UserExists.rows.length > 0){
        return res.status(400).json({message:"user already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query("insert into users (username, email, hashedpassword, age, role) values ($1, $2, $3, $4, $5) returning user_id, username, email, age, role", [username, email, hashedPassword, age, role]);

    const token = generateToken(newUser.rows[0].user_id, newUser.rows[0].role);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({user: newUser.rows[0]});

})



// login
router.post("/login", async (req, res)=>{
    const {email, password, role} = req.body;

    if(!email || !password || !role){
        return res.status(400).json({message:"Plese provide all required fields"});
    }
    const User = await pool.query("select * from users where email = $1", [email]);

    if (User.rows.length === 0){
        return res.status(400).json({message:"Invalid credentials"});
    }

    const userData = User.rows[0];
    const isMatch = await bcrypt.compare(password, userData.hashedpassword);
    
    if(!isMatch){   
        return res.status(400).json({message:"Invalid Credentials"});
    }

    const token = generateToken(userData.user_id, userData.role);
    res.cookie("token", token);
    console.log("Login successful, token generated and cookie set. " );

    return res.status(200).json({user:{
        id: userData.user_id,
        username: userData.username,
        email: userData.email,
    }})
})


//admin profile
router.get("/profile", roleAuth(["admin"]), async (req, res)=>{
    res.json({user: req.user});
});

//logout 

router.post("/logout", (req, res) =>{
    res.cookie('token', '', { maxAge: 0});
    res.json({message:"loggedout sucessfully"});
})


router.get("/me", roleAuth(["user", "admin"]), async (req, res) => {
    res.json({ user: req.user });
});

export default router;
