// Map functionality for LINA Safety App using MapTiler
let map;
let currentLocationMarker;
let safePlacesMarkers = [];
let currentRoute = null;
let destinationMarker = null;
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
        // Force create location marker if it doesn't exist
        console.log('🔄 No location marker found, creating one...');
        getCurrentLocation();
        // Also force create at Barcelona center as backup
        setTimeout(() => {
            if (!currentLocationMarker) {
                updateCurrentLocationMarker([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]);
                map.setView([BARCELONA_CENTER.lat, BARCELONA_CENTER.lng], 16);
                showToast('📍 Location', 'Location marker created at Barcelona center');
            }
        }, 500);
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

// ==================== ROUTING FUNCTIONALITY ====================

// Main route creation function
async function createRoute(destLat, destLng, placeName) {
    console.log(`🚗 Creating route to ${placeName} (${destLat}, ${destLng})`);
    
    if (!currentLocationMarker) {
        showToast('❌ Location Error', 'Current location not available. Please enable location services.');
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
        try {
            routeSuccess = await tryMapTilerRouting(start, end, placeName);
        } catch (error) {
            console.log('MapTiler routing failed:', error.message);
        }
        
        // Method 2: Try OpenRouteService as fallback
        if (!routeSuccess) {
            try {
                routeSuccess = await tryOpenRouteService(start, end, placeName);
            } catch (error) {
                console.log('OpenRouteService routing failed:', error.message);
            }
        }
        
        // Method 3: Simple straight-line route as final fallback
        if (!routeSuccess) {
            routeSuccess = createStraightLineRoute(start, end, placeName);
        }
        
        if (routeSuccess) {
            // Show clear route button if not already visible
            showClearRouteButton();
        }
        
    } catch (error) {
        console.error('❌ Route creation failed:', error);
        showToast('❌ Route Error', `Routing failed: ${error.message}`);
    }
}

// Try MapTiler routing API for road-based navigation
async function tryMapTilerRouting(start, end, placeName) {
    const routeUrl = `https://api.maptiler.com/directions/driving/${start.lng},${start.lat};${end.lng},${end.lat}?key=${MAPTILER_API_KEY}&geometries=geojson&overview=full&steps=true`;
    console.log('📡 MapTiler API URL:', routeUrl);
    
    const response = await fetch(routeUrl);
    
    if (!response.ok) {
        const errorData = await response.text();
        console.log('MapTiler API Error:', errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 MapTiler response:', data);
    
    if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Handle GeoJSON format geometry
        let routeCoords;
        if (route.geometry && route.geometry.coordinates) {
            // GeoJSON format - coordinates are [lng, lat], need to flip to [lat, lng]
            routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } else if (route.geometry && typeof route.geometry === 'string') {
            // Polyline encoded format
            routeCoords = decodePolyline(route.geometry);
        } else {
            throw new Error('Invalid geometry format');
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
        
        const distance = route.distance ? Math.round(route.distance/1000) : 'Unknown';
        showToast('✅ Route Ready', `${distance}km route via MapTiler`);
        return true;
    }
    return false;
}

// Try OpenRouteService as fallback
async function tryOpenRouteService(start, end, placeName) {
    try {
        const requestBody = {
            coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
        };
        
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
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
            console.log('OpenRouteService API Error:', errorData);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 OpenRouteService response:', data);
        
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
            showToast('✅ Route Ready', `${Math.round(distance/1000)}km route via OpenRouteService`);
            return true;
        }
        return false;
    } catch (error) {
        console.log('OpenRouteService failed:', error.message);
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

function showClearRouteButton() {
    // Create or show clear route button
    let clearBtn = document.getElementById('clearRouteBtn');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.id = 'clearRouteBtn';
        clearBtn.innerHTML = '❌ Clear Route';
        clearBtn.style.cssText = `
            position: fixed;
            bottom: 160px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--danger-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            font-weight: 600;
            z-index: 1000;
            cursor: pointer;
        `;
        clearBtn.onclick = clearRoute;
        document.body.appendChild(clearBtn);
    }
    clearBtn.style.display = 'block';
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
    
    const clearBtn = document.getElementById('clearRouteBtn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
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
document.addEventListener('DOMContentLoaded', initMap);