# Café + Co-working 3D massing model (Phitsanulok)

## Project context
- Land: 0-1-51 rai = 151 sq.wah ≈ 604 m², Tambon Aranyik, Amphoe Mueang Phitsanulok.
  Coordinates 16.76718482, 100.27139260. Assessed value 1,000 THB / sq.wah.
- Program: parking + 2-storey building. Ground floor = coffee shop, 2nd floor = co-working / company office.
- Style: minimal (white/light grey, light oak, thin black steel, big glass facing north, louvers on west/front).
- ASSUMED lot size 16 m wide (road side) x 38 m deep. Real survey dimensions and orientation are still unknown — confirm with the owner before changing proportions.

## Zoning on the lot (metres, y = distance from road)
| Zone | y range | Area |
|---|---|---|
| Front setback / sign / tree | 0–3 | part of greens |
| Parking 5 cars + 1 accessible, 6 m aisle, motorcycles 12 | 3–17 | ~224 m² |
| Outdoor deck + garden | 17–21 | greens ~134 m² total |
| Building footprint 14 x 13 m (x 1–15) | 21–34 | ~182 m² per floor |
| Back of house: bins, AC condensers, deliveries | 34–38 | ~64 m² |

Ground floor: bar/order counter, 30–40 seats, window bar, WC (M/F/accessible), separate key-card stair to level 2, light kitchen + store.
Level 2: hot desk 16–20, meeting room 6–8, glass office, 2 phone booths, pantry + lockers, WC.

## Code
- Plain static site, no build step. Open `index.html` directly, or `npx serve .`.
- `model.js` — all geometry as data (`box` / `flat` in metres). Change dimensions here.
- `app.js` — CSS-3D renderer (each box = 5 divs), orbit drag, wheel zoom, view presets, toggles.
- `style.css` — layout and UI.

## Good next steps
1. Replace assumed 16 x 38 m with the surveyed dimensions; make the lot parametric (width/depth inputs).
2. Add north arrow and sun-angle shading for Phitsanulok (afternoon west sun).
3. Port to three.js for real lighting/shadows and interior walk-through if more realism is wanted.
4. Add level-2 interior layout (currently only massing).
5. Export screenshots per view for presenting to an architect.

Note: this is a massing study, not construction drawings. Setbacks, FAR/OSR and minimum parking must be checked against Phitsanulok town plan and the local building regulations.
