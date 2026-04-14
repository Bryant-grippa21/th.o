require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// ✅ Actualizado
const authCustomerRoutes = require('./routes/auth.customer.routes');

app.use('/api/auth', authCustomerRoutes);

app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
