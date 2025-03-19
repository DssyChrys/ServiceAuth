import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.database_name,
    process.env.database_user,
    process.env.database_password,
    {
        host: process.env.database_host,
        dialect: 'postgres',
        logging: false, 
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion à PostgreSQL réussie !');
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error);
    }
})();

export default sequelize;
