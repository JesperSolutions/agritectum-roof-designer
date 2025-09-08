// Advanced 3D Roof Designer with AI Generation
let scene, camera, renderer, controls;
let roofMesh, roofGeometry;
let zones = [];
let currentZoneMode = 'solar';
let currentRoofType = 'gabled';
let raycaster, mouse;
let currentLocation = 'copenhagen';

// Enhanced zone configurations with more realistic properties
const zoneConfigs = {
    solar: { 
        color: 0xffa500, 
        height: 0.3, 
        name: 'Solar Panels',
        efficiency: 0.20,
        cost: 1500,
        maintenance: 0.02
    },
    green: { 
        color: 0x4CAF50, 
        height: 0.2, 
        name: 'Green Roof',
        efficiency: 0.85,
        cost: 800,
        maintenance: 0.05
    },
    water: { 
        color: 0x2196F3, 
        height: 0.1, 
        name: 'Water System',
        efficiency: 0.70,
        cost: 600,
        maintenance: 0.03
    },
    social: { 
        color: 0x9C27B0, 
        height: 0.05, 
        name: 'Social Space',
        efficiency: 1.0,
        cost: 400,
        maintenance: 0.01
    }
};

// Climate data for different locations
const climateData = {
    copenhagen: { solar: 1000, rainfall: 600, temp: 8.7, wind: 4.5 },
    stockholm: { solar: 950, rainfall: 550, temp: 7.4, wind: 4.2 },
    oslo: { solar: 900, rainfall: 800, temp: 6.8, wind: 3.8 },
    berlin: { solar: 1100, rainfall: 580, temp: 10.3, wind: 3.9 },
    amsterdam: { solar: 1050, rainfall: 850, temp: 10.2, wind: 4.8 }
};

// Prefab configurations for different building types
const prefabConfigs = {
    residential: {
        roofType: 'gabled',
        width: 35,
        length: 25,
        pitch: 25,
        zones: [
            { type: 'solar', percentage: 0.4, priority: 'south' },
            { type: 'green', percentage: 0.35, priority: 'north' },
            { type: 'water', percentage: 0.15, priority: 'edges' },
            { type: 'social', percentage: 0.1, priority: 'accessible' }
        ]
    },
    commercial: {
        roofType: 'flat',
        width: 60,
        length: 40,
        pitch: 5,
        zones: [
            { type: 'solar', percentage: 0.6, priority: 'center' },
            { type: 'green', percentage: 0.2, priority: 'perimeter' },
            { type: 'water', percentage: 0.15, priority: 'corners' },
            { type: 'social', percentage: 0.05, priority: 'accessible' }
        ]
    },
    industrial: {
        roofType: 'shed',
        width: 80,
        length: 50,
        pitch: 10,
        zones: [
            { type: 'solar', percentage: 0.7, priority: 'south' },
            { type: 'water', percentage: 0.2, priority: 'low' },
            { type: 'green', percentage: 0.08, priority: 'edges' },
            { type: 'social', percentage: 0.02, priority: 'entrance' }
        ]
    },
    school: {
        roofType: 'hip',
        width: 45,
        length: 35,
        pitch: 20,
        zones: [
            { type: 'solar', percentage: 0.35, priority: 'south' },
            { type: 'green', percentage: 0.4, priority: 'center' },
            { type: 'social', percentage: 0.15, priority: 'accessible' },
            { type: 'water', percentage: 0.1, priority: 'edges' }
        ]
    }
};

// Initialize the advanced 3D scene
function init() {
    // Scene setup with enhanced environment
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
    
    // Camera with better positioning
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 30, 40);
    
    // Enhanced renderer with better quality
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Enhanced controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    
    // Advanced lighting setup
    setupAdvancedLighting();
    
    // Enhanced environment
    createEnvironment();
    
    // Initial roof
    createRoof();
    
    // Interaction setup
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    // Start animation loop
    animate();
    
    // Initial setup
    setZoneMode('solar');
    updateClimate();
}

function setupAdvancedLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Main sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(50, 50, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
    
    // Sky hemisphere light
    const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.4);
    scene.add(skyLight);
}

function createEnvironment() {
    // Enhanced ground with texture
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x7cb342,
        transparent: true,
        opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add some environmental elements
    createTrees();
    createBuildings();
    createSkybox();
}

function createTrees() {
    for (let i = 0; i < 8; i++) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(4, 8, 6);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 10;
        foliage.castShadow = true;
        treeGroup.add(foliage);
        
        // Random positioning
        const angle = (i / 8) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;
        treeGroup.position.x = Math.cos(angle) * distance;
        treeGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(treeGroup);
    }
}

function createBuildings() {
    for (let i = 0; i < 5; i++) {
        const buildingGeometry = new THREE.BoxGeometry(
            10 + Math.random() * 15,
            15 + Math.random() * 20,
            8 + Math.random() * 12
        );
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.2, 0.6 + Math.random() * 0.2)
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 4;
        const distance = 120 + Math.random() * 50;
        building.position.x = Math.cos(angle) * distance;
        building.position.z = Math.sin(angle) * distance;
        building.position.y = building.geometry.parameters.height / 2;
        
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
    }
}

function createSkybox() {
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.8
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

function createRoof() {
    // Remove existing roof
    if (roofMesh) {
        scene.remove(roofMesh);
    }
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const pitch = parseFloat(document.getElementById('roofPitch').value);
    const roofType = document.getElementById('roofType').value;
    
    // Update display values
    document.getElementById('widthValue').textContent = width;
    document.getElementById('lengthValue').textContent = length;
    document.getElementById('pitchValue').textContent = pitch;
    
    // Create roof based on type
    switch(roofType) {
        case 'gabled':
            roofMesh = createGabledRoof(width, length, pitch);
            break;
        case 'hip':
            roofMesh = createHipRoof(width, length, pitch);
            break;
        case 'shed':
            roofMesh = createShedRoof(width, length, pitch);
            break;
        case 'gambrel':
            roofMesh = createGambrelRoof(width, length, pitch);
            break;
        case 'mansard':
            roofMesh = createMansardRoof(width, length, pitch);
            break;
        case 'butterfly':
            roofMesh = createButterflyRoof(width, length, pitch);
            break;
        case 'flat':
            roofMesh = createFlatRoof(width, length);
            break;
        default:
            roofMesh = createGabledRoof(width, length, pitch);
    }
    
    scene.add(roofMesh);
    updateMetrics();
}

function createGabledRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * (width / 2);
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        // Front triangle
        -width/2, 0, length/2,  width/2, 0, length/2,  0, roofHeight, length/2,
        // Back triangle
        -width/2, 0, -length/2,  0, roofHeight, -length/2,  width/2, 0, -length/2,
        // Left slope
        -width/2, 0, length/2,  0, roofHeight, length/2,  0, roofHeight, -length/2,
        -width/2, 0, length/2,  0, roofHeight, -length/2,  -width/2, 0, -length/2,
        // Right slope
        width/2, 0, length/2,  width/2, 0, -length/2,  0, roofHeight, -length/2,
        width/2, 0, length/2,  0, roofHeight, -length/2,  0, roofHeight, length/2,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createHipRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * Math.min(width, length) / 4;
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        // Four triangular faces
        // Front
        -width/2, 0, length/2,  width/2, 0, length/2,  0, roofHeight, 0,
        // Right
        width/2, 0, length/2,  width/2, 0, -length/2,  0, roofHeight, 0,
        // Back
        width/2, 0, -length/2,  -width/2, 0, -length/2,  0, roofHeight, 0,
        // Left
        -width/2, 0, -length/2,  -width/2, 0, length/2,  0, roofHeight, 0,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createShedRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * width;
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        // Single sloped surface
        -width/2, 0, length/2,  width/2, roofHeight, length/2,  width/2, roofHeight, -length/2,
        -width/2, 0, length/2,  width/2, roofHeight, -length/2,  -width/2, 0, -length/2,
        // End triangles
        -width/2, 0, length/2,  -width/2, 0, -length/2,  -width/2, 0, 0,
        width/2, roofHeight, length/2,  width/2, roofHeight, 0,  width/2, roofHeight, -length/2,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createGambrelRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * (width / 4);
    const midHeight = roofHeight * 0.6;
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        // Complex gambrel shape with multiple segments
        // Lower left slope
        -width/2, 0, length/2,  -width/4, midHeight, length/2,  -width/4, midHeight, -length/2,
        -width/2, 0, length/2,  -width/4, midHeight, -length/2,  -width/2, 0, -length/2,
        // Upper left slope
        -width/4, midHeight, length/2,  0, roofHeight, length/2,  0, roofHeight, -length/2,
        -width/4, midHeight, length/2,  0, roofHeight, -length/2,  -width/4, midHeight, -length/2,
        // Upper right slope
        0, roofHeight, length/2,  width/4, midHeight, length/2,  width/4, midHeight, -length/2,
        0, roofHeight, length/2,  width/4, midHeight, -length/2,  0, roofHeight, -length/2,
        // Lower right slope
        width/4, midHeight, length/2,  width/2, 0, length/2,  width/2, 0, -length/2,
        width/4, midHeight, length/2,  width/2, 0, -length/2,  width/4, midHeight, -length/2,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createMansardRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * (width / 6);
    const geometry = new THREE.BufferGeometry();
    
    // Simplified mansard with steep lower slopes and flat top
    const vertices = new Float32Array([
        // Steep sides and flat top
        -width/2, 0, length/2,  -width/3, roofHeight, length/2,  -width/3, roofHeight, -length/2,
        -width/2, 0, length/2,  -width/3, roofHeight, -length/2,  -width/2, 0, -length/2,
        width/3, roofHeight, length/2,  width/2, 0, length/2,  width/2, 0, -length/2,
        width/3, roofHeight, length/2,  width/2, 0, -length/2,  width/3, roofHeight, -length/2,
        // Flat top
        -width/3, roofHeight, length/2,  width/3, roofHeight, length/2,  width/3, roofHeight, -length/2,
        -width/3, roofHeight, length/2,  width/3, roofHeight, -length/2,  -width/3, roofHeight, -length/2,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createButterflyRoof(width, length, pitch) {
    const roofHeight = Math.tan(pitch * Math.PI / 180) * (width / 4);
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        // V-shaped butterfly roof
        -width/2, roofHeight, length/2,  0, 0, length/2,  0, 0, -length/2,
        -width/2, roofHeight, length/2,  0, 0, -length/2,  -width/2, roofHeight, -length/2,
        0, 0, length/2,  width/2, roofHeight, length/2,  width/2, roofHeight, -length/2,
        0, 0, length/2,  width/2, roofHeight, -length/2,  0, 0, -length/2,
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createFlatRoof(width, length) {
    const geometry = new THREE.PlaneGeometry(width, length);
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.1;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function changeRoofType() {
    currentRoofType = document.getElementById('roofType').value;
    createRoof();
}

function updateClimate() {
    currentLocation = document.getElementById('location').value;
    const climate = climateData[currentLocation];
    document.getElementById('weatherInfo').innerHTML = 
        `Solar: ${climate.solar} kWh/m²/yr | Rain: ${climate.rainfall}mm/yr<br>
         Temp: ${climate.temp}°C | Wind: ${climate.wind}m/s`;
    updateMetrics();
}

function loadPrefab(type) {
    const config = prefabConfigs[type];
    if (!config) return;
    
    // Set roof parameters
    document.getElementById('roofType').value = config.roofType;
    document.getElementById('roofWidth').value = config.width;
    document.getElementById('roofLength').value = config.length;
    document.getElementById('roofPitch').value = config.pitch;
    
    // Update roof
    createRoof();
    
    // Clear existing zones
    clearZones();
    
    // Generate zones based on prefab configuration
    setTimeout(() => {
        generatePrefabZones(config);
    }, 100);
}

function generatePrefabZones(config) {
    const width = config.width;
    const length = config.length;
    
    config.zones.forEach(zoneConfig => {
        const numZones = Math.floor((width * length * zoneConfig.percentage) / 25); // ~5x5m zones
        
        for (let i = 0; i < numZones; i++) {
            const pos = getOptimalPosition(zoneConfig.priority, width, length, i, numZones);
            addZone(pos.x, pos.z, zoneConfig.type);
        }
    });
}

function getOptimalPosition(priority, width, length, index, total) {
    let x, z;
    
    switch(priority) {
        case 'south':
            x = (Math.random() - 0.5) * width * 0.8;
            z = Math.random() * length * 0.4; // Southern half
            break;
        case 'north':
            x = (Math.random() - 0.5) * width * 0.8;
            z = -Math.random() * length * 0.4; // Northern half
            break;
        case 'center':
            x = (Math.random() - 0.5) * width * 0.6;
            z = (Math.random() - 0.5) * length * 0.6;
            break;
        case 'perimeter':
            const side = Math.floor(Math.random() * 4);
            switch(side) {
                case 0: x = -width/2 + Math.random() * 5; z = (Math.random() - 0.5) * length; break;
                case 1: x = width/2 - Math.random() * 5; z = (Math.random() - 0.5) * length; break;
                case 2: x = (Math.random() - 0.5) * width; z = -length/2 + Math.random() * 5; break;
                case 3: x = (Math.random() - 0.5) * width; z = length/2 - Math.random() * 5; break;
            }
            break;
        case 'corners':
            const corner = Math.floor(Math.random() * 4);
            const offset = 5 + Math.random() * 5;
            switch(corner) {
                case 0: x = -width/2 + offset; z = length/2 - offset; break;
                case 1: x = width/2 - offset; z = length/2 - offset; break;
                case 2: x = width/2 - offset; z = -length/2 + offset; break;
                case 3: x = -width/2 + offset; z = -length/2 + offset; break;
            }
            break;
        case 'accessible':
            x = (Math.random() - 0.5) * width * 0.4;
            z = length/2 - 10 - Math.random() * 10; // Near front edge
            break;
        default:
            x = (Math.random() - 0.5) * width * 0.8;
            z = (Math.random() - 0.5) * length * 0.8;
    }
    
    return { x, z };
}

function generateLayout(priority = 'balanced') {
    clearZones();
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const climate = climateData[currentLocation];
    
    // AI-driven zone distribution based on priority
    let zoneWeights;
    switch(priority) {
        case 'energy':
            zoneWeights = { solar: 0.65, green: 0.15, water: 0.15, social: 0.05 };
            break;
        case 'environment':
            zoneWeights = { solar: 0.25, green: 0.50, water: 0.20, social: 0.05 };
            break;
        case 'cost':
            zoneWeights = { solar: 0.40, green: 0.30, water: 0.25, social: 0.05 };
            break;
        default: // balanced
            zoneWeights = { solar: 0.40, green: 0.35, water: 0.15, social: 0.10 };
    }
    
    // Adjust for climate
    if (climate.solar > 1100) zoneWeights.solar *= 1.2;
    if (climate.rainfall > 700) zoneWeights.water *= 1.3;
    
    // Generate intelligent zone placement
    const totalZones = Math.floor((width * length) / 30) + 5; // Density based on area
    
    for (let i = 0; i < totalZones; i++) {
        const zoneType = weightedRandomChoice(zoneWeights);
        const pos = getIntelligentPosition(zoneType, width, length, climate);
        addZone(pos.x, pos.z, zoneType);
    }
}

function weightedRandomChoice(weights) {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) return type;
    }
    
    return Object.keys(weights)[0]; // fallback
}

function getIntelligentPosition(zoneType, width, length, climate) {
    let x, z;
    
    switch(zoneType) {
        case 'solar':
            // Prefer south-facing areas with good sun exposure
            x = (Math.random() - 0.5) * width * 0.7;
            z = (0.2 + Math.random() * 0.6) * length * 0.5; // Southern bias
            break;
        case 'green':
            // Distribute evenly but avoid edges
            x = (Math.random() - 0.5) * width * 0.6;
            z = (Math.random() - 0.5) * length * 0.6;
            break;
        case 'water':
            // Prefer lower areas and edges for drainage
            x = (Math.random() - 0.5) * width * 0.9;
            z = (Math.random() - 0.5) * length * 0.9;
            break;
        case 'social':
            // Accessible areas near building access
            x = (Math.random() - 0.5) * width * 0.4;
            z = length * 0.3 + Math.random() * length * 0.2;
            break;
    }
    
    return { x, z };
}

function optimizeLayout() {
    if (zones.length === 0) {
        alert('Please generate a layout first!');
        return;
    }
    
    // AI optimization algorithm
    const iterations = 50;
    let bestScore = calculateLayoutScore();
    let bestLayout = zones.map(zone => ({...zone}));
    
    for (let i = 0; i < iterations; i++) {
        // Try small adjustments
        const testZones = zones.map(zone => {
            const newZone = {...zone};
            newZone.x += (Math.random() - 0.5) * 4; // Small position adjustments
            newZone.z += (Math.random() - 0.5) * 4;
            return newZone;
        });
        
        // Temporarily update zones for scoring
        const originalZones = zones;
        zones = testZones;
        const score = calculateLayoutScore();
        
        if (score > bestScore) {
            bestScore = score;
            bestLayout = testZones.map(zone => ({...zone}));
        }
        
        zones = originalZones;
    }
    
    // Apply best layout
    clearZones();
    bestLayout.forEach(zone => {
        addZone(zone.x, zone.z, zone.type);
    });
    
    alert(`Layout optimized! Score improved to ${bestScore.toFixed(2)}`);
}

function calculateLayoutScore() {
    const metrics = calculateAdvancedMetrics();
    
    // Multi-objective scoring
    const energyScore = metrics.energyOutput / 1000; // Normalize
    const costScore = 1000000 / (metrics.totalCost + 1); // Inverse cost
    const envScore = metrics.co2Reduction * 10;
    const efficiencyScore = metrics.efficiency * 100;
    
    return energyScore + costScore + envScore + efficiencyScore;
}

function setZoneMode(mode) {
    currentZoneMode = mode;
    
    // Update button states
    document.querySelectorAll('.zone-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'Btn').classList.add('active');
}

function onMouseMove(event) {
    // Update mouse position for hover effects
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(roofMesh);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        addZone(point.x, point.z, currentZoneMode);
    }
}

function addZone(x, z, type) {
    const config = zoneConfigs[type];
    const size = 3 + Math.random() * 4; // Random size between 3-7m
    
    // Create enhanced zone geometry
    const zoneGeometry = new THREE.BoxGeometry(size, config.height, size);
    const zoneMaterial = new THREE.MeshLambertMaterial({ 
        color: config.color,
        transparent: true,
        opacity: 0.8
    });
    
    const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
    zoneMesh.position.set(x, config.height / 2, z);
    zoneMesh.castShadow = true;
    
    // Add zone label
    const labelGeometry = new THREE.PlaneGeometry(size * 0.8, 1);
    const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(x, config.height + 0.5, z);
    labelMesh.lookAt(camera.position);
    
    // Store zone data with enhanced properties
    const zone = {
        mesh: zoneMesh,
        label: labelMesh,
        type: type,
        area: size * size,
        position: { x, z },
        efficiency: calculateZoneEfficiency(type, x, z),
        cost: config.cost * size * size,
        maintenance: config.maintenance
    };
    
    zones.push(zone);
    scene.add(zoneMesh);
    scene.add(labelMesh);
    
    updateMetrics();
}

function calculateZoneEfficiency(type, x, z) {
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const climate = climateData[currentLocation];
    
    let efficiency = zoneConfigs[type].efficiency;
    
    if (type === 'solar') {
        // Solar efficiency based on position and climate
        const southernness = (z + length/2) / length; // 0 = north, 1 = south
        efficiency *= (0.7 + southernness * 0.3); // Bonus for southern exposure
        efficiency *= (climate.solar / 1000); // Climate adjustment
    } else if (type === 'green') {
        // Green roof efficiency based on climate
        efficiency *= Math.min(1.2, climate.rainfall / 600);
    }
    
    return efficiency;
}

function clearZones() {
    zones.forEach(zone => {
        scene.remove(zone.mesh);
        if (zone.label) scene.remove(zone.label);
    });
    zones = [];
    updateMetrics();
}

function calculateAdvancedMetrics() {
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const totalArea = width * length;
    const climate = climateData[currentLocation];
    
    let solarArea = 0, greenArea = 0, waterArea = 0, socialArea = 0;
    let totalCost = 0, totalMaintenance = 0, energyOutput = 0, co2Reduction = 0;
    
    zones.forEach(zone => {
        const area = zone.area;
        const efficiency = zone.efficiency;
        
        switch(zone.type) {
            case 'solar':
                solarArea += area;
                energyOutput += area * climate.solar * efficiency * 0.2 * 0.85; // 20% panel efficiency, 85% system efficiency
                co2Reduction += energyOutput * 0.0002; // kg CO2 per kWh
                break;
            case 'green':
                greenArea += area;
                co2Reduction += area * 20 * efficiency; // kg CO2 sequestered per m²
                break;
            case 'water':
                waterArea += area;
                break;
            case 'social':
                socialArea += area;
                break;
        }
        
        totalCost += zone.cost;
        totalMaintenance += zone.cost * zone.maintenance;
    });
    
    const waterRetention = (greenArea + waterArea) * climate.rainfall * 0.001 * 0.7; // m³
    const efficiency = (solarArea + greenArea + waterArea + socialArea) / totalArea;
    
    return {
        totalArea,
        solarArea,
        greenArea,
        waterArea,
        socialArea,
        energyOutput,
        waterRetention,
        co2Reduction: co2Reduction / 1000, // Convert to tons
        totalCost,
        totalMaintenance,
        efficiency
    };
}

function updateMetrics() {
    const metrics = calculateAdvancedMetrics();
    
    // Update display
    document.getElementById('totalArea').textContent = Math.round(metrics.totalArea);
    document.getElementById('solarArea').textContent = Math.round(metrics.solarArea);
    document.getElementById('greenArea').textContent = Math.round(metrics.greenArea);
    document.getElementById('energyOutput').textContent = Math.round(metrics.energyOutput);
}

function updateRoof() {
    createRoof();
}

function generateReport() {
    const metrics = calculateAdvancedMetrics();
    const climate = climateData[currentLocation];
    
    const report = `
ADVANCED 3D ROOF ANALYSIS REPORT
================================

Location: ${currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)}
Climate: ${climate.solar} kWh/m²/yr solar, ${climate.rainfall}mm rainfall

Roof Specifications:
- Type: ${document.getElementById('roofType').value}
- Dimensions: ${document.getElementById('roofWidth').value}m × ${document.getElementById('roofLength').value}m
- Pitch: ${document.getElementById('roofPitch').value}°
- Total Area: ${Math.round(metrics.totalArea)}m²

Zone Distribution:
- Solar Panels: ${Math.round(metrics.solarArea)}m² (${(metrics.solarArea/metrics.totalArea*100).toFixed(1)}%)
- Green Roof: ${Math.round(metrics.greenArea)}m² (${(metrics.greenArea/metrics.totalArea*100).toFixed(1)}%)
- Water Systems: ${Math.round(metrics.waterArea)}m² (${(metrics.waterArea/metrics.totalArea*100).toFixed(1)}%)
- Social Spaces: ${Math.round(metrics.socialArea)}m² (${(metrics.socialArea/metrics.totalArea*100).toFixed(1)}%)

Performance Metrics:
- Energy Production: ${Math.round(metrics.energyOutput)} kWh/year
- Water Retention: ${metrics.waterRetention.toFixed(1)} m³/year
- CO₂ Reduction: ${metrics.co2Reduction.toFixed(1)} tons/year
- Installation Cost: €${Math.round(metrics.totalCost).toLocaleString()}
- Annual Maintenance: €${Math.round(metrics.totalMaintenance).toLocaleString()}
- Layout Efficiency: ${(metrics.efficiency*100).toFixed(1)}%

Economic Analysis:
- Annual Energy Savings: €${Math.round(metrics.energyOutput * 0.25).toLocaleString()}
- Payback Period: ${(metrics.totalCost / (metrics.energyOutput * 0.25)).toFixed(1)} years
- 25-year NPV: €${Math.round((metrics.energyOutput * 0.25 * 25) - metrics.totalCost).toLocaleString()}

Environmental Impact:
- Equivalent Trees Planted: ${Math.round(metrics.co2Reduction * 45)} trees
- Cars Removed from Road: ${Math.round(metrics.co2Reduction / 4.6)} cars/year
- Stormwater Managed: ${Math.round(metrics.waterRetention * 1000)} liters/year
    `;
    
    // Create and download report
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roof_analysis_${currentLocation}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Detailed report generated and downloaded!');
}

function exportModel() {
    // Enhanced export functionality
    const exportOptions = [
        'OBJ - 3D Model',
        'STL - 3D Printing',
        'GLTF - Web 3D',
        'JSON - Data Export',
        'PDF - Visual Report'
    ];
    
    const choice = prompt(`Choose export format:\n${exportOptions.map((opt, i) => `${i+1}. ${opt}`).join('\n')}`);
    
    if (choice && choice >= 1 && choice <= 5) {
        const format = exportOptions[choice-1].split(' - ')[0];
        alert(`Exporting as ${format}...\n\nThis would generate a ${format} file with:\n• Complete 3D roof geometry\n• Zone placement data\n• Material properties\n• Performance metrics\n• Analysis results`);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Update zone labels to face camera
    zones.forEach(zone => {
        if (zone.label) {
            zone.label.lookAt(camera.position);
        }
    });
    
    // Render scene
    renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener('load', init);