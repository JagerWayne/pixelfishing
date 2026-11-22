/* Character look options (ANGLER_OPTS) and LookColor, which turns a look into colours (a picked hex wins). */

/* =========================================================================
   SECTION D: SCULPTED LOW-POLY 3D MESH BUILDERS
   ========================================================================= */
/* =========================================================================
   ANGLER FACTORY: smooth, layered, customisable fisherman (skin body +
   clothing shells). Dresses the existing animated rig without touching
   any pivot, so walking / sitting / casting animations keep working.
   ========================================================================= */
export const ANGLER_OPTS = {
  skin: ['#fde0c8', '#f5c9a0', '#e0a878', '#c68642', '#8d5524', '#5c3a21'],
  hairColor: ['#111827', '#3b2314', '#78350f', '#a0522d', '#d6a85c', '#f1d9a0', '#b91c1c', '#9ca3af', '#7c3aed', '#0ea5e9'],
  eyes: ['#3b2314', '#2563eb', '#16a34a', '#64748b'],
  colors: ['#f8fafc', '#1e3a8a', '#dc2626', '#eab308', '#16a34a', '#0e7490', '#7c3aed', '#db2777', '#ea580c', '#475569', '#111827', '#a16207', '#365314', '#7dd3fc'],
  hairStyle: [['short', 'Short'], ['buzz', 'Buzz'], ['wavy', 'Wavy'], ['ponytail', 'Ponytail'], ['long', 'Long'], ['bob', 'Bob'], ['bun', 'Bun'], ['braid', 'Braid'],
    ['spiky', 'Spiky'], ['afro', 'Afro'], ['twintails', 'Twin tails'], ['mohawk', 'Mohawk'], ['sidepart', 'Side part'], ['pixie', 'Pixie'], ['bald', 'Bald']],
  facial: [['none', 'None'], ['stubble', 'Stubble'], ['mustache', 'Mustache'], ['goatee', 'Goatee'], ['beard', 'Full beard'], ['sideburns', 'Sideburns']],
  glasses: [['none', 'None'], ['round', 'Round'], ['square', 'Square'], ['sun', 'Sunglasses']],
  top: [['sweater', 'Sweater'], ['tee', 'T-shirt'], ['polo', 'Polo'], ['flannel', 'Flannel'], ['cardigan', 'Cardigan'], ['dress', 'Dress'], ['vest', 'Fishing vest'], ['tank', 'Tank top'], ['hoodie', 'Hoodie'], ['slicker', 'Raincoat'], ['bikini', 'Bikini top'], ['none', 'Bare chest']],
  bottom: [['jeans', 'Jeans'], ['cargo', 'Cargo trousers'], ['leggings', 'Leggings'], ['overalls', 'Bib overalls'], ['shorts', 'Shorts'], ['swim', 'Swim shorts'], ['bikini', 'Bikini bottom'], ['skirt', 'Skirt']],
  shoes: [['boots', 'Rubber boots'], ['sneakers', 'Sneakers'], ['hightops', 'High-tops'], ['sandals', 'Sandals'], ['barefoot', 'Barefoot']],
  hat: [['souwester', "Sou'wester"], ['cap', 'Cap'], ['captain', "Captain's cap"], ['bandana', 'Bandana'], ['flowers', 'Flower crown'], ['flapcap', 'Cap with flaps'], ['beanie', 'Beanie'], ['bucket', 'Bucket hat'], ['straw', 'Straw hat'], ['none', 'None']],
  height: [['xs', 'Very short'], ['s', 'Short'], ['m', 'Average'], ['l', 'Tall'], ['xl', 'Very tall']],
  build: [['slim', 'Slim'], ['average', 'Average'], ['broad', 'Broad']],
  faceShape: [['oval', 'Oval'], ['round', 'Round'], ['square', 'Square'], ['long', 'Long']],
  nose: [['straight', 'Straight'], ['small', 'Small'], ['button', 'Button'], ['broad', 'Broad']],
  brows: [['normal', 'Normal'], ['thin', 'Thin'], ['bushy', 'Bushy'], ['arched', 'Arched'], ['flat', 'Straight'], ['bold', 'Bold slant'], ['worried', 'Worried'], ['none', 'None']],
  // v9.1.0: the painted face, the body sliders, patterns and extras
  eyeShape: [['round', 'Round'], ['big', 'Big'], ['sleepy', 'Sleepy'], ['almond', 'Almond'], ['dot', 'Dots'], ['sparkle', 'Sparkle'], ['cat', 'Cat-eye'], ['wide', 'Wide']],
  mouth: [['smile', 'Smile'], ['grin', 'Grin'], ['cat', 'Cat'], ['open', 'Open'], ['smirk', 'Smirk'], ['flat', 'Calm'], ['tongue', 'Tongue'], ['teeth', 'Toothy'], ['pout', 'Pout'], ['laugh', 'Laugh']],
  cheeks: [['rosy', 'Rosy'], ['peach', 'Peach'], ['none', 'None']],
  marks: [['none', 'None'], ['freckles', 'Freckles'], ['mole', 'Beauty mark'], ['both', 'Both']],
  ears: [['round', 'Round'], ['pointed', 'Pointed'], ['small', 'Small']],
  fringe: [['none', 'None'], ['side', 'Side sweep'], ['full', 'Full fringe']],
  pattern: [['plain', 'Plain'], ['stripes', 'Stripes'], ['checks', 'Checks'], ['waves', 'Waves'], ['block', 'Colour block']],
  accessory: [['none', 'None'], ['scarf', 'Scarf'], ['backpack', 'Backpack'], ['necklace', 'Necklace'], ['badge', 'Rod badge']]
};
/* v9.1.0: a colour comes from a picked hex (look.<key>Hex, from the colour picker) or else from the palette index */
export const HEX_RE = /^#[0-9a-f]{6}$/i;
export const LookColor = {
  pick(look, hexKey, list, idx, fallback) { const h = look[hexKey]; return HEX_RE.test(h || '') ? h : (list[look[idx]] || fallback); },
  skin: l => LookColor.pick(l, 'skinHex', ANGLER_OPTS.skin, 'skin', '#f5c9a0'),
  eyes: l => LookColor.pick(l, 'eyeHex', ANGLER_OPTS.eyes, 'eyes', '#3b2314'),
  hair: l => LookColor.pick(l, 'hairHex', ANGLER_OPTS.hairColor, 'hairColor', '#3b2314'),
  fringe: l => HEX_RE.test(l.fringeHex || '') ? l.fringeHex : (l.fringeColor >= 0 ? ANGLER_OPTS.hairColor[l.fringeColor] : LookColor.hair(l)),
  top: l => LookColor.pick(l, 'topHex', ANGLER_OPTS.colors, 'topColor', '#f8fafc'),
  accent: l => LookColor.pick(l, 'accentHex', ANGLER_OPTS.colors, 'topAccent', '#1e3a8a'),
  bottom: l => LookColor.pick(l, 'bottomHex', ANGLER_OPTS.colors, 'bottomColor', '#1e3a8a'),
  bottomAcc: l => LookColor.pick(l, 'bottomAccHex', ANGLER_OPTS.colors, 'bottomAccent', '#111827'),
  shoe: l => LookColor.pick(l, 'shoeHex', ANGLER_OPTS.colors, 'shoeColor', '#111827'),
  hat: l => LookColor.pick(l, 'hatHex', ANGLER_OPTS.colors, 'hatColor', '#eab308'),
  extra: l => LookColor.pick(l, 'extraHex', ANGLER_OPTS.colors, 'extraColor', '#dc2626')
};
