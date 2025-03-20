import express from 'express';
import passport from 'passport';

const router = express.Router();

// Route de redirection pour l'authentification Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']  
}));

// Route de callback Google
router.get('/auth/callback', //URL dans la Google Console
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const user = req.user;  // Utilisateur récupéré par Passport après Google OAuth
        res.json({
        message: 'Authentification réussie !',
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
        },
        })
        console.log(user);
    }    
);

export default router;
