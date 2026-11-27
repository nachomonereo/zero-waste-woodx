import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// WOOD-X // 100% ZERO-WASTE PARAMETRIC FURNITURE & ARCHITECTURAL STUDIO (v6)
// - 8 Zero-Waste Typologies:
//   01 / Modular Sofa & Chair (Backrest has real 3D Mortise Hole for Seat Tenon Tooth!)
//   02 / Tapered Plank Chair (199.6×20cm Chair with Batch Multiplier: 1 to 6 Chairs)
//   03 / Vaulted Arch Stool (9 Parts: Disc + 4 Vaulted Legs + 4 Rounded Corner Shelves)
//   04 / Nested L-Leg Table (7 Parts: Exact 4-View Blueprint + Rounded Corner Fillets)
//   05 / X-Corner Boomerang Table (3 Parts: Fixed Clean Top-Right Corner + X-Crown)
//   06 / Chevron Fin Shelf (Slotted Vertical Chevron Fins — 0 Collision with Shelves!)
//   07 / Credenza Cabinet (10 Parts: 2-Door Sideboard + Open Lower Plinth + Interior Shelves)
//   08 / Zero-Waste Wave Wall (Customizable Flow / Alternating / Mirror Slat Wall)
// - Includes Shareable URL Link Generator (#btnShareLink)
// ============================================================================

const SWISS_PALETTE = [
  '#B38B6D', // 01 Warm Taupe
  '#5F7375', // 02 Architectural Slate
  '#8C674B', // 03 Umber Wood
  '#5A6B5C', // 04 Forest Sage
  '#9C7A63', // 05 Terracotta Taupe
  '#756E65', // 06 Warm Stone
  '#6B7B8C', // 07 Steel Slate
  '#A3866A', // 08 Sand Oak
  '#4F5D53', // 09 Deep Pine
  '#8A7968'  // 10 Raw Umber
];

const state = {
  typology: 'chair',
  sheetL: 1260,     // Automatically computed from active typology parameters
  sheetW: 1200,     // Automatically computed from active typology parameters
  thickness: 24,    // mm
  kerfWidth: 6.0,   // Fixed 3-option Bit diameter: 6, 10, or 12 mm (Default 6 mm -> -3.0 mm/edge offset)
  kerfMode: 'shared', // Shared cut line (-K/2 interior, 0 exterior)
  fitCompMode: 'auto_tighten', // Auto-tighten 3D assembly & pre-compensate mortises
  showLayerExterior: true,
  showLayerInterior: true,
  showLayerOffsets: true,
  showDims2D: true,
  zoom2D: 1.0,
  pan2D: [0, 0],
  archViewMode: '3d',
  assembly: 1.0,    // 100% assembled 3D furniture
  materialMode: 'butcher',
  selectedPieceId: null,

  params: {
    // 01 / MODULAR SOFA & CHAIR (Standardized 122cm Board Width; 1830mm Sofa = Exact 2440×1220mm Sheet!)
    chair: {
      seatWidth: 1220,     // 610mm (Armchair) to 1830mm (3-Seater Sofa) -> Board L = seatWidth + 610 (up to 2440×1220mm!)
      toothWidth: 240,     // 120 to 360 mm (60mm steps) -> Width of Tenon Tooth & Backrest Mortise Hole
      cornerRadius: 24,    // 0 to 48 mm (6mm steps)     -> Rounded corner fillet on Side Armrests & Backrest
      reclineDeg: 6        // 0° to 12° ergonomic backrest tilt
    },

    // 02 / TAPERED PLANK CHAIR (Fixed 199.6×20cm Proportions + Batch Multiplier Slider)
    plankChair: {
      chairCount: 1        // 1 to 6 chairs -> Multiplies Stock Board Width (N × 200 mm) and 3D Chair Array
    },

    // 03 / VAULTED ARCH STOOL (9 Parts: 1 Disc + 4 Sloped Arched Legs + 4 Corner Shelf Gussets)
    stool: {
      stoolHeight: 610,      // 360 to 610 mm (50mm steps; default 610mm -> L = 1220mm, W = 610mm = Half 122×122 Module!)
      baseSpan: 610,         // 490 to 730 mm (30mm steps; default 610mm = 1/2 of 1220mm standard width)
      topDiameter: 390,      // 300 to 450 mm (30mm steps) -> Controls seat & arch diameter
      shelfHeightRatio: 50,  // 35% to 65% (5% steps)      -> Height of the 4 triangular corner shelves
      cornerRadius: 16       // 0 to 32 mm (4mm steps)     -> Rounded fillets on corner gussets
    },

    // 04 / NESTED L-LEG TABLE (7 Parts: Exact Blueprint media_1792592529894 + Standardized 122x244 Board)
    concentricTable: {
      tableLength: 2440,     // 1440 to 2440 mm (100mm steps, default 2440mm = 244cm Standard Sheet!)
      boardWidth: 1220,      // 920 to 1220 mm (60mm steps, default 1220mm = 122cm Standard Sheet!)
      tableHeight: 740,      // 680 to 780 mm (20mm steps)   -> Length of each outer L-leg (sets Table Height!)
      legStripWidth: 90,     // 70 to 110 mm (10mm steps)    -> Width of outer L-leg & inner apron strips
      taperInset: 75,        // 30 to 105 mm (15mm steps)    -> Boat taper of tabletop & arch aprons
      cornerRadius: 28       // 0 to 48 mm (4mm steps)       -> CNC rounded corner radius on tabletop & aprons
    },

    // 05 / X-CORNER BOOMERANG TABLE (3 Parts: Clean Rounded Corners + Standardized 122cm Width)
    crossLegTable: {
      boardLength: 1830,     // 1220 to 2440 mm (610mm/60mm steps) -> Board Length L
      boardWidth: 1220,      // 920 to 1220 mm (60mm steps, default 1220mm = 122cm Standard Sheet!)
      legWaist: 120,         // 90 to 150 mm (15mm steps)          -> Corner waist width of the 2 slim V-legs
      cornerRadius: 24       // 0 to 45 mm (5mm steps)             -> Rounded corners on tabletop & leg notches
    },

    // 06 / CHEVRON FIN BOOKSHELF (Solid Verticals + Segmented Horizontal Shelves on 122x244 Board!)
    shelf: {
      shelfCount: 5,         // 4, 5, or 6 horizontal shelf tiers
      tierSpacing: 300,      // 240, 300, 360 mm (Multiples of 30/60 mm between shelves!)
      uprightPairs: 2,       // 2 pairs (4 solid fins, 3 bays) or 3 pairs (6 solid fins, 5 bays)
      shelfWidth: 1100,      // 740 to 1340 mm (60mm steps; default 1100 + 1340 height = 2440mm Standard Sheet!)
      shelfDepth: 305,       // 245 to 365 mm (30mm steps; default 4 * 305 = 1220mm Standard Sheet!)
      zigZagAmp: 45,         // 25 to 65 mm (5mm steps) -> Chevron peak/valley amplitude
      cornerRadius: 18       // 0 to 36 mm (6mm steps)  -> Rounded fillet on chevron peaks & valleys
    },

    // 07 / CREDENZA SIDEBOARD CABINET (Robust Outer Frame + 25mm Inset Doors + Recessed Shelves + Rear Brace on 1 or 2 Standard 122x244 Sheets!)
    cabinet: {
      boardCount: 1,         // 1 or 2 Standard 122×244 cm (2440×1220 mm) Boards!
      cabinetDepth: 330,     // 310 to 350 mm (10mm steps) -> Controls frame depth & proportions on 122×244 sheet
      shelfRecess: 80,       // 60 to 100 mm (10mm steps)  -> Interior shelf recess; cutoff strip becomes Rear Reinforcement!
      doorOpenAngle: 25      // 0° (Closed, 25mm inset inside frame) to 85° (Open)
    },

    // 08 / ZERO-WASTE WAVE WALL (Standardized 122x244 cm Sheet: 2440 x 1220 mm!)
    curvedWall: {
      wallHeight: 2440,      // 1540 to 2440 mm (60mm steps, default 2440mm = 244cm Standard Sheet!)
      pairCount: 5,          // 4 to 8 wave pairs (default 5 pairs × 244mm = 1220mm Standard Sheet!)
      pairWidth: 244,        // 184 to 304 mm (30mm steps, default 244mm)
      waveAmp: 55,           // 20 to 85 mm (5mm steps)      -> Depth relief of the wave cut
      waveFreq: 1.5,         // 1.0 to 3.0 waves along height
      harmonicMix: 35,       // 0% to 70% secondary harmonic sculptor
      phaseShift: 35,        // 0° to 90° phase progression per slat pair
      slatSpacing: 120,      // 60 to 165 mm (15mm steps)    -> Horizontal spacing along the wall
      arrangementMode: 1     // 1 = Concatenated Flow, 2 = Interleaved A/B Pairs, 3 = Mirrored Ripple
    }
  }
};

const defaultParamsBackup = JSON.parse(JSON.stringify(state.params));

const TYPOLOGY_CONFIG = {
  chair: {
    title: 'MODULAR SOFA & CHAIR (122×244 STD)',
    sectionTitle: '01 / Chair & Sofa Parameters (122×244 Module)',
    primaryMetricLabel: 'FIXED SEAT HEIGHT',
    hint: 'Standardized on 122 cm (1220 mm) board width (at 1830 mm Sofa Width, uses 1 exact 2440×1220 mm sheet!). Unified Backrest (#02) has a real through-mortise hole where the Seat Tenon Tooth (#01) locks through.',
    sliders: [
      { key: 'seatWidth', label: 'Seat Width (610=Armchair · 1220=2-Seat · 1830=244cm Sheet)', min: 610, max: 1830, step: 61, unit: ' mm' },
      { key: 'toothWidth', label: 'Tenon Tooth & Mortise Hole Width', min: 120, max: 360, step: 60, unit: ' mm' },
      { key: 'cornerRadius', label: 'Rounded Corner Fillet Radius', min: 0, max: 48, step: 6, unit: ' mm' },
      { key: 'reclineDeg', label: 'Backrest Recline Angle', min: 0, max: 12, step: 2, unit: '°' }
    ]
  },
  plankChair: {
    title: 'TAPERED PLANK CHAIR (BATCH MULTIPLIER)',
    sectionTitle: '01 / Chair Batch Production (Multiplies Board)',
    primaryMetricLabel: 'CHAIRS IN BATCH',
    hint: 'Fixed 199.6 × 20 cm single-plank geometry (11 parts per chair). Moving the slider multiplies the number of chairs to manufacture (1 to 6 chairs; 6 chairs fit inside a 122 cm standard sheet width).',
    sliders: [
      { key: 'chairCount', label: 'Chairs to Manufacture (Batch Multiplier)', min: 1, max: 6, step: 1, unit: ' chairs' }
    ]
  },
  stool: {
    title: 'VAULTED ARCH STOOL (122×244 MODULE)',
    sectionTitle: '01 / Stool Parameters (122×244 Module)',
    primaryMetricLabel: 'SEAT HEIGHT',
    hint: '9 interlocking parts, 100% board utilization (610×1220 mm = exact 1/2 of a 122×244 cm sheet): Central circular seat (#01) + 4 sloped vaulted legs (#02–#05) + 4 rounded triangular corner shelves (#06–#09).',
    sliders: [
      { key: 'stoolHeight', label: 'Stool Height (610mm = 1220mm Half-Sheet Length)', min: 360, max: 610, step: 50, unit: ' mm' },
      { key: 'baseSpan', label: 'Base Footprint Width (610mm = Half 122cm Width)', min: 490, max: 730, step: 30, unit: ' mm' },
      { key: 'topDiameter', label: 'Seat & Vault Diameter (30mm steps)', min: 300, max: 450, step: 30, unit: ' mm' },
      { key: 'shelfHeightRatio', label: 'Corner Gusset Shelf Height', min: 35, max: 65, step: 5, unit: '%' },
      { key: 'cornerRadius', label: 'Gusset Corner Rounding Radius', min: 0, max: 32, step: 4, unit: ' mm' }
    ]
  },
  concentricTable: {
    title: 'NESTED L-LEG TABLE (122×244 SHEET)',
    sectionTitle: '01 / Nested Table Parameters (122×244 Std)',
    primaryMetricLabel: 'TABLE HEIGHT',
    hint: 'Standardized on a 122 × 244 cm (2440 × 1220 mm) stock sheet: Central boat tabletop (#01) with rounded corners, nested inside 2 full-length arched apron frames (#02–#03) and 4 outer corner tapered L-legs (#04–#07).',
    sliders: [
      { key: 'tableLength', label: 'Board / Table Length (2440mm = 244cm Std Sheet)', min: 1440, max: 2440, step: 100, unit: ' mm' },
      { key: 'boardWidth', label: 'Board Width (1220mm = 122cm Std Sheet)', min: 920, max: 1220, step: 60, unit: ' mm' },
      { key: 'tableHeight', label: 'Table & L-Leg Height (20mm steps)', min: 680, max: 780, step: 20, unit: ' mm' },
      { key: 'legStripWidth', label: 'L-Leg & Apron Strip Width (10mm steps)', min: 70, max: 110, step: 10, unit: ' mm' },
      { key: 'taperInset', label: 'Boat Tabletop & Arch Taper', min: 30, max: 105, step: 15, unit: ' mm' },
      { key: 'cornerRadius', label: 'Rounded Corner Fillet Radius', min: 0, max: 48, step: 4, unit: ' mm' }
    ]
  },
  crossLegTable: {
    title: 'X-CORNER BOOMERANG TABLE (122×244 STD)',
    sectionTitle: '01 / X-Corner Table Parameters (122×244 Std)',
    primaryMetricLabel: 'TABLE HEIGHT',
    hint: '3 parts from 1 rectangular board (Standardized 122 cm width): 2 slim boomerang V-legs are cut from the top-left and bottom-right corners and interlock in a 90° X-cross through the center of the rounded tabletop.',
    sliders: [
      { key: 'boardLength', label: 'Stock Board Length (1830..2440 mm)', min: 1220, max: 2440, step: 61, unit: ' mm' },
      { key: 'boardWidth', label: 'Stock Board Width (1220mm = 122cm Std Sheet)', min: 920, max: 1220, step: 60, unit: ' mm' },
      { key: 'legWaist', label: 'Corner V-Leg Waist Width (15mm steps)', min: 90, max: 150, step: 15, unit: ' mm' },
      { key: 'cornerRadius', label: 'Tabletop & Leg Corner Rounding', min: 0, max: 45, step: 5, unit: ' mm' }
    ]
  },
  shelf: {
    title: 'CHEVRON BOOKSHELF (SEGMENTED BAYS · 122×244)',
    sectionTitle: '01 / Segmented Chevron Shelf (122×244 Sheet)',
    primaryMetricLabel: 'TIER SPACING',
    hint: 'Simple Straight Cuts + Zero Holes in Verticals: The 4 (or 6) vertical chevron fins are 100% solid (no slots/holes), and each horizontal shelf strip is cut into rectangular bay segments ("trozos") that sit cleanly between the vertical fins on a 122×244 cm standard sheet.',
    sliders: [
      { key: 'shelfCount', label: 'Horizontal Shelf Tiers', min: 4, max: 6, step: 1, unit: ' shelves' },
      { key: 'tierSpacing', label: 'Height Between Shelves (30/60mm multiple)', min: 240, max: 360, step: 60, unit: ' mm' },
      { key: 'uprightPairs', label: 'Chevron Upright Pairs (2=4 Fins/3 Bays, 3=6 Fins/5 Bays)', min: 2, max: 3, step: 1, unit: ' pairs' },
      { key: 'shelfWidth', label: 'Total Horizontal Bay Width (1100mm = 244cm Sheet)', min: 740, max: 1340, step: 60, unit: ' mm' },
      { key: 'shelfDepth', label: 'Fin Depth (305mm × 4 = 1220mm Std Sheet Width)', min: 245, max: 365, step: 30, unit: ' mm' },
      { key: 'zigZagAmp', label: 'Chevron Zig-Zag Amplitude', min: 25, max: 65, step: 5, unit: ' mm' },
      { key: 'cornerRadius', label: 'Chevron Peak Rounding Radius', min: 0, max: 36, step: 6, unit: ' mm' }
    ]
  },
  cabinet: {
    title: 'INSET-FRAME CREDENZA CABINET (122×244 STD)',
    sectionTitle: '01 / 25mm Inset-Frame Cabinet (1 or 2 Boards 122×244)',
    primaryMetricLabel: 'CABINET HEIGHT',
    hint: 'Robust Outer Frame (#01–#04) with 2 Front Doors (#05–#06) recessed 25 mm inside the frame. The 4 Interior Shelves (#07–#10) are recessed behind the doors, and their leftover recess cutoff strips (#11–#12) are mounted on the back as structural anti-racking reinforcement — all cut with 0% waste from 1 or 2 standard 122×244 cm boards!',
    sliders: [
      { key: 'boardCount', label: 'Standard 122×244 cm Boards (1 = 1220mm W · 2 = 1600mm W)', min: 1, max: 2, step: 1, unit: ' board(s)' },
      { key: 'cabinetDepth', label: 'Outer Frame Depth (Controls 122×244 Proportions)', min: 310, max: 350, step: 10, unit: ' mm' },
      { key: 'shelfRecess', label: 'Interior Shelf Recess (= Rear Reinforcement Height)', min: 60, max: 100, step: 10, unit: ' mm' },
      { key: 'doorOpenAngle', label: '25mm-Inset Doors Open Angle (Inspect Interior)', min: 0, max: 85, step: 5, unit: '°' }
    ]
  },
  curvedWall: {
    title: 'ZERO-WASTE WAVE WALL (122×244 SHEET)',
    sectionTitle: '01 / Parametric Wave Wall (122×244 Std)',
    primaryMetricLabel: 'WALL SLAT COUNT',
    hint: 'Standardized on a 122 × 244 cm (2440 × 1220 mm) stock sheet: Each strip on the board is split by a single wave cut into 2 complementary slats (A & B). Customize wave frequency, secondary harmonic sculpting, phase progression, spacing, and wall arrangement mode.',
    sliders: [
      { key: 'wallHeight', label: 'Wall Slat Height (2440mm = 244cm Std Sheet)', min: 1540, max: 2440, step: 60, unit: ' mm' },
      { key: 'pairCount', label: 'Wave Cut Pairs (5 × 244mm = 1220mm Std Sheet)', min: 4, max: 8, step: 1, unit: ' pairs' },
      { key: 'pairWidth', label: 'Strip Pair Width (244mm Std Module)', min: 184, max: 304, step: 30, unit: ' mm' },
      { key: 'waveAmp', label: 'Primary Wave Relief Amplitude', min: 20, max: 85, step: 5, unit: ' mm' },
      { key: 'waveFreq', label: 'Vertical Wave Frequency', min: 1.0, max: 3.0, step: 0.5, unit: 'x' },
      { key: 'harmonicMix', label: 'Secondary Harmonic Sculpting', min: 0, max: 70, step: 10, unit: '%' },
      { key: 'phaseShift', label: 'Phase Shift Across Slats', min: 0, max: 90, step: 15, unit: '°' },
      { key: 'slatSpacing', label: 'Wall Concatenation Pitch (Spacing)', min: 60, max: 165, step: 15, unit: ' mm' },
      { key: 'arrangementMode', label: 'Wall Pattern (1=Flow, 2=Alternating, 3=Mirror)', min: 1, max: 3, step: 1, unit: '' }
    ]
  }
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function snapToStep(v, step, min, max) {
  return clamp(Math.round(v / step) * step, min, max);
}

function polygonSignedArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function polygonArea(pts) {
  return Math.abs(polygonSignedArea(pts));
}

function pieceNetArea(piece, useOffset = false) {
  const outer = useOffset && piece.offsetPoints2D ? piece.offsetPoints2D : piece.points2D;
  const holes = useOffset && piece.offsetHoles2D ? piece.offsetHoles2D : piece.holes2D;
  let a = polygonArea(outer);
  if (holes) {
    for (const h of holes) {
      a -= polygonArea(h);
    }
  }
  return Math.max(0, a);
}

// ============================================================================
// CNC & SAW KERF RELATIVE OFFSET ENGINE + SHARED CUT LINE LAYER EXTRACTOR
// - Classifies every board segment into:
//   * 01_CUT_INTERIOR_SHARED (Deduplicated single-pass shared interior cut lines)
//   * 02_CUT_INTERIOR_HOLES  (Internal mortise / slot cutouts)
//   * 03_CUT_EXTERIOR_PERIMETER (Outer stock sheet perimeter cut lines)
//   * 04_PART_OFFSET_CONTOURS (Each board piece offset inward by its relative kerf!)
// ============================================================================
function isExteriorBoardSegment(p1, p2, L, W) {
  const hx = L / 2;
  const hy = W / 2;
  const eps = 0.6;
  const onLeft = Math.abs(p1[0] + hx) < eps && Math.abs(p2[0] + hx) < eps;
  const onRight = Math.abs(p1[0] - hx) < eps && Math.abs(p2[0] - hx) < eps;
  const onBot = Math.abs(p1[1] + hy) < eps && Math.abs(p2[1] + hy) < eps;
  const onTop = Math.abs(p1[1] - hy) < eps && Math.abs(p2[1] - hy) < eps;
  const onTwoSheetSeam =
    L === 2440 && W === 2440 && Math.abs(p1[1]) < eps && Math.abs(p2[1]) < eps;
  return onLeft || onRight || onBot || onTop || onTwoSheetSeam;
}

function cleanDuplicatePts(pts) {
  const cleaned = [];
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const prev = cleaned.length > 0 ? cleaned[cleaned.length - 1] : pts[pts.length - 1];
    if (Math.hypot(curr[0] - prev[0], curr[1] - prev[1]) > 0.08) {
      cleaned.push(curr);
    }
  }
  return cleaned.length >= 3 ? cleaned : pts;
}

function computeRelativeOffsetPolygon(rawPts, L, W, kerfWidth, kerfMode, isHole = false) {
  if (kerfWidth <= 0.02) return rawPts.map(([x, y]) => [x, y]);
  const pts = cleanDuplicatePts(rawPts);
  const n = pts.length;
  if (n < 3) return pts;

  const sArea = polygonSignedArea(pts);
  // For outer contours, move INWARD. For interior holes, the cut removes material around the hole
  // if cutting on the shared line, expanding the hole outward by +K/2:
  const orient = (sArea >= 0 ? 1 : -1) * (isHole ? -1 : 1);

  const edgeNormals = [];
  const edgeTangents = [];
  const edgeOffsets = [];

  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = orient * -uy;
    const ny = orient * ux;

    edgeTangents.push([ux, uy]);
    edgeNormals.push([nx, ny]);

    let d = kerfWidth / 2;
    if (!isHole) {
      const isExt = isExteriorBoardSegment(p1, p2, L, W);
      if (isExt) {
        d = kerfMode === 'shared' ? 0 : kerfWidth / 2;
      } else {
        d = kerfMode === 'full_kerf' ? kerfWidth : kerfWidth / 2;
      }
    }
    edgeOffsets.push(d);
  }

  const out = [];
  for (let i = 0; i < n; i++) {
    const prevIdx = (i - 1 + n) % n;
    const p = pts[i];
    const [ux1, uy1] = edgeTangents[prevIdx];
    const [nx1, ny1] = edgeNormals[prevIdx];
    const d1 = edgeOffsets[prevIdx];

    const [ux2, uy2] = edgeTangents[i];
    const [nx2, ny2] = edgeNormals[i];
    const d2 = edgeOffsets[i];

    const det = ux1 * uy2 - uy1 * ux2;
    const rx = d2 * nx2 - d1 * nx1;
    const ry = d2 * ny2 - d1 * ny1;

    if (Math.abs(det) > 1e-3) {
      let t = (rx * uy2 - ry * ux2) / det;
      const maxMiter = 2.4 * Math.max(d1, d2, 0.1);
      t = clamp(t, -maxMiter, maxMiter);
      out.push([p[0] + d1 * nx1 + t * ux1, p[1] + d1 * ny1 + t * uy1]);
    } else {
      out.push([p[0] + 0.5 * (d1 * nx1 + d2 * nx2), p[1] + 0.5 * (d1 * ny1 + d2 * ny2)]);
    }
  }
  return out;
}

function canonicalPtKey(pt) {
  return `${Math.round(pt[0] * 5) / 5},${Math.round(pt[1] * 5) / 5}`;
}

function canonicalSegKey(p1, p2) {
  const k1 = canonicalPtKey(p1);
  const k2 = canonicalPtKey(p2);
  return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
}

function chainSegmentsToPolylines(segments) {
  if (segments.length === 0) return [];
  const used = new Array(segments.length).fill(false);
  const byStart = new Map();
  const byEnd = new Map();

  const addIndex = (map, k, idx) => {
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(idx);
  };

  segments.forEach((seg, idx) => {
    addIndex(byStart, canonicalPtKey(seg[0]), idx);
    addIndex(byEnd, canonicalPtKey(seg[1]), idx);
  });

  const polylines = [];
  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const chain = [segments[i][0], segments[i][1]];

    // Extend forward
    let extended = true;
    while (extended) {
      extended = false;
      const tailKey = canonicalPtKey(chain[chain.length - 1]);
      const starts = byStart.get(tailKey) || [];
      for (const cand of starts) {
        if (!used[cand]) {
          used[cand] = true;
          chain.push(segments[cand][1]);
          extended = true;
          break;
        }
      }
      if (!extended) {
        const ends = byEnd.get(tailKey) || [];
        for (const cand of ends) {
          if (!used[cand]) {
            used[cand] = true;
            chain.push(segments[cand][0]);
            extended = true;
            break;
          }
        }
      }
    }

    // Extend backward
    extended = true;
    while (extended) {
      extended = false;
      const headKey = canonicalPtKey(chain[0]);
      const ends = byEnd.get(headKey) || [];
      for (const cand of ends) {
        if (!used[cand]) {
          used[cand] = true;
          chain.unshift(segments[cand][0]);
          extended = true;
          break;
        }
      }
      if (!extended) {
        const starts = byStart.get(headKey) || [];
        for (const cand of starts) {
          if (!used[cand]) {
            used[cand] = true;
            chain.unshift(segments[cand][1]);
            extended = true;
            break;
          }
        }
      }
    }

    polylines.push(chain);
  }
  return polylines;
}

function getActiveKerfOffsets() {
  if (state.fitCompMode === 'expand_nominal' || state.kerfWidth <= 0.02) {
    return { dInt: 0, dExt: 0, K: 0 };
  }
  const K = state.kerfWidth;
  const dInt = state.kerfMode === 'full_kerf' ? K : K / 2;
  const dExt = state.kerfMode === 'shared' ? 0 : K / 2;
  return { dInt, dExt, K };
}

function getPostKerfRect(x0, y0, x1, y1, hx, hy, dInt, dExt, hasTwoSheetSeam = false) {
  const eps = 0.6;
  const dLeft = Math.abs(x0 + hx) < eps ? dExt : dInt;
  const dRight = Math.abs(x1 - hx) < eps ? dExt : dInt;
  const dBot =
    Math.abs(y0 + hy) < eps || (hasTwoSheetSeam && Math.abs(y0) < eps) ? dExt : dInt;
  const dTop =
    Math.abs(y1 - hy) < eps || (hasTwoSheetSeam && Math.abs(y1) < eps) ? dExt : dInt;
  const nx0 = x0 + dLeft;
  const nx1 = x1 - dRight;
  const ny0 = y0 + dBot;
  const ny1 = y1 - dTop;
  return {
    x0: nx0,
    x1: nx1,
    y0: ny0,
    y1: ny1,
    cx: (nx0 + nx1) / 2,
    cy: (ny0 + ny1) / 2,
    w: Math.max(1, nx1 - nx0),
    h: Math.max(1, ny1 - ny0)
  };
}

function buildCncFabricationAnalysis(pieces, L, W, kerfWidth, kerfMode) {
  const exteriorSegMap = new Map();
  const interiorSharedSegMap = new Map();
  const interiorHoleLoops = [];

  let rawInteriorCutLen = 0;
  let sharedOccurrenceCount = 0;

  const isExpandNominal = state.fitCompMode === 'expand_nominal';
  const effectiveKerfForParts = isExpandNominal ? 0 : kerfWidth;

  pieces.forEach((piece) => {
    // 1. Compute relative inward offset contour for this board piece:
    piece.offsetPoints2D = computeRelativeOffsetPolygon(
      piece.points2D,
      L,
      W,
      effectiveKerfForParts,
      kerfMode,
      false
    );
    if (piece.holes2D && piece.holes2D.length > 0) {
      // Pre-compensated mortise hole opening after cutting:
      piece.offsetHoles2D = piece.holes2D.map((h) =>
        computeRelativeOffsetPolygon(h, L, W, effectiveKerfForParts, 'all_half', false)
      );
      piece.holes2D.forEach((h) => {
        const preCompHole = computeRelativeOffsetPolygon(h, L, W, kerfWidth, 'all_half', false);
        interiorHoleLoops.push({ pieceId: piece.id, pts: preCompHole });
      });
    } else {
      piece.offsetHoles2D = null;
    }

    // Compute per-piece nominal vs post-kerf bounding box:
    const xs0 = piece.points2D.map((p) => p[0]);
    const ys0 = piece.points2D.map((p) => p[1]);
    const nomW = Math.max(1, Math.max(...xs0) - Math.min(...xs0));
    const nomH = Math.max(1, Math.max(...ys0) - Math.min(...ys0));

    const xs1 = piece.offsetPoints2D.map((p) => p[0]);
    const ys1 = piece.offsetPoints2D.map((p) => p[1]);
    const offW = Math.max(1, Math.max(...xs1) - Math.min(...xs1));
    const offH = Math.max(1, Math.max(...ys1) - Math.min(...ys1));

    piece.nominalBox = [nomW, nomH];
    piece.offsetBox = [offW, offH];
    piece.offsetDelta = [offW - nomW, offH - nomH];

    // Each typology generator computes exact post-kerf pivot2D and pos3D directly:
    piece.compensatedPivot2D = piece.assembled.pivot2D;
    piece.compensatedPos3D = piece.assembled.pos3D;

    // 2. Classify and deduplicate every boundary segment into Exterior vs. Shared Interior Cut Layer:
    const pts = cleanDuplicatePts(piece.points2D);
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      if (segLen < 0.2) continue;

      const sKey = canonicalSegKey(p1, p2);
      if (isExteriorBoardSegment(p1, p2, L, W)) {
        if (!exteriorSegMap.has(sKey)) {
          exteriorSegMap.set(sKey, [p1, p2]);
        }
      } else {
        rawInteriorCutLen += segLen;
        if (!interiorSharedSegMap.has(sKey)) {
          interiorSharedSegMap.set(sKey, { seg: [p1, p2], count: 1, len: segLen });
        } else {
          const entry = interiorSharedSegMap.get(sKey);
          entry.count += 1;
          sharedOccurrenceCount += 1;
        }
      }
    }
  });

  const exteriorSegments = Array.from(exteriorSegMap.values());
  const interiorSharedSegments = Array.from(interiorSharedSegMap.values()).map((e) => e.seg);

  let deduplicatedInteriorLen = 0;
  interiorSharedSegMap.forEach((e) => {
    deduplicatedInteriorLen += e.len;
  });

  let holeCutLen = 0;
  interiorHoleLoops.forEach(({ pts }) => {
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      holeCutLen += Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    }
  });

  let exteriorCutLen = 0;
  exteriorSegments.forEach(([p1, p2]) => {
    exteriorCutLen += Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  });

  const exteriorPolylines = chainSegmentsToPolylines(exteriorSegments);
  const interiorSharedPolylines = chainSegmentsToPolylines(interiorSharedSegments);

  return {
    exteriorPolylines,
    interiorSharedPolylines,
    interiorHoleLoops,
    deduplicatedInteriorLen: deduplicatedInteriorLen + holeCutLen,
    rawInteriorCutLen: rawInteriorCutLen + holeCutLen,
    exteriorCutLen,
    sharedPassSavedLen: Math.max(0, rawInteriorCutLen - deduplicatedInteriorLen),
    sharedOccurrenceCount
  };
}

function rectPoly(x0, y0, x1, y1) {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1]
  ];
}

function roundPolygonCorners(pts, defaultR, steps = 6, radiusByIndex = null) {
  if (defaultR <= 0.5 && !radiusByIndex) return pts;
  const n = pts.length;
  const out = [];

  for (let i = 0; i < n; i++) {
    const rReq = radiusByIndex ? (radiusByIndex[i] ?? defaultR) : defaultR;
    const pPrev = pts[(i - 1 + n) % n];
    const pCurr = pts[i];
    const pNext = pts[(i + 1) % n];

    if (rReq <= 0.5) {
      out.push(pCurr);
      continue;
    }

    const v1x = pPrev[0] - pCurr[0];
    const v1y = pPrev[1] - pCurr[1];
    const v2x = pNext[0] - pCurr[0];
    const v2y = pNext[1] - pCurr[1];
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 2 || len2 < 2) {
      out.push(pCurr);
      continue;
    }

    const u1x = v1x / len1;
    const u1y = v1y / len1;
    const u2x = v2x / len2;
    const u2y = v2y / len2;

    const maxTangent = Math.min(len1, len2) * 0.42;
    const d = Math.min(rReq, maxTangent);

    const startX = pCurr[0] + u1x * d;
    const startY = pCurr[1] + u1y * d;
    const endX = pCurr[0] + u2x * d;
    const endY = pCurr[1] + u2y * d;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const omt = 1 - t;
      const bx = omt * omt * startX + 2 * omt * t * pCurr[0] + t * t * endX;
      const by = omt * omt * startY + 2 * omt * t * pCurr[1] + t * t * endY;
      out.push([bx, by]);
    }
  }
  return out;
}

function roundOpenPolyline(pts, r, steps = 6) {
  if (r <= 0.5 || pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const pPrev = pts[i - 1];
    const pCurr = pts[i];
    const pNext = pts[i + 1];

    const v1x = pPrev[0] - pCurr[0];
    const v1y = pPrev[1] - pCurr[1];
    const v2x = pNext[0] - pCurr[0];
    const v2y = pNext[1] - pCurr[1];
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    const d = Math.min(r, Math.min(len1, len2) * 0.44);

    if (d < 1) {
      out.push(pCurr);
      continue;
    }

    const startX = pCurr[0] + (v1x / len1) * d;
    const startY = pCurr[1] + (v1y / len1) * d;
    const endX = pCurr[0] + (v2x / len2) * d;
    const endY = pCurr[1] + (v2y / len2) * d;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const omt = 1 - t;
      out.push([
        omt * omt * startX + 2 * omt * t * pCurr[0] + t * t * endX,
        omt * omt * startY + 2 * omt * t * pCurr[1] + t * t * endY
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function quaternionFromBasis(uArr, vArr) {
  const u = new THREE.Vector3(...uArr).normalize();
  const v = new THREE.Vector3(...vArr).normalize();
  v.sub(u.clone().multiplyScalar(u.dot(v))).normalize();
  const w = new THREE.Vector3().crossVectors(u, v).normalize();
  const mat = new THREE.Matrix4().makeBasis(u, v, w);
  return new THREE.Quaternion().setFromRotationMatrix(mat);
}

// ============================================================================
// 01 / MODULAR SOFA & CHAIR (REAL 3D MORTISE HOLE IN BACKREST FOR SEAT TOOTH!)
// - #01 Seat Panel has a rear protruding Tenon Tooth ("diente")
// - #02 Combined Backrest & Rear Spine (480mm tall) has a real rectangular
//   Through-Mortise Hole ("hueco") at y = ySeatTop + 120 (Seat Height Y = 420mm!)
//   so in 3D the Seat Panel's Tenon Tooth slides 100% cleanly through the hole!
// - #06 Mortise Key Plug (extracted 100% from the mortise hole) locks under the tenon!
// ============================================================================
function generateChairGeometry() {
  const T = state.thickness;
  const p = state.params.chair;

  const seatW = p.seatWidth;      // 610 .. 1830 mm (61mm steps; 1830 + 610 = 2440mm Standard Sheet!)
  const toothW = clamp(p.toothWidth, 120, seatW - 180);
  const rFillet = p.cornerRadius; // 0 .. 48 mm
  const fixedDepth = 610;         // Standardized 610 mm depth (1/2 of 1220mm standard sheet!)
  const fixedArmH = 610;          // Standardized 610 mm side/armrest height (2 × 610 = 1220mm!)
  const fixedSeatH = 420;         // Standardized 420 mm ergonomic seat height

  const backTotalH = 490;         // Combined Backrest + Rear Spine (490 + 490 + 240 = 1220mm!)
  const seatD = 490;              // Ergonomic seat depth (490 mm)
  const frontApronH = 240;        // Front structural support apron under seat (240 mm)

  const L = seatW + fixedDepth;
  const W = 1220;                 // Standardized 122 cm (1220 mm) sheet width!
  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const hy = W / 2;
  const xSplit = -hx + seatW;

  const yFrontTop = -hy + frontApronH;   // -360
  const ySeatTop = yFrontTop + seatD;    // +120

  const xMidLeftCol = (-hx + xSplit) / 2;
  const tx0 = xMidLeftCol - toothW / 2;
  const tx1 = xMidLeftCol + toothW / 2;
  const toothDepth = T + 18;             // Protrudes through the Backrest (T) + 18mm locking tongue!

  // Shared Tenon Tooth cut along y = ySeatTop:
  const sharedToothLine = roundOpenPolyline(
    [
      [-hx, ySeatTop],
      [tx0, ySeatTop],
      [tx0, ySeatTop + toothDepth],
      [tx1, ySeatTop + toothDepth],
      [tx1, ySeatTop],
      [xSplit, ySeatTop]
    ],
    Math.min(rFillet * 0.25, 8),
    4
  );
  const sharedToothLineRev = [...sharedToothLine].reverse();

  // #01 Seat Panel with Rear Locking Tenon Tooth
  const seatPts = [
    [-hx, yFrontTop],
    [xSplit, yFrontTop],
    ...sharedToothLineRev
  ];

  // #02 Combined Backrest + Rear Support Spine with REAL Rectangular Through-Mortise Hole ("Hueco")
  // at y = ySeatTop + 120 (which corresponds to Y = fixedSeatH - T/2 in 3D!):
  const mortiseYCenter = ySeatTop + 120;
  const mortiseHoleH = T + 4;
  const mortiseHoleRect = rectPoly(
    tx0 - 2,
    mortiseYCenter - mortiseHoleH / 2,
    tx1 + 2,
    mortiseYCenter + mortiseHoleH / 2
  );

  const backTopLeft =
    rFillet > 0
      ? roundOpenPolyline([[-hx, ySeatTop + 80], [-hx, hy], [-hx + 80, hy]], rFillet, 5)
      : [[-hx, hy]];
  const backTopRight =
    rFillet > 0
      ? roundOpenPolyline([[xSplit - 80, hy], [xSplit, hy], [xSplit, ySeatTop + 80]], rFillet, 5)
      : [[xSplit, hy]];

  const backrestPts = [
    ...sharedToothLine,
    ...backTopRight.slice().reverse(),
    ...backTopLeft.slice().reverse()
  ];

  // #03 Front Support Apron
  const frontApronPts = rectPoly(-hx, -hy, xSplit, yFrontTop);

  // #04 & #05 Left & Right Side Armrest Panels
  const sideLeftPts = roundPolygonCorners(rectPoly(xSplit, 0, hx, hy), 0, 5, { 2: rFillet, 3: rFillet });
  const sideRightPts = roundPolygonCorners(rectPoly(xSplit, -hy, hx, 0), 0, 5, { 2: rFillet, 3: rFillet });

  const reclineRad = (p.reclineDeg * Math.PI) / 180;
  const sinR = Math.sin(reclineRad);
  const cosR = Math.cos(reclineRad);

  const backrestCenterZ = -210;
  const backrestFrontFaceZ = backrestCenterZ + T / 2;

  // Post-kerf mating compensation (accounts for exact material removed by CNC bit / Saw blade):
  const { dInt, dExt } = getActiveKerfOffsets();
  const seatWNet = seatW - dExt - dInt;
  const xMidLeftNet = (-hx + dExt + xSplit - dInt) / 2;
  const apronNet = getPostKerfRect(-hx, -hy, xSplit, yFrontTop, hx, hy, dInt, dExt);
  const sideLNet = getPostKerfRect(xSplit, 0, hx, hy, hx, hy, dInt, dExt);
  const sideRNet = getPostKerfRect(xSplit, -hy, hx, 0, hx, hy, dInt, dExt);
  const sideWallXNet = seatWNet / 2 + T / 2 + 0.5;

  const pieces = [
    {
      id: 'seat',
      name: 'Seat Panel (with Tenon Tooth)',
      role: `${seatW} × ${seatD} mm (+${toothDepth}mm Tooth)`,
      color: SWISS_PALETTE[0],
      points2D: seatPts,
      sharedWith: 'Its rear shoulders stop flush against the Backrest while its central Tenon Tooth passes straight through the Backrest Mortise Hole!',
      assembled: {
        // Post-kerf shoulder line is at y = ySeatTop - dInt; horizontal center is at xMidLeftNet!
        pivot2D: [xMidLeftNet, ySeatTop - dInt],
        pos3D: [0, fixedSeatH - T / 2, backrestFrontFaceZ + 0.5],
        uAxis: [1, 0, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'backrest_spine',
      name: 'Combined Backrest & Rear Spine (with Hole)',
      role: `${seatW} × ${backTotalH} mm (Mortised)`,
      color: SWISS_PALETTE[1],
      points2D: backrestPts,
      holes2D: [mortiseHoleRect],
      sharedWith: 'Features a precision rectangular Mortise Hole ("hueco") at Seat Height so the Seat Tenon Tooth locks right through it.',
      assembled: {
        pivot2D: [xMidLeftNet, mortiseYCenter],
        pos3D: [0, fixedSeatH - T / 2, backrestCenterZ],
        uAxis: [1, 0, 0],
        vAxis: [0, cosR, -sinR]
      }
    },
    {
      id: 'front_apron',
      name: 'Front Support Apron',
      role: `${seatW} × ${frontApronH} mm`,
      color: SWISS_PALETTE[2],
      points2D: frontApronPts,
      sharedWith: 'Shares top cut with Seat Panel and right cut with Right Side Panel.',
      assembled: {
        pivot2D: [apronNet.cx, apronNet.cy],
        pos3D: [0, fixedSeatH - T - apronNet.h / 2 - 0.5, backrestFrontFaceZ + seatD - 55],
        uAxis: [1, 0, 0],
        vAxis: [0, 1, 0]
      }
    },
    {
      id: 'side_left',
      name: 'Left Side & Armrest Panel',
      role: `${fixedDepth} × ${fixedArmH} mm`,
      color: SWISS_PALETTE[4],
      points2D: sideLeftPts,
      sharedWith: 'Upper-right 610×610 mm block with rounded armrest corners; stands flush against post-kerf left edge.',
      assembled: {
        pivot2D: [sideLNet.cx, sideLNet.cy],
        pos3D: [-sideWallXNet, sideLNet.h / 2, 0],
        uAxis: [0, 0, -1],
        vAxis: [0, 1, 0]
      }
    },
    {
      id: 'side_right',
      name: 'Right Side & Armrest Panel',
      role: `${fixedDepth} × ${fixedArmH} mm`,
      color: SWISS_PALETTE[5],
      points2D: sideRightPts,
      sharedWith: 'Lower-right 610×610 mm block with rounded armrest corners; stands flush against post-kerf right edge.',
      assembled: {
        pivot2D: [sideRNet.cx, sideRNet.cy],
        pos3D: [sideWallXNet, sideRNet.h / 2, 0],
        uAxis: [0, 0, -1],
        vAxis: [0, 1, 0]
      }
    },
    {
      id: 'mortise_key',
      name: 'Rear Mortise Locking Key (Cutout)',
      role: `${toothW + 4} × ${mortiseHoleH} mm`,
      color: SWISS_PALETTE[3],
      points2D: mortiseHoleRect,
      sharedWith: '100% extracted from the Backrest Mortise Hole; braces underneath the protruding Seat Tenon behind the backrest.',
      assembled: {
        pivot2D: [xMidLeftCol, mortiseYCenter],
        pos3D: [0, fixedSeatH - T - T / 2 - 0.5, backrestCenterZ - T - 2],
        uAxis: [1, 0, 0],
        vAxis: [0, 0, -1]
      }
    }
  ];

  const handles = [
    {
      id: 'h_chair_w',
      x: xSplit,
      y: 0,
      label: 'Drag to change Seat Width (60mm steps — resizes Stock Board)',
      onDrag: (nx) => {
        state.params.chair.seatWidth = snapToStep(nx - (-hx), 60, 540, 1680);
      }
    },
    {
      id: 'h_chair_tooth',
      x: tx1,
      y: mortiseYCenter,
      label: 'Drag to adjust Tenon Tooth & Mortise Hole Width (60mm steps)',
      onDrag: (nx) => {
        const halfT = Math.abs(nx - xMidLeftCol);
        state.params.chair.toothWidth = snapToStep(halfT * 2, 60, 120, 360);
      }
    }
  ];

  const overallW = seatW + T * 2;
  const overallH = Math.round(fixedSeatH + 360 * cosR);

  return {
    pieces,
    handles,
    summaryDims: {
      width: overallW,
      depth: fixedDepth,
      height: overallH,
      primaryHeight: fixedSeatH,
      ergonomicNote: seatW <= 720 ? 'MORTISE HOLE JOINT' : 'SOFA · MORTISE JOINT'
    }
  };
}

// ============================================================================
// 02 / TAPERED PLANK CHAIR (FIXED 199.6×20CM PROPORTIONS + BATCH MULTIPLIER)
// ============================================================================
function generatePlankChairGeometry() {
  const T = state.thickness;
  const nChairs = clamp(Math.round(state.params.plankChair.chairCount), 1, 6);

  const seatW = 420;        // 42 cm
  const legH = 420;         // 42 cm
  const backPostH = 316;    // 31.6 cm
  const plankW = 200;       // 20 cm

  const upperL = legH * 2 + backPostH; // 1156 mm
  const lowerL = seatW * 2;            // 840 mm
  const L = upperL + lowerL;           // 1996 mm
  const W = plankW * nChairs;          // N * 200 mm

  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const totalHy = W / 2;
  const halfPlank = plankW / 2;
  const quarterW = halfPlank / 2;
  const tipW = 20;

  const x0 = -hx;
  const x1 = x0 + legH;
  const x2 = x1 + backPostH;
  const x3 = x2 + legH;
  const x4 = x3 + seatW;
  const x5 = hx;

  const xA1 = x0 + seatW;
  const crossRailL = 346;
  const xA2 = xA1 + crossRailL;
  const backRailL = x3 - xA2;

  const { dInt, dExt } = getActiveKerfOffsets();
  const seatWNet = seatW - 2 * dInt;
  const legHNet = legH - dExt - dInt;
  const plankWNet = plankW - 2 * dInt;
  const halfSeatD = plankWNet;
  const railH = quarterW - 2 * dInt;
  const apronCenterY = legHNet - T - railH / 2 - 0.5;
  const legOutX = seatWNet / 2 + T / 2 + 0.5;
  const chairPitchX = 540;

  const pieces = [];

  for (let cIdx = 0; cIdx < nChairs; cIdx++) {
    const yBase = -totalHy + cIdx * plankW;
    const yMid = yBase + halfPlank;
    const yTop = yBase + plankW;
    const yQ = yMid + quarterW;

    const rSeatF = getPostKerfRect(x4, yBase, x5, yTop, hx, totalHy, dInt, dExt);
    const rSeatR = getPostKerfRect(x3, yBase, x4, yTop, hx, totalHy, dInt, dExt);
    const rApronR = getPostKerfRect(x0, yMid, xA1, yQ, hx, totalHy, dInt, dExt);
    const rApronL = getPostKerfRect(x0, yQ, xA1, yTop, hx, totalHy, dInt, dExt);
    const rApronRear = getPostKerfRect(xA1, yMid, xA2, yQ, hx, totalHy, dInt, dExt);
    const rApronFront = getPostKerfRect(xA1, yQ, xA2, yTop, hx, totalHy, dInt, dExt);
    const rBackRail = getPostKerfRect(xA2, yMid, x3, yTop, hx, totalHy, dInt, dExt);
    const dBotEdge = cIdx === 0 ? dExt : dInt;

    const chairOffsetX = (cIdx - (nChairs - 1) / 2) * chairPitchX;
    const tag = nChairs > 1 ? ` [Chair #${cIdx + 1}]` : '';
    const idSfx = `_${cIdx + 1}`;

    pieces.push(
      {
        id: `seat_front${idSfx}`,
        name: `Front Seat Board (42×20)${tag}`,
        role: `${seatW} × ${plankW} mm`,
        color: '#D99B96',
        points2D: rectPoly(x4, yBase, x5, yTop),
        sharedWith: 'End section of the plank; pairs with Rear Seat Board to form the 42×40 cm two-plank seat.',
        assembled: {
          pivot2D: [rSeatF.cx, rSeatF.cy],
          pos3D: [chairOffsetX, legHNet - T / 2, rSeatF.h / 2 + 0.5],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: `seat_rear${idSfx}`,
        name: `Rear Seat Board (42×20)${tag}`,
        role: `${seatW} × ${plankW} mm`,
        color: '#9AB892',
        points2D: rectPoly(x3, yBase, x4, yTop),
        sharedWith: 'Shares left cut with Backrest Rail/Front Leg and right cut with Front Seat Board.',
        assembled: {
          pivot2D: [rSeatR.cx, rSeatR.cy],
          pos3D: [chairOffsetX, legHNet - T / 2, -rSeatR.h / 2 - 0.5],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: `leg_fr${idSfx}`,
        name: `Front-Right Tapered Leg${tag}`,
        role: `H ${legH} × 80→20 mm`,
        color: '#B8977E',
        points2D: [
          [x0, yBase],
          [x1, yBase],
          [x1, yBase + tipW],
          [x0, yMid - tipW]
        ],
        sharedWith: 'Shares its diagonal taper cut with the lower half of the Rear-Right Backrest Leg.',
        assembled: {
          pivot2D: [x0 + dExt, yBase + dBotEdge],
          pos3D: [chairOffsetX + legOutX, legHNet, halfSeatD],
          uAxis: [0, -1, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: `leg_rr${idSfx}`,
        name: `Rear-Right Leg & Backrest Post${tag}`,
        role: `H ${legH + backPostH} × W 80 mm`,
        color: '#D8A8AE',
        points2D: [
          [x0, yMid - tipW],
          [x1, yBase + tipW],
          [x2, yMid - tipW],
          [x2, yMid],
          [x0, yMid]
        ],
        sharedWith: 'Full-height 73.6 cm diamond-tapered rear leg & backrest post.',
        assembled: {
          pivot2D: [x0 + dExt, yMid - dInt],
          pos3D: [chairOffsetX + legOutX, 0, -halfSeatD],
          uAxis: [0, 1, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: `leg_rl${idSfx}`,
        name: `Rear-Left Leg & Backrest Post${tag}`,
        role: `H ${legH + backPostH} × W 80 mm`,
        color: '#8CB4AE',
        points2D: [
          [x1, yBase],
          [x3, yBase],
          [x3, yBase + tipW],
          [x2, yMid - tipW],
          [x1, yBase + tipW]
        ],
        sharedWith: 'Complementary twin to Rear-Right Leg; tapers from 8 cm waist at seat to 2 cm at floor & top.',
        assembled: {
          pivot2D: [x3 - dInt, yBase + dBotEdge],
          pos3D: [chairOffsetX - legOutX, 0, -halfSeatD],
          uAxis: [0, -1, 0],
          vAxis: [0, 0, 1]
        }
      },
      {
        id: `leg_fl${idSfx}`,
        name: `Front-Left Tapered Leg${tag}`,
        role: `H ${legH} × 80→20 mm`,
        color: '#DFC97B',
        points2D: [
          [x2, yMid - tipW],
          [x3, yBase + tipW],
          [x3, yMid],
          [x2, yMid]
        ],
        sharedWith: 'Shares its diagonal taper cut with the lower half of the Rear-Left Backrest Leg.',
        assembled: {
          pivot2D: [x3 - dInt, yMid - dInt],
          pos3D: [chairOffsetX - legOutX, legHNet, halfSeatD],
          uAxis: [0, 1, 0],
          vAxis: [0, 0, 1]
        }
      },
      {
        id: `apron_right${idSfx}`,
        name: `Right Under-Seat Apron Rail${tag}`,
        role: `${seatW} × ${quarterW} mm`,
        color: '#E2D084',
        points2D: rectPoly(x0, yMid, xA1, yQ),
        sharedWith: '42 × 5 cm strip; supports the right edge of both Seat Boards.',
        assembled: {
          pivot2D: [rApronR.cx, rApronR.cy],
          pos3D: [chairOffsetX + seatWNet / 2 - T / 2, apronCenterY, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: `apron_left${idSfx}`,
        name: `Left Under-Seat Apron Rail${tag}`,
        role: `${seatW} × ${quarterW} mm`,
        color: '#89A0AE',
        points2D: rectPoly(x0, yQ, xA1, yTop),
        sharedWith: '42 × 5 cm strip; supports the left edge of both Seat Boards.',
        assembled: {
          pivot2D: [rApronL.cx, rApronL.cy],
          pos3D: [chairOffsetX - seatWNet / 2 + T / 2, apronCenterY, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: `apron_rear${idSfx}`,
        name: `Rear Under-Seat Stretcher${tag}`,
        role: `${crossRailL} × ${quarterW} mm`,
        color: '#C7BFA8',
        points2D: rectPoly(xA1, yMid, xA2, yQ),
        sharedWith: '34.6 × 5 cm strip; spans horizontally between the Left and Right Side Aprons at the rear.',
        assembled: {
          pivot2D: [rApronRear.cx, rApronRear.cy],
          pos3D: [chairOffsetX, apronCenterY, -halfSeatD + T / 2 + 4],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: `apron_front${idSfx}`,
        name: `Front Under-Seat Apron Rail${tag}`,
        role: `${crossRailL} × ${quarterW} mm`,
        color: '#D8A8AE',
        points2D: rectPoly(xA1, yQ, xA2, yTop),
        sharedWith: '34.6 × 5 cm strip; spans horizontally between the Front Legs under the front seat edge.',
        assembled: {
          pivot2D: [rApronFront.cx, rApronFront.cy],
          pos3D: [chairOffsetX, apronCenterY, halfSeatD - T / 2 - 4],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: `backrest_rail${idSfx}`,
        name: `Upper Backrest Cross-Rail${tag}`,
        role: `${backRailL} × ${halfPlank} mm`,
        color: '#718EB4',
        points2D: rectPoly(xA2, yMid, x3, yTop),
        sharedWith: '39 × 10 cm block; spans horizontally between the upper Rear-Left & Rear-Right Backrest Posts.',
        assembled: {
          pivot2D: [rBackRail.cx, rBackRail.cy],
          pos3D: [chairOffsetX, legHNet + backPostH - rBackRail.h / 2 - 6, -halfSeatD + T / 2 + 4],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      }
    );
  }

  return {
    pieces,
    handles: [],
    summaryDims: {
      width: (seatW + T * 2) + (nChairs - 1) * chairPitchX,
      depth: plankW * 2,
      height: legH + backPostH,
      primaryHeight: nChairs,
      ergonomicNote: `${nChairs} CHAIR${nChairs > 1 ? 'S' : ''} · ${pieces.length} PARTS`
    }
  };
}

// ============================================================================
// 03 / VAULTED ARCH STOOL (9-PART VERSION + ROUNDED FILLETS)
// ============================================================================
function generateStoolGeometry() {
  const T = state.thickness;
  const p = state.params.stool;

  const hx = p.stoolHeight;
  const hy = p.baseSpan / 2;
  const rFillet = p.cornerRadius;
  state.sheetL = hx * 2;
  state.sheetW = hy * 2;

  const archR = clamp(p.topDiameter / 2, 130, hy - 55);
  const topWidth = clamp(p.topDiameter / 2, 120, hy - 45);
  const shelfY = clamp(Math.round(hx * (p.shelfHeightRatio / 100)), archR + 25, hx - 60);

  const sampleArc = (a0, a1, steps = 28) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (a1 - a0) * (i / steps);
      pts.push([archR * Math.cos(a), archR * Math.sin(a)]);
    }
    return pts;
  };

  const seatPts = sampleArc(0, Math.PI * 2, 72);
  seatPts.pop();

  const legQ1 = [...sampleArc(Math.PI / 2, 0, 24), [hx, 0], [hx, topWidth], [shelfY, hy], [0, hy]];
  const legQ2 = [...sampleArc(Math.PI, Math.PI / 2, 24), [0, hy], [-shelfY, hy], [-hx, topWidth], [-hx, 0]];
  const legQ3 = [...sampleArc((3 * Math.PI) / 2, Math.PI, 24), [-hx, 0], [-hx, -topWidth], [-shelfY, -hy], [0, -hy]];
  const legQ4 = [...sampleArc(0, -Math.PI / 2, 24), [0, -hy], [shelfY, -hy], [hx, -topWidth], [hx, 0]];

  const triQ1 = roundPolygonCorners([[shelfY, hy], [hx, hy], [hx, topWidth]], 0, 5, { 1: rFillet });
  const triQ2 = roundPolygonCorners([[-shelfY, hy], [-hx, topWidth], [-hx, hy]], 0, 5, { 2: rFillet });
  const triQ3 = roundPolygonCorners([[-shelfY, -hy], [-hx, -hy], [-hx, -topWidth]], 0, 5, { 1: rFillet });
  const triQ4 = roundPolygonCorners([[shelfY, -hy], [hx, -topWidth], [hx, -hy]], 0, 5, { 2: rFillet });

  const { dInt, dExt } = getActiveKerfOffsets();
  const hxNet = hx - dExt;
  const hyNet = hy - dExt;
  const spineClearance = Math.max(0.5, T / 2 + 0.5 - dInt);
  const triClearance = spineClearance + T / 2 + 0.5;

  const pieces = [
    {
      id: 'seat',
      name: 'Circular Seat Disc',
      role: `Ø ${archR * 2} mm × T ${T} mm`,
      color: SWISS_PALETTE[0],
      points2D: seatPts,
      sharedWith: 'Shares 100% of its circular perimeter cut with the 4 vaulted leg arches.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [0, hxNet + T / 2 + 0.5, 0],
        uAxis: [1, 0, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_q1',
      name: 'Vaulted Arch Leg Q1 (+X)',
      role: `${hx} × ${hy} mm`,
      color: SWISS_PALETTE[1],
      points2D: legQ1,
      sharedWith: 'Shares circular arch with Seat Disc and diagonal slope with Corner Shelf Q1.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [spineClearance, 0, 0],
        uAxis: [0, 1, 0],
        vAxis: [1, 0, 0]
      }
    },
    {
      id: 'leg_q2',
      name: 'Vaulted Arch Leg Q2 (-Z)',
      role: `${hx} × ${hy} mm`,
      color: SWISS_PALETTE[2],
      points2D: legQ2,
      sharedWith: 'Shares circular arch with Seat Disc and diagonal slope with Corner Shelf Q2.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [0, 0, -spineClearance],
        uAxis: [0, -1, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_q3',
      name: 'Vaulted Arch Leg Q3 (-X)',
      role: `${hx} × ${hy} mm`,
      color: SWISS_PALETTE[3],
      points2D: legQ3,
      sharedWith: 'Shares circular arch with Seat Disc and diagonal slope with Corner Shelf Q3.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [-spineClearance, 0, 0],
        uAxis: [0, -1, 0],
        vAxis: [1, 0, 0]
      }
    },
    {
      id: 'leg_q4',
      name: 'Vaulted Arch Leg Q4 (+Z)',
      role: `${hx} × ${hy} mm`,
      color: SWISS_PALETTE[4],
      points2D: legQ4,
      sharedWith: 'Shares circular arch with Seat Disc and diagonal slope with Corner Shelf Q4.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [0, 0, spineClearance],
        uAxis: [0, 1, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'tri_q1',
      name: 'Corner Shelf Gusset Q1',
      role: `${hx - shelfY} × ${hy - topWidth} mm`,
      color: SWISS_PALETTE[5],
      points2D: triQ1,
      sharedWith: 'Cut from Top-Right corner; locks horizontally into Q1 (+X, -Z) with rounded outer corner.',
      assembled: {
        pivot2D: [hxNet, hyNet],
        pos3D: [triClearance, shelfY, -triClearance],
        uAxis: [-1, 0, 0],
        vAxis: [0, 0, 1]
      }
    },
    {
      id: 'tri_q2',
      name: 'Corner Shelf Gusset Q2',
      role: `${hx - shelfY} × ${hy - topWidth} mm`,
      color: SWISS_PALETTE[6],
      points2D: triQ2,
      sharedWith: 'Cut from Top-Left corner; locks horizontally into Q2 (-X, -Z) with rounded outer corner.',
      assembled: {
        pivot2D: [-hxNet, hyNet],
        pos3D: [-triClearance, shelfY, -triClearance],
        uAxis: [-1, 0, 0],
        vAxis: [0, 0, 1]
      }
    },
    {
      id: 'tri_q3',
      name: 'Corner Shelf Gusset Q3',
      role: `${hx - shelfY} × ${hy - topWidth} mm`,
      color: SWISS_PALETTE[7],
      points2D: triQ3,
      sharedWith: 'Cut from Bottom-Left corner; locks horizontally into Q3 (-X, +Z) with rounded outer corner.',
      assembled: {
        pivot2D: [-hxNet, -hyNet],
        pos3D: [-triClearance, shelfY, triClearance],
        uAxis: [-1, 0, 0],
        vAxis: [0, 0, 1]
      }
    },
    {
      id: 'tri_q4',
      name: 'Corner Shelf Gusset Q4',
      role: `${hx - shelfY} × ${hy - topWidth} mm`,
      color: SWISS_PALETTE[8],
      points2D: triQ4,
      sharedWith: 'Cut from Bottom-Right corner; locks horizontally into Q4 (+X, +Z) with rounded outer corner.',
      assembled: {
        pivot2D: [hxNet, -hyNet],
        pos3D: [triClearance, shelfY, triClearance],
        uAxis: [-1, 0, 0],
        vAxis: [0, 0, 1]
      }
    }
  ];

  const handles = [
    {
      id: 'h_stool_r',
      x: archR,
      y: 0,
      label: 'Drag to change Seat & Arch Diameter (30mm steps)',
      onDrag: (nx) => {
        state.params.stool.topDiameter = snapToStep(Math.abs(nx) * 2, 30, 300, 450);
      }
    },
    {
      id: 'h_stool_shelf',
      x: shelfY,
      y: hy - 12,
      label: 'Drag to adjust Corner Shelf Height & Gusset Size',
      onDrag: (nx) => {
        const ratio = (Math.abs(nx) / hx) * 100;
        state.params.stool.shelfHeightRatio = snapToStep(ratio, 5, 35, 65);
      }
    }
  ];

  const totalSpan = Math.round((hy + spineClearance) * 2);
  const totalH = Math.round(hx + T);

  return {
    pieces,
    handles,
    summaryDims: {
      width: totalSpan,
      depth: totalSpan,
      height: totalH,
      primaryHeight: totalH,
      ergonomicNote: '9 PARTS · ZERO WASTE'
    }
  };
}

// ============================================================================
// 04 / NESTED L-LEG TABLE (7 CONCENTRIC PARTS — EXACT BLUEPRINT media_1792592529894)
// ============================================================================
function generateConcentricTableGeometry() {
  const T = state.thickness;
  const p = state.params.concentricTable;

  const L = p.tableLength;
  const W = p.boardWidth;
  const legH = p.tableHeight;
  const sW = p.legStripWidth;
  const taper = p.taperInset;
  const rFillet = p.cornerRadius;

  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const hy = W / 2;

  const midFlatX = clamp(hx - legH, 70, hx - 480);
  const actualLegH = hx - midFlatX;
  const endSplitY = clamp(Math.round(hy * 0.20), 65, 120);

  const ax1 = hx - sW;
  const ay1 = hy - sW;
  const ay0 = clamp(ay1 - taper, 120, ay1);

  const tx1 = ax1 - sW;
  const ty1 = ay1 - sW;
  const tx0 = midFlatX + 30;
  const ty0 = clamp(ty1 - taper, 90, ty1);

  const topInnerChain = roundOpenPolyline(
    [
      [-tx1, 0],
      [-tx1, ty0],
      [-tx0, ty1],
      [tx0, ty1],
      [tx1, ty0],
      [tx1, 0]
    ],
    rFillet,
    6
  );

  const botInnerChain = roundOpenPolyline(
    [
      [tx1, 0],
      [tx1, -ty0],
      [tx0, -ty1],
      [-tx0, -ty1],
      [-tx1, -ty0],
      [-tx1, 0]
    ],
    rFillet,
    6
  );

  const topOuterRight = roundOpenPolyline(
    [
      [midFlatX, ay1],
      [ax1, ay0],
      [ax1, endSplitY]
    ],
    rFillet,
    6
  );
  const topOuterLeft = roundOpenPolyline(
    [
      [-ax1, endSplitY],
      [-ax1, ay0],
      [-midFlatX, ay1]
    ],
    rFillet,
    6
  );

  const botOuterRight = roundOpenPolyline(
    [
      [ax1, -endSplitY],
      [ax1, -ay0],
      [midFlatX, -ay1]
    ],
    rFillet,
    6
  );
  const botOuterLeft = roundOpenPolyline(
    [
      [-midFlatX, -ay1],
      [-ax1, -ay0],
      [-ax1, -endSplitY]
    ],
    rFillet,
    6
  );

  const tabletopPts = [
    ...botInnerChain.slice(0, -1),
    ...topInnerChain.slice(0, -1)
  ];

  const apronBackPts = [
    ...topInnerChain,
    [ax1, 0],
    ...topOuterRight.slice().reverse(),
    [midFlatX, hy],
    [-midFlatX, hy],
    ...topOuterLeft.slice().reverse(),
    [-ax1, 0]
  ];

  const apronFrontPts = [
    ...botInnerChain,
    [-ax1, 0],
    ...botOuterLeft.slice().reverse(),
    [-midFlatX, -hy],
    [midFlatX, -hy],
    ...botOuterRight.slice().reverse(),
    [ax1, 0]
  ];

  const legTRPts = [
    ...topOuterRight,
    [hx, endSplitY],
    [hx, hy],
    [midFlatX, hy]
  ];

  const legTLPts = [
    [-midFlatX, hy],
    [-hx, hy],
    [-hx, endSplitY],
    ...topOuterLeft
  ];

  const legBLPts = [
    ...botOuterLeft,
    [-hx, -endSplitY],
    [-hx, -hy],
    [-midFlatX, -hy]
  ];

  const legBRPts = [
    [midFlatX, -hy],
    [hx, -hy],
    [hx, -endSplitY],
    ...botOuterRight
  ];

  const { dInt, dExt } = getActiveKerfOffsets();
  const hxNet = hx - dExt;
  const hyNet = hy - dExt;
  const actualLegHNet = actualLegH - dExt - dInt;
  const endX = tx1 - dInt - 20;
  const cornerZ = ty0 - dInt + 16;
  const apronZ = ty0 - dInt - 14;
  const splayRad = (5 * Math.PI) / 180;
  const sinSp = Math.sin(splayRad);
  const cosSp = Math.cos(splayRad);

  const pieces = [
    {
      id: 'tabletop',
      name: 'Rounded Boat Tabletop',
      role: `${tx1 * 2} × ${ty1 * 2} mm (R${rFillet})`,
      color: SWISS_PALETTE[0],
      points2D: tabletopPts,
      sharedWith: 'Central piece of the board; shares its entire rounded boat perimeter with the 2 Arch Aprons.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [0, actualLegHNet + T / 2 + 0.5, 0],
        uAxis: [1, 0, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'apron_back',
      name: 'Rear Arch-Bridge Apron Frame',
      role: `${ax1 * 2} × ${hy} mm`,
      color: SWISS_PALETTE[1],
      points2D: apronBackPts,
      sharedWith: 'Nested between Tabletop upper edge and Rear L-Legs; its central bridge touches the top board edge.',
      assembled: {
        pivot2D: [0, hyNet],
        pos3D: [0, actualLegHNet, -apronZ],
        uAxis: [1, 0, 0],
        vAxis: [0, 1, 0]
      }
    },
    {
      id: 'apron_front',
      name: 'Front Arch-Bridge Apron Frame',
      role: `${ax1 * 2} × ${hy} mm`,
      color: SWISS_PALETTE[2],
      points2D: apronFrontPts,
      sharedWith: 'Nested between Tabletop lower edge and Front L-Legs; its central bridge touches the bottom board edge.',
      assembled: {
        pivot2D: [0, -hyNet],
        pos3D: [0, actualLegHNet, apronZ],
        uAxis: [1, 0, 0],
        vAxis: [0, -1, 0]
      }
    },
    {
      id: 'leg_tr',
      name: 'Corner Tapered L-Leg 01 (Back-Right)',
      role: `H ${actualLegH} × W ${hy - endSplitY} mm`,
      color: SWISS_PALETTE[3],
      points2D: legTRPts,
      sharedWith: 'Top-Right corner L-leg; its bracket arm meets Leg 04 at Z=0 and its tapered leg splays to the floor.',
      assembled: {
        pivot2D: [hxNet, hyNet],
        pos3D: [endX, actualLegHNet, -cornerZ],
        uAxis: [-sinSp, cosSp, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_tl',
      name: 'Corner Tapered L-Leg 02 (Back-Left)',
      role: `H ${actualLegH} × W ${hy - endSplitY} mm`,
      color: SWISS_PALETTE[4],
      points2D: legTLPts,
      sharedWith: 'Top-Left corner L-leg; its bracket arm meets Leg 03 at Z=0 and its tapered leg splays to the floor.',
      assembled: {
        pivot2D: [-hxNet, hyNet],
        pos3D: [-endX, actualLegHNet, -cornerZ],
        uAxis: [-sinSp, -cosSp, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_bl',
      name: 'Corner Tapered L-Leg 03 (Front-Left)',
      role: `H ${actualLegH} × W ${hy - endSplitY} mm`,
      color: SWISS_PALETTE[5],
      points2D: legBLPts,
      sharedWith: 'Bottom-Left corner L-leg; its bracket arm meets Leg 02 at Z=0 and its tapered leg splays to the floor.',
      assembled: {
        pivot2D: [-hxNet, -hyNet],
        pos3D: [-endX, actualLegHNet, cornerZ],
        uAxis: [-sinSp, -cosSp, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_br',
      name: 'Corner Tapered L-Leg 04 (Front-Right)',
      role: `H ${actualLegH} × W ${hy - endSplitY} mm`,
      color: SWISS_PALETTE[6],
      points2D: legBRPts,
      sharedWith: 'Bottom-Right corner L-leg; its bracket arm meets Leg 01 at Z=0 and its tapered leg splays to the floor.',
      assembled: {
        pivot2D: [hxNet, -hyNet],
        pos3D: [endX, actualLegHNet, cornerZ],
        uAxis: [-sinSp, cosSp, 0],
        vAxis: [0, 0, -1]
      }
    }
  ];

  const handles = [
    {
      id: 'h_conc_strip',
      x: 0,
      y: ty1,
      label: 'Drag to adjust L-Leg & Apron Strip Width (10mm steps)',
      onDrag: (_, ny) => {
        const newStrip = Math.round((hy - Math.abs(ny)) / 2);
        state.params.concentricTable.legStripWidth = snapToStep(newStrip, 10, 70, 110);
      }
    },
    {
      id: 'h_conc_taper',
      x: tx1,
      y: ty0,
      label: 'Drag to adjust Boat Tabletop & Arch Taper (15mm steps)',
      onDrag: (_, ny) => {
        const rawTaper = ty1 - Math.abs(ny);
        state.params.concentricTable.taperInset = snapToStep(rawTaper, 15, 30, 105);
      }
    }
  ];

  return {
    pieces,
    handles,
    summaryDims: {
      width: tx1 * 2,
      depth: ty1 * 2,
      height: actualLegH + T,
      primaryHeight: actualLegH + T,
      ergonomicNote: `7 PARTS · R${rFillet}MM FILLETS`
    }
  };
}

// ============================================================================
// 05 / X-CORNER BOOMERANG TABLE (FIXED CLEAN TOP-RIGHT & BOTTOM-LEFT CORNERS)
// ============================================================================
function generateCrossLegTableGeometry() {
  const T = state.thickness;
  const p = state.params.crossLegTable;

  const L = p.boardLength;
  const W = p.boardWidth;
  const waist = p.legWaist;
  const rFillet = p.cornerRadius;

  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const hy = W / 2;

  const armSpanX = Math.round(L * 0.54);
  const armSpanY = Math.round(W * 0.74);
  const tipStep = 22;
  const cornerBevel = 36;

  // Shared inner cut path for Top-Left L-Leg (progressing from left edge up to top edge):
  const tlInnerCut = roundOpenPolyline(
    [
      [-hx, hy - armSpanY],
      [-hx + tipStep, hy - armSpanY + 12],
      [-hx + waist, hy - waist],
      [-hx + armSpanX - 12, hy - tipStep],
      [-hx + armSpanX, hy]
    ],
    rFillet,
    6
  );

  // Shared inner cut path for Bottom-Right L-Leg (progressing from right edge down to bottom edge):
  const brInnerCut = roundOpenPolyline(
    [
      [hx, -hy + armSpanY],
      [hx - tipStep, -hy + armSpanY - 12],
      [hx - waist, -hy + waist],
      [hx - armSpanX + 12, -hy + tipStep],
      [hx - armSpanX, -hy]
    ],
    rFillet,
    6
  );

  // Strictly Counterclockwise (CCW) rounded corners at Bottom-Left (-hx, -hy) and Top-Right (+hx, +hy):
  const blCornerCCW = roundOpenPolyline(
    [
      [-hx, -hy + 70],
      [-hx, -hy],
      [-hx + 70, -hy]
    ],
    rFillet,
    5
  );
  const trCornerCCW = roundOpenPolyline(
    [
      [hx, hy - 70],
      [hx, hy],
      [hx - 70, hy]
    ],
    rFillet,
    5
  );

  // #01 Wide Rectangular Tabletop (100% monotonic CCW perimeter — zero twisted corners!)
  const tabletopPts = [
    ...blCornerCCW,
    ...brInnerCut.slice().reverse(),
    ...trCornerCCW,
    ...tlInnerCut.slice().reverse()
  ];

  // #02 Top-Left Corner Boomerang V-Leg
  const leg1Pts = [
    ...tlInnerCut,
    [-hx + cornerBevel, hy],
    [-hx + cornerBevel * 0.45, hy - cornerBevel * 0.55],
    [-hx, hy - cornerBevel]
  ];

  // #03 Bottom-Right Corner Boomerang V-Leg
  const leg2Pts = [
    ...brInnerCut,
    [hx - cornerBevel, -hy],
    [hx - cornerBevel * 0.45, -hy + cornerBevel * 0.55],
    [hx, -hy + cornerBevel]
  ];

  const { dInt } = getActiveKerfOffsets();
  const D = Math.hypot(armSpanX, armSpanY);
  const D2 = D * D;
  const c = armSpanX / D;
  const s = armSpanY / D;
  const legApexH = Math.round((armSpanX * armSpanY) / D);
  const tableTopY = Math.round(legApexH - dInt - 36);

  const p1X = -hx + (armSpanX * armSpanY * armSpanY) / D2;
  const p1Y = hy - (armSpanX * armSpanX * armSpanY) / D2;

  const s45 = Math.SQRT1_2;
  const u1 = [c * s45, -s, c * s45];
  const v1 = [s * s45, c, s * s45];

  const u2 = [-c * s45, s, c * s45];
  const v2 = [-s * s45, -c, s * s45];

  const pieces = [
    {
      id: 'tabletop',
      name: 'Wide Rounded Tabletop (with X-Crown)',
      role: `${L} × ${W} mm (H ${tableTopY} mm)`,
      color: SWISS_PALETTE[0],
      points2D: tabletopPts,
      sharedWith: 'Clean rounded-corner tabletop; its two corner border cuts form the 2 interlocking Boomerang V-Legs.',
      assembled: {
        pivot2D: [0, 0],
        pos3D: [0, tableTopY, 0],
        uAxis: [1, 0, 0],
        vAxis: [0, 0, -1]
      }
    },
    {
      id: 'leg_x1',
      name: 'Corner Boomerang V-Leg 01 (+45°)',
      role: `Arms ${armSpanX}×${armSpanY} mm`,
      color: SWISS_PALETTE[1],
      points2D: leg1Pts,
      sharedWith: 'Slim L-strip from Top-Left corner; stands inverted as a V-leg with its apex rising through the center X-slot.',
      assembled: {
        pivot2D: [p1X, p1Y],
        pos3D: [0, 0, 0],
        uAxis: u1,
        vAxis: v1
      }
    },
    {
      id: 'leg_x2',
      name: 'Corner Boomerang V-Leg 02 (-45°)',
      role: `Arms ${armSpanX}×${armSpanY} mm`,
      color: SWISS_PALETTE[2],
      points2D: leg2Pts,
      sharedWith: 'Slim L-strip from Bottom-Right corner; interlocks at 90° with V-Leg 01 to form the 4-legged X-base.',
      assembled: {
        pivot2D: [-p1X, -p1Y],
        pos3D: [0, 0, 0],
        uAxis: u2,
        vAxis: v2
      }
    }
  ];

  const handles = [
    {
      id: 'h_x_waist',
      x: -hx + waist,
      y: hy - waist,
      label: 'Drag to adjust Corner V-Leg Waist Width (15mm steps)',
      onDrag: (nx) => {
        const rawW = nx - (-hx);
        state.params.crossLegTable.legWaist = snapToStep(rawW, 15, 90, 150);
      }
    }
  ];

  return {
    pieces,
    handles,
    summaryDims: {
      width: L,
      depth: W,
      height: tableTopY + T,
      primaryHeight: tableTopY + T,
      ergonomicNote: '3 PARTS · X-CROWN TABLE'
    }
  };
}

// ============================================================================
// 06 / ZIG-ZAG CHEVRON BOOKSHELF (SOLID FINS + SEGMENTED HORIZONTAL BAYS · 122×244)
// - Solid Vertical Chevron Fins (#01..#04 or #01..#06) with ZERO holes!
// - Horizontal shelf strips in the Right Column are cut by simple straight
//   crosscuts into `nBays = nFins - 1` rectangular bay segments ("trozos")!
// - In 3D, each horizontal bay segment sits cleanly between two adjacent
//   vertical chevron fins with 0.0 mm collision!
// - Standardized on a 2440 × 1220 mm (122 × 244 cm) Stock Sheet!
// ============================================================================
function generateShelfGeometry() {
  const T = state.thickness;
  const p = state.params.shelf;

  const nShelves = p.shelfCount;       // 4, 5, or 6 shelves
  const spacing = p.tierSpacing;       // 240, 300, 360 mm (multiple of 30/60mm!)
  const nPairs = p.uprightPairs;       // 2 pairs (4 fins, 3 bays) or 3 pairs (6 fins, 5 bays)
  const shelfW = p.shelfWidth;         // Total horizontal bay material width (default 1100mm -> L = 2440mm!)
  const shelfD = p.shelfDepth;         // Average fin depth (default 305mm -> W = 1220mm!)
  const zigAmp = clamp(p.zigZagAmp, 20, shelfD * 0.25);
  const rFillet = p.cornerRadius;

  const endMargin = 70;                // 4 * 300 + 2 * 70 = 1340mm; 1340 + 1100 = 2440mm Standard Sheet!
  const totalHeight = (nShelves - 1) * spacing + endMargin * 2;
  const nFins = nPairs * 2;
  const nBays = nFins - 1;             // 3 bays for 4 fins, 5 bays for 6 fins!

  const W = nFins * shelfD;            // Default: 4 * 305 = 1220 mm (122 cm Standard Sheet Width!)
  const L = totalHeight + shelfW;      // Default: 1340 + 1100 = 2440 mm (244 cm Standard Sheet Length!)
  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const hy = W / 2;
  const xSplit = -hx + totalHeight;

  const buildChevronCut = (yMid) => {
    const rawPts = [];
    rawPts.push([-hx, yMid - zigAmp * 0.55]);
    for (let i = 0; i < nShelves; i++) {
      const tierLocalX = endMargin + i * spacing;
      const x = -hx + tierLocalX;
      const sign = i % 2 === 0 ? 1 : -1;
      rawPts.push([x, yMid + sign * zigAmp]);
    }
    const lastSign = (nShelves - 1) % 2 === 0 ? -1 : 1;
    rawPts.push([xSplit, yMid + lastSign * zigAmp * 0.55]);
    return roundOpenPolyline(rawPts, rFillet, 6);
  };

  const pieces = [];
  const bayW = shelfW / nBays;
  const bayD = W / nShelves;

  // Post-kerf exact mating dimensions for Chevron Fins & Horizontal Bay Segments:
  const { dInt, dExt } = getActiveKerfOffsets();
  const totalHeightNet = totalHeight - dExt - dInt;
  const xFinMidNet = (-hx + dExt + xSplit - dInt) / 2;

  // Compute exact post-kerf widths of each horizontal bay column so vertical fins hug them at 0.5mm clearance:
  const bayColRects = [];
  for (let b = 0; b < nBays; b++) {
    const bx0 = xSplit + b * bayW;
    const bx1 = bx0 + bayW;
    bayColRects.push(getPostKerfRect(bx0, -hy, bx1, hy, hx, hy, dInt, dExt));
  }

  const finXPositions = [0];
  for (let b = 0; b < nBays; b++) {
    finXPositions.push(finXPositions[b] + bayColRects[b].w + T + 1.0);
  }
  const totalBookcaseSpanX = finXPositions[nFins - 1];
  for (let f = 0; f < nFins; f++) {
    finXPositions[f] -= totalBookcaseSpanX / 2;
  }

  // 1. Generate `nFins = 2 * nPairs` 100% SOLID Vertical Chevron Uprights (NO holes!)
  for (let pIdx = 0; pIdx < nPairs; pIdx++) {
    const pairY0 = -hy + pIdx * (2 * shelfD);
    const pairY1 = pairY0 + 2 * shelfD;
    const pairYMid = (pairY0 + pairY1) / 2;

    const chevronForward = buildChevronCut(pairYMid);
    const chevronBackward = [...chevronForward].reverse();

    const finIdxA = pIdx * 2;
    const finXA = finXPositions[finIdxA];
    const backEdgeAY = pairY0 + (pIdx === 0 ? dExt : dInt);

    pieces.push({
      id: `fin_${finIdxA + 1}`,
      name: `Solid Chevron Fin 0${finIdxA + 1} (Phase A)`,
      role: `H ${totalHeight} × D ${shelfD} mm`,
      color: SWISS_PALETTE[finIdxA % SWISS_PALETTE.length],
      points2D: [[-hx, pairY0], [xSplit, pairY0], ...chevronBackward],
      sharedWith: `100% solid vertical fin (no holes); shares its Zig-Zag Chevron cut with Fin 0${finIdxA + 2}.`,
      assembled: {
        pivot2D: [xFinMidNet, backEdgeAY],
        pos3D: [finXA, totalHeightNet / 2, -shelfD / 2],
        uAxis: [0, 1, 0],
        vAxis: [0, 0, 1]
      }
    });

    const finIdxB = pIdx * 2 + 1;
    const finXB = finXPositions[finIdxB];
    const backEdgeBY = pairY1 - (pIdx === nPairs - 1 ? dExt : dInt);

    pieces.push({
      id: `fin_${finIdxB + 1}`,
      name: `Solid Chevron Fin 0${finIdxB + 1} (Phase B)`,
      role: `H ${totalHeight} × D ${shelfD} mm`,
      color: SWISS_PALETTE[finIdxB % SWISS_PALETTE.length],
      points2D: [...chevronForward, [xSplit, pairY1], [-hx, pairY1]],
      sharedWith: `Complementary opposite-phase solid Chevron Fin; flanks Bay 0${finIdxB}.`,
      assembled: {
        pivot2D: [xFinMidNet, backEdgeBY],
        pos3D: [finXB, totalHeightNet / 2, -shelfD / 2],
        uAxis: [0, 1, 0],
        vAxis: [0, 0, -1]
      }
    });
  }

  // 2. Generate `nShelves × nBays` Segmented Horizontal Shelf Pieces ("Trozos") from Right Column [xSplit .. hx]
  for (let i = 0; i < nShelves; i++) {
    const sy0 = -hy + i * bayD;
    const sy1 = sy0 + bayD;
    const tierY = endMargin - dExt + i * spacing;

    for (let b = 0; b < nBays; b++) {
      const bx0 = xSplit + b * bayW;
      const bx1 = bx0 + bayW;
      const segRect = getPostKerfRect(bx0, sy0, bx1, sy1, hx, hy, dInt, dExt);

      const bayCenterX = (finXPositions[b] + finXPositions[b + 1]) / 2;
      const shelfCenterZ = -shelfD / 2 + segRect.h / 2 + 0.5;

      pieces.push({
        id: `shelf_${i + 1}_bay_${b + 1}`,
        name: `Shelf Tier 0${i + 1} · Bay Segment 0${b + 1}`,
        role: `${Math.round(bayW)} × ${Math.round(bayD)} mm (Y ${Math.round(tierY)} mm)`,
        color: SWISS_PALETTE[(i + b + 4) % SWISS_PALETTE.length],
        points2D: rectPoly(bx0, sy0, bx1, sy1),
        sharedWith: `Simple straight-cut horizontal segment ("trozo"); fits tightly between Fin 0${b + 1} and Fin 0${b + 2} with zero holes in the verticals!`,
        assembled: {
          pivot2D: [segRect.cx, segRect.cy],
          pos3D: [bayCenterX, tierY, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      });
    }
  }

  const handles = [
    {
      id: 'h_chev_amp',
      x: -hx + endMargin + spacing,
      y: -hy + shelfD - zigAmp,
      label: 'Drag to adjust Chevron Zig-Zag Depth (5mm steps)',
      onDrag: (_, ny) => {
        const rawAmp = Math.abs(ny - (-hy + shelfD));
        state.params.shelf.zigZagAmp = snapToStep(rawAmp, 5, 25, 65);
      }
    },
    {
      id: 'h_chev_w',
      x: xSplit,
      y: 0,
      label: 'Drag to change Total Horizontal Bay Width (60mm steps)',
      onDrag: (nx) => {
        const newW = hx - nx;
        state.params.shelf.shelfWidth = snapToStep(newW, 60, 740, 1340);
      }
    }
  ];

  return {
    pieces,
    handles,
    summaryDims: {
      width: Math.round(totalBookcaseSpanX + T),
      depth: Math.round(shelfD + zigAmp),
      height: totalHeight,
      primaryHeight: spacing,
      ergonomicNote: `${nFins} SOLID FINS · ${nShelves * nBays} BAY SEGMENTS`
    }
  };
}

// ============================================================================
// 07 / INSET-FRAME CREDENZA CABINET (REF. IMAGE media_1792594774309 · 1 OR 2 STD 122×244 BOARDS!)
// - Robust Outer Carcass Frame ("MARCO ROBUSTO"):
//   #01 Top Frame Panel, #02 Bottom Frame Base Panel, #03 Left Wall, #04 Right Wall
// - 2 Hinged Front Doors (#05, #06) RECESSED 25 MM ("ESCONDIDAS 25 MM") inside the front edge
//   of the Robust Outer Frame!
// - 4 Recessed Interior Shelves (#07 Upper Left, #08 Upper Right, #09 Lower Left Deck,
//   #10 Lower Right Deck) recessed behind the 25mm-inset doors (`depth = cabD - shelfRecess`)!
// - 2 Rear Structural Reinforcement Rails (#11 Upper Rear Brace, #12 Lower Rear Brace)
//   cut 100% from the leftover front-recess strips of the interior shelves ("lo que sobra del
//   remetido de las baldas interiores se pone en la parte trasera como refuerzo")!
// - Standardized on 1 or 2 sheets of 122 × 244 cm (2440 × 1220 mm)!
// ============================================================================
function generateCabinetGeometry() {
  const T = state.thickness;
  const p = state.params.cabinet;

  const nBoards = p.boardCount;                       // 1 or 2 standard 122×244 cm (2440×1220 mm) boards
  const doorInset = 25;                               // Fixed 25 mm frame reveal in front of the inset doors!
  const shelfRecess = clamp(p.shelfRecess, 60, 100);  // Interior shelf setback (= height of Rear Reinforcement Rails!)
  const doorRad = (p.doorOpenAngle * Math.PI) / 180;
  const cosD = Math.cos(doorRad);
  const sinD = Math.sin(doorRad);

  if (nBoards === 1) {
    // ========================================================================
    // 1 STANDARD SHEET: 2440 × 1220 MM (122 × 244 CM — 100.0% ZERO WASTE!)
    // Exact 122×244 Sheet Identity:
    // - 6 columns of width `cabD` + 1 column of width `doorH` = 2440 mm
    //   => doorH = 2440 - 6 * cabD
    // - Side Wall height `cabH` + Partition height `doorH` = 1220 mm
    //   => cabH = 1220 - doorH
    // ========================================================================
    const L = 2440;
    const W = 1220;
    state.sheetL = L;
    state.sheetW = W;

    const hx = L / 2;   // 1220
    const hy = W / 2;   // 610

    const cabW = 1220;  // Full 122 cm board width forms the clear interior cabinet span!
    const cabD = clamp(p.cabinetDepth, 310, 350);
    const doorH = L - 6 * cabD;                       // e.g. for cabD=330 -> doorH = 460 mm
    const cabH = W - doorH;                           // e.g. for cabD=330 -> cabH = 760 mm
    const plinthBayH = cabH - doorH;                  // e.g. 760 - 460 = 300 mm open lower bay!
    const shelfD = cabD - shelfRecess;                // Recessed depth of interior shelves & partition

    // 7 Vertical Columns along L = 2440 mm:
    const x0 = -hx;
    const x1 = x0 + cabD;   // Col 1: Top Frame Panel
    const x2 = x1 + cabD;   // Col 2: Bottom Frame Base Panel
    const x3 = x2 + cabD;   // Col 3: Upper Left & Right Recessed Shelves + Upper Rear Reinforcement Rail
    const x4 = x3 + cabD;   // Col 4: Lower Left & Right Recessed Shelves + Lower Rear Reinforcement Rail
    const x5 = x4 + cabD;   // Col 5: Left Full-Height Frame Wall + Central Partition + Rear Spine Cleat
    const x6 = x5 + cabD;   // Col 6: Right Full-Height Frame Wall + Rear Plinth Stiffener
    const x7 = hx;          // Col 7 (width = doorH): Left & Right 25mm-Inset Front Doors

    // Post-Kerf Exact Mating Dimensions for 1-Sheet 122×244 Credenza Cabinet:
    const { dInt, dExt } = getActiveKerfOffsets();
    const rTop = getPostKerfRect(x0, -hy, x1, hy, hx, hy, dInt, dExt);
    const rBot = getPostKerfRect(x1, -hy, x2, hy, hx, hy, dInt, dExt);
    const rSideL = getPostKerfRect(x4, -hy, x5, -hy + cabH, hx, hy, dInt, dExt);
    const rSideR = getPostKerfRect(x5, -hy, x6, -hy + cabH, hx, hy, dInt, dExt);
    const rDoorL = getPostKerfRect(x6, 0, x7, hy, hx, hy, dInt, dExt);
    const rDoorR = getPostKerfRect(x6, -hy, x7, 0, hx, hy, dInt, dExt);
    const rShelfUL = getPostKerfRect(x2, 0, x2 + shelfD, hy, hx, hy, dInt, dExt);
    const rShelfUR = getPostKerfRect(x2, -hy, x2 + shelfD, 0, hx, hy, dInt, dExt);
    const rShelfLL = getPostKerfRect(x3, 0, x3 + shelfD, hy, hx, hy, dInt, dExt);
    const rShelfLR = getPostKerfRect(x3, -hy, x3 + shelfD, 0, hx, hy, dInt, dExt);
    const rBraceU = getPostKerfRect(x2 + shelfD, -hy, x3, hy, hx, hy, dInt, dExt);
    const rBraceL = getPostKerfRect(x3 + shelfD, -hy, x4, hy, hx, hy, dInt, dExt);
    const rDiv = getPostKerfRect(x4, -hy + cabH, x4 + shelfD, hy, hx, hy, dInt, dExt);
    const rCleat = getPostKerfRect(x4 + shelfD, -hy + cabH, x5, hy, hx, hy, dInt, dExt);
    const rFin = getPostKerfRect(x5, -hy + cabH, x6, hy, hx, hy, dInt, dExt);

    const cabWNet = rTop.h;
    const cabDNet = rSideL.w;
    const cabHNet = rSideL.h;
    const doorHNet = rDoorL.w;

    const sideWallX = cabWNet / 2 + T / 2 + 0.5;
    const topPanelY = cabHNet - T / 2;
    const bottomPanelY = T / 2;
    const upperTopY = cabHNet - T;
    const deckY = upperTopY - doorHNet + T / 2;
    const upperMidY = upperTopY - doorHNet / 2;
    const doorCenterZ = cabDNet / 2 - doorInset - T / 2;
    const rearRailZ = -cabDNet / 2 + T / 2;
    const shelfBackZ = -cabDNet / 2 + T + 1;
    const shelfCenterZ = shelfBackZ + rShelfUL.w / 2;
    const bayCenterX = (T / 2 + cabWNet / 2) / 2;

    const pieces = [
      {
        id: 'top_panel',
        name: 'Outer Frame Top Panel',
        role: `${cabW} × ${cabD} mm (Robust Frame)`,
        color: SWISS_PALETTE[0],
        points2D: rectPoly(x0, -hy, x1, hy),
        sharedWith: 'Column 01 of the 122×244 cm sheet; forms the top horizontal member of the robust outer frame.',
        assembled: {
          pivot2D: [rTop.cx, rTop.cy],
          pos3D: [0, topPanelY, 0],
          uAxis: [0, 0, -1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'bottom_shelf',
        name: 'Outer Frame Bottom Base Panel',
        role: `${cabW} × ${cabD} mm (Robust Frame)`,
        color: SWISS_PALETTE[1],
        points2D: rectPoly(x1, -hy, x2, hy),
        sharedWith: 'Column 02 of the 122×244 cm sheet; forms the bottom plinth base of the robust outer frame.',
        assembled: {
          pivot2D: [rBot.cx, rBot.cy],
          pos3D: [0, bottomPanelY, 0],
          uAxis: [0, 0, -1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'side_left',
        name: 'Outer Frame Left Full-Height Wall',
        role: `D ${cabD} × H ${cabH} mm (Robust Frame)`,
        color: SWISS_PALETTE[2],
        points2D: rectPoly(x4, -hy, x5, -hy + cabH),
        sharedWith: 'Lower section of Column 05; forms the full-height left vertical member of the robust outer frame.',
        assembled: {
          pivot2D: [rSideL.cx, rSideL.cy],
          pos3D: [-sideWallX, cabHNet / 2, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'side_right',
        name: 'Outer Frame Right Full-Height Wall',
        role: `D ${cabD} × H ${cabH} mm (Robust Frame)`,
        color: SWISS_PALETTE[3],
        points2D: rectPoly(x5, -hy, x6, -hy + cabH),
        sharedWith: 'Lower section of Column 06; forms the full-height right vertical member of the robust outer frame.',
        assembled: {
          pivot2D: [rSideR.cx, rSideR.cy],
          pos3D: [sideWallX, cabHNet / 2, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'door_left',
        name: 'Left 25mm-Inset Cabinet Door',
        role: `${cabW / 2} × ${doorH} mm (25mm Recessed)`,
        color: SWISS_PALETTE[4],
        points2D: rectPoly(x6, 0, x7, hy),
        sharedWith: 'Upper half of Column 07; sits inside the outer frame recessed by 25 mm from the front edge.',
        assembled: {
          pivot2D: [rDoorL.cx, rDoorL.y1],
          pos3D: [-cabWNet / 2, upperMidY, doorCenterZ],
          uAxis: [0, 1, 0],
          vAxis: [-cosD, 0, -sinD]
        }
      },
      {
        id: 'door_right',
        name: 'Right 25mm-Inset Cabinet Door',
        role: `${cabW / 2} × ${doorH} mm (25mm Recessed)`,
        color: SWISS_PALETTE[5],
        points2D: rectPoly(x6, -hy, x7, 0),
        sharedWith: 'Lower half of Column 07; sits inside the outer frame recessed by 25 mm from the front edge.',
        assembled: {
          pivot2D: [rDoorR.cx, rDoorR.y0],
          pos3D: [cabWNet / 2, upperMidY, doorCenterZ],
          uAxis: [0, 1, 0],
          vAxis: [-cosD, 0, sinD]
        }
      },
      {
        id: 'shelf_upper_left',
        name: 'Upper Left Recessed Interior Shelf',
        role: `${cabW / 2} × ${shelfD} mm (Recessed ${shelfRecess}mm)`,
        color: SWISS_PALETTE[6],
        points2D: rectPoly(x2, 0, x2 + shelfD, hy),
        sharedWith: 'Cut from Column 03; recessed behind the 25mm-inset Left Door. Its cutoff strip becomes the Upper Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfUL.cx, rShelfUL.cy],
          pos3D: [-bayCenterX, upperMidY, shelfCenterZ],
          uAxis: [0, 0, 1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'shelf_upper_right',
        name: 'Upper Right Recessed Interior Shelf',
        role: `${cabW / 2} × ${shelfD} mm (Recessed ${shelfRecess}mm)`,
        color: SWISS_PALETTE[7],
        points2D: rectPoly(x2, -hy, x2 + shelfD, 0),
        sharedWith: 'Cut from Column 03; recessed behind the 25mm-inset Right Door. Its cutoff strip becomes the Upper Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfUR.cx, rShelfUR.cy],
          pos3D: [bayCenterX, upperMidY, shelfCenterZ],
          uAxis: [0, 0, 1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'shelf_lower_left',
        name: 'Lower Left Recessed Compartment Deck',
        role: `${cabW / 2} × ${shelfD} mm (Recessed ${shelfRecess}mm)`,
        color: SWISS_PALETTE[8],
        points2D: rectPoly(x3, 0, x3 + shelfD, hy),
        sharedWith: 'Cut from Column 04; forms the lower recessed floor of the left bay above the open plinth.',
        assembled: {
          pivot2D: [rShelfLL.cx, rShelfLL.cy],
          pos3D: [-bayCenterX, deckY, shelfCenterZ],
          uAxis: [0, 0, 1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'shelf_lower_right',
        name: 'Lower Right Recessed Compartment Deck',
        role: `${cabW / 2} × ${shelfD} mm (Recessed ${shelfRecess}mm)`,
        color: SWISS_PALETTE[9],
        points2D: rectPoly(x3, -hy, x3 + shelfD, 0),
        sharedWith: 'Cut from Column 04; forms the lower recessed floor of the right bay above the open plinth.',
        assembled: {
          pivot2D: [rShelfLR.cx, rShelfLR.cy],
          pos3D: [bayCenterX, deckY, shelfCenterZ],
          uAxis: [0, 0, 1],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'rear_brace_upper',
        name: 'Upper Rear Reinforcement Rail (From Shelf Recess)',
        role: `${cabW} × ${shelfRecess} mm (Rear Structural Brace)`,
        color: SWISS_PALETTE[0],
        points2D: rectPoly(x2 + shelfD, -hy, x3, hy),
        sharedWith: '100% leftover strip from recessing the Upper Interior Shelves (#07–#08); mounted at top-back of frame as anti-racking reinforcement!',
        assembled: {
          pivot2D: [rBraceU.cx, rBraceU.cy],
          pos3D: [0, upperTopY - rBraceU.w / 2 - 0.5, rearRailZ],
          uAxis: [0, 1, 0],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'rear_brace_lower',
        name: 'Lower Rear Reinforcement Rail (From Shelf Recess)',
        role: `${cabW} × ${shelfRecess} mm (Rear Structural Brace)`,
        color: SWISS_PALETTE[1],
        points2D: rectPoly(x3 + shelfD, -hy, x4, hy),
        sharedWith: '100% leftover strip from recessing the Lower Compartment Shelves (#09–#10); mounted at bottom-back of frame above the base shelf!',
        assembled: {
          pivot2D: [rBraceL.cx, rBraceL.cy],
          pos3D: [0, T + rBraceL.w / 2 + 0.5, rearRailZ],
          uAxis: [0, 1, 0],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'center_divider',
        name: 'Central Recessed Vertical Partition',
        role: `D ${shelfD} × H ${doorH} mm`,
        color: SWISS_PALETTE[2],
        points2D: rectPoly(x4, -hy + cabH, x4 + shelfD, hy),
        sharedWith: 'Upper section of Column 05; stands vertically in the center behind the 25mm-inset doors.',
        assembled: {
          pivot2D: [rDiv.cx, rDiv.cy],
          pos3D: [0, upperMidY, shelfCenterZ],
          uAxis: [0, 0, 1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'rear_center_cleat',
        name: 'Rear Central Partition Cleat (From Recess)',
        role: `${shelfRecess} × ${doorH} mm`,
        color: SWISS_PALETTE[3],
        points2D: rectPoly(x4 + shelfD, -hy + cabH, x5, hy),
        sharedWith: 'Leftover recess strip from Central Partition (#13); reinforces the central rear spine.',
        assembled: {
          pivot2D: [rCleat.cx, rCleat.cy],
          pos3D: [0, upperMidY, rearRailZ - T - 0.5],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'rear_plinth_fin',
        name: 'Lower Plinth Center Support Fin',
        role: `D ${cabD} × H ${doorH} mm`,
        color: SWISS_PALETTE[4],
        points2D: rectPoly(x5, -hy + cabH, x6, hy),
        sharedWith: 'Upper section of Column 06; braces the rear center of the cabinet frame.',
        assembled: {
          pivot2D: [rFin.cx, rFin.cy],
          pos3D: [0, T + (cabHNet - doorHNet - T) / 2, -cabDNet / 2 + T * 1.5 + 1],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, 1]
        }
      }
    ];

    const handles = [
      {
        id: 'h_cab_recess',
        x: x2 + shelfD,
        y: 0,
        label: 'Drag to adjust Interior Shelf Recess & Rear Reinforcement Rail Height (10mm steps)',
        onDrag: (nx) => {
          const newRecess = x3 - nx;
          state.params.cabinet.shelfRecess = snapToStep(newRecess, 10, 60, 100);
        }
      },
      {
        id: 'h_cab_depth',
        x: x1,
        y: 0,
        label: 'Drag to adjust Cabinet Frame Depth on 122×244 Sheet (10mm steps)',
        onDrag: (nx) => {
          const newD = nx - x0;
          state.params.cabinet.cabinetDepth = snapToStep(newD, 10, 310, 350);
        }
      }
    ];

    return {
      pieces,
      handles,
      summaryDims: {
        width: cabW + T * 2,
        depth: cabD,
        height: cabH,
        primaryHeight: cabH,
        ergonomicNote: `1 STD SHEET 122×244 · 25MM INSET`
      }
    };
  } else {
    // ========================================================================
    // 2 STANDARD SHEETS: 2 × (2440 × 1220 MM) = 2440 × 2440 MM (100% ZERO WASTE!)
    // - Sheet 01 (y in [-1220 .. 0], 2440 × 1220 mm) and Sheet 02 (y in [0 .. +1220], 2440 × 1220 mm)
    // - Zero pieces cross the seam y = 0 between Sheet 01 and Sheet 02!
    // - Builds a Grand 1600 mm Wide Credenza with 25mm-Inset Doors, 4 Recessed Shelves,
    //   and 2 Full-Width Rear Reinforcement Rails cut from the shelf recess strips!
    // ========================================================================
    const L = 2440;
    const W = 2440; // 2 standard 2440×1220mm boards!
    state.sheetL = L;
    state.sheetW = W;

    const hx = L / 2; // 1220
    const hy = W / 2; // 1220

    const cabD = clamp(p.cabinetDepth + 90, 400, 440); // 400 .. 440 mm (default 420 mm)
    const cabW = L - 2 * cabD;                         // For cabD=420 -> cabW = 1600 mm!
    const xSplit = -hx + cabW;                         // +380 mm
    const xRightMid = xSplit + cabD;                   // +800 mm
    const xMidLeft = (-hx + xSplit) / 2;

    // Sheet 01 (Bottom Sheet: y in [-1220 .. 0], height = 1220 mm):
    const s1_y1 = -hy + cabD;                          // Top of Top Frame Panel
    const s1_y2 = s1_y1 + cabD;                        // Top of Bottom Frame Base Panel
    const remH1 = 1220 - 2 * cabD;                     // e.g. 1220 - 840 = 380 mm
    const shelfD = remH1 - shelfRecess;                // Recessed shelf depth (e.g. 380 - 80 = 300 mm)
    const s1_y3 = s1_y2 + shelfD;                      // Top of Upper Left & Right Recessed Shelves
    // [s1_y3 .. 0] has height = shelfRecess (Upper Rear Reinforcement Rail!)

    const cabH = 2 * cabD;                             // 840 mm full-height Side Walls on Sheet 01 Right!
    const doorH = 540;                                 // 540 mm tall 25mm-inset doors on Sheet 02!
    const plinthBayH = cabH - doorH;                   // 300 mm open lower plinth bay!

    // Sheet 02 (Top Sheet: y in [0 .. +1220], height = 1220 mm):
    const s2_y1 = doorH;                               // [0 .. doorH]: Left & Right 25mm-Inset Doors
    const s2_y2 = s2_y1 + shelfD;                      // [doorH .. doorH+shelfD]: Lower Left & Right Recessed Shelves
    const s2_y3 = s2_y2 + shelfRecess;                 // [s2_y2 .. s2_y3]: Lower Rear Reinforcement Rail (height = shelfRecess!)
    // [s2_y3 .. hy] has height = 1220 - doorH - remH1 = 300 mm (Open Plinth Sub-Deck!)

    const { dInt, dExt } = getActiveKerfOffsets();
    const rTop = getPostKerfRect(-hx, -hy, xSplit, s1_y1, hx, hy, dInt, dExt, true);
    const rBot = getPostKerfRect(-hx, s1_y1, xSplit, s1_y2, hx, hy, dInt, dExt, true);
    const rSideL = getPostKerfRect(xSplit, -hy, xRightMid, -hy + cabH, hx, hy, dInt, dExt, true);
    const rSideR = getPostKerfRect(xRightMid, -hy, hx, -hy + cabH, hx, hy, dInt, dExt, true);
    const rDoorL = getPostKerfRect(-hx, 0, xMidLeft, s2_y1, hx, hy, dInt, dExt, true);
    const rDoorR = getPostKerfRect(xMidLeft, 0, xSplit, s2_y1, hx, hy, dInt, dExt, true);
    const rShelfUL = getPostKerfRect(-hx, s1_y2, xMidLeft, s1_y3, hx, hy, dInt, dExt, true);
    const rShelfUR = getPostKerfRect(xMidLeft, s1_y2, xSplit, s1_y3, hx, hy, dInt, dExt, true);
    const rShelfLL = getPostKerfRect(-hx, s2_y1, xMidLeft, s2_y2, hx, hy, dInt, dExt, true);
    const rShelfLR = getPostKerfRect(xMidLeft, s2_y1, xSplit, s2_y2, hx, hy, dInt, dExt, true);
    const rBraceU = getPostKerfRect(-hx, s1_y3, xSplit, 0, hx, hy, dInt, dExt, true);
    const rBraceL = getPostKerfRect(-hx, s2_y2, xSplit, s2_y3, hx, hy, dInt, dExt, true);
    const rSubDeck = getPostKerfRect(-hx, s2_y3, xSplit, hy, hx, hy, dInt, dExt, true);
    const rDiv = getPostKerfRect(xSplit, -hy + cabH, xRightMid, 0, hx, hy, dInt, dExt, true);
    const rFin = getPostKerfRect(xRightMid, -hy + cabH, hx, 0, hx, hy, dInt, dExt, true);
    const rBackL = getPostKerfRect(xSplit, 0, xRightMid, hy, hx, hy, dInt, dExt, true);
    const rBackR = getPostKerfRect(xRightMid, 0, hx, hy, hx, hy, dInt, dExt, true);

    const cabWNet = rTop.w;
    const cabDNet = rSideL.w;
    const cabHNet = rSideL.h;
    const doorHNet = rDoorL.h;

    const sideWallX = cabWNet / 2 + T / 2 + 0.5;
    const topPanelY = cabHNet - T / 2;
    const bottomPanelY = T / 2;
    const upperTopY = cabHNet - T;
    const deckY = upperTopY - doorHNet + T / 2;
    const upperMidY = upperTopY - doorHNet / 2;
    const doorCenterZ = cabDNet / 2 - doorInset - T / 2;
    const rearRailZ = -cabDNet / 2 + T / 2;
    const shelfBackZ = -cabDNet / 2 + T + 1;
    const shelfCenterZ = shelfBackZ + rShelfUL.h / 2;
    const bayCenterX = (T / 2 + cabWNet / 2) / 2;

    const pieces = [
      {
        id: 'top_panel',
        name: 'Outer Frame Top Panel (Sheet 01)',
        role: `${cabW} × ${cabD} mm (Robust Frame)`,
        color: SWISS_PALETTE[0],
        points2D: rectPoly(-hx, -hy, xSplit, s1_y1),
        sharedWith: 'Cut from Standard Sheet 01 (2440×1220); forms the top horizontal member of the robust outer frame.',
        assembled: {
          pivot2D: [rTop.cx, rTop.cy],
          pos3D: [0, topPanelY, 0],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'bottom_shelf',
        name: 'Outer Frame Bottom Base Panel (Sheet 01)',
        role: `${cabW} × ${cabD} mm (Robust Frame)`,
        color: SWISS_PALETTE[1],
        points2D: rectPoly(-hx, s1_y1, xSplit, s1_y2),
        sharedWith: 'Cut from Standard Sheet 01 (2440×1220); forms the bottom plinth base of the robust outer frame.',
        assembled: {
          pivot2D: [rBot.cx, rBot.cy],
          pos3D: [0, bottomPanelY, 0],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'side_left',
        name: 'Outer Frame Left Full-Height Wall (Sheet 01)',
        role: `D ${cabD} × H ${cabH} mm (Robust Frame)`,
        color: SWISS_PALETTE[2],
        points2D: rectPoly(xSplit, -hy, xRightMid, -hy + cabH),
        sharedWith: 'Cut from Standard Sheet 01 Right; forms the full-height left vertical member of the robust frame.',
        assembled: {
          pivot2D: [rSideL.cx, rSideL.cy],
          pos3D: [-sideWallX, cabHNet / 2, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'side_right',
        name: 'Outer Frame Right Full-Height Wall (Sheet 01)',
        role: `D ${cabD} × H ${cabH} mm (Robust Frame)`,
        color: SWISS_PALETTE[3],
        points2D: rectPoly(xRightMid, -hy, hx, -hy + cabH),
        sharedWith: 'Cut from Standard Sheet 01 Far-Right; forms the full-height right vertical member of the robust frame.',
        assembled: {
          pivot2D: [rSideR.cx, rSideR.cy],
          pos3D: [sideWallX, cabHNet / 2, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'door_left',
        name: 'Left 25mm-Inset Cabinet Door (Sheet 02)',
        role: `${cabW / 2} × ${doorH} mm (25mm Recessed)`,
        color: SWISS_PALETTE[4],
        points2D: rectPoly(-hx, 0, xMidLeft, s2_y1),
        sharedWith: 'Cut from Standard Sheet 02; sits inside the outer frame recessed by 25 mm from the front edge.',
        assembled: {
          pivot2D: [rDoorL.x0, rDoorL.cy],
          pos3D: [-cabWNet / 2, upperMidY, doorCenterZ],
          uAxis: [cosD, 0, sinD],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'door_right',
        name: 'Right 25mm-Inset Cabinet Door (Sheet 02)',
        role: `${cabW / 2} × ${doorH} mm (25mm Recessed)`,
        color: SWISS_PALETTE[5],
        points2D: rectPoly(xMidLeft, 0, xSplit, s2_y1),
        sharedWith: 'Cut from Standard Sheet 02; sits inside the outer frame recessed by 25 mm from the front edge.',
        assembled: {
          pivot2D: [rDoorR.x1, rDoorR.cy],
          pos3D: [cabWNet / 2, upperMidY, doorCenterZ],
          uAxis: [cosD, 0, -sinD],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'shelf_upper_left',
        name: 'Upper Left Recessed Interior Shelf (Sheet 01)',
        role: `${cabW / 2} × ${shelfD} mm (Recessed)`,
        color: SWISS_PALETTE[6],
        points2D: rectPoly(-hx, s1_y2, xMidLeft, s1_y3),
        sharedWith: 'Recessed behind the 25mm-inset Left Door; its top cutoff strip (#11) becomes the Upper Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfUL.cx, rShelfUL.cy],
          pos3D: [-bayCenterX, upperMidY, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'shelf_upper_right',
        name: 'Upper Right Recessed Interior Shelf (Sheet 01)',
        role: `${cabW / 2} × ${shelfD} mm (Recessed)`,
        color: SWISS_PALETTE[7],
        points2D: rectPoly(xMidLeft, s1_y2, xSplit, s1_y3),
        sharedWith: 'Recessed behind the 25mm-inset Right Door; its top cutoff strip (#11) becomes the Upper Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfUR.cx, rShelfUR.cy],
          pos3D: [bayCenterX, upperMidY, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'shelf_lower_left',
        name: 'Lower Left Recessed Compartment Deck (Sheet 02)',
        role: `${cabW / 2} × ${shelfD} mm (Recessed)`,
        color: SWISS_PALETTE[8],
        points2D: rectPoly(-hx, s2_y1, xMidLeft, s2_y2),
        sharedWith: 'Forms the lower recessed floor of the left compartment; its cutoff strip (#12) becomes the Lower Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfLL.cx, rShelfLL.cy],
          pos3D: [-bayCenterX, deckY, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'shelf_lower_right',
        name: 'Lower Right Recessed Compartment Deck (Sheet 02)',
        role: `${cabW / 2} × ${shelfD} mm (Recessed)`,
        color: SWISS_PALETTE[9],
        points2D: rectPoly(xMidLeft, s2_y1, xSplit, s2_y2),
        sharedWith: 'Forms the lower recessed floor of the right compartment; its cutoff strip (#12) becomes the Lower Rear Reinforcement!',
        assembled: {
          pivot2D: [rShelfLR.cx, rShelfLR.cy],
          pos3D: [bayCenterX, deckY, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'rear_brace_upper',
        name: 'Upper Rear Reinforcement Rail (From Shelf Recess)',
        role: `${cabW} × ${shelfRecess} mm (Rear Structural Brace)`,
        color: SWISS_PALETTE[0],
        points2D: rectPoly(-hx, s1_y3, xSplit, 0),
        sharedWith: '100% leftover strip from recessing the Upper Interior Shelves (#07–#08); mounted at top-back of frame as reinforcement!',
        assembled: {
          pivot2D: [rBraceU.cx, rBraceU.cy],
          pos3D: [0, upperTopY - rBraceU.h / 2 - 0.5, rearRailZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'rear_brace_lower',
        name: 'Lower Rear Reinforcement Rail (From Shelf Recess)',
        role: `${cabW} × ${shelfRecess} mm (Rear Structural Brace)`,
        color: SWISS_PALETTE[1],
        points2D: rectPoly(-hx, s2_y2, xSplit, s2_y3),
        sharedWith: '100% leftover strip from recessing the Lower Compartment Shelves (#09–#10); mounted at bottom-back of frame above the base shelf!',
        assembled: {
          pivot2D: [rBraceL.cx, rBraceL.cy],
          pos3D: [0, T + rBraceL.h / 2 + 0.5, rearRailZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'plinth_subdeck',
        name: 'Lower Open Plinth Display Deck (Sheet 02)',
        role: `${cabW} × ${hy - s2_y3} mm`,
        color: SWISS_PALETTE[2],
        points2D: rectPoly(-hx, s2_y3, xSplit, hy),
        sharedWith: 'Top-left strip of Sheet 02; sits as an intermediate display shelf in the open lower plinth bay.',
        assembled: {
          pivot2D: [rSubDeck.cx, rSubDeck.cy],
          pos3D: [0, T + (cabHNet - doorHNet - T) * 0.45, shelfCenterZ],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'center_divider',
        name: 'Central Recessed Vertical Partition (Sheet 01)',
        role: `D ${cabD} × H ${remH1} mm`,
        color: SWISS_PALETTE[3],
        points2D: rectPoly(xSplit, -hy + cabH, xRightMid, 0),
        sharedWith: 'Top-right of Sheet 01; stands vertically in the center between the Left & Right Recessed Shelves.',
        assembled: {
          pivot2D: [rDiv.cx, rDiv.cy],
          pos3D: [0, upperMidY, 0],
          uAxis: [0, 0, -1],
          vAxis: [0, 1, 0]
        }
      },
      {
        id: 'plinth_center_fin',
        name: 'Lower Plinth Center Support Fin (Sheet 01)',
        role: `D ${cabD} × H ${remH1} mm`,
        color: SWISS_PALETTE[4],
        points2D: rectPoly(xRightMid, -hy + cabH, hx, 0),
        sharedWith: 'Top-far-right of Sheet 01; supports the center of the lower open plinth bay.',
        assembled: {
          pivot2D: [rFin.cx, rFin.cy],
          pos3D: [0, T + (cabHNet - doorHNet - T) / 2, 0],
          uAxis: [1, 0, 0],
          vAxis: [0, 0, -1]
        }
      },
      {
        id: 'rear_panel_left',
        name: 'Left Rear Cabinet Back Panel (Sheet 02)',
        role: `${cabD} × 1220 mm`,
        color: SWISS_PALETTE[5],
        points2D: rectPoly(xSplit, 0, xRightMid, hy),
        sharedWith: 'Right column of Sheet 02; encloses and reinforces the rear left bay of the grand credenza.',
        assembled: {
          pivot2D: [rBackL.cx, rBackL.cy],
          pos3D: [-cabWNet / 4, upperMidY, rearRailZ - T - 0.5],
          uAxis: [0, 1, 0],
          vAxis: [1, 0, 0]
        }
      },
      {
        id: 'rear_panel_right',
        name: 'Right Rear Cabinet Back Panel (Sheet 02)',
        role: `${cabD} × 1220 mm`,
        color: SWISS_PALETTE[6],
        points2D: rectPoly(xRightMid, 0, hx, hy),
        sharedWith: 'Far-right column of Sheet 02; encloses and reinforces the rear right bay of the grand credenza.',
        assembled: {
          pivot2D: [rBackR.cx, rBackR.cy],
          pos3D: [cabWNet / 4, upperMidY, rearRailZ - T - 0.5],
          uAxis: [0, 1, 0],
          vAxis: [1, 0, 0]
        }
      }
    ];

    const handles = [
      {
        id: 'h_cab2_recess',
        x: xMidLeft,
        y: s1_y3,
        label: 'Drag to adjust Interior Shelf Recess & Rear Reinforcement Height (10mm steps)',
        onDrag: (_, ny) => {
          const newRecess = Math.abs(ny);
          state.params.cabinet.shelfRecess = snapToStep(newRecess, 10, 60, 100);
        }
      }
    ];

    return {
      pieces,
      handles,
      summaryDims: {
        width: cabW + T * 2,
        depth: cabD,
        height: cabH,
        primaryHeight: cabH,
        ergonomicNote: `2 STD SHEETS 122×244 · 25MM INSET`
      }
    };
  }
}

// ============================================================================
// 08 / ZERO-WASTE WAVE WALL (ENHANCED CUSTOMIZATION — FLOW, ALTERNATING, MIRROR)
// ============================================================================
function generateCurvedWallGeometry() {
  const T = state.thickness;
  const p = state.params.curvedWall;

  const wallH = p.wallHeight;
  const M = p.pairCount;
  const pairW = p.pairWidth;
  const amp = clamp(p.waveAmp, 15, pairW * 0.38);
  const freq = p.waveFreq;
  const harm = p.harmonicMix / 100;
  const phaseStep = (p.phaseShift * Math.PI) / 180;
  const spacing = p.slatSpacing;
  const mode = p.arrangementMode;

  const L = wallH;
  const W = M * pairW;
  state.sheetL = L;
  state.sheetW = W;

  const hx = L / 2;
  const hy = W / 2;

  const totalSlats = M * 2;
  const wallSpanX = (totalSlats - 1) * spacing;
  const wallBackZ = -pairW * 0.35;

  const evalCutY = (u, yMid, k) => {
    const phi = k * phaseStep;
    const w1 = Math.sin(u * Math.PI * 2 * freq + phi);
    const w2 = harm * Math.cos(u * Math.PI * 4 * freq - phi * 0.8);
    const norm = 1 / (1 + harm * 0.75);
    return yMid + amp * (w1 + w2) * norm;
  };

  const pieces = [];
  const steps = 48;

  for (let k = 0; k < M; k++) {
    const y0 = -hy + k * pairW;
    const y1 = y0 + pairW;
    const yMid = (y0 + y1) / 2;

    const waveForward = [];
    const waveBackward = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = -hx + u * L;
      const y = evalCutY(u, yMid, k);
      waveForward.push([x, y]);
      waveBackward.unshift([x, y]);
    }

    let slatAIndex;
    let slatBIndex;
    if (mode === 2) {
      slatAIndex = k * 2;
      slatBIndex = k * 2 + 1;
    } else if (mode === 3) {
      slatAIndex = k;
      slatBIndex = totalSlats - 1 - k;
    } else {
      slatAIndex = k;
      slatBIndex = M + k;
    }

    const slatAX = -wallSpanX / 2 + slatAIndex * spacing;
    const slatBX = -wallSpanX / 2 + slatBIndex * spacing;

    pieces.push({
      id: `slat_${k + 1}_A`,
      name: `Wave Slat ${String(k + 1).padStart(2, '0')}A (Positive)`,
      role: `H ${wallH} × W ~${Math.round(pairW / 2)} mm`,
      color: SWISS_PALETTE[k % SWISS_PALETTE.length],
      points2D: [[-hx, y0], [hx, y0], ...waveBackward],
      sharedWith: `Shares 100% of its wave cut with Complementary Slat ${String(k + 1).padStart(2, '0')}B; placed at Wall Pos #${slatAIndex + 1}.`,
      assembled: {
        pivot2D: [0, y0],
        pos3D: [slatAX, wallH / 2, wallBackZ],
        uAxis: [0, 1, 0],
        vAxis: [0, 0, 1]
      }
    });

    pieces.push({
      id: `slat_${k + 1}_B`,
      name: `Wave Slat ${String(k + 1).padStart(2, '0')}B (Complementary)`,
      role: `H ${wallH} × W ~${Math.round(pairW / 2)} mm`,
      color: SWISS_PALETTE[(k + 3) % SWISS_PALETTE.length],
      points2D: [...waveForward, [hx, y1], [-hx, y1]],
      sharedWith: `Extracted from the other side of Wave Cut 0${k + 1}; concatenated at Wall Position #${slatBIndex + 1}.`,
      assembled: {
        pivot2D: [0, y1],
        pos3D: [slatBX, wallH / 2, wallBackZ],
        uAxis: [0, 1, 0],
        vAxis: [0, 0, -1]
      }
    });
  }

  const midPairY = -hy + pairW * 0.5;
  const handles = [
    {
      id: 'h_wall_amp',
      x: -hx + L * 0.25,
      y: midPairY + amp,
      label: 'Drag to sculpt Wave Relief Amplitude (5mm steps)',
      onDrag: (_, ny) => {
        const rawAmp = Math.abs(ny - midPairY);
        state.params.curvedWall.waveAmp = snapToStep(rawAmp, 5, 20, 85);
      }
    }
  ];

  const modeNames = { 1: 'FLOW ARRAY', 2: 'ALTERNATING A/B', 3: 'MIRROR RIPPLE' };

  return {
    pieces,
    handles,
    summaryDims: {
      width: wallSpanX + T,
      depth: Math.round(pairW / 2 + amp),
      height: wallH,
      primaryHeight: totalSlats,
      ergonomicNote: `${totalSlats} SLATS · ${modeNames[mode]}`
    }
  };
}

function getCurrentModelData() {
  switch (state.typology) {
    case 'chair':
      return generateChairGeometry();
    case 'plankChair':
      return generatePlankChairGeometry();
    case 'stool':
      return generateStoolGeometry();
    case 'concentricTable':
      return generateConcentricTableGeometry();
    case 'crossLegTable':
      return generateCrossLegTableGeometry();
    case 'shelf':
      return generateShelfGeometry();
    case 'cabinet':
      return generateCabinetGeometry();
    case 'curvedWall':
      return generateCurvedWallGeometry();
    default:
      return generateChairGeometry();
  }
}

// ============================================================================
// THREE.JS 3D SCENE SETUP (CLEAN STUDIO FLOOR)
// ============================================================================
const container3D = document.getElementById('threeContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F5F1E8');

const camera = new THREE.PerspectiveCamera(38, 1, 10, 18000);
camera.position.set(1450, 1050, 1650);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
container3D.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 320, 0);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd8d0c5, 1.3);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfffcf5, 1.4);
dirLight.position.set(1400, 2600, 1800);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 200;
dirLight.shadow.camera.far = 6500;
const d = 2200;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xe8e2d5, 0.55);
fillLight.position.set(-1600, 900, -1200);
scene.add(fillLight);

const floorPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10000, 10000),
  new THREE.ShadowMaterial({ opacity: 0.14 })
);
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.position.y = -1;
floorPlane.receiveShadow = true;
scene.add(floorPlane);

const furnitureGroup = new THREE.Group();
scene.add(furnitureGroup);

// Load Uploaded Reference Wood Texture (wood-texture.jpg)
const textureLoader = new THREE.TextureLoader();
let referenceWoodTex = null;
textureLoader.load('wood-texture.jpg', (tex) => {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  referenceWoodTex = tex;
  rebuildSceneAndSheet();
});

function createSurfaceTexture(mode) {
  if (mode === 'butcher' && referenceWoodTex) {
    return referenceWoodTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (mode === 'forest') {
    ctx.fillStyle = '#0F5238';
    ctx.fillRect(0, 0, 1024, 1024);
  } else if (mode === 'charcoal') {
    ctx.fillStyle = '#4A4E52';
    ctx.fillRect(0, 0, 1024, 1024);
  } else if (mode === 'birch') {
    ctx.fillStyle = '#ECCFA9';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = 'rgba(175, 130, 85, 0.12)';
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(0, (i * 1024) / 60, 1024, 4 + Math.sin(i) * 2);
    }
  } else if (mode === 'walnut') {
    ctx.fillStyle = '#4A372B';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = 'rgba(25, 15, 10, 0.25)';
    for (let i = 0; i < 70; i++) {
      ctx.fillRect(0, (i * 1024) / 70, 1024, 5);
    }
  } else {
    const strips = 28;
    const stripH = 1024 / strips;
    const tones = ['#C8A27A', '#B58962', '#D8B998', '#9F724E', '#E2C9AC', '#8D5B3C'];
    for (let r = 0; r < strips; r++) {
      let x = 0;
      while (x < 1024) {
        const w = 140 + ((r * 73 + x) % 220);
        ctx.fillStyle = tones[(r + Math.floor(x / 100)) % tones.length];
        ctx.fillRect(x, r * stripH, w, stripH + 1);
        x += w;
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function applySheetUVs(geometry, px, py, L, W) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i);
    const ly = pos.getY(i);
    const sheetX = lx + px;
    const sheetY = ly + py;
    const u = (sheetX + L / 2) / L;
    const v = (sheetY + W / 2) / W;
    uv.setXY(i, clamp(u, 0, 1), clamp(v, 0, 1));
  }
  uv.needsUpdate = true;
}

let currentPiecesData = [];
let currentSummaryDims = null;
let currentCncAnalysis = null;
let meshByPieceId = new Map();

function rebuildSceneAndSheet() {
  const { pieces, handles, summaryDims } = getCurrentModelData();
  currentPiecesData = pieces;
  currentSummaryDims = summaryDims;

  // Build CNC & Saw Kerf Relative Offsets + Deduplicated Exterior & Shared Interior Cut Layers:
  currentCncAnalysis = buildCncFabricationAnalysis(
    pieces,
    state.sheetL,
    state.sheetW,
    state.kerfWidth,
    state.kerfMode
  );

  const totalSheetArea = state.sheetL * state.sheetW;
  const sumNominalArea = pieces.reduce((acc, p) => acc + pieceNetArea(p, false), 0);
  const sumOffsetArea = pieces.reduce((acc, p) => acc + pieceNetArea(p, true), 0);
  const nominalPct = clamp((sumNominalArea / totalSheetArea) * 100, 99.6, 100.0);
  const netWoodPct = clamp((sumOffsetArea / totalSheetArea) * 100, 70.0, 100.0);
  const kerfLossPct = Math.max(0, nominalPct - netWoodPct);

  const relOffsetPerSide =
    state.kerfMode === 'full_kerf' ? state.kerfWidth : state.kerfWidth / 2;
  const modeLabel =
    state.kerfMode === 'shared'
      ? 'Shared Single-Pass Line'
      : state.kerfMode === 'all_half'
      ? 'All Edges Offset (-K/2)'
      : 'Independent Toolpaths (-K)';

  const stdSheetTag =
    state.sheetL === 2440 && state.sheetW === 1220
      ? ' [1 STD SHEET 122×244 CM]'
      : state.sheetL === 2440 && state.sheetW === 2440
      ? ' [2 STD SHEETS 122×244 CM]'
      : state.sheetW === 1220 || state.sheetL === 1220
      ? ' [122×244 CM STD MODULE]'
      : '';

  document.getElementById('utilizationValue').textContent =
    state.kerfWidth > 0.05
      ? `${netWoodPct.toFixed(1)}% (-${kerfLossPct.toFixed(1)}%)`
      : `${nominalPct.toFixed(1)}%`;
  document.getElementById('sheetAreaTag').textContent = `${(totalSheetArea / 1e6).toFixed(2)} m²`;
  document.getElementById('liveBoardSize').textContent = `${state.sheetL} × ${state.sheetW} mm`;

  const kerfSummaryEl = document.getElementById('liveKerfSummary');
  if (kerfSummaryEl) {
    kerfSummaryEl.textContent = `Bit Ø ${state.kerfWidth.toFixed(0)} mm · Relative Part Offset: -${relOffsetPerSide.toFixed(1)} mm/edge`;
  }

  document.getElementById('header2DTitle').textContent =
    `Stock Board: ${state.sheetL} × ${state.sheetW} mm${stdSheetTag} · Bit Offset -${relOffsetPerSide.toFixed(1)} mm`;

  const cfg = TYPOLOGY_CONFIG[state.typology];
  document.getElementById('slidersSectionTitle').textContent = cfg.sectionTitle;
  document.getElementById('primaryHeightLabel').textContent = cfg.primaryMetricLabel;
  document.getElementById('finalDimW').textContent = `${summaryDims.width} mm`;
  document.getElementById('finalDimD').textContent = `${summaryDims.depth} mm`;
  document.getElementById('finalDimH').textContent = `${summaryDims.height} mm`;
  document.getElementById('finalDimSeat').textContent =
    state.typology === 'curvedWall'
      ? `${summaryDims.primaryHeight} slats`
      : state.typology === 'plankChair'
      ? `${summaryDims.primaryHeight} chairs`
      : `${summaryDims.primaryHeight} mm`;
  document.getElementById('ergonomicBadge').textContent = summaryDims.ergonomicNote;

  document.getElementById('overlayModelName').textContent = cfg.title;
  document.getElementById('overlayDimsText').textContent =
    `W ${summaryDims.width} × D ${summaryDims.depth} × H ${summaryDims.height} mm | Bit Ø ${state.kerfWidth.toFixed(0)}mm (-${relOffsetPerSide.toFixed(1)}mm/edge)`;

  render2DSheet(pieces, handles);
  render3DFurniture(pieces);
  updatePieceHUD();
  updateSidebarFactorySummary();
}

function render3DFurniture(pieces) {
  while (furnitureGroup.children.length > 0) {
    furnitureGroup.remove(furnitureGroup.children[0]);
  }
  meshByPieceId.clear();

  const L = state.sheetL;
  const W = state.sheetW;
  const T = state.thickness;
  const surfaceTex = createSurfaceTexture(state.materialMode);
  const t = state.assembly;
  const hasSelection = state.selectedPieceId !== null;

  pieces.forEach((piece) => {
    const [px, py] = piece.compensatedPivot2D || piece.assembled.pivot2D;
    const activeOuterPts = piece.offsetPoints2D || piece.points2D;
    const activeHoles = piece.offsetHoles2D || piece.holes2D;

    const shape = new THREE.Shape();
    activeOuterPts.forEach(([x, y], idx) => {
      const lx = x - px;
      const ly = y - py;
      if (idx === 0) shape.moveTo(lx, ly);
      else shape.lineTo(lx, ly);
    });
    shape.closePath();

    // Support real 3D through-holes / mortises / slots (`holes2D`):
    if (activeHoles && activeHoles.length > 0) {
      activeHoles.forEach((holePts) => {
        const holePath = new THREE.Path();
        holePts.forEach(([hx, hy], hIdx) => {
          const lhx = hx - px;
          const lhy = hy - py;
          if (hIdx === 0) holePath.moveTo(lhx, lhy);
          else holePath.lineTo(lhx, lhy);
        });
        holePath.closePath();
        shape.holes.push(holePath);
      });
    }

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: T,
      bevelEnabled: true,
      bevelThickness: 0.8,
      bevelSize: 0.6,
      bevelSegments: 2,
      curveSegments: 28
    });
    extrudeGeo.translate(0, 0, -T / 2);
    applySheetUVs(extrudeGeo, px, py, L, W);

    const isSelected = state.selectedPieceId === piece.id;
    const accentColor = new THREE.Color(piece.color);

    const matFace = new THREE.MeshStandardMaterial({
      map: surfaceTex,
      color: isSelected ? new THREE.Color('#FFD599') : new THREE.Color('#FFFFFF'),
      emissive: isSelected ? accentColor : new THREE.Color(0x000000),
      emissiveIntensity: isSelected ? 0.38 : 0.0,
      roughness: 0.52,
      metalness: 0.04,
      transparent: hasSelection && !isSelected,
      opacity: hasSelection && !isSelected ? 0.65 : 1.0
    });

    const matEdge = new THREE.MeshStandardMaterial({
      color: isSelected ? '#141414' : '#9C7A56',
      roughness: 0.6,
      transparent: hasSelection && !isSelected,
      opacity: hasSelection && !isSelected ? 0.65 : 1.0
    });

    const mesh = new THREE.Mesh(extrudeGeo, [matFace, matEdge]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.pieceId = piece.id;

    const edgesGeo = new THREE.EdgesGeometry(extrudeGeo, 24);
    const edgesMat = new THREE.LineBasicMaterial({
      color: isSelected ? 0x141414 : 0x2c2520,
      transparent: true,
      opacity: isSelected ? 1.0 : 0.45
    });
    mesh.add(new THREE.LineSegments(edgesGeo, edgesMat));

    const flatPos = new THREE.Vector3(px, T / 2, -py);
    const flatQuat = quaternionFromBasis([1, 0, 0], [0, 0, -1]);

    const targetPos = new THREE.Vector3(...(piece.compensatedPos3D || piece.assembled.pos3D));
    const targetQuat = quaternionFromBasis(piece.assembled.uAxis, piece.assembled.vAxis);

    const midLift = Math.sin(t * Math.PI) * 160;
    const currentPos = new THREE.Vector3().lerpVectors(flatPos, targetPos, t);
    currentPos.y += midLift;

    const currentQuat = new THREE.Quaternion().slerpQuaternions(flatQuat, targetQuat, t);

    mesh.position.copy(currentPos);
    mesh.quaternion.copy(currentQuat);

    furnitureGroup.add(mesh);
    meshByPieceId.set(piece.id, mesh);
  });
}

// ============================================================================
// 2D INTERACTIVE SVG CUTTING SHEET (WITH ZOOM, PAN, COTAS, CNC LAYERS & OFFSETS)
// ============================================================================
const svgEl = document.getElementById('sheetSvg');
let activeHandle = null;
let isPanning2D = false;
let panStartClient = [0, 0];
let panStartOffset = [0, 0];

function pointsToSvgPath(outerPts, holes2D) {
  let d =
    'M ' +
    outerPts.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join(' L ') +
    ' Z';
  if (holes2D && holes2D.length > 0) {
    for (const h of holes2D) {
      d +=
        ' M ' +
        h.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join(' L ') +
        ' Z';
    }
  }
  return d;
}

function openPolylineToSvgPath(pts) {
  if (!pts || pts.length < 2) return '';
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join(' L ');
}

function updateSvgViewBox2D() {
  const L = state.sheetL;
  const W = state.sheetW;
  const pad = 165;
  const baseW = L + pad * 2;
  const baseH = W + pad * 2;
  const z = clamp(state.zoom2D, 0.75, 8.0);
  const vbW = baseW / z;
  const vbH = baseH / z;
  const [px, py] = state.pan2D;
  const minX = -vbW / 2 + px;
  const minY = -vbH / 2 + py;
  svgEl.setAttribute('viewBox', `${minX.toFixed(1)} ${minY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  const badge = document.getElementById('zoomBadge2D');
  if (badge) badge.textContent = `${Math.round(z * 100)}%`;
}

function render2DSheet(pieces, handles) {
  const L = state.sheetL;
  const W = state.sheetW;
  updateSvgViewBox2D();

  const useWoodImg = state.materialMode === 'butcher';
  const relOffset =
    state.fitCompMode === 'expand_nominal'
      ? 0
      : state.kerfMode === 'full_kerf'
      ? state.kerfWidth
      : state.kerfWidth / 2;

  let html = `
    <defs>
      <pattern id="woodPattern" patternUnits="userSpaceOnUse" width="${L}" height="${W}" x="${-L / 2}" y="${-W / 2}">
        <image href="wood-texture.jpg" x="0" y="0" width="${L}" height="${W}" preserveAspectRatio="none" />
      </pattern>
    </defs>
  `;

  // Top & Left Overall Architectural Dimension Lines (Cotas Generales de Plancha)
  html += `
    <g fill="#141414" font-family="JetBrains Mono" font-size="22" font-weight="700" text-anchor="middle">
      <line x1="${-L / 2}" y1="${-W / 2 - 20}" x2="${-L / 2}" y2="${-W / 2 - 64}" stroke="#141414" stroke-width="2.5" />
      <line x1="${L / 2}" y1="${-W / 2 - 20}" x2="${L / 2}" y2="${-W / 2 - 64}" stroke="#141414" stroke-width="2.5" />
      <line x1="${-L / 2}" y1="${-W / 2 - 44}" x2="${L / 2}" y2="${-W / 2 - 44}" stroke="#141414" stroke-width="3" />
      <rect x="-360" y="${-W / 2 - 68}" width="720" height="42" fill="#EFECE4" />
      <text x="0" y="${-W / 2 - 40}">STOCK L: ${L} mm · KERF K=${state.kerfWidth.toFixed(1)}mm (OFFSET -${relOffset.toFixed(2)}mm)</text>

      <line x1="${-L / 2 - 20}" y1="${-W / 2}" x2="${-L / 2 - 64}" y2="${-W / 2}" stroke="#141414" stroke-width="2.5" />
      <line x1="${-L / 2 - 20}" y1="${W / 2}" x2="${-L / 2 - 64}" y2="${W / 2}" stroke="#141414" stroke-width="2.5" />
      <line x1="${-L / 2 - 44}" y1="${-W / 2}" x2="${-L / 2 - 44}" y2="${W / 2}" stroke="#141414" stroke-width="3" />
      <g transform="translate(${-L / 2 - 56}, 0) rotate(-90)">
        <rect x="-140" y="-24" width="280" height="34" fill="#EFECE4" />
        <text x="0" y="0">BOARD W: ${W} mm</text>
      </g>
    </g>
  `;

  const bgFill =
    state.materialMode === 'forest'
      ? '#0F5238'
      : state.materialMode === 'charcoal'
      ? '#4A4E52'
      : useWoodImg
      ? 'url(#woodPattern)'
      : '#E8DFD1';

  // Raw Stock Board background (Kerf gaps reveal dark CNC spoilboard beneath!)
  html += `
    <rect
      x="${-L / 2}"
      y="${-W / 2}"
      width="${L}"
      height="${W}"
      fill="#26221E"
      stroke="#141414"
      stroke-width="4"
    />
  `;

  let selectedCalloutHtml = '';
  const isNarrow = W <= 420 || state.typology === 'plankChair';

  // 1. Render each board piece using its Post-Kerf Offset Contour
  pieces.forEach((piece, idx) => {
    const isSelected = state.selectedPieceId === piece.id;
    const renderPts = piece.offsetPoints2D || piece.points2D;
    const renderHoles = piece.offsetHoles2D || piece.holes2D;
    const offsetPathD = pointsToSvgPath(renderPts, renderHoles);

    const cx = piece.points2D.reduce((s, p) => s + p[0], 0) / piece.points2D.length;
    const cy = -piece.points2D.reduce((s, p) => s + p[1], 0) / piece.points2D.length;

    const fillAlpha = isSelected ? '0.78' : isNarrow ? '0.45' : '0.24';
    const numStr = String(idx + 1).padStart(2, '0');
    const [offW, offH] = piece.offsetBox || piece.nominalBox || [0, 0];
    const showPartCota = state.showDims2D && !isNarrow;
    const bW = isNarrow ? 34 : showPartCota ? 132 : 56;
    const bH = isNarrow ? 22 : showPartCota ? 50 : 38;
    const fontSz = isNarrow ? 12 : 18;

    html += `
      <g class="svg-piece" data-piece-id="${piece.id}">
        <path
          d="${offsetPathD}"
          fill-rule="evenodd"
          fill="${bgFill}"
          stroke="none"
        />
        <path
          d="${offsetPathD}"
          fill-rule="evenodd"
          fill="${piece.color}"
          fill-opacity="${fillAlpha}"
          stroke="${isSelected ? '#FFFFFF' : '#141414'}"
          stroke-width="${isSelected ? (isNarrow ? 5 : 8) : 2}"
          stroke-linejoin="round"
        />
    `;

    // Layer 04: Relative Part Offset Contour highlight (-K/2 or -K per piece)
    if (state.showLayerOffsets) {
      html += `
        <path
          d="${offsetPathD}"
          fill="none"
          stroke="#1E6B45"
          stroke-width="${isNarrow ? 2.2 : 3.2}"
          stroke-dasharray="${state.kerfWidth > 0.05 ? '10,5' : 'none'}"
          pointer-events="none"
        />
      `;
    }

    html += `
        <rect
          x="${(cx - bW / 2).toFixed(1)}"
          y="${(cy - bH / 2).toFixed(1)}"
          width="${bW}"
          height="${bH}"
          fill="${isSelected ? '#141414' : 'rgba(255,255,255,0.94)'}"
          stroke="#141414"
          stroke-width="${isNarrow ? 2 : 2.5}"
          pointer-events="none"
        />
        <text
          x="${cx.toFixed(1)}"
          y="${(showPartCota ? cy - 8 : cy + 1).toFixed(1)}"
          fill="${isSelected ? '#FFFFFF' : '#141414'}"
          font-family="JetBrains Mono"
          font-weight="700"
          font-size="${fontSz}"
          text-anchor="middle"
          dominant-baseline="middle"
          pointer-events="none"
        >#${numStr}</text>
    `;

    if (showPartCota) {
      html += `
        <text
          x="${cx.toFixed(1)}"
          y="${(cy + 12).toFixed(1)}"
          fill="${isSelected ? '#E8DFD1' : '#333333'}"
          font-family="JetBrains Mono"
          font-weight="600"
          font-size="12.5"
          text-anchor="middle"
          dominant-baseline="middle"
          pointer-events="none"
        >${offW.toFixed(1)}×${offH.toFixed(1)}</text>
      `;
    }

    html += `</g>`;

    // If selected and Cotas enabled, draw dedicated horizontal & vertical dimension arrows on this part!
    if (isSelected) {
      const xs = renderPts.map((pt) => pt[0]);
      const ys = renderPts.map((pt) => -pt[1]);
      const pMinX = Math.min(...xs);
      const pMaxX = Math.max(...xs);
      const pMinY = Math.min(...ys);
      const pMaxY = Math.max(...ys);

      selectedCalloutHtml = `
        <g pointer-events="none">
          <line x1="${pMinX}" y1="${pMinY - 18}" x2="${pMaxX}" y2="${pMinY - 18}" stroke="#141414" stroke-width="3" />
          <line x1="${pMinX}" y1="${pMinY - 28}" x2="${pMinX}" y2="${pMinY - 8}" stroke="#141414" stroke-width="3" />
          <line x1="${pMaxX}" y1="${pMinY - 28}" x2="${pMaxX}" y2="${pMinY - 8}" stroke="#141414" stroke-width="3" />
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="48" fill="none" stroke="#141414" stroke-width="4" stroke-dasharray="10,6" />
          <rect x="${(cx - 225).toFixed(1)}" y="${(pMinY - 64).toFixed(1)}" width="450" height="42" fill="#141414" stroke="#FFFFFF" stroke-width="3" />
          <text x="${cx.toFixed(1)}" y="${(pMinY - 39).toFixed(1)}" fill="#FFFFFF" font-family="JetBrains Mono" font-weight="700" font-size="15.5" text-anchor="middle">
            #${numStr} ${piece.name.toUpperCase()} · ${offW.toFixed(1)} × ${offH.toFixed(1)} MM
          </text>
        </g>
      `;
    }
  });

  // 2. Render Layer 03: EXTERIOR PERIMETER CUT LAYER (03_CUT_EXTERIOR_PERIMETER)
  if (state.showLayerExterior && currentCncAnalysis) {
    html += `<g id="VIEW_LAYER_03_EXTERIOR" pointer-events="none">`;
    currentCncAnalysis.exteriorPolylines.forEach((chain) => {
      const d = openPolylineToSvgPath(chain);
      html += `<path d="${d}" fill="none" stroke="#1B4D89" stroke-width="${isNarrow ? 4 : 6}" stroke-linecap="square" />`;
    });
    html += `</g>`;
  }

  // 3. Render Layer 01 & 02: SHARED INTERIOR SINGLE-PASS CUT LAYER (01_CUT_INTERIOR_SHARED + 02_CUT_INTERIOR_HOLES)
  if (state.showLayerInterior && currentCncAnalysis) {
    const kerfBandW = Math.max(state.kerfWidth, isNarrow ? 2.5 : 4.0);
    html += `<g id="VIEW_LAYER_01_INTERIOR_SHARED" pointer-events="none">`;
    currentCncAnalysis.interiorSharedPolylines.forEach((chain) => {
      const d = openPolylineToSvgPath(chain);
      if (state.kerfWidth > 0.1) {
        html += `<path d="${d}" fill="none" stroke="rgba(200, 50, 40, 0.28)" stroke-width="${kerfBandW.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" />`;
      }
      html += `<path d="${d}" fill="none" stroke="#C83228" stroke-width="${isNarrow ? 2.4 : 3.5}" stroke-linecap="round" stroke-linejoin="round" />`;
    });
    currentCncAnalysis.interiorHoleLoops.forEach(({ pts }) => {
      const d = pointsToSvgPath(pts, null);
      html += `<path d="${d}" fill="none" stroke="#C83228" stroke-width="${isNarrow ? 2.4 : 3.5}" stroke-dasharray="8,4" />`;
    });
    html += `</g>`;
  }

  html += selectedCalloutHtml;

  if (L === 2440 && W === 2440) {
    html += `
      <g pointer-events="none">
        <line x1="${-L / 2}" y1="0" x2="${L / 2}" y2="0" stroke="#B38B6D" stroke-width="8" stroke-dasharray="18,10" />
        <rect x="-320" y="-22" width="640" height="44" fill="#141414" stroke="#B38B6D" stroke-width="3" />
        <text x="0" y="2" fill="#FFFFFF" font-family="JetBrains Mono" font-weight="700" font-size="18" text-anchor="middle" dominant-baseline="middle">
          SEAM: 2 × STANDARD SHEETS 122×244 CM (2440×1220 MM)
        </text>
      </g>
    `;
  }

  handles.forEach((h) => {
    const sx = h.x;
    const sy = -h.y;
    html += `
      <g class="svg-handle-group" data-handle-id="${h.id}">
        <circle
          cx="${sx}"
          cy="${sy}"
          r="24"
          fill="rgba(179, 139, 109, 0.28)"
          stroke="#141414"
          stroke-width="2.5"
          stroke-dasharray="6,4"
          pointer-events="none"
        />
        <circle
          class="svg-handle"
          data-handle-id="${h.id}"
          cx="${sx}"
          cy="${sy}"
          r="14"
          fill="#B38B6D"
          stroke="#141414"
          stroke-width="4"
        >
          <title>${h.label}</title>
        </circle>
      </g>
    `;
  });

  svgEl.innerHTML = html;

  svgEl.querySelectorAll('.svg-piece').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (isPanning2D) return;
      e.stopPropagation();
      selectPiece(el.getAttribute('data-piece-id'));
    });
  });

  svgEl.querySelectorAll('.svg-handle').forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const hId = el.getAttribute('data-handle-id');
      activeHandle = handles.find((h) => h.id === hId);
      svgEl.setPointerCapture(e.pointerId);
    });
  });
}

// 2D WHEEL ZOOM & DRAG PAN ON CUTTING PLAN
svgEl.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    const oldZoom = state.zoom2D;
    const newZoom = clamp(oldZoom * factor, 0.75, 8.0);
    if (Math.abs(newZoom - oldZoom) < 1e-4) return;

    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgEl.getScreenCTM();
    if (ctm) {
      const cursor = pt.matrixTransform(ctm.inverse());
      const ratio = 1 - oldZoom / newZoom;
      state.pan2D[0] += (cursor.x - state.pan2D[0]) * ratio;
      state.pan2D[1] += (cursor.y - state.pan2D[1]) * ratio;
    }
    state.zoom2D = newZoom;
    if (newZoom <= 1.02) {
      state.pan2D = [0, 0];
    }
    updateSvgViewBox2D();
  },
  { passive: false }
);

svgEl.addEventListener('pointerdown', (e) => {
  if (activeHandle) return;
  if (e.target.closest('.svg-handle')) return;
  isPanning2D = false;
  panStartClient = [e.clientX, e.clientY];
  panStartOffset = [...state.pan2D];

  const onMove = (ev) => {
    const dxPx = ev.clientX - panStartClient[0];
    const dyPx = ev.clientY - panStartClient[1];
    if (Math.hypot(dxPx, dyPx) > 5) {
      isPanning2D = true;
      svgEl.classList.add('is-panning');
      const rect = svgEl.getBoundingClientRect();
      const L = state.sheetL + 330;
      const W = state.sheetW + 330;
      const scaleX = L / state.zoom2D / Math.max(1, rect.width);
      const scaleY = W / state.zoom2D / Math.max(1, rect.height);
      const scale = Math.max(scaleX, scaleY);
      state.pan2D = [panStartOffset[0] - dxPx * scale, panStartOffset[1] - dyPx * scale];
      updateSvgViewBox2D();
    }
  };

  const onUp = () => {
    svgEl.classList.remove('is-panning');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    setTimeout(() => {
      isPanning2D = false;
    }, 30);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

svgEl.addEventListener('pointermove', (e) => {
  if (!activeHandle) return;
  const pt = svgEl.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const cursor = pt.matrixTransform(svgEl.getScreenCTM().inverse());
  activeHandle.onDrag(cursor.x, -cursor.y);
  syncDynamicSlidersUI();
  rebuildSceneAndSheet();
});

svgEl.addEventListener('pointerup', () => {
  activeHandle = null;
});

document.getElementById('btnZoomIn2D').addEventListener('click', () => {
  state.zoom2D = clamp(state.zoom2D * 1.28, 0.75, 8.0);
  updateSvgViewBox2D();
});

document.getElementById('btnZoomOut2D').addEventListener('click', () => {
  state.zoom2D = clamp(state.zoom2D / 1.28, 0.75, 8.0);
  if (state.zoom2D <= 1.02) state.pan2D = [0, 0];
  updateSvgViewBox2D();
});

document.getElementById('btnZoomReset2D').addEventListener('click', () => {
  state.zoom2D = 1.0;
  state.pan2D = [0, 0];
  updateSvgViewBox2D();
});

const btnToggleDims2D = document.getElementById('btnToggleDims2D');
btnToggleDims2D.addEventListener('click', () => {
  state.showDims2D = !state.showDims2D;
  btnToggleDims2D.classList.toggle('active', state.showDims2D);
  rebuildSceneAndSheet();
});

// ============================================================================
// BIDIRECTIONAL PART SELECTION & 3D FLOATING CALLOUT PIN
// ============================================================================
function selectPiece(pieceId) {
  state.selectedPieceId = state.selectedPieceId === pieceId ? null : pieceId;
  rebuildSceneAndSheet();
}

function updatePieceHUD() {
  const hud = document.getElementById('pieceHud');
  const pin3D = document.getElementById('pin3D');
  const idx = currentPiecesData.findIndex((p) => p.id === state.selectedPieceId);
  const piece = currentPiecesData[idx];

  if (!piece) {
    if (hud) hud.hidden = true;
    if (pin3D) pin3D.hidden = true;
    return;
  }

  const numStr = String(idx + 1).padStart(2, '0');
  const [nomW, nomH] = piece.nominalBox || [0, 0];
  const [offW, offH] = piece.offsetBox || [0, 0];
  const [dW, dH] = piece.offsetDelta || [0, 0];
  const kerfInfo = `Nominal: ${nomW.toFixed(1)}×${nomH.toFixed(1)} mm → Finished: ${offW.toFixed(1)}×${offH.toFixed(1)} mm (Δ ${dW.toFixed(1)} / ${dH.toFixed(1)} mm)`;

  if (hud) {
    hud.hidden = false;
    document.getElementById('hudColor').style.background = piece.color;
    document.getElementById('hudTitle').textContent = `#${numStr} ${piece.name} — ${kerfInfo}`;
    document.getElementById('hudDesc').textContent = piece.sharedWith;
  }

  if (pin3D) {
    pin3D.hidden = false;
    document.getElementById('pin3DTag').textContent = `PART #${numStr} ${piece.name.toUpperCase()}`;
  }
}

function update3DPinPosition() {
  const pin3D = document.getElementById('pin3D');
  if (!state.selectedPieceId || pin3D.hidden) return;
  const mesh = meshByPieceId.get(state.selectedPieceId);
  if (!mesh) return;

  mesh.geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  mesh.geometry.boundingBox.getCenter(center);
  mesh.localToWorld(center);

  center.project(camera);
  const rect = renderer.domElement.getBoundingClientRect();
  const x = (center.x * 0.5 + 0.5) * rect.width;
  const y = (-(center.y * 0.5) + 0.5) * rect.height;

  pin3D.style.left = `${x}px`;
  pin3D.style.top = `${y}px`;
}

// ============================================================================
// 3D RAYCASTING
// ============================================================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 6) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(furnitureGroup.children, false);

  if (intersects.length > 0) {
    const hitPieceId = intersects[0].object.userData.pieceId;
    if (hitPieceId) selectPiece(hitPieceId);
  } else {
    selectPiece(null);
  }
});

// ============================================================================
// UI CONTROLS & DESIGN-SPECIFIC SLIDERS + CNC KERF & LAYER TOGGLES
// ============================================================================
function buildDynamicSlidersUI() {
  const cfg = TYPOLOGY_CONFIG[state.typology];
  document.getElementById('typologyHint').textContent = cfg.hint;

  const container = document.getElementById('dynamicSliders');
  const pObj = state.params[state.typology];

  container.innerHTML = cfg.sliders
    .map((s) => {
      const val = pObj[s.key];
      const formatted = `${val}${s.unit}`;
      return `
        <div class="control-group">
          <div class="control-label">
            <label>${s.label}</label>
            <span class="val-display" id="dynVal_${s.key}">${formatted}</span>
          </div>
          <input
            type="range"
            data-param-key="${s.key}"
            data-unit="${s.unit}"
            min="${s.min}"
            max="${s.max}"
            step="${s.step}"
            value="${val}"
          />
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('input[type="range"]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.getAttribute('data-param-key');
      const unit = input.getAttribute('data-unit');
      const v = parseFloat(input.value);
      state.params[state.typology][key] = v;
      document.getElementById(`dynVal_${key}`).textContent = `${v}${unit}`;
      rebuildSceneAndSheet();
    });
  });
}

function syncDynamicSlidersUI() {
  const cfg = TYPOLOGY_CONFIG[state.typology];
  const pObj = state.params[state.typology];
  cfg.sliders.forEach((s) => {
    const input = document.querySelector(`input[data-param-key="${s.key}"]`);
    const label = document.getElementById(`dynVal_${s.key}`);
    if (input && label) {
      const v = pObj[s.key];
      input.value = v;
      label.textContent = `${v}${s.unit}`;
    }
  });
}

const sliderThickness = document.getElementById('sliderThickness');
const btnToggleLayerExt = document.getElementById('btnToggleLayerExt');
const btnToggleLayerInt = document.getElementById('btnToggleLayerInt');
const btnToggleLayerOff = document.getElementById('btnToggleLayerOff');

function syncKerfDisplay() {
  if (![6, 10, 12].includes(Math.round(state.kerfWidth))) {
    state.kerfWidth = 6;
  }
  const rel = state.kerfWidth / 2;
  const valKerfEl = document.getElementById('valKerf');
  if (valKerfEl) {
    valKerfEl.textContent = `${state.kerfWidth.toFixed(0)} mm (-${rel.toFixed(1)} mm/edge)`;
  }
  document.querySelectorAll('#bitFixedButtons [data-bit]').forEach((btn) => {
    const bVal = parseFloat(btn.getAttribute('data-bit'));
    btn.classList.toggle('active', Math.abs(bVal - state.kerfWidth) < 0.2);
  });
}

sliderThickness.addEventListener('input', () => {
  state.thickness = parseFloat(sliderThickness.value);
  document.getElementById('valThickness').textContent = `${state.thickness} mm`;
  rebuildSceneAndSheet();
});

document.querySelectorAll('#bitFixedButtons [data-bit]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.kerfWidth = parseFloat(btn.getAttribute('data-bit')) || 6;
    syncKerfDisplay();
    rebuildSceneAndSheet();
  });
});

btnToggleLayerExt.addEventListener('click', () => {
  state.showLayerExterior = !state.showLayerExterior;
  btnToggleLayerExt.classList.toggle('active', state.showLayerExterior);
  rebuildSceneAndSheet();
});

btnToggleLayerInt.addEventListener('click', () => {
  state.showLayerInterior = !state.showLayerInterior;
  btnToggleLayerInt.classList.toggle('active', state.showLayerInterior);
  rebuildSceneAndSheet();
});

btnToggleLayerOff.addEventListener('click', () => {
  state.showLayerOffsets = !state.showLayerOffsets;
  btnToggleLayerOff.classList.toggle('active', state.showLayerOffsets);
  rebuildSceneAndSheet();
});

function setArchitecturalCamera() {
  if (state.typology === 'curvedWall' || state.typology === 'shelf') {
    camera.position.set(1650, 1250, 2000);
    controls.target.set(0, 720, 0);
  } else {
    camera.position.set(1450, 1050, 1650);
    controls.target.set(0, 320, 0);
  }
  controls.update();
}

document.querySelectorAll('.type-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.typology = btn.getAttribute('data-type');
    state.selectedPieceId = null;
    state.zoom2D = 1.0;
    state.pan2D = [0, 0];

    buildDynamicSlidersUI();
    rebuildSceneAndSheet();
    setArchitecturalCamera();
  });
});

document.getElementById('btnResetParams').addEventListener('click', () => {
  state.params[state.typology] = JSON.parse(
    JSON.stringify(defaultParamsBackup[state.typology])
  );
  state.zoom2D = 1.0;
  state.pan2D = [0, 0];
  buildDynamicSlidersUI();
  rebuildSceneAndSheet();
});

const btnResetCam = document.getElementById('btnResetCamera');
if (btnResetCam) {
  btnResetCam.addEventListener('click', () => setArchitecturalCamera());
}

// ============================================================================
// SHAREABLE DESIGN LINK GENERATOR & URL STATE RESTORATION
// ============================================================================
function generateShareableURL(openShopPlan = false) {
  const url = new URL(window.location.href);
  url.searchParams.set('type', state.typology);
  url.searchParams.set('th', String(state.thickness));
  url.searchParams.set('kerf', String(state.kerfWidth));
  url.searchParams.set('kmode', state.kerfMode);
  url.searchParams.set('fcomp', state.fitCompMode);
  url.searchParams.set('mat', state.materialMode);
  url.searchParams.set('asm', String(Math.round(state.assembly * 100)));
  if (openShopPlan) {
    url.searchParams.set('shop', '1');
  } else {
    url.searchParams.delete('shop');
  }
  const pObj = state.params[state.typology];
  for (const [k, v] of Object.entries(pObj)) {
    url.searchParams.set(`p_${k}`, String(v));
  }
  return url.toString();
}

let shouldAutoOpenShopFromURL = false;

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('type');
  if (t && TYPOLOGY_CONFIG[t]) {
    state.typology = t;
    document.querySelectorAll('.type-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-type') === t);
    });
  }
  const th = parseFloat(params.get('th'));
  if (!Number.isNaN(th) && th >= 12 && th <= 40) {
    state.thickness = th;
    sliderThickness.value = String(th);
    document.getElementById('valThickness').textContent = `${th} mm`;
  }
  const kf = parseFloat(params.get('kerf'));
  if (!Number.isNaN(kf) && [6, 10, 12].includes(Math.round(kf))) {
    state.kerfWidth = Math.round(kf);
  }
  syncKerfDisplay();

  const mat = params.get('mat');
  if (mat) {
    state.materialMode = mat;
    const sel = document.getElementById('selectMaterial');
    if (sel) sel.value = mat;
  }
  state.assembly = 1.0;
  const pObj = state.params[state.typology];
  if (pObj) {
    for (const key of Object.keys(pObj)) {
      const pv = parseFloat(params.get(`p_${key}`));
      if (!Number.isNaN(pv)) {
        pObj[key] = pv;
      }
    }
  }
  if (params.get('shop') === '1') {
    shouldAutoOpenShopFromURL = true;
  }
}

const shareToast = document.getElementById('shareToast');
const shareLinkInput = document.getElementById('shareLinkInput');

function copyAndShowShareToast(urlStr) {
  window.history.replaceState({}, '', urlStr);
  shareLinkInput.value = urlStr;
  shareToast.hidden = false;
  shareLinkInput.select();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(urlStr).catch(() => {});
  }
}

document.getElementById('btnShareLink').addEventListener('click', () => {
  copyAndShowShareToast(generateShareableURL(false));
});

document.getElementById('btnCloseToast').addEventListener('click', () => {
  shareToast.hidden = true;
});

// ============================================================================
// ARCHITECTURAL SHOP DRAWING PLANS, MULTI-PLAN SECTIONS & VECTOR PDF GENERATOR
// ============================================================================
const shopDrawingModal = document.getElementById('shopDrawingModal');
const shopDrawingSheet = document.getElementById('shopDrawingSheet');

function getOrthonormalPieceBasis(piece) {
  const uRaw = piece.assembled.uAxis || piece.assembled.u || [1, 0, 0];
  const vRaw = piece.assembled.vAxis || piece.assembled.v || [0, 1, 0];
  const uVec = new THREE.Vector3(...uRaw).normalize();
  const vVec = new THREE.Vector3(...vRaw).normalize();
  vVec.sub(uVec.clone().multiplyScalar(uVec.dot(vVec))).normalize();
  const wVec = new THREE.Vector3().crossVectors(uVec, vVec).normalize();
  return {
    u: [uVec.x, uVec.y, uVec.z],
    v: [vVec.x, vVec.y, vVec.z],
    w: [wVec.x, wVec.y, wVec.z]
  };
}

function computePiece3DBoundingBoxes(pieces, T) {
  return pieces.map((p, idx) => {
    const pts = p.offsetPoints2D || p.points2D;
    const [cx, cy] = p.compensatedPivot2D || p.assembled.pivot2D;

    const { u, v, w } = getOrthonormalPieceBasis(p);
    const pos = p.compensatedPos3D || p.assembled.pos3D;
    const halfT = T / 2;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    pts.forEach(([px, py]) => {
      const lx = px - cx;
      const ly = py - cy;
      for (const lz of [-halfT, halfT]) {
        const wx = pos[0] + lx * u[0] + ly * v[0] + lz * w[0];
        const wy = pos[1] + lx * u[1] + ly * v[1] + lz * w[1];
        const wz = pos[2] + lx * u[2] + ly * v[2] + lz * w[2];
        if (wx < minX) minX = wx;
        if (wx > maxX) maxX = wx;
        if (wy < minY) minY = wy;
        if (wy > maxY) maxY = wy;
        if (wz < minZ) minZ = wz;
        if (wz > maxZ) maxZ = wz;
      }
    });

    // Also compute top face 3D polygon vertices (lz = +halfT) for accurate oblique projections
    const topLoop3D = pts.map(([px, py]) => {
      const lx = px - cx;
      const ly = py - cy;
      return [
        pos[0] + lx * u[0] + ly * v[0] + halfT * w[0],
        pos[1] + lx * u[1] + ly * v[1] + halfT * w[1],
        pos[2] + lx * u[2] + ly * v[2] + halfT * w[2]
      ];
    });

    return {
      idx,
      numStr: String(idx + 1).padStart(2, '0'),
      piece: p,
      u,
      v,
      w,
      minX,
      maxX,
      minY,
      maxY,
      minZ,
      maxZ,
      midX: (minX + maxX) / 2,
      midY: (minY + maxY) / 2,
      midZ: (minZ + maxZ) / 2,
      spanX: maxX - minX,
      spanY: maxY - minY,
      spanZ: maxZ - minZ,
      topLoop3D
    };
  });
}

function getTypologyPlanSectionLevels(typology, summaryDims) {
  const H = summaryDims.height;
  switch (typology) {
    case 'chair':
      return {
        yA: 560,
        labelA: 'SECCIÓN EN PLANTA A-A (Y = +560 MM · ARMRESTS & BACKREST)',
        subA: 'Upper horizontal plan section cutting through Left & Right Armrest Panels #04–#05 and Reclined Backrest #02',
        yB: 420,
        labelB: 'SECCIÓN EN PLANTA B-B (Y = +420 MM · SEAT TENON & MORTISE JOINT)',
        subB: 'Mid horizontal plan section cutting through Seat Panel #01 Tenon Tooth locked inside Backrest Mortise #02 & Key #06',
        yC: 210,
        labelC: 'SECCIÓN EN PLANTA C-C (Y = +210 MM · LOWER APRON & REAR SPINE)',
        subC: 'Lower horizontal plan section cutting through Front Support Apron #03, Rear Vertical Spine #02 & Side Walls #04–#05'
      };
    case 'cabinet': {
      const cabH = state.params.cabinet.cabinetHeight || H;
      const plinthH = Math.round(cabH * 0.30);
      const upperBayY = Math.round(plinthH + (cabH - plinthH) * 0.72);
      const midShelfY = Math.round(plinthH + (cabH - plinthH) * 0.36);
      const lowerPlinthY = Math.round(plinthH * 0.5);
      return {
        yA: upperBayY,
        labelA: `SECCIÓN EN PLANTA A-A (Y = +${upperBayY} MM · 25MM INSET DOORS & UPPER REAR BRACE)`,
        subA: `Upper horizontal cut through Outer Frame Walls #03–#04, 25mm Inset Doors #05–#06, Central Partition & Upper Rear Brace #11`,
        yB: midShelfY,
        labelB: `SECCIÓN EN PLANTA B-B (Y = +${midShelfY} MM · RECESSED INTERIOR SHELVES #07–#08)`,
        subB: `Mid horizontal cut showing the 4 Recessed Interior Shelves (-${state.params.cabinet.shelfRecess}mm setback) behind the 25mm Inset Doors`,
        yC: lowerPlinthY,
        labelC: `SECCIÓN EN PLANTA C-C (Y = +${lowerPlinthY} MM · OPEN PLINTH & LOWER REINFORCEMENT)`,
        subC: `Lower horizontal cut through Outer Frame Walls #03–#04, Open Plinth Bay & Lower Rear Reinforcement Rail #12`
      };
    }
    case 'shelf': {
      const sp = state.params.shelf.tierSpacing || 300;
      const yA = Math.min(H - 60, 70 + sp * 3 + 30);
      const yB = Math.min(H - 120, 70 + sp * 1 + 40);
      const yC = 85;
      return {
        yA,
        labelA: `SECCIÓN EN PLANTA A-A (Y = +${yA} MM · UPPER CHEVRON ZIG-ZAG PROFILE)`,
        subA: 'Upper horizontal plan section through Solid Vertical Chevron Fins (0 holes) & Upper Segmented Shelf Bays ("Trozos")',
        yB,
        labelB: `SECCIÓN EN PLANTA B-B (Y = +${yB} MM · MID TIER SEGMENTED BAYS)`,
        subB: 'Mid horizontal plan section cutting through Chevron Peak/Valley offset & Intermediate Segmented Shelf Bays',
        yC,
        labelC: `SECCIÓN EN PLANTA C-C (Y = +${yC} MM · BASE TIER 01 & FOOTPRINT)`,
        subC: 'Lower horizontal plan section cutting through Tier 01 Segmented Bays & Base Footprint of Solid Chevron Fins'
      };
    }
    case 'stool': {
      const yA = Math.round(H * 0.78);
      const yB = Math.round(H * (state.params.stool.shelfHeightRatio || 50) / 100);
      const yC = Math.round(H * 0.20);
      return {
        yA,
        labelA: `SECCIÓN EN PLANTA A-A (Y = +${yA} MM · UPPER VAULTED ARCH RIBS)`,
        subA: 'Upper horizontal cut beneath Circular Seat Disc #01 through the 4 Vaulted Arch Legs #02–#05',
        yB,
        labelB: `SECCIÓN EN PLANTA B-B (Y = +${yB} MM · 4 TRIANGULAR CORNER SHELF GUSSETS)`,
        subB: 'Mid horizontal cut through the 4 Rounded Triangular Corner Shelf Gussets #06–#09 & Interlocking Legs',
        yC,
        labelC: `SECCIÓN EN PLANTA C-C (Y = +${yC} MM · LOWER VAULT OPENING & LEG FOOTPRINT)`,
        subC: 'Lower horizontal cut showing the 4 outer floor leg contact pads and central vaulted arch opening'
      };
    }
    default: {
      const yA = Math.round(H * 0.78);
      const yB = Math.round(H * 0.48);
      const yC = Math.round(H * 0.20);
      return {
        yA,
        labelA: `SECCIÓN EN PLANTA A-A (Y = +${yA} MM · UPPER APRON & CROWN JOINT)`,
        subA: 'Upper horizontal plan section right below the tabletop/crown interlocking joint',
        yB,
        labelB: `SECCIÓN EN PLANTA B-B (Y = +${yB} MM · MID STRUCTURAL LEG SECTION)`,
        subB: 'Mid-height horizontal plan section cutting through the interlocking structural legs',
        yC,
        labelC: `SECCIÓN EN PLANTA C-C (Y = +${yC} MM · LOWER FLOOR FOOTPRINT)`,
        subC: 'Lower horizontal plan section cutting near the floor datum (+0.00 mm) support footprint'
      };
    }
  }
}

function drawSvgCotaH(x1, x2, y, labelText, color = '#C83228', tickDir = 1) {
  if (Math.abs(x2 - x1) < 6) return '';
  const xm = (x1 + x2) / 2;
  const ty = y + (tickDir > 0 ? 11 : -5);
  return `
    <g class="arch-cota-h">
      <line x1="${x1.toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${x1.toFixed(1)}" y2="${(y + 4).toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <line x1="${x2.toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${(y + 4).toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <text x="${xm.toFixed(1)}" y="${ty.toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8.8" fill="${color}" text-anchor="middle">${labelText}</text>
    </g>
  `;
}

function drawSvgCotaV(x, y1, y2, labelText, color = '#1B4D89', side = 'left') {
  if (Math.abs(y2 - y1) < 6) return '';
  const ym = (y1 + y2) / 2;
  const tx = side === 'left' ? x - 6 : x + 8;
  return `
    <g class="arch-cota-v">
      <line x1="${(x - 4).toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x + 4).toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <line x1="${(x - 4).toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(x + 4).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.3" />
      <text x="${tx.toFixed(1)}" y="${ym.toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8.8" fill="${color}" text-anchor="middle" transform="rotate(-90 ${tx.toFixed(1)} ${ym.toFixed(1)})">${labelText}</text>
    </g>
  `;
}

function buildHorizontalPlanOrSectionSvg(boxes3D, summaryDims, mode, cutY, patternId) {
  const T = state.thickness;
  // Global XZ bounds across all furniture pieces
  let gMinX = Infinity;
  let gMaxX = -Infinity;
  let gMinZ = Infinity;
  let gMaxZ = -Infinity;
  boxes3D.forEach((b) => {
    if (b.minX < gMinX) gMinX = b.minX;
    if (b.maxX > gMaxX) gMaxX = b.maxX;
    if (b.minZ < gMinZ) gMinZ = b.minZ;
    if (b.maxZ > gMaxZ) gMaxZ = b.maxZ;
  });
  if (!Number.isFinite(gMinX)) {
    gMinX = -300;
    gMaxX = 300;
    gMinZ = -250;
    gMaxZ = 250;
  }

  const spanX = Math.max(120, gMaxX - gMinX);
  const spanZ = Math.max(120, gMaxZ - gMinZ);
  const svgW = 380;
  const svgH = 265;
  const padX = 58;
  const padY = 48;
  const scale = Math.min((svgW - padX * 2) / spanX, (svgH - padY * 2) / spanZ);

  const cxWorld = (gMinX + gMaxX) / 2;
  const czWorld = (gMinZ + gMaxZ) / 2;
  const mapX = (wx) => svgW / 2 + (wx - cxWorld) * scale;
  const mapZ = (wz) => svgH / 2 + (wz - czWorld) * scale;

  const xLeft = mapX(gMinX);
  const xRight = mapX(gMaxX);
  const zBack = mapZ(gMinZ);
  const zFront = mapZ(gMaxZ);

  // Filter & sort pieces for this plan/section level
  const visibleBoxes = boxes3D
    .filter((b) => {
      if (mode === 'top') return true;
      // For horizontal section at cutY, include pieces that are sliced by cutY or lie below cutY
      return b.minY <= cutY + 12;
    })
    .sort((a, b) => a.midY - b.midY);

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="245" style="background:#FAF8F3;border:1px solid #D8D3C8;display:block;">
    <defs>
      <pattern id="${patternId}" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#141414" stroke-width="1.3" />
      </pattern>
    </defs>
    <!-- Center Axis Lines -->
    <line x1="${mapX(0).toFixed(1)}" y1="14" x2="${mapX(0).toFixed(1)}" y2="${svgH - 14}" stroke="#CFCBC2" stroke-width="0.9" stroke-dasharray="4,3" />
    <line x1="14" y1="${mapZ(0).toFixed(1)}" x2="${svgW - 14}" y2="${mapZ(0).toFixed(1)}" stroke="#CFCBC2" stroke-width="0.9" stroke-dasharray="4,3" />
    <text x="${svgW / 2}" y="${svgH - 5}" font-family="JetBrains Mono" font-size="8" fill="#666" text-anchor="middle">FRONT FACE (+Z) ▼ · REAR FACE (-Z) ▲</text>
  `;

  // Draw pieces below the cut plane first, then sectioned pieces on top
  const belowPieces = [];
  const cutPieces = [];
  visibleBoxes.forEach((b) => {
    const isCut = mode !== 'top' && b.minY <= cutY + 4 && b.maxY >= cutY - 4;
    if (isCut) cutPieces.push(b);
    else belowPieces.push(b);
  });

  const renderPlanPiece = (b, isCut) => {
    const rx = mapX(b.minX);
    const rz = mapZ(b.minZ);
    const rw = Math.max(2.5, (b.maxX - b.minX) * scale);
    const rh = Math.max(2.5, (b.maxZ - b.minZ) * scale);
    const isSel = state.selectedPieceId === b.piece.id;
    const strokeCol = isSel ? '#C83228' : '#141414';
    const strokeW = isSel ? '2.8' : isCut ? '2' : '1.2';

    let out = `<g class="arch-svg-piece" data-piece-id="${b.piece.id}" style="cursor:pointer;">`;
    if (isCut) {
      out += `<rect x="${rx.toFixed(1)}" y="${rz.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${isSel ? '#FFD599' : b.piece.color}" fill-opacity="${isSel ? '0.88' : '0.58'}" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
      out += `<rect x="${rx.toFixed(1)}" y="${rz.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="url(#${patternId})" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
    } else {
      const op = isSel ? 0.78 : mode === 'top' ? 0.36 : 0.22;
      out += `<rect x="${rx.toFixed(1)}" y="${rz.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${isSel ? '#FFD599' : b.piece.color}" fill-opacity="${op}" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
    }

    if (rw > 18 && rh > 12) {
      const tx = rx + rw / 2;
      const ty = rz + rh / 2 + 3;
      out += `<rect x="${(tx - 11).toFixed(1)}" y="${(ty - 9).toFixed(1)}" width="22" height="12" fill="${isSel ? '#C83228' : '#FFFFFF'}" fill-opacity="0.94" stroke="#141414" stroke-width="0.9" />`;
      out += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="${isSel ? '#FFFFFF' : '#141414'}" text-anchor="middle">#${b.numStr}</text>`;
    } else if (isCut && (rw > 22 || rh > 22)) {
      const tx = rx + rw / 2;
      const ty = rz + rh / 2 + 2.5;
      out += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="7.5" fill="#C83228" text-anchor="middle">#${b.numStr}</text>`;
    }
    out += `</g>`;
    return out;
  };

  belowPieces.forEach((b) => {
    s += renderPlanPiece(b, false);
  });
  cutPieces.forEach((b) => {
    s += renderPlanPiece(b, true);
  });

  // Overall Exterior Plan Width (W) and Depth (D) Cotas
  s += drawSvgCotaH(xLeft, xRight, zBack - 16, `W: ${Math.round(spanX)} mm`, '#C83228', -1);
  s += drawSvgCotaV(xLeft - 16, zBack, zFront, `D: ${Math.round(spanZ)} mm`, '#1B4D89', 'left');

  // Interior / Typology-Specific Horizontal Plan Section Cotas
  if (state.typology === 'cabinet') {
    const netInW = Math.round(spanX - 2 * T);
    const bayW = Math.round((spanX - 3 * T) / 2);
    const recess = state.params.cabinet.shelfRecess || 80;
    s += drawSvgCotaH(mapX(gMinX + T), mapX(-T / 2), zFront + 15, `BAY L: ${bayW} mm`, '#1E6B45', 1);
    s += drawSvgCotaH(mapX(T / 2), mapX(gMaxX - T), zFront + 15, `BAY R: ${bayW} mm`, '#1E6B45', 1);
    if (mode === 'secA') {
      s += `<text x="${svgW - 10}" y="18" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="#1E6B45" text-anchor="end">DOOR INSET: 25mm · REAR BRACE #11</text>`;
    } else if (mode === 'secB') {
      s += `<text x="${svgW - 10}" y="18" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="#1E6B45" text-anchor="end">SHELF SETBACK: -${recess}mm · DOOR 25mm</text>`;
    } else if (mode === 'secC') {
      s += `<text x="${svgW - 10}" y="18" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="#1E6B45" text-anchor="end">PLINTH SPAN: ${netInW}mm · REAR RAIL #12</text>`;
    }
  } else if (state.typology === 'shelf') {
    const nFins = state.params.shelf.uprightPairs * 2;
    const nBays = nFins - 1;
    const seg = boxes3D.find((b) => b.piece.id.startsWith('shelf_'));
    const baySpan = seg ? Math.round(seg.spanX) : Math.round((spanX - nFins * T) / nBays);
    s += drawSvgCotaH(xLeft, xRight, zFront + 15, `${nBays} BAYS × ${baySpan} mm + ${nFins} FINS (${T}mm)`, '#1E6B45', 1);
  } else if (state.typology === 'chair') {
    const netSeatW = Math.round(spanX - 2 * T);
    s += drawSvgCotaH(mapX(gMinX + T), mapX(gMaxX - T), zFront + 15, `INNER SEAT SPAN: ${netSeatW} mm`, '#1E6B45', 1);
    if (mode === 'secB') {
      s += `<text x="${svgW - 10}" y="18" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="#1E6B45" text-anchor="end">TENON WIDTH: ${state.params.chair.toothWidth} mm · T=${T}mm</text>`;
    }
  } else {
    const netIn = Math.round(spanX - 2 * T);
    if (netIn > 40) {
      s += drawSvgCotaH(mapX(gMinX + T), mapX(gMaxX - T), zFront + 15, `CORE SPAN: ${netIn} mm (T=${T}mm)`, '#1E6B45', 1);
    }
  }

  // If Top Plan view, draw section cut lines D-D (Longitudinal) and E-E (Transversal)
  if (mode === 'top') {
    const yMidZ = mapZ(0);
    const xMidX = mapX(0);
    s += `
      <line x1="${(xLeft - 10).toFixed(1)}" y1="${yMidZ.toFixed(1)}" x2="${(xRight + 10).toFixed(1)}" y2="${yMidZ.toFixed(1)}" stroke="#C83228" stroke-width="1.2" stroke-dasharray="6,3" />
      <text x="${(xRight + 13).toFixed(1)}" y="${(yMidZ + 3).toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8.5" fill="#C83228">D-D</text>
      <line x1="${xMidX.toFixed(1)}" y1="${(zBack - 8).toFixed(1)}" x2="${xMidX.toFixed(1)}" y2="${(zFront + 8).toFixed(1)}" stroke="#1B4D89" stroke-width="1.2" stroke-dasharray="6,3" />
      <text x="${(xMidX + 4).toFixed(1)}" y="${(zFront + 14).toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8.5" fill="#1B4D89">E-E</text>
    `;
  }

  s += `</svg>`;
  return s;
}

function buildVerticalSectionSvg(boxes3D, summaryDims, planeMode, levels, patternId) {
  const T = state.thickness;
  // planeMode === 'front_DD' (XY longitudinal section) or 'side_EE' (ZY cross-section at X = 0)
  const isFront = planeMode === 'front_DD' || planeMode === 'front_CC';
  let gMinH = Infinity;
  let gMaxH = -Infinity;
  let gMinY = 0;
  let gMaxY = -Infinity;

  boxes3D.forEach((b) => {
    const hMin = isFront ? b.minX : b.minZ;
    const hMax = isFront ? b.maxX : b.maxZ;
    if (hMin < gMinH) gMinH = hMin;
    if (hMax > gMaxH) gMaxH = hMax;
    if (b.maxY > gMaxY) gMaxY = b.maxY;
  });
  if (!Number.isFinite(gMinH)) {
    gMinH = -300;
    gMaxH = 300;
    gMaxY = 750;
  }

  const spanH = Math.max(120, gMaxH - gMinH);
  const spanY = Math.max(120, gMaxY - gMinY);
  const svgW = 540;
  const svgH = 290;
  const padX = 82;
  const padY = 46;
  const scale = Math.min((svgW - padX * 2) / spanH, (svgH - padY * 2) / spanY);

  const chWorld = (gMinH + gMaxH) / 2;
  const mapH = (wh) => svgW / 2 + (wh - chWorld) * scale;
  const floorY = svgH - 36;
  const mapY = (wy) => floorY - wy * scale;

  const hLeft = mapH(gMinH);
  const hRight = mapH(gMaxH);
  const yTop = mapY(gMaxY);

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="275" style="background:#FAF8F3;border:1px solid #D8D3C8;display:block;">
    <defs>
      <pattern id="${patternId}" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#141414" stroke-width="1.3" />
      </pattern>
    </defs>
    <!-- Floor Datum Line -->
    <line x1="24" y1="${floorY}" x2="${svgW - 24}" y2="${floorY}" stroke="#141414" stroke-width="2" />
    <text x="28" y="${floorY + 13}" font-family="JetBrains Mono" font-weight="700" font-size="8.5" fill="#555">FLOOR DATUM ±0.00 MM</text>
  `;

  // Sort pieces back-to-front so foreground/sectioned parts draw cleanly
  const sorted = [...boxes3D].sort((a, b) =>
    isFront ? a.midZ - b.midZ : a.midX - b.midX
  );

  sorted.forEach((b) => {
    const isDoorInLongSection =
      isFront &&
      state.typology === 'cabinet' &&
      (b.piece.id === 'cab_door_l' || b.piece.id === 'cab_door_r');

    const isSliced =
      isFront
        ? b.minZ <= 5 && b.maxZ >= -5 && !isDoorInLongSection
        : b.minX <= 5 && b.maxX >= -5;

    const rx = mapH(isFront ? b.minX : b.minZ);
    const ry = mapY(b.maxY);
    const rw = Math.max(2.5, (isFront ? b.spanX : b.spanZ) * scale);
    const rh = Math.max(2.5, b.spanY * scale);
    const isSel = state.selectedPieceId === b.piece.id;
    const strokeCol = isSel ? '#C83228' : '#141414';
    const strokeW = isSel ? '2.8' : isSliced ? '2' : '1.2';

    if (isDoorInLongSection) {
      // Draw closed cabinet doors in phantom dashed outline so interior shelves & central partition are 100% visible!
      s += `<g class="arch-svg-piece" data-piece-id="${b.piece.id}" style="cursor:pointer;">
        <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="none" stroke="${isSel ? '#C83228' : '#808080'}" stroke-width="${isSel ? '2.2' : '1.2'}" stroke-dasharray="5,4" />
      </g>`;
      return;
    }

    const isObliqueSide =
      !isFront &&
      Math.abs(b.w[1]) > 0.15 &&
      Math.abs(b.w[2]) > 0.15;

    s += `<g class="arch-svg-piece" data-piece-id="${b.piece.id}" style="cursor:pointer;">`;
    if (isObliqueSide) {
      const polyPts = b.topLoop3D
        .map((pt) => `${mapH(pt[2]).toFixed(1)},${mapY(pt[1]).toFixed(1)}`)
        .join(' ');
      s += `<polygon points="${polyPts}" fill="${isSel ? '#FFD599' : b.piece.color}" fill-opacity="${isSel ? '0.88' : '0.6'}" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
      s += `<polygon points="${polyPts}" fill="url(#${patternId})" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
    } else if (isSliced) {
      s += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${isSel ? '#FFD599' : b.piece.color}" fill-opacity="${isSel ? '0.88' : '0.55'}" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
      s += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="url(#${patternId})" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
    } else {
      s += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${isSel ? '#FFD599' : b.piece.color}" fill-opacity="${isSel ? '0.78' : '0.24'}" stroke="${strokeCol}" stroke-width="${strokeW}" />`;
    }

    if (rw > 18 && rh > 12) {
      const tx = rx + rw / 2;
      const ty = ry + rh / 2 + 3;
      s += `<rect x="${(tx - 11).toFixed(1)}" y="${(ty - 9).toFixed(1)}" width="22" height="12" fill="${isSel ? '#C83228' : '#FFFFFF'}" fill-opacity="0.94" stroke="#141414" stroke-width="0.9" />`;
      s += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="8" fill="${isSel ? '#FFFFFF' : '#141414'}" text-anchor="middle">#${b.numStr}</text>`;
    }
    s += `</g>`;
  });

  // Draw Horizontal Plan Section Cut Datum Lines A-A, B-B, and C-C across both vertical sections!
  [
    { yVal: levels.yA, tag: 'A-A', col: '#1E6B45' },
    { yVal: levels.yB, tag: 'B-B', col: '#C83228' },
    { yVal: levels.yC, tag: 'C-C', col: '#8C674B' }
  ].forEach((lv) => {
    if (typeof lv.yVal === 'number' && lv.yVal > 10 && lv.yVal < gMaxY) {
      const py = mapY(lv.yVal);
      s += `
        <line x1="${(hLeft - 20).toFixed(1)}" y1="${py.toFixed(1)}" x2="${(hRight + 20).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${lv.col}" stroke-width="1.2" stroke-dasharray="6,3" />
        <rect x="${(hRight + 22).toFixed(1)}" y="${(py - 6.5).toFixed(1)}" width="56" height="13" fill="${lv.col}" />
        <text x="${(hRight + 50).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="7.8" fill="#FFFFFF" text-anchor="middle">${lv.tag} +${lv.yVal}</text>
      `;
    }
  });

  // Overall Horizontal & Vertical Dimension Cotas
  const hLabel = isFront
    ? `TOTAL WIDTH W: ${Math.round(spanH)} mm`
    : `TOTAL DEPTH D: ${Math.round(spanH)} mm`;
  s += drawSvgCotaH(hLeft, hRight, yTop - 16, hLabel, '#C83228', -1);
  s += drawSvgCotaV(hLeft - 22, yTop, floorY, `H: ${Math.round(spanY)} mm`, '#1B4D89', 'left');

  // Additional Typology-Specific Vertical & Internal Section Cotas
  if (state.typology === 'cabinet') {
    const cabH = Math.round(spanY);
    const plinthH = Math.round(cabH * 0.30);
    const midShelfY = Math.round(plinthH + (cabH - plinthH) * 0.52);
    if (isFront) {
      const bayW = Math.round((spanH - 3 * T) / 2);
      s += drawSvgCotaH(mapH(gMinH + T), mapH(-T / 2), floorY + 16, `LEFT BAY: ${bayW} mm`, '#1E6B45', 1);
      s += drawSvgCotaH(mapH(T / 2), mapH(gMaxH - T), floorY + 16, `RIGHT BAY: ${bayW} mm`, '#1E6B45', 1);
      s += drawSvgCotaV(hLeft - 8, mapY(plinthH), floorY, `PLINTH ${plinthH}`, '#1E6B45', 'left');
    } else {
      const recess = state.params.cabinet.shelfRecess || 80;
      const shelfD = Math.round(spanH - recess);
      s += drawSvgCotaH(hLeft, mapH(gMaxH - recess), floorY + 16, `SHELF D: ${shelfD} mm (-${recess}mm RECESS)`, '#1E6B45', 1);
      s += `<text x="${svgW - 14}" y="${floorY + 25}" font-family="JetBrains Mono" font-weight="700" font-size="8.5" fill="#C83228" text-anchor="end">FRONT DOOR RECESSED 25 MM INSIDE FRAME · SHELF TIER +${midShelfY} MM</text>`;
    }
  } else if (state.typology === 'shelf') {
    const sp = state.params.shelf.tierSpacing || 300;
    s += drawSvgCotaV(hLeft - 8, mapY(70 + sp), mapY(70), `PITCH ${sp}`, '#1E6B45', 'left');
    if (isFront) {
      const nFins = state.params.shelf.uprightPairs * 2;
      const seg = boxes3D.find((b) => b.piece.id.startsWith('shelf_'));
      const bayW = seg ? Math.round(seg.spanX) : Math.round((spanH - nFins * T) / (nFins - 1));
      s += drawSvgCotaH(mapH(gMinH + T), mapH(gMinH + T + bayW), floorY + 16, `CLEAR BAY: ${bayW} mm`, '#1E6B45', 1);
    }
  } else if (state.typology === 'chair') {
    s += drawSvgCotaV(hLeft - 8, mapY(420), floorY, `SEAT 420 mm`, '#1E6B45', 'left');
    if (!isFront) {
      s += `<text x="${svgW - 14}" y="${floorY + 24}" font-family="JetBrains Mono" font-weight="700" font-size="8.5" fill="#1E6B45" text-anchor="end">MORTISE &amp; TENON LOCK AT Y=420 MM · RECLINE ${state.params.chair.reclineDeg}°</text>`;
    }
  } else if (typeof summaryDims.primaryHeight === 'number' && summaryDims.primaryHeight < spanY) {
    s += drawSvgCotaV(hLeft - 8, mapY(summaryDims.primaryHeight), floorY, `${summaryDims.primaryHeight} mm`, '#1E6B45', 'left');
  }

  s += `</svg>`;
  return s;
}

function buildArchitecturalPlansAndSectionsHtml(pieces, summaryDims, cfg, T, K, relOffset) {
  const boxes3D = computePiece3DBoundingBoxes(pieces, T);
  const levels = getTypologyPlanSectionLevels(state.typology, summaryDims);

  const svgTopPlan = buildHorizontalPlanOrSectionSvg(boxes3D, summaryDims, 'top', summaryDims.height + 50, 'hatchTop');
  const svgPlanSecA = buildHorizontalPlanOrSectionSvg(boxes3D, summaryDims, 'secA', levels.yA, 'hatchSecA');
  const svgPlanSecB = buildHorizontalPlanOrSectionSvg(boxes3D, summaryDims, 'secB', levels.yB, 'hatchSecB');
  const svgPlanSecC = buildHorizontalPlanOrSectionSvg(boxes3D, summaryDims, 'secC', levels.yC, 'hatchSecC');

  const svgLongSecDD = buildVerticalSectionSvg(boxes3D, summaryDims, 'front_DD', levels, 'hatchSecDD');
  const svgCrossSecEE = buildVerticalSectionSvg(boxes3D, summaryDims, 'side_EE', levels, 'hatchSecEE');

  return `
    <div class="arch-plans-wrap">
      <div class="shop-view-title">
        <span>VIEW 02 // HORIZONTAL ARCHITECTURAL PLANS &amp; MULTI-LEVEL PLAN SECTIONS (PLANTA SUPERIOR + SECCIÓN A-A + SECCIÓN B-B + SECCIÓN C-C)</span>
        <span>TRUE 3D POST-KERF PROJECTION · ALL DIMENSIONS IN MM</span>
      </div>
      <div class="arch-plans-4col">
        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">02.1 // PLANTA SUPERIOR ACOTADA (TOP PLAN)</span>
            <span class="arch-plan-cut-tag">VIEW FROM +Y</span>
          </div>
          ${svgTopPlan}
          <div style="font-family:var(--font-mono);font-size:9.5px;color:#444;margin-top:6px;">
            Full horizontal roof/top projection showing vertical section cut planes <strong>D-D</strong> (Longitudinal) and <strong>E-E</strong> (Transversal).
          </div>
        </div>

        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">02.2 // ${levels.labelA}</span>
            <span class="arch-plan-cut-tag">CUT Y = +${levels.yA} MM</span>
          </div>
          ${svgPlanSecA}
          <div style="font-family:var(--font-mono);font-size:9.5px;color:#444;margin-top:6px;">
            ${levels.subA}
          </div>
        </div>

        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">02.3 // ${levels.labelB}</span>
            <span class="arch-plan-cut-tag">CUT Y = +${levels.yB} MM</span>
          </div>
          ${svgPlanSecB}
          <div style="font-family:var(--font-mono);font-size:9.5px;color:#444;margin-top:6px;">
            ${levels.subB}
          </div>
        </div>

        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">02.4 // ${levels.labelC}</span>
            <span class="arch-plan-cut-tag">CUT Y = +${levels.yC} MM</span>
          </div>
          ${svgPlanSecC}
          <div style="font-family:var(--font-mono);font-size:9.5px;color:#444;margin-top:6px;">
            ${levels.subC}
          </div>
        </div>
      </div>

      <div class="shop-view-title">
        <span>VIEW 03 // VERTICAL ARCHITECTURAL SECTIONS OF THE FURNITURE (SECCIÓN LONGITUDINAL D-D &amp; SECCIÓN TRANSVERSAL E-E)</span>
        <span>45° HATCH = SECTIONED TIMBER (T = ${T} MM)</span>
      </div>
      <div class="arch-sections-2col">
        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">03.1 // SECCIÓN LONGITUDINAL / ALZADO D-D (XY PLANE)</span>
            <span class="arch-plan-cut-tag">W ${summaryDims.width} × H ${summaryDims.height} MM</span>
          </div>
          ${svgLongSecDD}
        </div>

        <div class="arch-plan-cell">
          <div class="arch-plan-cell-head">
            <span class="arch-plan-badge">03.2 // SECCIÓN TRANSVERSAL LATERAL E-E (ZY PLANE AT X = 0)</span>
            <span class="arch-plan-cut-tag">D ${summaryDims.depth} × H ${summaryDims.height} MM</span>
          </div>
          ${svgCrossSecEE}
        </div>
      </div>

      <div class="arch-legend-bar">
        <span><strong>HATCHED ELEMENTS (45°):</strong> TIMBER PANELS SLICED BY SECTION PLANE (T = ${T} MM)</span>
        <span><strong>KERF COMPENSATION:</strong> K = ${K.toFixed(1)} MM (RELATIVE EDGE OFFSET -${relOffset.toFixed(2)} MM/SIDE)</span>
        <span><strong>3D JOINT TOLERANCE:</strong> ±0.5 MM POST-KERF TIGHTENED FIT</span>
      </div>
    </div>
  `;
}

function buildShopDrawing2DSvg(pieces, L, W, cnc) {
  const pad = 160;
  const vbX = -L / 2 - pad;
  const vbY = -W / 2 - pad;
  const vbW = L + pad * 2;
  const vbH = W + pad * 2;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="100%" height="310" style="background:#FAF8F3;border:1px solid #D8D3C8;">`;

  // Top & Left Overall Dimension Cotas
  s += `
    <g fill="#141414" font-family="JetBrains Mono" font-size="24" font-weight="700" text-anchor="middle">
      <line x1="${-L / 2}" y1="${-W / 2 - 20}" x2="${-L / 2}" y2="${-W / 2 - 75}" stroke="#141414" stroke-width="3" />
      <line x1="${L / 2}" y1="${-W / 2 - 20}" x2="${L / 2}" y2="${-W / 2 - 75}" stroke="#141414" stroke-width="3" />
      <line x1="${-L / 2}" y1="${-W / 2 - 50}" x2="${L / 2}" y2="${-W / 2 - 50}" stroke="#141414" stroke-width="3.5" />
      <rect x="-260" y="${-W / 2 - 76}" width="520" height="44" fill="#FAF8F3" />
      <text x="0" y="${-W / 2 - 44}">STOCK LENGTH: ${L} MM</text>

      <line x1="${-L / 2 - 20}" y1="${-W / 2}" x2="${-L / 2 - 75}" y2="${-W / 2}" stroke="#141414" stroke-width="3" />
      <line x1="${-L / 2 - 20}" y1="${W / 2}" x2="${-L / 2 - 75}" y2="${W / 2}" stroke="#141414" stroke-width="3" />
      <line x1="${-L / 2 - 50}" y1="${-W / 2}" x2="${-L / 2 - 50}" y2="${W / 2}" stroke="#141414" stroke-width="3.5" />
      <g transform="translate(${-L / 2 - 60}, 0) rotate(-90)">
        <rect x="-180" y="-26" width="360" height="40" fill="#FAF8F3" />
        <text x="0" y="4">WIDTH: ${W} MM</text>
      </g>
    </g>
  `;

  // Stock Sheet outline
  s += `<rect x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" fill="#FFFFFF" stroke="#141414" stroke-width="5" />`;

  // Offset Piece Polygons (04_PART_OFFSET_CONTOURS)
  pieces.forEach((p, idx) => {
    const pts = p.offsetPoints2D || p.points2D;
    const holes = p.offsetHoles2D || p.holes2D;
    const d = pointsToSvgPath(pts, holes);
    const cx = p.points2D.reduce((acc, pt) => acc + pt[0], 0) / p.points2D.length;
    const cy = -p.points2D.reduce((acc, pt) => acc + pt[1], 0) / p.points2D.length;
    const [offW, offH] = p.offsetBox || p.nominalBox || [0, 0];
    const numStr = String(idx + 1).padStart(2, '0');

    s += `<path d="${d}" fill="${p.color}" fill-opacity="0.18" stroke="#1E6B45" stroke-width="2.5" stroke-dasharray="10,5" fill-rule="evenodd" />`;
    s += `<rect x="${(cx - 72).toFixed(1)}" y="${(cy - 26).toFixed(1)}" width="144" height="52" fill="#FFFFFF" stroke="#141414" stroke-width="2" />`;
    s += `<text x="${cx.toFixed(1)}" y="${(cy - 6).toFixed(1)}" font-family="JetBrains Mono" font-weight="700" font-size="19" text-anchor="middle" fill="#141414">#${numStr}</text>`;
    s += `<text x="${cx.toFixed(1)}" y="${(cy + 15).toFixed(1)}" font-family="JetBrains Mono" font-weight="600" font-size="14" text-anchor="middle" fill="#333333">${offW.toFixed(1)}×${offH.toFixed(1)}</text>`;
  });

  // Layer 03: Exterior Perimeter Cut Lines
  cnc.exteriorPolylines.forEach((chain) => {
    s += `<path d="${openPolylineToSvgPath(chain)}" fill="none" stroke="#1B4D89" stroke-width="5" />`;
  });

  // Layer 01: Shared Interior Single-Pass Cut Lines
  cnc.interiorSharedPolylines.forEach((chain) => {
    s += `<path d="${openPolylineToSvgPath(chain)}" fill="none" stroke="#C83228" stroke-width="4" />`;
  });

  // Layer 02: Interior Holes
  cnc.interiorHoleLoops.forEach(({ pts }) => {
    s += `<path d="${pointsToSvgPath(pts, null)}" fill="none" stroke="#008844" stroke-width="4" stroke-dasharray="8,4" />`;
  });

  s += `</svg>`;
  return s;
}

function buildShopDrawingBlueprint() {
  const L = state.sheetL;
  const W = state.sheetW;
  const T = state.thickness;
  const K = state.kerfWidth;
  const pieces = currentPiecesData;
  const summaryDims = currentSummaryDims;
  const cfg = TYPOLOGY_CONFIG[state.typology];
  const cnc = currentCncAnalysis || buildCncFabricationAnalysis(pieces, L, W, K, state.kerfMode);

  // Capture a clean 100% Assembled 3D Snapshot (no exploded transition)
  let snapshotAssembled3D = '';
  try {
    state.assembly = 1.0;
    render3DFurniture(pieces);
    renderer.render(scene, camera);
    snapshotAssembled3D = renderer.domElement.toDataURL('image/png');
  } catch (_) {
    snapshotAssembled3D = '';
  }

  const relOffset =
    state.fitCompMode === 'expand_nominal'
      ? 0
      : state.kerfMode === 'full_kerf'
      ? K
      : K / 2;

  const fitModeLabel =
    state.fitCompMode === 'expand_nominal'
      ? 'PRE-EXPANDED CUT ALLOWANCE (+K · 100% NOMINAL PART SIZE)'
      : 'AUTO-TIGHTENED 3D ASSEMBLY & PRE-COMPENSATED MORTISES (STD 122×244 SHEET)';

  const totalAreaM2 = ((L * W) / 1e6).toFixed(2);
  const sumOffsetArea = pieces.reduce((acc, p) => acc + pieceNetArea(p, true), 0);
  const netYieldPct = clamp((sumOffsetArea / (L * W)) * 100, 75, 100).toFixed(1);
  const dateStr = new Date().toISOString().slice(0, 10);
  const sharePlanUrl = generateShareableURL(true);

  const svg2DPlan = buildShopDrawing2DSvg(pieces, L, W, cnc);
  const archPlansAndSectionsHtml = buildArchitecturalPlansAndSectionsHtml(
    pieces,
    summaryDims,
    cfg,
    T,
    K,
    relOffset
  );

  const rowsHtml = pieces
    .map((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const [nomW, nomH] = p.nominalBox || [0, 0];
      const [offW, offH] = p.offsetBox || [0, 0];
      const [dW, dH] = p.offsetDelta || [0, 0];
      const areaM2 = (pieceNetArea(p, true) / 1e6).toFixed(3);
      const hasHoles = p.holes2D && p.holes2D.length > 0;
      const layerBadge = hasHoles
        ? '01_SHARED + 02_HOLES + 04_OFFSET'
        : '01_CUT_INTERIOR_SHARED + 04_OFFSET';
      return `
        <tr>
          <td><strong>#${num}</strong></td>
          <td><span style="display:inline-block;width:10px;height:10px;background:${p.color};border:1px solid #141414;margin-right:6px;"></span><strong>${p.name}</strong></td>
          <td>${nomW.toFixed(1)} × ${nomH.toFixed(1)} × ${T} mm</td>
          <td><strong>${offW.toFixed(1)} × ${offH.toFixed(1)} × ${T} mm</strong></td>
          <td>Δ ${dW.toFixed(1)} / ${dH.toFixed(1)} mm</td>
          <td>${areaM2} m²</td>
          <td>${layerBadge}</td>
        </tr>
      `;
    })
    .join('');

  shopDrawingSheet.innerHTML = `
    <div class="shop-header-banner">
      <div class="shop-banner-main">
        <h2>WOOD-X // ${cfg.title} — ARCHITECTURAL PLANS, MULTI-SECTIONS &amp; CNC CUT SHEET</h2>
        <p>FIT COMPENSATION: ${fitModeLabel}</p>
        <p style="margin-top:4px;color:#141414;">
          <strong>ASSEMBLED FURNITURE:</strong> W ${summaryDims.width} × D ${summaryDims.depth} × H ${summaryDims.height} mm
          &nbsp;|&nbsp; <strong>${cfg.primaryMetricLabel}:</strong> ${summaryDims.primaryHeight}
        </p>
      </div>
      <div class="shop-banner-specs">
        <div class="shop-spec-cell">
          <span>STOCK SHEET (122×244 STD)</span>
          <strong>${L} × ${W} × ${T} mm (${totalAreaM2} m²)</strong>
        </div>
        <div class="shop-spec-cell">
          <span>TOOL KERF &amp; RELATIVE OFFSET</span>
          <strong>K = ${K.toFixed(1)} mm (Offset -${relOffset.toFixed(2)} mm)</strong>
        </div>
        <div class="shop-spec-cell">
          <span>SHARED INTERIOR CUTS (01_LAYER)</span>
          <strong>${(cnc.deduplicatedInteriorLen / 1000).toFixed(2)} m (Saved ${(cnc.sharedPassSavedLen / 1000).toFixed(2)} m)</strong>
        </div>
        <div class="shop-spec-cell">
          <span>NET WOOD YIELD / PARTS</span>
          <strong>${netYieldPct}% NET WOOD · ${pieces.length} PARTS</strong>
        </div>
      </div>
    </div>

    <div class="shop-grid-views">
      <div class="shop-view-box">
        <div class="shop-view-title">
          <span>VIEW 01 // 1:1 DIMENSIONED 2D STOCK BOARD CNC &amp; SAW CUTTING PLAN (MM)</span>
          <span>RED: 01_INTERIOR_SHARED · BLUE: 03_EXTERIOR · GREEN: 04_PART_OFFSET</span>
        </div>
        <div class="shop-view-body">
          ${svg2DPlan}
        </div>
      </div>

      <div class="shop-view-box">
        <div class="shop-view-title">
          <span>3D ASSEMBLED ISOMETRIC REFERENCE (100% POST-KERF FIT)</span>
          <span>W ${summaryDims.width} × D ${summaryDims.depth} × H ${summaryDims.height} MM</span>
        </div>
        <div class="shop-view-body">
          ${
            snapshotAssembled3D
              ? `<img src="${snapshotAssembled3D}" alt="Assembled 3D View" class="shop-3d-snapshot" style="max-height:295px;" />`
              : ''
          }
        </div>
      </div>
    </div>

    ${archPlansAndSectionsHtml}

    <div class="shop-table-wrap">
      <div class="shop-view-title">
        <span>VIEW 04 // TECHNICAL CUT LIST &amp; POST-KERF FINISHED DIMENSIONS SCHEDULE</span>
        <span>ALL DIMENSIONS IN MILLIMETERS (MM)</span>
      </div>
      <table class="shop-table">
        <thead>
          <tr>
            <th>PART #</th>
            <th>COMPONENT NAME</th>
            <th>NOMINAL CAD SIZE (L×W×T)</th>
            <th>POST-KERF FINISHED SIZE (L×W×T)</th>
            <th>KERF DELTA (ΔX / ΔY)</th>
            <th>NET AREA</th>
            <th>CNC DXF / SVG LAYERS</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="shop-title-block">
      <div class="shop-tb-cell">
        <span>PROJECT &amp; SYSTEM</span>
        <strong>WOOD-X // 100% ZERO-WASTE PARAMETRIC STUDIO</strong>
      </div>
      <div class="shop-tb-cell">
        <span>TYPOLOGY &amp; CODE</span>
        <strong>${cfg.title} (${state.typology.toUpperCase()})</strong>
      </div>
      <div class="shop-tb-cell">
        <span>UNITS · SCALE · DATE</span>
        <strong>MILLIMETERS (1:1 CNC) · ${dateStr}</strong>
      </div>
      <div class="shop-tb-cell">
        <span>SHAREABLE SHOP DRAWING LINK</span>
        <strong style="font-size:10px;word-break:break-all;">${sharePlanUrl}</strong>
      </div>
    </div>
  `;
}

function openShopDrawingModal() {
  buildShopDrawingBlueprint();
  shopDrawingModal.hidden = false;
}

document.getElementById('btnOpenShopDrawing').addEventListener('click', () => {
  openShopDrawingModal();
});

document.getElementById('btnCloseShopModal').addEventListener('click', () => {
  shopDrawingModal.hidden = true;
});

document.getElementById('btnShareShopLink').addEventListener('click', () => {
  copyAndShowShareToast(generateShareableURL(true));
});

document.getElementById('btnPrintShopPDF').addEventListener('click', () => {
  buildShopDrawingBlueprint();
  window.print();
});

function downloadShopDrawingHtmlFile() {
  buildShopDrawingBlueprint();
  const cfg = TYPOLOGY_CONFIG[state.typology];
  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>WOOD-X Architectural Plans & Sections — ${cfg.title} (${state.sheetL}x${state.sheetW}mm)</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #F5F1E8; color: #141414; margin: 20px; }
    .print-bar { max-width: 1290px; margin: 0 auto 14px; display: flex; justify-content: space-between; align-items: center; background: #141414; color: #FFF; padding: 10px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .print-btn { background: #B38B6D; color: #141414; border: none; padding: 8px 16px; font-family: 'JetBrains Mono', monospace; font-weight: 700; cursor: pointer; }
    .shop-sheet { background: #FFF; border: 2px solid #141414; padding: 22px; max-width: 1290px; margin: 0 auto; }
    .shop-header-banner { display: grid; grid-template-columns: 1.5fr 1fr; border: 1.5px solid #141414; margin-bottom: 16px; }
    .shop-banner-main { padding: 12px 16px; border-right: 1.5px solid #141414; }
    .shop-banner-main h2 { margin: 0; font-size: 18px; }
    .shop-banner-main p { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; margin: 4px 0 0; }
    .shop-banner-specs { display: grid; grid-template-columns: repeat(2, 1fr); font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .shop-spec-cell { padding: 8px 12px; border-bottom: 1px solid #D8D3C8; border-right: 1px solid #D8D3C8; }
    .shop-spec-cell span { display: block; font-size: 9px; color: #808080; }
    .shop-grid-views { display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 16px; margin-bottom: 16px; }
    .shop-view-box { border: 1.5px solid #141414; background: #FAF8F3; display: flex; flex-direction: column; }
    .shop-view-title { background: #141414; color: #FFF; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; padding: 6px 12px; display: flex; justify-content: space-between; }
    .shop-view-body { padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
    .shop-3d-snapshot { width: 100%; max-height: 295px; object-fit: contain; border: 1px solid #D8D3C8; }
    .arch-plans-wrap { border: 1.5px solid #141414; margin-bottom: 16px; background: #FFF; }
    .arch-plans-3col { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #D8D3C8; }
    .arch-plans-4col { display: grid; grid-template-columns: repeat(2, 1fr); border-bottom: 1px solid #D8D3C8; }
    .arch-plans-4col .arch-plan-cell { border-bottom: 1px solid #141414; }
    .arch-plans-4col .arch-plan-cell:nth-child(2n) { border-right: none; }
    .arch-plan-cell { border-right: 1px solid #141414; padding: 12px; background: #FAF8F3; display: flex; flex-direction: column; }
    .arch-plan-cell:last-child { border-right: none; }
    .arch-plan-cell-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #D8D3C8; }
    .arch-plan-badge { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #141414; }
    .arch-plan-cut-tag { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700; padding: 2px 6px; background: #141414; color: #FFF; }
    .arch-sections-2col { display: grid; grid-template-columns: 1fr 1fr; }
    .arch-legend-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 8px 14px; background: #EFECE4; border-top: 1px solid #141414; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
    .shop-table-wrap { border: 1.5px solid #141414; margin-bottom: 16px; }
    .shop-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .shop-table th { background: #EFECE4; text-align: left; padding: 7px 10px; border-bottom: 1.5px solid #141414; border-right: 1px solid #D8D3C8; font-size: 10px; }
    .shop-table td { padding: 6px 10px; border-bottom: 1px solid #D8D3C8; border-right: 1px solid #D8D3C8; }
    .shop-title-block { border: 1.5px solid #141414; display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; background: #F5F1E8; }
    .shop-tb-cell { padding: 9px 12px; border-right: 1px solid #141414; }
    .shop-tb-cell:last-child { border-right: none; }
    .shop-tb-cell span { display: block; font-size: 9px; color: #666; }
    @media print { .print-bar { display: none; } body { margin: 0; background: #FFF; } @page { size: A3 landscape; margin: 10mm; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>WOOD-X // SHAREABLE ARCHITECTURAL PLANS, SECTIONS &amp; CNC CUT LIST</span>
    <button class="print-btn" onclick="window.print()">PRINT / SAVE AS PDF</button>
  </div>
  <div class="shop-sheet">${shopDrawingSheet.innerHTML}</div>
</body>
</html>`;
  const filename = `wood-x-shop-drawing-${state.typology}-${state.sheetL}x${state.sheetW}mm.html`;
  downloadBlob(standaloneHtml, filename, 'text/html');
  return filename;
}

document.getElementById('btnDownloadShopHTML').addEventListener('click', () => {
  downloadShopDrawingHtmlFile();
});

// ============================================================================
// MULTI-LAYER 1:1 MILLIMETER CNC DXF EXPORTER
// ============================================================================
function generateCurrentDxfContentAndFilename() {
  const L = state.sheetL;
  const W = state.sheetW;
  const pieces = currentPiecesData;
  const cnc = currentCncAnalysis || buildCncFabricationAnalysis(pieces, L, W, state.kerfWidth, state.kerfMode);

  let dxf = '';
  dxf += '0\nSECTION\n2\nHEADER\n';
  dxf += '9\n$INSUNITS\n70\n4\n';
  dxf += '0\nENDSEC\n';

  const layers = [
    { name: '00_STOCK_BOARD', color: 8 },
    { name: '01_CUT_INTERIOR_SHARED', color: 1 },
    { name: '02_CUT_INTERIOR_HOLES', color: 3 },
    { name: '03_CUT_EXTERIOR_PERIMETER', color: 5 },
    { name: '04_PART_OFFSET_CONTOURS', color: 2 },
    { name: '05_PART_LABELS', color: 7 }
  ];

  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n' + layers.length + '\n';
  layers.forEach((lay) => {
    dxf += `0\nLAYER\n2\n${lay.name}\n70\n0\n62\n${lay.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  dxf += '0\nSECTION\n2\nENTITIES\n';

  const appendPolylineToDxf = (pts, layerName, closed = false) => {
    if (!pts || pts.length < 2) return;
    const count = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < count; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      dxf += `0\nLINE\n8\n${layerName}\n10\n${x1.toFixed(3)}\n20\n${y1.toFixed(3)}\n30\n0.0\n11\n${x2.toFixed(3)}\n21\n${y2.toFixed(3)}\n31\n0.0\n`;
    }
  };

  appendPolylineToDxf(rectPoly(-L / 2, -W / 2, L / 2, W / 2), '00_STOCK_BOARD', true);

  cnc.interiorSharedPolylines.forEach((chain) => {
    appendPolylineToDxf(chain, '01_CUT_INTERIOR_SHARED', false);
  });

  cnc.interiorHoleLoops.forEach(({ pts }) => {
    appendPolylineToDxf(pts, '02_CUT_INTERIOR_HOLES', true);
  });

  cnc.exteriorPolylines.forEach((chain) => {
    appendPolylineToDxf(chain, '03_CUT_EXTERIOR_PERIMETER', false);
  });

  pieces.forEach((p) => {
    appendPolylineToDxf(p.offsetPoints2D || p.points2D, '04_PART_OFFSET_CONTOURS', true);
    const holes = p.offsetHoles2D || p.holes2D;
    if (holes) {
      holes.forEach((h) => appendPolylineToDxf(h, '04_PART_OFFSET_CONTOURS', true));
    }
  });

  pieces.forEach((p, idx) => {
    const cx = p.points2D.reduce((s, pt) => s + pt[0], 0) / p.points2D.length;
    const cy = p.points2D.reduce((s, pt) => s + pt[1], 0) / p.points2D.length;
    const [offW, offH] = p.offsetBox || [0, 0];
    const numStr = String(idx + 1).padStart(2, '0');
    const labelText = `#${numStr} ${p.name} (${offW.toFixed(1)}x${offH.toFixed(1)}mm)`;
    dxf += `0\nTEXT\n8\n05_PART_LABELS\n10\n${cx.toFixed(2)}\n20\n${cy.toFixed(2)}\n30\n0.0\n40\n14.0\n1\n${labelText}\n`;
  });

  dxf += '0\nENDSEC\n0\nEOF\n';

  const filename = `wood-x-${state.typology}-${L}x${W}mm-kerf${state.kerfWidth.toFixed(1)}mm-cnc-layers.dxf`;
  return { dxf, filename };
}

function downloadCurrentDxfFile() {
  const { dxf, filename } = generateCurrentDxfContentAndFilename();
  downloadBlob(dxf, filename, 'application/dxf');
  return filename;
}

document.getElementById('btnExportDXF').addEventListener('click', () => {
  downloadCurrentDxfFile();
});

// ============================================================================
// SEND TO FACTORY (HERO) — MATERIAL REQUIRED, EXECUTION DIMENSIONS & EMAIL DISPATCH
// ============================================================================
const factoryModal = document.getElementById('factoryModal');
const inputFactoryEmail = document.getElementById('inputFactoryEmail');
const inputClientName = document.getElementById('inputClientName');
const inputClientEmail = document.getElementById('inputClientEmail');
const inputOrderQty = document.getElementById('inputOrderQty');
const inputDeliveryCity = document.getElementById('inputDeliveryCity');
const textareaFactoryDossier = document.getElementById('textareaFactoryDossier');
const factoryMaterialSummaryCards = document.getElementById('factoryMaterialSummaryCards');
const lblTargetFactoryEmail = document.getElementById('lblTargetFactoryEmail');
const factoryStatusBanner = document.getElementById('factoryStatusBanner');

const MATERIAL_LABELS = {
  butcher: 'Multi-Strip Laminated Wood (Tablero Alistonado)',
  birch: 'Natural Birch Plywood (Contrachapado de Abedul)',
  charcoal: 'Anthracite Grey Laminated Board',
  forest: 'Architectural Forest Green Laminated Board',
  walnut: 'Dark Espresso Walnut Panel'
};

function getRequiredBoardsInfo(L, W, qty = 1) {
  const stdArea = 2440 * 1220;
  const boardArea = L * W;
  const stdSheetsPerUnit =
    L === 2440 && W === 1220
      ? 1
      : L === 2440 && W === 2440
      ? 2
      : Number((boardArea / stdArea).toFixed(2));
  const totalStdSheets = Number((stdSheetsPerUnit * qty).toFixed(2));
  const sheetTypeDesc =
    L === 2440 && W === 1220
      ? '1× Standard 122×244 cm Sheet (2440 × 1220 mm)'
      : L === 2440 && W === 2440
      ? '2× Standard 122×244 cm Sheets (2440 × 2440 mm)'
      : `${L} × ${W} mm (${stdSheetsPerUnit}× Std 122×244 cm equiv.)`;
  return {
    stdSheetsPerUnit,
    totalStdSheets,
    sheetTypeDesc,
    totalAreaM2: ((boardArea * qty) / 1e6).toFixed(2),
    totalVolumeM3: ((boardArea * state.thickness * qty) / 1e9).toFixed(3),
    approxWeightKg: (((boardArea * state.thickness * qty) / 1e9) * 650).toFixed(1)
  };
}

function updateSidebarFactorySummary() {
  const el = document.getElementById('sidebarFactorySpec');
  if (!el) return;
  const L = state.sheetL;
  const W = state.sheetW;
  const T = state.thickness;
  const targetEmail = inputFactoryEmail ? inputFactoryEmail.value.trim() || 'nacho.monereo@iaac.net' : 'nacho.monereo@iaac.net';
  const bInfo = getRequiredBoardsInfo(L, W, 1);
  el.innerHTML = `
    <span>STOCK MATERIAL: <strong>${L}×${W}×${T} MM (${bInfo.stdSheetsPerUnit}× STD 122×244)</strong></span>
    <span>ASSEMBLED SIZE: <strong>W ${currentSummaryDims ? currentSummaryDims.width : 0} × D ${currentSummaryDims ? currentSummaryDims.depth : 0} × H ${currentSummaryDims ? currentSummaryDims.height : 0} MM</strong></span>
    <span>FACTORY EMAIL: <strong>${targetEmail}</strong></span>
  `;
}

function buildFactoryExecutionDossier() {
  const cfg = TYPOLOGY_CONFIG[state.typology];
  const L = state.sheetL;
  const W = state.sheetW;
  const T = state.thickness;
  const K = state.kerfWidth;
  const pieces = currentPiecesData;
  const dims = currentSummaryDims || { width: 0, depth: 0, height: 0, primaryHeight: 0 };
  const cnc = currentCncAnalysis || buildCncFabricationAnalysis(pieces, L, W, K, state.kerfMode);

  const qty = Math.max(1, parseInt(inputOrderQty ? inputOrderQty.value : '1', 10) || 1);
  const clientName = (inputClientName && inputClientName.value.trim()) || 'WOOD-X Studio Client';
  const clientEmail = (inputClientEmail && inputClientEmail.value.trim()) || 'Not specified';
  const deliveryNotes = (inputDeliveryCity && inputDeliveryCity.value.trim()) || 'Standard Factory Pickup / Delivery';
  const factoryEmail = (inputFactoryEmail && inputFactoryEmail.value.trim()) || 'nacho.monereo@iaac.net';

  if (lblTargetFactoryEmail) lblTargetFactoryEmail.textContent = factoryEmail;

  const relOffset =
    state.fitCompMode === 'expand_nominal'
      ? 0
      : state.kerfMode === 'full_kerf'
      ? K
      : K / 2;

  const bInfo = getRequiredBoardsInfo(L, W, qty);
  const matName = MATERIAL_LABELS[state.materialMode] || state.materialMode;
  const shareBlueprintUrl = generateShareableURL(true);
  const { filename: dxfFilename } = generateCurrentDxfContentAndFilename();
  const htmlPlanFilename = `wood-x-shop-drawing-${state.typology}-${L}x${W}mm.html`;

  if (factoryMaterialSummaryCards) {
    factoryMaterialSummaryCards.innerHTML = `
      <div class="factory-mat-pill">
        <span>REQUIRED STOCK BOARD (${qty} UNIT${qty > 1 ? 'S' : ''})</span>
        <strong>${bInfo.totalStdSheets}× STD 122×244 CM (${L}×${W}×${T} mm)</strong>
      </div>
      <div class="factory-mat-pill">
        <span>MATERIAL FINISH &amp; WEIGHT</span>
        <strong>${T}mm ${matName.split(' (')[0]} (~${bInfo.approxWeightKg} kg)</strong>
      </div>
      <div class="factory-mat-pill">
        <span>ASSEMBLED EXECUTION DIMENSIONS</span>
        <strong>W ${dims.width} × D ${dims.depth} × H ${dims.height} mm</strong>
      </div>
      <div class="factory-mat-pill">
        <span>CNC TOOL KERF &amp; SHARED CUT LENGTH</span>
        <strong>K = ${K.toFixed(1)} mm (-${relOffset.toFixed(2)}mm/side) · ${((cnc.deduplicatedInteriorLen + cnc.exteriorCutLen) / 1000).toFixed(2)} m</strong>
      </div>
    `;
  }

  const cutListLines = pieces
    .map((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const [nomW, nomH] = p.nominalBox || [0, 0];
      const [offW, offH] = p.offsetBox || [0, 0];
      return `  #${num} ${p.name}: Nominal ${nomW.toFixed(1)}×${nomH.toFixed(1)}×${T} mm -> Post-Kerf Execution ${offW.toFixed(1)}×${offH.toFixed(1)}×${T} mm`;
    })
    .join('\n');

  const subject = `[WOOD-X -> HERO FACTORY] CNC Order: ${cfg.title} (${qty}x) — Board ${L}x${W}x${T}mm`;

  // Full technical dossier (for textarea preview, clipboard, and direct HTTP POST email):
  const body = `HERO FACTORY — WOOD-X CNC & ARCHITECTURAL EXECUTION ORDER
====================================================================
1. DIRECT INTERACTIVE BLUEPRINT, 2D PLANS/SECTIONS & DXF LINK:
${shareBlueprintUrl}
(Open the link above to view the exact 1:1 Shop Drawing, 4 Horizontal Plans, 2 Vertical Sections, and export the CNC DXF / PDF directly)

2. CLIENT & ORDER DETAILS:
- Client / Project: ${clientName}
- Client Contact Email: ${clientEmail}
- Quantity to Manufacture: ${qty} unit(s)
- Delivery / Notes: ${deliveryNotes}

3. REQUIRED MATERIAL FOR EXECUTION (DATOS DE MATERIAL PARA FÁBRICA):
- Furniture Typology: ${cfg.title} (${state.typology.toUpperCase()})
- Material / Finish: ${matName}
- Board Thickness (Espesor T): ${T} mm
- Stock Board Size per Unit: ${L} × ${W} × ${T} mm (${bInfo.sheetTypeDesc})
- Total Standard 122×244 cm Boards Required (for ${qty}x): ${bInfo.totalStdSheets} board(s) (${bInfo.totalAreaM2} m² total · ~${bInfo.approxWeightKg} kg)

4. ASSEMBLED FURNITURE EXECUTION DIMENSIONS (COTAS FINALES DE MONTAJE):
- Total Width (Ancho W): ${dims.width} mm
- Total Depth (Fondo D): ${dims.depth} mm
- Total Height (Alto H): ${dims.height} mm
- ${cfg.primaryMetricLabel}: ${dims.primaryHeight}

5. CNC BIT OFFSET & EXECUTION PARAMETERS:
- Fixed Bit Diameter (K): ${K.toFixed(0)} mm (Relative Part Edge Offset: -${relOffset.toFixed(1)} mm/side)
- 3D Assembly Fit: Post-Offset Auto-Tightened 3D Joints (±0.5mm tolerance)

6. POST-OFFSET COMPONENT CUT LIST (${pieces.length} PARTS PER UNIT):
${cutListLines}

7. CNC & ARCHITECTURAL FILES:
- 1:1 Multi-Layer CNC DXF: ${dxfFilename}
- Architectural Plans & Multi-Sections Blueprint (PDF/HTML): ${htmlPlanFilename}
====================================================================`;

  // Compact body (<1300 chars) guaranteed never to fail in Windows/macOS mailto: or Gmail URL handlers:
  const compactMailBody = `HERO FACTORY — WOOD-X EXECUTION ORDER
--------------------------------------------------
1. DIRECT 1:1 PLANS, SECTIONS & DXF LINK:
${shareBlueprintUrl}

2. CLIENT & ORDER:
- Client: ${clientName} (${clientEmail})
- Quantity: ${qty} unit(s) | Notes: ${deliveryNotes}

3. REQUIRED MATERIAL FOR EXECUTION:
- Model: ${cfg.title}
- Stock Board per Unit: ${L} x ${W} x ${T} mm (${bInfo.sheetTypeDesc})
- Total 122x244 cm Boards (for ${qty}x): ${bInfo.totalStdSheets} board(s) (${bInfo.totalAreaM2} m2 · ~${bInfo.approxWeightKg} kg)
- Bit Diameter: ${K.toFixed(0)} mm (Relative Offset -${relOffset.toFixed(1)} mm/edge)

4. ASSEMBLED EXECUTION DIMENSIONS:
- Width (W): ${dims.width} mm | Depth (D): ${dims.depth} mm | Height (H): ${dims.height} mm

5. ATTACHED FILES (Auto-downloaded to your computer):
- ${dxfFilename} (1:1 CNC DXF)
- ${htmlPlanFilename} (Architectural Plans & Sections PDF/HTML)
(Full ${pieces.length}-part cut list is also copied to your clipboard and embedded in the link above)`;

  if (textareaFactoryDossier) {
    textareaFactoryDossier.value = body;
  }

  return { factoryEmail, clientName, clientEmail, qty, cfg, L, W, T, K, bInfo, dims, shareBlueprintUrl, subject, body, compactMailBody, dxfFilename, htmlPlanFilename };
}

function openFactoryModal() {
  buildFactoryExecutionDossier();
  if (factoryStatusBanner) factoryStatusBanner.hidden = true;
  factoryModal.hidden = false;
}

['btnOpenFactoryModal', 'btnSidebarSendFactory', 'btnShopSendFactory'].forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => openFactoryModal());
  }
});

document.getElementById('btnCloseFactoryModal').addEventListener('click', () => {
  factoryModal.hidden = true;
});

[inputFactoryEmail, inputClientName, inputClientEmail, inputOrderQty, inputDeliveryCity].forEach((inp) => {
  if (inp) {
    inp.addEventListener('input', () => {
      buildFactoryExecutionDossier();
      updateSidebarFactorySummary();
    });
  }
});

document.getElementById('btnFactoryDlDXF').addEventListener('click', () => {
  const fname = downloadCurrentDxfFile();
  if (factoryStatusBanner) {
    factoryStatusBanner.hidden = false;
    factoryStatusBanner.innerHTML = `<strong>CNC DXF Downloaded:</strong> <code>${fname}</code> ready to attach to the factory email.`;
  }
});

document.getElementById('btnFactoryDlPDF').addEventListener('click', () => {
  buildShopDrawingBlueprint();
  window.print();
});

document.getElementById('btnFactoryDlHTML').addEventListener('click', () => {
  const fname = downloadShopDrawingHtmlFile();
  if (factoryStatusBanner) {
    factoryStatusBanner.hidden = false;
    factoryStatusBanner.innerHTML = `<strong>Architectural Blueprint Downloaded:</strong> <code>${fname}</code> ready to attach or print to PDF.`;
  }
});

document.getElementById('btnFactoryCopySpec').addEventListener('click', () => {
  const { body } = buildFactoryExecutionDossier();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(body).catch(() => {});
  }
  if (textareaFactoryDossier) textareaFactoryDossier.select();
  if (factoryStatusBanner) {
    factoryStatusBanner.hidden = false;
    factoryStatusBanner.innerHTML = `<strong>Execution Dossier Copied!</strong> Full material &amp; dimension specification copied to clipboard.`;
  }
});

// Direct HTTP Email Dispatch via FormSubmit AJAX + Automatic DXF & Blueprint Download + Mailto Fallback:
const btnFactoryDirectSend = document.getElementById('btnFactoryDirectSend');
if (btnFactoryDirectSend) {
  btnFactoryDirectSend.addEventListener('click', async () => {
    const info = buildFactoryExecutionDossier();
    // 1. Download DXF & HTML Blueprint locally so client/factory also has the raw files immediately
    downloadCurrentDxfFile();
    setTimeout(() => {
      downloadShopDrawingHtmlFile();
    }, 250);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(info.body).catch(() => {});
    }

    if (factoryStatusBanner) {
      factoryStatusBanner.hidden = false;
      factoryStatusBanner.innerHTML = `<strong>Sending Execution Order directly to ${info.factoryEmail}...</strong> (Also downloaded <code>${info.dxfFilename}</code> &amp; <code>${info.htmlPlanFilename}</code>)`;
    }

    try {
      const resp = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(info.factoryEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: info.subject,
          _template: 'box',
          client_project: info.clientName,
          client_email: info.clientEmail,
          quantity: `${info.qty} unit(s)`,
          furniture_model: info.cfg.title,
          required_stock_boards: `${info.bInfo.totalStdSheets}x Std 122x244cm (${info.L}x${info.W}x${info.T} mm · ${info.bInfo.totalAreaM2} m² · ~${info.bInfo.approxWeightKg} kg)`,
          assembled_dimensions: `W ${info.dims.width} x D ${info.dims.depth} x H ${info.dims.height} mm`,
          cnc_bit_offset: `Bit Ø ${info.K} mm (Relative Offset -${(info.K / 2).toFixed(1)} mm/edge)`,
          direct_blueprint_and_dxf_link: info.shareBlueprintUrl,
          execution_dossier: info.body
        })
      });

      if (resp.ok) {
        if (factoryStatusBanner) {
          factoryStatusBanner.innerHTML = `
            <strong>Order Sent Directly to ${info.factoryEmail}!</strong><br/>
            The full Material Specification, Cut List, and Direct 1:1 DXF/Plans Link have been dispatched, and <code>${info.dxfFilename}</code> + <code>${info.htmlPlanFilename}</code> were downloaded to your computer.
          `;
        }
        return;
      }
    } catch (_) {
      // Fallback to mailto below if offline or blocked
    }

    // Fallback: open default email client with compact body that never exceeds URL length limits
    const mailtoUrl = `mailto:${encodeURIComponent(info.factoryEmail)}?subject=${encodeURIComponent(info.subject)}&body=${encodeURIComponent(info.compactMailBody)}`;
    window.location.href = mailtoUrl;

    if (factoryStatusBanner) {
      factoryStatusBanner.innerHTML = `
        <strong>Email Client Opened for ${info.factoryEmail}!</strong><br/>
        Downloaded <code>${info.dxfFilename}</code> (DXF) &amp; <code>${info.htmlPlanFilename}</code> (Plans). Attach both files to the email window and press Send!
      `;
    }
  });
}

document.getElementById('btnFactorySendMailto').addEventListener('click', () => {
  const { factoryEmail, subject, body, compactMailBody, dxfFilename, htmlPlanFilename } = buildFactoryExecutionDossier();
  downloadCurrentDxfFile();
  setTimeout(() => {
    downloadShopDrawingHtmlFile();
  }, 250);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(body).catch(() => {});
  }

  const mailtoUrl = `mailto:${encodeURIComponent(factoryEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(compactMailBody)}`;
  const mailLink = document.createElement('a');
  mailLink.href = mailtoUrl;
  document.body.appendChild(mailLink);
  mailLink.click();
  document.body.removeChild(mailLink);

  if (factoryStatusBanner) {
    factoryStatusBanner.hidden = false;
    factoryStatusBanner.innerHTML = `
      <strong>Email App Opened for ${factoryEmail}!</strong><br/>
      1. Downloaded <code>${dxfFilename}</code> (1:1 DXF) &amp; <code>${htmlPlanFilename}</code> (Architectural Plans/PDF).<br/>
      2. Full execution dossier is also copied to your clipboard. Attach the two downloaded files and hit Send!
    `;
  }
});

document.getElementById('btnFactorySendGmail').addEventListener('click', () => {
  const { factoryEmail, subject, compactMailBody, dxfFilename, htmlPlanFilename } = buildFactoryExecutionDossier();
  downloadCurrentDxfFile();
  setTimeout(() => {
    downloadShopDrawingHtmlFile();
  }, 250);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(factoryEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(compactMailBody)}`;
  window.open(gmailUrl, '_blank', 'noopener');

  if (factoryStatusBanner) {
    factoryStatusBanner.hidden = false;
    factoryStatusBanner.innerHTML = `
      <strong>Gmail Compose Opened for ${factoryEmail}!</strong><br/>
      Downloaded <code>${dxfFilename}</code> &amp; <code>${htmlPlanFilename}</code>. Drag both files into the Gmail window and click Send.
    `;
  }
});

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// RESIZE & RENDER LOOP
// ============================================================================
function handleResize() {
  const rect = container3D.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
}

window.addEventListener('resize', handleResize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  update3DPinPosition();
}

loadStateFromURL();
buildDynamicSlidersUI();
handleResize();
rebuildSceneAndSheet();
animate();
if (shouldAutoOpenShopFromURL) {
  setTimeout(() => openShopDrawingModal(), 250);
}
