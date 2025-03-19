import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();

app.use(cors());
app.use(express.json());

app.listen(process.env.port, process.env.localhost ,()=> {
    console.log('Serveur en ecoute');
});