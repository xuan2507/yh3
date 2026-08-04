/* ========================================
   AI Tutor Engine
   ======================================== */

// Route protection
if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
}
Auth.updateUserDisplay();

// DOM refs
const chat = document.getElementById('tutorChat');
const input = document.getElementById('tutorInput');
const sendBtn = document.getElementById('tutorSend');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');

let currentImage = null;

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        input.value = chip.dataset.q;
        sendMessage();
    });
});

// Auto-resize textarea
input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Image upload
imageUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        currentImage = ev.target.result;
        imagePreview.innerHTML = `<img src="${currentImage}"><button class="remove-image" id="removeImage"><i class="fas fa-times"></i></button>`;
        imagePreview.classList.add('active');
        document.getElementById('removeImage').addEventListener('click', () => {
            currentImage = null;
            imagePreview.classList.remove('active');
            imagePreview.innerHTML = '';
            imageUpload.value = '';
        });
    };
    reader.readAsDataURL(file);
});

// Explain at Any Level
let explainLevel = 'alevel';
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        explainLevel = btn.dataset.level;
    });
});

function wrapByLevel(response, level) {
    if (level === 'primary') {
        return `**[Primary School Level]**\n\n${response}\n\n---\n*Think of it like this: imagine you're building with blocks or playing a game — the same idea applies here, just with bigger numbers!*`;
    }
    if (level === 'university') {
        return `**[University Level]**\n\n${response}\n\n---\n*For a deeper treatment, consult standard texts on this topic. The underlying assumptions and boundary conditions should be verified for your specific problem set.*`;
    }
    return response;
}

// Send message
function sendMessage() {
    const text = input.value.trim();
    if (!text && !currentImage) return;

    addUserMessage(text, currentImage);
    input.value = '';
    input.style.height = 'auto';

    const typing = addTypingIndicator();

    // Analyze and respond
    setTimeout(() => {
        typing.remove();
        let response = generateResponse(text, currentImage);
        if (typeof response === 'string') {
            response = wrapByLevel(response, explainLevel);
        } else if (response && response.html) {
            response.html = wrapByLevel(response.html, explainLevel);
        }
        addBotMessage(response);
        Auth.addTutorMessage('user', text);
        Auth.addTutorMessage('assistant', typeof response === 'string' ? response : response.text || '[Image analysis]');
    }, 600 + Math.random() * 600);

    currentImage = null;
    imagePreview.classList.remove('active');
    imagePreview.innerHTML = '';
    imageUpload.value = '';
}

function addUserMessage(text, img) {
    const div = document.createElement('div');
    div.className = 'chat-message user-message';
    div.innerHTML = `
        <div class="message-bubble">
            ${img ? `<div class="message-image"><img src="${img}"></div>` : ''}
            ${text ? `<div class="message-text">${escapeHtml(text)}</div>` : ''}
        </div>
        <div class="message-avatar user"><i class="fas fa-user"></i></div>
    `;
    chat.appendChild(div);
    scrollBottom();
}

function addBotMessage(content) {
    const div = document.createElement('div');
    div.className = 'chat-message bot-message';
    const html = typeof content === 'string' ? formatResponse(content) : content.html;
    div.innerHTML = `
        <div class="message-avatar bot"><i class="fas fa-robot"></i></div>
        <div class="message-bubble">${html}</div>
    `;
    chat.appendChild(div);
    scrollBottom();
    // Animate
    div.style.opacity = '0';
    div.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
        div.style.transition = 'all 0.3s ease';
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
    });
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'chat-message bot-message typing-msg';
    div.innerHTML = `
        <div class="message-avatar bot"><i class="fas fa-robot"></i></div>
        <div class="message-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    `;
    chat.appendChild(div);
    scrollBottom();
    return div;
}

function scrollBottom() {
    chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatResponse(text) {
    // Format bold, code, lists
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\s*)+/g, '<ol>$&</ol>');
    html = html.replace(/^[-\u2022]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\s*)+/g, '<ul>$&</ul>');
    return `<p>${html}</p>`;
}

/* ========================================
   Knowledge Base & Response Engine
   ======================================== */

const KNOWLEDGE = {
    physics: {
        'units': `**CAIE 9702 — Physical Quantities & Units**

**Base SI units:**
- Mass: kilogram (kg)
- Length: metre (m)
- Time: second (s)
- Electric current: ampere (A)
- Temperature: kelvin (K)
- Amount of substance: mole (mol)

**Homogeneity:** Physical equations must be dimensionally consistent.
Example: Check v² = u² + 2as: [m²s⁻²] = [m²s⁻²] + [m·ms⁻²] = [m²s⁻²] ✓

**Prefixes:**
- pico (p) = 10⁻¹², nano (n) = 10⁻⁹, micro (μ) = 10⁻⁶
- milli (m) = 10⁻³, kilo (k) = 10³, mega (M) = 10⁶
- giga (G) = 10⁹, tera (T) = 10¹²

**Scalars vs vectors:**
- Scalars: mass, speed, distance, energy, power, temperature
- Vectors: displacement, velocity, acceleration, force, momentum, field strength

**Measurement uncertainties:**
- Absolute uncertainty = ± half the smallest division (analog) or ± 1 digit (digital)
- Percentage uncertainty = (absolute uncertainty / measured value) × 100%
- Combining: add absolute uncertainties for addition/subtraction; add percentage uncertainties for multiplication/division`,
        'newton': `**CAIE 9702 — Newton's Laws of Motion & Dynamics**

**First Law (Inertia):** A body remains at rest or moves with constant velocity unless acted on by a resultant force.

**Second Law:** F = ma (resultant force = rate of change of momentum)
- Also: F = Δp/Δt where p = mv (momentum)
- Impulse: FΔt = Δmv (area under F-t graph)

**Third Law:** When body A exerts a force on body B, body B exerts an equal and opposite force on body A.
- Action-reaction pairs act on DIFFERENT bodies

**Free-body diagrams:**
- Identify ALL forces acting on ONE object
- Weight (W = mg) always acts vertically down
- Normal reaction perpendicular to surface
- Friction opposes motion/attempted motion
- Tension along rope/cable
- Drag/air resistance opposes motion

**Connected particles:**
- Draw separate FBDs for each body
- Tension is same throughout a light inextensible string
- Acceleration is same for both bodies

**Terminal velocity:** When drag = weight, resultant force = 0, a = 0`,
        'kinematic': `**CAIE 9702 — Kinematics (SUVAT)**

For uniformly accelerated motion:
1. v = u + at
2. s = ut + ½at²
3. v² = u² + 2as
4. s = ½(u + v)t

**Graphs:**
- Displacement-time: gradient = velocity
- Velocity-time: gradient = acceleration, area = displacement
- Acceleration-time: area = change in velocity

**Projectile motion:**
- Horizontal: constant velocity (a = 0)
- Vertical: constant acceleration (a = g = 9.81 m/s² downward)
- Resolve initial velocity: u_x = u cos θ, u_y = u sin θ
- Time of flight: 2u_y/g (symmetric)
- Max height: u_y²/(2g)
- Range: u² sin(2θ)/g

**Worked example:** Ball thrown at 25 m/s, 30° above horizontal.
u_x = 25 cos 30° = 21.7 m/s
u_y = 25 sin 30° = 12.5 m/s
Time to max height: t = u_y/g = 12.5/9.81 = 1.27 s
Max height: h = u_y²/(2g) = 12.5²/(2×9.81) = 7.96 m
Range: R = u² sin(60°)/g = 625 × 0.866/9.81 = 55.2 m`,
        'energy': `**CAIE 9702 — Work, Energy & Power**

**Work:** W = F·s·cos θ (force × displacement × cos of angle between them)
- If force and displacement parallel: W = Fs
- If perpendicular: W = 0

**Energy forms:**
- Kinetic: E_k = ½mv²
- Gravitational potential: E_p = mgh (near Earth)
- Elastic potential: E_e = ½kx²

**Principle of conservation of energy:**
Total energy in an isolated system is constant.
E_k(initial) + E_p(initial) = E_k(final) + E_p(final) + work done against friction

**Power:**
- P = W/t (work done / time)
- P = F·v (force × velocity) — useful for vehicles
- Efficiency = (useful power output / total power input) × 100%

**Worked example:** Car of mass 1200 kg accelerates from 10 m/s to 25 m/s.
ΔE_k = ½ × 1200 × (25² - 10²) = 600 × (625 - 100) = 600 × 525 = 315,000 J = 315 kJ`,
        'wave': `**CAIE 9702 — Waves & Superposition**

**Progressive wave equation:**
y = A sin(ωt - kx) where ω = 2πf, k = 2π/λ
v = fλ = ω/k

**Intensity:** I ∝ A² (amplitude squared), I ∝ 1/r² (inverse square law for point sources)

**Superposition:** When two waves meet, resultant displacement = sum of individual displacements.

**Interference:**
- Constructive: path difference = nλ (in phase)
- Destructive: path difference = (n + ½)λ (antiphase)
- Coherent sources: same frequency, constant phase difference

**Young's double-slit:**
λ = ax/D (fringe spacing = λD/a)
- a = slit separation, D = slit-screen distance, x = fringe spacing

**Diffraction grating:**
d sin θ = nλ where d = 1/N (N = lines per unit length)
- Maximum order: n_max = d/λ (must be ≤ 1)

**Stationary waves:**
- Formed by two progressive waves of same frequency traveling in opposite directions
- Nodes: zero amplitude (separation = λ/2)
- Antinodes: maximum amplitude (between nodes)
- String fixed at both ends: L = nλ/2 (n = 1, 2, 3...)`,
        'electric': `**CAIE 9702 — Electricity & D.C. Circuits**

**Definitions:**
- Current (I): rate of flow of charge, I = Q/t, unit: ampere (A)
- Potential difference (V): energy per unit charge, V = W/Q, unit: volt (V)
- Resistance (R): V = IR (Ohm's Law)

**Resistivity:**
R = ρL/A where ρ = resistivity, L = length, A = cross-sectional area

**Power:**
P = VI = I²R = V²/R

**Resistors in series:** R_total = R₁ + R₂ + R₃
**Resistors in parallel:** 1/R_total = 1/R₁ + 1/R₂ + 1/R₃

**Kirchhoff's Laws:**
1. First Law (Current): ΣI_in = ΣI_out at any junction
2. Second Law (Voltage): ΣEMF = ΣIR around any closed loop

**Potential divider:**
V_out = V_in × R₂/(R₁ + R₂)
- Used for sensors (LDR, thermistor)
- LDR: resistance decreases with light intensity
- Thermistor (NTC): resistance decreases with temperature

**EMF and internal resistance:**
E = V + Ir = I(R + r)
- Terminal p.d. V = E - Ir (decreases as current increases)
- Short-circuit current: I = E/r

**Worked example:** Cell with E = 12V, r = 2Ω connected to R = 10Ω.
I = E/(R+r) = 12/12 = 1A
Terminal p.d. V = IR = 1 × 10 = 10V (or V = 12 - 1×2 = 10V)`,
        'fields': `**CAIE 9702 — Electric, Gravitational & Magnetic Fields**

**Electric fields:**
- Force: F = qE
- Uniform field: E = V/d (between parallel plates)
- Point charge: E = kQ/r² where k = 1/(4πε₀)

**Coulomb's Law:**
F = kQ₁Q₂/r² (force between two point charges)

**Electric potential:**
V = kQ/r (scalar, work done per unit positive charge)
- Equipotential surfaces: spherical around point charge

**Gravitational fields:**
- Force: F = Gm₁m₂/r² (Newton's law of gravitation)
- Field strength: g = F/m = GM/r²
- Gravitational potential: φ = -GM/r
- Orbital speed: v = √(GM/r)
- Kepler's Third Law: T² ∝ r³

**Magnetic fields:**
- Force on current-carrying conductor: F = BIL sin θ
- Force on moving charge: F = Bqv sin θ (circular motion if v ⟂ B)
- Radius of path: r = mv/(Bq)

**Electromagnetic induction:**
- Faraday's Law: EMF = -d(NΦ)/dt (rate of change of magnetic flux linkage)
- Lenz's Law: induced current opposes the change causing it
- Transformer: V_s/V_p = N_s/N_p`,
        'nuclear': `**CAIE 9702 — Particle & Nuclear Physics**

**Atomic structure:**
- Nucleon number (A) = protons + neutrons
- Proton number (Z) = number of protons
- Isotopes: same Z, different A

**Radioactive decay:**
- Alpha (α): He nucleus (⁴₂He), stopped by paper, ionizes strongly
- Beta (β⁻): fast electron (⁰₋₁e), stopped by few mm Al
- Gamma (γ): electromagnetic wave, reduced by thick lead/concrete

**Decay equations:**
- α: ᴬ_Z X → ᴬ⁻⁴_Z₋₂ Y + ⁴₂He
- β⁻: ᴬ_Z X → ᴬ_Z₊₁ Y + ⁰₋₁e + ν̄_e
- β⁺: ᴬ_Z X → ᴬ_Z₋₁ Y + ⁰₊₁e + ν_e

**Half-life:**
- Time for activity/number of nuclei to halve
- A = A₀e^(-λt) or N = N₀e^(-λt)
- λ = ln(2)/t½
- Activity: A = λN (decays per second, Bq)

**Mass-energy equivalence:**
E = mc²
Binding energy = (mass of separate nucleons - mass of nucleus) × c²
Binding energy per nucleon peaks at Fe-56 (most stable)

**Nuclear fission:** Heavy nucleus splits → releases energy
**Nuclear fusion:** Light nuclei combine → releases energy (stars)

**Fundamental particles:**
- Quarks: up (+2/3e), down (-1/3e), charm, strange, top, bottom
- Leptons: electron, muon, tau and their neutrinos
- Hadrons: baryons (3 quarks), mesons (quark + antiquark)
- Proton = uud, neutron = udd
- Conservation laws: charge, baryon number, lepton number, energy-momentum`,
        'thermal': `**CAIE 9702 — Thermal Physics**

**Kinetic theory of gases:**
- Pressure = (1/3)ρc² = (1/3)Nm/V × c²
- Average kinetic energy of molecule: E = (3/2)kT = (1/2)mc_rms²
- k = Boltzmann constant = 1.38 × 10⁻²³ J/K

**Ideal gas equation:**
pV = nRT = NkT
- R = 8.314 J/(mol·K)
- T must be in kelvin (K = °C + 273)

**Internal energy:**
U = sum of kinetic and potential energies of all molecules
- For ideal gas: U = (3/2)nRT (all KE, no PE)

**Specific heat capacity:**
Q = mcΔθ (solid/liquid)
- Energy required to raise mass m by temperature Δθ

**Specific latent heat:**
Q = mL (phase change at constant temperature)
- L_fusion: solid → liquid
- L_vaporization: liquid → gas

**First Law of Thermodynamics:**
ΔU = q + w (or ΔU = q - w depending on sign convention)
- q = heat supplied to system
- w = work done ON system
- For ideal gas at constant temperature: ΔU = 0, so q = -w`
    },
    chemistry: {
        'balance': `**CAIE 9701 — Balancing Chemical Equations & Redox**

**Method:**
1. Write correct formulae for reactants and products
2. Count atoms on each side
3. Add coefficients (never change subscripts!)
4. Check atom balance again

**Redox balancing (ionic equations):**
1. Split into half-reactions (oxidation and reduction)
2. Balance atoms other than O and H
3. Balance O with H₂O
4. Balance H with H⁺ (acidic) or OH⁻ (alkaline)
5. Balance charge with electrons
6. Multiply half-reactions so electrons cancel
7. Add and simplify

**Example:** MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺
Reduction: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O
Oxidation: Fe²⁺ → Fe³⁺ + e⁻
Overall: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O`,
        'mole': `**CAIE 9701 — The Mole Concept & Stoichiometry**

**Key equations:**
- n = m/M (moles = mass / molar mass)
- n = cV (moles = concentration × volume in dm³)
- n = V/24.0 (gases at RTP, 20°C, 1 atm)
- n = PV/RT (ideal gas equation)

**Concentration calculations:**
- mol/dm³ = moles / volume(dm³)
- g/dm³ = mass / volume(dm³)

**Titration formula:**
- For acid-base: (MₐVₐ)/nₐ = (M_bV_b)/n_b
- For redox: use mole ratios from balanced equation

**Stoichiometry steps:**
1. Write balanced equation
2. Convert given quantity to moles
3. Use mole ratio from equation
4. Convert to required quantity

**Percentage yield** = (actual yield / theoretical yield) × 100
**Percentage purity** = (mass of pure substance / mass of sample) × 100`,
        'organic': `**CAIE 9701 — Organic Chemistry Reactions**

**Alkanes:**
- Free radical substitution: CH₄ + Cl₂ → CH₃Cl + HCl (UV)
- Mechanism: initiation (homolytic fission), propagation, termination

**Alkenes:**
- Electrophilic addition: C₂H₄ + Br₂ → C₂H₄Br₂ (orange → colorless)
- Markovnikov's rule: H adds to C with more H's already
- Hydration: C₂H₄ + H₂O → C₂H₅OH (H₃PO₄, 300°C, 60 atm)
- Hydrogenation: C₂H₄ + H₂ → C₂H₆ (Ni catalyst, 150°C)

**Alcohols:**
- Primary: oxidized by acidified K₂Cr₂O₇ → aldehyde (distill) → carboxylic acid (reflux)
- Secondary: oxidized → ketone (reflux, cannot oxidize further)
- Tertiary: resistant to oxidation
- Dehydration: conc H₂SO₄ or Al₂O₃ → alkene (elimination)

**Carbonyl compounds:**
- Aldehydes: Tollens' (silver mirror), Fehling's/Benedict's (brick red Cu₂O)
- Ketones: no reaction with Tollens' or Fehling's
- Both: 2,4-DNP (orange precipitate)

**Carboxylic acids:**
- NaHCO₃ → effervescence (CO₂)
- Esterification: acid + alcohol → ester + H₂O (conc H₂SO₄ catalyst)

**Tests summary:**
- Alkene: Br₂ water (decolorizes)
- Aldehyde: Tollens' (silver mirror)
- Carboxylic acid: NaHCO₃ (fizzes)
- Halogenoalkane: AgNO₃/ethanol (white AgCl, cream AgBr, yellow AgI)`,
        'equilibrium': `**CAIE 9701 — Chemical Equilibrium**

**Kc expression:**
For aA + bB ⇌ cC + dD
Kc = [C]^c [D]^d / ([A]^a [B]^b) — exclude solids and pure liquids

**Kp for gas-phase equilibria:**
Kp = (pC)^c (pD)^d / (pA)^a (pB)^b
Partial pressure = mole fraction × total pressure

**Le Chatelier's Principle:**
If a dynamic equilibrium is disturbed, the system adjusts to minimize the disturbance.

**Changes:**
- Concentration: ↑ reactant → shifts right (Kc unchanged)
- Pressure (gases): ↑ pressure → shifts to side with fewer gas moles (Kc unchanged)
- Temperature: ↑ T → shifts in endothermic direction (Kc changes!)
- Catalyst: speeds up both forward and reverse equally — no shift, reaches equilibrium faster

**Important:** Only temperature changes Kc/Kp. Concentration/pressure changes shift position but equilibrium constant stays constant at constant T.

**Haber process:** N₂ + 3H₂ ⇌ 2NH₃ (exothermic)
- High pressure (favors products, 4→2 moles)
- Moderate temperature (compromise: yield vs rate)
- Iron catalyst`,
        'atomic': `**CAIE 9701 — Atomic Structure**

**Subatomic particles:**
- Proton: mass 1, charge +1, in nucleus
- Neutron: mass 1, charge 0, in nucleus
- Electron: mass 1/1840, charge -1, in orbitals/shells

**Isotopes:** same proton number, different neutron number.
- Relative atomic mass = weighted average of isotope masses
- Mass spectrometry: M⁺ peak = molecular mass, fragmentation pattern helps identify structure

**Electronic configuration:**
- Order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p...
- s=2, p=6, d=10, f=14
- Exceptions: Cr [Ar] 3d⁵ 4s¹, Cu [Ar] 3d¹⁰ 4s¹ (half-filled/full d-subshell stability)

**Ionization energy:**
- Definition: energy to remove 1 mole of electrons from 1 mole of gaseous atoms
- General trend: increases across period (nuclear charge ↑, shielding ~constant)
- Decreases down group (shielding ↑, atomic radius ↑)
- Exceptions:
  - Group 2 → Group 3 drop (e.g., Mg → Al): p electron is higher energy, slightly shielded
  - Group 5 → Group 6 drop (e.g., N → O): paired p electrons repel each other

**Electronegativity:** increases across period, decreases down group. F is most electronegative.`,
        'kinetics': `**CAIE 9701 — Reaction Kinetics**

**Rate equations:**
- rate = k[A]^m[B]^n
- Overall order = m + n
- Units of k depend on overall order: 1st order = s⁻¹, 2nd = dm³mol⁻¹s⁻¹, 3rd = dm⁶mol⁻²s⁻¹

**Determining order from experiments:**
- Compare experiments where one reactant concentration changes, others constant
- If rate doubles when [A] doubles → 1st order in A
- If rate quadruples when [A] doubles → 2nd order in A
- If rate unchanged when [A] doubles → zero order in A

**Half-life:**
- First order: t½ = ln(2)/k (constant, independent of concentration)
- Used to identify first-order reactions

**Arrhenius equation:**
k = A·e^(-Ea/RT)
- Plot ln k vs 1/T gives straight line: slope = -Ea/R
- Higher Ea → slower reaction at given T
- Catalyst provides alternative pathway with lower activation energy

**Rate-determining step:**
- In multi-step mechanisms, the slowest step determines overall rate
- Rate equation must be consistent with mechanism
- If rate = k[X][Y], RDS likely involves one X and one Y`,
        'electrochemistry': `**CAIE 9701 — Electrochemistry**

**Standard electrode potentials (E°):**
- Measured under standard conditions (1 mol/dm³, 298K, 1 atm)
- More positive E° = stronger oxidizing agent (more likely to be reduced)
- More negative E° = stronger reducing agent (more likely to be oxidized)

**Cell EMF:**
E°cell = E°cathode(reduction) - E°anode(reduction)
or E°cell = E°reduction + E°oxidation
- E°cell > 0: spontaneous reaction
- E°cell < 0: non-spontaneous

**Electrolysis:**
- Molten compounds: cation reduced at cathode, anion oxidized at anode
- Aqueous solutions: consider standard electrode potentials and concentration
  - Cathode: less reactive metal ions (or H⁺ if very reactive metal like K⁺, Na⁺)
  - Anode: halide ions (Cl⁻, Br⁻, I⁻) oxidize before OH⁻; if no halide, OH⁻ oxidizes to O₂
- Quantitative: Q = It, moles = Q/(nF), mass = moles × Ar

**Fuel cells:**
- Hydrogen-oxygen fuel cell: 2H₂ + O₂ → 2H₂O
- Acidic electrolyte: H₂ → 2H⁺ + 2e⁻ (anode); O₂ + 4H⁺ + 4e⁻ → 2H₂O (cathode)
- Alkaline electrolyte: H₂ + 2OH⁻ → 2H₂O + 2e⁻ (anode); O₂ + 2H₂O + 4e⁻ → 4OH⁻ (cathode)`,
        'transition': `**CAIE 9701 — Transition Metals**

**Characteristic properties:**
- Variable oxidation states: e.g., Fe²⁺/Fe³⁺, Cu⁺/Cu²⁺, Cr³⁺/Cr⁶⁺
- Colored compounds: due to d-d electron transitions
- Complex ion formation: coordinate (dative covalent) bonds with ligands
- Catalytic activity: e.g., Fe in Haber process, V₂O₅ in Contact process, MnO₂ in H₂O₂ decomposition

**Common ligands:**
- Monodentate: H₂O, NH₃, Cl⁻, OH⁻, CN⁻
- Bidentate: ethanedioate (C₂O₄²⁻), 1,2-diaminoethane (en)
- Polydentate: EDTA⁴⁻ (hexadentate)

**Shapes of complex ions:**
- 6-coordinate: octahedral (e.g., [Cu(NH₃)₆]²⁺, [Fe(CN)₆]⁴⁻)
- 4-coordinate: tetrahedral (e.g., [CuCl₄]²⁻) or square planar (e.g., [Ni(CN)₄]²⁻)
- Coordination number = number of donor atoms bonded to metal

**Color and d-d transitions:**
- In octahedral field, d-orbitals split into lower t₂g and higher eg sets
- Energy gap ΔE corresponds to visible light wavelength
- Different ligands cause different splitting (spectrochemical series)
- If d⁰ or d¹⁰: no d-d transitions → colorless (e.g., Cu⁺, Zn²⁺, Sc³⁺, Ti⁴⁺)

**Redox titrations:**
- MnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O (self-indicating: purple → colorless)
- I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻ (starch indicator: blue-black → colorless)`,
        'group': `**CAIE 9701 — Group Chemistry**

**Group 2 (alkaline earth metals):**
- Reactivity increases down group (atomic radius ↑, shielding ↑, easier to lose 2e⁻)
- Reaction with water: Mg reacts slowly with steam; Ca, Sr, Ba react increasingly vigorously with cold water
- Oxides/hydroxides: basicity increases down group (larger cation, lower charge density, less polarization of O-H bond)
- Thermal stability of carbonates/nitrates increases down group (larger cation polarizes CO₃²⁻/NO₃⁻ less)
- Solubility: sulfates decrease down group (BaSO₄ insoluble); hydroxides increase down group

**Group 17 (halogens):**
- Oxidizing power decreases down group (F₂ > Cl₂ > Br₂ > I₂)
- Atomic radius increases, shielding increases, electron affinity decreases
- Displacement reactions: Cl₂ displaces Br⁻ and I⁻; Br₂ displaces I⁻
- Reactions with NaOH: cold dilute → halide + halate(I) (disproportionation); hot concentrated → halide + halate(V)
- Silver halides: AgCl (white), AgBr (cream), AgI (yellow) — all insoluble in dilute HNO₃ but soluble in concentrated NH₃ (AgCl fully, AgBr partially, AgI not)`,
        'entropy': `**CAIE 9701 — Entropy and Gibbs Free Energy**

**Entropy (S):** measure of disorder/randomness in a system
- S(gas) > S(liquid) > S(solid)
- More moles of gas → higher entropy
- Dissolving increases entropy

**Standard entropy change of reaction:**
ΔS° = ΣS°(products) - ΣS°(reactants)

**Gibbs free energy:**
ΔG = ΔH - TΔS
- ΔG < 0: spontaneous
- ΔG = 0: equilibrium
- ΔG > 0: non-spontaneous

**Temperature dependence:**
| ΔH | ΔS | Result |
|---|---|---|
| - | + | Spontaneous at ALL T |
| + | - | Non-spontaneous at ALL T |
| - | - | Spontaneous at LOW T |
| + | + | Spontaneous at HIGH T |

**Calculating feasibility temperature:**
T = ΔH/ΔS (when ΔG = 0)

**Example:** CaCO₃ → CaO + CO₂
ΔH = +178 kJ/mol, ΔS = +161 J/K·mol
T = 178000/161 = 1106 K. Above this T, decomposition is spontaneous.`,
        'analytical': `**CAIE 9701 — Analytical Techniques**

**Chromatography (TLC and paper):**
- Principle: separation based on differential partitioning between stationary phase (polar silica/paper) and mobile phase (solvent)
- Rf = distance moved by spot / distance moved by solvent front
- More polar compounds: lower Rf (bind strongly to polar stationary phase)
- Less polar compounds: higher Rf (travel with non-polar mobile phase)

**IR Spectroscopy:**
- Measures absorption of IR radiation by molecular vibrations
- Key peaks: O-H (3200-3600), C-H (2850-3100), C=O (1680-1750), C-O (1000-1300), N-H (3300-3500)
- Fingerprint region (1500-500): unique to each compound

**Mass Spectrometry:**
- M⁺ peak = molecular mass
- Fragmentation pattern helps identify structure
- Common fragments: m/z 15 (CH₃⁺), 29 (CHO⁺ or C₂H₅⁺), 43 (C₃H₇⁺), 77 (C₆H₅⁺)

**NMR Spectroscopy (¹H NMR):**
- Chemical shift (δ): position of peak (ppm)
- Integration: area under peak = number of equivalent protons
- Splitting (n+1 rule): n adjacent non-equivalent protons → n+1 peaks
- Key δ values: CH₃ (0.9-1.5), CH₂ (1.2-1.6), CH (1.4-1.7), O-CH₃ (3.3-4.0), CHO (9.0-10.0), OH (1.0-5.0, broad), NH₂ (1.0-5.0)
- TMS reference at δ = 0

**Combined techniques:**
- Use mass spec for molecular formula
- Use IR for functional groups
- Use NMR for carbon skeleton and environment`,
        'mechanisms': `**CAIE 9701 — Organic Reaction Mechanisms**

**SN2 (primary halogenoalkanes):**
- Concerted: one step, backside attack
- OH⁻ attacks C from opposite side to leaving group
- Inversion of configuration at chiral center
- Rate = k[halogenoalkane][nucleophile]
- Favored by: primary substrate, strong nucleophile, polar aprotic solvent

**SN1 (tertiary halogenoalkanes):**
- Two steps: slow formation of carbocation + fast nucleophilic attack
- Carbocation intermediate (planar, sp²)
- Racemization at chiral center (both enantiomers formed)
- Rate = k[halogenoalkane] only
- Favored by: tertiary substrate, weak nucleophile, polar protic solvent
- Rearrangements possible to form more stable carbocation

**Electrophilic addition (alkenes):**
- Step 1: π electrons attack electrophile (H⁺, Br⁺) → carbocation
- Step 2: nucleophile attacks carbocation
- Markovnikov: H adds to C with more H's already
- Anti-Markovnikov with peroxides (HBr only, free radical)
- Stereochemistry: syn or anti addition depending on reagent

**Electrophilic substitution (benzene):**
- Step 1: electrophile attacks π system → unstable carbocation (Wheland intermediate)
- Step 2: loss of H⁺ restores aromaticity
- Examples: nitration (NO₂⁺), halogenation (Cl⁺/Br⁺ with FeCl₃/AlCl₃), Friedel-Crafts (alkylation/acylation)
- Activating groups (ortho/para directing): -OH, -NH₂, -R
- Deactivating groups (meta directing): -NO₂, -COOH, -SO₃H, -CHO`,
        'polymer': `**CAIE 9701 — Polymerization**

**Addition polymers:**
- Monomers contain C=C double bonds
- No small molecule eliminated
- Examples: poly(ethene), poly(chloroethene) [PVC], polystyrene, Teflon, Perspex
- Repeat unit: break C=C, extend bonds to adjacent units
- Disposal: non-biodegradable → recycling or incineration issues

**Condensation polymers:**
- Two different monomers with two functional groups each
- Small molecule eliminated (usually H₂O)
- Polyamides (nylons): dicarboxylic acid + diamine → amide linkage
- Polyesters: dicarboxylic acid + diol → ester linkage
- Examples: nylon-6,6, Terylene (PET), proteins, DNA
- Biodegradable polyesters possible (e.g., polylactic acid)

**Natural polymers:**
- Proteins: condensation of amino acids (peptide bonds)
- DNA/RNA: nucleotide polymers (phosphodiester bonds)
- Starch/cellulose: condensation of glucose (glycosidic bonds)
- Rubber: addition polymer of isoprene`,
        'nitrogen': `**CAIE 9701 — Nitrogen and Sulfur Chemistry**

**Nitrogen:**
- Ammonia: Haber process (N₂ + 3H₂ ⇌ 2NH₃, Fe catalyst, 450°C, 200 atm)
- Ammonia as a base: NH₃ + HCl → NH₄Cl; NH₃ + H₂O ⇌ NH₄⁺ + OH⁻
- Nitric acid: Ostwald process (NH₃ → NO → NO₂ → HNO₃)
- Nitrates: thermal decomposition → nitrite + O₂ (Na, K) or metal oxide + NO₂ + O₂ (others)
- Environmental: eutrophication from nitrate runoff

**Sulfur:**
- Contact process: 2SO₂ + O₂ ⇌ 2SO₃ (V₂O₅ catalyst, 450°C, 1-2 atm)
- SO₃ + H₂O → H₂SO₄ (oleum intermediate in industry)
- Sulfuric acid: strong acid, dehydrating agent, oxidizing agent (hot concentrated)
- Sulfates: BaSO₄ insoluble (used in medicine, test for sulfate)
- Environmental: SO₂ causes acid rain (SO₂ + H₂O → H₂SO₃ → H₂SO₄)`
    },
    maths: {
        'quadratics': `**CAIE 9709 — Quadratics, Functions & Equations**

**Completing the square:**
ax² + bx + c = a(x + b/2a)² + (c - b²/4a)
- Vertex form reveals turning point at (-b/2a, c - b²/4a)

**Discriminant:** Δ = b² - 4ac
- Δ > 0: two distinct real roots
- Δ = 0: one repeated real root
- Δ < 0: no real roots

**Functions:**
- Domain: set of allowed input values
- Range: set of output values
- One-one function: passes horizontal line test
- Inverse function f⁻¹: reflection in y = x, domain/range swap
- Composition: fg(x) = f(g(x))

**Modulus function:**
- |x| = x if x ≥ 0, -x if x < 0
- |x - a| = b → x = a ± b
- |x - a| < b → a - b < x < a + b
- Graph: V-shape with vertex at (a, 0)

**Transformations:**
- y = f(x) + a: vertical shift up by a
- y = f(x + a): horizontal shift left by a
- y = af(x): vertical stretch by factor a
- y = f(ax): horizontal stretch by factor 1/a
- y = -f(x): reflection in x-axis
- y = f(-x): reflection in y-axis`,
        'differentiation': `**CAIE 9709 — Differentiation**

**Basic rules:**
- d/dx(xⁿ) = nxⁿ⁻¹
- d/dx(sin x) = cos x, d/dx(cos x) = -sin x, d/dx(tan x) = sec²x
- d/dx(eˣ) = eˣ, d/dx(ln x) = 1/x
- d/dx(aˣ) = aˣ ln a

**Product rule:** d/dx(uv) = u(dv/dx) + v(du/dx)
**Quotient rule:** d/dx(u/v) = [v(du/dx) - u(dv/dx)] / v²
**Chain rule:** dy/dx = dy/du × du/dx

**Implicit differentiation:** differentiate term by term, remember d/dx(y²) = 2y(dy/dx)

**Parametric differentiation:** dy/dx = (dy/dt)/(dx/dt)

**Stationary points:** set dy/dx = 0
- d²y/dx² > 0 → minimum
- d²y/dx² < 0 → maximum
- d²y/dx² = 0 → could be point of inflection (check sign change of dy/dx)

**Connected rates of change:** use chain rule, e.g., dV/dt = dV/dr × dr/dt

**Small increments:** δy ≈ (dy/dx) δx`,
        'integration': `**CAIE 9709 — Integration**

**Basic integrals:**
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)
- ∫sin x dx = -cos x + C, ∫cos x dx = sin x + C, ∫sec²x dx = tan x + C
- ∫eˣ dx = eˣ + C, ∫1/x dx = ln|x| + C
- ∫1/(ax+b) dx = (1/a) ln|ax+b| + C

**Integration by substitution:** change variable to simplify
- Common substitutions: u = ax + b, u = f(x), trigonometric substitutions

**Integration by parts:** ∫u dv = uv - ∫v du
- LIATE priority: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential

**Definite integrals:**
- Area under curve: ∫[a,b] y dx
- Area between curves: ∫[a,b] (y_top - y_bottom) dx
- Volume of revolution: V = π∫[a,b] y² dx (about x-axis)

**Numerical integration:**
- Trapezium rule: ∫[a,b] y dx ≈ (h/2)[y₀ + 2(y₁ + y₂ + ... + y_{n-1}) + y_n]
  where h = (b-a)/n
- Accuracy increases with more strips`,
        'trigonometry': `**CAIE 9709 — Trigonometry**

**Pythagorean identities:**
- sin²θ + cos²θ = 1
- 1 + tan²θ = sec²θ
- 1 + cot²θ = csc²θ

**Double angle:**
- sin 2θ = 2 sin θ cos θ
- cos 2θ = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ
- tan 2θ = 2tan θ/(1 - tan²θ)

**Compound angle:**
- sin(A±B) = sin A cos B ± cos A sin B
- cos(A±B) = cos A cos B ∓ sin A sin B
- tan(A±B) = (tan A ± tan B)/(1 ∓ tan A tan B)

**Solving trig equations:**
1. Use identities to express in single trig function
2. Find principal value using calculator
3. Find all solutions in range using symmetry:
   - sin: 180° - θ, cos: 360° - θ, tan: 180° + θ
   - Or use CAST diagram

**R-formula:**
a sin θ + b cos θ = R sin(θ + α) where R = √(a²+b²), tan α = b/a
a sin θ + b cos θ = R cos(θ - α) where R = √(a²+b²), tan α = a/b

**Reciprocal trig functions:**
cosec θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ`,
        'series': `**CAIE 9709 — Series & Binomial Expansion**

**Arithmetic progression:**
- nth term: a + (n-1)d
- Sum: S_n = n/2 [2a + (n-1)d] = n/2 (a + l)

**Geometric progression:**
- nth term: arⁿ⁻¹
- Sum: S_n = a(1-rⁿ)/(1-r) or a(rⁿ-1)/(r-1)
- Sum to infinity: S_∞ = a/(1-r) for |r| < 1

**Binomial expansion:**
(1 + x)ⁿ = 1 + nx + n(n-1)x²/2! + n(n-1)(n-2)x³/3! + ...
- Valid for |x| < 1 when n is negative or fractional
- For (a + bx)ⁿ, factor out a: aⁿ(1 + bx/a)ⁿ

**Σ notation:**
- Σr = n(n+1)/2
- Σr² = n(n+1)(2n+1)/6
- Σr³ = [n(n+1)/2]²
- Method of differences: terms cancel to leave first and last few terms`,
        'vector': `**CAIE 9709 — Vectors**

**Position vector:** point P has position vector OP = pi + qj + rk

**Line equation:**
- Vector form: r = a + λb (through point a, direction b)
- Cartesian: (x-a₁)/b₁ = (y-a₂)/b₂ = (z-a₃)/b₃

**Scalar (dot) product:**
a·b = |a||b|cos θ = a₁b₁ + a₂b₂ + a₃b₃
- Perpendicular vectors: a·b = 0
- Angle between vectors: cos θ = (a·b)/(|a||b|)

**Vector geometry:**
- Shortest distance from point P to line r = a + λb:
  d = |AP × b|/|b| where AP = p - a
- Intersection of two lines: equate components, solve for λ and μ

**Plane equation:**
- r·n = d (n = normal vector)
- ax + by + cz = d
- Angle between line and plane: 90° - angle between line and normal
- Distance from point to plane: |ax₁ + by₁ + cz₁ - d|/√(a²+b²+c²)`,
        'complex': `**CAIE 9709 — Complex Numbers**

**Forms:**
- Cartesian: z = x + iy
- Polar: z = r(cos θ + i sin θ) = r e^(iθ)
- r = |z| = √(x²+y²), θ = arg(z) = tan⁻¹(y/x) [adjust quadrant!]

**Operations:**
- Addition: (a+ib) + (c+id) = (a+c) + i(b+d)
- Multiplication: multiply moduli, add arguments
- Division: divide moduli, subtract arguments
- Conjugate: z* = x - iy; zz* = |z|²

**De Moivre's Theorem:**
[r(cos θ + i sin θ)]ⁿ = rⁿ(cos nθ + i sin nθ)

**nth roots:**
zⁿ = r(cos θ + i sin θ) has n roots:
|r|^(1/n)[cos((θ + 2πk)/n) + i sin((θ + 2πk)/n)] for k = 0, 1, ..., n-1

**Loci:**
- |z - a| = r: circle, centre a, radius r
- |z - a| = |z - b|: perpendicular bisector of line joining a and b
- arg(z - a) = θ: half-line from a at angle θ to positive real axis`,
        'mechanics': `**CAIE 9709 — Mechanics**

**Forces & equilibrium:**
- Resolve forces horizontally and vertically
- Triangle of forces: three forces in equilibrium can be represented by a closed triangle
- Moments: moment = force × perpendicular distance from pivot
- Equilibrium: ΣF = 0 and Σmoments = 0

**Kinematics in a straight line:**
- SUVAT equations (constant acceleration)
- v-t graphs: gradient = acceleration, area = displacement
- Variable acceleration: use calculus (v = ds/dt, a = dv/dt)

**Newton's laws:**
- F = ma (resultant force = mass × acceleration)
- Connected particles: same acceleration, tension same in light inextensible string
- Pulleys: tension same on both sides of smooth light pulley

**Work, energy & power:**
- Work = force × distance moved in direction of force
- KE = ½mv², GPE = mgh
- Conservation of energy (no friction): KE_i + PE_i = KE_f + PE_f
- Power = work/time = force × velocity

**Momentum:**
- p = mv
- Conservation of momentum: total momentum before = total momentum after (no external forces)
- Collisions: elastic (KE conserved) or inelastic (KE not conserved)
- Coefficient of restitution: e = (speed of separation)/(speed of approach)
  - e = 1: perfectly elastic, e = 0: perfectly inelastic`,
        'statistics': `**CAIE 9709 — Probability & Statistics**

**Representation of data:**
- Mean: x̄ = Σx/n, Median: middle value, Mode: most frequent
- Variance: s² = Σ(x-x̄)²/n = Σx²/n - x̄²
- Standard deviation: s = √variance
- Cumulative frequency curves: median = 50th percentile, IQR = Q₃ - Q₁

**Permutations & combinations:**
- nPr = n!/(n-r)! (order matters)
- nCr = n!/[r!(n-r)!] (order doesn't matter)

**Probability:**
- P(A∪B) = P(A) + P(B) - P(A∩B)
- Conditional: P(A|B) = P(A∩B)/P(B)
- Independent: P(A∩B) = P(A) × P(B)

**Distributions:**
- Binomial: X ~ B(n,p), P(X=r) = nCr pʳ(1-p)ⁿ⁻ʳ, E(X) = np, Var(X) = np(1-p)
- Normal: X ~ N(μ, σ²), standardize: Z = (X-μ)/σ
  - Use standard normal tables for probabilities
  - Normal approximation to binomial: X ≈ N(np, np(1-p)) for large n

**Hypothesis testing:**
- Null hypothesis H₀, alternative hypothesis H₁
- Test statistic → compare to critical value or find p-value
- Type I error: reject H₀ when true. Type II error: accept H₀ when false`
    },
    economics: {
        'demand': `**CAIE 9708 — Demand, Supply & Market Equilibrium**

**Law of demand:** price ↑ → quantity demanded ↓ (inverse relationship, downward-sloping demand curve)
**Law of supply:** price ↑ → quantity supplied ↑ (direct relationship, upward-sloping supply curve)

**Equilibrium:** where Qd = Qs. Market clears with no surplus/shortage.
- Surplus (excess supply): price above equilibrium → downward pressure on price
- Shortage (excess demand): price below equilibrium → upward pressure on price

**Shifts in demand (non-price factors):**
- Income (normal goods: direct; inferior goods: inverse)
- Prices of related goods (substitutes: direct; complements: inverse)
- Tastes/preferences, advertising
- Expectations (of future prices/incomes)
- Population/demographics

**Shifts in supply:**
- Costs of production (input prices, wages, raw materials)
- Technology/productivity
- Number of firms
- Indirect taxes (-), subsidies (+)
- Expectations of future prices

**Price elasticity of demand (PED):**
PED = (%ΔQd) / (%ΔP)
- |PED| > 1: elastic (luxuries, many substitutes, broad definition)
- |PED| < 1: inelastic (necessities, few substitutes, addictive, short run)
- |PED| = 1: unitary elastic
- Total revenue test: elastic → price cut increases TR; inelastic → price rise increases TR

**Cross elasticity (XED):** positive = substitutes, negative = complements, zero = unrelated
**Income elasticity (YED):** positive = normal, negative = inferior`,
        'market': `**CAIE 9708 — Market Structures (AS & A Level)**

| Feature | Perfect Competition | Monopoly | Oligopoly | Monopolistic Competition |
|---|---|---|---|---|
| Firms | Many | One | Few dominant | Many |
| Product | Homogeneous | Unique, no close subs | Differentiated or homogeneous | Differentiated |
| Barriers | None | High (legal, natural, control of resources) | High | Low |
| Price power | Price taker | Price maker | Interdependent | Some degree |
| LR profit | Normal only | Supernormal possible | Supernormal possible | Normal only |

**Efficiency analysis (CAIE favourite):**
- Allocative efficiency: P = MC (social optimum)
- Productive efficiency: min AC (lowest point on AC curve)
- Dynamic efficiency: innovation/R&D over time
- X-inefficiency: lack of competitive pressure raises costs

**Oligopoly models:**
- Kinked demand curve: price rigidity (rivals match cuts, ignore rises)
- Game theory: prisoners' dilemma, Nash equilibrium, dominant strategy
- Collusion: formal cartels (OPEC) vs tacit collusion (price leadership)
- Non-price competition: advertising, branding, after-sales service

**Monopoly evaluation:**
- Against: higher prices, lower output, deadweight loss, X-inefficiency
- For: economies of scale, natural monopoly cases, dynamic efficiency (supernormal profits fund R&D), price discrimination can increase output`,
        'macro': `**CAIE 9708 — Macroeconomics (AS & A Level)**

**Circular flow of income:**
- Injections (J) = Investment + Government spending + Exports
- Withdrawals (W) = Saving + Taxation + Imports
- Equilibrium: J = W

**National income:**
- GDP = C + I + G + (X-M)
- Real vs nominal: real adjusts for inflation
- Per capita: GDP / population

**Aggregate Demand (AD):**
- Consumption (C): influenced by income, wealth, interest rates, consumer confidence
- Investment (I): influenced by interest rates, business confidence, technology, expectations
- Government spending (G): policy decision
- Net exports (X-M): influenced by exchange rates, foreign income, trade barriers

**Aggregate Supply (AS):**
- Keynesian (upward then vertical at full employment)
- Neo-classical (vertical at LR full employment output)

**Macro objectives & conflicts:**
1. Economic growth — LR rise in productive capacity / real GDP
2. Low unemployment — frictional, structural, cyclical, seasonal, seasonal
3. Low/stable inflation — CPI, demand-pull, cost-push, monetary, imported
4. Balance of payments equilibrium — current account sustainable
5. Fair income distribution — Lorenz curve, Gini coefficient

**Key conflicts:** growth vs inflation, growth vs BOP, growth vs environment, unemployment vs inflation (Phillips curve)`,
        'policy': `**CAIE 9708 — Government Economic Policy**

**Monetary policy (central bank):**
- Interest rates: ↑ rates reduce C and I, cool AD, reduce inflation
- Quantitative easing: buying bonds to inject money
- Exchange rate policy: managed float
- Effectiveness depends on: interest elasticity of C/I, confidence, time lags, global conditions

**Fiscal policy (government):**
- Expansionary: ↑ G, ↓ T → ↑ AD → growth but inflation risk
- Contractionary: ↓ G, ↑ T → ↓ AD → lower inflation but unemployment risk
- Automatic stabilizers: progressive tax, unemployment benefits (no govt discretion needed)
- Discretionary fiscal: deliberate policy changes
- Limitations: time lags, crowding out, political constraints, Ricardian equivalence

**Supply-side policies:**
- Market-based: privatization, deregulation, tax cuts, reducing welfare, reducing trade union power
- Interventionist: education/training, infrastructure, R&D subsidies, industrial policy
- Aim: shift LRAS right → growth without inflation

**Exchange rate systems:**
- Fixed: stable for trade, but loses monetary policy independence, requires reserves
- Floating: automatic adjustment, but volatility harms trade/investment
- Managed float: most countries use this`,
        'international': `**CAIE 9708 — International Trade & Development**

**Reasons for trade:**
- Comparative advantage: lower opportunity cost (Ricardo)
- Absolute advantage: higher productivity
- Specialization → economies of scale → lower prices → consumer welfare gains

**Free trade vs protectionism:**
- Arguments for free trade: lower prices, more choice, economies of scale, competition drives efficiency, technology transfer
- Arguments for protection: infant industries, strategic industries, dumping, revenue source, reduce unemployment, BOP improvement
- Methods: tariffs, quotas, subsidies, embargoes, voluntary export restraints, administrative barriers

**Balance of payments:**
- Current account = trade in goods + trade in services + primary income + secondary income
- Causes of deficit: loss of competitiveness, strong currency, high inflation, low productivity, recession abroad
- Correction: expenditure-switching (devaluation) and expenditure-reducing (contractionary fiscal/monetary)

**Marshall-Lerner condition:** depreciation improves CA if |PEDx| + |PEDm| > 1
**J-curve effect:** short-term worsening before long-term improvement

**Development economics:**
- Indicators: GDP per capita, HDI, Gini, life expectancy, literacy
- Barriers: debt, lack of infrastructure, political instability, climate, poor education/health, trade barriers
- Policies: microfinance, FDI, fair trade, debt relief, education/health investment, infrastructure`,
        'essay': `**CAIE 9708 — Economics Essay Structure (Band A*)**

**Introduction (2-3 sentences):**
- Define key terms precisely (use CAIE definitions)
- Show understanding of the issue
- State your line of argument / thesis

**Body paragraphs (PEEL+):**
- **Point:** clear topic sentence stating the argument
- **Explanation:** economic theory with accurately labeled diagrams (AD/AS, demand/supply, market structure, Phillips curve)
- **Evidence:** real-world examples with specific countries, dates, and data
- **Evaluation:** counter-argument, "however", "it depends on", "this assumes"
- **Link:** connect back to the question

**Evaluation techniques (CAIE examiners love these):**
1. **It depends on...** (time frame, elasticity, country context)
2. **Short run vs long run** (e.g., depreciation: J-curve)
3. **Magnitude/significance** (how large is the effect?)
4. **Conflicting objectives** (growth vs inflation, unemployment vs BOP)
5. **Alternative policies** (fiscal vs monetary vs supply-side)
6. **Ceteris paribus** assumption
7. **Stakeholder perspective** (consumers, producers, government, workers)

**Conclusion:**
- Summarize main arguments briefly
- Give a justified judgment — which factor is MOST important and WHY
- Do not introduce new points
- End with a nuanced statement, not absolute certainty`
    },
    biology: {
        'cell': `**CAIE 9700 — Cell Structure**

**Light microscope:**
- Max resolution ≈ 200 nm (limited by wavelength of light)
- Magnification = eyepiece × objective
- Staining: iodine (starch), methylene blue (nuclei), eosin (cytoplasm)

**Electron microscope:**
- TEM: high resolution (0.2 nm), 2D, thin sections required, no living specimens
- SEM: 3D surface images, lower resolution than TEM, no internal detail

**Prokaryotic cells:**
- No nucleus, no membrane-bound organelles
- Circular DNA (nucleoid), 70S ribosomes, cell wall (peptidoglycan/murein)
- Capsule, flagella, plasmids, mesosomes
- Examples: bacteria (Escherichia coli)

**Eukaryotic cells:**
- Nucleus with nuclear envelope and pores, linear DNA with histones
- 80S ribosomes, membrane-bound organelles
- Plant cells: cellulose cell wall, chloroplasts, large permanent vacuole, starch grains
- Animal cells: centrioles, small/no vacuole, glycogen granules

**Organelles:**
- Nucleus: DNA storage, transcription, nuclear pores control entry/exit
- Nucleolus: rRNA synthesis and ribosome assembly
- Rough ER: protein synthesis (ribosomes attached), transport vesicles
- Smooth ER: lipid/steroid synthesis, detoxification, Ca²⁺ storage
- Golgi: modifies/packages/sorts proteins, forms lysosomes, produces vesicles
- Mitochondria: double membrane, cristae (ETC), matrix (Krebs), ATP synthesis
- Chloroplasts: double membrane, thylakoids (light-dependent), stroma (Calvin cycle)
- Lysosomes: hydrolytic enzymes, autophagy, apoptosis
- Ribosomes: protein synthesis (80S in cytosol/ER, 70S in mitochondria/chloroplasts)
- Cytoskeleton: microtubules (support, spindle, cilia/flagella), microfilaments (movement)`,
        'membranes': `**CAIE 9700 — Cell Membranes & Transport**

**Fluid mosaic model:**
- Phospholipid bilayer: hydrophilic heads outward, hydrophobic tails inward
- Integral proteins: span membrane (channels, carriers, pumps)
- Peripheral proteins: attached to surface (enzymes, support)
- Cholesterol: stabilizes membrane, reduces fluidity at high temperatures
- Glycoproteins/glycolipids: cell recognition, antigens, receptors

**Diffusion:** passive movement down concentration gradient
- Rate increases with: higher temperature, smaller molecular size, steeper gradient, larger surface area
- Facilitated diffusion: through channel proteins (ions) or carrier proteins (glucose)

**Osmosis:** diffusion of water from high water potential (less negative) to low water potential (more negative) across partially permeable membrane
- Pure water: Ψ = 0
- Solute reduces water potential (makes it more negative)
- Pressure potential can increase water potential

**Active transport:** against concentration gradient, requires ATP and carrier proteins
- Sodium-potassium pump: 3 Na⁺ out, 2 K⁺ in
- Co-transport: e.g., Na⁺-glucose co-transport in ileum

**Endocytosis/exocytosis:** bulk transport using vesicles, requires ATP
- Phagocytosis (cell eating), pinocytosis (cell drinking)`,
        'enzymes': `**CAIE 9700 — Enzymes**

**Properties:**
- Biological catalysts, globular proteins
- Lower activation energy, not used up in reaction
- Specific: one enzyme → one substrate (lock and key / induced fit)
- Intracellular (inside cells) or extracellular (e.g., digestive enzymes)

**Mechanism:**
- Active site: specific shape complementary to substrate
- Enzyme-substrate complex forms
- Induced fit: enzyme slightly changes shape to fit substrate more closely
- Products released, enzyme unchanged

**Factors affecting rate:**
- Temperature: increases kinetic energy up to optimum; above optimum, enzyme denatures (breaks H bonds, changes active site shape)
- pH: each enzyme has optimum pH; extreme pH denatures
- Substrate concentration: rate increases until enzyme saturation
- Enzyme concentration: rate proportional to [enzyme] at saturating [substrate]

**Inhibition:**
- Competitive: inhibitor similar shape to substrate, competes for active site; overcome by increasing [substrate]
- Non-competitive: inhibitor binds to allosteric site, changes active site shape; cannot be overcome by increasing [substrate]

**Immobilized enzymes:**
- Trapped in alginate beads or attached to surfaces
- Advantages: reusable, more stable, product not contaminated, easy to separate`,
        'dna': `**CAIE 9700 — DNA, RNA & Protein Synthesis**

**DNA structure:**
- Double helix: antiparallel strands (5'→3' and 3'→5')
- Sugar-phosphate backbone (deoxyribose)
- Base pairs: A-T (2 H-bonds), G-C (3 H-bonds)
- Complementary base pairing allows exact replication

**DNA replication (semi-conservative):**
1. Helicase unwinds and unzips DNA (breaks H-bonds)
2. DNA polymerase adds nucleotides in 5'→3' direction only
3. Leading strand: continuous synthesis
4. Lagging strand: Okazaki fragments
5. DNA ligase joins fragments
6. Result: two identical DNA molecules, each with one old and one new strand

**Transcription:** DNA → mRNA
- In nucleus: RNA polymerase binds to promoter, unwinds DNA
- Complementary RNA synthesized (A→U, T→A, G↔C)
- Introns removed by splicing; exons joined
- mRNA exits through nuclear pore

**Translation:** mRNA → protein
- Occurs at ribosomes in cytoplasm
- tRNA carries amino acids with anticodons
- Codon-anticodon pairing (A-U, G-C)
- Peptide bonds form between amino acids
- Ribosome moves along mRNA (5'→3')
- Stop codon releases polypeptide

**Mutation types:**
- Substitution: one base changed → may/may not change amino acid (degenerate code)
- Deletion/insertion: frameshift → usually disastrous downstream`,
        'respiration': `**CAIE 9700 — Respiration**

**Glycolysis (cytoplasm):**
- Glucose (6C) → 2 pyruvate (3C)
- Phosphorylation using ATP, lysis, oxidation (NAD → NADH), ATP formation
- Net gain: 2 ATP, 2 NADH per glucose
- Anaerobic: no further stages

**Link reaction (mitochondrial matrix):**
- Pyruvate → acetyl-CoA + CO₂
- Decarboxylation and dehydrogenation
- NAD → NADH

**Krebs cycle (matrix):**
- Acetyl-CoA (2C) + oxaloacetate (4C) → citrate (6C)
- Series of redox reactions: 2 CO₂ released, 3 NADH, 1 FADH₂, 1 ATP (substrate-level)
- Per glucose: 2 turns → 4 CO₂, 6 NADH, 2 FADH₂, 2 ATP

**Electron transport chain (inner membrane/cristae):**
- NADH and FADH₂ donate electrons to carriers
- Electrons passed along chain (energy released)
- Energy pumps H⁺ from matrix to intermembrane space
- Electrochemical gradient drives protons through ATP synthase (chemiosmosis)
- O₂ is final electron acceptor → H₂O
- Per glucose: ~28 ATP from ETC

**Total aerobic yield:** ~32 ATP per glucose

**Anaerobic respiration:**
- In mammals: pyruvate → lactate (regenerates NAD⁺)
- In yeast: pyruvate → ethanol + CO₂ (alcoholic fermentation)
- Only 2 ATP from glycolysis`,
        'photosynthesis': `**CAIE 9700 — Photosynthesis**

**Light-dependent reactions (thylakoid membranes):**
- Photosystem II: light excites electrons; water photolysis releases O₂, H⁺, electrons
- Electron transport chain: electrons pass through carriers, energy pumps H⁺ into thylakoid lumen
- Chemiosmosis: H⁺ flows through ATP synthase → ATP
- Photosystem I: electrons re-excited, reduce NADP⁺ to NADPH
- Products: ATP, NADPH, O₂

**Light-independent reactions (Calvin cycle, stroma):**
1. Carbon fixation: CO₂ + RuBP (5C) → 2 GP (3C), catalyzed by rubisco
2. Reduction: GP → TP (glyceraldehyde-3-phosphate) using ATP and NADPH
3. Regeneration: most TP regenerates RuBP using ATP
4. Some TP leaves to form glucose, starch, cellulose, lipids, amino acids
- For every 3 CO₂: 6 TP produced, 5 TP regenerate 3 RuBP, 1 TP exits

**Limiting factors:**
- Light intensity: affects light-dependent reactions
- CO₂ concentration: affects Calvin cycle
- Temperature: affects enzyme rates (rubisco)
- At low light: light is limiting
- At high light, low CO₂: CO₂ is limiting
- Compensation point: rate of photosynthesis = rate of respiration`,
        'inheritance': `**CAIE 9700 — Genetics & Inheritance**

**Terms:**
- Gene: DNA sequence coding for a polypeptide
- Allele: variant form of a gene
- Locus: position of gene on chromosome
- Genotype: genetic constitution (e.g., Aa)
- Phenotype: observable characteristics
- Homozygous: AA or aa
- Heterozygous: Aa
- Dominant: expressed in heterozygote
- Recessive: only expressed in homozygote

**Monohybrid cross:**
- Punnett square
- F₂ phenotypic ratio: 3:1
- F₂ genotypic ratio: 1:2:1

**Dihybrid cross:**
- Independent assortment (genes on different chromosomes)
- F₂ phenotypic ratio: 9:3:3:1
- Test cross: unknown dominant phenotype crossed with recessive homozygote

**Sex linkage:**
- X-linked: males XY (hemizygous), females XX
- More common in males: color blindness, hemophilia
- Carrier females: XᴴXʰ

**Autosomal linkage:**
- Genes on same chromosome tend to be inherited together
- Recombination (crossing over in prophase I) produces recombinants
- Recombination frequency ∝ map distance (1% recombination = 1 map unit)

**Chi-squared test:**
χ² = Σ((O-E)²/E)
- Degrees of freedom = number of classes - 1
- Compare to critical value at p = 0.05
- If χ² < critical value: null hypothesis accepted (difference due to chance)`,
        'transport': `**CAIE 9700 — Transport in Plants & Mammals**

**Xylem:**
- Dead cells with lignified walls, no cytoplasm, no end walls
- Transpiration stream: water pulled up by transpiration pull (cohesion-tension)
- Cohesion: H-bonds between water molecules
- Adhesion: water adheres to xylem walls
- Root pressure: active transport of minerals into xylem, water follows by osmosis
- Casparian strip (suberin in endodermis) forces water through cytoplasm (selective uptake)

**Phloem (translocation):**
- Sieve tube elements (living, no nucleus) + companion cells (many mitochondria)
- Source → sink: photosynthetic tissues → growing/storage tissues
- Mass flow hypothesis: high pressure at source (sucrose loaded), low pressure at sink (sucrose unloaded)
- Loading: companion cells use ATP to load sucrose → water follows by osmosis → high pressure
- Unloading: sucrose removed at sink → water exits → low pressure

**Mammalian circulatory system:**
- Double circulation: pulmonary (heart → lungs → heart) and systemic (heart → body → heart)
- Heart structure: atria (thin-walled), ventricles (thick-walled, left thicker than right)
- Cardiac cycle: atrial systole → ventricular systole → diastole
- Pacemaker (SAN): initiates heartbeat; AVN delays impulse to allow ventricular filling
- Blood: plasma (water, proteins, ions), red blood cells (haemoglobin, no nucleus), white blood cells, platelets
- Haemoglobin: cooperative binding, Bohr effect (CO₂ lowers pH, reduces affinity, releases O₂)
- Oxygen dissociation curve: sigmoid shape; shifts right with higher CO₂/temperature/exercise`,
        'immunity': `**CAIE 9700 — Infectious Disease & Immunity**

**Pathogens:** bacteria, viruses, fungi, protozoa
- Bacteria: cell wall, no nucleus, reproduce by binary fission, some produce toxins
- Viruses: protein capsid, genetic material (DNA or RNA), host-specific, obligate parasites

**Transmission:** direct contact, droplet, vector-borne, water/food-borne, airborne

**Non-specific (innate) defenses:**
- Physical barriers: skin, mucous membranes, cilia, stomach acid
- Phagocytes (neutrophils, macrophages): engulf pathogens, digest in lysosomes
- Natural killer cells: destroy infected/cancerous cells
- Inflammation: histamine increases permeability, attracts phagocytes

**Specific (adaptive) immunity:**
- Lymphocytes: B cells (bone marrow) and T cells (thymus)
- Clonal selection: lymphocyte with matching receptor proliferates
- Primary response: slow, IgM first, then IgG, memory cells formed
- Secondary response: faster, stronger, longer-lasting (memory cells)

**Antibodies (immunoglobulins):**
- Y-shaped: two Fab regions (antigen-binding), one Fc region
- Specific for one antigen (lock and key)
- Functions: neutralization, agglutination, opsonization, precipitation

**Vaccination:**
- Active artificial immunity: weakened/attenuated pathogen or subunit
- Stimulates primary response without disease
- Herd immunity: protects those who cannot be vaccinated`,
        'homeostasis': `**CAIE 9700 — Homeostasis & Control**

**Principles:**
- Negative feedback: response counteracts change, restores balance
- Positive feedback: response amplifies change (rare in homeostasis, e.g., blood clotting, childbirth)

**Temperature regulation:**
- Hypothalamus: thermoregulatory centre (receptors detect blood temperature)
- Skin receptors detect external temperature
- Too hot: vasodilation, sweating (evaporative cooling), flat hairs
- Too cold: vasoconstriction, shivering (muscle contraction generates heat), erect hairs (trap air)

**Blood glucose regulation:**
- High glucose → β-cells in pancreas release insulin
- Insulin: increases glucose uptake by cells, increases glycogen synthesis in liver/muscle, increases respiration
- Low glucose → α-cells release glucagon
- Glucagon: stimulates glycogenolysis (glycogen → glucose) in liver, stimulates gluconeogenesis
- Diabetes Type I: autoimmune destruction of β-cells, no insulin produced
- Diabetes Type II: insulin resistance, often linked to obesity

**Nervous system:**
- Neurone structure: cell body, dendrites (receive signals), axon (transmits), myelin sheath (saltatory conduction), synaptic knobs
- Action potential: depolarization (Na⁺ influx), repolarization (K⁺ efflux), hyperpolarization, recovery
- Synapse: neurotransmitter release (e.g., acetylcholine), diffusion across cleft, receptor binding, response
- Refractory period: ensures one-way transmission, limits firing rate`,
        'evolution': `**CAIE 9700 — Selection, Evolution & Biodiversity**

**Natural selection:**
1. Variation exists in population (mutation, recombination)
2. Environmental selective pressure
3. Individuals with advantageous alleles more likely to survive and reproduce
4. Allele frequencies change over generations

**Types of selection:**
- Directional: one extreme favored (e.g., industrial melanism)
- Stabilizing: intermediate favored, extremes selected against
- Disruptive: both extremes favored, intermediate selected against

**Speciation:**
- Allopatric: geographical isolation → different selection pressures → reproductive isolation
- Sympatric: same area, e.g., polyploidy in plants

**Isolation mechanisms:**
- Pre-zygotic: temporal, behavioral, mechanical, ecological isolation
- Post-zygotic: hybrid inviability, hybrid sterility

**Biodiversity:**
- Genetic diversity: variety of alleles within species
- Species diversity: number of different species
- Ecosystem diversity: variety of habitats/communities

**Conservation:**
- In situ: within natural habitat (national parks, wildlife reserves)
- Ex situ: outside natural habitat (zoos, seed banks, botanical gardens)
- Advantages/disadvantages of each approach`,
        'biotech': `**CAIE 9700 — Genetic Technology**

**Recombinant DNA technology:**
1. Isolate gene (mRNA → cDNA using reverse transcriptase, or PCR)
2. Cut vector (plasmid) and gene with same restriction enzyme (sticky ends)
3. Join with DNA ligase
4. Introduce into host cells (transformation, electroporation)
5. Identify transformed cells (marker genes, antibiotic resistance)
6. Clone and express

**PCR (Polymerase Chain Reaction):**
- Denaturation (95°C), annealing (50-65°C), extension (72°C)
- Exponential amplification: 2ⁿ copies after n cycles
- Requires: DNA polymerase (Taq, thermostable), primers, dNTPs, Mg²⁺

**Gel electrophoresis:**
- DNA fragments separated by size
- Smaller fragments move faster through gel
- Used for DNA profiling, restriction mapping

**Applications:**
- Insulin production (bacteria/yeast)
- GM crops (herbicide/pest resistance, improved nutrition)
- Gene therapy (replacing defective genes)
- DNA fingerprinting (forensics, paternity)
- Stem cell therapy`
    },
    ielts: {
        'writing task 1': `**IELTS Academic Writing Task 1 — Report Structure (Band 7+)**

**Introduction (1 sentence):** Paraphrase the question. No numbers.
Example: "The line graph illustrates changes in... over the period..."

**Overview (2 sentences):** 2 main trends. No specific data.
- Highest/lowest overall
- General increase/decrease/fluctuation
- "Overall, ... experienced an upward trend, while ... declined."

**Body Paragraph 1:** Detailed comparison with data
- Group similar trends
- Use comparatives: significantly higher, marginally lower, roughly equal
- Use approximations: approximately, just over, slightly under

**Body Paragraph 2:** Remaining features
- Any exceptions or anomalies
- Second half of the time period
- Contrasting features

**Language for trends:**
- Increase: rise, grow, climb, surge, soar, rocket
- Decrease: fall, drop, decline, plunge, plummet
- Stability: remain steady, level off, stabilize, plateau
- Fluctuation: fluctuate, vary, inconsistent pattern

**Grammar:** Mix simple past + present perfect for trends continuing to now.`,
        'writing task 2': `**IELTS Writing Task 2 — Essay Structure (Band 7+)**

**Introduction (40-60 words):**
- Background sentence (paraphrase the topic)
- Thesis statement (your position / what the essay will discuss)
- Optional: outline sentence

**Body Paragraphs (100-120 words each):**
- Topic sentence (main idea)
- Explanation + development
- Specific example (country, company, statistic, personal)
- Mini-conclusion or link to next paragraph

**Evaluation/Concession paragraph (if needed):**
- Counter-argument
- Refutation ("However, this view fails to consider...")
- Why your position still holds

**Conclusion (30-40 words):**
- Restate thesis (different words)
- Summarize main points
- No new information

**Essay types:**
- **Opinion:** Strong position throughout, defend with 2 reasons
- **Discussion:** Both sides fairly, then state your view
- **Problem/Solution:** Identify causes + propose solutions
- **Advantage/Disadvantage:** Balance both, conclude which outweighs`,
        'speaking': `**IELTS Speaking — Band 7+ Strategies**

**Part 1 (4-5 min):**
- Answer directly + 1-2 sentences of detail
- Use present tenses for habits, past for specific memories
- Show range: "I tend to...", "I'm quite keen on...", "I can't stand..."

**Part 2 (3-4 min):**
- Use the 1-minute prep: jot 3-4 keywords, not sentences
- Structure: Introduction → Past/Present → Example → Opinion/Future
- Speak for 90-120 seconds
- Use discourse markers: "To begin with", "Moving on to", "Another thing is"

**Part 3 (4-5 min):**
- Give abstract answers, not personal
- Compare: "In contrast to..., ..."
- Speculate: "I suppose...", "It seems likely that..."
- Evaluate: "On the one hand..., but on the other..."

**Fluency tips:**
- Don't pause to search for perfect words
- Use fillers naturally: "Well, I think...", "That's an interesting question..."
- Self-correct smoothly: "...or rather, I mean..."`,
        'reading': `**IELTS Reading — Band 7+ Strategies**

**Time allocation:**
- Passage 1 (easiest): 15 min
- Passage 2: 20 min
- Passage 3 (hardest): 25 min

**TFNG strategy:**
- TRUE = same meaning, different words
- FALSE = contradicts the text
- NOT GIVEN = not mentioned at all (don't infer)

**Matching headings:**
- Read paragraph first, then look at headings
- Look for the MAIN idea, not supporting detail
- Eliminate obvious wrong answers first

**Gap-fill:**
- Check word limit (NO MORE THAN TWO WORDS)
- Predict word type (noun/verb/adjective) from grammar
- Copy exactly from text (spelling counts)

**Skimming:** Read first+last sentence of each paragraph (60 sec)
**Scanning:** Use question keywords to locate answers quickly`,
        'listening': `**IELTS Listening — Band 7+ Strategies**

**Before each section:**
- Read questions, underline keywords
- Predict answers (number? name? date?)
- Note word limit

**During audio:**
- Answers come in order (usually)
- Speakers may correct themselves — final answer counts
- Numbers/letters said twice if important
- Write answers in shorthand, transfer at end

**Section 1:** Social conversation — names, numbers, dates, prices
**Section 2:** Monologue — map/diagram labeling common
**Section 3:** Academic discussion — opinions, agreements, decisions
**Section 4:** Lecture — note completion, gap-fill

**Common traps:**
- Distractor: speaker mentions A, then changes to B
- Spelling: British vs American (centre/center both accepted)
- Units: write exactly what you hear ($, %, km, etc.)`,
        'vocabulary': `**IELTS High-Score Vocabulary by Topic**

**Education:** curriculum, syllabus, pedagogy, holistic, rote learning, critical thinking, vocational, academia, extracurricular, literacy
**Environment:** sustainable, renewable, biodiversity, carbon footprint, deforestation, emissions, conservation, ecological, habitat degradation
**Technology:** innovation, automation, digitalization, artificial intelligence, cybersecurity, algorithm, breakthrough, cutting-edge, obsolete
**Health:** epidemic, preventative, holistic, sedentary, nutrition, well-being, healthcare infrastructure, mental health, chronic
**Urbanization:** metropolitan, infrastructure, congestion, suburban, gentrification, cosmopolitan, overpopulation, amenities, commute
**Economy:** entrepreneurship, globalization, outsourcing, recession, inflation, fiscal, startup, market share, merger`,
        'essay check': `**IELTS Essay Self-Check Rubric**

Paste your essay and I'll score it against these criteria:

**Task Response (TR):**
- Did you answer all parts of the question?
- Is your position clear throughout?
- Are ideas fully extended with examples?

**Coherence & Cohesion (CC):**
- Is there clear paragraphing?
- Are ideas logically sequenced?
- Do you use a range of cohesive devices?

**Lexical Resource (LR):**
- Is vocabulary natural and precise?
- Do you avoid repetition?
- Are collocations correct?

**Grammatical Range & Accuracy (GRA):**
- Do you use complex sentences?
- Are there varied sentence structures?
- Are errors rare and minor?

Share your essay (Task 1 or Task 2) and I'll give you:
1. Estimated band score per criterion
2. Specific improvements with rewrites
3. Vocabulary upgrades
4. Grammar corrections`
    },
    business: {
        'environment': `**CAIE 9609 — Business & Its Environment**

**Business objectives:**
- Survival (startups), profit maximization, growth (revenue/market share), social objectives, shareholder value
- Corporate social responsibility (CSR): economic, legal, ethical, philanthropic responsibilities
- Stakeholders: shareholders, employees, customers, suppliers, government, community, creditors — conflicting interests

**Forms of business organization:**
- Sole trader: unlimited liability, full control, easy to set up, limited finance, no continuity
- Partnership: 2-20 partners, unlimited liability (except LLPs), shared decision-making, deed of partnership
- Private limited company (Ltd): limited liability, separate legal personality, cannot sell shares to public, accounts less public
- Public limited company (PLC): limited liability, sells shares on stock exchange, more regulation, greater access to capital
- Co-operatives: owned by members, democratic control, profit sharing

**External environment (PESTLE):**
- Political: government policy, taxation, trade restrictions, political stability
- Economic: interest rates, inflation, exchange rates, economic growth, unemployment
- Social: demographics, lifestyle changes, education, attitudes
- Technological: automation, R&D, innovation, e-commerce
- Legal: employment law, consumer protection, health & safety, environmental regulations
- Environmental: climate change, sustainability, waste disposal, carbon footprint`,
        'marketing': `**CAIE 9609 — Marketing**

**Market segmentation:**
- Geographic, demographic, psychographic, behavioral
- Benefits: targeted marketing, efficient resource use, competitive advantage, customer satisfaction

**Marketing mix (7Ps):**
- Product: features, branding, packaging, USP, product life cycle (introduction, growth, maturity, decline), Boston Matrix
- Price: penetration, skimming, competitive, cost-plus, psychological, price discrimination, promotional
- Place: channels (direct vs indirect), intensive/selective/exclusive distribution, e-commerce
- Promotion: above-the-line (TV, radio, print, cinema), below-the-line (sales promotion, PR, direct mail, sponsorship), digital marketing
- People: customer service, staff training, corporate culture
- Process: delivery systems, queuing, after-sales
- Physical evidence: store layout, branding, packaging

**Market research:**
- Primary: surveys, interviews, focus groups, observation (specific but expensive)
- Secondary: published data, government statistics, internet (cheaper but may be outdated)
- Qualitative: opinions, attitudes, motivations (in-depth, subjective)
- Quantitative: numerical data, statistics, trends (objective, measurable)

**Product life cycle strategies:**
- Introduction: high promotion, skimming/penetration pricing
- Growth: build brand loyalty, expand distribution
- Maturity: differentiate, find new segments, price competition
- Decline: harvest, divest, or find niche`,
        'hrm': `**CAIE 9609 — Human Resource Management**

**Workforce planning:**
- Forecast labor demand, analyze current workforce, identify gaps, plan recruitment/training

**Recruitment & selection:**
- Job analysis → job description → person specification → attract applicants → shortlist → interview/test → appoint
- Internal vs external recruitment
- Methods: interviews, assessment centers, psychometric tests, references

**Training:**
- Induction: familiarize new employees
- On-the-job: shadowing, mentoring, job rotation (relevant, immediate)
- Off-the-job: courses, workshops, e-learning (broader skills, networking)
- Benefits: higher productivity, lower staff turnover, better quality, flexibility

**Motivation theories:**
- Taylor (scientific management): piece rate, money is primary motivator, time-and-motion studies
- Maslow: hierarchy — physiological → safety → social → esteem → self-actualization
- Herzberg (two-factor): motivators (achievement, recognition, responsibility, advancement) vs hygiene factors (salary, conditions, policy, supervision)
- Mayo (Hawthorne): social factors, group norms, attention improve performance
- Vroom (expectancy theory): effort → performance → reward → satisfaction

**Leadership styles:**
- Autocratic: quick decisions, low morale, useful in crises
- Democratic: consultative, higher morale, slower
- Laissez-faire: high autonomy, creativity, risk of no direction
- Situational: adapt style to circumstances

**Communication:**
- Formal vs informal, internal vs external
- Barriers: language, cultural, physical, emotional, perceptual`,
        'operations': `**CAIE 9609 — Operations Management**

**Methods of production:**
- Job: one-off, customized, high skill, high unit cost, low volume (bespoke furniture)
- Batch: groups of similar products, moderate flexibility, moderate cost (bakeries, clothing)
- Flow/line: continuous, standardized, low unit cost, high volume, inflexible (cars, soft drinks)
- Mass customization: combining low cost with some customization (Dell computers)

**Location decisions:**
- Factors: labor costs, proximity to markets/suppliers, infrastructure, government incentives, exchange rates
- Quantitative methods: break-even analysis, investment appraisal

**Quality management:**
- Quality control: inspection at end, detects defects, worker not responsible
- Quality assurance: systems throughout, prevention, everyone responsible (TQM)
- Benchmarking: compare against best in industry
- ISO 9000: international quality standard
- Zero defects: aim for perfection (Crosby)
- Cost of quality: prevention + appraisal + internal failure + external failure

**Lean production:**
- JIT: stock arrives when needed, reduces waste, requires reliable suppliers, flexible workforce
- Kaizen: continuous improvement, all employees involved
- Kanban: visual signaling to control production flow
- Andon: warning system for quality problems
- Jidoka: automation with human oversight, stop line when defect detected`,
        'finance': `**CAIE 9609 — Finance & Accounting**

**Sources of finance:**
- Internal: retained profit (no interest, no dilution, but limited), sale of assets, working capital reduction
- Short-term external: overdraft (flexible, high interest), trade credit, factoring (sells receivables), leasing
- Long-term external: bank loans (fixed repayments, collateral), debentures (fixed interest, secured), share capital (ordinary/preference), venture capital, crowdfunding

**Cash flow:**
- Cash ≠ profit (profit includes non-cash items, accruals)
- Cash flow forecast predicts inflows and outflows over time
- Solutions to shortfall: overdraft, chase debtors, delay creditors, reduce stock, sale and leaseback

**Break-even analysis:**
- Contribution per unit = Selling price - Variable cost per unit
- Break-even output = Fixed costs / Contribution per unit
- Margin of safety = Actual output - Break-even output
- Limitations: assumes all output sold, linear relationships, single product, static costs

**Financial ratios:**
- Profitability: gross profit margin, net profit margin, ROCE
- Liquidity: current ratio, acid-test ratio
- Efficiency: inventory turnover, receivables days, payables days, asset turnover
- Gearing: debt/equity ratio, interest cover
- Investor: EPS, dividend yield, dividend cover, P/E ratio`,
        'strategy': `**CAIE 9609 — Strategic Management**

**Strategic analysis:**
- SWOT: internal Strengths/Weaknesses, external Opportunities/Threats
- PESTLE: macro-environmental analysis
- Porter's Five Forces: competitive rivalry, threat of new entrants, bargaining power of buyers, bargaining power of suppliers, threat of substitutes
- Boston Matrix: Stars (invest), Cash Cows (harvest), Question Marks (selective), Dogs (divest)

**Strategic choice:**
- Ansoff Matrix: market penetration (lowest risk), market development, product development, diversification (highest risk)
- Investment appraisal: payback period, ARR, NPV, IRR
- Force field analysis: driving vs restraining forces for change

**Strategic implementation:**
- Change management: Lewin's unfreeze-change-refreeze, Kotter's 8-step model
- Organizational structure: hierarchical, flat, matrix, delegation, span of control, chain of command
- Corporate culture: power, role, task, person cultures (Handy)

**Globalization:**
- Drivers: technology, trade liberalization, market convergence, cost advantages
- Methods: exporting, licensing, franchising, joint ventures, FDI, strategic alliances
- Benefits: larger markets, economies of scale, risk spreading, access to resources
- Challenges: cultural differences, exchange rate risk, political risk, ethical issues, increased competition`,
        'essay': `**CAIE 9609 — Business Essay Structure**

**Introduction:**
- Define key terms precisely
- Show understanding of context/issue
- State your line of argument/thesis

**Body paragraphs (PEEL+):**
- **Point:** clear topic sentence stating argument
- **Explanation:** business theory/concept with context
- **Evidence:** real business example (company name, date, data, country)
- **Evaluation:** "However...", "This depends on...", "A limitation is..."
- **Link:** connect back to question

**Evaluation techniques:**
1. Short-term vs long-term
2. Size/type of business (SME vs multinational, PLC vs Ltd)
3. Industry context (manufacturing vs service)
4. Country/economic context (developed vs developing)
5. Stakeholder perspective (conflicting interests)
6. Quantitative vs qualitative factors

**Conclusion:**
- Summarize main arguments
- Give justified judgment (which factor most important and WHY)
- Do not introduce new points`
    },
    psychology: {
        'research': `**CAIE 9990 — Research Methods**

**Experimental designs:**
- Lab experiment: high control, high internal validity, low ecological validity, replication possible
- Field experiment: natural setting, higher ecological validity, less control, demand characteristics reduced
- Natural/quasi-experiment: IV not manipulated by researcher, naturally occurring groups, less control but ethical for harmful variables

**Key terminology:**
- IV: independent variable (manipulated)
- DV: dependent variable (measured)
- Extraneous variable: could affect DV, must be controlled
- Confounding variable: uncontrolled EV, threatens validity
- Operationalization: defining variables in measurable terms

**Validity:**
- Internal: extent to which DV is caused by IV (control extraneous variables)
- External: extent to which results generalize (population, ecological, temporal, cultural validity)
- Construct: whether variables truly measure what they claim

**Reliability:**
- Internal consistency: split-half, Cronbach's alpha
- Inter-rater: multiple observers agree
- Test-retest: same results over time
- Ways to improve: standardized procedures, pilot studies, clear instructions

**Sampling:**
- Random: everyone equal chance, unbiased, representative but hard to achieve
- Opportunity/convenience: readily available, quick but biased
- Systematic: every nth person from list
- Stratified: proportional representation of subgroups
- Volunteer/self-selected: motivated participants, bias

**Ethics (BPS guidelines):**
- Informed consent, right to withdraw, confidentiality, deception only if justified + debriefing, protection from harm, debriefing
- Cost-benefit analysis

**Data analysis:**
- Quantitative: descriptive (mean, median, mode, SD, range), inferential (t-test, chi-square, Mann-Whitney, Wilcoxon, Spearman's rho)
- Qualitative: thematic analysis, grounded theory, content analysis
- Levels of measurement: nominal, ordinal, interval, ratio`,
        'memory': `**CAIE 9990 — Memory**

**Multi-store model (Atkinson & Shiffrin, 1968):**
- Sensory register: iconic (visual, 0.25-0.5s), echoic (auditory, 2-4s), haptic (touch)
- STM: limited capacity (7±2 items, Miller), limited duration (~18-30s, Peterson & Peterson), acoustic coding (Conrad)
- LTM: unlimited capacity, potentially permanent, semantic coding (Baddeley)
- Flow: attention → STM; rehearsal → LTM
- Evidence: serial position curve (primacy = LTM, recency = STM), HM, Clive Wearing
- Criticisms: too linear, rehearsal not only route to LTM, STM is not unitary

**Working memory model (Baddeley & Hitch, 1974):**
- Central executive: attention controller, limited capacity, no storage
- Phonological loop: phonological store (2s decay) + articulatory control process (subvocal rehearsal)
- Visuospatial sketchpad: visual cache + inner scribe
- Episodic buffer: integrates information across modalities, links to LTM, conscious awareness
- Evidence: dual-task studies, word-length effect, articulatory suppression

**Forgetting:**
- Decay theory: memory traces fade over time (Peterson & Peterson)
- Interference: proactive (old disrupts new, Underwood) and retroactive (new disrupts old)
- Retrieval failure: lack of appropriate cues, encoding specificity principle (Godden & Baddeley, diving study)

**Eyewitness testimony:**
- Loftus & Palmer (1974): leading questions distort memory
- Post-event discussion: Gabbert et al. — co-witness contamination
- Anxiety: Yerkes-Dodson law; weapon focus (Loftus et al.)
- Age: children more suggestible, elderly have memory deficits
- Cognitive interview: context reinstatement, report everything, reverse order, change perspective (Geiselman et al.)`,
        'attachment': `**CAIE 9990 — Attachment**

**Bowlby's theory (1969):**
- Evolutionary basis: attachment promotes survival (social releasers: smiling, crying, grasping)
- Critical period: first 2.5 years for attachment formation
- Sensitive period: optimal time for attachment
- Monotropy: primary attachment to one special figure (usually mother)
- Internal working model: template for future relationships (continuity hypothesis)
- Evidence: 44 Thieves study, Harlow's monkeys (cloth vs wire mother)
- Criticisms: overemphasis on mother, fathers important too, multiple attachments possible

**Ainsworth's Strange Situation (1970):**
- Secure (Type B, 65%): distressed when left, happy on return, uses caregiver as secure base
- Insecure-avoidant (Type A, 22%): ignores caregiver, little distress, emotional distance
- Insecure-resistant/ambivalent (Type C, 12%): very distressed, rejects caregiver on return, difficult to comfort
- Disorganized (Type D): contradictory behavior, fearful, associated with abuse/neglect (Main & Solomon)

**Cultural variations (Van IJzendoorn & Kroonenberg, 1988):**
- Secure attachment most common globally
- Avoidant more common in Germany; resistant more common in Japan (collectivist)
- Cultural bias in Strange Situation?

**Maternal deprivation:**
- Bowlby: separation from mother in critical period → intellectual/social/emotional damage
- 44 Thieves study (Bowlby): prolonged early separation linked to affectionless psychopathy
- Rutter: quality of substitute care matters more than separation itself
- Romanian orphanage studies: effects depend on timing, duration, quality of care`,
        'stress': `**CAIE 9990 — Stress**

**Physiological stress response:**
- Acute (SAM axis): hypothalamus → sympathetic NS → adrenal medulla → adrenaline/noradrenaline
  - Effects: increased HR, BP, breathing rate, glycogenolysis, pupil dilation, reduced digestion
- Chronic (HPA axis): hypothalamus → CRH → anterior pituitary → ACTH → adrenal cortex → cortisol
  - Cortisol: maintains blood glucose, suppresses immune system, anti-inflammatory

**Selye's General Adaptation Syndrome (GAS):**
- Alarm: fight or flight, sympathetic arousal
- Resistance: parasympathetic activity, cortisol maintains adaptation
- Exhaustion: resources depleted, immune suppression, illness

**Stress models:**
- Lazarus & Folkman (cognitive): primary appraisal (is it stressful?), secondary appraisal (can I cope?)
- Holmes & Rahe (1967): Social Readjustment Rating Scale — life changes require readjustment
- Kanner et al. (1981): daily hassles more predictive of health outcomes than major life events
- Workplace stress: Karasek's demand-control model (high demand + low control = most stressful)

**Stress management:**
- Biological: benzodiazepines (GABA enhancement), beta-blockers (reduce sympathetic activity)
- Psychological: CBT (cognitive restructuring), stress inoculation training (Meichenbaum), mindfulness
- Physical: exercise (reduces cortisol, increases endorphins), relaxation techniques`,
        'social': `**CAIE 9990 — Social Influence**

**Conformity:**
- Normative social influence: conform to be liked/accepted (public compliance, private disagreement)
- Informational social influence: conform because we believe others are correct (private acceptance, ambiguous situations)
- Asch (1951): 123 male students, line judgment task. 75% conformed at least once, mean conformity 32%
  - Factors: group size (up to 3), unanimity (one dissenter reduces conformity), task difficulty, anonymity
- Zimbardo (prison study): situational factors create conformity to roles

**Obedience:**
- Milgram (1963): 65% administered maximum 450V shock
  - Variations: proximity of authority (decreased obedience), proximity of victim (decreased), location (decreased outside Yale), peer rebellion (decreased), transfer of responsibility (increased)
- Agency theory (Milgram): agentic state (following orders, shifting responsibility) vs autonomous state
- Hofling et al. (1966): nurses obeyed doctor's illegitimate order

**Resistance to social influence:**
- Social support: ally reduces conformity (Asch) and obedience (Milgram)
- Locus of control: internals resist more (Rotter)
- Prior commitment: publicly stating own view reduces conformity

**Minority influence:**
- Moscovici (1969): consistency, flexibility, commitment key to minority influence
- Snowball effect: minority converts majority gradually
- Social cryptoamnesia: source of influence forgotten, idea accepted`,
        'abnormal': `**CAIE 9990 — Abnormality**

**Definitions:**
- Statistical infrequency: rare = abnormal (but high IQ rare yet desirable; where to draw line?)
- Deviation from social norms: violates society's rules (but norms change over time/culture)
- Failure to function adequately: cannot cope with daily life (may be situational, subjective)
- Deviation from ideal mental health (Jahoda): positive criteria (self-actualization, autonomy, etc.) — unrealistic ideal

**Depression:**
- Cognitive (Beck): negative triad (self, world, future), cognitive distortions (overgeneralization, catastrophizing)
- Biological: low serotonin/norepinephrine, genetic predisposition (McGuffin et al.), enlarged amygdala, HPA axis hyperactivity
- Treatment: CBT (cognitive restructuring, behavioral activation), SSRIs (increase serotonin), ECT (severe cases)

**Schizophrenia:**
- Symptoms: positive (hallucinations, delusions, disorganized speech, thought insertion) and negative (flat affect, avolition, poverty of speech, social withdrawal)
- Biological: dopamine hypothesis (excess in mesolimbic pathway, deficit in mesocortical), genetic (Gottesman, twin studies), neurodevelopmental (obstetric complications, viral infection)
- Treatment: typical antipsychotics (dopamine antagonists, extrapyramidal side effects), atypical antipsychotics (serotonin-dopamine antagonists), CBT for psychosis, family therapy

**Eating disorders:**
- Anorexia nervosa: restricted intake, low BMI, fear of weight gain, body dysmorphia
- Bulimia nervosa: binge-purge cycles, normal BMI, secretive behavior
- Explanations: genetic, serotonin imbalance, family systems (enmeshment), sociocultural (media pressure, objectification)`,
        'biological': `**CAIE 9990 — Biopsychology**

**Neuron structure:**
- Dendrites (receive signals), cell body/soma (metabolic center), axon (transmits), myelin sheath (Schwann cells in PNS, oligodendrocytes in CNS), nodes of Ranvier, terminal buttons (synaptic knobs)

**Action potential:**
- Resting potential: -70mV (Na⁺/K⁺ pump, K⁺ leak channels)
- Depolarization: Na⁺ channels open, Na⁺ rushes in (+40mV)
- Repolarization: Na⁺ channels close, K⁺ channels open, K⁺ leaves
- Hyperpolarization: overshoot to -90mV
- Recovery: Na⁺/K⁺ pump restores balance
- All-or-nothing: fires fully or not at all
- Saltatory conduction: jumps between nodes of Ranvier, faster

**Synaptic transmission:**
- Action potential arrives → voltage-gated Ca²⁺ channels open → vesicles fuse → neurotransmitter release → bind to receptors → EPSP (excitatory) or IPSP (inhibitory) → reuptake/enzymatic degradation

**Neurotransmitters:**
- Serotonin: mood regulation, sleep, appetite (low → depression)
- Dopamine: reward, motivation, motor control (excess → schizophrenia, low → Parkinson's)
- Acetylcholine: learning, memory, muscle contraction (low → Alzheimer's)
- GABA: inhibitory (low → anxiety, seizures)

**Brain structure:**
- Cerebral cortex: higher functions, four lobes (frontal, parietal, temporal, occipital)
- Hippocampus: memory formation
- Amygdala: emotion and fear
- Hypothalamus: homeostasis, HPA axis
- Cerebellum: motor coordination
- Brain scanning: EEG (electrical, high temporal), MRI (structure), fMRI (function), PET (metabolism)

**Split-brain research (Sperry):**
- Corpus callosum severed (epilepsy treatment)
- Left hemisphere: language, logic, analytical
- Right hemisphere: spatial, creativity, emotion
- Each hemisphere processes independently`,
        'cognitive': `**CAIE 9990 — Cognitive Psychology**

**Models of memory (see Memory section)**

**Perception:**
- Bottom-up processing: data-driven, uses sensory information
- Top-down processing: conceptually driven, uses expectations/schema
- Gregory's constructivist theory: perception is hypothesis, uses prior knowledge
- Gibson's direct theory: perception is direct, information in environment sufficient
- Visual illusions: Muller-Lyer, Ponzo, Ames room — support constructivist view

**Attention:**
- Selective attention: Broadbent's filter model (bottleneck), Treisman's attenuation model
- Divided attention: dual-task performance
- Stroop effect: interference between color and word reading

**Language:**
- Chomsky: language acquisition device (LAD), universal grammar, innate
- Skinner: language learned through operant conditioning (imitation, reinforcement)
- Genie case study: critical period for language acquisition

**Problem solving:**
- Algorithms: step-by-step, guaranteed solution but slow
- Heuristics: mental shortcuts, faster but may lead to errors
- Insight: sudden realization (Kohler's apes)
- Functional fixedness: inability to see alternative uses for objects`,
        'developmental': `**CAIE 9990 — Developmental Psychology**

**Cognitive development (Piaget):**
- Sensorimotor (0-2): object permanence, trial and error
- Preoperational (2-7): symbolic thought, egocentrism, centration, lack of conservation
- Concrete operational (7-11): conservation, classification, seriation, reversible thinking
- Formal operational (11+): abstract reasoning, hypothetical-deductive reasoning
- Criticisms: underestimates children's abilities (Baillargeon), cultural bias, stage model too rigid

**Education applications:**
- Discovery learning, readiness, concrete operational teaching methods
- Vygotsky's zone of proximal development (ZPD): gap between what child can do alone vs with help
- Scaffolding: support tailored to learner's needs, gradually withdrawn

**Moral development (Kohlberg):**
- Preconventional: obedience and punishment, self-interest
- Conventional: interpersonal accord, authority and social order
- Postconventional: social contract, universal ethical principles
- Criticisms: cultural bias, gender bias (Gilligan), action vs reasoning`,
        'issues': `**CAIE 9990 — Issues & Debates**

**Nature vs Nurture:**
- Nature: genetics, innate factors, biological determinism
- Nurture: environment, upbringing, learning
- Interactionist approach: genes and environment interact (diathesis-stress model)

**Free will vs Determinism:**
- Free will: humans choose behavior (humanistic approach)
- Hard determinism: all behavior caused by prior events (biological, environmental)
- Soft determinism: behavior caused but within constraints we have choice

**Holism vs Reductionism:**
- Holism: behavior should be studied as a whole system
- Reductionism: break down into simpler components (biological, environmental)

**Idiographic vs Nomothetic:**
- Idiographic: study individuals in depth (case studies, qualitative)
- Nomothetic: establish general laws (experiments, quantitative)

**Ethical issues:**
- Social sensitivity: research with social/political implications
- Psychology and society: applications in law, education, mental health, organizations
- Use of animals in research: 3Rs (Replacement, Reduction, Refinement)`,
        'essay': `**CAIE 9990 — Psychology Essay Structure**

**Introduction:**
- Define key terms
- Briefly outline what the essay will cover
- Optional: state thesis/judgment

**Body paragraphs (AO1 + AO3):**
- AO1 (Knowledge, 6 marks): Describe theory/study with names, dates, procedures, findings
- AO3 (Evaluation, 10 marks): Strengths, weaknesses, comparisons, applications
- Use PEEL: Point, Evidence, Explain, Link

**Evaluation techniques:**
1. Methodological critique (sample size, generalizability, validity, reliability, ethics)
2. Supporting/contradicting evidence
3. Alternative explanations
4. Real-world applications
5. Determinism vs free will
6. Reductionism vs holism
7. Nature vs nurture
8. Individual/situational differences
9. Practical issues (cost, time, ethics)

**Conclusion:**
- Summarize main points
- Make justified judgment
- Consider interactionist approaches`
    }
};

// Image analysis keywords
const IMAGE_PATTERNS = {
    'equation chemical': 'This appears to be a chemistry equation or formula. To balance it: count atoms on each side, add coefficients to equalize, and verify. For redox, split into half-reactions.',
    'graph curve chart': 'I see a graph. Identify axes (independent vs dependent), curve shape, intercepts, gradients, and turning points. In economics, label shifts and equilibrium changes. In physics, check if it represents displacement-time, velocity-time, etc.',
    'diagram cell structure': 'This looks like a cell diagram. Identify organelles by their structure: nucleus (largest, dark), mitochondria (oval with inner folds), ribosomes (small dots), ER (membranous network). Compare plant vs animal features.',
    'triangle angle geometry': 'This is a geometry/trigonometry problem. Identify what is given and what is needed. Use SOH CAH TOA for right triangles, sine/cosine rule for non-right triangles, or Pythagoras.',
    'table data numbers': 'I see a data table. Look for trends, calculate percentages/ratios, identify independent and dependent variables. In economics, this may support demand/supply analysis.',
    'molecule structure': 'This appears to be a molecular structure. Identify functional groups (OH=alcohol, COOH=acid, C=O=carbonyl), count carbons, name using IUPAC rules, predict reactions based on functional groups.',
    'circuit wire battery': 'This is an electric circuit diagram. Identify series/parallel arrangements, apply Kirchhoff\'s laws, use V=IR for each component. Calculate equivalent resistance and total current.',
    'formula math equation': 'I see a mathematical expression. Simplify using algebra rules, factor if quadratic, apply differentiation/integration rules as needed. Show each step clearly.',
    'dna helix strand': "This shows DNA structure. Remember: antiparallel strands (5'-3'), A-T and G-C pairing, major/minor grooves. For replication: semi-conservative, enzymes (helicase, polymerase, ligase).",
    'periodic table element': 'Periodic table reference. Trends to remember: atomic radius decreases across period/increases down group, electronegativity increases across/decreases down, ionization energy follows similar pattern with dips at Groups 3 and 6.'
};

function analyzeImage() {
    // Return a generic but helpful image analysis response
    return {
        html: `<div class="tutor-response">
            <p><strong>Image Analysis:</strong> I can see you've uploaded an image. Based on typical exam problem images, here's my guidance:</p>
            <div class="tutor-steps">
                <div class="step"><span class="step-num">1</span><p><strong>Identify the topic:</strong> Look for keywords, symbols, or diagram types that indicate the subject area.</p></div>
                <div class="step"><span class="step-num">2</span><p><strong>Extract given information:</strong> List all values, labels, and relationships shown.</p></div>
                <div class="step"><span class="step-num">3</span><p><strong>Select the right approach:</strong> Match the problem type to your formula sheet or concept notes.</p></div>
                <div class="step"><span class="step-num">4</span><p><strong>Work step-by-step:</strong> Show all working — examiners award method marks even with calculator errors.</p></div>
            </div>
            <p style="margin-top:12px">If you describe what you see in the image (e.g., "a velocity-time graph with a trapezium shape" or "a circuit with two resistors in parallel"), I can give you a much more specific solution.</p>
        </div>`,
        text: '[Image analysis guidance provided]'
    };
}

function generateResponse(text, image) {
    const q = text.toLowerCase();

    if (image && !text.trim()) {
        return analyzeImage();
    }

    // Subject routing
    let subject = '';
    if (/physics|force|motion|newton|velocity|acceleration|wave|electric|circuit|current|resist|energy|power|momentum|gravit|magnetic|field|particle|quark|nuclear/i.test(q)) subject = 'physics';
    else if (/chem|mole|balance|equation|atom|molecule|bond|organic|alkane|alkene|alcohol|equilibrium|acid|base|redox|oxidation|titration|enthalpy|rate/i.test(q)) subject = 'chemistry';
    else if (/math|differentiat|integrat|trig|vector|complex|calculus|algebra|logarithm|exponent|polynomial|binomial|series|probability|statistic|hypothesis/i.test(q)) subject = 'maths';
    else if (/economic|demand|supply|market|monopoly|oligopoly|inflation|unemployment|gdp|growth|fiscal|monetary|trade|exchange|elastic/i.test(q)) subject = 'economics';
    else if (/biology|cell|photosynthesis|respiration|dna|gene|inherit|enzyme|protein|membrane|nervous|hormone|ecosystem|evolution|mitosis|meiosis/i.test(q)) subject = 'biology';
    else if (/ielts|band score|speaking part|writing task|academic|general training|listening section|reading passage|cue card|essay check|coherence|lexical|task response/i.test(q)) subject = 'ielts';
    else if (/business|marketing|hrm|human resource|operations|strategy|ansoff|swot|finance|break-even|cash flow|leadership|motivation|promotion|pricing|production method|stakeholder|entrepreneur/i.test(q)) subject = 'business';
    else if (/psychology|attachment|memory|stress|conformity|obedience|neurotransmitter|synapse|neuron|research method|experiment|ethics|depression|schizophrenia|biological psychology|social influence|cognitive psychology|developmental|abnormal/i.test(q)) subject = 'psychology';
    else if (/accounting|english|chinese/i.test(q)) subject = 'other';

    // Track subject for progress
    if (subject && subject !== 'other') {
        Auth.addStudyTime(subject === 'ielts' ? 'english' : subject, 5);
        Auth.updateStreak();
    }

    // Match knowledge base topics
    const kb = KNOWLEDGE[subject];
    if (kb) {
        for (const [key, response] of Object.entries(kb)) {
            if (q.includes(key)) {
                const suffix = subject === 'ielts' ? '\n\nWant me to review a practice essay or give you a speaking topic?' : '\n\nNeed me to work through a specific problem on this topic?';
                return response + suffix;
            }
        }
    }

    // Generic problem-solving responses
    if (/solve|calculate|find|determine|work out|compute|evaluate/i.test(q)) {
        if (subject === 'physics') {
            return `**Problem-solving approach for Physics:**

1. **List given quantities** with units
2. **Identify what you need to find**
3. **Select the relevant equation(s)** — check your formula sheet
4. **Rearrange before substituting** numbers
5. **Calculate and check units**

**Common Physics equations to try:**
- Kinematics: v = u + at, s = ut + 1/2 at², v² = u² + 2as
- Forces: F = ma, W = mg, f = μN
- Energy: KE = 1/2 mv², PE = mgh, W = Fd
- Electricity: V = IR, P = VI, R_series = R₁+R₂
- Waves: v = fλ

If you share the exact numbers from your problem, I can guide you through the calculation step by step.`;
        }
        if (subject === 'chemistry') {
            return `**Problem-solving approach for Chemistry:**

1. **Write the balanced equation**
2. **Convert all given quantities to moles**
   - n = mass/Mr
   - n = concentration × volume(dm³)
   - For gases: n = volume/24 at RTP
3. **Use the mole ratio** from the balanced equation
4. **Convert moles back to required units**
5. **Check significant figures**

**Stoichiometry checklist:**
- Is the equation balanced?
- Are volumes in dm³? (divide cm³ by 1000)
- Did you use the correct mole ratio?
- For limiting reagents: calculate product from each reactant, smaller amount wins

Share the exact problem and I'll work through it with you.`;
        }
        if (subject === 'maths') {
            return `**Problem-solving approach for Mathematics:**

1. **Read carefully** — identify what is given and what is required
2. **Choose the right technique:**
   - Algebra: factor, expand, complete the square, substitute
   - Calculus: differentiate/integrate using appropriate rules
   - Trigonometry: use identities, CAST diagram, sine/cosine rule
   - Vectors: scalar product for angles, cross product for areas
   - Complex numbers: convert to polar form for powers/roots
3. **Show all working** — method marks are crucial
4. **Check your answer** — does it make sense? Substitute back if possible

**If it's a pure math problem**, tell me the exact expression or equation and I'll solve it step by step.`;
        }
    }

    if (/explain|what is|how does|why|describe|define|meaning/i.test(q)) {
        if (subject === 'physics') return 'Physics concepts build on fundamental principles. Could you specify which topic (mechanics, waves, electricity, modern physics)? I have detailed explanations for Newton\'s laws, kinematics, wave properties, circuit analysis, and particle physics.';
        if (subject === 'chemistry') return 'Chemistry covers atomic structure, bonding, energetics, kinetics, equilibria, and organic chemistry. Which area would you like explained? I can cover moles, balancing equations, organic reactions, equilibrium, or atomic structure in depth.';
        if (subject === 'maths') return 'Mathematics topics include pure math (calculus, algebra, trigonometry, vectors, complex numbers), mechanics, and statistics. Which topic needs clarification? I have step-by-step guides for differentiation, integration, trigonometric identities, and vector geometry.';
        if (subject === 'economics') return 'Economics divides into microeconomics (demand/supply, market structures, market failure) and macroeconomics (growth, inflation, unemployment, BOP, development). Which would you like me to explain?';
        if (subject === 'biology') return 'Biology topics include cell biology, biochemistry, genetics, physiology, ecology, and evolution. I can explain photosynthesis, cellular respiration, DNA replication, genetics, and cell structure in detail.';
        if (subject === 'business') return 'Business covers marketing, finance, HRM, operations, and strategy. I can explain the marketing mix, break-even, cash flow, motivation theories, Ansoff matrix, SWOT, and more. What topic do you need?';
        if (subject === 'psychology') return 'Psychology topics include memory, attachment, stress, social influence, research methods, and abnormal psychology. I can explain experiments, theories, and evaluation points. Which area?';
    }

    if (/essay|write|structure|argument|evaluation/i.test(q)) {
        if (subject === 'economics') return KNOWLEDGE.economics.essay;
        if (subject === 'business') return KNOWLEDGE.business.essay;
        if (subject === 'psychology') return KNOWLEDGE.psychology.essay;
    }

    if (/exam|revision|revise|study|prepare|tips|advice/i.test(q)) {
        return `**Exam Preparation Strategy**

**1. Active recall:**
- Close your notes and write down everything you remember
- Use flashcards for definitions and formulas
- Practice past papers under timed conditions

**2. Spaced repetition:**
- Review topics at increasing intervals (1 day, 3 days, 1 week)
- Focus more time on weak areas

**3. Past paper strategy:**
- Start with topic-specific questions
- Progress to full papers under exam conditions
- Mark yourself strictly using mark schemes
- Note recurring mistakes in an error log

**4. Subject-specific tips:**
- **Maths:** Practice is everything. Do every question type at least 3 times.
- **Sciences:** Learn definitions precisely. Practice explaining processes in your own words.
- **Economics:** Build a bank of real-world examples. Practice evaluation sentences.
- **Essay subjects:** Plan essays in 5 minutes before writing. PEEL structure.

**5. The night before:**
- Light review only
- Sleep > cramming
- Prepare materials (calculator, pens, ID)`;
    }

    if (/formula|equation sheet|remember|memorize/i.test(q)) {
        return `**How to Remember Formulas**

1. **Understand derivation:** Formulas you understand are easier to remember than those you memorize blindly.

2. **Units check:** Memorize units — they help you recall formulas. Force = kg·m/s² = N, so F=ma makes sense.

3. **Formula triangles:** For equations like V=IR, D=M/V, v=fλ — cover the variable you want.

4. **Flashcards:** Formula on front, variables explained on back.

5. **Common formula patterns:**
   - Energy/work = force × distance
   - Power = energy/time = force × velocity
   - Current = charge/time
   - Rate = amount/time

6. **Practice problems:** Using formulas in context cements them better than rote memorization.`;
    }

    if (/stress|anxious|nervous|worried|panic|scared|tired|burnout/i.test(q)) {
        return `**Managing Exam Stress**

**Immediate techniques:**
- Box breathing: 4 counts in, hold, out, hold
- 5-4-3-2-1 grounding: name 5 things you see, 4 you hear, etc.
- Progressive muscle relaxation

**Study habits that reduce stress:**
- Break tasks into small, achievable chunks
- Pomodoro: 25 min study, 5 min break
- Prioritize sleep over late-night cramming
- Exercise daily — even a 20-minute walk helps

**Perspective:**
- One exam does not define your worth
- There are always alternative paths
- Preparation reduces anxiety — focus on what you can control

**If stress is overwhelming:** speak to a teacher, counselor, or trusted adult. Your mental health matters more than any grade.`;
    }

    // Fallback
    return `I want to help you with that. To give you the best answer, could you tell me:

1. **Which subject** is this for? (Physics, Chemistry, Maths, Biology, Economics, etc.)
2. **What topic** within that subject?
3. **The exact question** or problem statement?

You can also **upload an image** of the problem if that's easier. I'll provide a step-by-step solution or detailed explanation.`;
}

// Load history
const history = Auth.getTutorHistory();
if (history.length > 0) {
    // Remove welcome, show last few exchanges
    chat.innerHTML = '';
    const recent = history.slice(-10);
    for (let i = 0; i < recent.length; i += 2) {
        const userMsg = recent[i];
        const botMsg = recent[i+1];
        if (userMsg && userMsg.role === 'user') {
            addUserMessage(userMsg.content, null);
        }
        if (botMsg && botMsg.role === 'assistant') {
            addBotMessage(botMsg.content);
        }
    }
}
