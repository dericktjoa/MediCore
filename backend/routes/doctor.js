const express = require('express');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const DoctorSchedule = require('../models/DoctorSchedule');

const router = express.Router();
const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
  '10:00 PM', '11:00 PM'
];

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

router.get('/profile', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).send({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, specialty, licenseNumber, phoneNumber } = req.body;
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).send({ error: 'Doctor not found' });
    }
    doctor.firstName = firstName;
    doctor.lastName = lastName;
    doctor.email = email;
    doctor.specialty = specialty;
    doctor.licenseNumber = licenseNumber;
    doctor.phoneNumber = phoneNumber;
    await doctor.save();
    const doctorWithoutPassword = doctor.toObject();
    delete doctorWithoutPassword.password;
    res.json(doctorWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const doctors = await Doctor.find().select(
      'firstName lastName specialty licenseNumber phoneNumber email'
    );
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/:id/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).send({ error: 'Date is required' });
    const schedule = await DoctorSchedule.findOne({ doctorId: req.params.id, date });
    res.json({ date, slots: schedule ? schedule.slots : [] });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/schedule', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send({ error: 'Doctor access required' });
  try {
    const { date } = req.query;
    if (!date) return res.status(400).send({ error: 'Date is required' });
    const schedule = await DoctorSchedule.findOne({ doctorId: req.user.id, date });
    res.json({ date, slots: schedule ? schedule.slots : [], availableSlots: TIME_SLOTS });
  } catch (error) {
    console.error('Error fetching own schedule:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/schedule', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send({ error: 'Doctor access required' });
  try {
    const { date, slots } = req.body;
    if (!date || !Array.isArray(slots) || slots.some(slot => !TIME_SLOTS.includes(slot))) {
      return res.status(400).send({ error: 'A valid date and time slots are required' });
    }
    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId: req.user.id, date },
      { doctorId: req.user.id, date, slots: [...new Set(slots)] },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(schedule);
  } catch (error) {
    console.error('Error saving doctor schedule:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.delete('/schedule', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send({ error: 'Doctor access required' });
  try {
    const { date } = req.body;
    if (!date) return res.status(400).send({ error: 'Date is required' });
    const schedule = await DoctorSchedule.findOneAndDelete({ doctorId: req.user.id, date });
    if (!schedule) return res.status(404).send({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor schedule:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/patients-with-appointments', auth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId }).sort({ date: 1 });
    const patientIds = [...new Set(appointments.map(app => app.patientId.toString()))];

    const patients = await User.find({ _id: { $in: patientIds }, role: 'patient' });

    const patientsWithAppointments = patients.map(patient => {
      const patientAppointments = appointments.filter(app => app.patientId.toString() === patient._id.toString());
      const lastVisit = patientAppointments.find(app => new Date(app.date) < new Date());
      const nextAppointment = patientAppointments.find(app => new Date(app.date) >= new Date());

      return {
        ...patient.toObject(),
        lastVisit: lastVisit ? lastVisit.date : null,
        nextAppointment: nextAppointment ? nextAppointment.date : null
      };
    });

    res.json(patientsWithAppointments);
  } catch (error) {
    console.error('Error fetching patients with appointments:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/available-slots', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.user.id;
    const schedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!schedule) return res.json([]);
    const bookedAppointments = await Appointment.find({ doctorId, date, status: 'scheduled' });
    const bookedTimes = bookedAppointments.map(app => app.time);
    const availableSlots = schedule.slots.filter(slot => !bookedTimes.includes(slot));
    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/schedule-appointment', auth, async (req, res) => {
  try {
    const { patientId, date, time, reason } = req.body;
    const doctorId = req.user.id; // Assuming the doctor is making the request
    const schedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!schedule || !schedule.slots.includes(time)) {
      return res.status(400).send({ error: 'Doctor is not available at the selected date and time' });
    }
    const existingAppointment = await Appointment.findOne({ doctorId, date, time, status: 'scheduled' });
    if (existingAppointment) {
      return res.status(409).send({ error: 'This appointment slot has already been booked' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      reason
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/prescribe-medication', auth, async (req, res) => {
  try {
    const { patientId, medication, dosage, frequency } = req.body;
    const doctorId = req.user.id; // Assuming the doctor is making the request


    const prescription = new Prescription({
      patientId,
      doctorId,
      medication,
      dosage,
      frequency
    });

    const savedPrescription = await prescription.save();

    res.status(201).json({ message: 'Medication prescribed successfully', prescription: savedPrescription });
  } catch (error) {
    // console.error('Error prescribing medication:', error);
    // res.status(500).send({ error: 'Server error' });
  }
});

// Get all prescriptions
router.get('/prescriptions', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.id });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Update a prescription
router.put('/prescriptions/:id', auth, async (req, res) => {
  try {
    const { medication, dosage, frequency } = req.body;
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { medication, dosage, frequency },
      { new: true }
    );
    if (!prescription) {
      return res.status(404).send({ error: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Delete a prescription
router.delete('/prescriptions/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, doctorId: req.user.id });
    if (!prescription) {
      return res.status(404).send({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    // console.error('Error deleting prescription:', error);
    // res.status(500).send({ error: 'Server error', details: error.message });
  }
});

// Get all prescriptions by patient ID
router.get('/prescriptions/:patientId', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      doctorId: req.user.id,
      patientId: req.params.patientId
    });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/appointments', auth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);
    
    const appointments = await Appointment.find({
      doctorId,
      status: 'scheduled',
      date: { $gte: monday, $lt: sunday }
    })
      .populate('patientId', 'firstName lastName')
      .sort({ time: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/appointments/:id/complete', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send({ error: 'Doctor access required' });
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id, status: 'scheduled' },
      { status: 'completed' },
      { new: true }
    );
    if (!appointment) return res.status(404).send({ error: 'Active appointment not found' });
    res.json({ message: 'Appointment completed successfully', appointment });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/patients/:id/discharge', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send({ error: 'Doctor access required' });
  try {
    const hasRelationship = await Appointment.exists({
      doctorId: req.user.id,
      patientId: req.params.id
    });
    if (!hasRelationship) return res.status(403).send({ error: 'Patient is not under your care' });
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'patient' },
      { admissionStatus: 'discharged' },
      { new: true }
    ).select('firstName lastName admissionStatus');
    if (!patient) return res.status(404).send({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;