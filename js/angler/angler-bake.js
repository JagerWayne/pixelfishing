/* AnglerFactory method: bakeRig, which turns a dressed character into a few skinned meshes (one per material look),
   with rigid parts skinned to their bone and colours baked into vertex colours. Run at the end of dress(). */
import { THREE } from '../engine/three.js';

const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _c = new THREE.Color(), _w = new THREE.Color();

/* materials that differ only in colour share a key; maps, transparency and glow stay on their own */
function lookKey(mat) {
  if (!mat || mat.map || mat.transparent || (mat.emissive && mat.emissive.getHex())) return null;
  if (mat.isMeshToonMaterial) return 'toon';
  if (mat.isMeshBasicMaterial) return 'basic';
  if (mat.isMeshStandardMaterial) return 'std|' + mat.roughness.toFixed(1) + '|' + mat.metalness.toFixed(1);
  return null;
}

function bakedMaterial(key, sample) {
  const m = sample.clone();
  m.color.set(0xffffff); m.vertexColors = true;
  if (key === 'toon' || key === 'basic') m.side = THREE.DoubleSide;
  if (key.startsWith('std')) { m.roughness = Number(key.split('|')[1]); m.metalness = Number(key.split('|')[2]); m.side = THREE.DoubleSide; }
  return m;
}

export const anglerBakeStatics = {
  /* v11.0.0: about 30 draw calls per character down to 4-8. Every mesh dress() made (skinned body and clothes, rigid
     hands, shoes, head, hair, hat, glasses, extras) is merged per material look into one SkinnedMesh on a skeleton of
     the rig's bones plus the finger bones; the painted face (a texture that changes with the expression) stays apart. */
  bakeRig(rig, fingerBones) {
    rig.root.updateMatrixWorld(true);
    const bones = rig.bones.concat(fingerBones);
    const skel = new THREE.Skeleton(bones);
    const boneIdx = new Map(bones.map((b, i) => [b, i]));
    const rootInv = new THREE.Matrix4().copy(rig.skelRoot.matrixWorld).invert();
    const groups = new Map(), done = [];
    const boneOf = o => { let q = o.parent; while (q && !boneIdx.has(q)) q = q.parent; return q ? boneIdx.get(q) : boneIdx.get(rig.head); };
    const visible = o => { for (let q = o; q && q !== rig.root; q = q.parent) if (!q.visible) return false; return true; };
    const collect = o => {
      if (!o.isMesh || o.userData.noMerge || !visible(o)) return;
      const key = lookKey(o.material); if (!key) return;
      if (!groups.has(key)) groups.set(key, { sample: o.material, items: [], shadow: false });
      const g = groups.get(key); g.items.push(o); g.shadow = g.shadow || o.castShadow; done.push(o);
    };
    rig.parts.forEach(p => p.traverse(collect));
    rig.headGroup.traverse(collect);
    const baked = [];
    for (const [key, g] of groups) {
      let nv = 0, ni = 0;
      g.items.forEach(o => { nv += o.geometry.attributes.position.count; ni += o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count; });
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
      const si = new Uint16Array(nv * 4), sw = new Float32Array(nv * 4), idx = new Uint32Array(ni);
      let v0 = 0, i0 = 0;
      for (const o of g.items) {
        const geo = o.geometry, P = geo.attributes.position, n = P.count;
        if (!geo.attributes.normal) geo.computeVertexNormals();
        const N = geo.attributes.normal, VC = o.material.vertexColors && geo.attributes.color, SI = geo.attributes.skinIndex, SW = geo.attributes.skinWeight;
        _m.multiplyMatrices(rootInv, o.matrixWorld); _n.getNormalMatrix(_m);
        const flip = _m.determinant() < 0, bone = o.isSkinnedMesh ? 0 : boneOf(o);
        _w.copy(o.material.color);
        for (let i = 0; i < n; i++) {
          _v.fromBufferAttribute(P, i).applyMatrix4(_m); pos.set([_v.x, _v.y, _v.z], (v0 + i) * 3);
          _v.fromBufferAttribute(N, i).applyMatrix3(_n).normalize(); nor.set([_v.x, _v.y, _v.z], (v0 + i) * 3);
          _c.copy(_w); if (VC) { _c.r *= VC.getX(i); _c.g *= VC.getY(i); _c.b *= VC.getZ(i); }
          col.set([_c.r, _c.g, _c.b], (v0 + i) * 3);
          if (o.isSkinnedMesh) {
            si.set([SI.getX(i), SI.getY(i), SI.getZ(i), SI.getW(i)], (v0 + i) * 4);
            sw.set([SW.getX(i), SW.getY(i), SW.getZ(i), SW.getW(i)], (v0 + i) * 4);
          } else { si[(v0 + i) * 4] = bone; sw[(v0 + i) * 4] = 1; }
        }
        const I = geo.index ? geo.index.array : null, cnt = I ? I.length : n;
        for (let k = 0; k < cnt; k += 3) {
          const a = I ? I[k] : k, b = I ? I[k + 1] : k + 1, c = I ? I[k + 2] : k + 2;
          idx[i0 + k] = v0 + a; idx[i0 + k + 1] = v0 + (flip ? c : b); idx[i0 + k + 2] = v0 + (flip ? b : c);
        }
        v0 += n; i0 += cnt;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
      geo.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
      geo.setIndex(new THREE.BufferAttribute(idx, 1));
      const mesh = new THREE.SkinnedMesh(geo, bakedMaterial(key, g.sample));
      mesh.castShadow = g.shadow; mesh.receiveShadow = true;
      rig.skelRoot.add(mesh); mesh.bind(skel);
      // culled like any mesh: a bounding sphere of the rest pose, padded for reaching arms and a bent back
      mesh.computeBoundingSphere(); mesh.boundingSphere.radius = mesh.boundingSphere.radius * 1.35 + 0.15;
      baked.push(mesh);
    }
    // the originals go: geometry and materials disposed, groups and bones stay (the fingers still bend)
    for (const o of done) {
      if (o.parent) o.parent.remove(o);
      o.geometry.dispose();
      if (o.material) o.material.dispose();
    }
    rig.parts = rig.parts.filter(p => !done.includes(p)).concat(baked);
    rig.skeleton = skel;
    return baked;
  },
};
