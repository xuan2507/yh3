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
        'newton': `**Newton's Laws of Motion**

**First Law (Inertia):** An object remains at rest or in uniform motion unless acted upon by a resultant force.
- Example: A book on a table stays still until you push it.

**Second Law:** F = ma. The resultant force equals mass times acceleration.
- Example: Pushing a shopping cart harder (more F) gives more acceleration.

**Third Law:** For every action there is an equal and opposite reaction.
- Example: When you jump, you push down on the ground; the ground pushes you up.

**Exam Tip:** Draw free-body diagrams. Identify all forces. The resultant force is in the direction of acceleration.`,
        'kinematic': `**Kinematics Equations (SUVAT)**

For motion with constant acceleration:
1. v = u + at
2. s = ut + 1/2 at²
3. v² = u² + 2as
4. s = (u + v)t / 2

Where:
- s = displacement
- u = initial velocity
- v = final velocity
- a = acceleration
- t = time

**Problem-solving strategy:**
1. List knowns and unknowns
2. Choose the equation that contains your target variable and the knowns
3. Watch signs: upward/forward = positive, downward/backward = negative

**Example:** A ball thrown upward at 20 m/s. Find max height.
u = 20, v = 0, a = -9.81, s = ?
Use v² = u² + 2as → 0 = 400 + 2(-9.81)s → s = 20.4 m`,
        'wave': `**Wave Properties**

**Key equations:**
- v = fλ (wave speed = frequency × wavelength)
- f = 1/T (frequency = 1 / period)

**Types:**
- Transverse: displacement perpendicular to direction of travel (light, water waves)
- Longitudinal: displacement parallel to direction of travel (sound)

**Wave phenomena:**
- Reflection: angle of incidence = angle of reflection
- Refraction: wave changes speed and direction at medium boundary
- Diffraction: waves spread out after passing through a gap
- Interference: superposition of waves (constructive/destructive)

**Double-slit:** λ = ax/D where a = slit separation, x = fringe spacing, D = slit-screen distance`,
        'electric': `**Electricity Fundamentals**

**Ohm's Law:** V = IR

**Power equations:**
- P = VI
- P = I²R
- P = V²/R

**Resistors:**
- Series: R_total = R₁ + R₂ + R₃
- Parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃

**Kirchhoff's Laws:**
1. Current law: ΣI_in = ΣI_out at any junction
2. Voltage law: ΣEMF = ΣIR around any closed loop

**Exam tip:** For complex circuits, label all currents and apply Kirchhoff's laws systematically.`,
        'particle': `**Particle Physics**

**Fundamental particles:**
- Quarks: up (u), down (d), charm, strange, top, bottom
- Leptons: electron (e), muon (μ), tau (τ) and their neutrinos

**Quark charges:**
- u = +2/3 e, d = -1/3 e
- Proton = uud (+1e), Neutron = udd (0)

**Particle interactions:**
- Strong force: holds nucleus together (mediated by gluons)
- Weak force: beta decay (mediated by W⁺, W⁻, Z⁰ bosons)
- Electromagnetic: between charged particles (mediated by photons)

**Conservation laws:**
- Charge, baryon number, lepton number, energy-momentum, strangeness (in strong interactions)

**Feynman diagrams:** represent interactions with incoming/outgoing particles and exchange bosons.`
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
        'differentiation': `**Differentiation Rules**

**Basic rules:**
- d/dx(xⁿ) = nxⁿ⁻¹
- d/dx(sin x) = cos x
- d/dx(cos x) = -sin x
- d/dx(eˣ) = eˣ
- d/dx(ln x) = 1/x

**Product rule:** d/dx(uv) = u(dv/dx) + v(du/dx)
**Quotient rule:** d/dx(u/v) = [v(du/dx) - u(dv/dx)] / v²
**Chain rule:** dy/dx = dy/du × du/dx

**Example:** Differentiate y = x² sin x
u = x², v = sin x
dy/dx = x²(cos x) + sin x(2x) = x² cos x + 2x sin x

**Stationary points:** set dy/dx = 0
- d²y/dx² > 0 → minimum
- d²y/dx² < 0 → maximum
- d²y/dx² = 0 → could be point of inflection`,
        'integration': `**Integration Rules**

**Basic integrals:**
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)
- ∫sin x dx = -cos x + C
- ∫cos x dx = sin x + C
- ∫eˣ dx = eˣ + C
- ∫1/x dx = ln|x| + C

**Integration by parts:** ∫u dv = uv - ∫v du
- Choose u by LIATE: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential

**Example:** ∫x eˣ dx
u = x, dv = eˣ dx
du = dx, v = eˣ
∫x eˣ dx = x eˣ - ∫eˣ dx = x eˣ - eˣ + C = eˣ(x - 1) + C

**Definite integrals:** area under curve
- Area between curves: ∫(top - bottom) dx
- Volume of revolution: π∫y² dx`,
        'trigonometry': `**Trigonometry Identities**

**Pythagorean:**
- sin²θ + cos²θ = 1
- 1 + tan²θ = sec²θ
- 1 + cot²θ = csc²θ

**Double angle:**
- sin 2θ = 2 sin θ cos θ
- cos 2θ = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ

**Compound angle:**
- sin(A±B) = sin A cos B ± cos A sin B
- cos(A±B) = cos A cos B ∓ sin A sin B

**Solving trig equations:**
1. Use identities to get one trig function
2. Find principal value
3. Use CAST diagram or graph symmetry for all solutions in range

**R-formula:**
a sin θ + b cos θ = R sin(θ + α) where R = √(a²+b²), tan α = b/a`,
        'vector': `**Vectors**

**Position vector:** point P has position vector OP = pi + qj + rk

**Line equation:**
- r = a + λb (through point a, direction b)
- Cartesian: (x-a₁)/b₁ = (y-a₂)/b₂ = (z-a₃)/b₃

**Scalar product:** a·b = |a||b|cos θ = a₁b₁ + a₂b₂ + a₃b₃
- Perpendicular: a·b = 0
- Angle: cos θ = (a·b)/(|a||b|)

**Cross product:** |a×b| = |a||b|sin θ = area of parallelogram

**Vector geometry:**
- Shortest distance from point to line
- Intersection of lines (check consistent λ)
- Plane equation: r·n = d or ax + by + cz = d`,
        'complex': `**Complex Numbers**

**Forms:**
- Cartesian: z = a + bi
- Polar: z = r(cos θ + i sin θ) = r cis θ = r e^(iθ)
- r = |z| = √(a²+b²), θ = arg(z) = tan⁻¹(b/a)

**Operations:**
- Multiply: multiply moduli, add arguments
- Divide: divide moduli, subtract arguments

**De Moivre's Theorem:**
[r(cos θ + i sin θ)]ⁿ = rⁿ(cos nθ + i sin nθ)

**Roots of unity:**
zⁿ = 1 has n roots equally spaced on unit circle

**Euler's identity:** e^(iπ) + 1 = 0`
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
        'cell': `**Cell Structure & Function**

**Organelles:**
- Nucleus: contains DNA, controls cell activities
- Mitochondria: aerobic respiration, ATP production (double membrane, cristae)
- Ribosomes: protein synthesis (80S in eukaryotes, 70S in prokaryotes)
- ER: rough (protein synthesis), smooth (lipid synthesis, detox)
- Golgi: modifies, packages, transports proteins
- Lysosomes: contain hydrolytic enzymes, autophagy
- Chloroplasts: photosynthesis (thylakoids, stroma)
- Cell wall: cellulose in plants, peptidoglycan in bacteria, chitin in fungi

**Prokaryote vs Eukaryote:**
- Prokaryotes: no nucleus, no membrane-bound organelles, 70S ribosomes, circular DNA
- Eukaryotes: nucleus, membrane-bound organelles, 80S ribosomes, linear DNA with histones

**Transport across membranes:**
- Diffusion: passive, down concentration gradient
- Osmosis: diffusion of water through partially permeable membrane
- Facilitated diffusion: through channel/carrier proteins
- Active transport: against gradient, uses ATP
- Endocytosis/exocytosis: bulk transport`,
        'photosynthesis': `**Photosynthesis**

**Equation:** 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂

**Light-dependent reactions (thylakoid):**
- Photosystem II: water split, O₂ released, electrons excited
- Electron transport chain: chemiosmosis generates ATP
- Photosystem I: NADP reduced to NADPH
- Products: ATP, NADPH, O₂

**Light-independent reactions (Calvin cycle, stroma):**
- CO₂ fixation: RuBP + CO₂ → 2 × GP (catalyzed by rubisco)
- Reduction: GP → TP (uses ATP and NADPH)
- Regeneration: TP → RuBP (uses ATP)

**Limiting factors:**
- Low light: light-dependent limited
- Low CO₂: Calvin cycle limited
- Low temperature: enzyme rate limited
- Remember: only light affects light-dependent; CO₂ and temp affect Calvin cycle

**C4 plants:** minimize photorespiration by fixing CO₂ in mesophyll then moving to bundle sheath`,
        'dna': `**DNA Replication**

**Semi-conservative replication:** each new DNA molecule has one old strand and one new strand.

**Steps:**
1. **Helicase** unwinds and unzips the double helix (breaks hydrogen bonds)
2. **SSBP** stabilize single strands
3. **RNA primase** adds RNA primers
4. **DNA polymerase III** adds complementary nucleotides (5'→3')
   - Leading strand: continuous
   - Lagging strand: Okazaki fragments
5. **DNA polymerase I** replaces RNA primers with DNA
6. **DNA ligase** joins Okazaki fragments

**Enzymes summary:**
| Enzyme | Function |
|---|---|
| Helicase | Unwinds DNA |
| Primase | Adds RNA primers |
| DNA polymerase | Adds nucleotides |
| Ligase | Joins fragments |

**Complementary base pairing:** A-T (2 H-bonds), G-C (3 H-bonds)`,
        'respiration': `**Cellular Respiration**

**Glycolysis (cytoplasm):**
- Glucose → 2 pyruvate
- Net: 2 ATP, 2 NADH

**Link reaction (mitochondrial matrix):**
- Pyruvate → acetyl-CoA + CO₂
- Produces NADH

**Krebs cycle (matrix):**
- Acetyl-CoA enters, 2 CO₂ released per glucose
- Produces: 2 ATP, 6 NADH, 2 FADH₂

**Electron transport chain (inner membrane/cristae):**
- NADH and FADH₂ donate electrons
- Protons pumped into intermembrane space
- Chemiosmosis through ATP synthase
- O₂ is final electron acceptor → H₂O
- Produces ~28-34 ATP

**Anaerobic respiration:**
- Animals: pyruvate → lactate (regenerates NAD⁺)
- Yeast: pyruvate → ethanol + CO₂
- Much less ATP (only glycolysis)`,
        'inheritance': `**Genetics & Inheritance**

**Key terms:**
- Gene: unit of heredity, codes for a protein
- Allele: variant form of a gene
- Genotype: genetic makeup (e.g., Aa)
- Phenotype: observable characteristics
- Homozygous: identical alleles (AA or aa)
- Heterozygous: different alleles (Aa)

**Monohybrid cross:**
- Punnett square for one gene
- Ratios: 3:1 (F2 dominant:recessive), 1:2:1 (genotypes)

**Dihybrid cross:**
- 9:3:3:1 phenotypic ratio (independent assortment)

**Sex linkage:**
- X-linked: more common in males (hemizygous)
- Examples: color blindness, hemophilia

**Autosomal linkage:**
- Genes on same chromosome tend to be inherited together
- Recombination frequency maps gene distance

**Chi-squared test:**
χ² = Σ((O-E)²/E)
- Compare to critical value at appropriate df and p=0.05`
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
        'marketing': `**Business — Marketing Mix (7Ps)**

**Product:** Design, features, branding, packaging, USP, product life cycle (introduction, growth, maturity, decline).

**Price:** Penetration (low to gain share), skimming (high for early adopters), competitive, cost-plus, psychological, predatory, promotional.

**Place:** Distribution channels — direct (online, own stores) vs indirect (retailers, wholesalers). Intensive (everywhere), selective (specific outlets), exclusive (luxury).

**Promotion:** Above-the-line (TV, radio, cinema, print — mass media). Below-the-line (sales promotion, direct mail, PR, sponsorship, personal selling). Digital (social media, SEO, influencer).

**People:** Customer service, staff training, corporate culture.

**Process:** Delivery systems, queuing, after-sales service.

**Physical evidence:** Store layout, website design, packaging, branding materials.`,
        'finance': `**Business — Finance & Accounts**

**Sources of finance:**
- Internal: retained profit, sale of assets, working capital
- External short-term: overdraft, trade credit, factoring
- External long-term: bank loan, debentures, share capital, venture capital, leasing

**Cash flow:**
- Cash ≠ profit. A profitable business can fail from poor cash flow.
- Cash flow forecast: inflows (sales, loans) minus outflows (purchases, wages, rent).
- Solutions to cash flow problems: overdraft, chase debtors, delay payments, reduce stock, sale and leaseback.

**Break-even:**
- Contribution per unit = Price - Variable cost per unit
- Break-even output = Fixed costs / Contribution per unit
- Margin of safety = Actual output - Break-even output

**Ratios:**
- Gross profit margin = (Gross profit / Revenue) × 100
- Net profit margin = (Net profit / Revenue) × 100
- ROCE = (Operating profit / Capital employed) × 100
- Current ratio = Current assets / Current liabilities`,
        'hrm': `**Business — Human Resource Management**

**Recruitment & selection:** Job analysis → job description → person specification → advertise → shortlist → interview → appoint.

**Training:** Induction (new employees), on-the-job (shadowing, mentoring), off-the-job (courses, workshops). Benefits: higher productivity, lower turnover, better quality.

**Motivation theories:**
- Taylor: scientific management, piece rate, money motivates
- Maslow: hierarchy of needs (physiological → safety → social → esteem → self-actualization)
- Herzberg: two-factor theory — motivators (achievement, recognition, responsibility) and hygiene factors (salary, conditions, policy)
- Mayo: Hawthorne effect — social factors and attention improve performance

**Leadership styles:**
- Autocratic: dictatorial, fast decisions, low morale
- Democratic: consultative, higher morale, slower decisions
- Laissez-faire: hands-off, high autonomy, risk of lack of direction
- Paternalistic: parent-child relationship, decisions for "employee good"`,
        'operations': `**Business — Operations Management**

**Methods of production:**
- Job: one-off, customized, high skilled labor, high unit cost (wedding cakes, bespoke suits)
- Batch: groups of similar products, flexible, moderate cost (bakeries, clothing sizes)
- Flow/line: continuous, standardized, high automation, low unit cost, inflexible (cars, soft drinks)
- Cell: team-based, combines job and flow benefits, flexible manufacturing

**Quality:**
- Quality control: inspection at end (detect defects)
- Quality assurance: systems throughout (prevent defects, e.g., ISO 9000)
- TQM: total quality management — everyone responsible, continuous improvement, zero defects

**Lean production:**
- Just-in-time (JIT): stock arrives when needed, reduces waste, requires reliable suppliers
- Kaizen: continuous small improvements
- Kanban: visual signaling system for production flow`,
        'strategy': `**Business — Strategy & Growth**

**Ansoff Matrix:**
- Market penetration: existing product, existing market (lower risk)
- Market development: existing product, new market (export, new segments)
- Product development: new product, existing market (innovation, R&D)
- Diversification: new product, new market (highest risk)

**SWOT Analysis:**
- Strengths / Weaknesses = internal factors
- Opportunities / Threats = external factors (PESTLE: Political, Economic, Social, Technological, Legal, Environmental)

**Globalization:**
- Methods: exporting, licensing, franchising, joint ventures, FDI
- Benefits: larger markets, economies of scale, access to resources
- Challenges: cultural differences, exchange rate risk, political instability, competition`,
        'essay': `**A-Level Business Essay Structure**

**Introduction:**
- Define key terms
- Show understanding of the context
- State your line of argument (thesis)

**Body paragraphs (PEEL):**
- **Point:** Clear topic sentence
- **Explanation:** Theory or concept with application
- **Evidence:** Real business example (company name, date, data)
- **Evaluation:** "However...", "This depends on...", "In contrast..."

**Evaluation techniques:**
1. Short-term vs long-term
2. Size of business (SME vs multinational)
3. Industry context
4. Stakeholder perspective
5. Country/economic context

**Conclusion:**
- Judgment based on evidence
- Prioritize most important factor
- Do not introduce new information`
    },
    psychology: {
        'research methods': `**Psychology — Research Methods**

**Experiments:**
- Lab: high control, high internal validity, low ecological validity
- Field: natural setting, higher ecological validity, less control
- Natural/quasi: IV occurs naturally, no manipulation, ethical for harmful variables

**Key terms:**
- IV = manipulated; DV = measured
- Extraneous variable = could affect DV (controlled)
- Confounding variable = uncontrolled extraneous variable

**Sampling:**
- Random: everyone equal chance, unbiased but hard to achieve
- Opportunity: convenient, quick but biased
- Systematic: every nth person
- Stratified: proportionate to subgroups

**Ethics:**
- Informed consent, right to withdraw, confidentiality, deception only when necessary + debriefing, protection from harm

**Data:**
- Quantitative: numerical, objective, statistical analysis
- Qualitative: rich, in-depth, thematic analysis, harder to generalize`,
        'memory': `**Psychology — Memory**

**Multi-store model (Atkinson & Shiffrin):**
- Sensory memory: iconic (~0.5s), echoic (~2-4s)
- STM: limited capacity (7±2 items), limited duration (~18-30s), acoustic coding
- LTM: unlimited capacity, potentially permanent, semantic coding
- Flow: attention → STM; rehearsal → LTM

**Working memory model (Baddeley & Hitch):**
- Central executive: attention controller, no storage
- Phonological loop: auditory/verbal (phonological store + articulatory control)
- Visuospatial sketchpad: visual/spatial
- Episodic buffer: integrates information, links to LTM

**Forgetting:**
- Decay theory: memory traces fade over time (STM)
- Interference: proactive (old disrupts new), retroactive (new disrupts old)
- Retrieval failure: lack of appropriate cues (encoding specificity principle)

**Eyewitness testimony:**
- Misleading information (Loftus & Palmer), post-event discussion, anxiety, age of witness
- Cognitive interview: context reinstatement, report everything, reverse order, change perspective`,
        'attachment': `**Psychology — Attachment**

**Bowlby's theory:**
- Evolutionary basis: attachment promotes survival
- Critical period: ~6 months to 2.5 years for attachment formation
- Internal working model: template for future relationships
- Monotropy: primary attachment to one figure (usually mother)

**Ainsworth's Strange Situation:**
- Secure (65%): upset when left, happy on return, uses caregiver as secure base
- Insecure-avoidant (22%): ignores caregiver, little distress, independent
- Insecure-resistant (12%): very distressed, rejects caregiver on return, difficult to comfort
- Disorganized: contradictory behavior, fearful, associated with abuse/neglect

**Cultural variations (Van IJzendoorn & Kroonenberg):**
- Secure attachment is most common globally
- Avoidant more common in Germany; resistant more common in Japan (collectivist cultures)

**Maternal deprivation:**
- Bowlby: separation from mother in critical period leads to intellectual/social/emotional damage
- 44 Thieves study: prolonged early separation linked to affectionless psychopathy`,
        'stress': `**Psychology — Stress**

**Physiological responses:**
- SAM axis (acute): hypothalamus → sympathetic NS → adrenal medulla → adrenaline/noradrenaline → fight or flight (heart rate ↑, BP ↑, glucose ↑, pupils dilate)
- HPA axis (chronic): hypothalamus → CRH → pituitary → ACTH → adrenal cortex → cortisol → maintains energy, suppresses immune system

**Stress models:**
- Selye's GAS: Alarm (fight or flight), Resistance (coping sustained), Exhaustion (resources depleted, illness)
- Lazarus & Folkman: Primary appraisal (is it stressful?), Secondary appraisal (can I cope?)

**Sources of stress:**
- Life changes (Holmes & Rahe SRRS): major events require readjustment
- Daily hassles (Kanner): minor irritants accumulate
- Workplace: workload, control, support, role ambiguity

**Stress management:**
- Biological: drugs (benzodiazepines, beta-blockers)
- Psychological: CBT, stress inoculation training (Meichenbaum), mindfulness
- Physical: exercise reduces cortisol, increases endorphins`,
        'social': `**Psychology — Social Influence**

**Conformity:**
- Normative social influence: conform to be liked/accepted (public compliance, private disagreement)
- Informational social influence: conform because we believe others are correct (private acceptance, ambiguous situations)
- Asch (1951): 75% conformed at least once, 37% overall conformity rate. Factors: group size (up to 3), unanimity, task difficulty, anonymity

**Obedience:**
- Milgram (1963): 65% went to 450V. Factors: proximity of authority, proximity of victim, location (Yale), gradual commitment, buffers
- Agency theory: agentic state (following orders) vs autonomous state (taking responsibility)

**Resistance:**
- Social support (ally reduces conformity)
- Locus of control (internals resist more)
- Prior commitment (publicly stating own view)

**Minority influence:**
- Moscovici: consistency, flexibility, commitment
- Snowball effect: minority gradually converts majority`,
        'abnormal': `**Psychology — Abnormal Psychology**

**Definitions of abnormality:**
- Statistical infrequency: rare = abnormal (but high IQ is rare yet desirable)
- Deviation from social norms: violates rules (but norms change culturally/temporally)
- Failure to function adequately: cannot cope with daily life (but may be situational)
- Deviation from ideal mental health (Jahoda): positive criteria (self-actualization, autonomy, etc.)

**Depression:**
- Cognitive explanation (Beck): negative triad (self, world, future), cognitive distortions
- Biological: low serotonin/norepinephrine, genetic predisposition, enlarged amygdala
- Treatment: CBT (challenge negative thoughts), antidepressants (SSRIs), ECT (severe cases)

**Schizophrenia:**
- Symptoms: positive (hallucinations, delusions, disorganized speech) and negative (flat affect, avolition, poverty of speech)
- Biological: dopamine hypothesis (excess dopamine in mesolimbic pathway), genetic (twin/adoption studies), neurodevelopmental (obstetric complications)
- Treatment: antipsychotics (typical = dopamine antagonists, atypical = serotonin-dopamine), CBT for psychosis, family therapy`,
        'biological': `**Psychology — Biological Psychology**

**Neuron structure:**
- Dendrites (receive signals), cell body (soma), axon (transmits), myelin sheath (insulates, speeds conduction), terminal buttons (release neurotransmitters)

**Synaptic transmission:**
- Action potential → Ca²⁺ enters → vesicles fuse → neurotransmitter release → bind to receptors → EPSP/IPSP → reuptake/enzymatic breakdown

**Neurotransmitters:**
- Serotonin: mood, sleep, appetite (low = depression)
- Dopamine: reward, motivation, motor control (excess = schizophrenia, low = Parkinson's)
- Acetylcholine: learning, memory, muscle contraction (low = Alzheimer's)
- GABA: inhibitory (low = anxiety, seizures)

**Brain scanning:**
- EEG: electrical activity, high temporal resolution
- MRI: structure, high spatial resolution
- fMRI: function (blood flow), correlates activity with tasks
- PET: metabolism, uses radioactive tracers

**Hemispheric lateralization:**
- Left: language, logic, analytical
- Right: spatial awareness, creativity, emotion
- Split-brain research (Sperry): corpus callosum severed, each hemisphere processes independently`,
        'essay': `**A-Level Psychology Essay Structure**

**Introduction:**
- Define key terms
- Briefly outline what the essay will cover
- Optional: state your thesis/judgment

**Body paragraphs (AO1 + AO3):**
- AO1 (Knowledge): Describe theory/study clearly with names, dates, procedures, findings
- AO3 (Evaluation): Strengths, weaknesses, comparisons, real-world applications
- Use PEEL: Point, Evidence, Explain, Link

**Evaluation techniques:**
1. Methodological critique (sample size, generalizability, ethics, validity)
2. Comparison with alternative theory
3. Supporting/contradicting evidence
4. Real-world application
5. Determinism vs free will
6. Reductionism vs holism
7. Nature vs nurture

**Conclusion:**
- Summarize main points
- Make a judgment (which theory/explanation is most valid/complete)
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
