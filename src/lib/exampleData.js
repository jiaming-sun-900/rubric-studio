// Worked examples for each of the 7 question types.
//
// Read-only reference content shown in the "See example" modal on the New
// Submission page and in the per-section "Example" popups on a form. It lives
// here as static data because it is fixed reference material shared by every
// contributor — nothing writes to it and it never varies per user.
//
// Every example was written for this demo from published sources, and each
// cited DOI was checked against Crossref and against the paper it names. The
// topics were chosen fresh for this copy.
//
// Keyed by the same route slug used in formConfigs.js. Each example has a
// `question` and an ordered list of `sections`, each a { heading, text } pair.
// The headings matter: getExampleSlice() below matches on them to pull out the
// slice belonging to one rubric section, and the single-field headings are the
// field labels themselves (see `exampleKey` in formConfigs.js).
//
// Writing conventions, so a new example reads like the others:
//   * `text` is split on ";" and each piece is one bullet, so never put a ";"
//     inside an item.
//   * British spelling (-ise, -our, -re), plain words, no dashes joining clauses.
//   * Unicode sub- and superscripts (MoS₂, 10⁴, cm², Li⁺), and no letter
//     subscripts, which Unicode cannot set (write "transition temperature",
//     not "Tc").
//   * Ranges as "7 to 8 wt%", units after a space except ° on an angle, and
//     slashed units (mA/cm², W/(m·K)).
//   * A citation is "DOI <doi> (<authors>, <year>): <reason>", with "et al."
//     from three authors up and a reason the citations field offers. The popup
//     turns each DOI into a link, so write the bare DOI, not a URL.
export const EXAMPLE_DATA = {
  'value-retrieval': {
    question:
      'In the paper that first reported superconductivity in fluorine-doped LaFeAsO, what room-temperature in-plane lattice constant (a) was given for the sample with 5 at% fluorine?',
    sections: [
      {
        heading: 'Literature Values',
        text: 'a = 0.40320(1) nm and c = 0.87263(3) nm for the 5 at% fluorine sample, from Rietveld refinement of its powder X-ray pattern (DOI 10.1021/ja800073m); a = 0.403552(8) nm and c = 0.87393(2) nm for undoped LaFeAsO in the same paper, so fluorine on the oxygen site shortens both axes (DOI 10.1021/ja800073m)',
      },
      {
        heading: 'Correct Answer',
        text: '0.40320 nm (4.0320 Å).',
      },
    ],
  },

  'scientific-calculation': {
    question:
      'A powder X-ray diffraction pattern of copper, taken with Cu Kα₁ radiation (λ = 1.5406 Å), shows its first and strongest peak at 2θ = 43.30°. What lattice parameter does that give?',
    sections: [
      {
        heading: 'Components',
        text: 'Recognise copper as face-centred cubic, where only reflections with h, k and l all odd or all even appear, so the first peak is the (111) reflection; halve the peak position to get the Bragg angle, θ = 21.65°; apply Bragg’s law, nλ = 2d sin θ, with n = 1, to get d(111) = 1.5406 Å / (2 sin 21.65°) = 2.088 Å; relate d to the cubic lattice parameter through d = a / √(h² + k² + l²); multiply d(111) by √3 to get a',
      },
      {
        heading: 'Correct Answer',
        text: 'a = 3.616 Å (about 0.362 nm), within 0.001 Å of the accepted value for copper, 3.615 Å.',
      },
    ],
  },

  'scientific-procedure': {
    question: 'How would you measure the Vickers hardness of a heat-treated steel part?',
    sections: [
      {
        heading: 'Must-Have Components',
        text: 'Cut a section with plenty of coolant, so the heat of cutting does not temper the steel; mount the section so the test surface is flat and perpendicular to the indenter; grind and polish the surface until the corners of an indent can be resolved clearly; check the tester on a certified reference block of similar hardness before testing; choose a test force suited to the part, for example HV 10 (98.07 N); place each indent so its centre is at least 2.5 diagonal lengths from the edge and at least 3 from the centre of the next indent, so neither affects the reading; apply the force and hold it for 10 to 15 s; measure both diagonals of each indent and average them; compute the hardness as HV = 0.1891 F / d², with F in newtons and d, the mean diagonal, in millimetres',
      },
      {
        heading: 'Nice-to-Have Components',
        text: 'Take several indents, for example five, and report the mean and the spread; check that the two diagonals of an indent agree to within 5%, since a larger difference usually means the surface was tilted against the indenter; confirm the section is at least 1.5 times as thick as the diagonal, so the support beneath does not affect the reading; for a surface-hardened part, make a line of indents inward from the surface to show how the hardness changes with depth; report the result with its force, as in 450 HV 10',
      },
    ],
  },

  'information-synthesis': {
    question:
      'Summarise the evidence that molybdenum disulfide changes from an indirect to a direct band-gap semiconductor when it is thinned to a single layer.',
    sections: [
      {
        heading: 'Must-Have Components',
        text: 'Photoluminescence is negligible in bulk MoS₂, weak in flakes of a few layers and bright in a single layer; in the monolayer the emission peak matches the lowest absorption peak, the A exciton, in position and width, so the light comes from a direct transition; flakes of two or more layers also emit a weaker, lower-energy peak from the indirect gap, which moves up in energy as layers are removed and is absent from the monolayer spectrum; the direct gap at the K point barely changes with thickness, so the crossover comes from the indirect gap rising past it; band-structure calculations reproduce the crossover and trace it to interlayer coupling, which strongly affects the states that form the indirect gap but hardly affects those at K',
      },
      {
        heading: 'Nice-to-Have Components',
        text: 'Photoconductivity in a bilayer begins below the direct gap, as it does across an indirect gap, but in a monolayer it begins only at the direct gap; in the monolayer the A and B absorption peaks come from the spin-orbit splitting of the valence band at K',
      },
      {
        heading: 'Ideal Themes',
        text: 'quantum confinement in a layered crystal; the link between the type of gap and how brightly a material emits; agreement between separate optical measurements; agreement between experiment and band-structure calculation',
      },
      {
        heading: 'Tangential Themes',
        text: 'dielectric screening by the substrate and its effect on the optical gap; counting layers by optical contrast, atomic force microscopy or Raman spectroscopy; mechanical exfoliation versus chemical vapour deposition; transistors and other devices made from the monolayer',
      },
      {
        heading: 'Unrelated Themes',
        text: 'the metallic 1T phase of MoS₂ (a different polymorph, not the semiconducting monolayer the question is about); graphene’s lack of a band gap (a common point of comparison, but not evidence about MoS₂)',
      },
      {
        heading: 'Ideal Details',
        text: 'an indirect gap of 1.29 eV in bulk MoS₂; a direct optical gap of about 1.9 eV in the monolayer, where its emission peaks; an indirect-gap emission peak near 1.6 eV in a bilayer; an upward shift of more than 0.6 eV in the indirect gap as the crystal is thinned, against about 0.1 eV in the direct gap; a photoluminescence quantum yield more than 10⁴ times the bulk value in a suspended monolayer',
      },
      {
        heading: 'Tangential Details',
        text: 'A and B exciton peaks about 0.15 eV apart; a monolayer about 6.5 Å thick; a transistor on/off ratio of about 10⁸',
      },
      {
        heading: 'Important Citations',
        text: 'DOI 10.1103/PhysRevLett.105.136805 (Mak et al., 2010): definitive paper in research area; DOI 10.1021/nl903868w (Splendiani et al., 2010): provides evidence of answer components; DOI 10.1038/nnano.2010.279 (Radisavljevic et al., 2011): includes specific data points',
      },
    ],
  },

  'material-selection': {
    question:
      'What ceramic materials could be used as the top coat of a thermal barrier coating on a nickel-superalloy turbine blade?',
    sections: [
      {
        heading: 'Must-Have Components',
        text: 'Yttria-stabilised zirconia with 7 to 8 wt% yttria (YSZ), the incumbent, which pairs low thermal conductivity with a thermal expansion that is high for a ceramic and so fairly close to the metal beneath, and gets its toughness from a metastable tetragonal phase; rare-earth zirconate pyrochlores such as Gd₂Zr₂O₇, which conduct heat less and stay phase-stable to higher temperature, but are less tough and react with the alumina scale, so they are usually laid over a thin YSZ layer; the temperature limit of YSZ, which is the reason alternatives are sought: above about 1200 °C it sinters, and its tetragonal phase slowly breaks down into phases that turn monoclinic on cooling and crack the coating',
      },
      {
        heading: 'Nice-to-Have Components',
        text: 'The deposition route matters as well as the composition: electron-beam physical vapour deposition gives columnar coatings that tolerate strain and is the usual choice for blades, while air plasma spraying gives layered coatings with lower conductivity; the top coat works as a system with a bond coat, of the MCrAlY or platinum-aluminide type, that grows a thin alumina scale, and coatings usually fail at or near that scale rather than in the bulk of the ceramic',
      },
      {
        heading: 'Ideal Themes',
        text: 'low thermal conductivity; thermal expansion match with the superalloy; phase stability and resistance to sintering at operating temperature; fracture toughness and resistance to spallation; chemical compatibility with the alumina scale',
      },
      {
        heading: 'Tangential Themes',
        text: 'attack by molten calcium-magnesium-alumino-silicate (CMAS) deposits; erosion by ingested particles; the cost of rare-earth oxides',
      },
      {
        heading: 'Unrelated Themes',
        text: 'environmental barrier coatings for silicon carbide composites (a different coating problem, where the concern is attack by water vapour rather than insulation)',
      },
      {
        heading: 'Ideal Details',
        text: 'thermal conductivity of about 2.3 W/(m·K) for fully dense YSZ at 1000 °C, and around 1 W/(m·K) in a porous sprayed coating; thermal expansion of about 11 × 10⁻⁶/K for YSZ against about 14 × 10⁻⁶/K for the metal beneath; a top coat typically 100 to 500 micrometres thick; a temperature drop across the coating of 100 °C or more',
      },
      {
        heading: 'Tangential Details',
        text: 'an alumina scale that has grown to a few micrometres when the coating spalls; the GdAlO₃ perovskite that forms where Gd₂Zr₂O₇ meets alumina at around 1200 °C',
      },
      {
        heading: 'Important Citations',
        text: 'DOI 10.1126/science.1068609 (Padture et al., 2002): definitive paper in research area; DOI 10.1016/S1369-7021(05)70934-2 (Clarke and Phillpot, 2005): provides evidence of answer components; DOI 10.1016/j.actamat.2005.03.035 (Leckie et al., 2005): provides evidence of answer components',
      },
    ],
  },

  'experimental-design': {
    question:
      'How would you design an experiment to test whether a new nickel-based catalyst is more active for the oxygen evolution reaction than an IrO₂ reference?',
    sections: [
      {
        heading: 'Must-Have Components',
        text: 'Deposit both catalysts at the same loading on the same inert substrate, so the catalyst is the only variable; remove iron from the alkaline electrolyte, or measure and report it, because nickel catalysts take up trace iron from it and can then look far more active than they are; calibrate the reference electrode against the reversible hydrogen electrode and correct the data for solution resistance; compare the overpotential each catalyst needs to reach 10 mA/cm² of geometric area, the usual benchmark figure; normalise the current by electrochemically active surface area, estimated from the double-layer capacitance, as well as by geometric area, so a rougher film does not pass for a better catalyst; hold each catalyst at constant current for a few hours to check that the activity lasts; test several electrodes of each, so a real difference can be told apart from electrode-to-electrode spread',
      },
      {
        heading: 'Nice-to-Have Components',
        text: 'Take the overpotential from steady-state measurements or the reverse sweep, because the oxidation of Ni(OH)₂ to NiOOH adds current near the onset of oxygen evolution on the forward sweep; report Tafel slopes alongside the overpotential; measure the oxygen produced to confirm the Faradaic efficiency, so the current is known to be oxygen evolution and not oxidation of the catalyst',
      },
      {
        heading: 'Ideal Themes',
        text: 'a like-for-like comparison that changes one thing at a time; intrinsic activity versus the amount of catalyst exposed; artefacts that can make a catalyst look better than it is; stability as well as initial activity',
      },
      {
        heading: 'Tangential Themes',
        text: 'catalyst ink formulation and binder content; rotating versus static electrodes and the removal of bubbles; the cost and scarcity of iridium',
      },
      {
        heading: 'Unrelated Themes',
        text: 'hydrogen evolution activity at the cathode (the other half of water splitting, not the comparison being designed)',
      },
      {
        heading: 'Ideal Details',
        text: '1 M KOH or NaOH as the electrolyte; 10 mA/cm² as roughly the current density of a 10% efficient solar-to-fuels device; overpotentials of about 0.35 to 0.43 V at 10 mA/cm² for the non-precious catalysts benchmarked in alkaline solution, for scale; a stability hold of about 2 hours at 10 mA/cm²',
      },
      {
        heading: 'Tangential Details',
        text: 'catalyst loadings of the order of 0.1 to 1 mg/cm²; polarisation curves swept at 10 mV/s or slower, close to steady state; a specific capacitance of about 40 µF/cm² to turn double-layer capacitance into surface area',
      },
      {
        heading: 'Important Citations',
        text: 'DOI 10.1021/ja407115p (McCrory et al., 2013): definitive paper in research area; DOI 10.1021/ja502379c (Trotochaud et al., 2014): provides evidence of answer components',
      },
    ],
  },

  'failure-analysis': {
    question:
      'A lithium-ion cell with a graphite anode loses capacity quickly when it is fast-charged at 0 °C, but cycles well at room temperature. What explains it?',
    sections: [
      {
        heading: 'Must-Have Components',
        text: 'In the cold, lithium diffuses slowly into graphite, charge transfer at its surface slows and the electrolyte conducts less well, so under a high charging current the anode potential falls below 0 V against Li/Li⁺; below that potential some of the lithium deposits as metal on the graphite surface instead of intercalating into it; part of the plated lithium loses electrical contact or reacts with the electrolyte to form new solid electrolyte interphase (SEI), and that lithium is lost from the cell for good; the capacity fade comes mainly from this loss of cyclable lithium, not from the electrodes losing active material; at room temperature the same current keeps the anode above 0 V, so little or no lithium plates, which is why the cell cycles well there',
      },
      {
        heading: 'Nice-to-Have Components',
        text: 'Plating is worst near the end of charge, when the graphite is nearly full and its potential is already closest to 0 V; a voltage plateau at the start of discharge, or a kink in the voltage as the cell rests after charging, signals plated lithium being stripped or re-inserted, and so detects plating without opening the cell; plated lithium can grow into dendrites, so the same condition is a safety problem as well as an ageing one',
      },
      {
        heading: 'Ideal Themes',
        text: 'the anode potential, not the cell voltage, as what decides whether lithium plates; the competition between intercalation and plating; reversible versus irreversible plated lithium; how the diagnosis could be confirmed, in the cell or in a post-mortem',
      },
      {
        heading: 'Tangential Themes',
        text: 'the anode-to-cathode capacity ratio in the cell design; electrolyte formulations for low temperature; charging protocols that lower the current in the cold; warming the cell before charging',
      },
      {
        heading: 'Unrelated Themes',
        text: 'transition-metal dissolution from the cathode (an ageing mechanism, but one driven by heat and high voltage, not by charging in the cold); the lower capacity any cell shows while it is cold, which returns on warming (not the permanent fade the question describes)',
      },
      {
        heading: 'Ideal Details',
        text: 'graphite’s last lithiation plateau at only about 0.1 V against Li/Li⁺, which leaves little margin before plating; ageing slowest near 25 °C in commercial 18650 cells cycled from −20 °C to 70 °C, with lithium plating dominant below that temperature and growth of the solid electrolyte interphase above it',
      },
      {
        heading: 'Tangential Details',
        text: 'plated lithium seen as a grey or silvery deposit on the anode in a post-mortem',
      },
      {
        heading: 'Important Citations',
        text: 'DOI 10.1016/j.jpowsour.2018.02.063 (Waldmann et al., 2018): definitive paper in research area; DOI 10.1016/j.jpowsour.2014.03.112 (Waldmann et al., 2014): includes specific data points',
      },
    ],
  },
}

export function getExampleBySlug(slug) {
  return EXAMPLE_DATA[slug] ?? null
}

// Return just the slice of a form's worked example relevant to one section, for
// the per-section "Example" popups on the form. `key` is one of:
//   'question'   → a single { heading: 'Question', text } (the example question)
//   'Components' | 'Themes' | 'Details' → every example section whose heading
//        names that group (e.g. "Ideal themes", "Tangential themes", "Unrelated
//        themes" all belong to Themes). Matches the rubric section title so the
//        popup shows exactly that section's content.
//   any other string → an exact section heading, matching a single field's
//        example (used by the simple per-field Example buttons on Value
//        Retrieval, e.g. 'Literature Values').
// Returns [] when the form has no example content for that section — callers use
// that to decide whether to render the button at all.
export function getExampleSlice(slug, key) {
  const example = EXAMPLE_DATA[slug]
  if (!example) return []
  if (key === 'question') {
    return example.question ? [{ heading: 'Question', text: example.question }] : []
  }
  const sections = example.sections ?? []
  if (key === 'Components' || key === 'Themes' || key === 'Details') {
    // 'Components' → 'component', 'Themes' → 'theme', 'Details' → 'detail'.
    const needle = key.toLowerCase().replace(/s$/, '')
    return sections.filter((s) => s.heading.toLowerCase().includes(needle))
  }
  return sections.filter((s) => s.heading === key)
}
