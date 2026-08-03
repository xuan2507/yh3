/* ========================================
   Quiz Engine
   ======================================== */

if (!Auth.isLoggedIn()) window.location.href = 'login.html';
Auth.updateUserDisplay();

const QUIZ_SUBJECTS = [
    { id: 'physics', name: 'Physics', icon: 'fa-atom', color: '#6366f1', questions: 24 },
    { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', color: '#10b981', questions: 24 },
    { id: 'maths', name: 'Mathematics', icon: 'fa-square-root-alt', color: '#f59e0b', questions: 20 },
    { id: 'biology', name: 'Biology', icon: 'fa-dna', color: '#ec4899', questions: 24 },
    { id: 'economics', name: 'Economics', icon: 'fa-chart-line', color: '#8b5cf6', questions: 20 }
];

const QUESTIONS = {
    physics: [
        { q: 'What is the SI unit of force?', options: ['Watt', 'Newton', 'Joule', 'Pascal'], a: 1, exp: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s².' },
        { q: 'A car accelerates from rest to 20 m/s in 5s. What is its acceleration?', options: ['4 m/s²', '5 m/s²', '100 m/s²', '0.25 m/s²'], a: 0, exp: 'a = (v-u)/t = (20-0)/5 = 4 m/s².' },
        { q: 'Which of Newton\'s laws states F = ma?', options: ['First', 'Second', 'Third', 'Fourth'], a: 1, exp: 'Newton\'s Second Law: resultant force equals mass times acceleration.' },
        { q: 'What is the wavelength of a wave with frequency 50 Hz and speed 340 m/s?', options: ['6.8 m', '17 m', '0.147 m', '390 m'], a: 0, exp: 'λ = v/f = 340/50 = 6.8 m.' },
        { q: 'In a series circuit with R₁=2Ω and R₂=4Ω, what is the total resistance?', options: ['1.33Ω', '6Ω', '8Ω', '2Ω'], a: 1, exp: 'Series: R_total = R₁ + R₂ = 2 + 4 = 6Ω.' },
        { q: 'What is the kinetic energy of a 2 kg object moving at 3 m/s?', options: ['6 J', '9 J', '18 J', '3 J'], a: 1, exp: 'KE = ½mv² = ½ × 2 × 9 = 9 J.' },
        { q: 'Which particle has a charge of +2/3e?', options: ['Up quark', 'Down quark', 'Electron', 'Neutron'], a: 0, exp: 'Up quark has charge +2/3e; down quark has -1/3e.' },
        { q: 'A 10 kg mass is lifted 5 m vertically. What is the gain in gravitational potential energy? (g=10)', options: ['50 J', '500 J', '250 J', '100 J'], a: 1, exp: 'GPE = mgh = 10 × 10 × 5 = 500 J.' },
        { q: 'What happens to the resistance of a metallic conductor as temperature increases?', options: ['Decreases', 'Increases', 'Stays the same', 'Becomes zero'], a: 1, exp: 'For metals, resistance increases with temperature due to increased lattice vibrations.' },
        { q: 'In a vacuum, all electromagnetic waves travel at:', options: ['Different speeds', 'The speed of light', 'Half the speed of light', 'Infinite speed'], a: 1, exp: 'In a vacuum, all EM waves travel at c ≈ 3×10⁸ m/s.' },
        { q: 'What is the principle of conservation of momentum?', options: ['p = mv', 'Total momentum is constant if no external force', 'F = ma', 'E = mc²'], a: 1, exp: 'Total momentum before = total momentum after in an isolated system.' },
        { q: 'Which force keeps planets in orbit around the Sun?', options: ['Electromagnetic', 'Nuclear', 'Gravitational', 'Frictional'], a: 2, exp: 'Gravitational force provides the centripetal force for orbital motion.' },
        { q: 'What is the unit of electric charge?', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], a: 2, exp: 'Charge is measured in Coulombs (C).' },
        { q: 'In a transverse wave, particles oscillate:', options: ['Parallel to wave direction', 'Perpendicular to wave direction', 'In circles', 'Not at all'], a: 1, exp: 'In transverse waves, displacement is perpendicular to the direction of wave travel.' },
        { q: 'What does a concave lens do to parallel light rays?', options: ['Converges them', 'Diverges them', 'Reflects them', 'Absorbs them'], a: 1, exp: 'Concave (diverging) lenses spread parallel rays outward.' },
        { q: 'The half-life of a radioactive isotope is the time for:', options: ['All atoms to decay', 'Half the atoms to decay', 'Quarter to decay', 'Activity to reach zero'], a: 1, exp: 'Half-life is the time taken for half the radioactive nuclei to decay.' },
        { q: 'What is the relationship between pressure and volume for an ideal gas at constant temperature?', options: ['Directly proportional', 'Inversely proportional', 'No relationship', 'Exponential'], a: 1, exp: 'Boyle\'s Law: P ∝ 1/V at constant temperature.' },
        { q: 'Which quantity is a vector?', options: ['Speed', 'Distance', 'Mass', 'Velocity'], a: 3, exp: 'Velocity has both magnitude and direction — it is a vector.' },
        { q: 'What is the efficiency of a machine that outputs 40 J from 100 J input?', options: ['40%', '60%', '140%', '250%'], a: 0, exp: 'Efficiency = (useful output / total input) × 100 = 40/100 × 100 = 40%.' },
        { q: 'Sound waves are:', options: ['Transverse', 'Longitudinal', 'Electromagnetic', 'Stationary'], a: 1, exp: 'Sound is a longitudinal mechanical wave — particles oscillate parallel to direction of travel.' },
        { q: 'What is the work done when a 5 N force moves an object 3 m in the force direction?', options: ['15 J', '8 J', '1.67 J', '125 J'], a: 0, exp: 'W = F × d = 5 × 3 = 15 J.' },
        { q: 'The nucleus of an atom contains:', options: ['Electrons and protons', 'Protons and neutrons', 'Electrons and neutrons', 'Only protons'], a: 1, exp: 'The nucleus contains protons and neutrons (nucleons). Electrons orbit outside.' },
        { q: 'What is the formula for Ohm\'s Law?', options: ['V = IR', 'P = IV', 'I = V/R', 'Both A and C'], a: 3, exp: 'V = IR and I = V/R are equivalent forms of Ohm\'s Law.' },
        { q: 'If the frequency of a wave doubles while speed stays constant, the wavelength:', options: ['Doubles', 'Halves', 'Stays same', 'Quadruples'], a: 1, exp: 'v = fλ. If f doubles and v constant, λ must halve.' }
    ],
    chemistry: [
        { q: 'What is the relative atomic mass of carbon-12?', options: ['6', '12', '14', '24'], a: 1, exp: 'By definition, carbon-12 has a relative atomic mass of exactly 12.' },
        { q: 'How many moles are in 36 g of water (H₂O)? [Mr=18]', options: ['1 mol', '2 mol', '0.5 mol', '18 mol'], a: 1, exp: 'n = m/Mr = 36/18 = 2 mol.' },
        { q: 'What type of bond involves sharing electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], a: 1, exp: 'Covalent bonds form when atoms share electron pairs.' },
        { q: 'In the reaction 2H₂ + O₂ → 2H₂O, what is the mole ratio of H₂ to O₂?', options: ['1:1', '2:1', '1:2', '2:2'], a: 1, exp: 'From the balanced equation: 2 moles H₂ react with 1 mole O₂.' },
        { q: 'Which ion has a 2+ charge?', options: ['Na⁺', 'Mg²⁺', 'Cl⁻', 'O²⁻'], a: 1, exp: 'Magnesium loses 2 electrons to form Mg²⁺.' },
        { q: 'What is the pH of a neutral solution at 25°C?', options: ['0', '7', '14', '1'], a: 1, exp: 'Neutral solutions have pH = 7 at standard temperature.' },
        { q: 'Which gas is produced when an alkali metal reacts with water?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], a: 1, exp: '2Na + 2H₂O → 2NaOH + H₂. Hydrogen gas is produced.' },
        { q: 'What does a catalyst do?', options: ['Increases product yield', 'Increases rate without being consumed', 'Shifts equilibrium', 'Changes ΔH'], a: 1, exp: 'Catalysts speed up reactions by providing an alternative pathway. They are not consumed.' },
        { q: 'Which functional group is present in carboxylic acids?', options: ['-OH', '-COOH', '-CHO', '-NH₂'], a: 1, exp: 'Carboxylic acids contain the -COOH functional group.' },
        { q: 'What happens to equilibrium position when temperature increases for an exothermic reaction?', options: ['Shifts right', 'Shifts left', 'No change', 'Doubles rate'], a: 1, exp: 'For exothermic reactions, increasing T shifts equilibrium toward reactants (left).' },
        { q: 'Which element has the electronic configuration 2,8,7?', options: ['Neon', 'Chlorine', 'Argon', 'Sodium'], a: 1, exp: 'Chlorine (atomic number 17) has configuration 2,8,7.' },
        { q: 'What is the oxidation state of oxygen in H₂O?', options: ['+2', '-2', '0', '+1'], a: 1, exp: 'Oxygen usually has oxidation state -2 in compounds (except peroxides).' },
        { q: 'Which process separates mixtures based on boiling point?', options: ['Filtration', 'Distillation', 'Chromatography', 'Crystallization'], a: 1, exp: 'Distillation separates liquids based on differences in boiling point.' },
        { q: 'What color does litmus turn in acid?', options: ['Blue', 'Red', 'Purple', 'Green'], a: 1, exp: 'Acids turn blue litmus red.' },
        { q: 'What is the formula of calcium chloride?', options: ['CaCl', 'CaCl₂', 'Ca₂Cl', 'CaCl₃'], a: 1, exp: 'Calcium is Ca²⁺ and chloride is Cl⁻, so CaCl₂ is needed for charge balance.' },
        { q: 'Which intermolecular force is strongest?', options: ['Van der Waals', 'Dipole-dipole', 'Hydrogen bond', 'London dispersion'], a: 2, exp: 'Hydrogen bonds are the strongest intermolecular forces among these options.' },
        { q: 'What is the product when an alkene reacts with bromine?', options: ['Alkane', 'Dibromoalkane', 'Alcohol', 'Carboxylic acid'], a: 1, exp: 'Alkenes undergo addition: C=C + Br₂ → CBr-CBr (dibromoalkane).' },
        { q: 'What is enthalpy change of combustion?', options: ['Heat to break bonds', 'Heat released when 1 mole burns completely in oxygen', 'Heat to form compound', 'Heat to vaporize'], a: 1, exp: 'Standard enthalpy of combustion: heat change when 1 mole burns completely in O₂ under standard conditions.' },
        { q: 'Which ion is present in all acids?', options: ['OH⁻', 'H⁺', 'Cl⁻', 'Na⁺'], a: 1, exp: 'Acids are proton (H⁺) donors. H⁺ (or H₃O⁺ in water) is present in all acids.' },
        { q: 'What is the molecular geometry of methane (CH₄)?', options: ['Linear', 'Trigonal planar', 'Tetrahedral', 'Octahedral'], a: 2, exp: 'CH₄ has 4 bonding pairs and no lone pairs → tetrahedral geometry (109.5°).' },
        { q: 'Which statement about isotopes is correct?', options: ['Same mass number', 'Same proton number, different neutron number', 'Different proton number', 'Same neutron number'], a: 1, exp: 'Isotopes have the same number of protons but different numbers of neutrons.' },
        { q: 'What is the charge on an electron?', options: ['+1', '-1', '0', '+2'], a: 1, exp: 'An electron has a charge of -1 (or -1.6×10⁻¹⁹ C).' },
        { q: 'In electrolysis, reduction occurs at the:', options: ['Anode', 'Cathode', 'Electrolyte', 'Both electrodes'], a: 1, exp: 'Reduction (gain of electrons) occurs at the cathode. Remember: RED CAT.' },
        { q: 'Which statement describes a strong acid?', options: ['Partially ionizes', 'Fully ionizes in water', 'Does not ionize', 'Forms OH⁻ ions'], a: 1, exp: 'Strong acids completely ionize (dissociate) in aqueous solution.' }
    ],
    maths: [
        { q: 'Differentiate x⁴ with respect to x.', options: ['4x³', 'x³', '4x⁴', 'x⁵/5'], a: 0, exp: 'd/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x⁴) = 4x³.' },
        { q: 'What is the integral of 3x²?', options: ['x³ + C', '6x + C', 'x³/3 + C', '3x + C'], a: 0, exp: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C. ∫3x² dx = 3·x³/3 + C = x³ + C.' },
        { q: 'If sin θ = 0.5, what is θ in degrees (0°≤θ≤90°)?', options: ['30°', '45°', '60°', '90°'], a: 0, exp: 'sin 30° = 0.5. This is a standard angle value.' },
        { q: 'What is the value of log₁₀(100)?', options: ['1', '2', '10', '100'], a: 1, exp: 'log₁₀(100) = log₁₀(10²) = 2.' },
        { q: 'Solve for x: 2x + 5 = 13', options: ['3', '4', '9', '18'], a: 1, exp: '2x = 8, so x = 4.' },
        { q: 'What is the derivative of sin x?', options: ['cos x', '-sin x', '-cos x', 'tan x'], a: 0, exp: 'd/dx(sin x) = cos x.' },
        { q: 'Factorize x² - 5x + 6', options: ['(x-2)(x-3)', '(x+2)(x+3)', '(x-1)(x-6)', '(x+1)(x-6)'], a: 0, exp: 'x² - 5x + 6 = (x-2)(x-3) since -2 × -3 = 6 and -2 + -3 = -5.' },
        { q: 'What is the sum of the roots of x² + 7x + 10 = 0?', options: ['7', '-7', '10', '-10'], a: 1, exp: 'For ax²+bx+c=0, sum of roots = -b/a = -7/1 = -7.' },
        { q: 'If f(x) = x², what is f(3)?', options: ['3', '6', '9', '27'], a: 2, exp: 'f(3) = 3² = 9.' },
        { q: 'What is the gradient of the line y = 3x + 2?', options: ['2', '3', '5', '6'], a: 1, exp: 'In y = mx + c, m is the gradient. Here m = 3.' },
        { q: 'Simplify (x³)²', options: ['x⁵', 'x⁶', 'x⁹', '2x³'], a: 1, exp: '(x³)² = x³ˣ² = x⁶.' },
        { q: 'What is cos(60°)?', options: ['0', '0.5', '0.707', '0.866'], a: 1, exp: 'cos 60° = 0.5. Standard exact value.' },
        { q: 'Find the discriminant of x² + 4x + 4 = 0', options: ['0', '4', '8', '16'], a: 0, exp: 'b² - 4ac = 16 - 16 = 0. One repeated real root.' },
        { q: 'What is the period of sin(2x)?', options: ['π', '2π', 'π/2', '4π'], a: 0, exp: 'Period of sin(kx) is 2π/k. For sin(2x), period = 2π/2 = π.' },
        { q: 'Evaluate e⁰', options: ['0', '1', 'e', 'undefined'], a: 1, exp: 'Any non-zero number to the power 0 equals 1.' },
        { q: 'If y = ln x, what is dy/dx?', options: ['x', '1/x', 'eˣ', 'ln x'], a: 1, exp: 'd/dx(ln x) = 1/x.' },
        { q: 'What is the modulus of the complex number 3 + 4i?', options: ['3', '4', '5', '7'], a: 2, exp: '|3+4i| = √(3²+4²) = √(9+16) = √25 = 5.' },
        { q: 'Solve sin x = 0 for 0° ≤ x ≤ 360°', options: ['0° only', '0°, 180°', '0°, 180°, 360°', '90°, 270°'], a: 2, exp: 'sin x = 0 at x = 0°, 180°, 360°.' },
        { q: 'What is the binomial expansion of (1+x)²?', options: ['1+2x+x²', '1+x²', '2+2x', '1+x+x²'], a: 0, exp: '(1+x)² = 1 + 2x + x².' },
        { q: 'Find the stationary points of y = x² - 4x + 3', options: ['x=2', 'x=0', 'x=1', 'x=3'], a: 0, exp: 'dy/dx = 2x - 4 = 0 → x = 2. d²y/dx² = 2 > 0, so minimum at x=2.' }
    ],
    biology: [
        { q: 'Which organelle is responsible for protein synthesis?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], a: 2, exp: 'Ribosomes read mRNA and assemble amino acids into proteins.' },
        { q: 'What is the end product of aerobic respiration?', options: ['Lactate', 'Ethanol + CO₂', 'CO₂ + H₂O', 'Glucose'], a: 2, exp: 'Aerobic respiration: glucose + O₂ → CO₂ + H₂O + ATP.' },
        { q: 'Which gas is taken in during photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], a: 1, exp: 'Plants take in CO₂ and release O₂ during photosynthesis.' },
        { q: 'DNA replication is described as:', options: ['Conservative', 'Semi-conservative', 'Dispersive', 'Non-conservative'], a: 1, exp: 'Each new DNA molecule contains one old strand and one new strand.' },
        { q: 'What type of cell division produces gametes?', options: ['Mitosis', 'Meiosis', 'Binary fission', 'Budding'], a: 1, exp: 'Meiosis produces haploid gametes with genetic variation.' },
        { q: 'Which enzyme unwinds DNA during replication?', options: ['DNA polymerase', 'Helicase', 'Ligase', 'Primase'], a: 1, exp: 'Helicase breaks hydrogen bonds to unzip the double helix.' },
        { q: 'What is the function of the cell membrane?', options: ['Protein synthesis', 'Control what enters and leaves', 'Energy production', 'Cell division'], a: 1, exp: 'The partially permeable membrane regulates transport in and out.' },
        { q: 'Which blood vessel carries blood away from the heart?', options: ['Vein', 'Capillary', 'Artery', 'Valve'], a: 2, exp: 'Arteries carry blood away from the heart (usually oxygenated).' },
        { q: 'What is the role of mRNA?', options: ['Store genetic information', 'Carry amino acids', 'Carry genetic code from nucleus to ribosome', 'Catalyze reactions'], a: 2, exp: 'mRNA is transcribed from DNA and carries the code to ribosomes for translation.' },
        { q: 'Which of these is a monosaccharide?', options: ['Starch', 'Sucrose', 'Glucose', 'Cellulose'], a: 2, exp: 'Glucose is a monosaccharide (single sugar unit). Starch and cellulose are polysaccharides.' },
        { q: 'What is the function of stomata?', options: ['Photosynthesis', 'Gas exchange', 'Support', 'Transport'], a: 1, exp: 'Stomata allow CO₂ in and O₂/water vapor out.' },
        { q: 'Which hormone lowers blood glucose?', options: ['Glucagon', 'Adrenaline', 'Insulin', 'Thyroxine'], a: 2, exp: 'Insulin promotes glucose uptake and glycogen synthesis, lowering blood glucose.' },
        { q: 'What is the correct base pairing in DNA?', options: ['A-C, G-T', 'A-T, G-C', 'A-G, C-T', 'A-A, G-G'], a: 1, exp: 'Adenine pairs with Thymine (2 H-bonds), Guanine with Cytosine (3 H-bonds).' },
        { q: 'Which structure is found in plant cells but not animal cells?', options: ['Nucleus', 'Mitochondria', 'Cell wall', 'Ribosome'], a: 2, exp: 'Plant cells have cellulose cell walls; animal cells do not.' },
        { q: 'What is natural selection?', options: ['Survival of the random', 'Survival and reproduction of best-adapted', 'Genetic drift', 'Mutations only'], a: 1, exp: 'Individuals with advantageous traits are more likely to survive and reproduce.' },
        { q: 'Which part of the brain controls balance and coordination?', options: ['Cerebrum', 'Cerebellum', 'Medulla', 'Hypothalamus'], a: 1, exp: 'The cerebellum coordinates movement, balance, and posture.' },
        { q: 'What is the role of NADP in photosynthesis?', options: ['Accepts electrons and H⁺', 'Releases oxygen', 'Splits water', 'Fixes CO₂'], a: 0, exp: 'NADP accepts electrons and H⁺ to become NADPH in the light-dependent reactions.' },
        { q: 'Which process occurs in the mitochondria?', options: ['Photosynthesis', 'Glycolysis', 'Krebs cycle', 'DNA replication'], a: 2, exp: 'The Krebs cycle and electron transport chain occur in the mitochondrial matrix and inner membrane.' },
        { q: 'What is a codon?', options: ['A sugar', 'Three bases coding for an amino acid', 'A type of enzyme', 'A chromosome'], a: 1, exp: 'A codon is a sequence of three mRNA bases that specifies an amino acid.' },
        { q: 'Which is NOT a characteristic of enzymes?', options: ['Speed up reactions', 'Are proteins', 'Are used up in reactions', 'Have active sites'], a: 2, exp: 'Enzymes are not used up in reactions — they can be reused.' },
        { q: 'What is the name of the process by which water moves across a partially permeable membrane?', options: ['Diffusion', 'Osmosis', 'Active transport', 'Transpiration'], a: 1, exp: 'Osmosis is the net movement of water from high to low water potential.' },
        { q: 'Which chamber of the heart pumps blood to the lungs?', options: ['Left atrium', 'Left ventricle', 'Right atrium', 'Right ventricle'], a: 3, exp: 'The right ventricle pumps deoxygenated blood to the lungs via the pulmonary artery.' },
        { q: 'What is the role of auxin in plants?', options: ['Photosynthesis', 'Cell elongation and growth', 'Water transport', 'Protein synthesis'], a: 1, exp: 'Auxin promotes cell elongation, especially in shoots, causing phototropism and gravitropism.' },
        { q: 'Which statement about mitosis is correct?', options: ['Produces haploid cells', 'Produces genetically identical diploid cells', 'Involves crossing over', 'Reduces chromosome number'], a: 1, exp: 'Mitosis produces two genetically identical diploid daughter cells for growth/repair.' }
    ],
    economics: [
        { q: 'What happens to quantity demanded when price increases?', options: ['Increases', 'Decreases', 'Stays same', 'Doubles'], a: 1, exp: 'Law of demand: price and quantity demanded are inversely related.' },
        { q: 'Which market structure has many firms selling differentiated products?', options: ['Perfect competition', 'Monopoly', 'Oligopoly', 'Monopolistic competition'], a: 3, exp: 'Monopolistic competition: many firms, low barriers, product differentiation.' },
        { q: 'GDP stands for:', options: ['Gross Domestic Product', 'General Domestic Price', 'Gross Development Plan', 'Global Demand Projection'], a: 0, exp: 'GDP = Gross Domestic Product = total value of goods/services produced domestically.' },
        { q: 'If PED > 1, demand is:', options: ['Inelastic', 'Elastic', 'Unit elastic', 'Perfectly inelastic'], a: 1, exp: 'PED > 1 means elastic — % change in quantity > % change in price.' },
        { q: 'What is opportunity cost?', options: ['Total cost', 'Next best alternative foregone', 'Fixed cost', 'Sunk cost'], a: 1, exp: 'Opportunity cost is the value of the next best alternative given up.' },
        { q: 'Which policy tool does a central bank use?', options: ['Tax rates', 'Government spending', 'Interest rates', 'Tariffs'], a: 2, exp: 'Central banks use interest rates (monetary policy), not fiscal tools.' },
        { q: 'A trade surplus occurs when:', options: ['Imports > Exports', 'Exports > Imports', 'Imports = Exports', 'No trade occurs'], a: 1, exp: 'Trade surplus = exports exceed imports (positive balance of trade).' },
        { q: 'What causes demand-pull inflation?', options: ['Rising costs', 'Excess aggregate demand', 'Falling money supply', 'Higher taxes'], a: 1, exp: 'Demand-pull inflation: aggregate demand grows faster than aggregate supply.' },
        { q: 'In perfect competition, firms are:', options: ['Price makers', 'Price takers', 'Monopolists', 'Cartel members'], a: 1, exp: 'In perfect competition, firms are price takers — market determines price.' },
        { q: 'Which is a supply-side policy?', options: ['Interest rate cut', 'Education and training', 'Tax cut for consumers', 'Government spending'], a: 1, exp: 'Education/training improves labor quality and productivity — a supply-side policy.' },
        { q: 'What does comparative advantage mean?', options: ['Being best at everything', 'Lower opportunity cost in producing a good', 'Having more resources', 'Higher absolute output'], a: 1, exp: 'Comparative advantage = lower opportunity cost, not necessarily absolute advantage.' },
        { q: 'A regressive tax takes a larger percentage from:', options: ['High incomes', 'Low incomes', 'Middle incomes', 'Corporations'], a: 1, exp: 'Regressive taxes (e.g., VAT) take a higher % from low-income earners.' },
        { q: 'What is the formula for PED?', options: ['%ΔP / %ΔQ', '%ΔQ / %ΔP', 'P × Q', 'ΔP × ΔQ'], a: 1, exp: 'PED = (% change in quantity demanded) / (% change in price).' },
        { q: 'Which is a merit good?', options: ['Cigarettes', 'Education', 'Alcohol', 'Pollution'], a: 1, exp: 'Merit goods (education, healthcare) are under-consumed due to positive externalities.' },
        { q: 'What is structural unemployment?', options: ['During recession', 'Skills/location mismatch', 'Between jobs', 'Seasonal'], a: 1, exp: 'Structural unemployment: workers\' skills do not match available jobs or are in wrong location.' },
        { q: 'An appreciation of currency means:', options: ['Value falls', 'Value rises', 'No change', 'Inflation rises'], a: 1, exp: 'Appreciation = currency rises in value against other currencies.' },
        { q: 'What is the Lorenz curve used for?', options: ['Inflation', 'Income distribution', 'Unemployment', 'Growth'], a: 1, exp: 'The Lorenz curve shows income/wealth distribution; further from line = more inequality.' },
        { q: 'Which is NOT a macroeconomic objective?', options: ['Economic growth', 'Low unemployment', 'Profit maximization', 'Low inflation'], a: 2, exp: 'Profit maximization is a microeconomic/firm objective, not macroeconomic.' },
        { q: 'What does the multiplier effect describe?', options: ['Tax increases', 'Initial spending leading to larger final increase in AD', 'Interest rate changes', 'Exchange rate effects'], a: 1, exp: 'Multiplier: an initial injection of spending creates a larger final increase in national income.' },
        { q: 'Which policy would reduce a budget deficit?', options: ['Increase government spending', 'Increase taxes', 'Decrease taxes', 'Increase transfers'], a: 1, exp: 'Higher taxes (or lower spending) reduce a budget deficit.' }
    ]
};

// DOM refs
const hub = document.getElementById('quizHub');
const quizArea = document.getElementById('quizArea');
const quizResult = document.getElementById('quizResult');
const subjectsGrid = document.getElementById('quizSubjectsGrid');

let currentSubject = null;
let currentQuestions = [];
let currentQIndex = 0;
let score = 0;
let answers = [];

// Load stats
function loadStats() {
    const user = Auth.getUser();
    const s = user.stats || {};
    document.getElementById('totalQuizzes').textContent = s.quizzesTaken || 0;
    document.getElementById('avgScore').textContent = (s.avgScore || 0) + '%';
    // Calculate best streak across all subjects
    let best = 0;
    const progress = user.progress || {};
    Object.values(progress).forEach(p => {
        const scores = (p.scores || []).map(x => x.score / x.total);
        let streak = 0, maxStreak = 0;
        scores.forEach(r => {
            if (r >= 0.7) { streak++; maxStreak = Math.max(maxStreak, streak); }
            else streak = 0;
        });
        best = Math.max(best, maxStreak);
    });
    document.getElementById('bestStreak').textContent = best;
}
loadStats();

// Render subject cards
subjectsGrid.innerHTML = QUIZ_SUBJECTS.map(s => {
    const user = Auth.getUser();
    const prog = (user.progress && user.progress[s.id]) || { scores: [] };
    const last = prog.scores.length > 0 ? prog.scores[prog.scores.length - 1] : null;
    const lastScore = last ? Math.round(last.score / last.total * 100) + '%' : 'Not taken';
    return `
        <div class="quiz-subject-card" data-subject="${s.id}">
            <div class="qs-icon" style="background:${s.color}20;color:${s.color}">
                <i class="fas ${s.icon}"></i>
            </div>
            <h3>${s.name}</h3>
            <p>${s.questions} questions</p>
            <div class="qs-last">Last: <span>${lastScore}</span></div>
            <button class="btn btn-primary btn-sm btn-full">Start Quiz</button>
        </div>
    `;
}).join('');

document.querySelectorAll('.quiz-subject-card').forEach(card => {
    card.addEventListener('click', () => startQuiz(card.dataset.subject));
});

function startQuiz(subjectId) {
    currentSubject = subjectId;
    const pool = QUESTIONS[subjectId] || [];
    // Shuffle and pick 10
    currentQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    currentQIndex = 0;
    score = 0;
    answers = [];

    hub.style.display = 'none';
    quizResult.style.display = 'none';
    quizArea.style.display = 'block';

    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentQIndex];
    document.getElementById('quizCounter').textContent = `${currentQIndex + 1} / ${currentQuestions.length}`;
    document.getElementById('quizProgressFill').style.width = `${((currentQIndex) / currentQuestions.length) * 100}%`;
    document.getElementById('quizQuestion').textContent = q.q;

    const opts = document.getElementById('quizOptions');
    opts.innerHTML = q.options.map((opt, i) =>
        `<button class="quiz-option" data-index="${i}"><span class="opt-letter">${String.fromCharCode(65+i)}</span><span class="opt-text">${opt}</span></button>`
    ).join('');

    document.getElementById('quizExplanation').innerHTML = '';
    document.getElementById('quizExplanation').classList.remove('show');
    document.getElementById('nextQuestion').disabled = true;
    document.getElementById('nextQuestion').textContent = currentQIndex === currentQuestions.length - 1 ? 'Finish' : 'Next';

    opts.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    });
}

function selectAnswer(index) {
    const q = currentQuestions[currentQIndex];
    const correct = index === q.a;
    if (correct) score++;
    answers.push({ q: q.q, selected: index, correct: q.a, correct: correct });

    const opts = document.querySelectorAll('.quiz-option');
    opts.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.a) btn.classList.add('correct');
        else if (i === index && !correct) btn.classList.add('wrong');
    });

    const exp = document.getElementById('quizExplanation');
    exp.innerHTML = `<div class="exp-header ${correct ? 'exp-correct' : 'exp-wrong'}"><i class="fas ${correct ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${correct ? 'Correct!' : 'Incorrect'}</div><div class="exp-body">${q.exp}</div>`;
    exp.classList.add('show');

    document.getElementById('nextQuestion').disabled = false;
}

document.getElementById('nextQuestion').addEventListener('click', () => {
    currentQIndex++;
    if (currentQIndex < currentQuestions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
});

document.getElementById('backToQuizzes').addEventListener('click', () => {
    quizArea.style.display = 'none';
    hub.style.display = 'block';
});

function finishQuiz() {
    quizArea.style.display = 'none';
    quizResult.style.display = 'block';

    const total = currentQuestions.length;
    const percent = Math.round(score / total * 100);

    document.getElementById('resultScore').textContent = `${score} / ${total}`;
    document.getElementById('resultPercent').textContent = `${percent}%`;

    let msg = '', icon = '';
    if (percent >= 90) { msg = 'Outstanding! You have mastered this topic.'; icon = 'fa-trophy'; }
    else if (percent >= 70) { msg = 'Great work! Keep practicing for perfection.'; icon = 'fa-star'; }
    else if (percent >= 50) { msg = 'Good effort. Review the explanations and try again.'; icon = 'fa-thumbs-up'; }
    else { msg = 'Keep studying. Use the AI Tutor to review these topics.'; icon = 'fa-book-open'; }

    document.getElementById('resultMessage').textContent = msg;
    document.getElementById('resultIcon').innerHTML = `<i class="fas ${icon}"></i>`;

    // Breakdown
    const breakdown = document.getElementById('resultBreakdown');
    breakdown.innerHTML = answers.map((a, i) =>
        `<div class="rb-item ${a.correct ? 'rb-correct' : 'rb-wrong'}">
            <span class="rb-num">${i+1}</span>
            <span class="rb-status"><i class="fas ${a.correct ? 'fa-check' : 'fa-times'}"></i></span>
        </div>`
    ).join('');

    // Save
    Auth.addQuizResult(currentSubject, score, total, 'General');
    Auth.updateStreak();
    loadStats();
}

document.getElementById('retryQuiz').addEventListener('click', () => startQuiz(currentSubject));
document.getElementById('backToHub').addEventListener('click', () => {
    quizResult.style.display = 'none';
    hub.style.display = 'block';
});
