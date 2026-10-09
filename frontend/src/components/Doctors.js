import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, User, Users, ChevronDown, Home, UserCircle, Calendar as CalendarIcon, Hospital, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      variant === 'primary'
        ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        : variant === 'outline'
        ? 'text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
        : 'text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, icon: Icon }) => (
  <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
    {children}
    {Icon && <Icon className="h-5 w-5 text-blue-600 ml-2" />}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
);

const CardContent = ({ children }) => (
  <div className="px-4 py-5 sm:p-6">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="px-4 py-4 sm:px-6">{children}</div>
);

const Input = ({ ...props }) => (
  <input
    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-1 h-6"
    {...props}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Select = ({ children, ...props }) => (
  <select
    className="mt-1 block w-full pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    {...props}
  >
    {children}
  </select>
);

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
  '10:00 PM', '11:00 PM'
];

const getWeekDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mondayOffset = (today.getDay() + 6) % 7;
  today.setDate(today.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date.toISOString().split('T')[0];
  });
};

const formatDay = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
  weekday: 'long'
});

export default function DoctorDashboard() {
  const [showAppointments, setShowAppointments] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [editedInfo, setEditedInfo] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    patientId: '',
    date: '',
    time: '',
    reason: '',
    prescriptionId: '',
    medication: '',
    dosage: '',
    frequency: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const navigate = useNavigate();
  const weekDates = getWeekDates();

  useEffect(() => {
    fetchDoctorProfile();
    fetchPatientsWithAppointments();
    fetchAppointments();
    // These loaders are intentionally run once when the dashboard mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appointmentData.patientId) {
      fetchExistingPrescriptions(appointmentData.patientId);
    }
  }, [appointmentData.patientId]);

  useEffect(() => {
    if (activeTab === 'Schedule' || activeTab === 'Patient Management') {
      fetchWeeklySchedule().catch((error) => {
        console.error('Error fetching weekly schedule:', error);
      });
    }
    // Schedule data is refreshed when the selected tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchExistingPrescriptions = async (patientId) => {
    if (!patientId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/prescriptions/${patientId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
      if (response.ok) {
        const prescriptions = await response.json();
        setExistingPrescriptions(prescriptions);
      } else {
        console.error('Failed to fetch existing prescriptions');
        setExistingPrescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching existing prescriptions:', error);
      setExistingPrescriptions([]);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDoctorInfo(data);
        setEditedInfo(data);
      } else {
        console.error('Failed to fetch doctor profile');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchPatientsWithAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/patients-with-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Failed to fetch patients with appointments');
      }
    } catch (error) {
      console.error('Error fetching patients with appointments:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const sortedAppointments = data.sort((a, b) =>
          new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
        );
        setAppointments(sortedAppointments);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const completeAppointment = async (appointmentId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/appointments/${appointmentId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || 'Appointment gagal diselesaikan.');
      return;
    }
    setAppointments((current) => current.filter((item) => item._id !== appointmentId));
  };

  const dischargePatient = async (patientId) => {
    if (!window.confirm('Tandai pasien sebagai sembuh dan keluar rumah sakit?')) return;
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/patients/${patientId}/discharge`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || 'Status pasien gagal diperbarui.');
      return;
    }
    setPatients((current) => current.filter((patient) => patient._id !== patientId));
  };

  const fetchSchedule = async (date) => {
    setScheduleDate(date);
    if (!date) return;
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/schedule?date=${date}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      setScheduleSlots(data.slots);
      setWeeklySchedule((current) => ({ ...current, [date]: data.slots }));
    }
  };

  const fetchWeeklySchedule = async () => {
    const token = localStorage.getItem('token');
    const entries = await Promise.all(weekDates.map(async (date) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/schedule?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch weekly schedule');
      const data = await response.json();
      return [date, data.slots];
    }));
    const schedule = Object.fromEntries(entries);
    setWeeklySchedule(schedule);
    const selectedDate = scheduleDate || weekDates[0];
    setScheduleDate(selectedDate);
    setScheduleSlots(schedule[selectedDate] || []);
  };

  const saveSchedule = async () => {
    if (!scheduleDate) {
      alert('Pilih tanggal terlebih dahulu.');
      return;
    }
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ date: scheduleDate, slots: scheduleSlots })
    });
    if (response.ok) {
      alert('Jadwal berhasil disimpan.');
      setWeeklySchedule((current) => ({ ...current, [scheduleDate]: scheduleSlots }));
    } else {
      const data = await response.json();
      alert(data.error || 'Jadwal gagal disimpan.');
    }
  };

  const deleteSchedule = async () => {
    if (!scheduleDate || !(weeklySchedule[scheduleDate] || []).length) return;
    if (!window.confirm(`Hapus jadwal hari ${formatDay(scheduleDate)}?`)) return;
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/schedule`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ date: scheduleDate })
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || 'Jadwal gagal dihapus.');
      return;
    }
    setScheduleSlots([]);
    setWeeklySchedule((current) => ({ ...current, [scheduleDate]: [] }));
    alert('Jadwal berhasil dihapus.');
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader icon={Calendar}>
            <CardTitle className="text-sm font-medium">This Week&apos;s Active Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.length}
            </div>
            {appointments.length > 0 ? (
              <p className="text-xs text-gray-500">
                Next: {appointments[0].patientId.firstName} {appointments[0].patientId.lastName} at {appointments[0].time}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                No active appointments this week
              </p>
            )}
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => setShowAppointments(!showAppointments)}
            >
              {showAppointments ? "Hide" : "View"} This Week&apos;s Appointments
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAppointments ? "rotate-180" : ""}`} />
            </Button>
          </CardFooter>
          {showAppointments && (
            <div className="px-4 pb-4">
              {appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-t">
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.patientId.firstName} {appointment.patientId.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(appointment.date).toLocaleDateString()} {appointment.time}</p>
                      <button
                        type="button"
                        onClick={() => completeAppointment(appointment._id)}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active appointments this week
                </p>
              )}
            </div>
          )}
        </Card>
        <Card>
          <CardHeader icon={Users}>
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-gray-500">Total patients under care</p>
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => setShowPatients(!showPatients)}
            >
              {showPatients ? "Hide" : "View All"} Patients
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showPatients ? "rotate-180" : ""}`} />
            </Button>
          </CardFooter>
          {showPatients && (
            <div className="px-4 pb-4">
              {patients.map((patient, index) => (
                <div key={index} className="py-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <button
                      type="button"
                      onClick={() => dischargePatient(patient._id)}
                      className="text-xs text-green-700 hover:underline"
                    >
                      Mark recovered
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-GB') : 'N/A'} | Next: {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{appointments.length} active appointment(s) this week</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>{patients.length} patient(s) currently under care</span>
              </li>
              <li className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Review patient appointment requests and records</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Manage weekly availability in the Schedule tab</span>
              </li>
              <li className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <span>Review today&apos;s scheduled appointments</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Update prescriptions after patient consultations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderSchedule = () => (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader icon={Calendar}>
          <CardTitle>Doctor Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-sm font-medium text-gray-700">
            Date
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
              {weekDates.map((date) => {
                const isAvailable = (weeklySchedule[date] || []).length > 0;
                return (
                  <button
                    type="button"
                    key={date}
                    onClick={() => fetchSchedule(date)}
                    className={`p-3 rounded-md text-sm font-medium ${
                      isAvailable ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                    } ${scheduleDate === date ? 'ring-2 ring-blue-700' : ''}`}
                  >
                    {formatDay(date)}
                  </button>
                );
              })}
            </div>
          </label>
          <p className="text-sm text-gray-600 mt-4 mb-2">
            Available appointment slots for {scheduleDate ? formatDay(scheduleDate) : 'selected day'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => (
              <label key={slot} className="flex items-center gap-2 border rounded-md p-2">
                <input
                  type="checkbox"
                  checked={scheduleSlots.includes(slot)}
                  onChange={() => setScheduleSlots((current) =>
                    current.includes(slot)
                      ? current.filter((item) => item !== slot)
                      : [...current, slot]
                  )}
                />
                {slot}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <Button onClick={saveSchedule}>Update Schedule</Button>
            <Button
              type="button"
              variant="outline"
              onClick={deleteSchedule}
              disabled={!scheduleDate || !(weeklySchedule[scheduleDate] || []).length}
            >
              Delete Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );

  const renderProfile = () => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditedInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editedInfo)
        });
        if (response.ok) {
          const updatedProfile = await response.json();
          setDoctorInfo(updatedProfile);
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          alert(`Failed to update doctor profile: ${errorData.error}`);
        }
      } catch (error) {
        alert('Error updating doctor profile. Please try again.');
      }
    };

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={isEditing ? editedInfo.firstName : doctorInfo?.firstName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={isEditing ? editedInfo.lastName : doctorInfo?.lastName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={isEditing ? editedInfo.email : doctorInfo?.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                name="specialty"
                value={isEditing ? editedInfo.specialty : doctorInfo?.specialty}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={isEditing ? editedInfo.licenseNumber : doctorInfo?.licenseNumber}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={isEditing ? editedInfo.phoneNumber : doctorInfo?.phoneNumber}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="mr-2">Save</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="ml-auto">Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderPatientManagement = () => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setAppointmentData(prev => ({ ...prev, [name]: value }));

      if (name === 'action') {
        setSelectedAction(value);
      }

      if (name === 'patientId') {
        fetchExistingPrescriptions(value);
      }

      if (name === 'date' || name === 'patientId') {
        const date = name === 'date' ? value : appointmentData.date;
        fetchAvailableSlots(date);
      }
    };

    const fetchAvailableSlots = async (date) => {
      if (!date) {
        setAvailableSlots([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/available-slots?date=${date}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

        if (response.ok) {
          const slots = await response.json();
          setAvailableSlots(slots);
        } else {
          console.error('Failed to fetch available slots');
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
      }
    };

    const handleEditPrescription = (prescription) => {
      setAppointmentData({
        ...appointmentData,
        prescriptionId: prescription._id,
        medication: prescription.medication || '',
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || ''
      });
      setSelectedAction('prescribe-medication');
    };

    const handleDeletePrescription = async (prescriptionId) => {
      if (window.confirm('Are you sure you want to delete this prescription?')) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/prescriptions/${prescriptionId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
          if (response.ok) {
            alert('Prescription deleted successfully');
            fetchExistingPrescriptions(appointmentData.patientId);
          } else {
            const errorData = await response.json();
            alert(`Failed to delete prescription: ${errorData.error}`);
            console.error('Error details:', errorData.details);
          }
        } catch (error) {
          alert('Error deleting prescription. Please try again.');
          console.error('Error deleting prescription:', error);
        }
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (selectedAction === 'prescribe-medication') {
        try {
          const token = localStorage.getItem('token');
          const baseUrl = process.env.REACT_APP_API_URL;

const url = appointmentData.prescriptionId
  ? `${baseUrl}/api/doctor/prescriptions/${appointmentData.prescriptionId}`
  : `${baseUrl}/api/doctor/prescribe-medication`;

          const method = appointmentData.prescriptionId ? 'PUT' : 'POST';
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              patientId: appointmentData.patientId,
              medication: appointmentData.medication,
              dosage: appointmentData.dosage,
              frequency: appointmentData.frequency
            })
          });
          if (response.ok) {
            await response.json();
            alert(appointmentData.prescriptionId ? 'Medication updated successfully' : 'Medication prescribed successfully');
            setAppointmentData({
              ...appointmentData,
              prescriptionId: '',
              medication: '',
              dosage: '',
              frequency: ''
            });
            fetchExistingPrescriptions(appointmentData.patientId);
            setSelectedAction('');
          } else {
            const errorData = await response.json();
            alert(`Failed to ${appointmentData.prescriptionId ? 'update' : 'prescribe'} medication: ${errorData.error}`);
          }
        } catch (error) {
          alert(`Error ${appointmentData.prescriptionId ? 'updating' : 'prescribing'} medication. Please try again.`);
        }
      } else if (selectedAction === 'schedule-appointment') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctor/schedule-appointment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              patientId: appointmentData.patientId,
              date: appointmentData.date,
              time: appointmentData.time,
              reason: appointmentData.reason
            })
          });
          if (response.ok) {
            alert('Appointment scheduled successfully');
            setAppointmentData({
              patientId: '',
              date: '',
              time: '',
              reason: '',
              prescriptionId: '',
              medication: '',
              dosage: '',
              frequency: ''
            });
            setSelectedAction('');
          } else {
            const errorData = await response.json();
            alert(`Failed to schedule appointment: ${errorData.error}`);
          }
        } catch (error) {
          alert('Error scheduling appointment. Please try again.');
        }
      }
    };

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Select Patient</Label>
              <Select id="patient" name="patientId" value={appointmentData.patientId} onChange={handleInputChange}>
                <option value="">Choose a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select id="action" name="action" value={selectedAction} onChange={handleInputChange}>
                <option value="">Choose an action</option>
                <option value="schedule-appointment">Schedule Appointment</option>
                <option value="prescribe-medication">Prescribe Medication</option>
              </Select>
            </div>
            {selectedAction === 'schedule-appointment' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-1">
                    {weekDates.map((date) => {
                      const slots = weeklySchedule[date] || [];
                      return (
                        <button
                          type="button"
                          key={date}
                          onClick={() => {
                            setAppointmentData((current) => ({ ...current, date, time: '' }));
                            fetchAvailableSlots(date);
                          }}
                          className={`p-2 rounded-md text-xs font-medium ${
                            slots.length ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                          } ${appointmentData.date === date ? 'ring-2 ring-blue-700' : ''}`}
                        >
                          {formatDay(date)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select id="time" name="time" value={appointmentData.time} onChange={handleInputChange} disabled={availableSlots.length === 0}>
                    <option value="">Choose a time slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input id="reason" name="reason" value={appointmentData.reason} onChange={handleInputChange} placeholder="Brief description of your concern" />
                </div>
              </>
            )}
            {selectedAction === 'prescribe-medication' && (
              <>
                {existingPrescriptions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label>Existing Prescriptions</Label>
                    {existingPrescriptions.map((prescription) => (
                      <div key={prescription._id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span>{prescription.medication} - {prescription.dosage} - {prescription.frequency}</span>
                        <div>
                          <Button type="button" onClick={() => handleEditPrescription(prescription)} variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button onClick={() => handleDeletePrescription(prescription._id)} variant="outline" size="sm">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input id="medication" name="medication" value={appointmentData.medication || ''} onChange={handleInputChange} placeholder="Medication name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" name="dosage" value={appointmentData.dosage || ''} onChange={handleInputChange} placeholder="Dosage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input id="frequency" name="frequency" value={appointmentData.frequency || ''} onChange={handleInputChange} placeholder="Frequency" />
                </div>
              </>
            )}
            <Button type="submit" className="ml-auto">
              {selectedAction === 'prescribe-medication' ? (appointmentData.prescriptionId ? 'Update Prescription' : 'Prescribe Medication') : 'Schedule Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-blue-600">
      <header className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Hospital className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">MediCore</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>Sign Out</Button>
      </header>
      <nav className="bg-blue-700 text-white p-4">
        <ul className="flex space-x-4 justify-center">
          <li>
            <Button
              variant={activeTab === 'Dashboard' ? "outline" : "ghost"}
              className={`hover:bg-white hover:text-blue-600 ${activeTab === 'Dashboard' ? 'bg-white text-blue-600' : 'text-white'}`}
              onClick={() => setActiveTab('Dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              variant={activeTab === 'Schedule' ? "outline" : "ghost"}
              className={`hover:bg-white hover:text-blue-600 ${activeTab === 'Schedule' ? 'bg-white text-blue-600' : 'text-white'}`}
              onClick={() => setActiveTab('Schedule')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </li>
          <li>
            <Button
              variant={activeTab === 'Profile' ? "outline" : "ghost"}
              className={`hover:bg-white hover:text-blue-600 ${activeTab === 'Profile' ? 'bg-white text-blue-600' : 'text-white'}`}
              onClick={() => setActiveTab('Profile')}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </li>
          <li>
            <Button
              variant={activeTab === 'Patient Management' ? "outline" : "ghost"}
              className={`hover:bg-white hover:text-blue-600 ${activeTab === 'Patient Management' ? 'bg-white text-blue-600' : 'text-white'}`}
              onClick={() => setActiveTab('Patient Management')}
            >
              <Users className="w-4 h-4 mr-2" />
              Patient Management
            </Button>
          </li>
        </ul>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome, Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}</h1>
        {activeTab === 'Dashboard' && renderDashboard()}
        {activeTab === 'Profile' && renderProfile()}
        {activeTab === 'Schedule' && renderSchedule()}
        {activeTab === 'Patient Management' && renderPatientManagement()}
      </main>
    </div>
  );
}