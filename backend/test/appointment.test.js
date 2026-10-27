const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAppointmentReason } = require('../utils/appointment');

test('empty appointment reason is stored as a dash', () => {
  assert.equal(normalizeAppointmentReason(''), '-');
  assert.equal(normalizeAppointmentReason('   '), '-');
  assert.equal(normalizeAppointmentReason(undefined), '-');
});

test('appointment reason keeps meaningful text after trimming', () => {
  assert.equal(normalizeAppointmentReason('  Routine check-up  '), 'Routine check-up');
});
