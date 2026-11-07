const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./config/db');
const app = require('./app');
require('./models/associations');

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conectado a PostgreSQL con Sequelize');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('Error conectando a la base de datos:', err));

sequelize.sync({ force: false }).then(() => {
  console.log('Base de datos sincronizada');
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});