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

test('whitespace-only doctor search returns all doctors', () => {
  assert.deepEqual(buildDoctorSearchFilter('   '), {});
});

test('doctor search is case-insensitive', () => {
  const filter = buildDoctorSearchFilter('CARDIOLOGY');

  assert.equal(filter.$or[0].firstName.flags, 'i');
  assert.equal(filter.$or[1].lastName.flags, 'i');
  assert.equal(filter.$or[2].specialty.flags, 'i');
  assert.equal(filter.$or[2].specialty.source, 'CARDIOLOGY');
});

test('doctor search treats special characters as literal text', () => {
  const filter = buildDoctorSearchFilter('Dr. (A)');

  assert.equal(filter.$or[0].firstName.source, 'Dr\\. \\(A\\)');
  assert.equal(filter.$or[1].lastName.source, 'Dr\\. \\(A\\)');
  assert.equal(filter.$or[2].specialty.source, 'Dr\\. \\(A\\)');
});
