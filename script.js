// CityBus Progressive Web App
class CityBusApp {
    constructor() {
        // Immediately hide loading overlay
        this.hideLoading();
        
        this.data = {
            stops: [
                {
                    id: "stop_001",
                    name: "Central Market",
                    lat: 23.2599,
                    lng: 77.4126,
                    routes: ["15", "7A", "22"],
                    distance: 0.2
                },
                {
                    id: "stop_002", 
                    name: "Railway Station",
                    lat: 23.2650,
                    lng: 77.4200,
                    routes: ["15", "18", "3B"],
                    distance: 0.5
                },
                {
                    id: "stop_003",
                    name: "Hospital Junction", 
                    lat: 23.2700,
                    lng: 77.4300,
                    routes: ["7A", "12", "25"],
                    distance: 0.8
                },
                {
                    id: "stop_004",
                    name: "Medical College",
                    lat: 23.2750,
                    lng: 77.4400, 
                    routes: ["7A", "18"],
                    distance: 1.2
                },
                {
                    id: "stop_005",
                    name: "Industrial Area",
                    lat: 23.2800,
                    lng: 77.4500,
                    routes: ["22", "25"],
                    distance: 2.1
                }
            ],
            routes: [
                {
                    id: "15",
                    name: "Route 15",
                    destination: "Railway Station",
                    color: "#2196F3",
                    frequency: "10-15 min"
                },
                {
                    id: "7A", 
                    name: "Route 7A",
                    destination: "Medical College",
                    color: "#4CAF50",
                    frequency: "15-20 min"
                },
                {
                    id: "22",
                    name: "Route 22", 
                    destination: "Industrial Area",
                    color: "#FF9800",
                    frequency: "20-25 min"
                },
                {
                    id: "18",
                    name: "Route 18",
                    destination: "Medical College", 
                    color: "#9C27B0",
                    frequency: "12-18 min"
                },
                {
                    id: "3B",
                    name: "Route 3B",
                    destination: "City Center",
                    color: "#F44336", 
                    frequency: "25-30 min"
                },
                {
                    id: "12",
                    name: "Route 12",
                    destination: "University",
                    color: "#607D8B",
                    frequency: "20-25 min"
                },
                {
                    id: "25",
                    name: "Route 25",
                    destination: "Airport",
                    color: "#795548",
                    frequency: "30-40 min"
                }
            ],
            buses: [
                {
                    id: "MH01-2847",
                    route: "15", 
                    lat: 23.2620,
                    lng: 77.4150,
                    speed: 25,
                    heading: 45,
                    capacity: 40,
                    occupancy: 28,
                    nextStop: "stop_001",
                    eta: 5,
                    status: "on_time"
                },
                {
                    id: "MH01-1234",
                    route: "7A",
                    lat: 23.2580,
                    lng: 77.4100, 
                    speed: 15,
                    heading: 90,
                    capacity: 35,
                    occupancy: 32,
                    nextStop: "stop_001", 
                    eta: 8,
                    status: "delayed"
                },
                {
                    id: "MH01-5678",
                    route: "22",
                    lat: 23.2720,
                    lng: 77.4250,
                    speed: 30,
                    heading: 180,
                    capacity: 45,
                    occupancy: 15,
                    nextStop: "stop_003",
                    eta: 3,
                    status: "on_time"
                }
            ],
            userLocation: {
                lat: 23.2590,
                lng: 77.4120
            },
            settings: {
                notifications: true,
                language: "en",
                theme: "light",
                updateInterval: 30
            }
        };

        this.currentView = 'home-view';
        this.currentStop = null;
        this.trackingBus = null;
        this.updateInterval = null;
        this.favorites = this.loadFavorites();
        this.isOnline = navigator.onLine;
        this.lastUpdate = new Date();
        
        // Initialize immediately
        this.init();
    }

    init() {
        console.log('Initializing CityBus App...');
        
        try {
            this.setupEventListeners();
            this.setupSearch();
            this.loadSettings();
            this.renderNearbyStops();
            this.renderFavorites();
            this.startRealTimeUpdates();
            this.setupOfflineHandling();
            
            console.log('App initialized successfully');
            
            // Show welcome message after a short delay
            setTimeout(() => {
                this.showToast('Welcome to CityBus!', 'success');
            }, 500);
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showToast('App initialization failed', 'error');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
            loading.style.display = 'none';
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
            loading.style.display = 'flex';
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (view && view !== 'search') {
                    this.showView(view);
                } else if (view === 'search') {
                    this.focusSearch();
                }
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showView('home-view'));
        });

        // Location button
        const locationBtn = document.getElementById('location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Settings
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.updateSetting('notifications', e.target.checked);
            });
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
        }

        const updateInterval = document.getElementById('update-interval');
        if (updateInterval) {
            updateInterval.addEventListener('change', (e) => {
                this.updateSetting('updateInterval', parseInt(e.target.value));
                this.restartUpdates();
            });
        }

        const clearFavorites = document.getElementById('clear-favorites');
        if (clearFavorites) {
            clearFavorites.addEventListener('click', () => {
                this.clearFavorites();
            });
        }

        // Tracking controls
        const stopTrackingBtn = document.getElementById('stop-tracking-btn');
        if (stopTrackingBtn) {
            stopTrackingBtn.addEventListener('click', () => {
                this.stopTracking();
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchClear || !searchResults) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                searchClear.classList.add('visible');
                this.performSearch(query);
            } else {
                searchClear.classList.remove('visible');
                searchResults.classList.add('hidden');
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length > 0) {
                this.performSearch(searchInput.value);
            }
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            searchResults.classList.add('hidden');
            searchInput.focus();
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.classList.add('hidden');
            }
        });
    }

    performSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        // Search stops
        this.data.stops.forEach(stop => {
            if (stop.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'stop',
                    data: stop,
                    title: stop.name,
                    subtitle: `${stop.distance} km • Routes: ${stop.routes.join(', ')}`
                });
            }
        });

        // Search routes
        this.data.routes.forEach(route => {
            if (route.name.toLowerCase().includes(lowerQuery) || 
                route.destination.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'route',
                    data: route,
                    title: `${route.name} - ${route.destination}`,
                    subtitle: `Frequency: ${route.frequency}`
                });
            }
        });

        this.renderSearchResults(results.slice(0, 5));
    }

    renderSearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            container.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="app.selectSearchResult('${result.type}', '${result.data.id}')">
                    <div class="font-semibold">${result.title}</div>
                    <div class="text-sm opacity-50">${result.subtitle}</div>
                </div>
            `).join('');
        }
        
        container.classList.remove('hidden');
    }

    selectSearchResult(type, id) {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        
        if (searchResults) searchResults.classList.add('hidden');
        if (searchInput) searchInput.blur();

        if (type === 'stop') {
            this.showStopDetails(id);
        } else if (type === 'route') {
            const stops = this.data.stops.filter(stop => stop.routes.includes(id));
            if (stops.length > 0) {
                this.showStopDetails(stops[0].id);
            }
        }
    }

    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            }
        });

        this.currentView = viewId;

        // Load view-specific data
        if (viewId === 'settings-view') {
            this.loadSettingsView();
        }
    }

    showStopDetails(stopId) {
        const stop = this.data.stops.find(s => s.id === stopId);
        if (!stop) return;

        this.currentStop = stop;
        
        // Render stop details
        const detailsContainer = document.getElementById('stop-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="stop-info">
                    <h2 class="stop-title">${stop.name}</h2>
                    <p class="stop-subtitle">${stop.distance} km away • ${stop.routes.length} routes</p>
                </div>
            `;
        }

        // Update favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            const isFavorite = this.favorites.includes(stopId);
            favoriteBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
            
            favoriteBtn.onclick = () => this.toggleFavorite(stopId);
        }

        // Render buses for this stop
        this.renderStopBuses(stop);

        this.showView('stop-view');
    }

    renderStopBuses(stop) {
        const busesContainer = document.getElementById('stop-buses');
        if (!busesContainer) return;

        const relevantBuses = this.data.buses.filter(bus => 
            stop.routes.includes(bus.route)
        );

        if (relevantBuses.length === 0) {
            busesContainer.innerHTML = `
                <div class="text-center">
                    <p>No buses currently running on this route</p>
                    <p class="text-sm opacity-50">Check back later or try refreshing</p>
                </div>
            `;
            return;
        }

        busesContainer.innerHTML = relevantBuses.map(bus => {
            const route = this.data.routes.find(r => r.id === bus.route);
            const etaMinutes = Math.max(1, bus.eta + Math.floor(Math.random() * 3) - 1);
            
            return `
                <div class="bus-card fade-in">
                    <div class="bus-header">
                        <div class="bus-route">
                            <span class="route-number" style="background-color: ${route ? route.color : '#666'}">${route ? route.name : bus.route}</span>
                            <span class="route-destination">${route ? route.destination : 'Unknown'}</span>
                        </div>
                        <div class="bus-eta">
                            <div class="eta-time">${etaMinutes} min</div>
                            <div class="eta-label">ETA</div>
                        </div>
                    </div>
                    <div class="bus-details">
                        <span class="bus-status bus-status--${bus.status.replace('_', '-')}">${bus.status.replace('_', ' ')}</span>
                        <span class="bus-capacity">${bus.occupancy}/${bus.capacity} seats</span>
                    </div>
                    <button class="track-button" onclick="app.startTracking('${bus.id}')">
                        Track This Bus
                    </button>
                </div>
            `;
        }).join('');
    }

    startTracking(busId) {
        const bus = this.data.buses.find(b => b.id === busId);
        if (!bus) return;

        this.trackingBus = bus;
        this.renderTrackingView();
        this.showView('tracking-view');
        this.showToast('Now tracking bus ' + bus.id, 'success');

        if (this.data.settings.notifications) {
            this.scheduleArrivalNotification(bus);
        }
    }

    renderTrackingView() {
        if (!this.trackingBus) return;

        const route = this.data.routes.find(r => r.id === this.trackingBus.route);
        const stop = this.data.stops.find(s => s.id === this.trackingBus.nextStop);
        const eta = Math.max(1, this.trackingBus.eta + Math.floor(Math.random() * 2) - 1);

        const trackingInfo = document.getElementById('tracking-info');
        if (trackingInfo) {
            trackingInfo.innerHTML = `
                <div class="tracking-status">
                    <div class="tracking-eta">${eta}</div>
                    <div class="tracking-label">minutes to arrival</div>
                </div>
                <div class="tracking-details">
                    <div class="tracking-detail">
                        <div class="detail-value">${this.trackingBus.id}</div>
                        <div class="detail-label">Bus Number</div>
                    </div>
                    <div class="tracking-detail">
                        <div class="detail-value" style="color: ${route ? route.color : '#666'}">${route ? route.name : this.trackingBus.route}</div>
                        <div class="detail-label">Route</div>
                    </div>
                    <div class="tracking-detail">
                        <div class="detail-value">${this.trackingBus.speed} km/h</div>
                        <div class="detail-label">Speed</div>
                    </div>
                    <div class="tracking-detail">
                        <div class="detail-value">${stop ? stop.name : 'Unknown'}</div>
                        <div class="detail-label">Next Stop</div>
                    </div>
                </div>
            `;
        }

        const trackingMap = document.getElementById('tracking-map');
        if (trackingMap) {
            trackingMap.innerHTML = `
                <div style="text-align: center; color: var(--color-text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    </svg>
                    <p>Live tracking map</p>
                    <p style="font-size: 12px;">Bus location updates every ${this.data.settings.updateInterval} seconds</p>
                </div>
            `;
        }
    }

    stopTracking() {
        this.trackingBus = null;
        this.showView('home-view');
        this.showToast('Stopped tracking bus', 'info');
    }

    scheduleArrivalNotification(bus) {
        setTimeout(() => {
            if (this.trackingBus && this.trackingBus.id === bus.id) {
                this.showToast(`Bus ${bus.id} arriving in 1 minute!`, 'warning');
            }
        }, Math.max(1000, (bus.eta - 1) * 1000));
    }

    toggleFavorite(stopId) {
        const index = this.favorites.indexOf(stopId);
        if (index === -1) {
            this.favorites.push(stopId);
            this.showToast('Added to favorites', 'success');
        } else {
            this.favorites.splice(index, 1);
            this.showToast('Removed from favorites', 'info');
        }
        
        this.saveFavorites();
        this.renderFavorites();
        
        if (this.currentView === 'stop-view' && this.currentStop && this.currentStop.id === stopId) {
            const favoriteBtn = document.getElementById('favorite-btn');
            if (favoriteBtn) {
                const isFavorite = this.favorites.includes(stopId);
                favoriteBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                `;
            }
        }
    }

    renderNearbyStops() {
        const container = document.getElementById('nearby-stops');
        if (!container) return;

        const stops = this.data.stops.sort((a, b) => a.distance - b.distance);

        container.innerHTML = stops.map(stop => `
            <div class="stop-card" onclick="app.showStopDetails('${stop.id}')">
                <div class="stop-card-header">
                    <h3 class="stop-name">${stop.name}</h3>
                    <span class="stop-distance">${stop.distance} km</span>
                </div>
                <div class="stop-routes">
                    ${stop.routes.map(routeId => {
                        const route = this.data.routes.find(r => r.id === routeId);
                        return `<span class="route-badge" style="background-color: ${route ? route.color : '#666'}">${routeId}</span>`;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    renderFavorites() {
        const container = document.getElementById('favorites-list');
        if (!container) return;

        const favoriteStops = this.data.stops.filter(stop => this.favorites.includes(stop.id));

        if (favoriteStops.length === 0) {
            container.innerHTML = `
                <div class="text-center opacity-50">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p>No favorite stops yet</p>
                    <p class="text-sm">Tap the heart icon on any stop to add it here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = favoriteStops.map(stop => `
            <div class="stop-card" onclick="app.showStopDetails('${stop.id}')">
                <div class="stop-card-header">
                    <h3 class="stop-name">${stop.name}</h3>
                    <span class="stop-distance">${stop.distance} km</span>
                </div>
                <div class="stop-routes">
                    ${stop.routes.map(routeId => {
                        const route = this.data.routes.find(r => r.id === routeId);
                        return `<span class="route-badge" style="background-color: ${route ? route.color : '#666'}">${routeId}</span>`;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    getCurrentLocation() {
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.data.userLocation.lat += (Math.random() - 0.5) * 0.001;
            this.data.userLocation.lng += (Math.random() - 0.5) * 0.001;
            
            this.data.stops.forEach(stop => {
                const distance = this.calculateDistance(
                    this.data.userLocation.lat,
                    this.data.userLocation.lng,
                    stop.lat,
                    stop.lng
                );
                stop.distance = parseFloat(distance.toFixed(1));
            });
            
            this.renderNearbyStops();
            this.showToast('Location updated', 'success');
        }, 1000);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    refreshData() {
        this.showLoading();
        
        setTimeout(() => {
            this.data.buses.forEach(bus => {
                bus.eta = Math.max(1, bus.eta + Math.floor(Math.random() * 3) - 1);
                bus.lat += (Math.random() - 0.5) * 0.001;
                bus.lng += (Math.random() - 0.5) * 0.001;
                bus.occupancy = Math.min(bus.capacity, Math.max(0, bus.occupancy + Math.floor(Math.random() * 5) - 2));
            });
            
            this.lastUpdate = new Date();
            this.hideLoading();
            this.renderNearbyStops();
            
            if (this.currentView === 'stop-view' && this.currentStop) {
                this.renderStopBuses(this.currentStop);
            }
            
            if (this.trackingBus) {
                this.renderTrackingView();
            }
            
            this.showToast('Data refreshed', 'success');
        }, 1000);
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.isOnline) {
                this.data.buses.forEach(bus => {
                    if (Math.random() > 0.7) {
                        bus.eta = Math.max(1, bus.eta - 1);
                        if (bus.eta <= 0) {
                            bus.eta = Math.floor(Math.random() * 15) + 5;
                        }
                    }
                });

                if (this.currentView === 'stop-view' && this.currentStop) {
                    this.renderStopBuses(this.currentStop);
                }
                
                if (this.trackingBus) {
                    this.renderTrackingView();
                }
            }
        }, this.data.settings.updateInterval * 1000);
    }

    restartUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.startRealTimeUpdates();
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            const offlineIndicator = document.getElementById('offline-indicator');
            if (offlineIndicator) {
                offlineIndicator.classList.remove('show');
            }
            this.showToast('Back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            const offlineIndicator = document.getElementById('offline-indicator');
            if (offlineIndicator) {
                offlineIndicator.classList.add('show');
            }
            this.showToast('You are offline', 'warning');
        });

        if (!this.isOnline) {
            const offlineIndicator = document.getElementById('offline-indicator');
            if (offlineIndicator) {
                offlineIndicator.classList.add('show');
            }
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('citybus-settings');
            if (saved) {
                this.data.settings = { ...this.data.settings, ...JSON.parse(saved) };
            }
            this.applyTheme(this.data.settings.theme);
        } catch (error) {
            console.warn('Could not load settings from localStorage');
        }
    }

    loadSettingsView() {
        try {
            const notificationsToggle = document.getElementById('notifications-toggle');
            const themeSelect = document.getElementById('theme-select');
            const updateInterval = document.getElementById('update-interval');

            if (notificationsToggle) notificationsToggle.checked = this.data.settings.notifications;
            if (themeSelect) themeSelect.value = this.data.settings.theme;
            if (updateInterval) updateInterval.value = this.data.settings.updateInterval;
        } catch (error) {
            console.warn('Could not load settings view');
        }
    }

    updateSetting(key, value) {
        try {
            this.data.settings[key] = value;
            localStorage.setItem('citybus-settings', JSON.stringify(this.data.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage');
        }
    }

    applyTheme(theme) {
        try {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-color-scheme', 'dark');
            } else if (theme === 'light') {
                document.documentElement.setAttribute('data-color-scheme', 'light');
            } else {
                document.documentElement.removeAttribute('data-color-scheme');
            }
        } catch (error) {
            console.warn('Could not apply theme');
        }
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('citybus-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Could not load favorites from localStorage');
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('citybus-favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.warn('Could not save favorites to localStorage');
        }
    }

    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
        this.renderFavorites();
        this.showToast('All favorites cleared', 'info');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new CityBusApp();
});

// Fallback initialization for cases where DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('Document already loaded, initializing immediately...');
    window.app = new CityBusApp();
}
