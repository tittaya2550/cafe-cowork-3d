# Café + Co-working 3D massing model (Phitsanulok)

## Project context
- Land: 0-1-51 rai = 151 sq.wah ≈ 604 m², Tambon Aranyik, Amphoe Mueang Phitsanulok.
  Coordinates 16.76718482, 100.27139260. Assessed value 1,000 THB / sq.wah.
- Program: parking + 2-storey building. Ground floor = coffee shop, 2nd floor = company office with meeting room and 1 bedroom.
- Style: minimal (white/light grey, light oak, thin black steel, big glass facing north, louvers on west).
- Lot is WIDE AND SHALLOW: ~31 m along the road x ~19.5 m deep (= 604 m2), read off the LandsMaps parcel lines (parcel 145687), +-2 m.
  An earlier version wrongly assumed 16 x 38 m. Still not a survey: confirm with the title deed.
- The neighbour's building on the west boundary appears to overlap the parcel by 4-5 m in the imagery; needs a survey.

## Site plan (metres, x along the road from the west corner, y = distance from road)
| Zone | x | y |
|---|---|---|
| West strip: sign green, 7 motorcycle slots, service yard (bins, water tank, pump) | 0-3 | 0-19.5 |
| Aisle, entered straight from the road | 3-9 | 0-19.5 |
| 5 standard + 1 accessible bay, noses to the building | 9-14 | 2.2-18.2 |
| Path: parking -> ramp/deck, office door, back | 14-15 | 1-19.5 |
| Deck (12 x 3.4 m) in front of the cafe | 16-28 | 0.9-4.3 |
| Building footprint 14 x 13 m | 15-29 | 4.5-17.5 |
| East garden strip / back service path (2 m each, minimum for walls with windows) | 29-31 / 15-29 | - / 17.5-19.5 |

The building and deck are authored in their own frame (x 1..15, y 21..34) and shifted by `BLDG = { dx: 14, dy: -16.5 }`;
the u, v room coordinates below are unaffected.

## Ground floor café (u = x - 1, v = y - 21, 14 x 13 m) — owner brief, keep it
- Seating 37 in three table types only: 6 tables for two (keep the floor in front of the conference room clear), 4 tables for four, and an L-shaped high counter with 9 single
  stools along the glass at the north-east corner.
- Bar + pastry case faces the entrance (u 5.4-9.4, v 6.4-9). Kitchen is small and pastry-only.
- Back strip: compact stair (1.0 m flights) | shared washroom (2 cubicles + separate hand-wash counter, like upstairs) | store room | pastry kitchen (13.6 m2); the mini conference
  room (customers, max 10, glass front) takes the east end from v 7.4 to 13.
- Owner rule: the WC must NOT share a wall with the kitchen or the conference room (the store room is the buffer).
- Bar counter carries a small upright cake case plus the pastry case; espresso machine is on the back bar.
- The office is reached ONLY through the cafe (key-card door to the stair). No outside office door.

## Level 2 layout (same u, v) — owner brief, keep it
- 8-seat bench along the north glass, all facing the window (no face-to-face desks).
- Centre = "Freedom space", work-from-home feel: L-sofa + big screen, bean bags, home-style 6-seat table, exactly ONE whiteboard, one true L-shaped sofa, TV stays on the solid west wall.
- Manager office NE corner; meeting room 8 seats with its door to the Freedom space and a solid wall on the corridor side.
- Stair landing at the west end of the corridor has the shoe rack + bench (shoes off before the office).
- Pantry is a mini kitchen, no seating: single-door fridge by the doorway, sink, microwave + small hob, lockers, server rack. No phone booth. No divider cabinet in the Freedom space.
- Bedroom: window on the EAST only, bed head on the solid south wall, ensuite has no window (exhaust fan).
- Indoor planting = small/medium decorative pots in corners, no indoor trees.

## Functional checklist (keep these when editing the plan)
- Main stair runs ground -> level 2 -> roof (stair house on the roof, guard rail on the parapet, service walkway to solar + tank).
- A 1 m paved path runs between the parking bays and the west wall (ramp, back of house).
- Stair needs a landing in front of the first riser on every floor: level-2 landing is the west end of the corridor (key-card door at x = 4.2).
- Wheelchair ramp parking -> deck, accessible bay, accessible WC on the ground floor. No lift (flagged to the owner).
- Back of house: walled bin store, ground water tank + pump, grease trap, treatment tank, AC condensers, meter board at the front boundary.
- Fire extinguishers on each floor and the roof.

## Structure / owner decisions
- No column may stand at the bar counter or in the open cafe floor: the middle column row sits in the back-room wall line
  (y 29.85 in the building frame), front bay spans ~8.9 m. Needs a structural engineer.
- No solar panels for now (roof keeps the service walkway and space for them later).
- The office has no company computers: no monitors on the desks.
- Level-2 west wall: one big window beside the desks, solid wall behind the TV.

## Code
- Plain static site, no build step, no CDN (three.js r147 + OrbitControls + RoundedBoxGeometry vendored in `vendor/`, classic scripts, works from `file://`).
- Deployed with GitHub Pages via `.github/workflows/pages.yml` (copies only the site files into `_site`).
- `index.html` — three hash-routed pages for the investor pitch, in this order: `#layout` (3D), `#budget`, `#solution`.
- `model.js` — all geometry as data in metres (`box` / `wall` / `glazing` helpers), grouped `site | cars | l1 | l2 | roof`. Change dimensions here.
- `props.js` — detailed props built in three.js (tree, plant, car, moto, person, umbrella, pendant, pole, house); `model.js` places them with `prop(...)`.
- All user-facing text is Thai (nav: ผังอาคาร / งบลงทุน / แนวทาง). Keep new UI copy in Thai.
- `sun.js` — solar position (NOAA equations) for the site lat/lon.
- `app.js` — three.js renderer: materials, shadows, sky dome, orbit camera, view presets, toggles, HTML labels. Lighter settings on touch / narrow screens.
- Night mode (`st.night`, group `night`): cafe-and-bar evening look — festoon lights, neon, bottle shelf, candles.
- `cost.js` — itemised from published Thai retail prices + the Thai appraisal foundation construction table, each sourced line links to `SRC`; unsourced lines are flagged "ประมาณการ". Owner wants the total LOW and every price traceable.
- (old note) budget by necessity (`p` 1 must / 2 should / 3 deferrable), qty x low/high unit rate. Ballpark ranges on a deliberately LEAN spec (owner found the first estimate inflated), not quotations. Also fills the totals on the Solution page.
- `style.css` — responsive: side panel on desktop, model on top + controls below at <= 900 px.
- Do not add revenue / payback numbers without real inputs from the owner.

## Good next steps
1. Replace the ~31 x 19.5 m estimate with the surveyed dimensions and boundary bearings.
2. Check setbacks, FAR/OSR and parking minimums against the Phitsanulok town plan.
3. Replace cost ranges with contractor quotations.
4. Confirm café equipment list with the operator and size the bar/kitchen to it.
5. Export screenshots per view for presenting to an architect.

Note: this is a massing study, not construction drawings. Setbacks, FAR/OSR and minimum parking must be checked against Phitsanulok town plan and the local building regulations.
