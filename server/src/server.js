require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { recalculateAllPriorities } = require('./services/priorityEngine');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Recalculate complaint priorities every hour
  setInterval(recalculateAllPriorities, 60 * 60 * 1000);
  recalculateAllPriorities();
};

startServer();