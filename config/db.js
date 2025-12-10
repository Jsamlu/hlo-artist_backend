import {Pool} from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT,
})

pool.on("connect", ()=>{
    console.log("Database connected successfully");
})

pool.on("error", ()=>{
    console.error("Database Error");
})

export default pool;