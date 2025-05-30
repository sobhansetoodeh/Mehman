const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users'); // اضافه کن

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/guesthouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes); // این خط رو اضافه کن

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});