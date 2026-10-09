const express = require('express');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const router = express.Router();
const HEALTHCARE_STAFF_COUNT = 20;
const BED_CAPACITY = 100;
const admittedPatientFilter = {
  role: 'patient',
  $or: [
    { admissionStatus: 'admitted' },
    { admissionStatus: { $exists: false } }
  ]
};

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
};

router.get('/healthcare-staff-count', auth, (req, res) => {
  res.json({ healthcareStaffCount: HEALTHCARE_STAFF_COUNT });
});

router.put('/patient-status/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Admin access required' });
  }
  const { admissionStatus } = req.body;
  if (!['admitted', 'discharged'].includes(admissionStatus)) {
    return res.status(400).send({ error: 'Invalid admission status' });
  }
  try {
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'patient' },
      { admissionStatus },
      { new: true }
    ).select('firstName lastName admissionStatus');
    if (!patient) return res.status(404).send({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/add-doctor', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Not authorized to add doctors' });
  }

  const { firstName, lastName, email, specialty, licenseNumber, phoneNumber, password } = req.body;

  try {
    const doctor = new Doctor({ firstName, lastName, email, specialty, licenseNumber, phoneNumber, password });
    await doctor.save();
    res.status(201).send({ message: 'Doctor added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'Email or license number already exists' });
    }
    res.status(400).send({ error: error.message });
  }
});

router.post('/add-admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Not authorized to add admins' });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    const admin = new Admin({ firstName, lastName, email, password });
    await admin.save();
    res.status(201).send({ message: 'Admin added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: 'Email already exists' });
    }
    res.status(400).send({ error: error.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).send({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).send({ error: 'Admin not found' });
    }
    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.email = email;
    await admin.save();
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;
    res.json({ message: 'Profile updated successfully', admin: adminWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/total-doctors', auth, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    res.json({ totalDoctors });
  } catch (error) {
    console.error('Error fetching total doctors:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/total-patients', auth, async (req, res) => {
  try {
    const totalPatients = await User.countDocuments(admittedPatientFilter);
    res.json({ totalPatients, bedCapacity: BED_CAPACITY });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/doctor-overview', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find().select('firstName lastName specialty');
    const doctorOverview = await Promise.all(doctors.map(async (doctor) => {
      const patientIds = await Appointment.distinct('patientId', {
        doctorId: doctor._id,
        status: { $ne: 'cancelled' }
      });
      const admittedPatients = await User.countDocuments({
        _id: { $in: patientIds },
        ...admittedPatientFilter
      });
      return {
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialty,
        patients: admittedPatients
      };
    }));
    res.json(doctorOverview);
  } catch (error) {
    console.error('Error fetching doctor overview:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/patient-overview', auth, async (req, res) => {
  try {
    const patientOverview = await User.find(admittedPatientFilter).select('firstName lastName');
    res.json(patientOverview);
  } catch (error) {
    console.error('Error fetching patient overview:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Route: GET /api/admin/patient-doctors
router.get('/patient-doctors', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find();

    const result = await Promise.all(doctors.map(async (doctor) => {
      const appointments = await Appointment.find({ doctorId: doctor._id }).populate('patientId', 'firstName lastName email');
      const patients = appointments.map((appt) => ({
        name: `${appt.patientId.firstName} ${appt.patientId.lastName}`,
        email: appt.patientId.email,
      }));

      return {
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialty,
        patients,
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching patient-doctor relationships:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
