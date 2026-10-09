const mongoose = require('mongoose');

// Stores one doctor's available slots for a specific date.
const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  slots: { type: [String], default: [] }
}, { timestamps: true });

doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
