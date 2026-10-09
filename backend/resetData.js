const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const DoctorSchedule = require('./models/DoctorSchedule');
const Prescription = require('./models/Prescription');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Doctor = require('./models/Doctor');

async function resetData() {
  if (process.env.RESET_CONFIRM !== 'YES') {
    throw new Error('Set RESET_CONFIRM=YES to confirm deleting data.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const collections = [Appointment, DoctorSchedule, Prescription, User];

  if (process.env.RESET_ALL === 'YES') {
    collections.push(Admin, Doctor);
  }

  for (const collection of collections) {
    const result = await collection.deleteMany({});
    console.log(`${collection.modelName}: deleted ${result.deletedCount} document(s)`);
  }
}

resetData()
  .catch((error) => {
    console.error('Error resetting data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
