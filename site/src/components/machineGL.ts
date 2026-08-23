// The iMac as real geometry, lit and rendered with WebGL.
//
// The CSS version this replaces was a flat card that skewed: the rim, the ice
// panel, the bezel and the screen all sat in one plane, so there was no
// thickness anywhere, the silhouette stayed a rectangle however far it turned,
// and — the strongest tell — no highlight ever moved, because the gradients
// were baked at a fixed angle. Planes cannot make a compound curve.
//
// What makes this read as an object instead: a bevelled extrusion, so the
// edges are round and the silhouette changes as it turns; an environment map,
// so the plastic has a specular that slides across it; and a contact shadow,
// so it sits on something.
//
// The screen stays live DOM. The case is drawn into a transparent WebGL canvas
// stacked over a CSS3DRenderer that positions the real desktop in the same
// camera space, and a cutout plane at the screen writes depth without writing
// colour — punching a hole through the case so the DOM shows through, while
// still occluding the body behind it. This is three.js's own `css3d_mixed`
// arrangement.
//
// The aperture is 4:3, not the shape of the window. A viewport-shaped screen
// forced a viewport-shaped case, and a widescreen iMac does not read as an
// iMac. The desktop is a viewport-sized region anchored to the top of that
// aperture, with the rest of the aperture filled in the same desktop colour —
// which reads as more desktop rather than as letterboxing.
//
// Everything here is loaded on demand: see MachineStage for the import.

import type * as THREE_NS from 'three';

type THREE = typeof THREE_NS;

/** Bondi blue, as linear-ish sRGB hex for the shell. */
const SHELL_COLOUR = 0x0f6f87;

/** The "ice" front panel — frosted polycarbonate over a light grey. */
const ICE_COLOUR = 0xdfe7ea;

/** Field of view, degrees. Long-ish, so the machine reads as a product shot. */
const FOV = 32;

/** Fraction of the viewport the machine fills in the hero. */
const HERO_FILL = 0.66;

export interface MachineGLOptions {
	/** Element the two renderers are appended to. */
	mount: HTMLElement;
	/** The live desktop, positioned in 3D and shown through the screen hole. */
	screenContent: HTMLElement;
}

export interface MachineGLHandle {
	/**
	 * Drive a frame.
	 *
	 * @param progress - Zoom progress, 0 in the hero to 1 at the screen.
	 * @param tiltX - Degrees of pitch, from the pointer.
	 * @param tiltY - Degrees of yaw, from the pointer.
	 */
	update(progress: number, tiltX: number, tiltY: number): void;
	/** Re-read the viewport and rebuild anything sized from it. */
	resize(): void;
	/** Show or hide the 3D presentation. */
	setVisible(visible: boolean): void;
	/** The aperture's rendered size, so the host element can match it. */
	getApertureSize(): { width: number; height: number };
	/** The band of viewport the hero copy leaves free, in pixels. */
	setHeroBand(top: number, bottom: number): void;
	/** Release GPU resources and remove the canvases. */
	dispose(): void;
}

/**
 * Build a rounded rectangle as a Shape, optionally with a rectangular hole.
 *
 * Extruding this with a bevel is what gives the case its soft edges — and a
 * soft edge is the whole reason the silhouette changes as the machine turns,
 * which a flat plane can never do.
 */
function roundedRect(
	THREE: THREE,
	width: number,
	height: number,
	radius: number,
	hole?: { width: number; height: number; radius: number; offsetY: number }
): THREE_NS.Shape {
	const shape = new THREE.Shape();
	const w = width / 2;
	const h = height / 2;
	const r = Math.min(radius, w, h);

	shape.moveTo(-w + r, -h);
	shape.lineTo(w - r, -h);
	shape.quadraticCurveTo(w, -h, w, -h + r);
	shape.lineTo(w, h - r);
	shape.quadraticCurveTo(w, h, w - r, h);
	shape.lineTo(-w + r, h);
	shape.quadraticCurveTo(-w, h, -w, h - r);
	shape.lineTo(-w, -h + r);
	shape.quadraticCurveTo(-w, -h, -w + r, -h);

	if (hole) {
		const path = new THREE.Path();
		const hw = hole.width / 2;
		const hh = hole.height / 2;
		const hr = Math.min(hole.radius, hw, hh);
		const cy = hole.offsetY;

		path.moveTo(-hw + hr, cy - hh);
		path.lineTo(hw - hr, cy - hh);
		path.quadraticCurveTo(hw, cy - hh, hw, cy - hh + hr);
		path.lineTo(hw, cy + hh - hr);
		path.quadraticCurveTo(hw, cy + hh, hw - hr, cy + hh);
		path.lineTo(-hw + hr, cy + hh);
		path.quadraticCurveTo(-hw, cy + hh, -hw, cy + hh - hr);
		path.lineTo(-hw, cy - hh + hr);
		path.quadraticCurveTo(-hw, cy - hh, -hw + hr, cy - hh);

		shape.holes.push(path);
	}

	return shape;
}

/**
 * Punch a circular hole in a shape.
 *
 * The speaker wells need real holes in the ice panel. Placing the grilles at a
 * recessed z only buried them inside the panel's extrusion, because the panel
 * is solid there — a recess is an absence of material, not a depth offset.
 */
function circleHole(THREE: THREE, shape: THREE_NS.Shape, x: number, y: number, radius: number) {
	const path = new THREE.Path();
	path.absarc(x, y, radius, 0, Math.PI * 2, true);
	shape.holes.push(path);
}

/**
 * A grid of perforations, drawn to a canvas.
 *
 * The speakers were domes sitting proud of the panel, which read as blue
 * bumps. A real grille is a recess full of holes, and the holes are what your
 * eye actually uses to identify it.
 */
function perforationTexture(THREE: THREE): THREE_NS.CanvasTexture {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');

	if (ctx) {
		ctx.fillStyle = '#0d5568';
		ctx.fillRect(0, 0, size, size);

		const pitch = size / 15;
		ctx.fillStyle = '#04222c';
		for (let row = 0; row < 17; row++) {
			for (let col = 0; col < 17; col++) {
				// Alternate rows are offset, the way a moulded grille is packed.
				const x = col * pitch + (row % 2 ? pitch / 2 : 0);
				const y = row * pitch;
				ctx.beginPath();
				ctx.arc(x, y, pitch * 0.26, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

/**
 * The `iMac` wordmark, drawn to a transparent canvas.
 *
 * Applied as a decal rather than modelled: it is printed type on the real
 * machine, and type is what a canvas is good at.
 */
function wordmarkTexture(THREE: THREE): THREE_NS.CanvasTexture {
	const width = 512;
	const height = 192;
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	if (ctx) {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#77868c';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = '400 132px Georgia, "Times New Roman", serif';
		ctx.fillText('iMac', width / 2, height / 2 + 6);
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

/**
 * Stand up the scene. Async because three and its addons are code-split.
 */
export async function createMachineGL(options: MachineGLOptions): Promise<MachineGLHandle> {
	const THREE = (await import('three')) as unknown as THREE;
	const { CSS3DRenderer, CSS3DObject } = await import(
		'three/examples/jsm/renderers/CSS3DRenderer.js'
	);
	const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');

	const { mount, screenContent } = options;

	// --- Renderers --------------------------------------------------------
	//
	// CSS3D underneath, WebGL over the top with a transparent canvas. The
	// WebGL canvas takes no pointer events, so once the desktop is live it is
	// the DOM below that receives the clicks.
	const css3d = new CSS3DRenderer();
	css3d.domElement.className = 'machineGL__css';
	mount.appendChild(css3d.domElement);

	const gl = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	gl.toneMapping = THREE.NeutralToneMapping;
	gl.domElement.className = 'machineGL__canvas';
	mount.appendChild(gl.domElement);

	const scene = new THREE.Scene();

	// A procedural room, so the plastic has something to reflect without
	// shipping an HDR file.
	const pmrem = new THREE.PMREMGenerator(gl);
	const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environment = envMap;

	const key = new THREE.DirectionalLight(0xffffff, 2.4);
	key.position.set(-1.4, 1.6, 2.2);
	scene.add(key);

	const fill = new THREE.DirectionalLight(0xcfe8f2, 0.7);
	fill.position.set(2.2, -0.4, 1.2);
	scene.add(fill);

	const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 20000);

	// --- Geometry ---------------------------------------------------------
	//
	// One world unit is one CSS pixel, which is the convention CSS3DRenderer
	// works in — that is what lets the DOM screen line up with the hole.
	const machine = new THREE.Group();
	scene.add(machine);

	// Deliberately not `transmission`. A transmissive material is drawn in the
	// transparent pass, after the cutout has written its hole — so it blends
	// straight over the desktop and washes the whole screen cyan. Clearcoat
	// over a saturated base gives the same wet-plastic read, renders in the
	// opaque pass where the cutout can occlude it, and costs far less.
	const shellMaterial = new THREE.MeshPhysicalMaterial({
		color: SHELL_COLOUR,
		roughness: 0.18,
		metalness: 0,
		clearcoat: 1,
		clearcoatRoughness: 0.05,
		ior: 1.52,
		envMapIntensity: 1.15,
	});

	// Frosted polycarbonate: a soft, slightly blue body under a hard gloss
	// coat. `sheen` is what stops it reading as painted card — it lifts the
	// grazing angles the way a diffusing plastic does.
	const iceMaterial = new THREE.MeshPhysicalMaterial({
		color: ICE_COLOUR,
		roughness: 0.55,
		metalness: 0,
		clearcoat: 1,
		clearcoatRoughness: 0.12,
		sheen: 0.6,
		sheenRoughness: 0.5,
		sheenColor: new THREE.Color(0xbfd6dd),
		ior: 1.5,
		envMapIntensity: 1,
	});

	const recessMaterial = new THREE.MeshStandardMaterial({
		color: 0x0a3540,
		roughness: 0.8,
		metalness: 0,
	});

	const grilleTexture = perforationTexture(THREE);
	const grilleMaterial = new THREE.MeshStandardMaterial({
		map: grilleTexture,
		roughness: 0.65,
		metalness: 0,
	});

	const markTexture = wordmarkTexture(THREE);
	const markMaterial = new THREE.MeshBasicMaterial({
		map: markTexture,
		transparent: true,
		depthWrite: false,
	});

	const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x27313a, roughness: 0.7 });

	let parts: THREE_NS.Object3D[] = [];
	let cutout: THREE_NS.Mesh | null = null;
	let screenObject: THREE_NS.Object3D | null = null;

	/** Camera geometry, recomputed whenever the viewport changes. */
	let endDistance = 1000;
	let heroDistance = 3000;
	let heroCentreY = 0;
	let desktopCentreY = 0;
	let aperture = { width: 0, height: 0 };

	/** The vertical band the hero copy leaves free, in viewport pixels. */
	let heroBand = { top: 0, bottom: window.innerHeight };

	const add = (mesh: THREE_NS.Object3D) => {
		machine.add(mesh);
		parts.push(mesh);
	};

	const buildGeometry = () => {
		for (const part of parts) {
			machine.remove(part);
			part.traverse((node) => {
				const mesh = node as THREE_NS.Mesh;
				if (mesh.geometry) mesh.geometry.dispose();
			});
		}
		parts = [];

		const viewW = window.innerWidth;
		const viewH = window.innerHeight;

		// A 4:3 aperture, large enough that a viewport-sized desktop fits
		// across it. This is the whole reason the case reads as an iMac rather
		// than as a widescreen slab: a viewport-shaped screen forces a
		// viewport-shaped case.
		const screenW = Math.max(viewW, (viewH * 4) / 3);
		const screenH = (screenW * 3) / 4;
		aperture = { width: screenW, height: screenH };

		// Proportions taken off the real machine, expressed against the
		// aperture. The chin is deep because that is where the iMac keeps its
		// speakers, its drive and its name — take it away and the case reads
		// as a slab.
		const bezel = screenW * 0.055;
		const frontW = screenW + bezel * 2;
		const chin = screenH * 0.26;
		const frontH = screenH + bezel + chin;
		const depth = screenW * 0.6;

		// The aperture sits above centre, with the chin below it.
		const screenOffsetY = (chin - bezel) / 2;

		// Chin geometry, needed before the front panel is built because the
		// speaker wells are holes in it.
		const chinY = screenOffsetY - screenH / 2 - chin / 2;
		const grilleR = chin * 0.34;
		const grilleX = frontW * 0.35;

		// The ice front panel: a bevelled extrusion with the screen cut out of
		// it. The bevel is what rounds the edges.
		const frontShape = roundedRect(THREE, frontW, frontH, screenW * 0.13, {
			width: screenW,
			height: screenH,
			radius: screenW * 0.012,
			offsetY: screenOffsetY,
		});
		circleHole(THREE, frontShape, -grilleX, chinY, grilleR);
		circleHole(THREE, frontShape, grilleX, chinY, grilleR);

		const frontGeo = new THREE.ExtrudeGeometry(frontShape, {
			depth: screenW * 0.05,
			bevelEnabled: true,
			bevelThickness: screenW * 0.028,
			bevelSize: screenW * 0.026,
			bevelSegments: 6,
			curveSegments: 24,
		});
		frontGeo.translate(0, 0, -screenW * 0.05);
		const front = new THREE.Mesh(frontGeo, iceMaterial);
		machine.add(front);
		parts.push(front);

		// The coloured shell: a slightly larger bevelled slab behind the ice
		// panel, so it reads as a rim in front and as the body from the side.
		// The shell needs the screen cut out of it too. Its front bevel reaches
		// slightly in FRONT of the cutout plane, so as a solid slab it passed
		// the depth test and painted the whole screen area shell-coloured —
		// which is what was covering the desktop.
		const shellShape = roundedRect(THREE, frontW * 1.055, frontH * 1.045, screenW * 0.17, {
			width: screenW,
			height: screenH,
			radius: screenW * 0.012,
			offsetY: screenOffsetY,
		});
		const shellGeo = new THREE.ExtrudeGeometry(shellShape, {
			depth: depth * 0.72,
			bevelEnabled: true,
			bevelThickness: screenW * 0.05,
			bevelSize: screenW * 0.045,
			bevelSegments: 8,
			curveSegments: 24,
		});
		shellGeo.translate(0, 0, -depth * 0.78);
		const shell = new THREE.Mesh(shellGeo, shellMaterial);
		machine.add(shell);
		parts.push(shell);

		// The tube housing tapering away behind, which is what stops the case
		// reading as a slab when it turns.
		const backGeo = new THREE.CylinderGeometry(
			frontW * 0.38,
			frontW * 0.17,
			depth * 0.5,
			28,
			1,
			false
		);
		backGeo.rotateX(Math.PI / 2);
		backGeo.translate(0, screenOffsetY, -depth * 0.95);
		const back = new THREE.Mesh(backGeo, shellMaterial);
		machine.add(back);
		parts.push(back);

		// --- Chin hardware -------------------------------------------------
		//
		// These are the parts that say iMac. Without them the front is a
		// rounded rectangle and could be anything.
		// Where the ice panel's front surface actually is. ExtrudeGeometry runs
		// the shape from z=0 to z=depth and the bevel adds bevelThickness at
		// each end, so after the translate the face sits here. The chin
		// hardware was placed at negative z and ended up buried inside the
		// panel — invisible, which is why the chin read as a blank slab.
		const faceZ = screenW * 0.028;

		// The shell's own front face, by the same arithmetic. Anything recessed
		// into the chin has to stay in front of this or the shell covers it —
		// which is the second reason the speakers never appeared.
		const shellFaceZ = -depth * 0.78 + depth * 0.72 + screenW * 0.05;
		const recessZ = Math.max(faceZ - screenW * 0.016, shellFaceZ + screenW * 0.004);

		for (const side of [-1, 1]) {
			// A well sunk into the panel...
			const wellGeo = new THREE.CylinderGeometry(
				grilleR * 1.08,
				grilleR * 1.08,
				Math.max(faceZ - recessZ, 1),
				36,
				1,
				true
			);
			wellGeo.rotateX(Math.PI / 2);
			wellGeo.translate(side * grilleX, chinY, (faceZ + recessZ) / 2);
			add(new THREE.Mesh(wellGeo, recessMaterial));

			// ...with the perforated grille at the bottom of it. The speakers
			// used to be domes standing proud of the panel, which read as blue
			// bumps; a real grille is a recess full of holes, and the holes are
			// what the eye uses to identify it.
			const grilleGeo = new THREE.CircleGeometry(grilleR, 40);
			grilleGeo.translate(side * grilleX, chinY, recessZ);
			add(new THREE.Mesh(grilleGeo, grilleMaterial));
		}

		// The slot-loading drive.
		const slotGeo = new THREE.BoxGeometry(frontW * 0.32, chin * 0.07, screenW * 0.014);
		slotGeo.translate(0, chinY - chin * 0.1, faceZ - screenW * 0.003);
		add(new THREE.Mesh(slotGeo, slotMaterial));

		// The wordmark, printed just under the aperture.
		const markW = frontW * 0.115;
		const markGeo = new THREE.PlaneGeometry(markW, markW * 0.375);
		markGeo.translate(0, chinY + chin * 0.3, faceZ + 1);
		add(new THREE.Mesh(markGeo, markMaterial));

		// --- The foot --------------------------------------------------------
		const footShape = roundedRect(THREE, frontW * 0.3, chin * 0.4, chin * 0.18);
		const footGeo = new THREE.ExtrudeGeometry(footShape, {
			depth: depth * 0.34,
			bevelEnabled: true,
			bevelThickness: chin * 0.12,
			bevelSize: chin * 0.1,
			bevelSegments: 5,
			curveSegments: 16,
		});
		footGeo.translate(0, chinY - chin * 0.68, -depth * 0.36);
		add(new THREE.Mesh(footGeo, shellMaterial));

		// The hole. NoBlending with zero opacity writes depth but no colour, so
		// the canvas is transparent here and the DOM behind shows through —
		// while still hiding the housing behind it.
		if (cutout) {
			machine.remove(cutout);
			cutout.geometry.dispose();
		}
		// Kept in the same plane as the CSS3D screen. Moving it forward would
		// make it project larger than the DOM it is meant to reveal.
		const cutGeo = new THREE.PlaneGeometry(screenW, screenH);
		cutGeo.translate(0, screenOffsetY, 2);
		cutout = new THREE.Mesh(
			cutGeo,
			// Depth only: no colour is written at all, so the cleared
			// (transparent) canvas survives here and the DOM behind shows
			// through, while the depth it writes stops the case being drawn
			// over the screen.
			new THREE.MeshBasicMaterial({ colorWrite: false })
		);
		// Drawn before everything else, explicitly. Every mesh here has its
		// offsets baked into the geometry rather than set on the object, so
		// they all sit at the origin and three's front-to-back depth sort —
		// which reads the object's position, not the geometry's — cannot tell
		// them apart. Without this the cutout was drawn after the shell had
		// already painted the screen area, and the hole never appeared.
		cutout.renderOrder = -1;
		machine.add(cutout);

		// The live desktop, in the same camera space as the case. The host is
		// the whole 4:3 aperture; the viewport-sized page sits at the top of it
		// and the rest is filled in the same desktop colour, which reads as
		// more desktop rather than as letterboxing.
		screenContent.style.width = `${screenW}px`;
		screenContent.style.height = `${screenH}px`;

		if (!screenObject) {
			screenObject = new CSS3DObject(screenContent) as unknown as THREE_NS.Object3D;
			machine.add(screenObject);
		}
		screenObject.position.set(0, screenOffsetY, 0);

		// Where that viewport-sized page sits inside the aperture: anchored to
		// its top, so the menu bar is at the top of the screen.
		desktopCentreY = screenOffsetY + screenH / 2 - viewH / 2;

		// Camera distance at which the page exactly fills the viewport. This is
		// the same relation CSS3DRenderer uses for its perspective, so at the
		// end of the zoom the desktop is at 1:1.
		const halfFov = Math.tan((FOV * Math.PI) / 360);
		endDistance = viewH / (2 * halfFov);

		// And the distance at which the whole machine fits the band the copy
		// leaves free. Derived rather than a fixed multiple: a constant looks
		// right at one viewport and collides with the headline at another.
		const machineH = frontH * 1.045 + chin * 0.9;
		const machineW = frontW * 1.055;
		const bandH = Math.max(heroBand.bottom - heroBand.top, 80);
		const bandFill = (bandH / viewH) * HERO_FILL;

		heroDistance = Math.max(
			machineH / (2 * halfFov * bandFill),
			machineW / (2 * halfFov * bandFill * Math.max(camera.aspect, 0.1))
		);

		// Centre the machine in that band rather than in the viewport. The
		// band's midpoint in pixels, converted to world units at hero distance.
		const bandCentrePx = (heroBand.top + heroBand.bottom) / 2 - viewH / 2;
		const worldPerPixel = (2 * heroDistance * halfFov) / viewH;
		heroCentreY = -bandCentrePx * worldPerPixel;
	};

	const resize = () => {
		const w = window.innerWidth;
		const h = window.innerHeight;
		gl.setSize(w, h);
		css3d.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		buildGeometry();
	};

	resize();

	const update = (progress: number, tiltX: number, tiltY: number) => {
		// Dolly in rather than scale up: the perspective genuinely changes,
		// which a CSS scale cannot do. The camera also pans from the middle of
		// the machine to the middle of the desktop, because once the aperture
		// is taller than the viewport those are not the same point.
		const eased = progress * progress;
		const distance = heroDistance + (endDistance - heroDistance) * eased;
		const centreY = heroCentreY + (desktopCentreY - heroCentreY) * eased;

		// The tilt orbits the CAMERA around the machine rather than rotating
		// the machine.
		//
		// Rotating the object made the two renderers disagree: the WebGL hole
		// and the CSS3D desktop drifted apart as soon as there was any
		// rotation, so the desktop spilled out past the side of the case. Both
		// renderers derive everything from `camera.matrixWorldInverse`, so
		// moving the camera instead is the one transform they cannot disagree
		// about. It reads the same — the machine appears to turn toward you —
		// and it is honest about what is happening: you are the one leaning.
		const yaw = (tiltY * Math.PI) / 180;
		const pitch = (tiltX * Math.PI) / 180;

		camera.position.set(
			distance * Math.sin(yaw) * Math.cos(pitch),
			centreY + distance * Math.sin(pitch),
			distance * Math.cos(yaw) * Math.cos(pitch)
		);
		camera.up.set(0, 1, 0);
		camera.lookAt(0, centreY, 0);

		gl.render(scene, camera);
		css3d.render(scene, camera);
	};

	const getApertureSize = () => aperture;

	const setHeroBand = (top: number, bottom: number) => {
		heroBand = { top, bottom };
		buildGeometry();
	};

	const setVisible = (visible: boolean) => {
		const display = visible ? '' : 'none';
		gl.domElement.style.display = display;
		css3d.domElement.style.display = display;
	};

	const dispose = () => {
		for (const part of parts) {
			part.traverse((node) => {
				const mesh = node as THREE_NS.Mesh;
				if (mesh.geometry) mesh.geometry.dispose();
			});
		}
		cutout?.geometry.dispose();
		shellMaterial.dispose();
		iceMaterial.dispose();
		recessMaterial.dispose();
		grilleMaterial.dispose();
		markMaterial.dispose();
		slotMaterial.dispose();
		grilleTexture.dispose();
		markTexture.dispose();
		envMap.dispose();
		pmrem.dispose();
		gl.dispose();
		gl.domElement.remove();
		css3d.domElement.remove();
	};

	return { update, resize, setVisible, getApertureSize, setHeroBand, dispose };
}
