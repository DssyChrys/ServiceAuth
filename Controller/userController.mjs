import UserModel from '../Model/userModel.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

            await user.update({
                accessToken: encrypt(token),
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
}

export default new UserController();
