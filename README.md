# Routing & Dispatching Application

A complete MERN stack application with EJS templating for routing optimization and real-time driver tracking using Socket.IO.

## 🚀 Features

### Dispatcher Dashboard
- **Route Creation**: Add stops, assign drivers, auto-optimize route order
- **Live Tracking**: Real-time driver location tracking on map
- **Driver Management**: Add/manage drivers and their status
- **Route Monitoring**: Track route progress and stop completions

### Driver Mobile App
- **Route Display**: View assigned stops in optimized order
- **GPS Tracking**: Automatically send location updates
- **Stop Management**: Mark stops as complete
- **Navigation Integration**: Quick access to turn-by-turn directions

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templating engine
- **Real-time**: Socket.IO for live tracking
- **Mobile**: HTML5 responsive design (React Native ready)
- **Styling**: Bootstrap 5

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- NPM or Yarn

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd routing-dispatch-app
npm install
```

### 2. Database Setup
Make sure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in server.js
```

### 3. Environment Setup
Create a `.env` file (optional):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/routing_app
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Access the Application
- **Dispatcher Dashboard**: http://localhost:3000
- **Driver Mobile Demo**: http://localhost:3000/mobile-demo.html

## 📁 Project Structure

```
routing-dispatch-app/
├── server.js              # Main server file
├── package.json           # Dependencies
├── views/                 # EJS templates
│   ├── dashboard.ejs      # Main dispatcher dashboard
│   ├── create-route.ejs   # Route creation page
│   └── drivers.ejs        # Driver management
├── public/               # Static files
│   └── mobile-demo.html  # Driver app demo
└── README.md            # This file
```

## 🔧 Key API Endpoints

### Routes
- `GET /` - Dispatcher dashboard
- `GET /create-route` - Route creation page
- `POST /api/routes` - Create new route
- `GET /drivers` - Driver management page
- `POST /api/drivers` - Add new driver

### Mobile API
- `GET /api/driver/:id/route` - Get driver's assigned route
- `POST /api/routes/:routeId/stops/:stopIndex/complete` - Mark stop complete
- `GET /api/locations` - Get current driver locations

### Socket.IO Events
- `location-update` - Driver sends GPS coordinates
- `stop-completed` - Driver marks stop as complete
- `driver-location` - Broadcast driver location to dashboards
- `stop-update` - Broadcast stop status changes

## 💾 Database Schema

### Drivers
```javascript
{
  name: String,
  phone: String,
  isActive: Boolean,
  currentRoute: ObjectId
}
```

### Routes
```javascript
{
  name: String,
  driver: ObjectId,
  stops: [{
    address: String,
    lat: Number,
    lng: Number,
    sequenceOrder: Number,
    status: String, // 'pending' or 'completed'
    completedAt: Date
  }],
  status: String, // 'active', 'completed', 'pending'
  totalDistance: String,
  estimatedTime: String
}
```

### Locations
```javascript
{
  driverId: ObjectId,
  lat: Number,
  lng: Number,
  timestamp: Date
}
```

## 🗺️ Integration with Google Maps

To add real Google Maps functionality:

1. Get Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
    - Maps JavaScript API
    - Geocoding API
    - Directions API
3. Replace mock map code in dashboard.ejs:

```javascript
// Replace mock map with real Google Maps
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 40.7128, lng: -74.0060 }
  });
}
```

4. Add geocoding for address conversion:

```javascript
// In server.js - replace mock geocoding
const geocoder = new googleMaps.Geocoder();
const results = await geocoder.geocode(address);
```

## 📱 Mobile App Development

The current mobile demo is HTML5-based. For native mobile apps:

### React Native Setup
```bash
npx react-native init DriverApp
cd DriverApp
npm install @react-native-community/geolocation socket.io-client
```

### Key Mobile Features to Implement
- **GPS Tracking**: Use `@react-native-community/geolocation`
- **Push Notifications**: For new route assignments
- **Offline Support**: Cache routes for poor connectivity
- **Background Location**: Continue tracking when app is backgrounded

## 🔄 Workflow

1. **Dispatcher** creates route with multiple stops
2. **System** geocodes addresses and optimizes stop order
3. **Driver** receives optimized route on mobile app
4. **Driver** follows route, marking stops complete
5. **Dispatcher** monitors progress in real-time
6. **System** updates ETA and sends notifications

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/routing_app
GOOGLE_MAPS_API_KEY=your_production_api_key
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS**: EC2 + DocumentDB
- **Digital Ocean**: Droplets + managed databases
- **Vercel**: Serverless functions + MongoDB Atlas

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Make sure MongoDB is running
   sudo systemctl start mongod
   ```

2. **Socket.IO Connection Issues**
    - Check firewall settings
    - Verify port 3000 is accessible
    - Check browser console for errors

3. **Mobile Demo Not Loading**
    - Access via http://localhost:3000/mobile-demo.html
    - Check that static files are being served

## 🎯 Next Steps (Post-MVP)

### Phase 2 Features
- [ ] Google Maps integration for real routing
- [ ] SMS notifications to drivers
- [ ] Proof of delivery (photos, signatures)
- [ ] Driver performance analytics
- [ ] Multi-vehicle optimization
- [ ] Customer notifications and tracking

### Phase 3 Features
- [ ] AI-powered route optimization
- [ ] Traffic and weather integration
- [ ] Capacity and weight constraints
- [ ] Mobile app with React Native
- [ ] Admin user management
- [ ] API rate limiting and authentication

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify MongoDB connection
-   
- Test Socket.IO connection in browser dev tools
- Check that all dependencies are installed correctly

---

**Ready to route and track! 🚛📍**
