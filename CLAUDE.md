# Café + Co-working 3D massing model (Phitsanulok)

## Project context
- Land: 0-1-51 rai = 151 sq.wah ≈ 604 m², Tambon Aranyik, Amphoe Mueang Phitsanulok.
  Coordinates 16.76718482, 100.27139260. Assessed value 1,000 THB / sq.wah.
- Program: parking + 2-storey building. Ground floor = coffee shop, 2nd floor = company office with meeting room and 1 bedroom.
- Style: minimal (white/light grey, light oak, thin black steel, big glass facing north, louvers on west).
- ASSUMED lot size 16 m wide (road side) x 38 m deep. Real survey dimensions and orientation are still unknown — confirm with the owner before changing proportions.

## Zoning on the lot (metres, y = distance from road)
| Zone | y range | Area |
|---|---|---|
| Front setback / sign / tree | 0–3 | part of greens |
| Parking 5 cars + 1 accessible, 6 m aisle, motorcycles 12 | 3–17 | ~224 m² |
| Outdoor deck + garden | 17–21 | greens ~134 m² total |
| Building footprint 14 x 13 m (x 1–15) | 21–34 | ~182 m² per floor |
| Back of house: bins, AC condensers, deliveries | 34–38 | ~64 m² |


## Orientation and sun (from the Google Maps pin, satellite view)
- The road runs WNW-ESE and the lot is on its south side, so the frontage faces about N18°E
  (`SITE.facing = 18` in `model.js`). +y (depth) points SSW, +x points ESE. Measured by eye, ±5°.
- Consequence: front glass gets soft north light; the west side (x = 0) takes the hot afternoon sun,
  so it is mostly solid wall with vertical oak fins. In May-Jul the midday sun is slightly north;
  the 1.2 m roof overhang covers the front glass.

## Ground floor café (u = x - 1, v = y - 21, 14 x 13 m)
Zone split ~61% seating / 24% bar + kitchen / 15% WC + stair (`ZONES1` in `model.js`).
Seating 33 (front 2-tops, communal table 8, banquette 5, two 4-tops, east window bar 4) · bar faces the entrance
(u 7.6-13.8, v 6.4-9) with 1.25 m work aisle · back strip v 9-13: stair, WC M/F/accessible, light kitchen + store.

## Level 2 layout (same u, v)
Open office (u 0-9, v 0-7.5): one 8-seat bench along the north glass, all facing the window (owner rejected face-to-face desks) + brainstorm zone (standing project table,
8 stools, 2 mobile whiteboards, writable west wall, huddle sofas) · manager office in the quiet NE corner (u 9-14, v 0-3.5) ·
meeting room 8 seats (u 9-14, v 3.5-7.5), door opens to the brainstorm zone, solid wall on the corridor/bedroom side · corridor (v 7.5-9) ·
back strip v 9-13: stair hall, pantry + lockers, WC, bedroom with ensuite (SE corner).

## Functional checklist (keep these when editing the plan)
- Main stair runs ground -> level 2 -> roof (stair house on the roof, guard rail on the parapet, service walkway to solar + tank).
- Office has its own street door on the west side into a lobby (x 1.2-4.4, y 28.6-30) that locks off from the cafe; a 1 m paved path runs along the west boundary.
- Stair needs a landing in front of the first riser on every floor: level-2 landing is the west end of the corridor (key-card door at x = 4.2).
- Wheelchair ramp parking -> deck, accessible bay, accessible WC on the ground floor. No lift (flagged to the owner).
- Back of house: walled bin store, ground water tank + pump, grease trap, treatment tank, AC condensers, meter board at the front boundary.
- Fire extinguishers on each floor and the roof. Level 2: phone booth, server rack in the pantry.

## Code
- Plain static site, no build step, no CDN (three.js r147 + OrbitControls + RoundedBoxGeometry vendored in `vendor/`, classic scripts, works from `file://`).
- Deployed with GitHub Pages via `.github/workflows/pages.yml` (copies only the site files into `_site`).
- `index.html` — three hash-routed pages for the investor pitch, in this order: `#layout` (3D), `#budget`, `#solution`.
- `model.js` — all geometry as data in metres (`box` / `wall` / `glazing` helpers), grouped `site | cars | l1 | l2 | roof`. Change dimensions here.
- `props.js` — detailed props built in three.js (tree, plant, car, moto, person, umbrella, pendant, pole, house); `model.js` places them with `prop(...)`.
- All user-facing text is Thai (nav: ผังอาคาร / งบลงทุน / แนวทาง). Keep new UI copy in Thai.
- `sun.js` — solar position (NOAA equations) for the site lat/lon.
- `app.js` — three.js renderer: materials, shadows, sky dome, orbit camera, view presets, toggles, HTML labels. Lighter settings on touch / narrow screens.
- `cost.js` — budget by necessity (`p` 1 must / 2 should / 3 deferrable), qty x low/high unit rate. Ballpark ranges, not quotations. Also fills the totals on the Solution page.
- `style.css` — responsive: side panel on desktop, model on top + controls below at <= 900 px.
- Do not add revenue / payback numbers without real inputs from the owner.

## Good next steps
1. Replace assumed 16 x 38 m with the surveyed dimensions and boundary bearings; make the lot parametric.
2. Check setbacks, FAR/OSR and parking minimums against the Phitsanulok town plan.
3. Replace cost ranges with contractor quotations.
4. Confirm café equipment list with the operator and size the bar/kitchen to it.
5. Export screenshots per view for presenting to an architect.

Note: this is a massing study, not construction drawings. Setbacks, FAR/OSR and minimum parking must be checked against Phitsanulok town plan and the local building regulations.
