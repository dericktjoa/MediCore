const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

// Parse requests and allow the frontend to call the API.
app.use(cors()); 
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Application API routes.
app.use('/api/signup', require('./routes/signup'));
app.use('/api/login', require('./routes/login'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));

// Serve the production frontend from the same container as the API.
if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Welcome to the MediCore API');
  });
}

async function startServer() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  return app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Could not start server', err);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
