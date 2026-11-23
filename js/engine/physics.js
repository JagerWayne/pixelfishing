/* Physics: the Rapier world that mirrors every walk collider, the angler's character controller, the
   townsfolk cylinders and the path-finding queries. */
import { COL } from '../world/layout.js';

export let Physics;

export function init() {
  Physics = (() => {
    const R = window.RAPIER;
    const off = { on: false, add() {}, resize() {}, step() {}, moveCharacter: null, blocked: null, segClear: null, npc() {}, debugLines: () => null };
    if (!R || !R.World) return off;
    try {
      const world = new R.World({ x: 0, y: 0, z: 0 });
      world.timestep = 1 / 60;
      const G = (member, filter) => (((member & 0xffff) << 16) | (filter & 0xffff)) >>> 0;
      const GR = { WALK: 1, NPC: 2, PLAYER: 4 };
      const HH = 10;                                        // half height of every walk collider (heights are ignored)
      const byHandle = new Map();                            // Rapier collider handle -> registry entry
      const BODY_R = 0.15;
      const player = world.createCollider(R.ColliderDesc.capsule(0.5, BODY_R).setTranslation(0, 0, 0).setCollisionGroups(G(GR.PLAYER, GR.WALK | GR.NPC)));
      const cc = world.createCharacterController(0.01);
      cc.setSlideEnabled(true); cc.setUp({ x: 0, y: 1, z: 0 }); cc.setApplyImpulsesToDynamicBodies(false);
      const qWalk = G(GR.PLAYER, GR.WALK), qMove = G(GR.PLAYER, GR.WALK | GR.NPC);
      const rot = { x: 0, y: 0, z: 0, w: 1 }, v3 = { x: 0, y: 0, z: 0 }, d3 = { x: 0, y: 0, z: 0 };
      const shapes = new Map(); const probe = r => { let sh = shapes.get(r); if (!sh) { sh = new R.Cylinder(0.5, Math.max(0.01, r - 0.002)); shapes.set(r, sh); } return sh; };   // 2 mm less: touching is not blocking (as in the built-in test)
      const npcs = new Map();
      let dirty = true;
      return {
        on: true, world, R, byHandle,
        add(c) {
          if (!(c.layers & COL.WALK)) return;
          const desc = c.kind === 'box' ? R.ColliderDesc.cuboid(c.hx, HH, c.hz) : R.ColliderDesc.cylinder(HH, c.r);
          const col = world.createCollider(desc.setTranslation(c.x, 0, c.z).setCollisionGroups(G(GR.WALK, 0xffff)));
          byHandle.set(col.handle, c); c.rb = col; dirty = true;
        },
        /* a registry entry changed size (the aquarium grows with its tier): give its Rapier collider the new size */
        resize(c) {
          const col = c && c.rb; if (!col) return;
          if (c.kind === 'box') { if (col.setHalfExtents) col.setHalfExtents({ x: c.hx, y: HH, z: c.hz }); else { byHandle.delete(col.handle); world.removeCollider(col, false); c.rb = null; this.add(c); } }
          else if (col.setRadius) col.setRadius(c.r);
          dirty = true;
        },
        /* one townsperson: a cylinder that follows them and switches off while they are hidden indoors */
        npc(n, radius) {
          let col = npcs.get(n);
          if (!col) { col = world.createCollider(R.ColliderDesc.cylinder(HH, radius).setTranslation(n.x, 0, n.z).setCollisionGroups(G(GR.NPC, GR.PLAYER))); npcs.set(n, col); }
          v3.x = n.x; v3.y = 0; v3.z = n.z; col.setTranslation(v3); col.setEnabled(!n.hidden); dirty = true;
        },
        /* the scene queries see moved and new colliders after a step (nothing here is dynamic, so it is cheap) */
        step() { if (dirty) { world.step(); dirty = false; } },
        /* the angler wants to move (dx, dz) from (x, z): returns how far it can go, sliding along anything solid */
        moveCharacter(x, z, dx, dz, out) {
          this.step();
          v3.x = x; v3.y = 0; v3.z = z; player.setTranslation(v3);
          d3.x = dx; d3.y = 0; d3.z = dz;
          cc.computeColliderMovement(player, d3, R.QueryFilterFlags.EXCLUDE_SENSORS, qMove);
          const m = cc.computedMovement();
          out.x = m.x; out.z = m.z; return out;
        },
        /* is a disc of radius r at (x, z) touching a walk collider? (pred: only registry entries it accepts) */
        blocked(x, z, r, pred) {
          this.step();
          v3.x = x; v3.y = 0; v3.z = z;
          return !!world.intersectionWithShape(v3, rot, probe(r), R.QueryFilterFlags.EXCLUDE_SENSORS, qWalk, undefined, undefined, pred ? (col => { const c = byHandle.get(col.handle); return !!c && pred(c); }) : undefined);
        },
        /* can a disc of radius r slide from a to b without touching a walk collider? (starting inside one and leaving is allowed) */
        segClear(a, b, r, pred) {
          this.step();
          v3.x = a.x; v3.y = 0; v3.z = a.z; d3.x = b.x - a.x; d3.y = 0; d3.z = b.z - a.z;
          return !world.castShape(v3, rot, d3, probe(r), 0, 1, false, R.QueryFilterFlags.EXCLUDE_SENSORS, qWalk, undefined, undefined, pred ? (col => { const c = byHandle.get(col.handle); return !!c && pred(c); }) : undefined);
        },
        /* line segments of every collider for the secret menu's debug view */
        debugLines() { this.step(); return world.debugRender(); }
      };
    } catch (e) { console.warn('Physics: Rapier could not be set up, using the built-in collisions', e); return off; }
  })();
}
