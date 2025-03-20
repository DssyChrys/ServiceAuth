import UserModel from '../models/userModel.mjs';
import PersonalModel from '../models/personalaccestokenModel.mjs'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
import Personal from '../models/personalaccestokenModel.mjs';

dotenv.config(); 


const apiKey = process.env.BREVO_API_KEY;
const encrypt = (text) => {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.CRYPTO_KEY, 'hex'),
        Buffer.from(process.env.CRYPTO_IV, 'hex')
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const createtoken = (_id) => {
    const jwtkey = process.env.JWT_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: '30m' }); 
};
class UserController {

    async store(req, res) {
        try {
            const { firstname, lastname, email, password } = req.body;

            if (!firstname || !lastname || !email || !password) {
                return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
            }

            const userExists = await UserModel.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await UserModel.create({
                firstname,
                lastname,
                email,
                password: hashedPassword,
            });

            return res.status(201).json({
                message: 'Utilisateur créé avec succès',
                utilisateur: {
                    id: newUser.id,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    email: newUser.email
                }
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findOne({ where: { email } });
            if (!user) return res.status(400).json("Email incorrect");

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return res.status(400).json("Mot de passe incorrect");

            // Création des tokens
            const token = createtoken(user.id);

            await PersonalModel.upsert({
                user_id: user.id,
                accesstoken: encrypt(token) 
        });

            return res.status(200).json({
                id: user.id,
                token: token,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            });

        } catch (error) {
            console.error('Erreur de connexion:', error);
            return res.status(500).json(error);
        }
    }

    index = async (req, res) => {
        try {
            const users = await UserModel.findAll();
            return res.status(200).json(users);
        } catch (error) {
            console.error('Erreur lors de l\'affichage des utilisateurs:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    update = async (req, res) => {
        try {
            const UserId = req.params.UserId;
            const { firstname, lastname, email, password } = req.body;

            const user = await UserModel.findByPk(UserId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            if (email) user.email = email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            await user.save();
            return res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user: user });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    destroy = async (req, res) => {
        try {
            const UserId = req.params.UserId;
            const user = await UserModel.findByPk(UserId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            await user.destroy();
            return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    forgotPassword = async(req, res) =>{
        try{
            const {email} = req.body;
            if(!email){
                return res.status(400).json({message: 'Email est obligatoire'});
            }
            const user = await UserModel.findOne({where: {email}});
            if(!user){
                return res.status(404).json({message: 'Utilisateur non trouvé'});
            }
            const token = crypto.randomBytes(20).toString('hex');
  
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;

            sendResetEmail(email, token);

            return res.status(200).json({message: 'Email de réinitialisation envoyé',});
            

        }catch(error){
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
            
        }
    }

    resetPassword = async(req, res) =>{
        try{
            const { email, code, newPassword } = req.body;

            if (!email || !code || !newPassword) {
                return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
            }
    
            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
    
            // Vérifier si le code est valide dans la table password_reset
            const resetEntry = await PersonalModel.findOne({
                where: { user_id: user.id, resetcode: code },
            });

            const expirationDate = new Date(resetEntry.resetcodeexpiration);
            if (!resetEntry || expirationDate < Date.now()) {
                return res.status(400).json({ message: 'Code invalide ou expiré' });
            }
    
            // Réinitialiser le mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
    
            await resetEntry.destroy();
    
            return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
        }catch(error){
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }
}


function generateNumericCode(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10); // 0-9
    }
    return result;
}


SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;
async function sendResetEmail(email, token) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    const code = generateNumericCode(5);
    sendSmtpEmail.sender = { email: 'devsolution04@gmail.com' };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Réinitialisation de votre mot de passe';
    sendSmtpEmail.htmlContent = `<html><body><h3>Voici le code de reinitialisation de votre mot de passe : </h3>
                                 <a>Code: ${code} </a></body></html>`;
       
    
    const user = await UserModel.findOne({ where: { email } });
    if (user) {
        // Vérifier si l'utilisateur a déjà un code de réinitialisation actif
        const existingResetEntry = await PersonalModel.findOne({ where: { user_id: user.id } });
        
        if (existingResetEntry) {
            // Si un code existe déjà, met à jour la date d'expiration et le code
            existingResetEntry.resetcode = code;
            existingResetEntry.resetcodeexpiration = new Date(Date.now() + 7200000); // Expiration dans 1 heure
            await existingResetEntry.save();
        } else {
            // Sinon, créer une nouvelle entrée
            await PersonalModel.create({
                user_id: user.id,
                resetcode: code,
                resetcodeexpiration: new Date(Date.now() + 7200000), // Expiration dans 1 heure
            });
        }
    }

    apiInstance.sendTransacEmail(sendSmtpEmail, { headers: { 'api-key': apiKey } }).then(
      function (data) {
        console.log('Email de réinitialisation envoyé : ', data);
      },
      function (error) {
        console.error('Erreur lors de l\'envoi de l\'email : ', error);
      }
    );
  }

export default new UserController();