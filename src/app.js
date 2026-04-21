const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const app = express();

app.use(express.json());

const authCustomerRoutes = require('./routes/auth.customer.routes');
const authCompanyRoutes = require('./routes/auth.company.routes');

app.use('/api/auth', authCustomerRoutes);
app.use('/api/company-auth', authCompanyRoutes);

app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
