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
        'balance': `**Balancing Chemical Equations**

**Method:**
1. Write the correct formulae for reactants and products
2. Count atoms on each side
3. Add coefficients (never change subscripts!)
4. Check atom balance again

**Example:**
Unbalanced: H₂ + O₂ → H₂O
Balanced: 2H₂ + O₂ → 2H₂O

**Tips:**
- Balance elements that appear in only one compound first
- Save O and H for last (they often appear multiple times)
- If stuck with odd numbers, use fractions then multiply all by 2

**Redox shortcut:** Balance atoms, then balance oxygen with H₂O, then hydrogen with H⁺, then charge with electrons.`,
        'mole': `**The Mole Concept**

**Key equations:**
- n = m/M (moles = mass / molar mass)
- n = cV (moles = concentration × volume in dm³)
- n = V/24.0 (for gases at RTP: volume in dm³)

**Concentration:**
- mol/dm³ = (mass / Mr) / volume(dm³)
- g/dm³ = mass / volume(dm³)

**Stoichiometry steps:**
1. Write balanced equation
2. Convert given quantity to moles
3. Use mole ratio from equation
4. Convert to required quantity

**Example:** What mass of MgO forms from 5g Mg?
2Mg + O₂ → 2MgO
Moles Mg = 5/24.3 = 0.206 mol
Moles MgO = 0.206 mol
Mass MgO = 0.206 × 40.3 = 8.30 g`,
        'organic': `**Organic Chemistry Reactions**

**Alkanes:**
- Combustion: C₂H₆ + 3.5O₂ → 2CO₂ + 3H₂O
- Substitution: CH₄ + Cl₂ → CH₃Cl + HCl (UV light)

**Alkenes:**
- Addition: C₂H₄ + Br₂ → C₂H₄Br₂ (decolorizes bromine)
- Hydrogenation: C₂H₄ + H₂ → C₂H₆ (Ni catalyst)
- Hydration: C₂H₄ + H₂O → C₂H₅OH (H₃PO₄ catalyst)

**Alcohols:**
- Oxidation: primary → aldehyde → carboxylic acid
- Oxidation: secondary → ketone
- Dehydration: alcohol → alkene (conc H₂SO₄, heat)

**Test for functional groups:**
- Alkene: bromine water (orange → colorless)
- Aldehyde: Tollens' reagent (silver mirror)
- Carboxylic acid: NaHCO₃ (effervescence)`,
        'equilibrium': `**Chemical Equilibrium**

**Kc expression:**
For aA + bB ⇌ cC + dD
Kc = [C]^c [D]^d / ([A]^a [B]^b)

**Le Chatelier's Principle:**
If a dynamic equilibrium is disturbed, the system adjusts to minimize the disturbance.

**Changes:**
- Concentration: increase reactant → shifts right
- Pressure (gases): increase pressure → shifts to side with fewer moles
- Temperature: increase T → shifts in endothermic direction
- Catalyst: speeds up both directions equally, no shift

**Kp for gases:** partial pressures instead of concentrations

**Exam tip:** Only temperature changes Kc. Concentration/pressure changes shift position but Kc stays constant at constant T.`,
        'atomic': `**Atomic Structure**

**Subatomic particles:**
- Proton: mass 1, charge +1, in nucleus
- Neutron: mass 1, charge 0, in nucleus
- Electron: mass 1/1840, charge -1, in orbitals

**Isotopes:** same proton number, different neutron number.
- Relative atomic mass = weighted average of isotope masses

**Electronic configuration:**
- Fill orbitals: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p...
- s holds 2, p holds 6, d holds 10, f holds 14
- Example Cr: [Ar] 3d⁵ 4s¹ (exception for half-filled stability)

**Ionization energy:** energy to remove 1 mole of electrons from 1 mole of gaseous atoms.
- Increases across period (nuclear charge increases)
- Decreases down group (shielding increases)
- Drops from Group 2 to 3 (p orbital), Group 5 to 6 (pairing)`
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
        'demand': `**Demand and Supply**

**Law of demand:** price ↑ → quantity demanded ↓ (inverse relationship)
**Law of supply:** price ↑ → quantity supplied ↑ (direct relationship)

**Equilibrium:** where demand = supply. Market clears with no surplus/shortage.

**Shifts in demand (non-price factors):**
- Income (normal goods: +, inferior goods: -)
- Prices of substitutes (+) and complements (-)
- Tastes/preferences (+)
- Expectations
- Population (+)

**Shifts in supply:**
- Costs of production (-)
- Technology (+)
- Number of firms (+)
- Taxes (-), subsidies (+)

**Price elasticity of demand (PED):**
PED = (%ΔQd) / (%ΔP)
- |PED| > 1: elastic (luxuries, many substitutes)
- |PED| < 1: inelastic (necessities, few substitutes)
- Revenue: elastic → price cut increases revenue`,
        'market': `**Market Structures**

| Feature | Perfect Competition | Monopoly | Oligopoly | Monopolistic |
|---|---|---|---|---|
| Firms | Many | One | Few | Many |
| Product | Homogeneous | Unique | Differentiated | Differentiated |
| Barriers | None | High | High | Low |
| Price | Price taker | Price maker | Interdependent | Some control |
| Profit | Normal only | Supernormal possible | Uncertain | Normal in LR |

**Key diagrams:**
- Perfect competition: MC = MR at minimum AC (efficient)
- Monopoly: MC = MR, P > MC, deadweight loss

**Oligopoly behavior:**
- Game theory: prisoners' dilemma, Nash equilibrium
- Kinked demand curve: price rigidity
- Collusion (cartels) vs. non-price competition

**Evaluation:** Always consider efficiency (allocative P=MC, productive min AC, dynamic innovation)`,
        'macro': `**Macroeconomic Objectives**

**1. Economic growth:** sustained increase in real GDP
- Causes: AD increase (C+I+G+X-M) or AS increase
- Policies: fiscal (spending/tax), monetary (interest rates), supply-side

**2. Low unemployment:**
- Types: frictional, structural, cyclical, seasonal
- Natural rate = frictional + structural
- Policies: demand management, supply-side (education/training)

**3. Low inflation:**
- CPI/RPI measures
- Causes: demand-pull, cost-push, monetary
- Policies: contractionary fiscal/monetary, supply-side

**4. Balance of payments:**
- Current account = trade in goods + services + income + transfers
- Surplus vs. deficit causes and consequences

**5. Fair distribution of income:**
- Lorenz curve, Gini coefficient
- Progressive taxation, welfare benefits, minimum wage`,
        'essay': `**A-Level Economics Essay Structure**

**Introduction (2-3 sentences):**
- Define key terms
- State your position/what the essay will examine

**Body paragraphs (PEEL/EEL structure):**
- **Point:** clear topic sentence
- **Explanation:** theory with diagrams
- **Evidence:** real-world examples (countries, dates, data)
- **Evaluation:** counter-argument, limitations, "however", "depends on"

**Evaluation techniques:**
1. **It depends on...** (time frame, country, elasticity)
2. **Short run vs long run**
3. **Magnitude/significance**
4. **Conflicting objectives** (e.g., growth vs environment)
5. **Alternative policies**
6. **Ceteris paribus assumption**

**Conclusion:**
- Summarize main arguments
- Give a justified judgment (which factor is most important)
- Do not introduce new points`
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
    else if (/business|accounting|psychology|english|chinese/i.test(q)) subject = 'other';

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
    }

    if (/essay|write|structure|argument|evaluation/i.test(q) && subject === 'economics') {
        return KNOWLEDGE.economics.essay;
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
