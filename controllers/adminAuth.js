// import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
// import { roleAuth } from '../middleware/auth.js';
// import dotenv from "dotenv";


// controller for Admin User


const generateToken = (id, role) =>{
    return jwt.sign({id, role}, process.env.JWT_SECRET_KEY, {
        expiresIn : '30d'
    });
}


export const adminRegister = async (req, res) =>{
    try{
        const {username, email, password, age} = req.body;
     
    if(!username || !email || !password){
        return res.status(400).json({message:"plese provide all values"});
    }
    const role = 'admin';
    const UserExists = await pool.query("select * from users where email = $1", [email]);
    if (UserExists.rows.length > 0){
        return res.status(400).json({message:"user already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query("insert into users (username, email, hashedpassword, age, role) values ($1, $2, $3, $4, $5) returning user_id, username, email, age, role", [username, email, hashedPassword, age, role]);

    const token = generateToken(newUser.rows[0].user_id, newUser.rows[0].role);
    res.cookie("token", token, cookieOptions);

    console.log("Admin Registered!!");

    return res.status(200).json({user: newUser.rows[0]});
    }
    catch(error){
        console.log(error);
    }
}

