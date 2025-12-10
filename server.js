import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // allows crros origin requests
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin : process.env.CLIENT_URL || 'http://localhost:5173',
    credentials : true,
}));
app.use("/api", authRoutes);

const PORT =  process.env.PORT || 5000;

// app.get("/", (req, res)=>{
//     res.send("API is running...");
// })
app.listen(PORT, ()=>{
    console.log(`Server is Running on port ${PORT}`);
})

