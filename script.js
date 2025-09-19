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
    { lat: 41.3819, lng: 2.1720, name: "La Boqueria Market", type: "market", icon: "fas fa-store", 
      category: "Market", address: "La Rambla, 91", phone: "+34 93 318 20 17", 
      hours: "Mon-Sat 8:00-20:30, Sun closed", notes: "Famous food market" },
    { lat: 41.3732, lng: 2.1156, name: "A Deshora", type: "24h-service", icon: "fas fa-shopping-cart", 
      category: "24h Supermarket", address: "Carrer del Doctor Ferran, 22", phone: "+34 93 000 0000", 
      hours: "24 hours", notes: "24-hour convenience store" },
    
    // Community & Support Services
    { lat: 41.3830, lng: 2.1690, name: "Metzineres", type: "cooperative", icon: "fas fa-hands-helping", 
      category: "Cooperative", address: "Carrer de Lluna, 3", phone: "+34 936 398 589", 
      hours: "Mon,Wed,Thu,Sat 14:00-21:00; Tue,Fri 18:00-21:00", 
      notes: "Non-profit cooperative for vulnerable women and gender-diverse people" },
    
    // Safe Bars & Social Spaces (Historic and well-established)
    { lat: 41.3799, lng: 2.1714, name: "Bar Marsella", type: "historic-bar", icon: "fas fa-glass-cheers", 
      category: "Historic Bar", address: "Carrer de Sant Pau, 65", phone: "+34 934 42 72 63", 
      hours: "Tue-Thu 17:00-00:00; Fri-Sat 17:00-01:30; Sun 17:00-00:00; Mon closed", 
      notes: "Barcelona's oldest bar (est. 1820), famous for absinthe" },
    { lat: 41.3954, lng: 2.1598, name: "Tandem", type: "cocktail-bar", icon: "fas fa-cocktail", 
      category: "Cocktail Bar", address: "Carrer d'Aribau, 86", phone: "+34 934 514 330", 
      hours: "Mon-Wed 12:30-23:00; Thu-Fri 12:30-02:30", notes: "Classic cocktail bar with no menu" },
    { lat: 41.3956, lng: 2.1612, name: "Hemingway Gin & Cocktail Bar", type: "cocktail-bar", icon: "fas fa-wine-glass", 
      category: "Cocktail Bar", address: "Carrer de Muntaner, 114", phone: "+34 931 296 793", 
      hours: "Mon-Thu 18:30-02:00; Fri-Sat 17:00-03:00", notes: "Basement bar specializing in rare gins" },
    { lat: 41.3941, lng: 2.1584, name: "Les Gens que J'aime", type: "cocktail-bar", icon: "fas fa-heart", 
      category: "Cocktail Bar", address: "Carrer de València, 286", phone: "+34 932 156 879", 
      hours: "Daily 18:00-02:30 (Fri-Sat until 03:00)", notes: "Vintage basement bar with red velvet seating" },
    { lat: 41.3943, lng: 2.1592, name: "Cobbler", type: "cocktail-bar", icon: "fas fa-cocktail", 
      category: "Cocktail Bar", address: "Carrer de Casanova, 91", phone: "+34 93 000 0001", 
      hours: "Daily 19:00-02:00", notes: "Craft cocktail bar known for innovative drinks" },
    
    // Craft Beer & Local Culture
    { lat: 41.3813, lng: 2.1703, name: "Ølgod Brewpub", type: "craft-beer", icon: "fas fa-beer", 
      category: "Craft Beer Bar", address: "Carrer de l'Hospital, 74", phone: "+34 93 000 0002", 
      hours: "Mon-Thu 15:00-02:30; Fri 15:00-03:00; Sat 12:00-03:00", 
      notes: "Nordic craft beer bar with 20+ taps, microbrewery" },
    
    // Upscale & Safe Venues
    { lat: 41.3866, lng: 2.1825, name: "Paradiso", type: "speakeasy", icon: "fas fa-door-closed", 
      category: "Speakeasy/Cocktail Bar", address: "Carrer de Rera Palau, 4", phone: "+34 93 000 0003", 
      hours: "Tue-Sat 19:00-02:00", notes: "World's #1 cocktail bar (2022), hidden behind fridge door" },
    { lat: 41.3864, lng: 2.1771, name: "Punch Room", type: "hotel-bar", icon: "fas fa-building", 
      category: "Hotel Cocktail Bar", address: "Avinguda de Francesc Cambó, 14", phone: "+34 93 000 0004", 
      hours: "Daily 18:00-02:00", notes: "Speakeasy-style bar at The Barcelona EDITION hotel" },
    { lat: 41.3870, lng: 2.1820, name: "Collage Art & Cocktail Social Club", type: "art-bar", icon: "fas fa-palette", 
      category: "Cocktail Bar", address: "Carrer dels Consellers, 4", phone: "+34 93 000 0005", 
      hours: "Wed-Sat 20:00-02:30", notes: "Art & cocktail bar with cocktail-making classes" },
    
    // Wine & Mediterranean Culture
    { lat: 41.3837, lng: 2.1776, name: "Zona d'Ombra", type: "wine-bar", icon: "fas fa-wine-bottle", 
      category: "Wine Bar", address: "Carrer de Sant Domènec del Call, 12", phone: "+34 93 000 0006", 
      hours: "Mon-Sat 18:00-01:00", notes: "Wine bar specializing in local wines, Cava, and tapas pairings" },
    { lat: 41.3869, lng: 2.1816, name: "Farola", type: "terrace-bar", icon: "fas fa-umbrella-beach", 
      category: "Cocktail Bar", address: "Carrer del Rec, 67", phone: "+34 663 332 643", 
      hours: "Daily 17:00-02:00", notes: "Mediterranean cocktails with all-day terrace, live music" },
    { lat: 41.3843, lng: 2.1785, name: "Sub Rosa Cocktail Bar", type: "cocktail-bar", icon: "fas fa-rose", 
      category: "Cocktail Bar", address: "Carrer d'en Rauric, 23", phone: "+34 93 000 0007", 
      hours: "Daily 19:00-02:30", notes: "Popular cocktail bar known for one-of-a-kind cocktails, quirky atmosphere" },
    
    // Casual & Trendy
    { lat: 41.3854, lng: 2.1832, name: "The Mint", type: "casual-bar", icon: "fas fa-leaf", 
      category: "Cocktail Bar", address: "Passeig d'Isabel II, 4", phone: "+34 93 000 0008", 
      hours: "Daily 18:00-02:00", notes: "Trendy bar on edge of Gothic Quarter, known for strong cheap mojitos €4" }
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

    // Add demo safe places (emergency services) with higher priority
    DEMO_SAFE_PLACES.forEach(place => {
        const iconHtml = `<i class="${place.icon}" style="color: var(--primary-300); font-size: 20px;"></i>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-map-icon emergency-marker',
            iconSize: [24, 24]
        });
        
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(createEmergencyPopup(place));
        safePlacesMarkers.push(marker);
    });

    // Add CSV safe places with different styling
    CSV_SAFE_PLACES.forEach(place => {
        const iconHtml = `<i class="${place.icon}" style="color: var(--tertiary-300); font-size: 16px;"></i>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-map-icon safe-place-marker',
            iconSize: [20, 20]
        });
        
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(createSafePlacePopup(place));
        safePlacesMarkers.push(marker);
    });
}

// Create popup content for emergency services
function createEmergencyPopup(place) {
    return `
        <div class="map-popup emergency-popup">
            <div class="popup-header">
                <i class="${place.icon}" style="color: var(--primary-300); margin-right: 8px;"></i>
                <strong>${place.name}</strong>
            </div>
            <div class="popup-content">
                <span class="category-badge emergency">${place.type.toUpperCase()}</span>
                <p><i class="fas fa-shield-alt" style="color: var(--primary-300);"></i> Emergency Service</p>
            </div>
        </div>
    `;
}

// Create popup content for safe places from CSV
function createSafePlacePopup(place) {
    let popupContent = `
        <div class="map-popup safe-place-popup">
            <div class="popup-header">
                <i class="${place.icon}" style="color: var(--tertiary-300); margin-right: 8px;"></i>
                <strong>${place.name}</strong>
            </div>
            <div class="popup-content">
                <span class="category-badge ${getCategoryClass(place.category)}">${place.category}</span>
    `;
    
    if (place.address && place.address.trim() && place.address !== "Address not found") {
        popupContent += `<p><i class="fas fa-map-marker-alt"></i> ${place.address}</p>`;
    }
    
    if (place.hours && place.hours.trim()) {
        popupContent += `<p><i class="fas fa-clock"></i> ${place.hours}</p>`;
    }
    
    if (place.phone && place.phone.trim() && !place.phone.includes("000 0000")) {
        popupContent += `<p><i class="fas fa-phone"></i> <a href="tel:${place.phone}">${place.phone}</a></p>`;
    }
    
    if (place.notes && place.notes.trim() && !place.notes.includes("Unable to locate")) {
        popupContent += `<p><i class="fas fa-info-circle"></i> ${place.notes}</p>`;
    }
    
    popupContent += `
            </div>
        </div>
    `;
    
    return popupContent;
}

// Get CSS class for category badges
function getCategoryClass(category) {
    const categoryMap = {
        'Market': 'market',
        '24h Supermarket': 'service-24h',
        'Cooperative': 'community',
        'Historic Bar': 'historic',
        'Cocktail Bar': 'social',
        'Craft Beer Bar': 'social',
        'Speakeasy/Cocktail Bar': 'upscale',
        'Hotel Cocktail Bar': 'upscale',
        'Wine Bar': 'wine',
        'Gin Bar': 'social'
    };
    return categoryMap[category] || 'default';
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