// Map functionality for LINA Safety App using MapTiler
let map;
let currentLocationMarker;
let safePlacesMarkers = [];
const MAPTILER_API_KEY = 'i97DCXlqmokwCV6scEFF';

// Barcelona coordinates for demo
const BARCELONA_CENTER = { lat: 41.3851, lng: 2.1734 };
const DEMO_SAFE_PLACES = [
    { lat: 41.3879, lng: 2.1699, name: "Police Station", type: "police", icon: "fas fa-shield-alt" },
    { lat: 41.3888, lng: 2.1590, name: "Hospital Clínic", type: "hospital", icon: "fas fa-hospital" },
    { lat: 41.3917, lng: 2.1649, name: "24h Pharmacy", type: "pharmacy", icon: "fas fa-pills" },
    { lat: 41.3825, lng: 2.1769, name: "Metro Station", type: "transport", icon: "fas fa-subway" },
    { lat: 41.3945, lng: 2.1678, name: "Safe Café (24h)", type: "cafe", icon: "fas fa-coffee" },
    { lat: 41.3798, lng: 2.1801, name: "Fire Station", type: "fire", icon: "fas fa-fire-extinguisher" }
];

// Initialize MapTiler map
function initMap() {
    console.log('🗺️ Initializing MapTiler Map...');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    mapContainer.innerHTML = ""; // Clear previous map instances

    try {
        map = L.map('map').setView([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng], 14);

        L.tileLayer(
            `https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, 
            {
                attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(map);

        console.log('✅ MapTiler initialized successfully');
        
        // Initialize location and markers after map is ready
        getCurrentLocation();
        addSafePlacesMarkers();
        setupMapEventListeners();

    } catch (error) {
        console.error('❌ Error initializing MapTiler:', error);
        mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Could not load the map. Please try again later.</p>';
    }
}

// Get current location using Geolocation API
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateCurrentLocationMarker([userLocation.lat, userLocation.lng]);
                map.setView([userLocation.lat, userLocation.lng], 16);
            },
            (error) => {
                console.warn('Location access denied, using default location.');
                updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
    }
}

// Update or create the marker for the user's current location
function updateCurrentLocationMarker(latlng) {
    if (currentLocationMarker) {
        currentLocationMarker.setLatLng(latlng);
    } else {
        const pulsingIcon = L.divIcon({
            className: 'pulsing-icon',
            iconSize: [20, 20]
        });
        currentLocationMarker = L.marker(latlng, { icon: pulsingIcon }).addTo(map)
            .bindPopup("<b>You are here!</b>");
    }
}

// Add markers for predefined safe places
function addSafePlacesMarkers() {
    // Clear existing markers
    safePlacesMarkers.forEach(marker => map.removeLayer(marker));
    safePlacesMarkers = [];

    DEMO_SAFE_PLACES.forEach(place => {
        const iconHtml = `<i class="${place.icon}" style="color: var(--tertiary-200); font-size: 20px;"></i>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-map-icon',
            iconSize: [20, 20]
        });
        
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`<b>${place.name}</b><br>${place.type}`);
        safePlacesMarkers.push(marker);
    });
}

// Setup event listeners for UI elements
function setupMapEventListeners() {
    // Route type selection
    document.querySelectorAll('.route-type').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.route-type').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            // Re-plan route when type changes
            planRoute();
        });
    });
    
    // Destination input 'Enter' key press
    const endLocationInput = document.getElementById('endLocation');
    endLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            planRoute();
        }
    });
    
    // Center map on user location
    document.getElementById('centerLocation').addEventListener('click', () => {
        if (currentLocationMarker) {
            map.setView(currentLocationMarker.getLatLng(), 16);
            showToast('Location', 'Centered on your location');
        }
    });

    // Other controls (placeholders for now)
    document.getElementById('toggleSafePlaces').addEventListener('click', () => showToast('Info', 'Toggle Safe Places - Coming soon!'));
    document.getElementById('toggleRoutes').addEventListener('click', () => showToast('Info', 'Toggle Routes - Coming soon!'));
    document.getElementById('shareLocation').addEventListener('click', () => showToast('Location Shared', 'Current location shared with trusted contacts'));
    document.getElementById('startNavigation').addEventListener('click', () => showToast('Navigation', 'Navigation feature - Coming soon!'));
    document.getElementById('shareRoute').addEventListener('click', () => showToast('Route Shared', 'Route sharing feature - Coming soon!'));
    
    // Floating SOS button
    document.getElementById('floatingSOS').addEventListener('click', () => {
        showToast('Emergency SOS', 'Emergency services contacted!');
    });
}

// Simulate route planning
function planRoute() {
    const end = document.getElementById('endLocation').value;
    if (!end.trim()) {
        showToast('Route Planning', 'Please enter a destination');
        return;
    }
    
    showLoadingOverlay(true);
    
    // Simulate API call for route calculation
    setTimeout(() => {
        showLoadingOverlay(false);
        showRouteInfo();
        showToast('Route Planned', 'Safest route to destination is ready.');
        // In a real app, you would draw the route on the map here
    }, 1500);
}

// Show/hide route information panel
function showRouteInfo() {
    document.getElementById('routeInfo').style.display = 'block';
}

function closeRouteInfo() {
    document.getElementById('routeInfo').style.display = 'none';
}

// Navigation functions
function goHome() {
    window.location.href = 'index.html';
}
function goToContacts() {
    showToast('Navigation', 'Contacts page - Coming soon!');
}
function goToSettings() {
    showToast('Navigation', 'Settings page - Coming soon!');
}

// Utility functions
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('show', show);
    }
}

function showToast(title, message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: white; padding: 15px 20px;
        border-radius: 8px; z-index: 10000; max-width: 300px; text-align: center;
        font-family: 'Sofia Sans', sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    `;
    toast.innerHTML = `<strong>${title}</strong><br><small>${message}</small>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize the map when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initMap);