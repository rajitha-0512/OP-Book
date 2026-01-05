// Mock Data
const mockHospitals = [
    {
        id: 1,
        name: "City General Hospital",
        location: "Downtown, Main Street",
        rating: 4.8,
        helpline: "9876543210",
        doctors: [
            {
                id: 101,
                name: "Dr. Sarah Johnson",
                degree: "MBBS, MD",
                specialization: "Cardiology",
                fees: 800,
                receptionistContact: "9876543211"
            },
            {
                id: 102,
                name: "Dr. Michael Chen",
                degree: "MBBS, MS",
                specialization: "Orthopedics",
                fees: 700,
                receptionistContact: "9876543212"
            }
        ]
    }
];

// State Management
let currentHospital = null;
let currentDoctor = null;
let currentUser = null;
let bookingData = {};
let navHistory = ['home-page'];

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    // Show app after landing animation
    setTimeout(() => {
        document.getElementById('app').style.display = 'block';
    }, 3000);

    // Event Listeners
    setupEventListeners();

    // Load hospitals
    displayHospitals(mockHospitals);

    // Check if user is logged in
    checkUserSession();

    // Initialize Visibility
    updateHospitalOptionsVisibility();
    updatePatientOptionsVisibility();
});

function setupEventListeners() {
    // Home page buttons
    document.getElementById('book-now-btn')?.addEventListener('click', () => {
        navigateTo('search-page');
    });

    document.getElementById('register-btn')?.addEventListener('click', () => {
        navigateTo('register-type-page');
    });

    // Registration type selection
    document.getElementById('register-patient-btn')?.addEventListener('click', () => {
        updatePatientOptionsVisibility();
        navigateTo('patient-options-page');
    });

    document.getElementById('register-hospital-btn')?.addEventListener('click', () => {
        updateHospitalOptionsVisibility();
        navigateTo('hospital-options-page');
    });

    // Patient Options
    document.getElementById('new-patient-btn')?.addEventListener('click', () => {
        navigateTo('patient-register-page');
    });

    document.getElementById('view-patient-profile-btn')?.addEventListener('click', () => {
        if (currentUser && currentUser.type === 'patient') {
            loadPatientProfile();
            navigateTo('patient-profile-page');
        } else {
            navigateTo('patient-login-page');
        }
    });

    // Hospital Options
    document.getElementById('new-hospital-btn')?.addEventListener('click', () => {
        navigateTo('hospital-register-page');
    });

    document.getElementById('view-hospital-btn')?.addEventListener('click', () => {
        navigateTo('hospital-login-page');
    });

    // Search functionality
    document.getElementById('hospital-search')?.addEventListener('input', handleSearch);

    // Forms
    document.getElementById('booking-form')?.addEventListener('submit', handleBookingForm);
    document.getElementById('patient-register-form')?.addEventListener('submit', handlePatientRegistration);
    document.getElementById('patient-login-form')?.addEventListener('submit', handlePatientLogin);
    document.getElementById('profile-edit-form')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('hospital-register-form')?.addEventListener('submit', handleHospitalRegistration);
    document.getElementById('hospital-login-form')?.addEventListener('submit', handleHospitalLogin);
    document.getElementById('add-doctor-form')?.addEventListener('submit', handleAddDoctor);
    document.getElementById('notification-form')?.addEventListener('submit', handleSendNotification);

    // My Account & Security
    document.getElementById('my-account-btn')?.addEventListener('click', handleAccountClick);
    document.getElementById('password-change-form')?.addEventListener('submit', handlePasswordUpdate);
}

function navigateTo(pageId) {
    // Add to history if not same as last
    if (navHistory[navHistory.length - 1] !== pageId) {
        navHistory.push(pageId);
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Special handling for profile page
    if (pageId === 'patient-profile-page') {
        loadPatientProfile();
    }
}

function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop(); // Remove current page
        const previousPage = navHistory.pop(); // Get previous page
        navigateTo(previousPage);
    } else {
        navigateTo('home-page');
    }
}

function updateHospitalOptionsVisibility() {
    const viewBtn = document.getElementById('view-hospital-btn');
    if (!viewBtn) return;

    // Check if any hospital is registered in localStorage
    const registeredHospitalsFound = Object.keys(localStorage).some(key => key.startsWith('hospital_'));

    if (registeredHospitalsFound) {
        viewBtn.style.display = 'block';
    } else {
        viewBtn.style.display = 'none';
    }
}

function updatePatientOptionsVisibility() {
    const viewBtn = document.getElementById('view-patient-profile-btn');
    if (!viewBtn) return;

    // Check if any patient is registered in localStorage
    const registeredPatientsFound = Object.keys(localStorage).some(key => key.startsWith('user_'));

    if (registeredPatientsFound) {
        viewBtn.style.display = 'block';
    } else {
        viewBtn.style.display = 'none';
    }
}

function displayHospitals(hospitals) {
    const container = document.getElementById('hospitals-container');
    if (!container) return;

    container.innerHTML = hospitals.map(hospital => `
        <div class="hospital-card" onclick="selectHospital(${hospital.id})">
            <h3>${hospital.name}</h3>
            <p>📍 ${hospital.location}</p>
            <p>⭐ Rating: ${hospital.rating}/5.0</p>
            <span class="hospital-badge">Top Rated</span>
        </div>
    `).join('');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = mockHospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.location.toLowerCase().includes(query)
    );
    displayHospitals(filtered);
}

function selectHospital(hospitalId) {
    currentHospital = mockHospitals.find(h => h.id === hospitalId);
    if (!currentHospital) {
        // Check if it's a registered hospital from localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith('hospital_')) {
                const h = JSON.parse(localStorage.getItem(key));
                if (h.code === hospitalId || h.id === hospitalId) {
                    currentHospital = h;
                    break;
                }
            }
        }
    }

    if (!currentHospital) return;

    // Display hospital details
    document.getElementById('hospital-name-display').textContent = currentHospital.name;
    document.getElementById('hospital-location-display').textContent = currentHospital.location;

    // Display doctors
    const doctorsContainer = document.getElementById('doctors-container');
    if (currentHospital.doctors && currentHospital.doctors.length > 0) {
        doctorsContainer.innerHTML = currentHospital.doctors.map(doctor => `
            <div class="doctor-card" onclick="selectDoctor('${doctor.name}')">
                <div class="doctor-avatar">👨‍⚕️</div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p><strong>Degree:</strong> ${doctor.degree}</p>
                    <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                    <p><strong>Contact:</strong> ${doctor.receptionistContact}</p>
                </div>
                <div class="doctor-fees">₹${doctor.fees}</div>
            </div>
        `).join('');
    } else {
        doctorsContainer.innerHTML = '<p class="text-center">No doctors available for this hospital.</p>';
    }

    navigateTo('hospital-details-page');
}

function selectDoctor(doctorName) {
    currentDoctor = currentHospital.doctors.find(d => d.name === doctorName);
    if (!currentDoctor) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').setAttribute('min', today);

    navigateTo('booking-form-page');
}

function handleBookingForm(e) {
    e.preventDefault();

    bookingData = {
        patientName: document.getElementById('patient-name').value,
        patientAge: document.getElementById('patient-age').value,
        patientGender: document.getElementById('patient-gender').value,
        patientMobile: document.getElementById('patient-mobile').value,
        appointmentDate: document.getElementById('appointment-date').value,
        hospital: currentHospital.name,
        hospitalLocation: currentHospital.location,
        doctor: currentDoctor.name,
        specialization: currentDoctor.specialization,
        fees: currentDoctor.fees,
        helpline: currentHospital.helpline,
        bookingId: 'OPB' + Date.now(),
        timestamp: new Date().toLocaleString()
    };

    displayPaymentSummary();
    navigateTo('payment-page');
}

function displayPaymentSummary() {
    const summaryContainer = document.getElementById('payment-summary-content');
    summaryContainer.innerHTML = `
        <p><strong>Hospital:</strong> ${bookingData.hospital}</p>
        <p><strong>Doctor:</strong> ${bookingData.doctor}</p>
        <p><strong>Specialization:</strong> ${bookingData.specialization}</p>
        <p><strong>Date:</strong> ${bookingData.appointmentDate}</p>
        <p><strong>Patient:</strong> ${bookingData.patientName}</p>
    `;

    document.getElementById('payment-amount').textContent = `₹${bookingData.fees}`;
    document.getElementById('helpline-number').textContent = bookingData.helpline;
}

function confirmPayment() {
    if (currentUser && currentUser.type === 'patient') {
        const bookings = JSON.parse(localStorage.getItem('bookings_' + currentUser.username) || '[]');
        bookings.push({ ...bookingData, status: 'successful' });
        localStorage.setItem('bookings_' + currentUser.username, JSON.stringify(bookings));
    }

    const successDetails = document.getElementById('success-booking-details');
    successDetails.innerHTML = `
        <h3>Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
        <p><strong>Hospital:</strong> ${bookingData.hospital}</p>
        <p><strong>Doctor:</strong> ${bookingData.doctor}</p>
        <p><strong>Date:</strong> ${bookingData.appointmentDate}</p>
        <p><strong>Patient:</strong> ${bookingData.patientName}</p>
        <p><strong>Amount Paid:</strong> ₹${bookingData.fees}</p>
    `;

    navigateTo('success-page');
}

function handlePatientRegistration(e) {
    e.preventDefault();

    const userData = {
        type: 'patient',
        name: document.getElementById('reg-patient-name').value,
        age: document.getElementById('reg-patient-age').value,
        gender: document.getElementById('reg-patient-gender').value,
        mobile: document.getElementById('reg-patient-mobile').value,
        username: document.getElementById('reg-patient-username').value,
        password: document.getElementById('reg-patient-password').value
    };

    localStorage.setItem('user_' + userData.username, JSON.stringify(userData));
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));

    alert('Patient registered successful!');
    updatePatientOptionsVisibility();
    toggleMyAccountButton(true);
    navigateTo('home-page');
}

function handlePatientLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-patient-username').value;
    const password = document.getElementById('login-patient-password').value;

    const userData = localStorage.getItem('user_' + username);
    if (userData) {
        const user = JSON.parse(userData);
        if (user.password === password) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            toggleMyAccountButton(true);
            alert('Logged in successfully!');
            navigateTo('patient-profile-page');
        } else {
            alert('Invalid password!');
        }
    } else {
        alert('Username not found!');
    }
}

function handleHospitalRegistration(e) {
    e.preventDefault();

    const hospitalData = {
        type: 'hospital',
        name: document.getElementById('reg-hospital-name').value,
        code: document.getElementById('reg-hospital-code').value,
        location: document.getElementById('reg-hospital-location').value,
        branch: document.getElementById('reg-hospital-branch').value,
        helpline: document.getElementById('reg-hospital-helpline').value,
        password: document.getElementById('reg-hospital-password').value,
        doctors: []
    };

    localStorage.setItem('hospital_' + hospitalData.code, JSON.stringify(hospitalData));
    currentUser = hospitalData;
    localStorage.setItem('currentUser', JSON.stringify(hospitalData));

    alert('Hospital registered successfully!');
    updateHospitalOptionsVisibility();
    toggleMyAccountButton(true);
    navigateTo('hospital-dashboard-page');
    loadHospitalDoctors();
}

function handleHospitalLogin(e) {
    e.preventDefault();
    const code = document.getElementById('login-hospital-code').value;
    const password = document.getElementById('login-hospital-password').value;

    const hospitalData = localStorage.getItem('hospital_' + code);
    if (hospitalData) {
        const decryptedData = JSON.parse(hospitalData);
        if (decryptedData.password === password) {
            currentUser = decryptedData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            toggleMyAccountButton(true);
            alert('Logged in successfully!');
            navigateTo('hospital-dashboard-page');
            loadHospitalDoctors();
        } else {
            alert('Invalid password!');
        }
    } else {
        alert('Hospital code not found!');
    }
}

function handleAddDoctor(e) {
    e.preventDefault();

    const doctorData = {
        id: Date.now(),
        name: document.getElementById('doctor-name').value,
        degree: document.getElementById('doctor-degree').value,
        specialization: document.getElementById('doctor-specialization').value,
        fees: document.getElementById('doctor-fees').value,
        receptionistContact: document.getElementById('receptionist-contact').value
    };

    if (currentUser && currentUser.type === 'hospital') {
        const hospitalKey = 'hospital_' + currentUser.code;
        const hospitalData = JSON.parse(localStorage.getItem(hospitalKey));
        hospitalData.doctors.push(doctorData);
        localStorage.setItem(hospitalKey, JSON.stringify(hospitalData));

        currentUser.doctors = hospitalData.doctors;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert('Doctor added successfully!');
        e.target.reset();
        toggleAddDoctorForm();
        loadHospitalDoctors();
    }
}

function handleSendNotification(e) {
    e.preventDefault();
    const notificationData = {
        patientMobile: document.getElementById('notification-patient').value,
        status: document.getElementById('notification-status').value,
        message: document.getElementById('notification-message').value,
        timestamp: new Date().toLocaleString()
    };
    alert(`Notification sent to ${notificationData.patientMobile}`);
    e.target.reset();
}

function checkUserSession() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        toggleMyAccountButton(true);
        if (currentUser.type === 'patient') {
            loadPatientBookings();
        } else if (currentUser.type === 'hospital') {
            loadHospitalDoctors();
        }
    } else {
        toggleMyAccountButton(false);
    }
}

function toggleMyAccountButton(show) {
    const btn = document.getElementById('my-account-btn');
    if (btn) btn.style.display = show ? 'flex' : 'none';
}

function handleAccountClick() {
    if (!currentUser) return;
    if (currentUser.type === 'patient') {
        navigateTo('patient-profile-page');
    } else if (currentUser.type === 'hospital') {
        navigateTo('hospital-dashboard-page');
    }
}

function togglePasswordForm() {
    const container = document.getElementById('password-change-form-container');
    if (!container) return;
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    if (container.style.display === 'none') {
        document.getElementById('password-change-form').reset();
    }
}

function handlePasswordUpdate(e) {
    e.preventDefault();
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-new-password').value;

    if (oldPass !== currentUser.password) {
        alert('Incorrect old password!');
        return;
    }

    if (newPass !== confirmPass) {
        alert('New passwords do not match!');
        return;
    }

    if (newPass.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    // Update currentUser and localStorage
    currentUser.password = newPass;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const storageKey = currentUser.type === 'patient'
        ? 'user_' + currentUser.username
        : 'hospital_' + currentUser.code;

    localStorage.setItem(storageKey, JSON.stringify(currentUser));

    alert('Password updated successfully!');
    togglePasswordForm();
}

function loadPatientProfile() {
    if (!currentUser || currentUser.type !== 'patient') return;

    // Update Display Cards
    document.getElementById('display-profile-name').textContent = currentUser.name;
    document.getElementById('display-profile-age').textContent = currentUser.age;
    document.getElementById('display-profile-gender').textContent = currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1);
    document.getElementById('display-profile-mobile').textContent = currentUser.mobile;
    document.getElementById('display-profile-username').textContent = '@' + currentUser.username;

    // Update Form
    document.getElementById('edit-patient-name').value = currentUser.name;
    document.getElementById('edit-patient-age').value = currentUser.age;
    document.getElementById('edit-patient-gender').value = currentUser.gender;
    document.getElementById('edit-patient-mobile').value = currentUser.mobile;

    // Load Categorized Appointments
    loadCategorizedAppointments();
}

function loadCategorizedAppointments() {
    const bookings = JSON.parse(localStorage.getItem('bookings_' + currentUser.username) || '[]');
    const currentContainer = document.getElementById('current-appointments-list');
    const pastContainer = document.getElementById('past-appointments-list');

    if (!currentContainer || !pastContainer) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentBookings = [];
    const pastBookings = [];

    bookings.forEach(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        if (bookingDate >= today) {
            currentBookings.push(booking);
        } else {
            pastBookings.push(booking);
        }
    });

    const renderBookings = (list, container) => {
        if (list.length === 0) {
            container.innerHTML = '<div class="no-data-msg">no OPs</div>';
            return;
        }

        container.innerHTML = list.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <h3>${booking.hospital}</h3>
                    <span class="booking-id">${booking.bookingId}</span>
                </div>
                <div class="booking-body">
                    <p><strong>Doctor:</strong> ${booking.doctor}</p>
                    <p><strong>Date:</strong> ${booking.appointmentDate}</p>
                    <p><strong>Specialization:</strong> ${booking.specialization}</p>
                    <div class="booking-footer">
                        <span class="booking-status ${booking.status}">${booking.status.toUpperCase()}</span>
                        <span class="booking-timestamp">${booking.timestamp}</span>
                    </div>
                </div>
            </div>
        `).join('');
    };

    renderBookings(currentBookings, currentContainer);
    renderBookings(pastBookings, pastContainer);
}

function toggleProfileEdit(isEditing) {
    document.getElementById('profile-view-mode').style.display = isEditing ? 'none' : 'block';
    document.getElementById('profile-edit-mode').style.display = isEditing ? 'block' : 'none';
}

function handleProfileUpdate(e) {
    e.preventDefault();

    currentUser.name = document.getElementById('edit-patient-name').value;
    currentUser.age = document.getElementById('edit-patient-age').value;
    currentUser.gender = document.getElementById('edit-patient-gender').value;
    currentUser.mobile = document.getElementById('edit-patient-mobile').value;

    localStorage.setItem('user_' + currentUser.username, JSON.stringify(currentUser));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('Profile updated successfully!');
    toggleProfileEdit(false);
    loadPatientProfile();
}

function loadPatientBookings() {
    if (!currentUser || currentUser.type !== 'patient') return;
    loadPatientProfile();
}

function loadHospitalDoctors() {
    if (!currentUser || currentUser.type !== 'hospital') return;
    const hospitalKey = 'hospital_' + currentUser.code;
    const hospitalData = JSON.parse(localStorage.getItem(hospitalKey));
    const container = document.getElementById('hospital-doctors-list');
    if (!container) return;
    if (!hospitalData.doctors || hospitalData.doctors.length === 0) {
        container.innerHTML = '<p class="text-center">No doctors added yet.</p>';
        return;
    }
    container.innerHTML = hospitalData.doctors.map(doctor => `
        <div class="doctor-card">
            <div class="doctor-avatar">👨‍⚕️</div>
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p><strong>Degree:</strong> ${doctor.degree}</p>
                <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                <p><strong>Contact:</strong> ${doctor.receptionistContact}</p>
            </div>
            <div class="doctor-fees">₹${doctor.fees}</div>
        </div>
    `).join('');
}

function toggleAddDoctorForm() {
    const formSection = document.getElementById('add-doctor-section');
    if (formSection.style.display === 'none') {
        formSection.style.display = 'block';
    } else {
        formSection.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    toggleMyAccountButton(false);
    navHistory = ['home-page'];
    navigateTo('home-page');
    alert('Logged out successfully');
}

// Make functions globally accessible
window.navigateTo = navigateTo;
window.goBack = goBack;
window.selectHospital = selectHospital;
window.selectDoctor = selectDoctor;
window.confirmPayment = confirmPayment;
window.logout = logout;
window.toggleAddDoctorForm = toggleAddDoctorForm;
window.toggleProfileEdit = toggleProfileEdit;
window.togglePasswordForm = togglePasswordForm;
