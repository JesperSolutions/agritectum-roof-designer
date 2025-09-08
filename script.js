// Advanced 3D Roof Designer with Enhanced Building and Environment
let scene, camera, renderer, controls;
let buildingGroup, roofMesh, roofGeometry;
let zones = [];
let currentZoneMode = 'solar';
let currentRoofType = 'gabled';
let raycaster, mouse;
let currentLocation = 'copenhagen';
let textureLoader, cubeTextureLoader;
let weatherSystem, particleSystem, timeOfDay = 12;
let animationMixers = [];
let postProcessing = {};

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
        efficiency: 0.90,
        cost: 400,
        maintenance: 0.01,
        metallic: 0.0,
        roughness: 0.7
    }
};

// Shared materials to reduce uniforms
const sharedMaterials = {
    building: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    window: new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 }),
    roof: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
    ground: new THREE.MeshLambertMaterial({ color: 0x228b22 }),
    tree: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
    foliage: new THREE.MeshLambertMaterial({ color: 0x228b22 }),
    solar: new THREE.MeshLambertMaterial({ color: 0x1a1a2e }),
    green: new THREE.MeshLambertMaterial({ color: 0x228b22 }),
    water: new THREE.MeshLambertMaterial({ color: 0x4169e1 }),
    social: new THREE.MeshLambertMaterial({ color: 0x9932cc })
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
    
    // Initialize texture loaders
    textureLoader = new THREE.TextureLoader();
    cubeTextureLoader = new THREE.CubeTextureLoader();
    
    // Create dynamic skybox
    createDynamicSkybox();
    
    // Enhanced fog with time-based color
    updateFogAndLighting();
    
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
    renderer.physicallyCorrectLights = true;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Enhanced controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20;
    controls.maxDistance = 300;
    controls.target.set(0, 10, 0);
    
    // Advanced lighting setup
    setupAdvancedLighting();
    
    // Enhanced environment
    createRealisticEnvironment();
    
    // Weather and particle systems
    initializeWeatherSystem();
    
    // Post-processing effects
    setupPostProcessing();
    
    // Initial building with roof
    createBuilding();
    
    // Interaction setup
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    // Time controls
    setupTimeControls();
    
    // Start animation loop
    animate();
    
    // Initial setup
    setZoneMode('solar');
    updateClimate();
}

function setupAdvancedLighting() {
    // Dynamic ambient light that changes with time
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);
    
    // Dynamic sun light with realistic day/night cycle
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    updateSunPosition(sunLight);
    sunLight.name = 'sunLight';
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
    sunLight.shadow.radius = 10;
    scene.add(sunLight);
    
    // Dynamic fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(-50, 30, -50);
    fillLight.name = 'fillLight';
    scene.add(fillLight);
    
    // Dynamic hemisphere light
    const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.8);
    skyLight.name = 'skyLight';
    scene.add(skyLight);
    
    // Accent lights with realistic falloff
    const accentLight1 = new THREE.PointLight(0xffffff, 1.0, 100, 2);
    accentLight1.position.set(30, 25, 30);
    accentLight1.castShadow = true;
    accentLight1.shadow.mapSize.width = 1024;
    accentLight1.shadow.mapSize.height = 1024;
    scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0xffffff, 1.0, 100, 2);
    accentLight2.position.set(-30, 25, -30);
    accentLight2.castShadow = true;
    accentLight2.shadow.mapSize.width = 1024;
    accentLight2.shadow.mapSize.height = 1024;
    scene.add(accentLight2);
}

function updateSunPosition(sunLight) {
    const hour = timeOfDay;
    const angle = (hour - 6) * (Math.PI / 12); // 6 AM to 6 PM cycle
    const elevation = Math.sin(angle) * 100;
    const azimuth = Math.cos(angle) * 100;
    
    sunLight.position.set(azimuth, Math.max(elevation, 10), 50);
    
    // Change sun color based on time
    if (hour < 8 || hour > 18) {
        sunLight.color.setHex(0xffa500); // Orange for sunrise/sunset
        sunLight.intensity = 0.8;
    } else {
        sunLight.color.setHex(0xffffff); // White for midday
        sunLight.intensity = 1.5;
    }
}

function createDynamicSkybox() {
    // Create procedural sky with time-based colors
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0xffffff) },
            offset: { value: 33 },
            exponent: { value: 0.6 },
            time: { value: timeOfDay }
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
            uniform float time;
            varying vec3 vWorldPosition;
            
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                
                // Time-based color mixing
                vec3 dayTop = topColor;
                vec3 dayBottom = bottomColor;
                vec3 sunsetTop = vec3(1.0, 0.4, 0.1);
                vec3 sunsetBottom = vec3(1.0, 0.8, 0.4);
                vec3 nightTop = vec3(0.0, 0.0, 0.2);
                vec3 nightBottom = vec3(0.1, 0.1, 0.3);
                
                float dayFactor = smoothstep(6.0, 8.0, time) * (1.0 - smoothstep(18.0, 20.0, time));
                float sunsetFactor = (smoothstep(5.0, 7.0, time) * (1.0 - smoothstep(7.0, 9.0, time))) +
                                   (smoothstep(17.0, 19.0, time) * (1.0 - smoothstep(19.0, 21.0, time)));
                
                vec3 finalTopColor = mix(mix(nightTop, sunsetTop, sunsetFactor), dayTop, dayFactor);
                vec3 finalBottomColor = mix(mix(nightBottom, sunsetBottom, sunsetFactor), dayBottom, dayFactor);
                
                gl_FragColor = vec4(mix(finalBottomColor, finalTopColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.name = 'dynamicSky';
    scene.add(sky);
}

function updateFogAndLighting() {
    // Dynamic fog based on time of day
    const hour = timeOfDay;
    let fogColor, fogNear, fogFar;
    
    if (hour >= 6 && hour <= 18) {
        // Daytime
        fogColor = new THREE.Color(0x87CEEB);
        fogNear = 100;
        fogFar = 800;
    } else if (hour >= 18 && hour <= 20 || hour >= 5 && hour <= 7) {
        // Sunset/Sunrise
        fogColor = new THREE.Color(0xffa500);
        fogNear = 80;
        fogFar = 600;
    } else {
        // Night
        fogColor = new THREE.Color(0x191970);
        fogNear = 60;
        fogFar = 400;
    }
    
    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
}

function initializeWeatherSystem() {
    weatherSystem = {
        rainIntensity: 0,
        windStrength: 0,
        cloudCover: 0.3
    };
    
    createWeatherParticles();
}

function createWeatherParticles() {
    // Rain particle system
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = 1000;
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = new Float32Array(rainCount * 3);
    
    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 400;
        rainPositions[i + 1] = Math.random() * 200 + 50;
        rainPositions[i + 2] = (Math.random() - 0.5) * 400;
        
        rainVelocities[i] = 0;
        rainVelocities[i + 1] = -2 - Math.random() * 3;
        rainVelocities[i + 2] = 0;
    }
    
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 3));
    
    const rainMaterial = new THREE.PointsMaterial({
        color: 0x87CEEB,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    particleSystem = new THREE.Points(rainGeometry, rainMaterial);
    particleSystem.visible = false;
    scene.add(particleSystem);
}

function setupTimeControls() {
    // Add time control to the UI
    const timeControl = document.createElement('div');
    timeControl.className = 'control-group';
    timeControl.innerHTML = `
        <label>Time of Day</label>
        <input type="range" id="timeSlider" min="0" max="24" value="12" step="0.5" oninput="updateTimeOfDay(this.value)">
        <small>Time: <span id="timeValue">12:00</span></small>
        <button onclick="toggleWeather()">Toggle Rain</button>
    `;
    
    const controls = document.getElementById('controls');
    controls.appendChild(timeControl);
}

function setupPostProcessing() {
    // Placeholder for post-processing setup
    postProcessing = {};
}

function createRealisticEnvironment() {
    // Enhanced ground with realistic materials
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    
    // Add height variation to ground
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, Math.random() * 2 - 1);
    }
    positions.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3a5f3a,
        roughness: 0.9
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);
    
    // Create realistic trees
    createRealisticTrees();
    
    // Create city buildings
    createCityBuildings();
    
    // Create street elements
    createStreetElements();
    
    // Create urban details
    createUrbanDetails();
    
    // Create clouds
    createClouds();
}

function createRealisticTrees() {
    // Create fewer buildings with shared materials
    for (let i = 0; i < 8; i++) {
        const treeGroup = new THREE.Group();
        
        // Create realistic bark texture with shader
        const trunkGeometry = new THREE.CylinderGeometry(0.6 + Math.random() * 0.6, 1.0 + Math.random() * 0.8, 8 + Math.random() * 8, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.08, 0.6, 0.2 + Math.random() * 0.2),
            roughness: 0.9,
            metalness: 0.0,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });
        
        // Add bark texture variation
        const positions = trunkGeometry.attributes.position;
        for (let j = 0; j < positions.count; j++) {
            const x = positions.getX(j);
            const y = positions.getY(j);
            const z = positions.getZ(j);
            const noise = Math.sin(y * 5) * Math.cos(Math.atan2(z, x) * 8) * 0.05;
            positions.setX(j, x + noise);
            positions.setZ(j, z + noise);
        }
        positions.needsUpdate = true;
        trunkGeometry.computeVertexNormals();
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4 + Math.random() * 4;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Create more realistic foliage with multiple layers
        const foliageColors = [0x1a4d0a, 0x2d5016, 0x3a6b1c, 0x4a7c22];
        const numLayers = 3 + Math.floor(Math.random() * 2);
        
        for (let j = 0; j < numLayers; j++) {
            const foliageGeometry = new THREE.IcosahedronGeometry(3 + j * 0.5 + Math.random() * 2, 2);
            
            // Add organic deformation to foliage
            const foliagePositions = foliageGeometry.attributes.position;
            for (let k = 0; k < foliagePositions.count; k++) {
                const x = foliagePositions.getX(k);
                const y = foliagePositions.getY(k);
                const z = foliagePositions.getZ(k);
                const deformation = (Math.random() - 0.5) * 0.5;
                foliagePositions.setX(k, x + deformation);
                foliagePositions.setY(k, y + deformation);
                foliagePositions.setZ(k, z + deformation);
            }
            foliagePositions.needsUpdate = true;
            foliageGeometry.computeVertexNormals();
            
            const foliageMaterial = new THREE.MeshStandardMaterial({ 
                color: foliageColors[j % foliageColors.length],
                transparent: true,
                opacity: 0.9 - j * 0.05,
                roughness: 0.8,
                metalness: 0.0
            });
            
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 8 + j * 1.5 + Math.random() * 2;
            foliage.position.x = (Math.random() - 0.5) * 3;
            foliage.position.z = (Math.random() - 0.5) * 3;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            treeGroup.add(foliage);
        }
        
        // Add branches
        for (let j = 0; j < 5 + Math.random() * 5; j++) {
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2 + Math.random() * 3, 6);
            const branchMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x4a3728,
                roughness: 0.9
            });
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            branch.position.set(
                (Math.random() - 0.5) * 2,
                4 + Math.random() * 6,
                (Math.random() - 0.5) * 2
            );
            branch.rotation.z = (Math.random() - 0.5) * Math.PI / 2;
            branch.rotation.x = (Math.random() - 0.5) * Math.PI / 4;
            branch.castShadow = true;
            treeGroup.add(branch);
        }
        
        // Random positioning around the scene
        const angle = (i / 25) * Math.PI * 2 + Math.random() * 0.8;
        const distance = 80 + Math.random() * 120;
        treeGroup.position.x = Math.cos(angle) * distance;
        treeGroup.position.z = Math.sin(angle) * distance;
        treeGroup.scale.setScalar(0.6 + Math.random() * 0.8);
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(treeGroup);
    }
}

function createCityBuildings() {
    for (let i = 0; i < 20; i++) {
        const buildingGroup = new THREE.Group();
        
        // Varied building dimensions
        const width = 12 + Math.random() * 30;
        const height = 15 + Math.random() * 60;
        const depth = 10 + Math.random() * 25;
        
        // Main building structure with realistic materials
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.2, 0.5 + Math.random() * 0.4),
            roughness: 0.7
        });
        const building = new THREE.Mesh(buildingGeometry, sharedMaterials.building);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        buildingGroup.add(building);
        
        // Add enhanced building details
        createEnhancedBuildingDetails(buildingGroup, width, height, depth);
        
        // Position buildings around the main building
        const angle = (i / 20) * Math.PI * 2;
        const distance = 120 + Math.random() * 80;
        buildingGroup.position.x = Math.cos(angle) * distance;
        buildingGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(buildingGroup);
    }
}

function createEnhancedBuildingDetails(buildingGroup, width, height, depth) {
    // Enhanced window materials with realistic glass
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        envMapIntensity: 1.0
    });
    
    const windowFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.3,
        metalness: 0.8
    });
    
    // Front and back windows
    const windowsPerRow = Math.floor(width / 3);
    const floors = Math.floor(height / 3.5);
    
    for (let floor = 1; floor < floors; floor++) {
        for (let col = 0; col < windowsPerRow; col++) {
            if (Math.random() > 0.15) { // 85% chance of window
                // Window frame
                const frameGeometry = new THREE.PlaneGeometry(2.2, 2.2);
                const frontFrame = new THREE.Mesh(frameGeometry, windowFrameMaterial);
                frontFrame.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.3) * (height / floors),
                    depth/2 + 0.05
                );
                buildingGroup.add(frontFrame);
                
                // Window glass
                const windowGeometry = new THREE.PlaneGeometry(1.8, 1.8);
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.3) * (height / floors),
                    depth/2 + 0.1
                );
                buildingGroup.add(frontWindow);
                
                // Back windows
                const backFrame = new THREE.Mesh(frameGeometry, windowFrameMaterial);
                backFrame.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.3) * (height / floors),
                    -depth/2 - 0.05
                );
                backFrame.rotation.y = Math.PI;
                buildingGroup.add(backFrame);
                
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    -width/2 + (col + 0.5) * (width / windowsPerRow),
                    (floor + 0.3) * (height / floors),
                    -depth/2 - 0.1
                );
                backWindow.rotation.y = Math.PI;
                buildingGroup.add(backWindow);
                
                // Add interior lighting for some windows
                if (Math.random() > 0.6) {
                    const lightColor = Math.random() > 0.5 ? 0xffffaa : 0xffffff;
                    const interiorLight = new THREE.PointLight(lightColor, 0.3, 10);
                    interiorLight.position.set(
                        -width/2 + (col + 0.5) * (width / windowsPerRow),
                        (floor + 0.3) * (height / floors),
                        0
                    );
                    buildingGroup.add(interiorLight);
                }
            }
        }
    }
    
    // Add building entrance
    const entranceGeometry = new THREE.BoxGeometry(4, 5, 0.5);
    const entranceMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, 2.5, depth/2 + 0.25);
    buildingGroup.add(entrance);
    
    // Add rooftop details
    if (Math.random() > 0.5) {
        const rooftopGeometry = new THREE.BoxGeometry(width * 0.8, 2, depth * 0.8);
        const rooftopMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.9
        });
        const rooftop = new THREE.Mesh(rooftopGeometry, rooftopMaterial);
        rooftop.position.y = height + 1;
        buildingGroup.add(rooftop);
    }
}

function createStreetElements() {
    // Enhanced street lamps with realistic lighting
    for (let i = 0; i < 16; i++) {
        const lampGroup = new THREE.Group();
        
        // Lamp post
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.25, 10, 12);
        const postMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 5;
        post.castShadow = true;
        post.receiveShadow = true;
        lampGroup.add(post);
        
        // Lamp head with realistic glow
        const headGeometry = new THREE.CylinderGeometry(0.8, 1.2, 1.5, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            roughness: 0.3,
            metalness: 0.7
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 10.5;
        head.castShadow = true;
        lampGroup.add(head);
        
        // Light source
        const lightGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffcc,
            transparent: true,
            opacity: 0.9
        });
        const lightBulb = new THREE.Mesh(lightGeometry, lightMaterial);
        lightBulb.position.y = 10.5;
        lampGroup.add(lightBulb);
        
        // Actual point light
        const streetLight = new THREE.PointLight(0xffffcc, 1.5, 30, 2);
        streetLight.position.y = 10.5;
        streetLight.castShadow = true;
        streetLight.shadow.mapSize.width = 512;
        streetLight.shadow.mapSize.height = 512;
        lampGroup.add(streetLight);
        
        // Position along paths
        const angle = (i / 16) * Math.PI * 2;
        const distance = 60 + (i % 2) * 20;
        lampGroup.position.x = Math.cos(angle) * distance;
        lampGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(lampGroup);
    }
    
    // Enhanced pathways with realistic materials
    createRealisticPaths();
}

function createRealisticPaths() {
    const pathGeometry = new THREE.PlaneGeometry(300, 6, 20, 20);
    
    // Add slight height variation to paths
    const positions = pathGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, Math.random() * 0.1);
    }
    positions.needsUpdate = true;
    pathGeometry.computeVertexNormals();
    
    const pathMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.9,
        metalness: 0.0
    });
    
    const path1 = new THREE.Mesh(pathGeometry, pathMaterial);
    path1.rotation.x = -Math.PI / 2;
    path1.position.y = 0.05;
    path1.receiveShadow = true;
    path1.castShadow = false;
    scene.add(path1);
    
    const path2 = new THREE.Mesh(pathGeometry, pathMaterial);
    path2.rotation.x = -Math.PI / 2;
    path2.rotation.z = Math.PI / 2;
    path2.position.y = 0.05;
    path2.receiveShadow = true;
    path2.castShadow = false;
    scene.add(path2);
}

function createUrbanDetails() {
    // Add urban furniture and details
    createBenches();
    createTrafficLights();
    createBusStops();
    createParkingMeters();
    createVegetation();
}

function createBenches() {
    for (let i = 0; i < 8; i++) {
        const benchGroup = new THREE.Group();
        
        // Bench seat
        const seatGeometry = new THREE.BoxGeometry(3, 0.3, 1);
        const seatMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 1;
        seat.castShadow = true;
        benchGroup.add(seat);
        
        // Bench back
        const backGeometry = new THREE.BoxGeometry(3, 1.5, 0.2);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 1.5, -0.4);
        back.castShadow = true;
        benchGroup.add(back);
        
        // Bench legs
        for (let j = 0; j < 4; j++) {
            const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
            const legMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                roughness: 0.4,
                metalness: 0.8
            });
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(
                j < 2 ? -1.2 : 1.2,
                0.5,
                j % 2 === 0 ? 0.3 : -0.3
            );
            leg.castShadow = true;
            benchGroup.add(leg);
        }
        
        // Position benches around the area
        const angle = (i / 8) * Math.PI * 2;
        const distance = 45 + Math.random() * 15;
        benchGroup.position.x = Math.cos(angle) * distance;
        benchGroup.position.z = Math.sin(angle) * distance;
        benchGroup.rotation.y = angle + Math.PI / 2;
        
        scene.add(benchGroup);
    }
}

function createTrafficLights() {
    for (let i = 0; i < 4; i++) {
        const trafficGroup = new THREE.Group();
        
        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.4,
            metalness: 0.8
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 4;
        pole.castShadow = true;
        trafficGroup.add(pole);
        
        // Traffic light box
        const boxGeometry = new THREE.BoxGeometry(1, 3, 0.5);
        const boxMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.3
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 8.5;
        box.castShadow = true;
        trafficGroup.add(box);
        
        // Traffic lights
        const colors = [0xff0000, 0xffff00, 0x00ff00];
        for (let j = 0; j < 3; j++) {
            const lightGeometry = new THREE.CircleGeometry(0.2, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: colors[j],
                transparent: true,
                opacity: j === 2 ? 0.8 : 0.3 // Green light is on
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(0, 9 - j * 0.8, 0.26);
            trafficGroup.add(light);
        }
        
        // Position at intersections
        const positions = [
            { x: 50, z: 50 },
            { x: -50, z: 50 },
            { x: 50, z: -50 },
            { x: -50, z: -50 }
        ];
        
        trafficGroup.position.set(positions[i].x, 0, positions[i].z);
        scene.add(trafficGroup);
    }
}

function createBusStops() {
    for (let i = 0; i < 3; i++) {
        const busStopGroup = new THREE.Group();
        
        // Shelter frame
        const frameGeometry = new THREE.BoxGeometry(6, 4, 3);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.9
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 2;
        frame.castShadow = true;
        busStopGroup.add(frame);
        
        // Bench inside
        const benchGeometry = new THREE.BoxGeometry(4, 0.3, 0.8);
        const benchMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4169E1,
            roughness: 0.6
        });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.y = 1;
        bench.castShadow = true;
        busStopGroup.add(bench);
        
        // Position along main roads
        const angle = (i / 3) * Math.PI * 2;
        const distance = 70;
        busStopGroup.position.x = Math.cos(angle) * distance;
        busStopGroup.position.z = Math.sin(angle) * distance;
        busStopGroup.rotation.y = angle;
        
        scene.add(busStopGroup);
    }
}

function createParkingMeters() {
    for (let i = 0; i < 12; i++) {
        const meterGroup = new THREE.Group();
        
        // Meter post
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
        const postMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.4,
            metalness: 0.8
        });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1;
        post.castShadow = true;
        meterGroup.add(post);
        
        // Meter head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4169E1,
            roughness: 0.3
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.3;
        head.castShadow = true;
        meterGroup.add(head);
        
        // Random positioning along streets
        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 20;
        meterGroup.position.x = Math.cos(angle) * distance;
        meterGroup.position.z = Math.sin(angle) * distance;
        
        scene.add(meterGroup);
    }
}

function createVegetation() {
    // Add small bushes and plants
    for (let i = 0; i < 30; i++) {
        const bushGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 1, 8, 6);
        const bushMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.3, 0.6, 0.3 + Math.random() * 0.3),
            roughness: 0.9
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        
        // Random positioning
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        bush.position.x = Math.cos(angle) * distance;
        bush.position.z = Math.sin(angle) * distance;
        bush.position.y = 0.5 + Math.random() * 0.5;
        bush.castShadow = true;
        bush.receiveShadow = true;
        
        scene.add(bush);
    }
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
        width/2, 0, length/2,  0, roofHeight, -length/2,  0, roofHeight, length/2
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
        -width/2, 0, -length/2,  -width/2, 0, length/2,  0, roofHeight, 0
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
        width/2, roofHeight, length/2,  width/2, roofHeight, 0,  width/2, roofHeight, -length/2
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
        width/4, midHeight, length/2,  width/2, 0, -length/2,  width/4, midHeight, -length/2
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
        -width/3, roofHeight, length/2,  width/3, roofHeight, -length/2,  -width/3, roofHeight, -length/2
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
        0, 0, length/2,  width/2, roofHeight, -length/2,  0, 0, -length/2
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

function updateTimeOfDay(value) {
    timeOfDay = parseFloat(value);
    document.getElementById('timeValue').textContent = `${Math.floor(timeOfDay)}:${String(Math.floor((timeOfDay % 1) * 60)).padStart(2, '0')}`;
    
    // Update sun position
    const sunLight = scene.children.find(child => child.name === 'sunLight');
    if (sunLight) {
        updateSunPosition(sunLight);
    }
    
    // Update sky
    const sky = scene.children.find(child => child.name === 'dynamicSky');
    if (sky && sky.material.uniforms) {
        sky.material.uniforms.time.value = timeOfDay;
    }
    
    // Update fog and lighting
    updateFogAndLighting();
}

function toggleWeather() {
    if (particleSystem) {
        particleSystem.visible = !particleSystem.visible;
    }
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
    
    // Update time-based effects
    const time = Date.now() * 0.001;
    
    // Update procedural ground shader
    const ground = scene.children.find(child => child.material && child.material.uniforms);
    if (ground && ground.material.uniforms.time) {
        ground.material.uniforms.time.value = time;
    }
    
    // Update weather particles
    if (particleSystem && particleSystem.visible) {
        const positions = particleSystem.geometry.attributes.position;
        const velocities = particleSystem.geometry.attributes.velocity;
        
        for (let i = 0; i < positions.count; i++) {
            positions.setY(i, positions.getY(i) + velocities.getY(i));
            
            // Reset particles that fall below ground
            if (positions.getY(i) < 0) {
                positions.setY(i, 200 + Math.random() * 50);
                positions.setX(i, (Math.random() - 0.5) * 400);
                positions.setZ(i, (Math.random() - 0.5) * 400);
            }
        }
        positions.needsUpdate = true;
    }
    
    // Animate traffic lights
    scene.traverse((child) => {
        if (child.material && child.material.color && child.geometry instanceof THREE.CircleGeometry) {
            // Simple traffic light animation
            const cycleTime = (time * 0.2) % 3;
            if (child.position.y > 9) { // Red light
                child.material.opacity = cycleTime < 1 ? 0.8 : 0.3;
            } else if (child.position.y > 8.2) { // Yellow light
                child.material.opacity = cycleTime >= 1 && cycleTime < 1.5 ? 0.8 : 0.3;
            } else { // Green light
                child.material.opacity = cycleTime >= 1.5 ? 0.8 : 0.3;
            }
        }
    });
    
    // Gentle swaying animation for trees
    scene.traverse((child) => {
        if (child.name && child.name.includes('foliage')) {
            child.rotation.z = Math.sin(time + child.position.x) * 0.02;
            child.rotation.x = Math.cos(time + child.position.z) * 0.01;
        }
    });
    
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