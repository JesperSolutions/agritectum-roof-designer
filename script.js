// 3D Roof Designer with Three.js
let scene, camera, renderer, controls;
let roofMesh, roofGeometry;
let zones = [];
let currentZoneMode = 'solar';
let raycaster, mouse;

// Zone configurations
const zoneConfigs = {
    solar: { color: 0xffa500, height: 0.3, name: 'Solar Panels' },
    green: { color: 0x4CAF50, height: 0.2, name: 'Green Roof' },
    water: { color: 0x2196F3, height: 0.1, name: 'Water System' },
    social: { color: 0x9C27B0, height: 0.05, name: 'Social Space' }
};

// Initialize the 3D scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 25, 30);
    
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
    
    // Lighting
    setupLighting();
    
    // Ground
    createGround();
    
    // Initial roof
    createRoof();
    
    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Start animation loop
    animate();
    
    // Initial zone mode
    setZoneMode('solar');
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // Helper for sun direction
    // const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(helper);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createRoof() {
    // Remove existing roof
    if (roofMesh) {
        scene.remove(roofMesh);
    }
    
    // Get parameters
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const pitch = parseFloat(document.getElementById('roofPitch').value);
    
    // Update display values
    document.getElementById('widthValue').textContent = width;
    document.getElementById('lengthValue').textContent = length;
    document.getElementById('pitchValue').textContent = pitch;
    
    // Create gabled roof geometry
    const roofHeight = Math.tan(pitch * Math.PI / 180) * (width / 2);
    
    roofGeometry = new THREE.BufferGeometry();
    
    // Vertices for a gabled roof
    const vertices = new Float32Array([
        // Front face (triangle)
        -width/2, 0, length/2,
        width/2, 0, length/2,
        0, roofHeight, length/2,
        
        // Back face (triangle)
        -width/2, 0, -length/2,
        0, roofHeight, -length/2,
        width/2, 0, -length/2,
        
        // Left roof slope
        -width/2, 0, length/2,
        0, roofHeight, length/2,
        0, roofHeight, -length/2,
        -width/2, 0, length/2,
        0, roofHeight, -length/2,
        -width/2, 0, -length/2,
        
        // Right roof slope
        width/2, 0, length/2,
        width/2, 0, -length/2,
        0, roofHeight, -length/2,
        width/2, 0, length/2,
        0, roofHeight, -length/2,
        0, roofHeight, length/2,
    ]);
    
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roofGeometry.computeVertexNormals();
    
    const roofMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide 
    });
    
    roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    scene.add(roofMesh);
    
    updateMetrics();
}

function setZoneMode(mode) {
    currentZoneMode = mode;
    
    // Update button states
    document.querySelectorAll('.zone-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'Btn').classList.add('active');
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
    
    // Create zone geometry
    const zoneGeometry = new THREE.BoxGeometry(size, config.height, size);
    const zoneMaterial = new THREE.MeshLambertMaterial({ 
        color: config.color,
        transparent: true,
        opacity: 0.8
    });
    
    const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
    zoneMesh.position.set(x, config.height / 2, z);
    zoneMesh.castShadow = true;
    
    // Store zone data
    const zone = {
        mesh: zoneMesh,
        type: type,
        area: size * size,
        position: { x, z }
    };
    
    zones.push(zone);
    scene.add(zoneMesh);
    
    updateMetrics();
}

function clearZones() {
    zones.forEach(zone => {
        scene.remove(zone.mesh);
    });
    zones = [];
    updateMetrics();
}

function generateLayout() {
    clearZones();
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    
    // Generate zones automatically
    const zoneTypes = ['solar', 'solar', 'green', 'water', 'social'];
    const numZones = 8 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numZones; i++) {
        const x = (Math.random() - 0.5) * width * 0.8;
        const z = (Math.random() - 0.5) * length * 0.8;
        const type = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
        
        addZone(x, z, type);
    }
}

function updateMetrics() {
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const totalArea = width * length;
    
    let solarArea = 0, greenArea = 0, waterArea = 0, socialArea = 0;
    
    zones.forEach(zone => {
        switch(zone.type) {
            case 'solar': solarArea += zone.area; break;
            case 'green': greenArea += zone.area; break;
            case 'water': waterArea += zone.area; break;
            case 'social': socialArea += zone.area; break;
        }
    });
    
    // Calculate energy output (simplified)
    const energyOutput = Math.round(solarArea * 150); // 150 kWh/m²/year
    
    // Update display
    document.getElementById('totalArea').textContent = Math.round(totalArea);
    document.getElementById('solarArea').textContent = Math.round(solarArea);
    document.getElementById('greenArea').textContent = Math.round(greenArea);
    document.getElementById('energyOutput').textContent = energyOutput;
}

function updateRoof() {
    createRoof();
}

function exportModel() {
    // This would export the 3D model - placeholder for now
    alert('3D model export functionality would be implemented here.\n\nCould export to formats like:\n• OBJ\n• STL\n• GLTF\n• PLY');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener('load', init);