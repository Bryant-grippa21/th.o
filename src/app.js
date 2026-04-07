// app.js
const express = require('express');
const app = express();
const path = require('path');


app.use(express.json());

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
  
app.use(express.static(path.join(__dirname, '../public')));

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
