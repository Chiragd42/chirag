/* ============================================
   OCEAN / MOONLIGHT SHADER — 3D Ray-marched
   ============================================ */
(function () {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const pr = Math.min(window.devicePixelRatio, 1.0);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pr);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(window.innerWidth * pr, window.innerHeight * pr, 1) },
        uScrollFade: { value: 1.0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const vertexShader = `void main(){gl_Position=vec4(position,1.0);}`;

    const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3  iResolution;
uniform float uScrollFade;
uniform vec2  uMouse;

const float PI = 3.141592653;
const int   MARCH_STEPS = 8;
const float SEA_HEIGHT  = 0.6;
const float SEA_CHOPPY  = 4.0;
const float SEA_SPEED   = 0.8;
const float SEA_FREQ    = 0.16;
const vec3  SEA_BASE    = vec3(0.0, 0.09, 0.18);
const vec3  SEA_COLOR   = vec3(0.48, 0.54, 0.36);
const mat2  OCT_M       = mat2(1.6, 1.2, -1.2, 1.6);

/* ---- Gradient noise (no grid artifacts) ---- */
vec2 ghash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float gnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(dot(ghash(i), f),
                   dot(ghash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(ghash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(ghash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

/* ---- Simple hash for stars ---- */
float shash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/* ---- FBM (gradient noise) ---- */
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * gnoise(p); p = r * p; a *= 0.5; }
    return v;
}

/* ============ SEA OCTAVE (choppy waves) ============ */
float sea_octave(vec2 uv, float choppy) {
    uv += gnoise(uv);
    vec2 wv = 1.0 - abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv, swv, wv);
    return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
}

/* ---- Ocean height map ---- */
float mapHeight(vec3 p) {
    float freq = SEA_FREQ, amp = SEA_HEIGHT, choppy = SEA_CHOPPY;
    float t = 1.0 + iTime * SEA_SPEED;
    vec2 uv = p.xz;
    float d, h = 0.0;
    for (int i = 0; i < 5; i++) {
        d  = sea_octave((uv + t) * freq, choppy);
        d += sea_octave((uv - t) * freq, choppy);
        h += d * amp;
        uv *= OCT_M; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
}

/* ---- Detailed height (for normals + color) ---- */
float mapHeightDetailed(vec3 p) {
    float freq = SEA_FREQ, amp = SEA_HEIGHT, choppy = SEA_CHOPPY;
    float t = 1.0 + iTime * SEA_SPEED;
    vec2 uv = p.xz;
    float d, h = 0.0;
    for (int i = 0; i < 5; i++) {
        d  = sea_octave((uv + t) * freq, choppy);
        d += sea_octave((uv - t) * freq, choppy);
        h += d * amp;
        uv *= OCT_M; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
}

/* ---- Surface normal via finite differences ---- */
vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = mapHeightDetailed(p);
    n.x = mapHeightDetailed(vec3(p.x + eps, p.y, p.z)) - n.y;
    n.z = mapHeightDetailed(vec3(p.x, p.y, p.z + eps)) - n.y;
    n.y = eps;
    return normalize(n);
}

/* ---- Heightmap tracing (ray march) ---- */
float heightMapTrace(vec3 ro, vec3 rd, out vec3 hitPos) {
    float tm = 0.0;
    float tx = 1000.0;
    float hx = mapHeight(ro + rd * tx);
    if (hx > 0.0) { hitPos = ro + rd * tx; return tx; } // no hit
    float hm = mapHeight(ro + rd * tm);
    float tmid = 0.0;
    for (int i = 0; i < MARCH_STEPS; i++) {
        tmid = mix(tm, tx, hm / (hm - hx));
        vec3 p = ro + rd * tmid;
        float hmid = mapHeight(p);
        if (hmid < 0.0) { tx = tmid; hx = hmid; }
        else            { tm = tmid; hm = hmid; }
    }
    hitPos = ro + rd * tmid;
    return tmid;
}

/* ============ STARS ============ */
vec3 renderStars(vec3 rd) {
    vec3 col = vec3(0.0);
    // Project direction to 2D
    vec2 uv = rd.xz / (rd.y + 0.01) * 2.0;

    vec2 gUV = uv * 18.0;
    vec2 id = floor(gUV);
    vec2 gv = fract(gUV) - 0.5;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 o = vec2(float(x), float(y));
            vec2 ci = id + o;
            float n = shash(ci);
            if (n > 0.80) {
                vec2 sp = o + vec2(shash(ci + 100.0), shash(ci + 200.0)) - 0.5 - gv;
                float d = length(sp);
                float s = smoothstep(0.06, 0.0, d);
                float tw = sin(iTime * (0.8 + n * 2.0) + n * 60.0) * 0.3 + 0.7;
                vec3 sc = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.92, 0.75), shash(ci + 300.0));
                col += sc * s * tw * (0.4 + n * 0.6);
            }
        }
    }
    return col;
}

/* ============ SKY ============ */
vec3 renderSky(vec3 rd) {
    float y = max(rd.y, 0.0);
    // Richer gradient — deeper blue horizon, blacker zenith
    vec3 col = mix(vec3(0.03, 0.05, 0.13), vec3(0.002, 0.005, 0.015), smoothstep(0.0, 0.8, y));
    col += vec3(0.015, 0.03, 0.065) * exp(-y * 3.0);
    // Stars
    col += renderStars(rd) * smoothstep(0.0, 0.12, y);
    // Clouds (FBM)
    vec2 cuv = rd.xz / (rd.y + 0.3) * 1.5;
    float cloud = fbm(cuv + iTime * 0.008);
    cloud = smoothstep(0.35, 0.75, cloud);
    cloud *= smoothstep(0.0, 0.12, y) * smoothstep(0.6, 0.2, y);
    col = mix(col, vec3(0.05, 0.07, 0.12), cloud * 0.25);
    return col;
}

/* ============ SEA COLOR (with proper normals) ============ */
vec3 getSeaColor(vec3 p, vec3 n, vec3 eye, vec3 rd) {
    vec3 lightDir = normalize(vec3(0.25, 0.45, 1.0));
    // Fresnel
    float fresnel = clamp(1.0 - dot(n, -rd), 0.0, 1.0);
    fresnel = pow(fresnel, 3.0) * 0.65;
    // Simplified reflected sky (gradient only — fast)
    vec3 refl = reflect(rd, n);
    float ry = max(refl.y, 0.0);
    vec3 skyRefl = mix(vec3(0.03, 0.05, 0.13), vec3(0.002, 0.005, 0.015), smoothstep(0.0, 0.8, ry));
    skyRefl += vec3(0.015, 0.03, 0.065) * exp(-ry * 3.0);
    // Diffuse
    float diff = pow(dot(n, lightDir) * 0.4 + 0.6, 1.0);
    // Specular
    vec3 halfDir = normalize(lightDir - rd);
    float spec = pow(max(dot(n, halfDir), 0.0), 120.0) * 0.8;
    // Subsurface scattering
    float sss = pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 3.0);
    vec3 waterCol = mix(SEA_BASE, SEA_COLOR * 0.12, diff);
    vec3 col = mix(waterCol, skyRefl, fresnel);
    // Height-based foam
    float atten = max(1.0 - dot(p - eye, p - eye) * 0.001, 0.0);
    col += SEA_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
    col += vec3(sss * 0.04);
    col += vec3(0.6, 0.65, 0.8) * spec;
    return col;
}

/* ============ MAIN ============ */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 ndc = -1.0 + 2.0 * uv;
    ndc.x *= iResolution.x / iResolution.y;

    // Camera
    float camH = 3.5;
    vec3 ro = vec3(0.0, camH, iTime * 1.5);
    vec3 target = vec3(0.0, camH, ro.z + 6.0);
    // Mouse influence
    target.x += (uMouse.x - 0.5) * 2.0;
    target.y += (uMouse.y - 0.5) * 0.5;

    // Camera matrix
    vec3 fw = normalize(target - ro);
    vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(rt, fw);
    vec3 rd = normalize(ndc.x * rt + ndc.y * up + 1.5 * fw);

    // Sky
    vec3 col = renderSky(rd);

    // Ray-march ocean
    if (rd.y < 0.0) {
        vec3 hitPos;
        float t = heightMapTrace(ro, rd, hitPos);
        if (t < 1000.0) {
            vec3 dist = hitPos - ro;
            float fade = 1.0 - smoothstep(0.0, 800.0, dot(dist, dist));
            float eps = dot(dist, dist) * 0.000001;
            vec3 n = getNormal(hitPos, max(eps, 0.002));
            vec3 seaCol = getSeaColor(hitPos, n, ro, rd);
            // Atmospheric fog (constant — no extra sky eval)
            float fogAmt = 1.0 - exp(-t * 0.002);
            seaCol = mix(seaCol, vec3(0.02, 0.04, 0.08), fogAmt);
            col = mix(col, seaCol, fade);
        }
    }

    // Post-process
    col = pow(col, vec3(0.85));   // Tone map
    col *= 1.0 - 0.3 * pow(length(ndc) / 2.0, 2.0); // Vignette

    col *= uScrollFade;
    fragColor = vec4(col, 1.0);
}

void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
    `;

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    scene.add(new THREE.Mesh(geo, mat));

    const tgt = { x: 0.5, y: 0.5 };
    document.addEventListener('mousemove', (e) => {
        tgt.x = e.clientX / window.innerWidth;
        tgt.y = 1.0 - e.clientY / window.innerHeight;
    });

    let scrollFade = 1.0, isHeroVisible = true;
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
            onUpdate: (self) => { scrollFade = 1.0 - self.progress; } });
        ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top',
            onEnter: () => { isHeroVisible = true; }, onLeave: () => { isHeroVisible = false; },
            onEnterBack: () => { isHeroVisible = true; }, onLeaveBack: () => { isHeroVisible = false; } });
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        if (!isHeroVisible) return;
        uniforms.iTime.value = clock.getElapsedTime();
        uniforms.uScrollFade.value = scrollFade;
        const m = uniforms.uMouse.value;
        m.x += (tgt.x - m.x) * 0.05;
        m.y += (tgt.y - m.y) * 0.05;
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        const p = Math.min(window.devicePixelRatio, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(p);
        uniforms.iResolution.value.set(window.innerWidth * p, window.innerHeight * p, 1);
    });

    animate();
})();
