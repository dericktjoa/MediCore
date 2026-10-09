const express = require('express');
const Patient = require('../models/User');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const DoctorSchedule = require('../models/DoctorSchedule');

const router = express.Router();

const slotToMinutes = (slot) => {
  const [time, period] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
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

router.get('/profile', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-password');
    if (!patient) {
      return res.status(404).send({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).send({ error: 'Patient not found' });
    }
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.email = email;
    await patient.save();
    const patientWithoutPassword = patient.toObject();
    delete patientWithoutPassword.password;
    res.json(patientWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/book-appointment', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const schedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!schedule || !schedule.slots.includes(time)) {
      return res.status(400).send({ error: 'Doctor is not available at the selected date and time' });
    }
    const existingAppointment = await Appointment.findOne({ doctorId, date, time, status: 'scheduled' });
    if (existingAppointment) {
      return res.status(409).send({ error: 'This appointment slot has already been booked' });
    }
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/available-slots', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const schedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!schedule) return res.json([]);
    const bookedAppointments = await Appointment.find({ doctorId, date, status: 'scheduled' });
    const bookedTimes = bookedAppointments.map(app => app.time);
    const availableSlots = schedule.slots
      .filter(slot => !bookedTimes.includes(slot))
      .sort((a, b) => slotToMinutes(a) - slotToMinutes(b));
    res.json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/appointments', auth, async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({
      patientId,
      status: 'scheduled'
    })
      .populate('doctorId', 'firstName lastName')
      .sort({ time: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/appointments/:id/restore', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id, status: 'cancelled' },
      { status: 'scheduled' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send({ error: 'Cancelled appointment not found' });
    }
    res.json({ message: 'Appointment restored successfully', appointment });
  } catch (error) {
    console.error('Error restoring appointment:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.delete('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id, status: 'scheduled' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).send({ error: 'Active appointment not found' });
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/care-team', auth, async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({ patientId }).distinct('doctorId');
    const careTeam = await Doctor.find({ _id: { $in: appointments } }).select('firstName lastName specialty');
    res.json(careTeam);
  } catch (error) {
    console.error('Error fetching care team:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/prescriptions', auth, async (req, res) => {
  try {
    const patientId = req.user.id;
    const prescriptions = await Prescription.find({ patientId }).populate('doctorId', 'firstName lastName');
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
