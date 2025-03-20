import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.mjs'

// Configuration de la stratégie Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,  // Cette URL doit correspondre
  },
  async (accessToken, refreshToken, profile, done) => {
        try {
        // Récupérez les informations de l'utilisateur depuis le profil Google
        const { id, given_name, family_name, emails, photos } = profile;
        const email = emails[0].value;
        const firstName = given_name;
        const lastName = family_name;
        const profilePicture = photos[0].value;

        // Vérifiez si l'utilisateur existe déjà dans la base de données
        let user = await User.findOne({ where: { googleId: id } });

        // Si l'utilisateur n'existe pas, créez-le
            if (!user) {
                user = await User.create({
                id: id,
                firstName,
                lastName,
                email,
                profilePicture,
                });
            }
        }catch(error){
            console.log(error);
        }
    }
));

// Sauvegarde et récupération de l'utilisateur connecté
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
