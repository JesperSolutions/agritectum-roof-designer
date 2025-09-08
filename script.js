// Advanced 3D Roof Designer with Enhanced Building and Environment
let scene, camera, renderer, controls;
let buildingGroup, roofMesh, roofGeometry;
let zones = [];
let currentZoneMode = 'solar';
let currentRoofType = 'gabled';
let raycaster, mouse;
let currentLocation = 'copenhagen';
let textureLoader;

// Enhanced zone configurations with more realistic properties
const zoneConfigs = {
    solar: { 
        color: 0x1a237e, 
        height: 0.15, 
        name: 'Solar Panels',
        efficiency: 0.20,
        cost: 1500,
        maintenance: 0.02,
        metallic: 0.8,
        roughness: 0.2
    },
    green: { 
        color: 0x2e7d32, 
        height: 0.3, 
        name: 'Green Roof',
        efficiency: 0.85,
        cost: 800,
        maintenance: 0.05,
        metallic: 0.0,
        roughness: 0.9
    },
    water: { 
        color: 0x0277bd, 
        height: 0.1, 
        name: 'Water System',
        efficiency: 0.70,
        cost: 600,
        maintenance: 0.03,
        metallic: 0.1,
        roughness: 0.1
    },
    social: { 
        color: 0x7b1fa2, 
        height: 0.05, 
        name: 'Social Space',
        efficiency: 1.0,
        cost: 400,
        maintenance: 0.01,
        metallic: 0.0,
        roughness: 0.7
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
        buildingHeight: 8,
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
        buildingHeight: 15,
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
        buildingHeight: 12,
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
        buildingHeight: 10,
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
    scene.fog = new THREE.Fog(0x87CEEB, 100, 800);
    
    // Camera with better positioning
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(60, 40, 60);
    
    // Enhanced renderer with better quality
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Enhanced controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20;
    controls.maxDistance = 300;
    controls.target.set(0, 10, 0);
    
    // Initialize texture loader
    textureLoader = new THREE.TextureLoader();
    
    // Advanced lighting setup
    setupAdvancedLighting();
    
    // Enhanced environment
    createRealisticEnvironment();
    
    // Initial building with roof
    createBuilding();
    
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
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Main sun light with realistic settings
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-50, 30, -50);
    scene.add(fillLight);
    
    // Sky hemisphere light for realistic outdoor lighting
    const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.6);
    scene.add(skyLight);
    
    // Point lights for accent lighting
    const accentLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
    accentLight1.position.set(30, 20, 30);
    scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    accentLight2.position.set(-30, 20, -30);
    scene.add(accentLight2);
}

function createRealisticEnvironment() {
    // Enhanced ground with realistic grass texture
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    
    // Create procedural grass-like material
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4a7c59,
        transparent: false
    });
    
    // Add some vertex displacement for natural ground variation
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, Math.random() * 0.5);
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add realistic environmental elements
    createDetailedTrees();
    createCityBuildings();
    createStreetElements();
    createRealisticSkybox();
}

function createDetailedTrees() {
    for (let i = 0; i < 15; i++) {
        const treeGroup = new THREE.Group();
        
        // Enhanced trunk with texture-like material
        const trunkGeometry = new THREE.CylinderGeometry(0.8, 1.2, 12, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a3728,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Multiple foliage layers for realistic appearance
        const foliageColors = [0x2d5016, 0x3a6b1c, 0x4a7c22];
        for (let j = 0; j < 3; j++) {
            const foliageGeometry = new THREE.SphereGeometry(4 + j, 12, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                color: foliageColors[j],
                transparent: true,
                opacity: 0.8 - j * 0.1
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 12 + j * 2;
            foliage.position.x = (Math.random() - 0.5) * 2;
            foliage.position.z = (Math.random() - 0.5) * 2;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
        
        // Random positioning around the scene
        const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 100 + Math.random() * 80;
        treeGroup.position.x = Math.cos(angle) * distance;
        treeGroup.position.z = Math.sin(angle) * distance;
        treeGroup.scale.setScalar(0.8 + Math.random() * 0.4);
        
        scene.add(treeGroup);
    }
}

function createCityBuildings() {
    for (let i = 0; i < 12; i++) {
        const buildingGroup = new THREE.Group();
        
        // Varied building dimensions
        const width = 15 + Math.random() * 25;
        const height = 20 + Math.random() * 40;
        const depth = 12 + Math.random() * 20;
        
        // Main building structure
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.1, 0.6 + Math.random() * 0.3)
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        buildingGroup.add(building);
        
        // Add windows
        createBuildingWindows(buildingGroup, width, height, depth);
        
        // Position buildings in a city-like pattern
        const angle = (i / 12) * Math.PI * 2 + Math.PI / 6;
        const distance = 150 + Math.random() * 100;
        buildingGroup.position.x = Math.cos(angle) * distance;
        buildingGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(buildingGroup);
    }
}

function createBuildingWindows(buildingGroup, width, height, depth) {
    const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    
    // Front and back windows
    for (let floor = 1; floor < height / 4; floor++) {
        for (let col = 0; col < width / 4; col++) {
            if (Math.random() > 0.3) { // Some windows are lit
                const windowGeometry = new THREE.PlaneGeometry(2, 2);
                const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
                window1.position.set(
                    -width/2 + col * 4 + 2,
                    floor * 4,
                    depth/2 + 0.1
                );
                buildingGroup.add(window1);
                
                const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
                window2.position.set(
                    -width/2 + col * 4 + 2,
                    floor * 4,
                    -depth/2 - 0.1
                );
                window2.rotation.y = Math.PI;
                buildingGroup.add(window2);
            }
        }
    }
}

function createStreetElements() {
    // Street lamps
    for (let i = 0; i < 8; i++) {
        const lampGroup = new THREE.Group();
        
        // Lamp post
        const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 4;
        post.castShadow = true;
        lampGroup.add(post);
        
        // Lamp head
        const headGeometry = new THREE.SphereGeometry(1, 8, 6);
        const headMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 8.5;
        lampGroup.add(head);
        
        // Position along paths
        const angle = (i / 8) * Math.PI * 2;
        const distance = 80;
        lampGroup.position.x = Math.cos(angle) * distance;
        lampGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(lampGroup);
    }
    
    // Pathways
    const pathGeometry = new THREE.PlaneGeometry(200, 4);
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    
    const path1 = new THREE.Mesh(pathGeometry, pathMaterial);
    path1.rotation.x = -Math.PI / 2;
    path1.position.y = 0.1;
    path1.receiveShadow = true;
    scene.add(path1);
    
    const path2 = new THREE.Mesh(pathGeometry, pathMaterial);
    path2.rotation.x = -Math.PI / 2;
    path2.rotation.z = Math.PI / 2;
    path2.position.y = 0.1;
    path2.receiveShadow = true;
    scene.add(path2);
}

function createRealisticSkybox() {
    // Enhanced sky with gradient
    const skyGeometry = new THREE.SphereGeometry(800, 32, 32);
    
    // Create sky gradient material
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0xffffff) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    // Add clouds
    createClouds();
}

function createClouds() {
    const cloudGroup = new THREE.Group();
    
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(10 + Math.random() * 10, 8, 6);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        
        cloud.position.set(
            (Math.random() - 0.5) * 400,
            50 + Math.random() * 30,
            (Math.random() - 0.5) * 400
        );
        
        cloud.scale.setScalar(0.5 + Math.random() * 0.5);
        cloudGroup.add(cloud);
    }
    
    scene.add(cloudGroup);
}

function createBuilding() {
    // Remove existing building
    if (buildingGroup) {
        scene.remove(buildingGroup);
    }
    
    buildingGroup = new THREE.Group();
    
    const width = parseFloat(document.getElementById('roofWidth').value);
    const length = parseFloat(document.getElementById('roofLength').value);
    const pitch = parseFloat(document.getElementById('roofPitch').value);
    const roofType = document.getElementById('roofType').value;
    
    // Get building height from current prefab or default
    let buildingHeight = 8;
    const currentPrefab = Object.values(prefabConfigs).find(config => config.roofType === roofType);
    if (currentPrefab) {
        buildingHeight = currentPrefab.buildingHeight;
    }
    
    // Update display values
    document.getElementById('widthValue').textContent = width;
    document.getElementById('lengthValue').textContent = length;
    document.getElementById('pitchValue').textContent = pitch;
    
    // Create realistic building base
    createBuildingBase(width, length, buildingHeight);
    
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
    
    roofMesh.position.y = buildingHeight;
    buildingGroup.add(roofMesh);
    
    scene.add(buildingGroup);
    updateMetrics();
}

function createBuildingBase(width, length, height) {
    // Main building structure with realistic materials
    const buildingGeometry = new THREE.BoxGeometry(width, height, length);
    const buildingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xd4c5b0,
        roughness: 0.8
    });
    
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    buildingGroup.add(buildingMesh);
    
    // Add building details
    createBuildingDetails(width, length, height);
}

function createBuildingDetails(width, length, height) {
    // Windows
    const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.7
    });
    
    // Front and back facades
    const windowsPerRow = Math.floor(width / 4);
    const floors = Math.floor(height / 3);
    
    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < windowsPerRow; col++) {
            if (Math.random() > 0.2) { // 80% chance of window
                // Front windows
                const windowGeometry = new THREE.PlaneGeometry(2, 2);
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.5) * (height / floors),
                    length/2 + 0.1
                );
                buildingGroup.add(frontWindow);
                
                // Back windows
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.5) * (height / floors),
                    -length/2 - 0.1
                );
                backWindow.rotation.y = Math.PI;
                buildingGroup.add(backWindow);
            }
        }
    }
    
    // Side windows
    const sideWindowsPerRow = Math.floor(length / 4);
    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < sideWindowsPerRow; col++) {
            if (Math.random() > 0.3) {
                const windowGeometry = new THREE.PlaneGeometry(2, 2);
                
                // Left side
                const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                leftWindow.position.set(
                    -width/2 - 0.1,
                    (floor + 0.5) * (height / floors),
                    -length/2 + (col + 0.5) * (length / sideWindowsPerRow)
                );
                leftWindow.rotation.y = Math.PI / 2;
                buildingGroup.add(leftWindow);
                
                // Right side
                const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                rightWindow.position.set(
                    width/2 + 0.1,
                    (floor + 0.5) * (height / floors),
                    -length/2 + (col + 0.5) * (length / sideWindowsPerRow)
                );
                rightWindow.rotation.y = -Math.PI / 2;
                buildingGroup.add(rightWindow);
            }
        }
    }
    
    // Entrance door
    const doorGeometry = new THREE.PlaneGeometry(3, 4);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, length/2 + 0.05);
    buildingGroup.add(door);
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
    
    // Enhanced roof material with realistic appearance
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.8
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
        side: THREE.DoubleSide,
        roughness: 0.9
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
    createBuilding();
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
    
    // Update building
    createBuilding();
    
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
            newZone.position.x += (Math.random() - 0.5) * 4; // Small position adjustments
            newZone.position.z += (Math.random() - 0.5) * 4;
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
        addZone(zone.position.x, zone.position.z, zone.type);
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
        // Convert from world coordinates to roof-relative coordinates
        const roofY = buildingGroup ? parseFloat(document.getElementById('roofWidth').value) * 0.1 : 8;
        addZone(point.x, point.z - roofY, currentZoneMode);
    }
}

function addZone(x, z, type) {
    const config = zoneConfigs[type];
    const size = 3 + Math.random() * 4; // Random size between 3-7m
    
    // Create enhanced zone geometry with realistic materials
    const zoneGeometry = new THREE.BoxGeometry(size, config.height, size);
    const zoneMaterial = new THREE.MeshLambertMaterial({ 
        color: config.color,
        transparent: true,
        opacity: 0.9,
        roughness: config.roughness,
        metalness: config.metallic
    });
    
    const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
    
    // Position relative to roof
    const buildingHeight = buildingGroup ? 
        Object.values(prefabConfigs).find(c => c.roofType === currentRoofType)?.buildingHeight || 8 : 8;
    
    zoneMesh.position.set(x, buildingHeight + config.height / 2, z);
    zoneMesh.castShadow = true;
    zoneMesh.receiveShadow = true;
    
    // Add zone label with better visibility
    const labelGeometry = new THREE.PlaneGeometry(size * 0.8, 1);
    const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(x, buildingHeight + config.height + 1, z);
    
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
    createBuilding();
}

function generateReport() {
    const metrics = calculateAdvancedMetrics();
    const climate = climateData[currentLocation];
    
    const report = `
ADVANCED 3D ROOF ANALYSIS REPORT
================================

Location: ${currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)}
Climate: ${climate.solar} kWh/m²/yr solar, ${climate.rainfall}mm rainfall

Building Specifications:
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
        alert(`Exporting as ${format}...\n\nThis would generate a ${format} file with:\n• Complete 3D building geometry\n• Realistic materials and textures\n• Zone placement data\n• Performance metrics\n• Analysis results`);
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