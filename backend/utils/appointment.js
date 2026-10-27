const normalizeAppointmentReason = (reason) => {
  if (typeof reason !== 'string' || !reason.trim()) return '-';
  return reason.trim();
};

module.exports = { normalizeAppointmentReason };
