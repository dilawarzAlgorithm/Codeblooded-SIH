// Global state management
let currentUser = null;
let currentRole = null;
let currentIssues = [];
let filteredIssues = [];

// Data from the provided JSON
const appData = {
  "issues": [
    {
      "id": "CC001",
      "title": "Pothole on Main Street",
      "description": "Large pothole near the bus stop causing traffic issues",
      "category": "Roads",
      "priority": "High",
      "status": "In Progress",
      "location": "Main Street, Ward 4",
      "coordinates": "28.6139, 77.2090",
      "reportedBy": "Rajesh Kumar",
      "reportedDate": "2025-09-03T10:30:00",
      "assignedOfficer": "Suresh Mehta",
      "assignedTeam": "Road Maintenance Team A",
      "department": "Public Works Department",
      "photos": ["pothole_before.jpg"],
      "resolutionPhotos": [],
      "slaDeadline": "2025-09-08T10:30:00",
      "updates": [
        {"date": "2025-09-03T11:00:00", "status": "Acknowledged", "note": "Issue reported and logged"},
        {"date": "2025-09-04T09:15:00", "status": "In Progress", "note": "Assigned to field team for assessment"}
      ],
      "rating": null,
      "feedback": ""
    },
    {
      "id": "CC002",
      "title": "Garbage not collected",
      "description": "Garbage bins overflowing for past 3 days",
      "category": "Sanitation",
      "priority": "Medium",
      "status": "Resolved",
      "location": "Sector 15, Block A",
      "coordinates": "28.5355, 77.3910",
      "reportedBy": "Rajesh Kumar",
      "reportedDate": "2025-09-01T08:45:00",
      "assignedOfficer": "Amit Verma",
      "assignedTeam": "Sanitation Team B",
      "department": "Sanitation Department",
      "photos": ["garbage_overflow.jpg"],
      "resolutionPhotos": ["garbage_collected.jpg"],
      "slaDeadline": "2025-09-04T08:45:00",
      "updates": [
        {"date": "2025-09-01T09:00:00", "status": "Acknowledged", "note": "Issue logged and assigned"},
        {"date": "2025-09-02T14:30:00", "status": "In Progress", "note": "Collection team dispatched"},
        {"date": "2025-09-03T11:00:00", "status": "Resolved", "note": "Garbage collected and area cleaned"}
      ],
      "rating": 4,
      "feedback": "Good response time, appreciate the service"
    },
    {
      "id": "CC003",
      "title": "Street light not working",
      "description": "Street light pole number SL-456 not functioning since last week",
      "category": "Streetlights",
      "priority": "Medium",
      "status": "Acknowledged",
      "location": "Park Avenue, Sector 12",
      "coordinates": "28.5245, 77.1855",
      "reportedBy": "Rajesh Kumar",
      "reportedDate": "2025-09-05T19:20:00",
      "assignedOfficer": "Ravi Gupta",
      "assignedTeam": "Electrical Maintenance Team",
      "department": "Electrical Department",
      "photos": ["broken_streetlight.jpg"],
      "resolutionPhotos": [],
      "slaDeadline": "2025-09-10T19:20:00",
      "updates": [
        {"date": "2025-09-05T20:00:00", "status": "Acknowledged", "note": "Issue reported and being reviewed"}
      ],
      "rating": null,
      "feedback": ""
    }
  ],
  "citizens": [
    {
      "id": "U001",
      "name": "Rajesh Kumar",
      "email": "rajesh.kumar@email.com",
      "phone": "+91-9876543210",
      "address": "Main Street, Ward 4",
      "issuesReported": 5,
      "issuesResolved": 3,
      "rating": 4.2,
      "badges": ["Reporter", "Community Helper"],
      "joinDate": "2025-07-15"
    }
  ],
  "officers": [
    {
      "id": "O001",
      "name": "Suresh Mehta",
      "designation": "Assistant Engineer",
      "department": "Public Works Department",
      "email": "suresh.mehta@municipal.gov",
      "phone": "+91-9876500001",
      "assignedIssues": 12,
      "resolvedIssues": 8,
      "avgResolutionTime": "3.2 days",
      "slaCompliance": "85%"
    },
    {
      "id": "O002",
      "name": "Amit Verma",
      "designation": "Sanitation Inspector",
      "department": "Sanitation Department",
      "email": "amit.verma@municipal.gov",
      "phone": "+91-9876500002",
      "assignedIssues": 18,
      "resolvedIssues": 15,
      "avgResolutionTime": "2.1 days",
      "slaCompliance": "92%"
    }
  ],
  "analytics": {
    "totalIssues": 152,
    "openIssues": 48,
    "inProgressIssues": 32,
    "resolvedIssues": 90,
    "escalatedIssues": 8,
    "slaCompliance": "85%",
    "avgResolutionTime": "3.2 days",
    "citizenSatisfaction": "4.3/5",
    "monthlyTrend": [
      {"month": "June", "reported": 98, "resolved": 89},
      {"month": "July", "reported": 112, "resolved": 105},
      {"month": "August", "reported": 134, "resolved": 128},
      {"month": "September", "reported": 48, "resolved": 42}
    ],
    "categoryBreakdown": {
      "Roads": 45,
      "Sanitation": 38,
      "Streetlights": 25,
      "Water": 22,
      "Parks": 15,
      "Electricity": 7
    }
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    currentIssues = [...appData.issues];
    filteredIssues = [...appData.issues];
    
    setupEventListeners();
    showPage('landing-page');
}

function setupEventListeners() {
    // Use event delegation for better reliability
    document.addEventListener('click', function(e) {
        const target = e.target;
        const id = target.id;
        const classList = target.classList;
        
        // Handle role login buttons
        if (id === 'citizen-login') {
            e.preventDefault();
            loginAs('citizen');
            return;
        }
        
        if (id === 'government-login') {
            e.preventDefault();
            loginAs('government');
            return;
        }
        
        // Handle logout buttons
        if (id === 'logout-btn' || id === 'gov-logout-btn') {
            e.preventDefault();
            logout();
            return;
        }
        
        // Handle report issue button
        if (id === 'report-issue-btn') {
            e.preventDefault();
            openReportModal();
            return;
        }
        
        // Handle tab buttons
        if (classList.contains('tab-btn')) {
            e.preventDefault();
            const tabId = target.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
            }
            return;
        }
        
        // Handle issue cards
        if (classList.contains('issue-card') || target.closest('.issue-card')) {
            const card = classList.contains('issue-card') ? target : target.closest('.issue-card');
            const issueId = card.getAttribute('data-issue-id');
            if (issueId) {
                const issue = currentIssues.find(i => i.id === issueId);
                if (issue) {
                    openIssueDetails(issue);
                }
            }
            return;
        }
        
        // Handle modal close buttons
        if (classList.contains('modal-close') || classList.contains('modal-cancel')) {
            closeModals();
            return;
        }
        
        // Handle photo upload
        if (id === 'photo-upload') {
            const photoInput = document.getElementById('photo-input');
            if (photoInput) {
                photoInput.click();
            }
            return;
        }
        
        // Handle filter buttons
        if (classList.contains('filter-btn')) {
            const filter = target.getAttribute('data-filter');
            if (filter) {
                filterMap(filter);
            }
            return;
        }
        
        // Handle voice input
        if (id === 'voice-input') {
            e.preventDefault();
            target.style.background = '#e74c3c';
            setTimeout(() => {
                target.style.background = '';
                const descInput = document.getElementById('issue-description');
                if (descInput) {
                    descInput.value += ' [Voice input recorded]';
                }
            }, 2000);
            return;
        }
    });
    
    // Handle form submission
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'report-form') {
            e.preventDefault();
            submitReport(e);
        }
    });
    
    // Handle change events
    document.addEventListener('change', function(e) {
        const target = e.target;
        const id = target.id;
        
        if (id === 'photo-input') {
            handlePhotoUpload(e);
        } else if (id === 'status-filter' || id === 'category-filter') {
            applyFilters();
        } else if (id === 'search-issues' || id === 'dept-filter' || id === 'priority-filter' || id === 'mgmt-status-filter') {
            applyGovFilters();
        } else if (id === 'select-all') {
            toggleSelectAll();
        }
    });
    
    // Handle input events for search
    document.addEventListener('input', function(e) {
        if (e.target.id === 'search-issues') {
            applyGovFilters();
        }
    });
}

function loginAs(role) {
    currentRole = role;
    
    if (role === 'citizen') {
        currentUser = appData.citizens[0];
        showPage('citizen-dashboard');
        setTimeout(() => {
            loadCitizenDashboard();
        }, 50);
    } else {
        currentUser = { name: 'Admin Officer', role: 'Government' };
        showPage('government-dashboard');
        setTimeout(() => {
            loadGovernmentDashboard();
        }, 50);
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    showPage('landing-page');
}

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
}

function switchTab(tabId) {
    // Find the active page container
    const activePage = document.querySelector('.page-container:not(.hidden)');
    if (!activePage) return;
    
    // Update tab buttons
    const tabButtons = activePage.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = activePage.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update tab content
    const tabContents = activePage.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = activePage.querySelector(`#${tabId}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // Load specific content
    setTimeout(() => {
        if (tabId === 'community-map') {
            loadCommunityMap();
        } else if (tabId === 'overview' && currentRole === 'government') {
            loadOverviewCharts();
        } else if (tabId === 'analytics' && currentRole === 'government') {
            loadAnalyticsCharts();
        } else if (tabId === 'team-management' && currentRole === 'government') {
            loadTeamManagement();
        }
    }, 50);
}

function loadCitizenDashboard() {
    // Set current date/time
    const now = new Date();
    const datetimeInput = document.getElementById('issue-datetime');
    const locationInput = document.getElementById('issue-location');
    
    if (datetimeInput) {
        datetimeInput.value = now.toLocaleString();
    }
    if (locationInput) {
        locationInput.value = 'Auto-detected: Main Street, Ward 4';
    }
    
    // Load user issues
    loadMyIssues();
    loadCommunityMap();
}

function loadMyIssues() {
    const userIssues = currentIssues.filter(issue => issue.reportedBy === currentUser.name);
    filteredIssues = userIssues;
    renderIssueCards();
}

function renderIssueCards() {
    const container = document.getElementById('issues-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredIssues.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-secondary); padding: 40px;">No issues found. Click "Report Issue" to submit your first report.</div>';
        return;
    }
    
    filteredIssues.forEach(issue => {
        const card = createIssueCard(issue);
        container.appendChild(card);
    });
}

function createIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.setAttribute('data-issue-id', issue.id);
    
    const statusClass = issue.status.toLowerCase().replace(' ', '-');
    const priorityClass = issue.priority.toLowerCase();
    
    card.innerHTML = `
        <div class="issue-card-header">
            <span class="issue-id">${issue.id}</span>
            <span class="status-badge ${statusClass}">${issue.status}</span>
        </div>
        <div class="issue-photo">
            <i class="fas fa-image"></i>
        </div>
        <h4 class="issue-title">${issue.title}</h4>
        <div class="issue-location">
            <i class="fas fa-map-marker-alt"></i>
            ${issue.location}
        </div>
        <div class="issue-footer">
            <span class="issue-date">${formatDate(issue.reportedDate)}</span>
            <span class="priority-badge ${priorityClass}">${issue.priority}</span>
        </div>
    `;
    
    return card;
}

function loadCommunityMap() {
    const mapView = document.getElementById('community-map-view');
    if (!mapView) return;
    
    mapView.innerHTML = '';
    
    const areas = [
        { name: 'Ward 1', issues: 3, category: 'roads' },
        { name: 'Ward 2', issues: 5, category: 'sanitation' },
        { name: 'Ward 3', issues: 2, category: 'streetlights' },
        { name: 'Ward 4', issues: 4, category: 'water' },
        { name: 'Ward 5', issues: 1, category: 'parks' },
        { name: 'Ward 6', issues: 3, category: 'roads' },
        { name: 'Ward 7', issues: 2, category: 'sanitation' },
        { name: 'Ward 8', issues: 1, category: 'streetlights' },
        { name: 'Ward 9', issues: 3, category: 'water' },
        { name: 'Ward 10', issues: 2, category: 'parks' },
        { name: 'Ward 11', issues: 1, category: 'roads' },
        { name: 'Ward 12', issues: 2, category: 'sanitation' }
    ];
    
    areas.forEach(area => {
        const marker = document.createElement('div');
        marker.className = `map-marker ${area.category}`;
        marker.textContent = area.issues;
        marker.title = `${area.name}: ${area.issues} issues`;
        marker.onclick = () => alert(`${area.name}\nIssues: ${area.issues}\nCategory: ${area.category}`);
        mapView.appendChild(marker);
    });
}

function loadGovernmentDashboard() {
    loadOverviewCharts();
    loadIssueManagementTable();
    loadRecentActivity();
}

function loadOverviewCharts() {
    // Create heatmap
    const heatmap = document.getElementById('city-heatmap');
    if (heatmap) {
        heatmap.innerHTML = '';
        
        for (let i = 0; i < 24; i++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            const intensity = Math.random();
            if (intensity > 0.7) cell.classList.add('high');
            else if (intensity > 0.4) cell.classList.add('medium');
            else cell.classList.add('low');
            
            cell.textContent = Math.floor(Math.random() * 10);
            heatmap.appendChild(cell);
        }
    }
    
    // Department performance chart
    const chartCanvas = document.getElementById('department-chart');
    if (chartCanvas && typeof Chart !== 'undefined') {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Public Works', 'Sanitation', 'Electrical', 'Water', 'Parks'],
                datasets: [{
                    label: 'SLA Compliance %',
                    data: [85, 92, 78, 83, 88],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

function loadAnalyticsCharts() {
    // Monthly trend chart
    const monthlyCanvas = document.getElementById('monthly-trend-chart');
    if (monthlyCanvas && typeof Chart !== 'undefined') {
        const monthlyCtx = monthlyCanvas.getContext('2d');
        new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: appData.analytics.monthlyTrend.map(item => item.month),
                datasets: [
                    {
                        label: 'Reported',
                        data: appData.analytics.monthlyTrend.map(item => item.reported),
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Resolved',
                        data: appData.analytics.monthlyTrend.map(item => item.resolved),
                        borderColor: '#5D878F',
                        backgroundColor: 'rgba(93, 135, 143, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Category breakdown chart
    const categoryCanvas = document.getElementById('category-chart');
    if (categoryCanvas && typeof Chart !== 'undefined') {
        const categoryCtx = categoryCanvas.getContext('2d');
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(appData.analytics.categoryBreakdown),
                datasets: [{
                    data: Object.values(appData.analytics.categoryBreakdown),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function loadIssueManagementTable() {
    const tbody = document.getElementById('issues-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentIssues.forEach(issue => {
        const row = document.createElement('tr');
        const slaStatus = getSLAStatus(issue.slaDeadline);
        
        row.innerHTML = `
            <td><input type="checkbox" class="issue-checkbox" data-id="${issue.id}"></td>
            <td><a href="#" onclick="openGovIssueDetails('${issue.id}')">${issue.id}</a></td>
            <td>${issue.category}</td>
            <td><span class="priority-badge ${issue.priority.toLowerCase()}">${issue.priority}</span></td>
            <td>${issue.location}</td>
            <td><span class="status-badge ${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
            <td>${issue.assignedOfficer}</td>
            <td class="${slaStatus.class}">${slaStatus.text}</td>
            <td>
                <button class="btn btn--secondary action-btn" onclick="assignIssue('${issue.id}')">Assign</button>
                <button class="btn btn--outline action-btn" onclick="updateStatus('${issue.id}', 'Resolved')">Resolve</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function loadRecentActivity() {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;
    
    activityFeed.innerHTML = '';
    
    const activities = [
        { type: 'new', title: 'New issue reported', meta: 'CC001 - 5 minutes ago', icon: 'fas fa-plus' },
        { type: 'updated', title: 'Issue status updated', meta: 'CC002 - 15 minutes ago', icon: 'fas fa-edit' },
        { type: 'resolved', title: 'Issue resolved', meta: 'CC003 - 1 hour ago', icon: 'fas fa-check' }
    ];
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-meta">${activity.meta}</div>
            </div>
        `;
        activityFeed.appendChild(item);
    });
}

function loadTeamManagement() {
    const teamContainer = document.getElementById('team-assignments');
    if (teamContainer) {
        teamContainer.innerHTML = '';
        
        const teams = [
            { name: 'Road Maintenance Team A', status: 'Active - 3 assignments' },
            { name: 'Sanitation Team B', status: 'Active - 2 assignments' },
            { name: 'Electrical Maintenance Team', status: 'Available' },
            { name: 'Emergency Response Team', status: 'Active - 1 assignment' }
        ];
        
        teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-status">${team.status}</div>
            `;
            teamContainer.appendChild(card);
        });
    }
    
    const officerContainer = document.getElementById('officer-performance');
    if (officerContainer) {
        officerContainer.innerHTML = '';
        
        appData.officers.forEach(officer => {
            const card = document.createElement('div');
            card.className = 'officer-card';
            card.innerHTML = `
                <div class="officer-name">${officer.name}</div>
                <div class="officer-dept">${officer.designation}, ${officer.department}</div>
                <div class="officer-stats">
                    <div class="officer-stat">
                        <strong>${officer.assignedIssues}</strong><br>
                        <small>Assigned</small>
                    </div>
                    <div class="officer-stat">
                        <strong>${officer.slaCompliance}</strong><br>
                        <small>SLA</small>
                    </div>
                </div>
            `;
            officerContainer.appendChild(card);
        });
    }
}

function openReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function openIssueDetails(issue) {
    const modal = document.getElementById('issue-details-modal');
    const content = document.getElementById('issue-details-content');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div class="issue-details">
            <div class="issue-main">
                <div class="issue-photos">
                    <div class="issue-photo-large">
                        <i class="fas fa-image"></i>
                    </div>
                </div>
                <div>
                    <h4>${issue.title}</h4>
                    <p>${issue.description}</p>
                </div>
                <div class="progress-timeline">
                    <h4>Progress Timeline</h4>
                    ${issue.updates.map(update => `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">${formatDate(update.date)}</div>
                                <div class="timeline-status">${update.status}</div>
                                <div class="timeline-note">${update.note}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="issue-sidebar">
                <div class="issue-info-section">
                    <h4>Issue Information</h4>
                    <div class="info-item">
                        <span class="info-label">Issue ID:</span>
                        <span class="info-value">${issue.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${issue.category}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Priority:</span>
                        <span class="info-value">${issue.priority}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">${issue.status}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${issue.location}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Officer:</span>
                        <span class="info-value">${issue.assignedOfficer}</span>
                    </div>
                </div>
                
                ${getSLATimer(issue.slaDeadline)}
                
                ${issue.status === 'Resolved' ? `
                    <div class="rating-section">
                        <h4>Rate Resolution</h4>
                        <div class="star-rating">
                            ${[1,2,3,4,5].map(star => `
                                <i class="fas fa-star star ${issue.rating && star <= issue.rating ? 'active' : ''}" 
                                   onclick="rateIssue('${issue.id}', ${star})"></i>
                            `).join('')}
                        </div>
                        <textarea class="form-control" placeholder="Leave feedback..." rows="3">${issue.feedback || ''}</textarea>
                        <button class="btn btn--primary btn--sm" onclick="submitFeedback('${issue.id}')">Submit Feedback</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function submitReport(e) {
    const category = document.getElementById('issue-category').value;
    const priority = document.getElementById('issue-priority').value;
    const description = document.getElementById('issue-description').value;
    
    if (!category || !priority || !description) {
        alert('Please fill all required fields');
        return;
    }
    
    const newIssue = {
        id: 'CC' + String(currentIssues.length + 1).padStart(3, '0'),
        title: description.split('.')[0] || 'New Issue',
        description: description,
        category: category,
        priority: priority,
        status: 'Acknowledged',
        location: document.getElementById('issue-location').value,
        coordinates: '28.6139, 77.2090',
        reportedBy: currentUser.name,
        reportedDate: new Date().toISOString(),
        assignedOfficer: 'Pending Assignment',
        assignedTeam: 'Pending Assignment',
        department: getDepartmentByCategory(category),
        photos: ['new_issue.jpg'],
        resolutionPhotos: [],
        slaDeadline: getSLADeadline(category),
        updates: [
            {
                date: new Date().toISOString(),
                status: 'Acknowledged',
                note: 'Issue reported and logged in the system'
            }
        ],
        rating: null,
        feedback: ''
    };
    
    currentIssues.unshift(newIssue);
    loadMyIssues();
    closeModals();
    
    alert('Issue reported successfully! You will receive updates on the progress.');
    
    // Reset form
    const form = document.getElementById('report-form');
    if (form) {
        form.reset();
    }
    const preview = document.getElementById('photo-preview');
    if (preview) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
    }
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.classList.remove('hidden');
        }
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    const statusValue = statusFilter ? statusFilter.value : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    
    const userIssues = currentIssues.filter(issue => issue.reportedBy === currentUser.name);
    
    filteredIssues = userIssues.filter(issue => {
        const statusMatch = !statusValue || issue.status === statusValue;
        const categoryMatch = !categoryValue || issue.category === categoryValue;
        return statusMatch && categoryMatch;
    });
    
    renderIssueCards();
}

function applyGovFilters() {
    const searchEl = document.getElementById('search-issues');
    const deptEl = document.getElementById('dept-filter');
    const priorityEl = document.getElementById('priority-filter');
    const statusEl = document.getElementById('mgmt-status-filter');
    
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const dept = deptEl ? deptEl.value : '';
    const priority = priorityEl ? priorityEl.value : '';
    const status = statusEl ? statusEl.value : '';
    
    const filtered = currentIssues.filter(issue => {
        const searchMatch = !search || 
            issue.title.toLowerCase().includes(search) ||
            issue.description.toLowerCase().includes(search) ||
            issue.id.toLowerCase().includes(search);
        const deptMatch = !dept || issue.department === dept;
        const priorityMatch = !priority || issue.priority === priority;
        const statusMatch = !status || issue.status === status;
        
        return searchMatch && deptMatch && priorityMatch && statusMatch;
    });
    
    updateIssueTable(filtered);
}

function filterMap(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-filter="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    document.querySelectorAll('.map-marker').forEach(marker => {
        if (category === 'all' || marker.classList.contains(category)) {
            marker.style.display = 'flex';
        } else {
            marker.style.display = 'none';
        }
    });
}

function updateIssueTable(issues) {
    const tbody = document.getElementById('issues-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    issues.forEach(issue => {
        const row = document.createElement('tr');
        const slaStatus = getSLAStatus(issue.slaDeadline);
        
        row.innerHTML = `
            <td><input type="checkbox" class="issue-checkbox" data-id="${issue.id}"></td>
            <td><a href="#" onclick="openGovIssueDetails('${issue.id}')">${issue.id}</a></td>
            <td>${issue.category}</td>
            <td><span class="priority-badge ${issue.priority.toLowerCase()}">${issue.priority}</span></td>
            <td>${issue.location}</td>
            <td><span class="status-badge ${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
            <td>${issue.assignedOfficer}</td>
            <td class="${slaStatus.class}">${slaStatus.text}</td>
            <td>
                <button class="btn btn--secondary action-btn" onclick="assignIssue('${issue.id}')">Assign</button>
                <button class="btn btn--outline action-btn" onclick="updateStatus('${issue.id}', 'Resolved')">Resolve</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.issue-checkbox');
    
    if (selectAll) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
    }
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getSLAStatus(deadline) {
    const now = new Date();
    const slaDate = new Date(deadline);
    const timeDiff = slaDate - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    
    if (hoursLeft < 0) {
        return { text: 'Overdue', class: 'text-danger' };
    } else if (hoursLeft < 24) {
        return { text: `${hoursLeft}h left`, class: 'text-warning' };
    } else {
        const daysLeft = Math.floor(hoursLeft / 24);
        return { text: `${daysLeft}d left`, class: 'text-success' };
    }
}

function getSLATimer(deadline) {
    const slaStatus = getSLAStatus(deadline);
    if (slaStatus.text.includes('Overdue')) {
        return `<div class="sla-timer">⚠️ SLA Overdue</div>`;
    }
    return `<div style="text-align: center; padding: 12px; background: var(--color-bg-3); border-radius: 8px;">
        <strong>SLA: ${slaStatus.text}</strong>
    </div>`;
}

function getDepartmentByCategory(category) {
    const mapping = {
        'Roads': 'Public Works Department',
        'Sanitation': 'Sanitation Department',
        'Streetlights': 'Electrical Department',
        'Electricity': 'Electrical Department',
        'Water': 'Water Department',
        'Parks': 'Parks & Recreation'
    };
    return mapping[category] || 'General Department';
}

function getSLADeadline(category) {
    const now = new Date();
    const slaHours = {
        'Emergency': 2,
        'Water': 48,
        'Sanitation': 72,
        'Roads': 120,
        'Streetlights': 120,
        'Parks': 240,
        'Electricity': 120
    };
    
    const hours = slaHours[category] || 120;
    return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

// Global functions for onclick handlers
window.openGovIssueDetails = function(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    const modal = document.getElementById('gov-issue-details-modal');
    const content = document.getElementById('gov-issue-details-content');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div class="issue-details">
            <div class="issue-main">
                <div class="issue-photos">
                    <div class="issue-photo-large">
                        <i class="fas fa-image"></i>
                    </div>
                </div>
                <div>
                    <h4>${issue.title}</h4>
                    <p>${issue.description}</p>
                    <p><strong>Reported by:</strong> ${issue.reportedBy}</p>
                    <p><strong>Coordinates:</strong> ${issue.coordinates}</p>
                </div>
            </div>
            <div class="issue-sidebar">
                <div class="gov-issue-actions">
                    <div class="action-group">
                        <h4>Quick Actions</h4>
                        <div class="action-buttons">
                            <button class="btn btn--primary btn--sm" onclick="updateIssueStatus('${issue.id}', 'In Progress')">Mark In Progress</button>
                            <button class="btn btn--success btn--sm" onclick="updateIssueStatus('${issue.id}', 'Resolved')">Mark Resolved</button>
                            <button class="btn btn--warning btn--sm" onclick="updateIssueStatus('${issue.id}', 'Escalated')">Escalate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
};

window.rateIssue = function(issueId, rating) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (issue) {
        issue.rating = rating;
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
};

window.submitFeedback = function(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    const feedbackTextarea = document.querySelector('.rating-section textarea');
    const feedback = feedbackTextarea ? feedbackTextarea.value : '';
    if (issue) {
        issue.feedback = feedback;
        alert('Thank you for your feedback!');
    }
};

window.updateIssueStatus = function(issueId, newStatus) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (issue) {
        issue.status = newStatus;
        issue.updates.push({
            date: new Date().toISOString(),
            status: newStatus,
            note: `Status updated to ${newStatus} by admin`
        });
        
        if (currentRole === 'government') {
            loadIssueManagementTable();
            loadRecentActivity();
        } else {
            loadMyIssues();
        }
        
        closeModals();
        alert(`Issue ${issueId} status updated to ${newStatus}`);
    }
};

window.assignIssue = function(issueId) {
    const officers = appData.officers;
    const officerNames = officers.map(o => o.name);
    const selectedOfficer = prompt('Assign to officer:\n' + officerNames.join('\n') + '\n\nEnter officer name:');
    
    if (selectedOfficer && officerNames.includes(selectedOfficer)) {
        const issue = currentIssues.find(i => i.id === issueId);
        if (issue) {
            issue.assignedOfficer = selectedOfficer;
            issue.updates.push({
                date: new Date().toISOString(),
                status: 'Assigned',
                note: `Assigned to ${selectedOfficer}`
            });
            loadIssueManagementTable();
            alert(`Issue ${issueId} assigned to ${selectedOfficer}`);
        }
    }
};

window.updateStatus = function(issueId, status) {
    updateIssueStatus(issueId, status);
};