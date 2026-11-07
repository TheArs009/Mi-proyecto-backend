const dotenv = require('dotenv'); // importa las dependencias del archivo dotenv

dotenv.config();          // Carga las variables definidas del archivo .env

module.exports = {       //exporta  la configuracion que definimos en el env
PORT: process.env.PORT,
DB_NAME: process.env.DB_NAME,
DB_USER: process.env.DB_USER,
DB_PASSWORD: process.env.DB_PASSWORD,
DB_HOST: process.env.DB_HOST,
DB_PORT: process.env.DB_PORT,

};