const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const app = express();
const publicDir = path.join(__dirname, '../public');
const publicIndexPath = path.join(publicDir, 'index.html');

app.disable('x-powered-by');
app.use(express.json());

const authCustomerRoutes = require('./routes/auth.customer.routes');
const authCompanyRoutes = require('./routes/auth.company.routes');
const exchangeRoutes = require('./routes/exchange.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const productRoutes = require('./routes/products.routes');
const productImportRoutes = require('./routes/product.import.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const b2bQuoteRoutes = require('./routes/b2b.quote.routes');

app.get('/', (_req, res) => {
  if (fs.existsSync(publicIndexPath)) {
    return res.sendFile(publicIndexPath);
  }

  res.status(200).json({
    name: 'tuherramientaonline.back',
    status: 'ok',
    docs: {
      customer_auth: '/api/auth',
      company_auth: '/api/company-auth',
      exchange: '/api/exchange-rate',
      purchases: '/api/purchases',
      products: '/api/products',
      product_imports: '/api/products/import',
      notifications: '/api/notifications',
      b2b_quotes: '/api/b2b-quotes'
    }
  });
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).end();
});

app.use('/api/auth', authCustomerRoutes);
app.use('/api/company-auth', authCompanyRoutes);
app.use('/api/exchange-rate', exchangeRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/import', productImportRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/b2b-quotes', b2bQuoteRoutes);

app.use(express.static(publicDir));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
