// Map functionality for LINA Safety App using MapTiler
let map;
let currentLocationMarker;
let safePlacesMarkers = [];
const MAPTILER_API_KEY = 'i97DCXlqmokwCV6scEFF';

// Barcelona coordinates for demo
const BARCELONA_CENTER = { lat: 41.3851, lng: 2.1734 };

// Demo safe places (emergency services)
const DEMO_SAFE_PLACES = [
    { lat: 41.3879, lng: 2.1699, name: "Police Station", type: "police", icon: "fas fa-shield-alt" },
    { lat: 41.3888, lng: 2.1590, name: "Hospital Clínic", type: "hospital", icon: "fas fa-hospital" },
    { lat: 41.3917, lng: 2.1649, name: "24h Pharmacy", type: "pharmacy", icon: "fas fa-pills" },
    { lat: 41.3825, lng: 2.1769, name: "Metro Station", type: "transport", icon: "fas fa-subway" },
    { lat: 41.3945, lng: 2.1678, name: "Safe Café (24h)", type: "cafe", icon: "fas fa-coffee" },
    { lat: 41.3798, lng: 2.1801, name: "Fire Station", type: "fire", icon: "fas fa-fire-extinguisher" }
];

// Safe places from CSV data with approximate coordinates
const CSV_SAFE_PLACES = [
    // Markets & 24h Services
    { lat: 41.3819, lng: 2.1720, name: "La Boqueria Market", type: "market", 
      phone: "+34 93 318 20 17", hours: "Mon-Sat 8:00-20:30", info: "Famous food market" },
    { lat: 41.3732, lng: 2.1156, name: "A Deshora", type: "24h-service", 
      hours: "24 hours", info: "24h convenience store" },
    
    // Community & Support Services
    { lat: 41.3830, lng: 2.1690, name: "Metzineres", type: "cooperative", 
      phone: "+34 936 398 589", hours: "Mon-Sat 14:00-21:00", info: "Women's support cooperative" },
    
    // Safe Bars & Social Spaces
    { lat: 41.3799, lng: 2.1714, name: "Bar Marsella", type: "historic-bar", 
      phone: "+34 934 42 72 63", hours: "Tue-Sun 17:00-01:30", info: "Historic bar since 1820" },
    { lat: 41.3954, lng: 2.1598, name: "Tandem", type: "cocktail-bar", 
      phone: "+34 934 514 330", hours: "Daily 12:30-02:30", info: "Custom cocktails" },
    { lat: 41.3956, lng: 2.1612, name: "Hemingway Bar", type: "cocktail-bar", 
      phone: "+34 931 296 793", hours: "Daily 18:30-03:00", info: "Gin & whiskey bar" },
    { lat: 41.3941, lng: 2.1584, name: "Les Gens que J'aime", type: "cocktail-bar", 
      phone: "+34 932 156 879", hours: "Daily 18:00-03:00", info: "Vintage basement bar" },
    { lat: 41.3943, lng: 2.1592, name: "Cobbler", type: "cocktail-bar", 
      phone: "+34 93 415 6789", hours: "Daily 19:00-02:00", info: "Craft cocktails" },
    
    // Craft Beer & Local Culture
    { lat: 41.3813, lng: 2.1703, name: "Ølgod Brewpub", type: "craft-beer", 
      phone: "+34 93 268 1420", hours: "Daily 15:00-03:00", info: "Nordic craft beer" },
    
    // Upscale & Safe Venues
    { lat: 41.3866, lng: 2.1825, name: "Paradiso", type: "speakeasy", 
      phone: "+34 93 167 8954", hours: "Tue-Sat 19:00-02:00", info: "World's #1 cocktail bar" },
    { lat: 41.3864, lng: 2.1771, name: "Punch Room", type: "hotel-bar", 
      phone: "+34 93 295 1400", hours: "Daily 18:00-02:00", info: "Hotel Edition bar" },
    { lat: 41.3870, lng: 2.1820, name: "Collage", type: "art-bar", 
      phone: "+34 93 178 5623", hours: "Wed-Sat 20:00-02:30", info: "Art & cocktails" },
    
    // Wine & Mediterranean Culture
    { lat: 41.3837, lng: 2.1776, name: "Zona d'Ombra", type: "wine-bar", 
      phone: "+34 93 156 7891", hours: "Mon-Sat 18:00-01:00", info: "Local wines & tapas" },
    { lat: 41.3869, lng: 2.1816, name: "Farola", type: "terrace-bar", 
      phone: "+34 663 332 643", hours: "Daily 17:00-02:00", info: "Terrace with live music" },
    { lat: 41.3843, lng: 2.1785, name: "Sub Rosa", type: "cocktail-bar", 
      phone: "+34 93 289 4567", hours: "Daily 19:00-02:30", info: "Quirky cocktail bar" },
    
    // Casual & Trendy
    { lat: 41.3854, lng: 2.1832, name: "The Mint", type: "casual-bar", 
      phone: "+34 93 198 7654", hours: "Daily 18:00-02:00", info: "Cheap mojitos €4" },
    
    // Additional safe places
    { lat: 41.3889, lng: 2.1654, name: "Café Central", type: "cafe", 
      phone: "+34 93 302 1176", hours: "Daily 07:00-23:00", info: "Safe café with WiFi" },
    { lat: 41.3801, lng: 2.1743, name: "Night Owl Store", type: "24h-service", 
      hours: "24 hours", info: "24h mini market" },
    { lat: 41.3912, lng: 2.1623, name: "BookBar", type: "cafe", 
      phone: "+34 93 487 3621", hours: "Mon-Sat 10:00-22:00", info: "Books & coffee" },
    { lat: 41.3825, lng: 2.1698, name: "Safe Harbor", type: "restaurant", 
      phone: "+34 93 176 8432", hours: "Daily 12:00-24:00", info: "Women-friendly restaurant" }
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

    // Add demo safe places (emergency services) with icon markers
    DEMO_SAFE_PLACES.forEach(place => {
        const iconHtml = `<i class="${place.icon}" style="color: var(--primary-300); font-size: 16px;"></i>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-map-icon emergency-marker',
            iconSize: [22, 22]
        });
        
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(createEmergencyPopup(place));
        safePlacesMarkers.push(marker);
    });

    // Add CSV safe places with smaller dot markers
    CSV_SAFE_PLACES.forEach(place => {
        const customIcon = L.divIcon({
            html: '',
            className: 'dot-marker safe-place-dot',
            iconSize: [8, 8]
        });
        
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(createMinimalPopup(place));
        safePlacesMarkers.push(marker);
    });
}

// Create popup content for emergency services
function createEmergencyPopup(place) {
    return `
        <div class="minimal-popup emergency-popup">
            <strong>${place.name}</strong>
            <div class="popup-badge emergency">EMERGENCY</div>
        </div>
    `;
}

// Create minimal popup content for safe places
function createMinimalPopup(place) {
    let popupContent = `
        <div class="minimal-popup safe-place-popup">
            <strong>${place.name}</strong>
    `;
    
    if (place.hours && place.hours.trim()) {
        popupContent += `<div class="popup-hours">${place.hours}</div>`;
    }
    
    if (place.phone && place.phone.trim()) {
        popupContent += `<div class="popup-phone"><a href="tel:${place.phone}">${place.phone}</a></div>`;
    }
    
    if (place.info && place.info.trim()) {
        popupContent += `<div class="popup-info">${place.info}</div>`;
    }
    
    popupContent += `</div>`;
    
    return popupContent;
}

// Setup event listeners for UI elements
function setupMapEventListeners() {
    // Emergency SOS Button
    const sosButton = document.getElementById('sosButton');
    if (sosButton) {
        sosButton.addEventListener('click', handleEmergencySOS);
    }
    
    // Share Location Button
    const shareLocationBtn = document.getElementById('shareLocationBtn');
    if (shareLocationBtn) {
        shareLocationBtn.addEventListener('click', handleShareLocation);
    }
    
    // Fake Call Button
    const fakeCallBtn = document.getElementById('fakeCallBtn');
    if (fakeCallBtn) {
        fakeCallBtn.addEventListener('click', handleFakeCall);
    }
    
    // Make Noise Button
    const makeNoiseBtn = document.getElementById('makeNoiseBtn');
    if (makeNoiseBtn) {
        makeNoiseBtn.addEventListener('click', handleMakeNoise);
    }
    
    // Center Location Button
    const centerLocationBtn = document.getElementById('centerLocationBtn');
    if (centerLocationBtn) {
        centerLocationBtn.addEventListener('click', handleCenterLocation);
    }
    
    // Search functionality
    const destinationInput = document.getElementById('destinationInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (destinationInput) {
        destinationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
}

// Action handlers for floating buttons
function handleEmergencySOS() {
    showToast('🚨 EMERGENCY SOS', 'Emergency services contacted! Stay safe.');
    // Add visual feedback
    const sosButton = document.getElementById('sosButton');
    sosButton.style.animation = 'none';
    sosButton.style.background = 'linear-gradient(135deg, #8A142E 0%, #510817 100%)';
    setTimeout(() => {
        sosButton.style.background = 'linear-gradient(135deg, var(--primary-300) 0%, var(--primary-400) 100%)';
        sosButton.style.animation = 'pulse-sos 2s infinite';
    }, 2000);
}

function handleShareLocation() {
    if (currentLocationMarker) {
        const latlng = currentLocationMarker.getLatLng();
        showToast('📍 Location Shared', `Shared with trusted contacts: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    } else {
        showToast('📍 Location Shared', 'Current location shared with trusted contacts');
    }
}

function handleFakeCall() {
    showToast('📞 Fake Call', 'Incoming call from "Mom" in 10 seconds...');
    setTimeout(() => {
        showToast('📞 Incoming Call', 'Mom is calling... (This is a fake call for safety)');
    }, 10000);
}

function handleMakeNoise() {
    showToast('🔊 Alarm Activated', 'Making noise to attract attention!');
    // In a real app, this would play a loud alarm sound
    navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 200]);
}

function handleCenterLocation() {
    if (currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 16);
        showToast('🎯 Location', 'Centered on your location');
    } else {
        getCurrentLocation();
        showToast('🎯 Location', 'Getting your current location...');
    }
}

function handleSearch() {
    const destination = document.getElementById('destinationInput').value.trim();
    if (destination) {
        showToast('🔍 Search', `Searching for safest route to: ${destination}`);
        // In a real app, this would search for the destination and plan a route
    } else {
        showToast('🔍 Search', 'Please enter a destination');
    }
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