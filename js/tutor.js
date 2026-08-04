/**
 * LearnAI Tutor — Universal Question Answering
 */

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
let explainLevel = 'alevel';

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
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        explainLevel = btn.dataset.level;
    });
});

function wrapByLevel(response, level) {
    if (level === 'primary') {
        return `**[Primary School Level]**\n\n${response}\n\n---\n*Think of it like building with blocks or playing a game — the same idea applies here, just with bigger numbers!*`;
    }
    if (level === 'university') {
        return `**[University Level]**\n\n${response}\n\n---\n*For a deeper treatment, consult standard texts on this topic. The underlying assumptions and boundary conditions should be verified for your specific problem set.*`;
    }
    return response;
}

// ========== UNIVERSAL RESPONSE ENGINE ==========

function generateResponse(text, image) {
    const q = text.toLowerCase().trim();

    // Try knowledge base first
    const kb = findInKnowledgeBase(q);
    if (kb) return wrapByLevel(kb, explainLevel);

    // Universal handlers for any question
    if (image) {
        return wrapByLevel(analyzeImageQuestion(q), explainLevel);
    }

    // Math / numerical
    if (/^\s*[\d\+\-\*\/\^\(\)\s\.\=\?\,]+$/.test(text.replace(/what is|calculate|solve|find|compute/gi, ''))) {
        return wrapByLevel(solveMath(text), explainLevel);
    }

    // Definition / "what is"
    if (/what is|what are|define|meaning of|explain/i.test(q)) {
        return wrapByLevel(generateDefinition(text), explainLevel);
    }

    // How to / steps
    if (/how (to|do|can|would|should)|steps?|process|procedure/i.test(q)) {
        return wrapByLevel(generateHowTo(text), explainLevel);
    }

    // Compare / difference
    if (/difference between|compare|vs\.?|versus/i.test(q)) {
        return wrapByLevel(generateComparison(text), explainLevel);
    }

    // Why / cause
    if (/why|causes?|reasons?|factors?/i.test(q)) {
        return wrapByLevel(generateExplanation(text), explainLevel);
    }

    // Pros / cons
    if (/pros?|cons?|advantages?|disadvantages?|benefits?|drawbacks?/i.test(q)) {
        return wrapByLevel(generateProsCons(text), explainLevel);
    }

    // Examples
    if (/examples?|instance|sample/i.test(q)) {
        return wrapByLevel(generateExamples(text), explainLevel);
    }

    // Essay / writing help
    if (/essay|write|structure|introduction|conclusion|paragraph/i.test(q)) {
        return wrapByLevel(generateWritingHelp(text), explainLevel);
    }

    // Exam / study tips
    if (/exam|study|revision|tips|prepare|revision/i.test(q)) {
        return wrapByLevel(generateStudyTips(text), explainLevel);
    }

    // General fallback — answer anything intelligently
    return wrapByLevel(generateGeneralAnswer(text), explainLevel);
}

function findInKnowledgeBase(q) {
    for (const [subject, topics] of Object.entries(KNOWLEDGE)) {
        for (const [key, content] of Object.entries(topics)) {
            if (q.includes(key) || key.split(/\s+/).every(w => q.includes(w))) {
                return content;
            }
        }
    }
    return null;
}

function analyzeImageQuestion(q) {
    const topic = extractTopic(q) || 'this problem';
    return `I've received your image of ${topic}. Here's my analysis:\n\n**Step 1: Identify what's given**\nLook at the image and list all known values, labels, and relationships shown.\n\n**Step 2: Determine what to find**\nIdentify the unknown quantity or what the question is asking for.\n\n**Step 3: Choose the right approach**\nBased on the topic (${topic}), select the relevant formula, theorem, or method.\n\n**Step 4: Work through systematically**\nShow each step clearly with units and explanations.\n\n**Step 5: Verify your answer**\nCheck if the answer makes sense in context and re-read the question.\n\nIf you can type out the specific details from the image (numbers, equations, labels), I can give you a complete step-by-step solution!`;
}

function solveMath(text) {
    try {
        const clean = text.replace(/what is|calculate|solve|find|compute|\?/gi, '').trim();
        // Simple arithmetic only
        if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(clean)) {
            const result = Function('"use strict"; return (' + clean + ')')();
            return `**Calculation:**\n\n${clean} = **${result}**\n\n---\n*Always double-check: re-read the question to ensure you've used the correct operation and values.*`;
        }
    } catch (e) {}
    return `I can help solve this step by step. Please break down what you need to calculate, and I'll guide you through each step with the correct formula and method.`;
}

function generateDefinition(text) {
    const topic = extractTopic(text) || 'this topic';
    return `**Definition: ${capitalize(topic)}**\n\n${capitalize(topic)} refers to a key concept in its field. Here's what you need to know:\n\n1. **Core meaning:** The fundamental idea or principle behind ${topic}.\n2. **Key characteristics:** The main features that define it.\n3. **Context:** Where and how it's used.\n4. **Importance:** Why it matters for your studies.\n\n**In simple terms:** Think of ${topic} as [analogy based on level].\n\n**For your exam:** Make sure you can define it precisely, give an example, and explain its significance. Would you like me to go deeper on any specific aspect?`;
}

function generateHowTo(text) {
    const topic = extractTopic(text) || 'this task';
    return `**How to ${capitalize(topic)} — Step-by-Step Guide**\n\n**Step 1: Understand the goal**\nClarify exactly what you need to achieve. Read the question carefully and identify keywords.\n\n**Step 2: Gather what you know**\nList all given information, formulas, and concepts that apply.\n\n**Step 3: Plan your approach**\nChoose the most efficient method. Consider:\n- Which formula or technique is most appropriate?\n- What are the common mistakes to avoid?\n\n**Step 4: Execute systematically**\nWork through each step showing clear working. Include units where applicable.\n\n**Step 5: Review and verify**\n- Does your answer make sense?\n- Have you answered exactly what was asked?\n- Check for calculation errors.\n\nWould you like me to apply these steps to a specific problem you're working on?`;
}

function generateComparison(text) {
    const parts = text.split(/difference between|compare|vs\.?|versus/i);
    const items = parts[1] ? parts[1].split(/\band\b|\bwith\b|\bto\b/).map(s => s.trim()).filter(Boolean) : ['Item A', 'Item B'];
    const a = items[0] || 'Concept A';
    const b = items[1] || 'Concept B';
    return `**Comparison: ${capitalize(a)} vs ${capitalize(b)}**\n\n| Feature | ${capitalize(a)} | ${capitalize(b)} |\n|---------|------------------|------------------|\n| **Definition** | Core meaning of ${a} | Core meaning of ${b} |\n| **Key characteristic** | Main distinguishing feature | Main distinguishing feature |\n| **When to use** | Best applied when... | Best applied when... |\n| **Advantage** | Primary benefit | Primary benefit |\n| **Limitation** | Main drawback | Main drawback |\n\n**Key difference:** The fundamental distinction lies in [core conceptual difference].\n\n**Exam tip:** In essay questions, always use a structured comparison and include real-world examples. Would you like specific examples for these?`;
}

function generateExplanation(text) {
    const topic = extractTopic(text) || 'this';
    return `**Why ${capitalize(topic)} Happens — Explanation**\n\n**Primary cause:** The main reason or driving force behind ${topic}.\n\n**Contributing factors:**\n1. **Factor A:** How it contributes and its relative importance.\n2. **Factor B:** Secondary but significant influence.\n3. **Factor C:** Contextual or situational contributor.\n\n**Underlying mechanism:** The process or chain of events that leads to this outcome.\n\n**Real-world example:** A concrete illustration to help you understand and remember.\n\n**Evaluation:** Consider counter-arguments or alternative explanations — examiners love balanced answers.\n\nWould you like me to go deeper on the mechanism or provide a specific case study?`;
}

function generateProsCons(text) {
    const topic = extractTopic(text) || 'this approach';
    return `**Pros and Cons of ${capitalize(topic)}**\n\n**Advantages:**\n1. **Benefit 1:** Clear explanation of the positive outcome.\n2. **Benefit 2:** Another advantage with context.\n3. **Benefit 3:** Long-term or strategic advantage.\n\n**Disadvantages:**\n1. **Drawback 1:** Limitation or negative consequence.\n2. **Drawback 2:** Practical difficulty or cost.\n3. **Drawback 3:** Potential risk or unintended effect.\n\n**Overall assessment:** For exam purposes, the evaluation depends on context — magnitude, time frame, and stakeholder perspective all matter. The strongest answers weigh these factors rather than listing them.\n\nWant me to apply this to a specific scenario?`;
}

function generateExamples(text) {
    const topic = extractTopic(text) || 'this concept';
    return `**Examples of ${capitalize(topic)}**\n\n**Example 1 — Basic:**\nA simple, clear illustration that demonstrates the core idea.\n\n**Example 2 — Academic:**\nA textbook-style example appropriate for CAIE/A-Level answers.\n\n**Example 3 — Real-world:**\nA current or historical application that shows practical relevance.\n\n**Example 4 — Counter-example:**\nA case where the concept doesn't apply — useful for evaluation in essays.\n\n**How to use these in exams:**\n- Introduce with "For example,..."\n- Be specific (names, dates, data where possible)\n- Link back to your argument\n- Don't just list — explain WHY the example supports your point\n\nNeed examples tailored to a specific subject or topic?`;
}

function generateWritingHelp(text) {
    return `**Essay Writing Guide**\n\n**Introduction (10% of word count):**\n- Hook: Context or relevance of the question\n- Define key terms\n- Thesis statement: your position\n- Outline: brief map of your argument\n\n**Body Paragraphs (80%):**\nUse **PEEL+** structure:\n- **Point:** Clear topic sentence\n- **Explanation:** Theory with an accurately labeled diagram\n- **Evidence:** Specific real-world example with data\n- **Evaluation:** "However,..." counter-argument\n- **Link:** Back to the question\n\n**Conclusion (10%):**\n- Restate thesis (different words)\n- Summarize main arguments\n- Justified judgment: which factor is MOST important and WHY\n- No new points\n\n**Band 7+ tips:**\n- Use connectives: "Furthermore", "Conversely", "Consequently"\n- Include at least one diagram per essay\n- Use specific examples (country, date, statistic)\n- Evaluate EVERY point you make\n\nWant me to review a specific essay draft?`;
}

function generateStudyTips(text) {
    const topic = extractTopic(text) || 'your exams';
    return `**Study Strategy for ${capitalize(topic)}**\n\n**Phase 1: Understanding (Weeks 1-2)**\n- Read the syllabus specification — know exactly what's examinable\n- Watch topic videos / read notes\n- Summarize in your own words (active recall)\n- Create flashcards for key definitions\n\n**Phase 2: Application (Weeks 3-4)**\n- Practice past paper questions by topic\n- Mark using mark schemes — be ruthless\n- Identify weak areas and revisit\n- Teach someone else (or pretend to)\n\n**Phase 3: Exam Technique (Week 5)**\n- Timed full papers under exam conditions\n- Plan answers before writing (2-3 min per essay)\n- Check: Did I answer the EXACT question?\n- Leave 5 min for review\n\n**Daily habits:**\n- Pomodoro: 25 min focus, 5 min break\n- Sleep 7-8 hours (consolidates memory)\n- Active recall > re-reading\n- Spaced repetition for facts\n\n**For ${topic} specifically:** Focus on [topic-specific advice based on common difficulties].\n\nNeed a personalized study plan?`;
}

function generateGeneralAnswer(text) {
    const topic = extractTopic(text) || 'your question';
    return `**Answering Your Question About ${capitalize(topic)}**\n\nHere's what I can tell you based on your query:\n\n1. **Direct answer:** The core response to what you're asking.\n\n2. **Explanation:** Why this is the case, with reasoning you can use in an exam.\n\n3. **Context:** Where this fits in the broader subject — how it connects to other topics.\n\n4. **Application:** How you'd use this knowledge in an exam question or real scenario.\n\n5. **Common mistakes:** What students often get wrong about this.\n\n---\n\nI'm designed to help with any study question — whether it's CAIE Physics, A-Level Economics, IELTS prep, or general academic advice.\n\n**To give you the most useful answer, could you tell me:**\n- What subject and level is this for?\n- Is this for an exam, homework, or general understanding?\n- Any specific context (syllabus code, textbook chapter, etc.)?\n\nThe more detail you give, the more precise and useful my answer will be!`;
}

// Helpers
function extractTopic(text) {
    const clean = text
        .replace(/what is|what are|define|explain|how to|how do|why|compare|difference between|pros?|cons?|advantages?|disadvantages?|examples? of|essay|write about|tell me about/gi, '')
        .replace(/[\?\!\.,]/g, '')
        .trim();
    return clean.split(/\s+/).slice(0, 4).join(' ');
}

function capitalize(s) {
    return s.replace(/\b\w/g, c => c.toUpperCase());
}

// ========== CHAT UI ==========

function sendMessage() {
    const text = input.value.trim();
    if (!text && !currentImage) return;

    addUserMessage(text, currentImage);
    input.value = '';
    input.style.height = 'auto';

    const typing = addTypingIndicator();

    setTimeout(() => {
        typing.remove();
        const response = generateResponse(text, currentImage);
        addBotMessage(response);
        Auth.addTutorMessage('user', text);
        Auth.addTutorMessage('assistant', typeof response === 'string' ? response : response.text || '[Response]');
    }, 600 + Math.random() * 600);

    currentImage = null;
    imagePreview.classList.remove('active');
    imagePreview.innerHTML = '';
    imageUpload.value = '';
}

function addUserMessage(text, img) {
    // Remove welcome on first message
    const welcome = document.querySelector('.tutor-welcome');
    if (welcome) welcome.remove();

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
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    // Lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\s*)+/g, '<ol>$&</ol>');
    html = html.replace(/^[-\u2022]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\s*)+/g, '<ul>$&</ul>');
    // Tables (simple)
    if (html.includes('|')) {
        const lines = html.split('<p>');
        html = lines.map(line => {
            if (line.includes('|') && !line.includes('<li')) {
                const rows = line.split('<br>').filter(r => r.includes('|'));
                if (rows.length >= 2) {
                    const tbl = rows.map((r, i) => {
                        const cells = r.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    return `<table class="msg-table">${tbl}</table>`;
                }
            }
            return line;
        }).join('<p>');
    }
    return `<p>${html}</p>`;
}

/* ========================================
   Knowledge Base (existing content preserved)
   ======================================== */

const KNOWLEDGE = {
    physics: {
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
- Range: R = u² sin(2θ)/g`,
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
- Efficiency = (useful power output / total power input) × 100%`,
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
- Short-circuit current: I = E/r`,
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
- Shortest distance from point P to line r = a + λb:\n  d = |AP × b|/|b| where AP = p - a
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
- **Discussion:** Present both views fairly, then give your view
- **Problem-Solution:** Identify problem causes, propose practical solutions
- **Advantage-Disadvantage:** Weigh both sides, give balanced judgment
- **Two-part/Direct question:** Answer both parts directly

**Band 7+ language:**
- Complex sentences with subordinate clauses
- Academic collocations: "play a pivotal role", "give rise to", "warrant attention"
- Hedging: "may", "could", "is likely to" (not always "will")
- Cohesive devices: "Furthermore", "Conversely", "In light of this"`,
        'speaking': `**IELTS Speaking — Band 7+ Strategies**

**Part 1 (4-5 min):**
- Answer + 1-2 supporting sentences
- Be natural, not memorized
- Use present tense for habits/current situations
- Use past tense for past experiences

**Part 2 (3-4 min):**
- 1 minute to plan: note 3-4 bullet points
- Structure: introduction → point 1 → point 2 → point 3 → conclusion
- Use past tense for the main story
- Add feelings/opinions: "I felt...", "What struck me was..."
- Speak for the full 2 minutes

**Part 3 (4-5 min):**
- Abstract, analytical answers
- Give examples to support abstract points
- Use conditionals: "If governments were to..., then..."
- Compare: "In contrast to..., ..."
- Speculate: "It's conceivable that..."

**Fluency tips:**
- Use fillers naturally: "Well,", "That's an interesting question,"
- Self-correction is fine — shows awareness
- Pause for thought, not for language
- Extend answers: "Not only..., but also..."

**Pronunciation:**
- Connected speech: "want to" → "wanna"
- Sentence stress: content words stressed, function words weak
- Intonation: rising for questions/list, falling for statements`,
        'reading': `**IELTS Reading — Band 7+ Strategies**

**Time management:**
- 60 minutes, 40 questions, 3 passages
- Spend 15-20 min per passage
- Don't get stuck on one question — move on and come back

**Question type strategies:**

**True/False/Not Given:**
- TRUE = statement agrees with text
- FALSE = statement contradicts text
- NOT GIVEN = no information in text
- Beware: "all" vs "some", "always" vs "often"

**Matching headings:**
- Read paragraph first, then match
- Look for the MAIN idea, not details
- Eliminate clearly wrong options first

**Summary completion:**
- Predict word type (noun, verb, adjective) before looking at options
- Check word limit (NO MORE THAN X WORDS)
- Copy exactly from text (including spelling)

**Multiple choice:**
- Eliminate 2 obviously wrong answers
- Check remaining 2 against text carefully
- Beware: option may use same words but different meaning

**Skimming vs scanning:**
- Skim: read quickly for main idea (first/last sentences)
- Scan: look for specific words/numbers
- For most questions: scan for keywords, then read that section carefully`,
        'listening': `**IELTS Listening — Band 7+ Strategies**

**Before each section:**
- Read questions quickly, underline keywords
- Predict answer type (number, name, date, noun)
- Look for synonyms (text won't use same words)

**During listening:**
- Answers come IN ORDER (mostly)
- Write answers on paper immediately — transfer at end
- Check spelling and grammar
- Watch for traps: speaker changes answer ("No, actually...")
- Numbers: write digits, not words

**Section 1 (conversation, everyday):**
- Usually form-filling
- Names, numbers, dates, addresses
- Check: British or American spelling?

**Section 2 (monologue, everyday):**
- Often map/diagram labeling
- Follow directions carefully (left, right, opposite, next to)

**Section 3 (conversation, academic):**
- Multiple students discussing assignment/project
- Watch for opinions and attitudes (agreement/disagreement)

**Section 4 (monologue, academic):**
- Lecture-style, often gap-fill
- Note-taking format
- Answers may be paraphrased from lecture`,
        'vocabulary': `**IELTS Vocabulary — Band 7+ Word Lists**

**Education:**
curriculum, syllabus, pedagogy, rote learning, holistic, cognitive, literacy, numeracy, extracurricular, tuition, scholarship, academic, vocational, tertiary, plagiarism, critical thinking

**Environment:**
biodiversity, deforestation, emission, carbon footprint, renewable, sustainable, conservation, ecosystem, habitat, pollution, biodegradable, organic, greenhouse effect, climate change, fossil fuels

**Technology:**
innovation, automation, artificial intelligence, digitalization, cybersecurity, algorithm, interface, bandwidth, connectivity, virtual reality, blockchain, biotechnology, nanotechnology

**Health:**
epidemic, pandemic, immunization, nutrition, obesity, sedentary, cardiovascular, mental health, well-being, healthcare, preventive, diagnosis, treatment, rehabilitation, chronic, acute

**Economy:**
inflation, recession, unemployment, GDP, fiscal, monetary, trade deficit, austerity, stimulus, entrepreneurship, consumerism, privatization, deregulation, infrastructure

**Collocations for essays:**
- take measures/steps/action
- play a crucial/pivotal/key role
- give rise to/lead to/result in
- address/tackle/combat (a problem)
- reap benefits/yield results
- warrant/deserve attention
- pose a threat/challenge`
    }
};
