const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDoctorSearchFilter } = require('../routes/doctor');

test('doctor search matches name and specialty fields', () => {
  assert.deepEqual(buildDoctorSearchFilter(' cardiology '), {
    $or: [
      { firstName: /cardiology/i },
      { lastName: /cardiology/i },
      { specialty: /cardiology/i }
    ]
  });
});

test('empty doctor search returns all doctors', () => {
  assert.deepEqual(buildDoctorSearchFilter(''), {});
});
