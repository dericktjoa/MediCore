const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

// Default doctor accounts for a fresh local database.
const doctors = [
  ['John', 'Doe', 'doctor1@test.com', 'Cardiology', 'DOC001', '081234567890'],
  ['Jane', 'Smith', 'doctor2@test.com', 'Pediatrics', 'DOC002', '081234567891'],
  ['Michael', 'Chen', 'doctor3@test.com', 'Neurology', 'DOC003', '081234567892'],
  ['Emily', 'Carter', 'doctor4@test.com', 'Orthopedics', 'DOC004', '081234567893'],
  ['David', 'Wilson', 'doctor5@test.com', 'Dermatology', 'DOC005', '081234567894'],
  ['Sarah', 'Williams', 'doctor6@test.com', 'Obstetrics & Gynecology', 'DOC006', '081234567895'],
  ['Robert', 'Anderson', 'doctor7@test.com', 'General Practice', 'DOC007', '081234567896'],
  ['Olivia', 'Martinez', 'doctor8@test.com', 'Internal Medicine', 'DOC008', '081234567897']
];

async function createDoctors() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured in backend/.env');
    await mongoose.connect(process.env.MONGO_URI);

    for (const [firstName, lastName, email, specialty, licenseNumber, phoneNumber] of doctors) {
      const existingDoctor = await Doctor.findOne({ email });
      if (!existingDoctor) {
        await Doctor.create({
          firstName,
          lastName,
          email,
          specialty,
          licenseNumber,
          phoneNumber,
          password: 'Doctor123!'
        });
      }
    }
    console.log('Doctor accounts are ready. Default password: Doctor123!');
  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createDoctors();
