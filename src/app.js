const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Configurar o middleware cors
app.use(cors());

app.use('/api/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
