const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/routing_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Schemas
const driverSchema = new mongoose.Schema({
    name: String,
    phone: String,
    isActive: { type: Boolean, default: false },
    currentRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' }
});

const stopSchema = new mongoose.Schema({
    address: String,
    lat: Number,
    lng: Number,
    sequenceOrder: Number,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: Date
});

const routeSchema = new mongoose.Schema({
    name: String,
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    stops: [stopSchema],
    status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    totalDistance: String,
    estimatedTime: String
});

const locationSchema = new mongoose.Schema({
    driverId: { type: String, required: true }, // Change to String for easier tracking
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema)

const Driver = mongoose.model('Driver', driverSchema);
const Route = mongoose.model('Route', routeSchema);

// Socket.IO for real-time tracking
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Driver sends location update
    socket.on('location-update', async (data) => {
        try {
            const { driverId, lat, lng } = data;

            // Save location to database
            const location = new Location({
                driverId,
                lat,
                lng
            });
            await location.save();

            // Update driver status
            await Driver.findByIdAndUpdate(driverId, { isActive: true });

            // Broadcast to all dispatcher dashboards
            socket.broadcast.emit('driver-location', {
                driverId,
                lat,
                lng,
                timestamp: new Date()
            });

            console.log(`Location updated for driver ${driverId}:`, lat, lng);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    });

    // Driver updates stop status
    socket.on('stop-completed', async (data) => {
        try {
            const { routeId, stopIndex } = data;

            const route = await Route.findById(routeId);
            if (route && route.stops[stopIndex]) {
                route.stops[stopIndex].status = 'completed';
                route.stops[stopIndex].completedAt = new Date();
                await route.save();

                // Broadcast to dispatchers
                socket.broadcast.emit('stop-update', {
                    routeId,
                    stopIndex,
                    status: 'completed'
                });
            }
        } catch (error) {
            console.error('Error updating stop:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Routes

// Dashboard - Main dispatcher view
app.get('/', async (req, res) => {
    try {
        const routes = await Route.find().populate('driver');
        const drivers = await Driver.find();
        res.render('dashboard', { routes, drivers });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Create new route page
app.get('/create-route', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.render('create-route', { drivers });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Handle route creation
app.post('/api/routes', async (req, res) => {
    try {
        const { name, driverId, addresses } = req.body;

        // Geocode addresses (simplified - you'd use Google Maps API)
        const stops = addresses.map((address, index) => ({
            address: address,
            lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            sequenceOrder: index,
            status: 'pending'
        }));

        const route = new Route({
            name,
            driver: driverId,
            stops,
            totalDistance: '25.4 miles', // Mock data
            estimatedTime: '2h 15m'
        });

        await route.save();

        // Assign route to driver
        await Driver.findByIdAndUpdate(driverId, { currentRoute: route._id });

        res.redirect('/');
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).send('Server Error');
    }
});

// Driver management
app.get('/drivers', async (req, res) => {
    try {
        const drivers = await Driver.find().populate('currentRoute');
        res.render('drivers', { drivers });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.post('/api/drivers', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const driver = new Driver({ name, phone });
        await driver.save();
        res.redirect('/drivers');
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// API for mobile app

// Get driver's assigned route
app.get('/api/driver/:id/route', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate('currentRoute');
        if (!driver || !driver.currentRoute) {
            return res.json({ route: null });
        }
        res.json({ route: driver.currentRoute });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update stop status
app.post('/api/routes/:routeId/stops/:stopIndex/complete', async (req, res) => {
    try {
        const { routeId, stopIndex } = req.params;

        const route = await Route.findById(routeId);
        if (route && route.stops[stopIndex]) {
            route.stops[stopIndex].status = 'completed';
            route.stops[stopIndex].completedAt = new Date();
            await route.save();

            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Route or stop not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

/// Replace the existing location tracking parts in your server.js with these fixes:

// Updated Location Schema (add this after your existing schemas)


// Updated Socket.IO location handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Driver sends location update
    socket.on('location-update', async (data) => {
        try {
            const { driverId, lat, lng } = data;

            console.log(`Received location update from driver ${driverId}:`, { lat, lng });

            // Validate coordinates
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                console.error('Invalid coordinates received:', { lat, lng });
                return;
            }

            // Save location to database
            const location = new Location({
                driverId: driverId.toString(),
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            });

            await location.save();
            console.log('Location saved to database');

            // Update driver status
            await Driver.findByIdAndUpdate(driverId, { isActive: true });

            // Broadcast to all dispatcher dashboards
            socket.broadcast.emit('driver-location', {
                driverId,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timestamp: new Date()
            });

            console.log(`Location broadcasted for driver ${driverId}`);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    });

    // Rest of your socket handlers remain the same...
});

// Fixed API endpoint for getting live locations
app.get('/api/locations', async (req, res) => {
    try {
        console.log('Fetching driver locations...');

        // Method 1: Get latest location for each driver using aggregation
        const locations = await Location.aggregate([
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: '$driverId',
                    lat: { $first: '$lat' },
                    lng: { $first: '$lng' },
                    timestamp: { $first: '$timestamp' }
                }
            },
            {
                $match: {
                    lat: { $exists: true, $ne: null },
                    lng: { $exists: true, $ne: null }
                }
            }
        ]);

        console.log(`Found ${locations.length} driver locations`);

        // Alternative Method 2: If aggregation doesn't work, use this simpler approach
        // const uniqueDriverIds = await Location.distinct('driverId');
        // const locations = [];
        //
        // for (const driverId of uniqueDriverIds) {
        //     const latestLocation = await Location.findOne({ driverId })
        //         .sort({ timestamp: -1 })
        //         .lean();
        //
        //     if (latestLocation && latestLocation.lat && latestLocation.lng) {
        //         locations.push({
        //             _id: latestLocation.driverId,
        //             lat: latestLocation.lat,
        //             lng: latestLocation.lng,
        //             timestamp: latestLocation.timestamp
        //         });
        //     }
        // }

        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
});

// Add a test endpoint to manually add a location (for debugging)
app.post('/api/test-location', async (req, res) => {
    try {
        const { driverId, lat, lng } = req.body;

        const location = new Location({
            driverId: driverId || 'test-driver',
            lat: lat || 40.7128,
            lng: lng || -74.0060
        });

        await location.save();

        res.json({ success: true, location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add endpoint to get all locations for debugging
app.get('/api/locations/all', async (req, res) => {
    try {
        const allLocations = await Location.find().sort({ timestamp: -1 }).limit(50);
        res.json(allLocations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Make sure MongoDB is running on localhost:27017');
});