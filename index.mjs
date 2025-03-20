import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import apiRoutes from './Route/apiRoutes.mjs';
import authRoutes from './Route/authRoutes.mjs';

import './Config/passport-config.mjs';

const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'superSecretKey', 
        resave: false, // Ne pas resauvegarder la session si elle n’a pas changé
        saveUninitialized: false, // Ne pas sauvegarder les sessions vides
        cookie: { secure: false }, // Passer à true si HTTPS est activé
    })
);


app.use(passport.initialize());
app.use(passport.session()); // Stocke les données d'auth en session


app.use(cors());
app.use(express.json());
app.use('/api/sauth/v1',apiRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.port || 3000;
const HOST = process.env.host || 'localhost';

app.listen(PORT, () => {
    console.log(`🚀 Serveur en écoute sur http://${HOST}:${PORT}`);
});