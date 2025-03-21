let currentUser = null;
let map;
let ambulanceMarkers = {};
let users = { "admin@a": "12345" }; // Default Admin User

const loginSignupContainer = document.getElementById('loginSignup');
const dashboardContainer = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// Show/Hide Elements
function show(id) { document.getElementById(id).style.display = 'block'; }
function hide(id) { document.getElementById(id).style.display = 'none'; }

// Toggle Forms
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); hide('loginForm'); show('signupForm'); loginError.textContent = ''; });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); hide('signupForm'); show('loginForm'); signupError.textContent = ''; });

// Login Function
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginError.textContent = '';

    // Accept any email and password combination
    currentUser = { email };
    updateUI(currentUser);
});

// Signup Function
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    signupError.textContent = '';

    if (!email || !password) {
        signupError.textContent = "Email and password are required.";
        return;
    }

    if (users[email]) {
        signupError.textContent = "Email already registered.";
        return;
    }

    users[email] = password; 
    alert("Signup successful! Please login.");
    hide('signupForm');
    show('loginForm');
});

// Logout Function
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    updateUI(null);
});

// Update UI based on login state
function updateUI(user) {
    if (user) {
        hide('loginSignup');
        show('dashboard');
        initializeMap();
        loadAmbulanceData();
    } else {
        show('loginSignup');
        hide('dashboard');
        if (map) { map.remove(); map = null; }
    }
}

// --- Ambulance Data ---
const totalAmbulancesEl = document.getElementById('totalAmbulances');
const activeAmbulancesEl = document.getElementById('activeAmbulances');
const inactiveAmbulancesEl = document.getElementById('inactiveAmbulances');
const ambulanceTableBody = document.getElementById('ambulanceTableBody');

let ambulanceData = [
    { id: '1', ambulanceId: 'A001', status: 'active', location: { lat: 28.54340063466324, lng: 77.21441378542946 }, driver: 'Jatan Kumar', patient: 'Suvijya Arya', pickup: 'Hospital A', dropoff: 'Home' },
    { id: '2', ambulanceId: 'A002', status: 'inactive', location: { lat: 29.5942, lng: 76.2428 }, driver: 'Jane Smith', patient: null, pickup: null, dropoff: null },
    { id: '3', ambulanceId: 'A003', status: 'active', location: { lat: 30.6139, lng: 75.2828 }, driver: 'Mike Brown', patient: 'Bob Johnson', pickup: 'Accident Site', dropoff: 'Hospital B' },
    { id: '4', ambulanceId: 'A004', status: 'inactive', location: { lat: 31.570, lng: 75.1346 }, driver: 'Emily Davis', patient: null, pickup: null, dropoff: null },
];

// Load Ambulance Data into Table
function loadAmbulanceData() {
    totalAmbulancesEl.textContent = ambulanceData.length;
    activeAmbulancesEl.textContent = ambulanceData.filter(a => a.status === 'active').length;
    inactiveAmbulancesEl.textContent = ambulanceData.filter(a => a.status === 'inactive').length;

    ambulanceTableBody.innerHTML = "";
    ambulanceData.forEach(ambulance => {
        let row = `<tr>
            <td>${ambulance.ambulanceId}</td>
            <td>${ambulance.status}</td>
            <td>${ambulance.location ? `${ambulance.location.lat}, ${ambulance.location.lng}` : "N/A"}</td>
            <td><button class="show-details-btn" data-ambulance-id="${ambulance.ambulanceId}">Details</button></td>
        </tr>`;
        ambulanceTableBody.innerHTML += row;
    });

    addClickHandlers();
}

// --- Map Initialization ---
function initializeMap() {
    if (!document.getElementById('map')) return console.error("Map container not found.");

    map = L.map('map').setView([0, 0], 2); 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    updateAmbulanceMarkers();
}

// --- Update Markers on Map ---
function updateAmbulanceMarkers() {
    if (!map) return;
    ambulanceData.forEach(ambulance => {
        if (!ambulance.location) return;
        const { ambulanceId, location, status } = ambulance;

        if (ambulanceMarkers[ambulanceId]) {
            ambulanceMarkers[ambulanceId].setLatLng([location.lat, location.lng]);
        } else {
            let marker = L.marker([location.lat, location.lng]).addTo(map);
            marker.bindPopup(`<b>${ambulanceId}</b><br>Status: ${status}<br>
                <button class="show-details-btn" data-ambulance-id="${ambulanceId}">Show Details</button>`);
            ambulanceMarkers[ambulanceId] = marker;
        }
    });

    addClickHandlers();
}

// --- Handle Show Details ---
function addClickHandlers() {
    document.querySelectorAll('.show-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ambulanceId = this.dataset.ambulanceId;
            showAmbulanceDetails(ambulanceId);
        });
    });
}

// --- Ambulance Details Modal ---
const ambulanceIdEl = document.getElementById('ambulanceId');
const ambulanceStatusEl = document.getElementById('ambulanceStatus');
const ambulanceLocationEl = document.getElementById('ambulanceLocation');
const ambulancePatientEl = document.getElementById('ambulancePatient');
const ambulanceRouteEl = document.getElementById('ambulanceRoute');
const stopRouteButton = document.getElementById('stopRouteButton');
const modal = document.getElementById('ambulanceDetailsModal');

function showAmbulanceDetails(ambulanceId) {
    const ambulance = ambulanceData.find(a => a.ambulanceId === ambulanceId);
    if (!ambulance) return;

    // Format the details with more information
    const detailsHtml = `
        <div class="ambulance-details-content">
            <h3>Ambulance Details</h3>
            <div class="detail-row">
                <strong>Ambulance ID:</strong> ${ambulance.ambulanceId}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-${ambulance.status}">${ambulance.status}</span>
            </div>
            <div class="detail-row">
                <strong>Driver:</strong> ${ambulance.driver}
            </div>
            <div class="detail-row">
                <strong>Current Location:</strong> ${ambulance.location ? `${ambulance.location.lat.toFixed(6)}, ${ambulance.location.lng.toFixed(6)}` : "N/A"}
            </div>
            <div class="detail-row">
                <strong>Patient Name:</strong> ${ambulance.patient || "N/A"}
            </div>
            <div class="detail-row">
                <strong>Route:</strong> ${ambulance.pickup ? `${ambulance.pickup} → ${ambulance.dropoff}` : "No active route"}
            </div>
            <div class="detail-row">
                <strong>Last Updated:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="detail-actions">
                <button id="stopRouteButton" class="action-btn">Stop Route</button>
                <button class="action-btn" onclick="hide('ambulanceDetailsModal')">Close</button>
            </div>
        </div>
    `;

    // Update the modal content
    document.getElementById('ambulanceDetails').innerHTML = detailsHtml;

    // Show the modal
    show('ambulanceDetailsModal');

    // Center map on ambulance location
    if (ambulance.location && map) {
        map.setView([ambulance.location.lat, ambulance.location.lng], 13);
    }
}

stopRouteButton.addEventListener('click', () => alert('Route stopped!'));
document.querySelector('.close').addEventListener('click', () => hide('ambulanceDetailsModal'));

// Add styles for the details
const style = document.createElement('style');
style.textContent = `
    .ambulance-details-content {
        padding: 20px;
    }
    .detail-row {
        margin: 10px 0;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
    }
    .status-active {
        color: #28a745;
        font-weight: bold;
    }
    .status-inactive {
        color: #dc3545;
        font-weight: bold;
    }
    .detail-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    .action-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    .action-btn:first-child {
        background-color: #dc3545;
        color: white;
    }
    .action-btn:last-child {
        background-color: #6c757d;
        color: white;
    }
    .action-btn:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(style);
