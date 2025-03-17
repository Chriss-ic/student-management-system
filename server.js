const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');

const app = express();

// Middleware
app.use(cors()); // Allows frontend to connect
app.use(express.json()); // Parses JSON requests

// Routes
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});