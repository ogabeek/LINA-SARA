// Map functionality for LINA Safety App using MapTiler
let map;
let currentLocationMarker;
let safePlacesMarkers = [];
let currentRoute = null;
let destinationMarker = null;
const MAPTILER_API_KEY = 'i97DCXlqmokwCV6scEFF';
const GRAPHHOPPER_API_KEY = 'dc967afc-f73b-45ba-b388-31b5f1244390';

// Debugging functionality
const DEBUG_MODE = true;
let debugLog;

function initDebug() {
    if (!DEBUG_MODE) return;
    const debugPanel = document.getElementById('debugPanel');
    debugLog = document.getElementById('debugLog');
    if (debugPanel && debugLog) {
        console.log('🐛 Debug panel initialized.');
        logDebug('Debug mode enabled. Waiting for actions...', 'info');
    } else {
        console.error('Debug panel elements not found!');
    }
}

function logDebug(message, type = 'info') {
    if (!DEBUG_MODE || !debugLog) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="timestamp">${timestamp}</span>: ${message}`;
    
    debugLog.appendChild(entry);

    // Keep only the last 10 log entries
    while (debugLog.children.length > 10) {
        debugLog.removeChild(debugLog.firstChild);
    }
    
    debugLog.scrollTop = debugLog.scrollHeight; // Auto-scroll to bottom
}

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
        
        // Force create location marker after a short delay to ensure map is ready
        setTimeout(() => {
            if (!currentLocationMarker) {
                console.log('🔄 Force creating location marker...');
                updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Error initializing MapTiler:', error);
        mapContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Could not load the map. Please try again later.</p>';
    }
}

// Get current location using Geolocation API
function getCurrentLocation() {
    logDebug('--- Location Request ---', 'title');
    logDebug('Requesting user location...', 'info');
    
    if (navigator.geolocation) {
        // Show user we're requesting location
        showToast('📍 Location', 'Requesting your location...');
        
        // Request location with high accuracy and timeout
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                logDebug(`Location received: [${userLocation.lat}, ${userLocation.lng}]`, 'success');
                logDebug(`Accuracy: ${position.coords.accuracy}m`, 'info');
                
                updateCurrentLocationMarker([userLocation.lat, userLocation.lng]);
                map.setView([userLocation.lat, userLocation.lng], 16);
                
                showToast('📍 Location Found', `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
            },
            (error) => {
                logDebug(`Location error: ${error.message} (Code: ${error.code})`, 'error');
                
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        showToast('❌ Location Denied', 'Please enable location access in your browser settings');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        showToast('❌ Location Unavailable', 'Your location could not be determined');
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        showToast('⏰ Location Timeout', 'Location request took too long');
                        break;
                    default:
                        errorMessage = 'Unknown location error';
                        showToast('❌ Location Error', 'Could not get your location');
                        break;
                }
                
                console.warn(errorMessage);
                logDebug('Using default Barcelona location as fallback', 'warning');
                updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
                showToast('📍 Default Location', 'Using Barcelona center as default');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        logDebug('Geolocation not supported by browser', 'error');
        console.error("Geolocation is not supported by this browser.");
        updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
        showToast('❌ Geolocation Unsupported', 'Your browser does not support location services');
    }
}

// Update or create the marker for the user's current location
function updateCurrentLocationMarker(latlng) {
    // Remove existing marker if it exists
    if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
    }
    
    // Remove any backup DOM indicators
    const existingIndicator = document.getElementById('backup-location-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create a stable, fixed green dot icon
    const greenDotIcon = L.divIcon({
        className: 'green-location-dot',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html: '<div class="location-dot-inner"></div>'
    });
    
    // Create a regular marker with the green dot icon
    currentLocationMarker = L.marker(latlng, {
        icon: greenDotIcon,
        zIndexOffset: 1000
    }).addTo(map);
    
    // Add popup
    currentLocationMarker.bindPopup("<b>📍 You are here!</b>");
    
    console.log('✅ Current location marker created (stable dot):', latlng, currentLocationMarker);
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
            <button class="route-button emergency-route" onclick="createRoute(${place.lat}, ${place.lng}, '${place.name}')">
                🚗 Route Here
            </button>
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
    
    popupContent += `
            <button class="route-button safe-route" onclick="createRoute(${place.lat}, ${place.lng}, '${place.name}')">
                🚗 Route Here
            </button>
        </div>`;
    
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
    logDebug('--- Share Location Clicked ---', 'title');
    
    if (currentLocationMarker) {
        const latlng = currentLocationMarker.getLatLng();
        const lat = latlng.lat.toFixed(6);
        const lng = latlng.lng.toFixed(6);
        
        logDebug(`Sharing location: [${lat}, ${lng}]`, 'info');
        
        // Create location sharing options
        showLocationSharingOptions(lat, lng);
        
    } else {
        showToast('📍 Getting Location', 'Please wait while we get your current location...');
        logDebug('No location marker found, getting fresh location for sharing...', 'info');
        
        // Get current location first, then share
        getCurrentLocationForSharing();
    }
}

// Get current location specifically for sharing
function getCurrentLocationForSharing() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                
                logDebug(`Fresh location for sharing: [${lat}, ${lng}]`, 'success');
                updateCurrentLocationMarker([position.coords.latitude, position.coords.longitude]);
                
                // Show sharing options with fresh location
                showLocationSharingOptions(lat, lng);
            },
            (error) => {
                logDebug(`Location error for sharing: ${error.message}`, 'error');
                showToast('❌ Location Error', 'Could not get your current location for sharing');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    }
}

// Show location sharing options modal
function showLocationSharingOptions(lat, lng) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Sofia Sans', sans-serif;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--grey-900);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-xl);
        max-width: 350px;
        width: 90%;
        text-align: center;
        border: 1px solid var(--grey-700);
    `;
    
    // Google Maps link
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    
    // Create emergency message
    const emergencyMessage = `🚨 EMERGENCY LOCATION SHARE 🚨
I'm sharing my current location for safety reasons.
Please check on me!

📍 My Location:
https://maps.google.com/?q=${lat},${lng}

Coordinates: ${lat}, ${lng}
Shared at: ${new Date().toLocaleString()}`;
    
    // WhatsApp URLs
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(emergencyMessage)}`;
    const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(emergencyMessage)}`;
    
    modalContent.innerHTML = `
        <h3 style="color: var(--white); margin-bottom: var(--spacing-lg);">
            📍 Share Your Location
        </h3>
        <p style="color: var(--grey-300); margin-bottom: var(--spacing-lg); font-size: 14px;">
            Your coordinates: ${lat}, ${lng}
        </p>
        
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <button id="shareWhatsApp" style="
                background: #25D366;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fab fa-whatsapp"></i>
                Share via WhatsApp
            </button>
            
            <button id="shareWhatsAppWeb" style="
                background: #128C7E;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fab fa-whatsapp"></i>
                Share via WhatsApp Web
            </button>
            
            <button id="copyLocation" style="
                background: var(--tertiary-400);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fas fa-copy"></i>
                Copy Location Text
            </button>
            
            <button id="openMaps" style="
                background: var(--secondary-400);
                color: var(--black);
                border: none;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fas fa-map"></i>
                Open in Google Maps
            </button>
        </div>
        
        <button id="closeModal" style="
            background: transparent;
            color: var(--grey-500);
            border: none;
            margin-top: var(--spacing-lg);
            cursor: pointer;
            font-size: 14px;
        ">
            Cancel
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('shareWhatsApp').onclick = () => {
        logDebug('Opening WhatsApp mobile app...', 'info');
        window.open(whatsappUrl, '_blank');
        document.body.removeChild(modal);
        showToast('📱 WhatsApp', 'Opening WhatsApp with your location...');
    };
    
    document.getElementById('shareWhatsAppWeb').onclick = () => {
        logDebug('Opening WhatsApp Web...', 'info');
        window.open(whatsappWebUrl, '_blank');
        document.body.removeChild(modal);
        showToast('� WhatsApp Web', 'Opening WhatsApp Web with your location...');
    };
    
    document.getElementById('copyLocation').onclick = () => {
        navigator.clipboard.writeText(emergencyMessage).then(() => {
            logDebug('Location message copied to clipboard', 'success');
            showToast('📋 Copied', 'Emergency location message copied to clipboard!');
        }).catch(() => {
            logDebug('Failed to copy to clipboard', 'error');
            showToast('❌ Copy Failed', 'Could not copy to clipboard');
        });
        document.body.removeChild(modal);
    };
    
    document.getElementById('openMaps').onclick = () => {
        logDebug('Opening Google Maps...', 'info');
        window.open(googleMapsUrl, '_blank');
        document.body.removeChild(modal);
        showToast('🗺️ Maps', 'Opening your location in Google Maps...');
    };
    
    document.getElementById('closeModal').onclick = () => {
        document.body.removeChild(modal);
        logDebug('Location sharing cancelled', 'info');
    };
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            logDebug('Location sharing cancelled (clicked outside)', 'info');
        }
    };
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
    logDebug('--- Center Location Clicked ---', 'title');
    
    if (currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 16);
        showToast('🎯 Location', 'Centered on your location');
        logDebug('Centered on existing location marker', 'info');
    } else {
        logDebug('No location marker found, requesting fresh location...', 'info');
        showToast('🎯 Location', 'Getting your current location...');
        
        // Request fresh location
        getCurrentLocation();
    }
}

function handleSearch() {
    const destination = document.getElementById('destinationInput').value.trim();
    if (destination) {
        showToast('🔍 Search', `Searching for: ${destination}`);
        logDebug(`--- Address Search ---`, 'title');
        logDebug(`Searching for address: ${destination}`, 'info');
        
        // Use geocoding to find the location
        geocodeAddress(destination);
    } else {
        showToast('🔍 Search', 'Please enter a destination');
    }
}

// Geocode address using MapTiler Geocoding API
async function geocodeAddress(address) {
    try {
        logDebug('Starting geocoding...', 'info');
        const geocodeUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_API_KEY}&proximity=${BARCELONA_CENTER.lng},${BARCELONA_CENTER.lat}&limit=5`;
        logDebug(`Geocoding URL: ${geocodeUrl}`, 'info');
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
            const errorData = await response.text();
            logDebug(`Geocoding API Error: HTTP ${response.status}. ${errorData}`, 'error');
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        logDebug(`Geocoding response received with ${data.features?.length || 0} results`, 'info');
        
        if (data.features && data.features.length > 0) {
            const feature = data.features[0]; // Take the first/best result
            const coordinates = feature.geometry.coordinates; // [lng, lat]
            const placeName = feature.place_name || feature.text || address;
            
            logDebug(`Found location: ${placeName} at [${coordinates[1]}, ${coordinates[0]}]`, 'success');
            
            showToast('� Location Found', `Creating route to: ${placeName}`);
            
            // Create route to the found location
            createRoute(coordinates[1], coordinates[0], placeName);
            
            // Clear the search input
            document.getElementById('destinationInput').value = '';
            
        } else {
            logDebug('No results found for address', 'warning');
            showToast('❌ Not Found', `Could not find: ${address}`);
        }
        
    } catch (error) {
        logDebug(`Geocoding failed: ${error.message}`, 'error');
        showToast('❌ Search Error', `Could not search for: ${address}`);
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

// ==================== ROUTING FUNCTIONALITY ====================

// Main route creation function
async function createRoute(destLat, destLng, placeName) {
    logDebug(`--- New Route Request ---`, 'title');
    logDebug(`Creating route to ${placeName} (${destLat}, ${destLng})`, 'info');
    
    if (!currentLocationMarker) {
        showToast('❌ Location Error', 'Current location not available. Please enable location services.');
        logDebug('No current location marker found.', 'error');
        return;
    }
    
    try {
        const start = currentLocationMarker.getLatLng();
        const end = { lat: destLat, lng: destLng };
        
        showToast('🗺️ Routing', `Calculating route to ${placeName}...`);
        
        // Clear any existing route
        if (currentRoute) {
            map.removeLayer(currentRoute);
        }
        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }

        // Try different routing services in order
        let routeSuccess = false;
        
        // Method 1: Try MapTiler routing
        logDebug('Trying MapTiler routing...', 'info');
        try {
            routeSuccess = await tryMapTilerRouting(start, end, placeName);
            if (routeSuccess) {
                logDebug('MapTiler routing succeeded.', 'success');
            } else {
                logDebug('MapTiler returned no route.', 'warning');
            }
        } catch (error) {
            logDebug(`MapTiler routing failed: ${error.message}`, 'error');
            showToast('⚠️ MapTiler Failed', 'Trying fallback service...');
        }
        
        // Method 2: Try OpenRouteService as fallback
        if (!routeSuccess) {
            logDebug('Trying OpenRouteService routing...', 'info');
            try {
                routeSuccess = await tryOpenRouteService(start, end, placeName);
                if (routeSuccess) {
                    logDebug('OpenRouteService routing succeeded.', 'success');
                } else {
                    logDebug('OpenRouteService returned no route.', 'warning');
                }
            } catch (error) {
                logDebug(`OpenRouteService routing failed: ${error.message}`, 'error');
                showToast('⚠️ ORS Failed', 'Trying next fallback...');
            }
        }
        
        // Method 3: Try GraphHopper as a new fallback
        if (!routeSuccess) {
            logDebug('Trying GraphHopper routing...', 'info');
            try {
                routeSuccess = await tryGraphHopperRouting(start, end, placeName);
                if (routeSuccess) {
                    logDebug('GraphHopper routing succeeded.', 'success');
                } else {
                    logDebug('GraphHopper returned no route.', 'warning');
                }
            } catch (error) {
                logDebug(`GraphHopper routing failed: ${error.message}`, 'error');
                showToast('⚠️ GraphHopper Failed', 'Trying final fallback...');
            }
        }
        
        // Method 4: Try OSRM as HTTP-friendly fallback (before straight line)
        if (!routeSuccess) {
            logDebug('Trying OSRM routing (HTTP-friendly)...', 'info');
            try {
                routeSuccess = await tryOSRMRouting(start, end, placeName);
                if (routeSuccess) {
                    logDebug('OSRM routing succeeded.', 'success');
                } else {
                    logDebug('OSRM returned no route.', 'warning');
                }
            } catch (error) {
                logDebug(`OSRM routing failed: ${error.message}`, 'error');
                showToast('⚠️ OSRM Failed', 'Trying final fallback...');
            }
        }
        
        // Method 5: Simple straight-line route as final fallback
        if (!routeSuccess) {
            logDebug('Creating straight-line route as fallback.', 'warning');
            showToast('⚠️ Fallback Route', 'Could not find road route. Showing straight line.');
            routeSuccess = createStraightLineRoute(start, end, placeName);
        }
        
        if (routeSuccess) {
            logDebug('Route successfully displayed on map.', 'success');
        } else {
            logDebug('All routing methods failed.', 'error');
            showToast('❌ Routing Failed', 'Could not calculate any route.');
        }
        
    } catch (error) {
        logDebug(`Unhandled error in createRoute: ${error.message}`, 'error');
        showToast('❌ Route Error', `Routing failed: ${error.message}`);
    }
}

// Try MapTiler routing API for road-based navigation
async function tryMapTilerRouting(start, end, placeName) {
    // MapTiler should work on HTTP, but let's add debugging
    const isSecure = location.protocol === 'https:';
    logDebug(`MapTiler: Running on ${location.protocol} (HTTPS: ${isSecure})`, 'info');
    
    // Use the 'walking' profile for pedestrian-focused routing
    const routeUrl = `https://api.maptiler.com/directions/walking/${start.lng},${start.lat};${end.lng},${end.lat}?key=${MAPTILER_API_KEY}&geometries=geojson&overview=full&steps=true`;
    logDebug(`MapTiler URL: ${routeUrl}`, 'info');
    
    const response = await fetch(routeUrl);
    logDebug(`MapTiler response status: ${response.status}`, 'info');
    
    if (!response.ok) {
        const errorData = await response.text();
        logDebug(`MapTiler API Error: HTTP ${response.status}. ${errorData}`, 'error');
        throw new Error(`MapTiler API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    logDebug('MapTiler response received.', 'info');
    
    if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Handle GeoJSON format geometry
        let routeCoords;
        if (route.geometry && route.geometry.coordinates) {
            // GeoJSON format - coordinates are [lng, lat], need to flip to [lat, lng]
            routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } else {
            throw new Error('Invalid geometry format from MapTiler');
        }
        
        // Create route line on map
        currentRoute = L.polyline(routeCoords, {
            color: '#50F588',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5'
        }).addTo(map);
        
        addDestinationMarker(end, placeName);
        fitMapToRoute(start, end);
        
        const distance = route.distance ? (route.distance / 1000).toFixed(1) : 'Unknown';
        showToast('✅ Route Ready', `${distance}km walking route via MapTiler`);
        return true;
    }
    return false;
}

// Try OpenRouteService as fallback
async function tryOpenRouteService(start, end, placeName) {
    try {
        // Check if we're on HTTPS or localhost - ORS might require it
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        
        if (!isSecure) {
            logDebug('OpenRouteService: Skipping due to HTTP deployment (needs HTTPS)', 'warning');
            throw new Error('OpenRouteService requires HTTPS for production deployment');
        }
        
        // Correctly formatted for OpenRouteService API
        const requestBody = {
            coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
        };
        
        logDebug('OpenRouteService: Sending request...', 'info');
        const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
            method: 'POST',
            headers: {
                'Authorization': '5b3ce3597851110001cf6248d5e3e8ff7b3a42ed1e6e45c2b2dea8e7',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            logDebug(`OpenRouteService API Error: HTTP ${response.status}. ${errorData}`, 'error');
            throw new Error(`OpenRouteService API Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        logDebug('OpenRouteService response received.', 'info');
        
        if (data.features && data.features.length > 0) {
            const route = data.features[0];
            const routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Create route line on map
            currentRoute = L.polyline(routeCoords, {
                color: '#50F588',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
            }).addTo(map);
            
            addDestinationMarker(end, placeName);
            fitMapToRoute(start, end);
            
            const distance = route.properties.segments[0].distance;
            showToast('✅ Route Ready', `${(distance / 1000).toFixed(1)}km walking route via OpenRouteService`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('OpenRouteService failed:', error.message);
        throw error;
    }
}

// Try GraphHopper as a new fallback
async function tryGraphHopperRouting(start, end, placeName) {
    // Check if we're on HTTPS or localhost - GraphHopper might require it
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if (!isSecure) {
        logDebug('GraphHopper: Skipping due to HTTP deployment (needs HTTPS)', 'warning');
        throw new Error('GraphHopper requires HTTPS for production deployment');
    }
    
    const routeUrl = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=foot&calc_points=true&key=${GRAPHHOPPER_API_KEY}`;
    logDebug(`GraphHopper URL: ${routeUrl}`, 'info');

    try {
        const response = await fetch(routeUrl);
        if (!response.ok) {
            const errorData = await response.json();
            logDebug(`GraphHopper API Error: HTTP ${response.status}. ${errorData.message}`, 'error');
            throw new Error(`GraphHopper API Error: ${errorData.message}`);
        }

        const data = await response.json();
        logDebug('GraphHopper response received.', 'info');
        logDebug(`GraphHopper data: ${JSON.stringify(data)}`, 'info');

        if (data.paths && data.paths.length > 0) {
            const path = data.paths[0];
            
            // GraphHopper returns encoded polylines, not direct coordinates
            if (path.points) {
                let routeCoords;
                
                if (path.points_encoded) {
                    // Decode the polyline string
                    logDebug('GraphHopper: Decoding polyline...', 'info');
                    routeCoords = decodePolyline(path.points);
                } else if (path.points.coordinates && Array.isArray(path.points.coordinates)) {
                    // Direct coordinates (backup format)
                    routeCoords = path.points.coordinates.map(coord => [coord[1], coord[0]]);
                } else {
                    throw new Error('Unknown GraphHopper points format');
                }
                
                logDebug(`GraphHopper route coords count: ${routeCoords.length}`, 'info');

                // Create route line on map
                currentRoute = L.polyline(routeCoords, {
                    color: '#50F588',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 5'
                }).addTo(map);

                addDestinationMarker(end, placeName);
                fitMapToRoute(start, end);

                const distance = (path.distance / 1000).toFixed(1);
                showToast('✅ Route Ready', `${distance}km walking route via GraphHopper`);
                logDebug('GraphHopper routing succeeded!', 'success');
                return true;
            } else {
                logDebug('GraphHopper: No points found in response', 'error');
                throw new Error('No route points from GraphHopper');
            }
        }
        return false;
    } catch (error) {
        console.error('GraphHopper failed:', error.message);
        throw error;
    }
}

// Try OSRM as HTTP-friendly fallback routing service
async function tryOSRMRouting(start, end, placeName) {
    // OSRM Demo Server - works with HTTP
    const routeUrl = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    logDebug(`OSRM URL: ${routeUrl}`, 'info');

    try {
        const response = await fetch(routeUrl);
        if (!response.ok) {
            const errorData = await response.text();
            logDebug(`OSRM API Error: HTTP ${response.status}. ${errorData}`, 'error');
            throw new Error(`OSRM API Error: ${response.statusText}`);
        }

        const data = await response.json();
        logDebug('OSRM response received.', 'info');

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            if (route.geometry && route.geometry.coordinates) {
                const routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                logDebug(`OSRM route coords count: ${routeCoords.length}`, 'info');

                // Create route line on map
                currentRoute = L.polyline(routeCoords, {
                    color: '#50F588',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 5'
                }).addTo(map);

                addDestinationMarker(end, placeName);
                fitMapToRoute(start, end);

                const distance = (route.distance / 1000).toFixed(1);
                const duration = Math.round(route.duration / 60);
                showToast('✅ Route Ready', `${distance}km walking route (${duration}min) via OSRM`);
                logDebug('OSRM routing succeeded!', 'success');
                return true;
            } else {
                throw new Error('Invalid geometry format from OSRM');
            }
        }
        return false;
    } catch (error) {
        logDebug(`OSRM failed: ${error.message}`, 'error');
        throw error;
    }
}

// Create simple straight-line route as final fallback
function createStraightLineRoute(start, end, placeName) {
    console.log('📏 Creating straight-line route');
    
    // Create straight line route
    currentRoute = L.polyline([
        [start.lat, start.lng],
        [end.lat, end.lng]
    ], {
        color: '#50F588',
        weight: 4,
        opacity: 0.6,
        dashArray: '15, 10'
    }).addTo(map);
    
    addDestinationMarker(end, placeName);
    fitMapToRoute(start, end);
    
    // Calculate approximate distance
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    showToast('⚠️ Direct Route', `${distance.toFixed(1)}km straight-line route`);
    return true;
}

// Helper functions for routing
function addDestinationMarker(end, placeName) {
    destinationMarker = L.marker([end.lat, end.lng], {
        icon: L.divIcon({
            html: '<i class="fas fa-map-marker-alt" style="color: #50F588; font-size: 20px;"></i>',
            className: 'custom-map-icon destination-marker',
            iconSize: [24, 24]
        })
    }).addTo(map).bindPopup(`📍 ${placeName}`);
}

function fitMapToRoute(start, end) {
    const bounds = L.latLngBounds([
        [start.lat, start.lng],
        [end.lat, end.lng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
}

function clearRoute() {
    if (currentRoute) {
        map.removeLayer(currentRoute);
        currentRoute = null;
    }
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }
    
    showToast('🗺️ Route Cleared', 'Route has been removed from the map');
}

// Distance calculation function
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Decode polyline geometry (simplified version)
function decodePolyline(encoded) {
    const coords = [];
    let index = 0, lat = 0, lng = 0;
    
    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        
        coords.push([lat / 1e5, lng / 1e5]);
    }
    
    return coords;
}

// ==================== END ROUTING FUNCTIONALITY ====================

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
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initDebug();
});