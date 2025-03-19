import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './Route/apiRoutes.mjs';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/sauth/v1',apiRoutes);

const PORT = process.env.port || 3000;
const HOST = process.env.host || 'localhost';

app.listen(PORT, () => {
    console.log(`🚀 Serveur en écoute sur http://${HOST}:${PORT}`);
});