// Global variables
let scene, camera, renderer, controls;
let roof, building, zones = [];
let currentZoneType = 'solar';
let roofType = 'gabled';

// Shared materials - only 4 materials total
const materials = {
    building: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    roof: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
    ground: new THREE.MeshLambertMaterial({ color: 0x90EE90 }),
    zone: new THREE.MeshLambertMaterial({ color: 0x4CAF50 })
};

// Zone colors
const zoneColors = {
    solar: 0xFFA500,
    green: 0x4CAF50,
    water: 0x2196F3,
    social: 0x9C27B0
};

// Initialize the 3D scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 40, 50);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting - only 2 lights total
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Create simple environment
    createEnvironment();
    
    // Create initial roof
    updateRoof();
    
    // Start render loop
    animate();
}

function createEnvironment() {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create a few simple buildings using instanced mesh
    const buildingGeometry = new THREE.BoxGeometry(15, 20, 15);
    const buildingMesh = new THREE.InstancedMesh(buildingGeometry, materials.building, 5);
    
    const positions = [
        [-40, 10, -40],
        [60, 15, -30],
        [-50, 12, 40],
        [70, 18, 50],
        [-30, 14, 60]
    ];
    
    const matrix = new THREE.Matrix4();
    positions.forEach((pos, i) => {
        matrix.setPosition(pos[0], pos[1], pos[2]);
        buildingMesh.setMatrixAt(i, matrix);
    });
    buildingMesh.updateMatrix();
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    scene.add(buildingMesh);
}

function updateRoof() {
    // Remove existing roof and building
    if (roof) scene.remove(roof);
    if (building) scene.remove(building);
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const pitch = parseFloat(document.getElementById('roofPitch').value);
    
    // Update display values
    document.getElementById('widthValue').textContent = width;
    document.getElementById('lengthValue').textContent = length;
    document.getElementById('pitchValue').textContent = pitch;
    
    // Create building base
    const buildingGeometry = new THREE.BoxGeometry(width, 15, length);
    building = new THREE.Mesh(buildingGeometry, materials.building);
    building.position.y = 7.5;
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
    
    // Create roof based on type
    createRoof(width, length, pitch);
    
    // Update metrics
    updateMetrics();
}

function createRoof(width, length, pitch) {
    const roofGroup = new THREE.Group();
    
    switch (roofType) {
        case 'gabled':
            createGabledRoof(roofGroup, width, length, pitch);
            break;
        case 'hip':
            createHipRoof(roofGroup, width, length, pitch);
            break;
        case 'shed':
            createShedRoof(roofGroup, width, length, pitch);
            break;
        case 'flat':
            createFlatRoof(roofGroup, width, length);
            break;
        default:
            createGabledRoof(roofGroup, width, length, pitch);
    }
    
    roofGroup.position.y = 15;
    roofGroup.castShadow = true;
    roofGroup.receiveShadow = true;
    scene.add(roofGroup);
    roof = roofGroup;
}

function createGabledRoof(group, width, length, pitch) {
    const height = Math.tan(pitch * Math.PI / 180) * (width / 2);
    
    // Create two roof planes
    const roofGeometry = new THREE.PlaneGeometry(Math.sqrt((width/2)**2 + height**2), length);
    
    const roof1 = new THREE.Mesh(roofGeometry, materials.roof);
    roof1.rotation.z = Math.atan(height / (width/2));
    roof1.position.set(-width/4, height/2, 0);
    
    const roof2 = new THREE.Mesh(roofGeometry, materials.roof);
    roof2.rotation.z = -Math.atan(height / (width/2));
    roof2.position.set(width/4, height/2, 0);
    
    group.add(roof1, roof2);
}

function createHipRoof(group, width, length, pitch) {
    const height = Math.tan(pitch * Math.PI / 180) * Math.min(width, length) / 4;
    
    const roofGeometry = new THREE.ConeGeometry(Math.max(width, length) * 0.7, height, 4);
    const roofMesh = new THREE.Mesh(roofGeometry, materials.roof);
    roofMesh.position.y = height / 2;
    roofMesh.rotation.y = Math.PI / 4;
    
    group.add(roofMesh);
}

function createShedRoof(group, width, length, pitch) {
    const height = Math.tan(pitch * Math.PI / 180) * width;
    
    const roofGeometry = new THREE.PlaneGeometry(Math.sqrt(width**2 + height**2), length);
    const roofMesh = new THREE.Mesh(roofGeometry, materials.roof);
    roofMesh.rotation.z = Math.atan(height / width);
    roofMesh.position.set(0, height/2, 0);
    
    group.add(roofMesh);
}

function createFlatRoof(group, width, length) {
    const roofGeometry = new THREE.PlaneGeometry(width, length);
    const roofMesh = new THREE.Mesh(roofGeometry, materials.roof);
    roofMesh.rotation.x = -Math.PI / 2;
    roofMesh.position.y = 1;
    
    group.add(roofMesh);
}

function changeRoofType() {
    roofType = document.getElementById('roofType').value;
    updateRoof();
}

function setZoneMode(type) {
    currentZoneType = type;
    
    // Update button states
    document.querySelectorAll('.zone-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(type + 'Btn').classList.add('active');
}

function addZone(x, z) {
    const zoneGeometry = new THREE.BoxGeometry(8, 1, 8);
    const zoneMaterial = new THREE.MeshLambertMaterial({ 
        color: zoneColors[currentZoneType],
        transparent: true,
        opacity: 0.8
    });
    
    const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    zone.position.set(x, 16, z);
    zone.userData = { type: currentZoneType };
    
    scene.add(zone);
    zones.push(zone);
    
    updateMetrics();
}

function clearZones() {
    zones.forEach(zone => scene.remove(zone));
    zones = [];
    updateMetrics();
}

function loadPrefab(type) {
    clearZones();
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    
    let layout;
    switch (type) {
        case 'residential':
            layout = [
                { type: 'solar', x: 0, z: -length/4, count: 2 },
                { type: 'green', x: 0, z: length/4, count: 2 }
            ];
            break;
        case 'commercial':
            layout = [
                { type: 'solar', x: -width/4, z: 0, count: 3 },
                { type: 'water', x: width/4, z: 0, count: 1 }
            ];
            break;
        case 'industrial':
            layout = [
                { type: 'solar', x: 0, z: 0, count: 4 }
            ];
            break;
        case 'school':
            layout = [
                { type: 'green', x: -width/4, z: 0, count: 2 },
                { type: 'social', x: width/4, z: 0, count: 1 }
            ];
            break;
    }
    
    layout.forEach(item => {
        for (let i = 0; i < item.count; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetZ = (Math.random() - 0.5) * 20;
            currentZoneType = item.type;
            addZone(item.x + offsetX, item.z + offsetZ);
        }
    });
}

function generateLayout(priority) {
    clearZones();
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    
    let zoneTypes;
    switch (priority) {
        case 'energy':
            zoneTypes = ['solar', 'solar', 'solar', 'green'];
            break;
        case 'environment':
            zoneTypes = ['green', 'green', 'water', 'solar'];
            break;
        case 'balanced':
            zoneTypes = ['solar', 'green', 'water', 'social'];
            break;
        case 'cost':
            zoneTypes = ['green', 'green', 'social', 'water'];
            break;
    }
    
    zoneTypes.forEach((type, i) => {
        const x = (Math.random() - 0.5) * width * 0.8;
        const z = (Math.random() - 0.5) * length * 0.8;
        currentZoneType = type;
        addZone(x, z);
    });
}

function optimizeLayout() {
    // Simple optimization - just rearrange existing zones
    zones.forEach(zone => {
        zone.position.x += (Math.random() - 0.5) * 5;
        zone.position.z += (Math.random() - 0.5) * 5;
    });
    updateMetrics();
}

function updateMetrics() {
    const totalArea = zones.length * 64; // 8x8 = 64 m² per zone
    const solarArea = zones.filter(z => z.userData.type === 'solar').length * 64;
    const greenArea = zones.filter(z => z.userData.type === 'green').length * 64;
    const energyOutput = solarArea * 15; // Simplified calculation
    
    document.getElementById('totalArea').textContent = totalArea;
    document.getElementById('solarArea').textContent = solarArea;
    document.getElementById('greenArea').textContent = greenArea;
    document.getElementById('energyOutput').textContent = energyOutput;
}

function updateClimate() {
    const location = document.getElementById('location').value;
    const weatherInfo = document.getElementById('weatherInfo');
    
    const climateData = {
        copenhagen: 'Solar: 1000 kWh/m²/yr | Rain: 600mm/yr',
        stockholm: 'Solar: 950 kWh/m²/yr | Rain: 550mm/yr',
        oslo: 'Solar: 900 kWh/m²/yr | Rain: 800mm/yr',
        berlin: 'Solar: 1100 kWh/m²/yr | Rain: 580mm/yr',
        amsterdam: 'Solar: 1050 kWh/m²/yr | Rain: 850mm/yr'
    };
    
    weatherInfo.textContent = climateData[location];
}

function exportModel() {
    alert('3D model export functionality would be implemented here');
}

function generateReport() {
    alert('Detailed PDF report generation would be implemented here');
}

// Mouse interaction
function onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    if (roof) {
        const intersects = raycaster.intersectObject(roof, true);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            addZone(point.x, point.z);
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('resize', onWindowResize);
window.addEventListener('click', onMouseClick);

// Initialize when page loads
window.addEventListener('load', init);