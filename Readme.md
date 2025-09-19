# LINA-SARA 🌸

**L**ocation **I**ntelligent **N**avigation **A**ssistant - **S**afety **A**nd **R**each **A**ssistance

A women's safety mobile application designed to provide secure navigation, emergency assistance, and access to safe places in Barcelona.

## 📱 Features

### 🚨 Emergency Functions
- **SOS Button**: One-tap emergency alert system
- **Share Location**: Instantly share your location with trusted contacts
- **Fake Call**: Simulate incoming calls for safety exits
- **Make Noise**: Attract attention in dangerous situations

### 🗺️ Smart Navigation
- **Real-time Map**: Dark-themed MapTiler integration with Barcelona focus
- **Safe Places Network**: Curated list of emergency services and safe venues
- **Location Tracking**: GPS-based current location with pulsing indicator

### 🏢 Safe Places Database
#### Emergency Services (Priority Markers)
- Police Stations
- Hospitals & Clinics  
- 24h Pharmacies
- Fire Stations
- Transport Hubs

#### Community Safe Spaces
- 24h Markets & Services
- Women's Support Cooperatives
- Historic & Established Bars
- Craft Beer & Wine Venues
- Hotel Bars & Upscale Locations

## 🎨 Design

- **Mobile-First**: iPhone-style interface (375×812px)
- **Dark Mode**: Eye-friendly dark theme throughout
- **Minimalistic**: Clean, distraction-free design
- **Accessibility**: High contrast colors and clear typography

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: MapTiler API with Leaflet.js
- **Styling**: CSS Custom Properties & Variables
- **Icons**: Font Awesome
- **Typography**: Sofia Sans font family

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for map tiles
- Location services enabled (optional, for GPS features)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ogabeek/LINA-SARA.git
   cd LINA-SARA
   ```

2. Start a local development server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## 📂 Project Structure

```
LINA-SARA/
├── index.html              # Main app interface
├── script.js               # Core JavaScript functionality
├── styles.css              # Main styling
├── variables.css           # Design system variables
├── safe_places.csv         # Safe places database
├── Project_description.md  # Original project specification
└── Archive/               # Archived design tokens
```

## 🎯 Core Components

### Map Integration
- **MapTiler Streets Dark**: Professional dark-themed map tiles
- **Real-time Geolocation**: GPS-based user positioning
- **Interactive Markers**: Two-tier marker system for different place types

### Safety Features
- **Floating Action Buttons**: Quick access to emergency functions
- **Visual Feedback**: Animations and toast notifications
- **Progressive Enhancement**: Works without location services

### Data Management
- **CSV Integration**: Safe places imported from structured data
- **Smart Popups**: Context-aware information display
- **Category System**: Color-coded venue classification

## 🎨 Color Palette

### Primary (Pink/Red)
- `#FBCFD3` to `#2A0208` - Emergency & SOS functions

### Secondary (Green) 
- `#50F588` to `#021507` - Success states & confirmations

### Tertiary (Blue)
- `#BBDEFA` to `#03131C` - Safe places & navigation

### Quaternary (Gray/Brown)
- `#DBD8D9` to `#131010` - UI backgrounds & text

## 📍 Location Data

The app includes curated safe places across Barcelona neighborhoods:
- **Ciutat Vella**: Historic center with emergency services
- **Eixample**: Upscale venues and established businesses  
- **El Raval**: Community spaces and cultural venues
- **El Born**: Trendy bars and social spaces
- **Gothic Quarter**: Historic venues and tourist-safe areas

## 🔒 Privacy & Security

- **No Data Collection**: All location data stays local
- **Emergency Focus**: Designed for crisis situations
- **Offline Capable**: Core features work without internet
- **Privacy First**: No user tracking or analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for educational and safety purposes. Please ensure compliance with local emergency service protocols when implementing emergency features.

## 🙏 Acknowledgments

- **MapTiler** for professional map tiles
- **Font Awesome** for iconography
- **Leaflet.js** for mapping functionality
- **Barcelona Safe Spaces** community for venue curation

---

**⚠️ Important Safety Notice**: This app is designed to supplement, not replace, official emergency services. In real emergencies, always contact local emergency numbers (112 in Spain) directly.

## 🔗 Live Demo

Visit the deployed application: [LINA-SARA Live Demo](https://ogabeek.github.io/LINA-SARA/)

*Built with ❤️ for women's safety and empowerment*
