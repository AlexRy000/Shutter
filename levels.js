/* Shutter chambers. Each chamber builds itself with the builder B (see makeBuilder in game.js).
   Coordinates are 1-unit cells; the floor top is y = 1. Orange things have weight; blue ({ fixed: true }) things float.
   sol: the intended solution as steps, used by the Hints tab (steps with `say`) and by the automated play-through. */
window.SHUTTER_LEVELS = [
  {
    name: 'Step', film: 1,
    hint: 'Click the orange block to photograph it. Walk up to the wall and print it (right-click or E): it reappears on your crosshair. Orange prints have weight, so it drops.',
    sol: [
      { snap: [1.5, 1.5, -2.5], say: 'Photograph the orange block.' },
      { tp: [0.5, 1.02, -5.5] },
      { print: [0.5, 1.52, -7.5], say: 'Print it against the foot of the wall.' },
      { go: [0.5, -11.5], jump: true, say: 'Jump onto the block, then onto the wall.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -14, 1, 6);
      B.start(0, 1, 0);
      B.solid(-3, 1, -9, 3, 2, -9);
      B.block(1, 1, -3, 1, 1, -3);
      B.exit(0, 1, -12);
    },
  },
  {
    name: 'Cut the Floor', film: 1,
    hint: 'Even a strip of floor can be photographed. It has weight, so lay it across the gap with both ends on solid ground.',
    sol: [
      { snap: [2.5, 0.85, -3.5], say: 'Photograph the strip of floor beside you.' },
      { tp: [0.5, 1.02, -6] },
      { print: [0.5, 1.15, -10.5], say: 'Print it across the gap so both ends rest on solid floor.' },
      { go: [0.5, -14], say: 'Walk across.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-2, 2, -17, 0, 6, false);
      B.solid(-2, 0, -8, 1, 0, 0, 'floor');
      B.solid(2, 0, 0, 2, 0, 0, 'floor');
      B.solid(2, 0, -8, 2, 0, -8, 'floor');
      B.box([2, -1, -7], [3, 0.7, 0], 'trim');
      B.plank(2, -7, 2, -1);
      B.solid(-2, 0, -17, 2, 0, -14, 'floor');
      B.start(0, 1, 0);
      B.exit(0, 1, -16);
    },
  },
  {
    name: 'Hover', film: 1,
    hint: 'Blue prints are cyanotypes: no weight at all. They hang exactly where you print them, even over thin air.',
    sol: [
      { snap: [2.5, 0.85, -2.5], say: 'Photograph the blue strip.' },
      { tp: [0.5, 1.02, -3] },
      { print: [0.5, 0.85, -9.0], say: 'Print it in the middle of the gap, level with the floor. Blue prints float.' },
      { tp: [0.5, 1.02, -3.5], yaw: 0 },
      { runjump: 2, say: 'Jump onto it, then jump to the far side.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-2, 2, -20, 0, 6, false);
      B.solid(-2, 0, -5, 1, 0, 0, 'floor');
      B.solid(2, 0, -1, 2, 0, 0, 'floor');
      B.solid(2, 0, -5, 2, 0, -5, 'floor');
      B.box([2, -1, -4], [3, 0.7, -1], 'trim');
      B.plank(2, -4, 2, -2, { fixed: true });
      B.solid(-2, 0, -20, 2, 0, -14, 'floor');
      B.start(0, 1, 0);
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Leapfrog', film: 1,
    hint: 'One strip of floor, two gaps. Lay it across the first and cross to the pillar. Step off the plank onto the pillar itself: you can’t photograph what you’re standing on.',
    sol: [
      { snap: [2.5, 0.85, -3], say: 'Photograph the strip of floor.' },
      { print: [0.5, 1.15, -9.5], say: 'Lay it across the first gap.' },
      { go: [0.5, -13.4], say: 'Cross, and step off it onto the pillar itself.' },
      { snap: [0.5, 1.0, -9.5], say: 'Photograph the strip behind you.' },
      { go: [0.5, -12.45] },
      { print: [0.5, 1.15, -16.45], say: 'Lay it across the second gap.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-2, 2, -23, 0, 6, false);
      B.solid(-2, 0, -7, 1, 0, 0, 'floor');
      B.solid(2, 0, 0, 2, 0, 0, 'floor');
      B.solid(2, 0, -7, 2, 0, -7, 'floor');
      B.box([2, -1, -6], [3, 0.7, 0], 'trim');
      B.plank(2, -6, 2, -1);
      B.solid(-2, -4, -14, 2, 0, -13, 'trim');
      B.solid(-2, 0, -23, 2, 0, -20, 'floor');
      B.start(0, 1, 0);
      B.exit(0, 1, -22);
    },
  },
  {
    name: 'Drop', film: 1,
    hint: 'Crates are heavy: they fall, tumble and can be shoved around. A door stays open while its plate is held down.',
    sol: [
      { snap: [3.5, 3.75, -2.5], say: 'Photograph the crate on the ledge.' },
      { print: [-2.5, 1.47, -4.5], say: 'Print it onto the plate. The door opens while the plate is held.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -12, 1, 7);
      B.start(0, 1, 0);
      B.solid(-4, 1, -8, -2, 7, -8); B.solid(2, 1, -8, 4, 7, -8); B.solid(-1, 4, -8, 1, 7, -8);
      B.door(['p1'], -1, 1, -8, 1, 3, -8);
      B.plate('p1', -3, 1, -5);
      B.solid(2, 1, -4, 4, 2, -2, 'trim');
      B.crate(3, 3, -3);
      B.exit(0, 1, -11);
    },
  },
  {
    name: 'Stack', film: 1,
    hint: 'The ledge is too high to jump. Build a staircase: print one crate above another and let it drop.',
    sol: [
      { snap: [-2.5, 1.45, -2.5], say: 'Photograph a crate.' },
      { print: [0.5, 1.47, -8.45], say: 'Print it against the ledge.' },
      { snap: [3.5, 1.45, -1.5], say: 'Photograph another crate.' },
      { print: [0.5, 2.6, -8.45], say: 'Print it on top of the first.' },
      { snap: [-1.5, 1.45, 0.5], say: 'Photograph the last crate.' },
      { print: [0.5, 1.47, -7.45], say: 'Print it in front, as the first step.' },
      { go: [0.5, -12], jump: true, say: 'Climb the steps.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 8);
      B.start(0, 1, 0);
      B.solid(-4, 1, -14, 4, 3, -10);
      B.crate(-3, 1, -3); B.crate(3, 1, -2); B.crate(-2, 1, 0);
      B.exit(0, 4, -12);
    },
  },
  {
    name: 'Spring', film: 1,
    hint: 'Jump pads launch whatever lands on them. Photograph this one through the glass.',
    sol: [
      { snap: [-2.5, 1.15, -2.5], say: 'Photograph the jump pad through the glass.' },
      { print: [0.5, 1.13, -7.6], say: 'Print it near the ledge.' },
      { go: [0.5, -12], say: 'Step on it and steer onto the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 10);
      B.start(0, 1, 0);
      B.solid(-4, 1, -14, 4, 5, -10);
      B.glassCase(-4, 1, -4, -2, 2, -2);
      B.pad(-3, 1, -3);
      B.exit(0, 6, -12);
    },
  },
  {
    name: 'Updraft', film: 1,
    hint: 'One bounce is not enough. A blue pad hangs wherever you print it, so give yourself something to land on.',
    sol: [
      { snap: [-2.5, 1.15, -0.5], say: 'Photograph the blue pad in the glass case.' },
      { print: [0.5, 5.1, -8.3], say: 'Print it in the air ahead of the orange pad, where you will come down.' },
      { tp: [0.5, 1.02, -1.6] },
      { go: [0.5, -12], say: 'Bounce off the orange pad onto the blue one, and up onto the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 13);
      B.start(0, 1, 0);
      B.solid(-4, 1, -16, 4, 9, -10);
      B.pad(0, 1, -4);
      B.glassCase(-4, 1, -2, -2, 2, 0);
      B.pad(-3, 1, -1, { fixed: true });
      B.exit(0, 10, -13);
    },
  },
  {
    name: 'Tripwire', film: 1,
    hint: 'Red beams are lethal, so jump this one. A beam that reaches a target powers it.',
    sol: [
      { snap: [1.5, 2, -4.5], say: 'Photograph the block in the beam. Now the beam reaches the target.' },
      { tp: [0.5, 1.02, -2.4] },
      { go: [0.5, -11.5], jump: true, say: 'Jump over the beam and go through the door.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -12, 1, 6);
      B.start(0, 1, 0);
      B.solid(-4, 1, -9, -2, 6, -9); B.solid(2, 1, -9, 4, 6, -9); B.solid(-1, 4, -9, 1, 6, -9);
      B.door(['r1'], -1, 1, -9, 1, 3, -9);
      B.emitter(-4, 1, -5, -90, { locked: true });
      B.receptor('r1', 4, 1, -5);
      B.block(1, 1, -5, 1, 2, -5);
      B.exit(0, 1, -11);
    },
  },
  {
    name: 'Aim', film: 1,
    hint: 'This emitter is blue, so it hangs wherever you print it. Rotate a print with R and the mouse, a sideways swipe, or Z and X. The preview line turns green on target.',
    sol: [
      { snap: [-2.5, 2.5, -2.5], say: 'Photograph the blue emitter.' },
      { print: [0.5, 2.5, -5.5], yaw: 0, say: 'Print it facing the target. Turn it until the preview turns green.' },
      { go: [3.5, -8] },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -12, 1, 7);
      B.start(0, 1, 0);
      B.solid(-5, 1, -10, -1, 7, -10);
      B.solid(0, 1, -10, 0, 1, -10); B.receptor('r1', 0, 2, -10); B.solid(0, 3, -10, 0, 7, -10);
      B.solid(1, 1, -10, 1, 7, -10);
      B.solid(2, 4, -10, 4, 7, -10); B.door(['r1'], 2, 1, -10, 4, 3, -10);
      B.solid(5, 1, -10, 5, 7, -10);
      B.solid(-3, 1, -3, -3, 1, -3, 'trim');
      B.glassCase(-4, 1, -4, -2, 3, -2);
      B.emitter(-3, 2, -3, -90, { fixed: true });
      B.exit(3, 1, -11);
    },
  },
  {
    name: 'Mirror', film: 1,
    hint: 'Mirrors bend beams. Rotate the mirror until the preview line turns green, or press G to snap to 45° steps.',
    sol: [
      { snap: [3.5, 2, -0.5], say: 'Photograph the mirror.' },
      { print: [2.5, 2.0, -5.5], yaw: 45, say: 'Stand it in the beam at 45°, so it bounces the light into the target.' },
      { go: [-2.5, -3.6] },
      { leap: [-2.5, -4.6, -2.5, -9], say: 'Jump the beam.' },
      { go: [-2.5, -12.5], say: 'Go through the door.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -14, 1, 7);
      B.start(0, 1, 0);
      B.solid(-5, 1, -11, -5, 7, -11);
      B.door(['r1'], -4, 1, -11, -2, 3, -11); B.solid(-4, 4, -11, -2, 7, -11);
      B.solid(-1, 1, -11, 1, 7, -11);
      B.receptor('r1', 2, 1, -11); B.solid(2, 2, -11, 2, 7, -11);
      B.solid(3, 1, -11, 5, 7, -11);
      B.emitter(-5, 1, -6, -90, { locked: true });
      B.mirror(3, 1, -1, 0);
      B.exit(-3, 1, -13);
    },
  },
  {
    name: 'Light Leak', film: 1,
    hint: 'Walk through a light leak and your film fogs: every photo you carry goes back where it came from. Scroll, or hold R and move the mouse, to push a print farther away.',
    sol: [
      { snap: [-2.5, 0.85, -3.5], say: 'Photograph the strip of floor.' },
      { print: [0.5, 1.15, -11.5], say: 'Push the print past the light leak and lay it across the gap before you walk through.' },
      { go: [0.5, -14] },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -21, 0, 7, false);
      B.solid(-2, 0, -9, 3, 0, 0, 'floor');
      B.solid(-3, 0, 0, -3, 0, 0, 'floor');
      B.solid(-3, 0, -9, -3, 0, -8, 'floor');
      B.box([-3, -1, -7], [-2, 0.7, 0], 'trim');
      B.plank(-3, -7, -3, -1);
      B.leak(-3, 1, -8, 3, 7, -8);
      B.solid(-3, 0, -21, 3, 0, -15, 'floor');
      B.start(0, 1, 0);
      B.exit(0, 1, -19);
    },
  },
  {
    name: 'Two Frames', film: 2,
    hint: 'Two frames of film now. Press Q (or 1 and 2) to choose which photo prints. The amber door locks behind you, so take everything you will need.',
    sol: [
      { snap: [0.0, 1.15, -1.5], say: 'Photograph the strip of floor.' },
      { snap: [2.5, 2.45, -5.5], say: 'Photograph the blue crate as well: you will not be coming back.' },
      { go: [0.5, -9.5], say: 'Go through the one-way door. It locks behind you.' },
      { go: [-3.0, -11.0] },
      { sel: 0 },
      { print: [-6.5, 1.15, -11.0], yaw: 0, say: 'Lay the strip across the pit.' },
      { go: [-12.0, -11.0] },
      { go: [-12.0, -14.0] },
      { print: [-12.5, 1.47, -16.5], say: 'Round the corner, print the crate on the plate.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-3, -6, 3, 0, 6], [-1, -12, 1, -7, 6], [-13, -12, -2, -10, 6], [-13, -21, -11, -13, 6]], { pits: [[-9, -12, -5, -10]] });
      B.start(0, 1, 0);
      B.plank(-3, -2, 2, -2, { top: 1.3 });
      B.solid(2, 1, -6, 2, 1, -6, 'trim');
      B.crate(2, 2, -6, { fixed: true });
      B.door([], -1, 1, -7, 1, 3, -7, { oneway: true }); B.solid(-1, 4, -7, 1, 6, -7);
      B.safelight(-1, 1, -12, 1, 6, -8);
      B.safelight(-4, 1, -12, -2, 6, -10);
      B.plate('p1', -13, 1, -17);
      B.door(['p1'], -13, 1, -19, -11, 3, -19); B.solid(-13, 4, -19, -11, 6, -19);
      B.exit(-12, 1, -21);
    },
  },
  {
    name: 'Stairwell', film: 1,
    hint: 'Big things fit in a photo too. Turn the stairs to face the ledge before you print them.',
    sol: [
      { snap: [-1.5, 2.6, -2.5], say: 'Photograph the stairs.' },
      { print: [0.5, 3.02, -8.0], yaw: 90, say: 'Turn them to climb toward the ledge, and print them against it.' },
      { go: [0.5, -13.5], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 9);
      B.start(0, 1, 0);
      B.solid(-4, 1, -16, 4, 4, -11);
      B.stairs(-3, 1, -3, 4);
      B.exit(0, 5, -14);
    },
  },
  {
    name: 'Pocket Bridge', film: 1, zoom: true,
    hint: 'Zoom film keeps a print the same size in your viewfinder. Photograph the model up close, then push it farther away and it grows.',
    sol: [
      { tp: [2.5, 1.02, -0.2] },
      { snap: [2.5, 2.04, -1.5], say: 'Photograph the little model plank from up close.' },
      { go: [0.5, -3.1] },
      { print: [0.5, 1.15, -8.5], yaw: 0, scale: 1, say: 'Push the print far away: on Zoom film it grows, until it spans the gap.' },
      { go: [0.5, -4] },
      { go: [0.5, -12] },
      { exit: true },
    ],
    build(B) {
      B.shell(-2, 2, -18, 0, 6, false);
      B.solid(-2, 0, -6, 2, 0, 0, 'floor');
      B.solid(2, 1, -2, 2, 1, -2, 'trim');
      B.miniPlank(2.5, 2, -1.5, 7, 0.25);
      B.solid(-2, 0, -18, 2, 0, -12, 'floor');
      B.start(0, 1, 0);
      B.exit(0, 1, -16);
    },
  },
  {
    name: 'Big Picture', film: 1, zoom: true,
    hint: 'A scale model is still a staircase. Shoot it close, print it far.',
    sol: [
      { tp: [-1.6, 1.02, -1.6] },
      { snap: [-2.5, 2.25, -2.5], say: 'Photograph the model stairs from close up.' },
      { go: [0.5, -2.8] },
      { print: [0.5, 3.02, -8.0], yaw: 90, scale: 1, say: 'Print them far away so they come out full size, climbing toward the ledge.' },
      { go: [0.5, -13.5], jump: true },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 9);
      B.start(0, 1, 0);
      B.solid(-4, 1, -16, 4, 4, -11);
      B.solid(-3, 1, -3, -3, 1, -3, 'trim');
      B.miniStairs(-2.5, 2, -2.5, 4, 0.25);
      B.exit(0, 5, -14);
    },
  },
  {
    name: 'Double Exposure', film: 1, copy: true,
    hint: 'Double-X film copies things instead of taking them. The door wants both targets lit.',
    sol: [
      { snap: [-3.5, 2.5, -5.5], say: 'Photograph the emitter. Double-X copies it; the original stays.' },
      { print: [2.5, 2.5, -3.0], yaw: 0, say: 'Print the copy facing the second target.' },
      { snap: [3.5, 1.13, 0.5], say: 'Copy the jump pad.' },
      { print: [0.5, 1.13, -3.6], say: 'Print it before the beam.' },
      { tp: [0.5, 1.02, -1.5] },
      { go: [-2.0, -12.5], say: 'Bounce over the beam and go through the door.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -14, 1, 9);
      B.start(0, 1, 0);
      B.solid(-4, 1, -6, -4, 1, -6, 'trim');
      B.glassCase(-5, 1, -7, -3, 3, -5);
      B.emitter(-4, 2, -6, -90, { fixed: true });
      B.solid(5, 1, -6, 5, 1, -6, 'trim'); B.receptor('r1', 5, 2, -6);
      B.solid(-5, 1, -11, -4, 9, -11);
      B.door(['r1', 'r2'], -3, 1, -11, -1, 3, -11); B.solid(-3, 4, -11, -1, 9, -11);
      B.solid(0, 1, -11, 1, 9, -11);
      B.solid(2, 1, -11, 2, 1, -11); B.receptor('r2', 2, 2, -11); B.solid(2, 3, -11, 2, 9, -11);
      B.solid(3, 1, -11, 5, 9, -11);
      B.pad(3, 1, 0);
      B.exit(-2, 1, -13);
    },
  },
  {
    name: 'Contact Sheet', film: 2,
    hint: 'Three things on display, two frames of film. Once the amber door shuts behind you there is no coming back, but a print can be used more than once.',
    sol: [
      { snap: [-4.5, 1.15, -2.0], say: 'Photograph the strip of floor in the left case.' },
      { snap: [4.5, 1.45, -2.5], say: 'And the crate in the right case. That is both frames.' },
      { go: [0.5, -8.0], say: 'Go through the one-way door.' },
      { go: [8.5, -8.5] },
      { sel: 0 },
      { print: [8.5, 1.15, -12.5], say: 'Lay the strip across the first pit.' },
      { go: [8.5, -14.0] }, { go: [7.3, -16.0] },
      { snap: [8.5, 1.15, -12.5], say: 'Cross, then photograph the strip again.' },
      { sel: 0 },
      { print: [8.5, 1.47, -16.5], say: 'Put the crate on the plate.' },
      { print: [8.5, 1.15, -23.5], say: 'Lay the strip across the second pit.' },
      { go: [8.5, -19.5] }, { go: [8.5, -27.3] },
      { exit: true },
    ],
    nope: [
      [
        { snap: [-4.5, 1.15, -2.0] },
        { go: [0.5, -8.0] }, { go: [8.5, -8.5] },
        { print: [8.5, 1.15, -12.5] },
        { go: [8.5, -14.0] }, { go: [7.3, -16.0] },
        { snap: [8.5, 1.15, -12.5] },
        { print: [8.5, 1.15, -18.0] },
        { tp: [8.5, 1.02, -19.0], yaw: 0 },
        { runjump: 1, late: true },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-5, -5, 5, 0, 6], [-1, -9, 5, -6, 6], [6, -31, 10, -7, 6]], { pits: [[6, -15, 10, -11], [6, -26, 10, -22]] });
      B.start(0, 1, -2);
      // the gallery: one strip of floor, one crate and one blue block, each behind glass
      B.glass(-4, 1, -5, -4, 6, 0); B.plank(-5, -5, -5, 0, { top: 1.3 });
      B.glass(3, 1, -5, 3, 6, 0); B.crate(4, 1, -3); B.block(5, 1, -1, 5, 1, -1, { fixed: true });
      // the one-way door, and a corridor that turns so you can't see back
      B.solid(-5, 1, -6, -2, 6, -6); B.solid(2, 1, -6, 5, 6, -6); B.door([], -1, 1, -6, 1, 3, -6, { oneway: true }); B.solid(-1, 4, -6, 1, 6, -6);
      // two bottomless pits with a platform between; the plate is set well back from the second pit
      B.plate('p1', 8, 1, -17);
      B.solid(6, 1, -29, 6, 6, -29); B.solid(10, 1, -29, 10, 6, -29); B.door(['p1'], 7, 1, -29, 9, 3, -29); B.solid(7, 4, -29, 9, 6, -29);
      B.exit(8, 1, -30);
    },
  },
  // ================================================================ roll 2
  {
    name: 'Key', film: 1,
    hint: 'Two doors, two plates, one crate. A door stays open while its plate is held, so take the crate with you once you are through.',
    sol: [
      { snap: [-1.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { print: [0.5, 1.47, -3.5], say: 'Print it on the first plate.' },
      { go: [-0.6, -2.4] },
      { go: [-0.5, -9.5], say: 'Go through the first door, around the crate.' },
      { snap: [0.5, 1.45, -3.5], say: 'Turn round and photograph the crate through the doorway.' },
      { print: [-1.5, 1.47, -10.5], say: 'Print it on the second plate.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -20, 1, 6);
      B.start(0, 1, 0);
      B.crate(-2, 1, -2);
      B.plate('p1', 0, 1, -4);
      B.solid(-3, 1, -7, -2, 6, -7); B.solid(-1, 4, -7, 1, 6, -7); B.door(['p1'], -1, 1, -7, 1, 3, -7); B.solid(2, 1, -7, 3, 6, -7);
      B.plate('p2', -2, 1, -11);
      B.solid(-3, 1, -14, -2, 6, -14); B.solid(-1, 4, -14, 1, 6, -14); B.door(['p2'], -1, 1, -14, 1, 3, -14); B.solid(2, 1, -14, 3, 6, -14);
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Ladder', film: 1,
    hint: 'Neither of these makes a high enough step on its own.',
    sol: [
      { snap: [-2.5, 1.45, -2.5], say: 'Photograph the crate.' },
      { print: [1.5, 1.47, -7.4], say: 'Print it a step out from the ledge.' },
      { snap: [3.5, 5.5, -2.5], say: 'Photograph the blue block.' },
      { print: [1.5, 2.75, -8.5], say: 'Hang it against the ledge behind the crate, one jump higher: a staircase.' },
      { go: [1.5, -6.3] },
      { go: [1.5, -7.4], jump: true },
      { go: [1.5, -8.5], jump: true, say: 'Crate, block, ledge.' },
      { go: [1.5, -11.5], jump: true },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 8);
      B.start(0, 1, 0);
      B.box([-4, 1, -14], [5, 4.5, -9]);
      B.crate(-3, 1, -3);
      B.block(3, 5, -3, 3, 5, -3, { fixed: true });
      B.exit(0, 4.5, -12);
    },
  },
  {
    name: 'Crossfire', film: 1,
    hint: 'The door wants weight on its plate. The beam is too high to jump. You have two things to work with.',
    sol: [
      { snap: [-2.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { print: [3.5, 1.47, -9.5], say: 'Print it on the plate beyond the beam.' },
      { snap: [3.5, 3, -1.5], say: 'Photograph the blue mirror.' },
      { print: [-2.2, 2.5, -7.5], yaw: 90, say: 'Hang it right in front of the emitter, facing it, so the beam goes straight back.' },
      { go: [0.5, -5] },
      { exit: true },
    ],
    nope: [
      // stand on the crate and jump the beam, then take the crate again from the far side: the low ceiling stops it
      [
        { snap: [-2.5, 1.45, -1.5] },
        { print: [0.5, 1.47, -5.0] },
        { tp: [0.5, 2.02, -4.6], yaw: 0 },
        { leap: [0.5, -5.1, 0.5, -10.0] },
        { snap: [0.5, 1.5, -5.0] },
        { print: [3.5, 1.47, -9.5] },
        { exit: true },
      ],
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 7);
      B.start(0, 1, 0);
      B.solid(-4, 1, -11, -2, 7, -11); B.solid(-1, 4, -11, 1, 7, -11); B.door(['p1'], -1, 1, -11, 1, 3, -11); B.solid(2, 1, -11, 4, 7, -11);
      // a low bulkhead over the beam, so nothing you stand on lets you jump it
      B.solid(-4, 4, -9, 4, 7, -7);
      B.solid(-4, 1, -8, -4, 1, -8, 'trim'); B.emitter(-4, 2, -8, -90, { locked: true });
      B.plate('p1', 3, 1, -10);
      B.crate(-3, 1, -2);
      B.mirror(3, 2, -2, 0, { fixed: true });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Periscope', film: 1,
    hint: 'The target is around two corners, and a beam only bends where it meets a mirror. You will need both.',
    sol: [
      { snap: [-2.5, 2, -0.5], say: 'Photograph the orange mirror.' },
      { print: [4.5, 2.0, -3.5], yaw: 45, say: 'Stand it in the beam to send it down the gap by the wall.' },
      { snap: [2.5, 3, -0.5], say: 'Photograph the blue mirror.' },
      { go: [5.5, 0.5] },
      { go: [5.5, -5.0], say: 'Walk round the end of the beam and down the gap by the wall.' },
      { print: [4.5, 2.0, -10.5], yaw: 135, say: 'Hang it at the far end to turn the beam onto the target.' },
      { go: [5.5, 0.5] }, { go: [5.5, -12] }, { go: [0.5, -12] },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -16, 1, 7);
      B.start(0, 1, 0);
      B.emitter(-5, 1, -4, -90, { locked: true });
      B.solid(-5, 1, -8, 3, 7, -8);
      B.receptor('r1', -5, 1, -11);
      B.solid(-5, 1, -14, -2, 7, -14); B.solid(-1, 4, -14, 1, 7, -14); B.door(['r1'], -1, 1, -14, 1, 3, -14); B.solid(2, 1, -14, 5, 7, -14);
      B.mirror(-3, 1, -1, 0);
      B.mirror(2, 2, -1, 0, { fixed: true });
      B.exit(0, 1, -15);
    },
  },
  {
    name: 'Copy Shop', film: 1, copy: true,
    hint: 'One crate, two plates. Double-X copies are just as heavy as the real thing.',
    sol: [
      { snap: [2.5, 1.45, -2.5], say: 'Copy the crate in the glass case.' },
      { print: [-2.5, 1.47, -6.5], say: 'Print the copy on one plate.' },
      { snap: [2.5, 1.45, -2.5], say: 'Copy it again.' },
      { go: [-0.5, -1.0] },
      { print: [3.5, 1.47, -6.5], say: 'Print it on the other plate.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 7);
      B.start(0, 1, 0);
      B.glassCase(2, 1, -3, 3, 2, -2);
      B.crate(2, 1, -3);
      B.plate('p1', -3, 1, -7); B.plate('p2', 3, 1, -7);
      B.solid(-4, 1, -10, -2, 7, -10); B.solid(-1, 4, -10, 1, 7, -10); B.door(['p1', 'p2'], -1, 1, -10, 1, 3, -10); B.solid(2, 1, -10, 4, 7, -10);
      B.exit(0, 1, -12);
    },
  },
  {
    name: 'Mouse Hole', film: 1, zoom: true,
    hint: 'Zoom works both ways: photograph something from far away, print it up close, and it comes out small.',
    sol: [
      { snap: [0.5, 1.45, 1.5], say: 'Photograph the crate from far away.' },
      { go: [-1.0, -11.0], say: 'Walk up close to the slot.' },
      { print: [-1.5, 1.13, -13.5], yaw: 0, scale: 0.28, say: 'Print it close up: on Zoom film it comes out tiny, small enough for the slot and its plate.' },
      { go: [1.5, -12.5] },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -18, 1, 6);
      B.start(0, 1, -9);
      B.crate(0, 1, 1);
      B.solid(-3, 1, -14, -3, 6, -14);
      B.box([-2, 1.5, -14], [-1, 7, -13], 'wall');
      B.plate('p1', -2, 1, -14);
      B.solid(-1, 1, -14, -1, 6, -14);
      B.door(['p1'], 0, 1, -14, 2, 3, -14); B.solid(0, 4, -14, 2, 6, -14);
      B.solid(3, 1, -14, 3, 6, -14);
      B.exit(1, 1, -16);
    },
  },
  {
    name: 'Fastball', film: 1, motion: true,
    hint: 'Action film remembers how fast things were going. Photograph the falling crate, then print it facing the glass: it flies the way you look. Fast things break fragile glass.',
    sol: [
      { wait: 1.5 },
      { snap: [3.5, 4, -2.5], say: 'Photograph the crate while it falls down the tube.' },
      { tp: [0.5, 1.02, -4] },
      { launch: [0.5, 2, -9.5], say: 'Print it facing the frosted window: it flies at the speed it was falling and smashes the glass.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 8);
      B.start(0, 1, 0);
      B.chute(3, -3, 1, 9);
      B.solid(-4, 1, -10, -1, 8, -10); B.solid(1, 1, -10, 4, 8, -10); B.solid(0, 3, -10, 0, 8, -10);
      B.fragile(0, 1, -10, 0, 2, -10);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Breakthrough', film: 1, motion: true,
    hint: 'Frosted glass stops beams. The crate in the tube never stops bouncing: photograph it while it is moving fast and send it through the window.',
    sol: [
      { tp: [-1.5, 1.02, -5.5] },
      { until: 'T.obj("crate").body.velocity.y > 9', t: 6 },
      { snap: 'crate', nowait: true, say: 'Photograph the bouncing crate while it is going fast.' },
      { tp: [-1.5, 1.02, -7.5] },
      { launch: [4.0, 3.5, -7.5], say: 'Throw it through the frosted window so the beam reaches the target.' },
      { go: [0.5, -12.5] },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -14, 1, 8);
      B.start(0, 1, 0);
      B.solid(-5, 1, -8, -5, 2, -8, 'trim'); B.emitter(-5, 3, -8, -90, { locked: true });
      B.solid(4, 1, -10, 4, 2, -6); B.solid(4, 3, -10, 4, 8, -9); B.solid(4, 3, -7, 4, 8, -6); B.solid(4, 4, -8, 4, 8, -8);
      B.fragile(4, 3, -8, 4, 3, -8, { axis: 'x', face: 'min' });
      B.solid(4, 1, -5, 5, 8, -5);
      B.solid(5, 1, -8, 5, 2, -8); B.receptor('r1', 5, 3, -8); B.solid(5, 4, -8, 5, 8, -8);
      B.solid(-5, 1, -11, -2, 8, -11); B.solid(-1, 4, -11, 1, 8, -11); B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(2, 1, -11, 5, 8, -11);
      B.pad(-3, 1, -3, { locked: true });
      B.chute(-3, -3, 1, 3.4, { loop: false });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Window Shopping', film: 1, motion: true,
    hint: 'Some things are kept behind glass. Fast things go through glass.',
    sol: [
      { wait: 1.5 },
      { snap: [3.5, 5, -2.5], say: 'Photograph the falling crate.' },
      { tp: [1.5, 1.02, -5.5], yaw: 90 },
      { launch: [-2.0, 1.5, -5.5], say: 'Smash the glass in front of the jump pad.' },
      { wait: 11 },
      { tp: [-0.5, 1.02, -5.5], yaw: 90 },
      { snap: [-3.5, 1.125, -5.5], say: 'Now photograph the pad.' },
      { print: [0.5, 1.13, -9.4], say: 'Print it below the ledge.' },
      { tp: [0.5, 1.02, -7.5] },
      { go: [0.5, -12.5], say: 'Bounce up.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 9);
      B.start(0, 1, 0);
      B.solid(-4, 1, -14, 4, 5, -11);
      B.solid(-4, 1, -7, -3, 9, -7); B.solid(-4, 1, -5, -3, 9, -5); B.solid(-4, 2, -6, -3, 9, -6);
      B.pad(-4, 1, -6);
      B.fragile(-3, 1, -6, -3, 1, -6, { axis: 'x', face: 'max' });
      B.chute(3, -3, 1, 10);
      B.exit(0, 6, -13);
    },
  },
  {
    name: 'Wish You Were Here', film: 1, postcard: true,
    hint: 'Postcard film photographs places, not things. Photograph the spot behind the glass, print the postcard, then walk into it.',
    sol: [
      { snap: [0.5, 1.6, -9.5], say: 'Photograph the photo spot behind the glass.' },
      { print: [0.5, 2.02, -3.0], yaw: 0, say: 'Print the postcard: it shows where it leads.' },
      { tp: [0.5, 1.02, -1.0] },
      { walkin: true, yaw: 0, say: 'Walk into it.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -14, 1, 6);
      B.start(0, 1, 0);
      B.glass(-4, 1, -8, 4, 6, -8);
      B.spot(0, 1, -10);
      B.exit(0, 1, -12);
    },
  },
  {
    name: 'Return to Sender', film: 1, postcard: true,
    hint: 'Anything that goes into a postcard comes out at the spot, crates included. The plate is sealed behind glass.',
    sol: [
      { snap: [4.5, 1.6, -6.5], say: 'Photograph the spot on the plate, through the glass.' },
      { print: [-2.5, 2.0, -2.5], yaw: 0, say: 'Print the postcard right over the crate: it goes through and lands on the plate.' },
      { wait: 1 },
      { go: [1.6, -6] },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -14, 1, 7);
      B.start(0, 1, 0);
      B.glass(2, 1, -9, 5, 7, -9); B.glass(2, 1, -5, 5, 7, -5); B.glass(2, 1, -9, 2, 7, -5);
      B.plate('p1', 4, 1, -7); B.spot(4, 1, -7);
      B.crate(-3, 1, -3);
      B.solid(-5, 1, -11, -2, 7, -11); B.solid(-1, 4, -11, 1, 7, -11); B.door(['p1'], -1, 1, -11, 1, 3, -11); B.solid(2, 1, -11, 5, 7, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Postmark', film: 1, postcard: true,
    hint: 'The spot on the ledge can only be seen from high up. You can take a photo in mid-air.',
    sol: [
      { tp: [2.5, 1.3, -2.5] },
      { until: '__shutter.player.position.y > 4 && __shutter.player.velocity.y < 0.6', t: 4 },
      { snap: [0.5, 9.0, -10.5], say: 'Bounce, and photograph the spot on the ledge from the top of the bounce.' },
      { until: '__shutter.player.position.y < 1.6 && __shutter.player.velocity.y <= 0', t: 4 },
      { tp: [0.5, 1.02, -1], yaw: 0 },
      { print: [0.5, 2.02, -4.0], yaw: 0, say: 'Back on the floor, print the postcard.' },
      { walkin: true, yaw: 0, say: 'Step through to the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -12, 1, 13);
      B.start(0, 1, 0);
      B.solid(-4, 1, -12, 4, 6, -9);
      B.solid(-4, 7, -9, 4, 7, -9, 'trim');
      B.spot(0, 7, -11);
      B.pad(2, 1, -3);
      B.exit(-2, 7, -11);
    },
  },
  {
    name: 'Round Trip', film: 1, postcard: true,
    hint: 'Gray crates can’t be photographed, but they can be shoved, and a postcard takes anything that goes into it. Make sure you have a way back out.',
    sol: [
      { snap: [-3.5, 1.6, -5.5], say: 'Photograph the spot in the left glass room.' },
      { print: [0.5, 2.02, -2.7], yaw: 0, say: 'Print the postcard and step in.' },
      { tp: [0.5, 1.02, -1.0] },
      { walkin: true, yaw: 0 },
      { snap: [4.5, 1.6, -7.5], say: 'From inside, photograph the spot on the plate in the right room.' },
      { print: [-4.5, 2.1, -7.5], yaw: 90, say: 'Print that postcard over the gray crate: it lands on the plate.' },
      { wait: 1 },
      { snap: [0.5, 1.6, -2.5], say: 'Photograph the spot outside, through the glass.' },
      { print: [-3.5, 2.02, -8.3], yaw: 0, say: 'Print it here and walk out.' },
      { tp: [-3.5, 1.02, -6.4] },
      { walkin: true, yaw: 0 },
      { exit: true },
    ],
    build(B) {
      B.shell(-6, 6, -16, 1, 7);
      B.start(0, 1, 0);
      B.glass(-6, 1, -10, -2, 7, -10); B.glass(-6, 1, -5, -2, 7, -5); B.glass(-2, 1, -10, -2, 7, -5);
      B.spot(-4, 1, -6);
      B.crate(-5, 1, -8, { pinned: true });
      B.glass(2, 1, -10, 6, 7, -10); B.glass(2, 1, -5, 6, 7, -5); B.glass(2, 1, -10, 2, 7, -5);
      B.plate('p1', 4, 1, -8); B.spot(4, 1, -8);
      B.spot(0, 1, -3);
      B.solid(-6, 1, -13, -2, 7, -13); B.solid(-1, 4, -13, 1, 7, -13); B.door(['p1'], -1, 1, -13, 1, 3, -13); B.solid(2, 1, -13, 6, 7, -13);
      B.exit(0, 1, -15);
    },
  },
  {
    name: 'Bulb', film: 1, exposure: true,
    hint: 'Slow film keeps the shutter open for as long as you hold it. Something moving leaves a streak, and the streak prints as one long solid. Blue streaks float.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 3.2, say: 'Hold the shutter on the moving platform for its whole trip.' },
      { print: [0.5, 1.17, -9], rest: 1.0, yaw: 90, say: 'Print the streak across the gap, resting on both edges.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -19, 0, 7, false);
      B.solid(-3, 0, -6, 3, 0, 0, 'floor');
      B.solid(-3, 0, -19, 3, 0, -13, 'floor');
      B.start(0, 1, 0);
      B.glassCase(-3, 3, -12, -2, 3, -1);
      B.shuttle([-2.5, 3.1, -11], [-2.5, 3.1, -2], { speed: 3, size: [1.6, 0.3, 1] });
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Time Lapse', film: 1, exposure: true,
    hint: 'Lethal beams cross the room one above another, too many to jump. A streak can block them all if it is tall enough: hold the shutter on the lift for longer.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 2.4, say: 'Expose the lift while it rises: the streak comes out tall.' },
      { print: [-1.5, 2.75, -7.5], rest: 1.0, yaw: 0, say: 'Stand the streak in the beams.' },
      { exit: true },
    ],
    nope: [
      // a quick snapshot of the lift blocks one beam; jumping the lowest one meets the one overhead
      [{ tap: 'shuttle', when: 'A' }, { print: [-2.5, 2.5, -7.5], yaw: 0 }, { go: [0.5, -4.5] }, { go: [0.5, -12], jump: true }, { exit: true, n: 400 }],
      [{ tap: 'shuttle', when: 'A' }, { print: [-2.5, 1.62, -7.5], yaw: 0 }, { go: [0.5, -4.5] }, { go: [0.5, -12], jump: true }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 8);
      B.start(0, 1, 0);
      B.glassCase(2, 1, -3, 2, 6, -3);
      B.shuttle([2, 1.05, -3], [2, 5.5, -3], { speed: 2, size: [0.86, 0.3, 0.86] });
      B.emitter(-4, 1, -8, -90, { locked: true });
      B.emitter(-4, 2, -8, -90, { locked: true });
      B.emitter(-4, 3, -8, -90, { locked: true });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Express', film: 1, exposure: true,
    hint: 'The shuttle carries you, but not far enough. Expose it and print what you caught.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 2.6, say: 'Expose the platform for its whole trip.' },
      { print: [0.5, 0.85, -15.6], yaw: 90, say: 'Print the streak beyond where the platform stops.' },
      { go: [0.5, -5.6], say: 'Wait at the edge for the platform to come back.' },
      { until: 'T.shuttle().track.s < 0.35 && T.shuttle().track.dir < 0', t: 10 },
      { go: [0.5, -7.1], say: 'Step on as it arrives and ride it out, then walk onto the streak.' },
      { wait: 2.3 },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -24, 0, 7, false);
      B.solid(-3, 0, -6, 3, 0, 0, 'floor');
      B.solid(-3, 0, -24, 3, 0, -20, 'floor');
      B.start(0, 1, 0);
      B.shuttle([0, 0.7, -7], [0, 0.7, -12], { speed: 2, size: [1.4, 0.3, 1.4] });
      B.exit(0, 1, -22);
    },
  },
  {
    name: 'Double Glazing', film: 1, motion: true,
    hint: 'Teal-striped glass grows back a moment after it breaks, unless the whole window goes at once. Breaking the first pane slows the crate, so catch it at its fastest.',
    sol: [
      { tp: [-0.5, 1.02, -5] },
      { until: 'T.obj("crate").body.velocity.y > 10', t: 6 },
      { snap: 'crate', nowait: true, say: 'Photograph the crate as it shoots up, at its fastest.' },
      { tp: [0.5, 1.02, -5] },
      { launch: [0.5, 2.2, -9], say: 'Throw it high at the window: it needs speed for both panes.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-4, 4, -16, 1, 8);
      B.start(0, 1, 0);
      B.solid(-4, 1, -10, -1, 8, -10); B.solid(1, 1, -10, 4, 8, -10); B.solid(0, 3, -10, 0, 8, -10);
      B.fragile(0, 1, -10, 0, 2, -10, { face: 'max', group: 'w', heal: 1.2 });
      B.fragile(0, 1, -10, 0, 2, -10, { face: 'min', group: 'w', heal: 1.2 });
      B.pad(2, 1, -3, { locked: true, scale: 1.6 }); // a big pad: the crate leaves it fast enough that a human's click isn't too late
      B.chute(2, -3, 1, 3.4, { loop: false });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Heavy Exposure', film: 1, exposure: true,
    hint: 'An orange streak has weight, just like the thing that made it. The door wants both plates held at once.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 3.3, say: 'Expose the orange platform across its whole track.' },
      { print: [0.5, 1.22, -4.5], yaw: 0, say: 'Lay the heavy streak across both plates.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 5, -14, 1, 7);
      B.start(0, 1, 0);
      B.glassCase(-5, 4, -9, 5, 4, -9);
      B.shuttle([-4, 4.1, -9], [4, 4.1, -9], { speed: 2.5, size: [1, 0.4, 0.8], orange: true });
      B.plate('p1', -3, 1, -5); B.plate('p2', 3, 1, -5);
      B.solid(-5, 1, -11, -2, 7, -11); B.solid(-1, 4, -11, 1, 7, -11); B.door(['p1', 'p2'], -1, 1, -11, 1, 3, -11); B.solid(2, 1, -11, 5, 7, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Second Exposure', film: 1, exposure: true,
    hint: 'This shuttle has a short track, so its streaks come out short. The gap needs more than one.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 2.5, say: 'Expose the platform for a full trip.' },
      { print: [0.5, 0.85, -9.2], yaw: 90, say: 'Print the streak a jump away from the edge.' },
      { tp: [0.5, 1.02, -1.5], yaw: 0 },
      { runjump: 1, say: 'Jump onto it.' },
      { expose: 'shuttle', when: 'A', hold: 2.5, say: 'Expose the platform again from out there.' },
      { print: [0.5, 0.85, -15.0], yaw: 90, say: 'Print the second streak another jump ahead.' },
      { face: 0 },
      { runjump: 2, say: 'Jump along to the far side.' },
      { exit: true },
    ],
    build(B) {
      B.shell(-3, 3, -26, 0, 7, false);
      B.solid(-3, 0, -5, 3, 0, 0, 'floor');
      B.solid(-3, 0, -26, 3, 0, -19, 'floor');
      B.start(0, 1, 0);
      B.glassCase(2, 3, -5, 3, 3, -1);
      B.shuttle([2.5, 3.1, -4], [2.5, 3.1, -2], { speed: 3, size: [1.6, 0.3, 1.2] });
      B.exit(0, 1, -23);
    },
  },
  {
    name: 'Air Mail', film: 1, motion: true, postcard: true,
    hint: 'Things keep their speed through a postcard, and come out heading the way the spot’s arrow points. Throw something fast into one.',
    sol: [
      { tp: [2.5, 1.02, -4] },
      { snap: [2.5, 1.6, -9.5], say: 'Photograph the photo spot in the glass room.' },
      { tp: [-1.5, 1.02, -1] },
      { print: [-1.5, 2.02, -4.2], yaw: 0, say: 'Print the postcard near the chute.' },
      { tp: [-1.5, 1.02, 0.5], yaw: 180 },
      { snap: [-3.5, 4, -1.5], say: 'Photograph the falling crate.' },
      { tp: [-1.5, 1.02, 1.4] },
      { launch: [5.0, 1.6, -9.5], via: [-1.5, 2.0, -4.2], say: 'Throw it into the postcard. The arc shows it coming out of the spot and into the frosted window.' },
      { wait: 2 },
      { go: [-3, -4] }, { go: [-3, -12.6] }, { go: [0.5, -12.6] },
      { exit: true },
    ],
    build(B) {
      B.shell(-5, 6, -16, 1, 7);
      B.start(0, 1, 0);
      B.chute(-4, -2, 1, 8);
      // a sealed glass room with a photo spot, a frosted window in its far wall and the target inside
      B.glass(-1, 1, -12, 4, 7, -12); B.glass(-1, 1, -7, 4, 7, -7); B.glass(-1, 1, -12, -1, 7, -7);
      B.spot(2, 1, -10, -90);
      B.receptor('r1', 0, 1, -10);
      B.solid(5, 1, -12, 5, 7, -11); B.solid(5, 1, -9, 5, 7, -6); B.solid(5, 3, -10, 5, 7, -10);
      B.fragile(5, 1, -10, 5, 2, -10, { axis: 'x', face: 'min' });
      // the emitter waits in a sealed bay behind the window
      B.solid(6, 1, -12, 6, 7, -11); B.solid(6, 1, -9, 6, 7, -6); B.solid(6, 2, -10, 6, 7, -10);
      B.emitter(6, 1, -10, 90, { locked: true });
      B.solid(-5, 1, -14, -2, 7, -14); B.solid(-1, 4, -14, 1, 7, -14); B.door(['r1'], -1, 1, -14, 1, 3, -14); B.solid(2, 1, -14, 6, 7, -14);
      B.exit(0, 1, -15);
    },
  },
  {
    name: 'Crosswise', film: 1,
    hint: 'This strip lies the wrong way round. Turn a print before you place it: hold R and move the mouse, swipe sideways, or press Z and X.',
    sol: [
      { snap: [0.5, 1.15, -1.5], say: 'Photograph the strip lying across the room.' },
      { tp: [0.5, 1.02, -2.6] },
      { print: [0.5, 1.15, -7.0], yaw: 90, say: 'Turn it a quarter turn so it points across the drop, and print it.' },
      { go: [0.5, -11] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-3, -14, 3, 0, 6]], { pits: [[-3, -10, 3, -5]] });
      B.start(0, 1, 0);
      B.plank(-3, -2, 3, -2, { top: 1.3 });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Terrace', film: 1,
    hint: 'One block, two climbs. You can photograph something again from wherever you end up.',
    sol: [
      { snap: [1.5, 1.5, -1.5], say: 'Photograph the block.' },
      { print: [0.5, 1.52, -3.5], say: 'Print it against the first terrace.' },
      { go: [0.5, -6.5], jump: true, say: 'Climb up.' },
      { go: [0.5, -4.5] },
      { snap: [0.5, 1.5, -3.5], say: 'From the edge, photograph the block below.' },
      { print: [0.5, 3.52, -8.5], say: 'Print it against the second terrace.' },
      { go: [0.5, -12], jump: true, say: 'Climb again.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-3, -15, 3, 0, 8]]);
      B.start(0, 1, 0);
      B.solid(-3, 1, -9, 3, 2, -5);
      B.solid(-3, 1, -15, 3, 4, -10);
      B.block(1, 1, -2, 1, 1, -2);
      B.exit(0, 5, -13);
    },
  },
  {
    name: 'Counterweight', film: 1,
    hint: 'The door wants both plates held while you walk through it. Anything printed is weight, even something blue.',
    sol: [
      { snap: [2.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { print: [-2.5, 1.47, -5.5], say: 'Print it on the near plate.' },
      { go: [6.0, -6.0], say: 'Go round the corner.' },
      { snap: [8.5, 4.5, -4.5], say: 'Photograph the blue block up high.' },
      { print: [8.5, 1.52, -6.5], say: 'Print it on the far plate.' },
      { go: [0.5, -7.5] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -8, 4, 0, 7], [5, -8, 10, -3, 7], [-1, -13, 1, -9, 7]]);
      B.start(0, 1, 0);
      B.crate(2, 1, -2);
      B.plate('p1', -3, 1, -6);
      B.plate('p2', 8, 1, -7);
      B.block(8, 4, -5, 8, 4, -5, { fixed: true });
      B.door(['p1', 'p2'], -1, 1, -9, 1, 3, -9); B.solid(-1, 4, -9, 1, 7, -9);
      B.exit(0, 1, -12);
    },
  },
  {
    name: 'Shield', film: 1,
    hint: 'Three beams, too high to jump, and one blue block. Block a beam at its source, walk past, then take the block with you.',
    sol: [
      { snap: [1.5, 2.5, -0.5], say: 'Photograph the blue block.' },
      { print: [-0.4, 2.5, -3.5], say: 'Hang it right in front of the first emitter.' },
      { go: [1.0, -6.0], say: 'Walk past.' },
      { snap: [-0.4, 2.5, -3.5], say: 'Turn round and photograph the block again.' },
      { print: [-0.4, 2.5, -8.5], say: 'Block the second emitter the same way.' },
      { go: [1.0, -11.5] },
      { go: [-1.0, -11.5] },
      { snap: [-0.4, 2.5, -8.5] },
      { print: [-6.5, 2.5, -12.4], say: 'Round the corner, block the third.' },
      { go: [-9.0, -11.5] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-2, -14, 1, 0, 6], [-12, -14, -3, -12, 6]]);
      B.start(0, 1, 0);
      B.block(1, 2, -1, 1, 2, -1, { fixed: true });
      B.emitter(-2, 2, -4, -90, { locked: true });
      B.emitter(-2, 2, -9, -90, { locked: true });
      B.emitter(-7, 2, -14, 180, { locked: true });
      B.exit(-11, 1, -12);
    },
  },
  {
    name: 'Catch', film: 1,
    hint: 'One bounce gets you close. You can print in mid-air, and a blue print can go as high as the pad threw you.',
    sol: [
      { snap: [0.0, 1.15, -0.5], say: 'Photograph the blue strip.' },
      { tp: [0.5, 1.3, -3.5] },
      { until: '__shutter.player.position.y > 5 && __shutter.player.velocity.y < 0.4', t: 4 },
      { js: '(window.__REAL ? T.realPrint : (x, y, z, w) => __shutter.printAt(x, y, z, w))(__shutter.player.position.x, __shutter.player.position.y - 0.22, __shutter.player.position.z - 2.5, 90)', say: 'Bounce on the pad. At the top, print the strip under your feet, pointing at the ledge.' },
      { ground: true },
      { go: [0.5, -12], jump: true, say: 'Walk along it and jump up onto the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-3, -14, 3, 0, 12]]);
      B.start(0, 1, 0);
      B.solid(-3, 1, -14, 3, 7, -10);
      B.pad(0, 1, -4, { locked: true });
      B.plank(-3, -1, 2, -1, { top: 1.3, fixed: true });
      B.exit(0, 8, -12);
    },
  },
  {
    name: 'Freefall', film: 1,
    hint: 'The way on is halfway down the shaft, and the shaft has no bottom. You can print below yourself while you fall.',
    sol: [
      { snap: [1.5, 13.5, 0.5], say: 'Photograph the blue block next to you.' },
      { face: 0 },
      { until: '(__shutter.keys.KeyW = true, __shutter.player.position.y < 7.5)', t: 4, say: 'Run off the balcony into the shaft.' },
      { js: '__shutter.keys.KeyW = false' },
      { below: 0.6, say: 'Level with the tunnel, print the block under your feet.' },
      { ground: true },
      { go: [0.5, -9.5], say: 'Step into the tunnel.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-2, -6, 2, 0, 16], [-2, -12, 2, -7, 16]], { floor: false });
      B.solid(-2, -4, -1, 2, 12, 0);
      B.start(0, 13, 0);
      B.block(1, 13, 0, 1, 13, 0, { fixed: true });
      B.solid(-2, -4, -12, 2, 4, -7); // a tall tunnel mouth (4 m), so a mid-air print needn't be pixel-perfect
      B.solid(-2, 9, -12, 2, 16, -7);
      B.exit(0, 5, -11);
    },
  },
  {
    name: 'Scale Model', film: 1, zoom: true,
    hint: 'A pad bounces in proportion to its size, so a model pad only hops. Photograph it up close and print it far away to make it big.',
    sol: [
      { tp: [-2.5, 1.02, -1.6], yaw: 0 },
      { snap: [-2.5, 2.04, -2.5], say: 'Photograph the little pad from close up.' },
      { go: [0.5, -1.4] },
      { print: [0.5, 1.21, -7.0], scale: 1.7, say: 'Print it far away, so it comes out big, near the ledge.' },
      { tp: [0.5, 1.02, -4.0], yaw: 0 },
      { go: [0.5, -12], say: 'Bounce up onto the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -15, 4, 0, 14]]);
      B.start(0, 1, 0);
      B.solid(-4, 1, -15, 4, 8, -10);
      B.solid(-3, 1, -3, -3, 1, -3, 'trim');
      B.glassCase(-3, 2, -3, -3, 2, -3);
      B.miniPad(-2.5, 2, -2.5, 0.3);
      B.exit(0, 9, -13);
    },
  },
  {
    name: 'Magnify', film: 1, zoom: true,
    hint: 'The beam runs far above your head. A mirror stands as tall as you print it.',
    sol: [
      { tp: [2.5, 1.02, -0.4], yaw: 0 },
      { snap: [2.5, 2.4, -1.5], say: 'Photograph the little mirror from close up.' },
      { go: [2.5, 0.6] },
      { print: [2.5, 3.62, -6.5], yaw: 45, scale: 2.6, say: 'Print it far away so it stands tall enough to catch the beam, turned to send it to the target.' },
      { go: [0.5, -9] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -14, 4, 0, 9]]);
      B.start(0, 1, 0);
      B.emitter(-4, 5, -7, -90, { locked: true });
      B.solid(-4, 1, -11, -2, 9, -11); B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 9, -11);
      B.solid(2, 1, -11, 2, 4, -11); B.receptor('r1', 2, 5, -11); B.solid(2, 6, -11, 2, 9, -11); B.solid(3, 1, -11, 4, 9, -11);
      B.solid(2, 1, -2, 2, 1, -2, 'trim');
      B.miniMirror(2.5, 2, -1.5, 0.4);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Paper Trail', film: 1, copy: true,
    hint: 'Three gaps, two pillars and one strip of floor on a shelf. The far door wants a plank resting on every plate at once, and Double-X makes as many copies as you like.',
    sol: [
      { snap: [2.5, 2.15, -2.0], say: 'Copy the strip on the shelf.' },
      { print: [0.5, 1.15, -7.5], say: 'Lay the copy from the edge to the first pillar.' },
      { go: [0.5, -10.25] },
      { snap: [2.5, 2.15, -2.0], say: 'From the pillar, copy it again.' },
      { print: [0.5, 1.15, -13.6], say: 'Lay it to the second pillar.' },
      { go: [0.5, -16.25] },
      { snap: [2.5, 2.15, -2.0], say: 'And once more.' },
      { print: [0.5, 1.15, -19.62], say: 'Lay the last one to the far side.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-2, -27, 2, 0, 7]], { pits: [[-2, -22, 2, -6]] });
      B.solid(-2, -4, -11, 2, 0, -11, 'trim');
      B.solid(-2, -4, -17, 2, 0, -17, 'trim');
      B.start(0, 1, 0);
      B.solid(2, 1, -5, 2, 1, 0, 'trim');
      B.plank(2, -5, 2, 0, { top: 2.3 });
      // a plate where each plank's far end comes to rest: both pillars and the far side
      B.plate('p1', 0, 1, -11); B.plate('p2', 0, 1, -17); B.plate('p3', 0, 1, -23);
      B.solid(-2, 1, -24, -2, 7, -24); B.door(['p1', 'p2', 'p3'], -1, 1, -24, 1, 3, -24); B.solid(-1, 4, -24, 1, 7, -24); B.solid(2, 1, -24, 2, 7, -24);
      B.exit(0, 1, -26);
    },
  },
  {
    name: 'Choir', film: 1, copy: true,
    hint: 'Three plates, one crate, and a ledge with the door on it. Copies weigh as much as the real thing, and make steps just as well.',
    sol: [
      { snap: [3.5, 1.45, -0.5], say: 'Copy the crate in the case.' },
      { print: [-2.5, 1.47, -4.5], say: 'One copy on the left plate.' },
      { snap: [3.5, 1.45, -0.5] }, { print: [3.5, 1.47, -4.5], say: 'One on the right plate.' },
      { snap: [3.5, 1.45, -0.5] }, { print: [0.5, 1.47, -6.55], say: 'One against the ledge, as a step.' },
      { go: [0.5, -8.8], jump: true, say: 'Climb up.' },
      { snap: [3.5, 1.45, -0.5], say: 'Copy it once more from up here.' },
      { print: [-2.5, 3.47, -10.5], say: 'Put it on the plate up on the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -15, 4, 0, 8]]);
      B.start(0, 1, 0);
      B.solid(-4, 1, -15, 4, 2, -8);
      B.glassCase(3, 1, -1, 3, 1, -1);
      B.crate(3, 1, -1);
      B.plate('p1', -3, 1, -5); B.plate('p2', 3, 1, -5); B.plate('p3', -3, 3, -11);
      B.solid(-4, 3, -13, -2, 8, -13); B.door(['p1', 'p2', 'p3'], -1, 3, -13, 1, 5, -13); B.solid(-1, 6, -13, 1, 8, -13); B.solid(2, 3, -13, 4, 8, -13);
      B.exit(0, 3, -14);
    },
  },
  {
    name: 'Splitter', film: 1, copy: true,
    hint: 'Three targets and one emitter behind glass. Turn each copy until its preview line turns green.',
    sol: [
      { snap: [0.5, 2.5, -1.5], say: 'Copy the emitter in the case.' },
      { go: [2.5, -4.0], say: 'Walk round the east side of the case: its own beam runs west.' },
      { print: [-4.5, 2.5, -7.0], yaw: 0, say: 'Aim one copy at the target by the far wall.' },
      { snap: [0.5, 2.5, -1.5] }, { print: [-2.5, 2.5, -9.5], yaw: 90, say: 'Aim another at the left target.' },
      { snap: [0.5, 2.5, -1.5] }, { print: [3.5, 2.5, -9.5], yaw: -90, say: 'And the last at the right target.' },
      { go: [2.0, -13.0] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 8], [1, -18, 3, -15, 8]]);
      B.start(0, 1, 0);
      B.solid(0, 1, -2, 0, 1, -2, 'trim'); B.glassCase(0, 2, -2, 0, 2, -2);
      B.emitter(0, 2, -2, 90, { fixed: true });
      B.solid(-5, 1, -14, -5, 1, -14, 'trim'); B.receptor('r1', -5, 2, -14);
      B.solid(-6, 1, -10, -6, 1, -10, 'trim'); B.receptor('r2', -6, 2, -10);
      B.solid(6, 1, -10, 6, 1, -10, 'trim'); B.receptor('r3', 6, 2, -10);
      B.door(['r1', 'r2', 'r3'], 1, 1, -15, 3, 3, -15); B.solid(1, 4, -15, 3, 8, -15);
      B.exit(2, 1, -17);
    },
  },
  {
    name: 'Darkroom', film: 1,
    hint: 'Anything standing in red safelight won’t show up on film. Wait for the platform to slide out of the light.',
    sol: [
      { until: 'T.shuttle().body.position.x > 3.05', t: 10 },
      { snap: 'shuttle', say: 'Photograph the sliding platform the moment it leaves the red light.' },
      { print: [0.5, 1.17, -8.5], yaw: 0, say: 'Print it across the pit as a bridge.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -19, 4, 0, 8]], { pits: [[-4, -12, 4, -6]] });
      B.start(0, 1, 0);
      B.shuttle([-3, 4, -4], [3, 4, -4], { speed: 2.4, size: [1, 0.3, 7.6] });
      B.safelight(-4, 1, -8, 2, 8, 0);
      B.exit(0, 1, -16);
    },
  },
  {
    name: 'Keyhole', film: 1, zoom: true, motion: true, diff: 7.5,
    hint: 'The frosted block stops the beam, and only a crate thrown hard will break it. Nothing your size gets through that port, so make the crate smaller: on Zoom film, the farther away you photograph something, the smaller it prints up close.',
    sol: [
      { tp: [0.5, 1.02, -10.0], yaw: 180 },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'From the far end of the room, photograph the falling crate. It is a long way off, so it will print small.' },
      { launch: [0.5, 2.33, -14.0], say: 'Pull the print in close and throw it through the port at the frosted block.' },
      { wait: 1 },
      { go: [3.0, -7.5] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -12, 4, 0, 8], [-4, -16, 4, -13, 8], [5, -8, 8, -6, 8]]);
      B.start(0, 1, 0);
      B.chute(3, -1, 1, 8);
      // the machine room: a crawlspace one cell high behind a glass wall, with a small port at eye level
      B.solid(-4, 1, -16, 4, 1, -14); B.box([-4, 1, -13], [5, 2, -12.56]);
      B.solid(-4, 3, -16, 4, 8, -14); B.box([-4, 3, -13], [5, 9, -12.56]);
      B.glass(-4, 1, -13, -1, 8, -13, { axis: 'z' }); B.glass(1, 1, -13, 4, 8, -13, { axis: 'z' });
      B.glass(0, 3, -13, 0, 8, -13, { axis: 'z' }); B.glass(0, 1, -13, 0, 1, -13, { axis: 'z' });
      B.box([0, 2, -12.56], [1, 2.22, -12.44], 'trim'); B.box([0, 2.78, -12.56], [1, 3, -12.44], 'trim');
      B.box([0, 2.22, -12.56], [0.22, 2.78, -12.44], 'trim'); B.box([0.78, 2.22, -12.56], [1, 2.78, -12.44], 'trim');
      B.emitter(-4, 2, -15, -90, { locked: true });
      B.fragile(0, 2, -15, 0, 2, -15, { slab: true });
      B.receptor('r1', 4, 2, -15);
      B.door(['r1'], 5, 1, -8, 5, 3, -6); B.solid(5, 4, -8, 5, 8, -6);
      B.exit(7, 1, -7);
    },
  },
  {
    name: 'Rapid Fire', film: 3, copy: true, motion: true, diff: 8,
    hint: 'Teal glass grows back unless the whole set breaks together, and the door wants all three targets lit. Double-X copies keep the speed of what you copied, and the original keeps falling.',
    sol: [
      { tp: [0.5, 1.02, -8.5] },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'Copy the falling crate while it is going fast.' },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'Copy it again, and again: three fast crates.' },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate' },
      { launch: [-2.5, 4.0, -6.0], settle: 6, say: 'Throw them at the three teal windows, one after another, before the first one heals.' },
      { launch: [3.5, 4.0, -10.0], settle: 6 },
      { launch: [1.0, 4.0, -12.5], settle: 30 },
      { wait: 4 },
      { go: [4.5, -16.0] },
      { exit: true },
    ],
    nope: [
      [
        { tp: [0.5, 1.02, -8.5] },
        { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' },
        { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' },
        { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' },
        { launch: [-2.5, 4.0, -6.0], settle: 240 },
        { launch: [3.5, 4.0, -10.0], settle: 240 },
        { launch: [1.0, 4.0, -12.5], settle: 240 },
        { go: [4.5, -16.0] },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-7, -16, 7, 0, 8], [3, -20, 5, -17, 8]]);
      B.start(-2, 1, -1);
      B.chute(5, -2, 1, 8);
      // three beams cross the room above your head; a teal window on a pedestal stops each one
      B.solid(-7, 1, -6, -7, 2, -6, 'trim'); B.emitter(-7, 3, -6, -90, { locked: true });
      B.solid(7, 1, -6, 7, 2, -6, 'trim'); B.receptor('rA', 7, 3, -6);
      B.solid(-3, 1, -7, -3, 2, -6, 'trim'); B.fragile(-3, 3, -7, -3, 4, -6, { axis: 'x', group: 'w', heal: 3 });
      B.solid(7, 1, -11, 7, 2, -11, 'trim'); B.emitter(7, 3, -11, 90, { locked: true });
      B.solid(-7, 1, -11, -7, 2, -11, 'trim'); B.receptor('rB', -7, 3, -11);
      B.solid(3, 1, -11, 3, 2, -10, 'trim'); B.fragile(3, 3, -11, 3, 4, -10, { axis: 'x', group: 'w', heal: 3 });
      B.solid(0, 1, -16, 0, 2, -16, 'trim'); B.emitter(0, 3, -16, 180, { locked: true });
      B.solid(0, 1, 0, 0, 2, 0, 'trim'); B.receptor('rC', 0, 3, 0);
      B.solid(0, 1, -13, 1, 2, -13, 'trim'); B.fragile(0, 3, -13, 1, 4, -13, { axis: 'z', group: 'w', heal: 3 });
      B.door(['rA', 'rB', 'rC'], 3, 1, -17, 5, 3, -17); B.solid(3, 4, -17, 5, 8, -17);
      B.exit(4, 1, -19);
    },
  },
  {
    name: 'Recall', film: 1, diff: 6.5,
    hint: 'The door is open while the crate sits on its plate. Whatever falls into the void comes back exactly where it started.',
    sol: [
      { snap: [4.5, 1.45, -10.5], say: 'Photograph the crate in the glass vault. The door shuts.' },
      { go: [-2.0, -6.5] },
      { print: [-3.5, 1.47, -7.5], say: 'Print it against the ledge as a step.' },
      { go: [-3.5, -6.4] },
      { go: [-3.5, -10.5], jump: true, say: 'Climb up onto the ledge.' },
      { go: [-3.5, -8.4] },
      { snap: [-3.5, 1.45, -7.5], say: 'From the edge, photograph the crate below you.' },
      { print: [-4.5, 1.5, -4.5], say: 'Drop it into the void. It falls out of frame, and comes back on its plate in the vault.' },
      { wait: 2 },
      { exit: true },
    ],
    nope: [
      [
        { tp: [-3.5, 1.02, -7.5], yaw: 0 },
        { go: [-3.5, -10.5], jump: true },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-6, -13, 6, 0, 9], [-6, -17, -3, -14, 9]], { pits: [[-6, -6, -3, -3]] });
      B.start(0, 1, 0);
      // the vault: a crate on the plate behind glass, and the door it holds open
      B.glass(2, 1, -13, 2, 9, -9, { axis: 'x' }); B.glass(3, 1, -9, 6, 9, -9, { axis: 'z' });
      B.plate('p1', 4, 1, -11); B.crate(4, 1, -11);
      // the ledge, two cells high, with the door at the back of it
      B.solid(-6, 1, -13, -2, 2, -9);
      B.solid(-6, 1, -14, -6, 9, -14); B.solid(-2, 1, -14, -2, 9, -14);
      B.solid(-6, 1, -15, -3, 2, -14); B.door(['p1'], -5, 3, -15, -3, 5, -15); B.solid(-6, 3, -15, -6, 9, -15); B.solid(-5, 6, -15, -3, 9, -15);
      B.solid(-6, 1, -17, -3, 2, -16);
      B.exit(-4, 3, -16);
    },
  },
  {
    name: 'Freight Mail', film: 2, exposure: true, postcard: true, diff: 8.5,
    hint: 'The door wants both plates in the mail room held at once, and nobody can take film in there. Parcels go through postcards just fine, and they come out turned the way they went in.',
    sol: [
      { expose: 'shuttle', when: 'A', hold: 3.0, say: 'Expose the orange platform for its whole trip: a long, heavy streak.' },
      { snap: [0.5, 1.6, -13.5], say: 'Photograph the photo spot in the mail room, through the glass.' },
      { print: [0.5, 2.02, -6.0], yaw: 0, say: 'Print the postcard in the hall.' },
      { print: [0.5, 1.5, -6.0], yaw: 0, say: 'Turn the streak to lie flat across the card, and print it right on it. It comes out across both plates.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      [
        { expose: 'shuttle', when: 'A', hold: 3.0 },
        { snap: [0.5, 1.6, -13.5] },
        { print: [0.5, 2.02, -6.0], yaw: 0 },
        { print: [0.5, 1.5, -6.0], yaw: 90 },
        { wait: 1.5 },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-8, -17, 8, 0, 8], [-12, -6, -9, -4, 8]], { pits: [[-8, -17, 8, -12]] });
      B.start(0, 1, -1);
      // the mail room: three islands in a void behind glass, all of it light-leaked
      B.glass(-8, 1, -11, 8, 8, -11, { axis: 'z' });
      B.solid(-3, 0, -15, -3, 0, -13, 'floor'); B.solid(0, 0, -15, 0, 0, -13, 'floor'); B.solid(3, 0, -15, 3, 0, -13, 'floor');
      B.plate('p1', -3, 1, -14); B.plate('p2', 3, 1, -14);
      B.spot(0, 1, -14);
      B.leak(-4, 1, -15, 4, 8, -13);
      // the freight shuttle, running along the east wall in a glass case
      B.glassCase(7, 4, -9, 7, 4, -1);
      B.shuttle([7, 4.1, -9], [7, 4.1, -2], { speed: 2.5, size: [0.8, 0.4, 1], orange: true });
      B.door(['p1', 'p2'], -9, 1, -6, -9, 3, -4); B.solid(-9, 4, -6, -9, 8, -4);
      B.exit(-11, 1, -5);
    },
  },
  {
    name: 'Mass Mailing', film: 2, copy: true, motion: true, postcard: true, diff: 8.5,
    hint: 'Three sealed vaults, three plates, one falling crate. Double-X copies keep the speed of what you copied, and anything thrown into a postcard flies on out of the spot. If you fall into a vault yourself, a card on the island takes you back.',
    sol: [
      { tp: [-4.5, 1.02, -4.5], yaw: 0 },
      { snap: [-8.5, 1.6, -13.5], say: 'Photograph the photo spot in the left vault.' },
      { print: [-4.5, 2.02, -7.0], yaw: 0, say: 'Print the postcard in the hall.' },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'Copy the falling crate.' },
      { tp: [-4.5, 1.02, -4.5] },
      { launch: [-3.2, 2.0, -13.5], via: [-4.5, 2.02, -7.0], say: 'Throw the copy into the postcard. It flies out of the spot, over the drop and onto the plate.' },
      { snap: [0.5, 1.6, -10.5], say: 'Do the same for the middle vault.' },
      { print: [0.5, 2.02, -7.0], yaw: 0 },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate' },
      { tp: [0.5, 1.02, -4.5] },
      { launch: [0.5, 2.0, -17.2], via: [0.5, 2.02, -7.0] },
      { snap: [9.5, 1.6, -13.5], say: 'And the right one: its plate is up on a ledge.' },
      { print: [6.5, 2.02, -7.0], yaw: 0 },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate' },
      { tp: [6.5, 1.02, -4.5] },
      { launch: [4.2, 3.0, -13.5], via: [6.5, 2.02, -7.0] },
      { wait: 1.5 },
      { exit: true },
    ],
    build(B) {
      B.plan([[-9, -18, 9, 0, 9], [10, -5, 13, -3, 9]], { pits: [[-9, -18, 9, -10]] });
      B.start(0, 1, 0);
      const hall = B.spot(-5, 1, -2, 180);
      B.chute(-8, -2, 1, 9);
      // three vaults behind one glass wall, floored with nothing
      B.glass(-9, 1, -9, 9, 9, -9, { axis: 'z' });
      B.solid(-3, 0, -18, -3, 9, -10); B.solid(3, 0, -18, 3, 9, -10);
      // each target is a patch of plates against a wall: whatever lands on any of them holds it down
      const patch = (id, x0, y, z0, x1, z1) => { for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) B.plate(id, x, y, z); };
      // left: spot on the west, plates against the divider
      B.solid(-9, 0, -15, -8, 0, -13, 'floor'); B.spot(-9, 1, -14, -90);
      B.solid(-5, 0, -15, -4, 0, -13, 'floor'); patch('pA', -5, 1, -15, -4, -13);
      // middle: spot by the glass, plates against the back wall
      B.solid(-2, 0, -11, 2, 0, -10, 'floor'); B.spot(0, 1, -11);
      B.solid(-2, 0, -18, 2, 0, -17, 'floor'); patch('pB', -1, 1, -18, 1, -17);
      // right: spot on the east, plates up on a ledge against the divider
      B.solid(8, 0, -15, 9, 0, -13, 'floor'); B.spot(9, 1, -14, 90);
      B.solid(4, 0, -15, 5, 1, -13); patch('pC', 4, 2, -15, 5, -13);
      // a way back out of each vault, for anyone who walks into a postcard
      B.card(-9, 1, -15, 0, hall, { locked: true }); B.card(-2, 1, -11, 90, hall, { locked: true }); B.card(9, 1, -15, 0, hall, { locked: true });
      B.door(['pA', 'pB', 'pC'], 10, 1, -5, 10, 3, -3); B.solid(10, 4, -5, 10, 9, -3);
      B.exit(12, 1, -4);
    },
  },
  {
    name: 'Smear', film: 1, exposure: true, diff: 5,
    hint: 'A streak is the whole space something swept through. This shuttle doesn’t run in a straight line.',
    sol: [
      { tp: [4.0, 1.02, -9.5], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 2.9, say: 'Expose the shuttle for its whole diagonal run: it smears into a wide square.' },
      { print: [0.5, 0, -7.5], rest: 1.0, yaw: 0, say: 'Lay the square flat over all four plates.' },
      { go: [0.5, -13.5] },
      { exit: true },
    ],
    nope: [
      // the shuttle itself holds one plate
      [{ tp: [4.0, 1.02, -9.5], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { print: [-1.5, 1.17, -5.5] }, { go: [0.5, -13.5] }, { exit: true }],
      // a short smear can't reach all four
      [{ tp: [4.0, 1.02, -9.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 0.8 }, { print: [0.5, 0, -7.5], rest: 1.0, yaw: 0 }, { go: [0.5, -13.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7], [6, -13, 11, -6, 5], [-1, -15, 1, -15, 7], [-3, -20, 3, -16, 6]]);
      B.start(0, 1, -1);
      B.glass(6, 1, -13, 6, 5, -6);
      B.shuttle([7, 1.3, -12], [11, 1.3, -8], { speed: 2, size: [1, 0.3, 1] });
      B.plate('p1', -2, 1, -6); B.plate('p2', 2, 1, -6); B.plate('p3', -2, 1, -10); B.plate('p4', 2, 1, -10);
      B.door(['p1', 'p2', 'p3', 'p4'], -1, 1, -15, 1, 3, -15); B.solid(-1, 4, -15, 1, 7, -15);
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Forced Perspective', film: 1, zoom: true, diff: 5,
    hint: 'Those stairs are built for a giant. On Zoom film, something photographed far away comes out smaller the closer you print it.',
    sol: [
      { tp: [0.5, 1.02, -9.2], yaw: 0 },
      { snap: [0.5, 5.5, -21.0], say: 'From the edge of the pit, photograph the giant stairs across the room.' },
      { zprint: [0.69, 2.71, -7.0], yaw: 180, scale: 1.125, from: [1, 0.6], say: 'Print them close by, climbing toward the ledge: up close they come out at a size you can climb.' },
      { go: [3.4, -7.0] },
      { go: [-3.0, -7.0], jump: true, say: 'Climb up.' },
      { exit: true },
    ],
    nope: [
      // at their own size the steps are taller than you can jump
      [{ tp: [0.5, 1.02, -9.2], yaw: 0 }, { snap: [0.5, 5.5, -21.0] }, { print: [2.32, 4.32, -7.0], yaw: 180, scale: 2.2 }, { go: [5.5, -3.0] }, { go: [-3.0, -7.0], jump: true }, { exit: true, jump: true }],
      // too small to reach the ledge
      [{ tp: [0.5, 1.02, -9.2], yaw: 0 }, { snap: [0.5, 5.5, -21.0] }, { print: [-0.3, 1.70, -7.0], yaw: 180, scale: 0.45 }, { go: [3.4, -7.0] }, { go: [-3.0, -7.0], jump: true }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-5, -24, 5, 0, 13]], { pits: [[-5, -17, 5, -11]] });
      B.start(2, 1, -1);
      B.box([-5, 1, -9], [-1, 4.4, -5]);
      B.miniStairs(0.5, 1, -21, 3, 3);
      B.exit(-3, 4.4, -8);
    },
  },
  {
    name: 'Stop Motion', film: 1, exposure: true, diff: 6,
    hint: 'The streak grows for as long as you hold the shutter, and the readout shows how long it is. An orange streak stands on the floor, so make it exactly one step tall.',
    sol: [
      { tp: [3.0, 1.02, -3.5], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 1.0, say: 'Start exposing the lift at the bottom and let go after about a metre: a short streak.' },
      { tp: [0.5, 1.02, -3.0], yaw: 0 },
      { print: [0.5, 0, -6.45], rest: 1.0, yaw: 0, say: 'Stand it against the ledge as a step.' },
      { go: [0.5, -9.0], jump: true, say: 'Step up, then up again.' },
      { exit: true },
    ],
    nope: [
      // the whole climb as one tall streak: too tall to get onto
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 3.4 }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { print: [0.5, 0, -6.4], rest: 1.0, yaw: 0 }, { go: [0.5, -9.0], jump: true }, { exit: true, jump: true }],
      // a quick click takes the lift itself: far too thin to help
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { print: [0.5, 0, -6.45], rest: 1.0, yaw: 0 }, { go: [0.5, -9.0], jump: true }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-4, -11, 4, 0, 7], [5, -6, 6, -2, 5]]);
      B.start(0, 1, -1);
      B.box([-4, 1, -11], [5, 3.6, -7]);
      B.glassCase(5, 1, -4, 5, 5, -4);
      B.shuttle([5, 1.05, -4], [5, 4.5, -4], { speed: 1, size: [0.86, 0.3, 0.86], orange: true });
      B.exit(0, 3.6, -10);
    },
  },
  {
    name: 'Night Bus', film: 1, exposure: true, diff: 6,
    hint: 'Red safelight stops you starting a photo, not finishing one. Catch the shuttle while it is out of the light and keep holding. Under the lasers there is no jumping.',
    sol: [
      { tp: [2.5, 1.02, -3.5], yaw: -90 },
      { expose: 'shuttle', when: 'B', hold: 2.9, say: 'Start exposing while the shuttle is out of the red light by the window, and hold as it runs back into the dark.' },
      { print: [0.5, 0, -10.5], rest: 1.0, yaw: 90, say: 'Lay the long streak across the pit, flat on both edges.' },
      { go: [0.5, -4.2] },
      { go: [0.5, -19.0], say: 'Walk across under the lasers. Don’t jump.' },
      { exit: true },
    ],
    nope: [
      // the shuttle itself is just a stepping stone, and the lasers stop you jumping to it
      [{ tp: [2.5, 1.02, -3.5], yaw: -90 }, { tap: 'shuttle', when: 'B' }, { print: [0.5, 0.85, -10.5], yaw: 90 }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { runjump: 2 }, { exit: true }],
      // a short streak leaves a gap you'd have to jump
      [{ tp: [2.5, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'B', hold: 1.4 }, { print: [0.5, 0, -8.0], rest: 1.0, yaw: 90 }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { runjump: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-3, -22, 3, 0, 7], [4, -5, 4, -2, 7], [5, -17, 5, -2, 4], [-9, -22, -4, -18, 6]], { pits: [[-3, -16, 3, -6]] });
      B.start(0, 1, -1);
      // the shuttle's gallery: glass where you can see it, dark red light for most of its run
      B.glass(4, 1, -5, 4, 7, -2);
      B.safelight(5, 1, -17, 5, 4, -6);
      B.shuttle([5, 1.3, -16], [5, 1.3, -3], { speed: 4.3, size: [0.9, 0.3, 1.0] });
      // a canopy of lasers over the void
      for (const z of [-7, -10, -13, -15]) B.emitter(3, 2.75, z, 90, { locked: true });
      B.exit(-8, 1, -20);
    },
  },
  {
    name: 'Tight Squeeze', film: 1, zoom: true, diff: 6,
    hint: 'Zoom works both ways. Shoot the crate from far off and print it close to shrink it into the letterbox; shoot it close and print it far to grow it back.',
    sol: [
      { tp: [2.0, 1.02, -2.0] },
      { snap: [-2.5, 1.45, -5.5], say: 'Photograph the crate from the other side of the room.' },
      { zprint: [3.5, 0, -7.5], rest: 2.0, scale: 0.29, from: [0, 1], say: 'Walk up to the letterbox and print it right inside: it comes out tiny and holds the plate.' },
      { go: [0.5, -6.5] },
      { go: [0.5, -10.5], say: 'Go through the door.' },
      { go: [3.5, -8.7] },
      { snap: [3.5, 2.15, -7.5], say: 'From this side, photograph the little crate up close. The door shuts behind you.' },
      { zprint: [0.5, 0, -16.4], rest: 1.0, scale: 1.3, from: [0, 1], say: 'Back away and print it against the ledge, far enough off that it comes out a little bigger than it began.' },
      { go: [0.5, -19.5], jump: true, say: 'Climb up.' },
      { exit: true },
    ],
    nope: [
      // full size, it doesn't fit the letterbox
      [{ tp: [2.0, 1.02, -2.0] }, { snap: [-2.5, 1.45, -5.5] }, { go: [3.5, -5.86] }, { print: [3.5, 2.5, -6.4] }, { go: [0.5, -6.5] }, { go: [0.5, -10.5] }, { exit: true, jump: true }],
      // kept small, it is no step at all
      [{ tp: [2.0, 1.02, -2.0] }, { snap: [-2.5, 1.45, -5.5] }, { zprint: [3.5, 0, -7.5], rest: 2.0, scale: 0.29, from: [0, 1] }, { go: [0.5, -6.5] }, { go: [0.5, -10.5] }, { go: [3.5, -8.7] }, { snap: [3.5, 2.15, -7.5] }, { zprint: [0.5, 0, -16.4], rest: 1.0, scale: 0.29, from: [0, 1] }, { go: [0.5, -19.5], jump: true }, { exit: true, jump: true }],
      // blown up too far, it is a wall
      [{ tp: [2.0, 1.02, -2.0] }, { snap: [-2.5, 1.45, -5.5] }, { zprint: [3.5, 0, -7.5], rest: 2.0, scale: 0.29, from: [0, 1] }, { go: [0.5, -6.5] }, { go: [0.5, -10.5] }, { go: [3.5, -8.7] }, { snap: [3.5, 2.15, -7.5] }, { zprint: [0.5, 0, -15.9], rest: 1.0, scale: 2.2, from: [0, 1] }, { go: [0.5, -19.5], jump: true }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-4, -8, 4, 0, 6], [-3, -21, 3, -9, 8]]);
      B.start(0, 1, -1);
      B.crate(-3, 1, -6);
      // the dividing wall: a door, and a letterbox slot at chest height with a plate inside
      B.solid(-4, 1, -8, -2, 6, -8);
      B.door(['p1'], -1, 1, -8, 1, 3, -8); B.solid(-1, 4, -8, 1, 6, -8);
      B.solid(2, 1, -8, 2, 6, -8);
      B.solid(3, 1, -8, 3, 1, -8); B.box([3, 2.5, -8], [4, 7, -7]); B.plate('p1', 3, 2, -8);
      B.solid(4, 1, -8, 4, 6, -8);
      B.box([-3, 1, -21], [4, 3.4, -17]);
      B.exit(0, 3.4, -19);
    },
  },
  {
    name: 'Model Railway', film: 1, exposure: true, zoom: true, diff: 6,
    hint: 'A model train leaves a model streak. Slow film and Zoom film together: shoot it up close, then push the print far away and it grows.',
    sol: [
      { tp: [0.6, 1.02, -2.0], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 2.6, say: 'Expose the little train for its whole run, from close up.' },
      { go: [0.5, -4.41] },
      { print: [0.5, 0, -12.5], rest: 1.0, yaw: 90, scale: 4.2, say: 'Turn the streak to point across the pit and push it far out: it grows into a bridge.' },
      { go: [0.5, -21.0], say: 'Walk across.' },
      { exit: true },
    ],
    nope: [
      // a quick click takes the train itself: even blown up it is only a stepping stone
      [{ tp: [0.6, 1.02, -2.0], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -4.6] }, { print: [0.5, 0.8, -12.5], yaw: 90, scale: 4.5 }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { runjump: 2 }, { exit: true }],
      // the streak at its own size: a platform in the middle, with gaps too wide to jump
      [{ tp: [0.6, 1.02, -2.0], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 2.6 }, { go: [0.5, -4.6] }, { print: [0.5, 0.9, -12.5], yaw: 90, scale: 1 }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { runjump: 2 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-3, -24, 3, 0, 8], [-9, -24, -4, -20, 6]], { pits: [[-3, -19, 3, -7]] });
      B.start(-1, 1, -1);
      B.solid(2, 1, -4, 2, 1, -1, 'trim');
      B.glassCase(2, 2, -4, 2, 2, -1);
      B.shuttle([2, 2.05, -4], [2, 2.05, -1], { speed: 1.2, size: [0.4, 0.1, 0.25] });
      B.exit(-8, 1, -22);
    },
  },
  {
    name: 'Long Lens', film: 1, zoom: true, diff: 7,
    hint: 'Zoom film scales a print by how far you push it compared with how far away you were when you took the photo. You can’t get close to the model, but you can get close to a print of it.',
    sol: [
      { tp: [-4.0, 1.02, -2.5], yaw: 90 },
      { snap: [-15.5, 1.04, -2.5], say: 'Photograph the model pad down the end of the long tube.' },
      { zprint: [0.5, 0, -9.0], rest: 1.0, scale: 0.22, from: [0, 1], say: 'Print it out in the hall. Shot from that far away, it comes out tiny.' },
      { go: [0.5, -7.6] },
      { snap: [0.5, 1.03, -9.0], say: 'Now walk up to it and photograph it again from close up.' },
      { zprint: [0.5, 0, -16.6], rest: 1.0, scale: 1.7, from: [0, 1], say: 'Print it far away by the cliff: from this close a shot, it comes out huge.' },
      { go: [0.5, -19.5], say: 'Bounce up.' },
      { exit: true },
    ],
    nope: [
      // straight from the tube, even pushed as far as it goes, the pad stays small
      [{ tp: [-4.0, 1.02, -2.5], yaw: 90 }, { snap: [-15.5, 1.04, -2.5] }, { tp: [0.5, 1.02, 0.5], yaw: 0 }, { print: [0.5, 1.12, -16.6], scale: 0.6 }, { go: [0.5, -19.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -22, 4, 0, 12], [-17, -3, -5, -3, 2]]);
      B.start(2, 1, -1);
      // the model pad sits at the far end of a long tube behind glass
      B.glass(-5, 1, -3, -5, 3, -3, { axis: 'x' });
      B.miniPad(-15.5, 1, -2.5, 0.3);
      B.box([-4, 1, -22], [5, 10, -18]);
      B.exit(0, 10, -20);
    },
  },
  {
    name: 'Wide Angle', film: 1, zoom: true, diff: 7,
    hint: 'Two beams, two targets, one little mirror. A mirror catches whatever runs into it, so make it big enough to catch both.',
    sol: [
      { tp: [-1.7, 1.02, -1.5], yaw: 90 },
      { snap: [-2.5, 2.4, -1.5], say: 'Photograph the model mirror from right up against its case.' },
      { zprint: [0.5, 4.52, -6.5], yaw: 45, scale: 3.5, from: [1, 0.8], say: 'Back away and print it huge, turned to 45°, across both beams: it bounces them both into the targets.' },
      { go: [4.5, -12.0], say: 'Walk round it to the door.' },
      { exit: true },
    ],
    nope: [
      // at a sensible size it only catches one beam
      [{ tp: [-1.7, 1.02, -1.5], yaw: 90 }, { snap: [-2.5, 2.4, -1.5] }, { go: [4.0, -2.0] }, { print: [-0.5, 3.02, -5.5], yaw: 45, scale: 1.0 }, { go: [4.5, -12.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 9], [3, -15, 5, -15, 9], [2, -20, 6, -16, 6]]);
      B.start(2, 1, -1);
      B.solid(-3, 1, -2, -3, 1, -2, 'trim'); B.glassCase(-3, 2, -2, -3, 2, -2);
      B.miniMirror(-2.5, 2, -1.5, 0.4, { fixed: true });
      // two parallel beams across the room...
      B.solid(-6, 1, -6, -6, 1, -6, 'trim'); B.emitter(-6, 2, -6, -90, { locked: true });
      B.solid(-6, 1, -8, -6, 1, -8, 'trim'); B.emitter(-6, 2, -8, -90, { locked: true });
      // ...and two targets by the far wall
      B.solid(-1, 1, -14, -1, 1, -14, 'trim'); B.receptor('r1', -1, 2, -14);
      B.solid(1, 1, -14, 1, 1, -14, 'trim'); B.receptor('r2', 1, 2, -14);
      B.door(['r1', 'r2'], 3, 1, -15, 5, 3, -15); B.solid(3, 4, -15, 5, 9, -15);
      B.exit(4, 1, -18);
    },
  },
  {
    name: 'Rush Hour', film: 1, exposure: true, diff: 7,
    hint: 'Two shuttles, two jobs. Blue streaks hang where you print them; orange ones fall. You can’t print where you can’t see, but you can let something drop there.',
    sol: [
      { tp: [-3.5, 1.02, -4.0], yaw: 90 },
      { expose: 'shuttle', sh: 0, when: 'A', hold: 2.9, say: 'Expose the long blue shuttle for its whole run.' },
      { go: [0.5, -4.5] },
      { print: [0.5, 0, -11.5], rest: 1.0, yaw: 90, say: 'Lay it across the pit.' },
      { tp: [3.5, 1.02, -3.0], yaw: -90 },
      { expose: 'shuttle', sh: 1, when: 'A', hold: 2.1, say: 'Then expose the short orange shuttle and carry its streak across.' },
      { go: [0.5, -5.3] },
      { go: [0.5, -19.5] },
      { print: [-1.5, 2.3, -23.5], yaw: 0, say: 'Print it just through the letterbox, lengthways. It is heavy, so it drops onto both plates you can’t see.' },
      { wait: 1 },
      { go: [3.5, -21.0] },
      { exit: true },
    ],
    nope: [
      // anything blue just hangs in the letterbox
      [{ tp: [-3.5, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', sh: 0, when: 'A', hold: 2.9 }, { go: [0.5, -4.5] }, { print: [0.5, 0, -11.5], rest: 1.0, yaw: 90 }, { tp: [-3.5, 1.02, -4.0], yaw: 90 }, { tap: 'shuttle', sh: 0, when: 'A' }, { go: [0.5, -5.3] }, { go: [0.5, -19.5] }, { print: [-1.5, 2.3, -23.5], yaw: 0 }, { wait: 1 }, { go: [3.5, -21.0] }, { exit: true }],
      // the orange shuttle itself only covers one plate
      [{ tp: [-3.5, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', sh: 0, when: 'A', hold: 2.9 }, { go: [0.5, -4.5] }, { print: [0.5, 0, -11.5], rest: 1.0, yaw: 90 }, { tp: [3.5, 1.02, -3.0], yaw: -90 }, { tap: 'shuttle', sh: 1, when: 'A' }, { go: [0.5, -5.3] }, { go: [0.5, -19.5] }, { print: [-2.5, 2.3, -23.5], yaw: 0 }, { wait: 1 }, { go: [3.5, -21.0] }, { exit: true }],
      // the blue shuttle itself as a stepping stone: too far to jump
      [{ tp: [-3.5, 1.02, -4.0], yaw: 90 }, { tap: 'shuttle', sh: 0, when: 'A' }, { go: [0.5, -4.5] }, { print: [0.5, 0.85, -11.5], yaw: 90 }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { runjump: 2 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -22, 4, 0, 7], [-6, -16, -5, -1, 4], [5, -5, 6, -1, 4], [-4, -23, 4, -23, 7], [-4, -24, 0, -24, 3], [2, -28, 4, -24, 6]], { pits: [[-4, -17, 4, -7]] });
      B.start(0, 1, -1);
      // two galleries: a long blue shuttle to the left, a short orange one to the right
      B.glass(-5, 1, -16, -5, 5, -1, { axis: 'x' });
      B.shuttle([-6, 1.3, -15], [-6, 1.3, -3], { speed: 4.3, size: [0.9, 0.3, 1.0] });
      B.glass(5, 1, -5, 5, 5, -1, { axis: 'x' });
      B.shuttle([6, 1.3, -5], [6, 1.3, -2], { speed: 1.5, size: [0.9, 0.3, 1.0], orange: true });
      // the far wall: a letterbox into a sealed pen with two plates on its floor, and the door
      B.solid(-4, 1, -23, 0, 1, -23); B.box([-4, 2.6, -23], [1, 8, -22]);
      B.solid(1, 1, -23, 1, 7, -23);
      B.door(['p1', 'p2'], 2, 1, -23, 4, 3, -23); B.solid(2, 4, -23, 4, 7, -23);
      B.plate('p1', -3, 1, -24); B.plate('p2', -1, 1, -24);
      B.exit(3, 1, -26);
    },
  },
  {
    name: 'Short Cut', film: 1, exposure: true, zoom: true, diff: 7,
    hint: 'The streak from that wide shuttle won’t fit down the duct, and the duct is too low to jump in. Zoom film shrinks a print you shot from far away and print up close.',
    sol: [
      { tp: [0.5, 1.02, -2.0], yaw: 0 },
      { expose: 'shuttle', when: 'A', hold: 2.9, say: 'From across the hall, expose the wide shuttle for its whole run.' },
      { go: [9.5, -3.5], say: 'Crouch into the duct.' },
      { zprint: [14.0, 0, -3.5], rest: 1.0, yaw: 0, scale: 0.33, from: [-1, 0], say: 'Print the streak close up over the pit: shot from far away, it comes out narrow enough to fit.' },
      { go: [17.5, -3.5], say: 'Walk across.' },
      { exit: true },
    ],
    nope: [
      // the shuttle itself, shrunk to fit, is only a stepping stone, and there's no room to jump
      [{ tp: [0.5, 1.02, -2.0], yaw: 0 }, { tap: 'shuttle', when: 'A' }, { go: [9.5, -3.5] }, { print: [14.0, 0.95, -3.5], yaw: 0, scale: 0.37 }, { go: [11.4, -3.5] }, { runjump: 2 }, { exit: true }],
      // at its own width it won't go in
      [{ tp: [0.5, 1.02, -2.0], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.9 }, { go: [9.5, -3.5] }, { print: [14.0, 1.22, -3.5], yaw: 0, scale: 1 }, { go: [17.5, -3.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-8, -11, 8, 0, 8], [-8, -14, 8, -12, 5], [9, -4, 18, -4, 2], [19, -6, 22, -2, 6]], { pits: [[12, -4, 15, -4]] });
      B.start(0, 1, -1);
      B.glass(-8, 1, -11, 8, 6, -11);
      B.shuttle([-8, 1.3, -13], [7, 1.3, -13], { speed: 5.5, size: [1, 0.4, 2.5] });
      B.exit(21, 1, -4);
    },
  },
  {
    name: 'Night Train', film: 1, exposure: true, zoom: true, diff: 8,
    hint: 'The model railway runs mostly through red light. Start the exposure while the little train is in the clear, keep holding, and make what you caught big enough to walk on. There is no jumping under the lasers.',
    sol: [
      { tp: [1.2, 1.02, -2.5], yaw: -90 },
      { expose: 'shuttle', when: 'B', hold: 2.9, say: 'Wait for the train at the clear end of its track, then hold the shutter as it runs back into the red.' },
      { zprint: [0.5, 0, -13.3], rest: 1.0, yaw: 90, scale: 3.2, from: [0, 1], say: 'From the edge of the pit, push the streak out until it spans the whole drop.' },
      { go: [0.5, -22.0], say: 'Walk across under the lasers.' },
      { exit: true },
    ],
    nope: [
      // the train itself, blown up, is only a stepping stone
      [{ tp: [1.5, 1.02, -2.5], yaw: -90 }, { tap: 'shuttle', when: 'B' }, { go: [0.5, -6.6] }, { print: [0.5, 0.9, -13.0], yaw: 90, scale: 4.5 }, { tp: [0.5, 1.02, -4.0], yaw: 0 }, { runjump: 2 }, { exit: true }],
      // a short exposure, even blown up all the way, leaves a gap under the lasers
      [{ tp: [1.5, 1.02, -2.5], yaw: -90 }, { expose: 'shuttle', when: 'B', hold: 1.2 }, { go: [0.5, -6.6] }, { print: [0.5, 0, -11.0], rest: 1.0, yaw: 90, scale: 4.5 }, { go: [0.5, -6.6] }, { runjump: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -25, 4, 0, 8], [-10, -25, -5, -21, 6]], { pits: [[-4, -19, 4, -8]] });
      B.start(-1, 1, -1);
      // a model railway on a table, most of it under a red safelight
      B.solid(3, 1, -5, 3, 1, -1, 'trim');
      B.glassCase(3, 2, -5, 3, 2, -1);
      B.safelight(3, 2, -5, 3, 2, -3);
      B.shuttle([3, 2.02, -5], [3, 2.02, -1], { speed: 1.4, size: [0.3, 0.08, 0.2] });
      for (const z of [-9, -12, -15, -18]) B.emitter(4, 2.75, z, 90, { locked: true });
      B.exit(-9, 1, -23);
    },
  },
  {
    name: 'Bracketing', film: 2, exposure: true, diff: 8,
    hint: 'Both amber doors lock behind you, and the shuttle stays here. You can only carry two frames, but you can already see where the first one has to go.',
    sol: [
      { tp: [-4.5, 1.02, -4.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.4, say: 'Expose the shuttle for its whole run: a long streak.' },
      { go: [0.5, -6.5] },
      { print: [0.5, 0, -14.5], rest: 1.0, yaw: 90, say: 'Before you go anywhere, print it through the open door as a bridge over the pit.' },
      { tp: [-4.5, 1.02, -4.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 0.5, say: 'Now take two short exposures, one on each frame, to carry with you.' },
      { expose: 'shuttle', when: 'A', hold: 0.5 },
      { go: [0.5, -7.0] },
      { go: [0.5, -10.2], say: 'Go through. The door locks behind you.' },
      { go: [0.5, -19.5], say: 'Walk the bridge: the lasers stop any jumping.' },
      { go: [3.0, -20.0] },
      { go: [6.0, -18.6], say: 'Through the second door, which locks too.' },
      { go: [6.0, -16.5] },
      { print: [7.0, 2.27, -18.0], yaw: 0, say: 'Hang the short streaks as two steps up to the ledge.' },
      { print: [7.0, 3.65, -19.4], yaw: 0 },
      { go: [7.0, -18.0], jump: true },
      { go: [7.0, -19.4], jump: true },
      { go: [7.0, -21.0], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    nope: [
      // carry the bridge and one step: the bridge is too long to use as a step in the small room
      [{ tp: [-4.5, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.4 }, { expose: 'shuttle', when: 'A', hold: 0.5 }, { sel: 0 }, { go: [0.5, -10.4] }, { print: [0.5, 0, -14.5], rest: 1.0, yaw: 90 }, { go: [0.5, -19.5] }, { go: [3.0, -20.0] }, { snap: [0.5, 1.15, -14.5] }, { go: [6.0, -18.6] }, { go: [6.0, -16.5] }, { sel: 0 }, { print: [7.0, 2.27, -18.0], yaw: 0 }, { print: [7.0, 3.77, -19.4], yaw: 0 }, { go: [7.0, -18.0], jump: true }, { go: [7.0, -19.4], jump: true }, { go: [7.0, -21.0], jump: true }, { exit: true, jump: true }],
      // one step on its own doesn't reach
      [{ tp: [-4.5, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.4 }, { go: [0.5, -6.5] }, { print: [0.5, 0, -14.5], rest: 1.0, yaw: 90 }, { tp: [-4.5, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 0.5 }, { go: [0.5, -7.0] }, { go: [0.5, -10.2] }, { go: [0.5, -19.5] }, { go: [3.0, -20.0] }, { go: [6.0, -18.6] }, { go: [6.0, -16.5] }, { print: [7.0, 3.0, -19.0], yaw: 0 }, { go: [7.0, -19.0], jump: true }, { go: [7.0, -21.0], jump: true }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-5, -8, 5, 0, 7], [-7, -8, -6, 0, 4], [-1, -9, 1, -9, 7], [-3, -22, 3, -10, 7], [4, -21, 4, -19, 7], [5, -22, 8, -17, 8]], { pits: [[-3, -18, 3, -12]] });
      B.start(0, 1, -1);
      B.glass(-6, 1, -8, -6, 5, 0, { axis: 'x' });
      B.shuttle([-7, 1.3, -8], [-7, 1.3, 0], { speed: 3.5, size: [0.9, 0.3, 1.0] });
      B.door([], -1, 1, -9, 1, 3, -9, { oneway: true }); B.solid(-1, 4, -9, 1, 7, -9);
      for (const z of [-13, -15, -17]) B.emitter(3, 2.75, z, 90, { locked: true });
      B.door([], 4, 1, -21, 4, 3, -19, { oneway: true }); B.solid(4, 4, -21, 4, 7, -19);
      B.box([5, 1, -22], [9, 5.2, -20]);
      B.exit(7, 5.2, -21);
    },
  },
  {
    name: 'The Enlarger', film: 1, exposure: true, zoom: true, diff: 9,
    hint: 'One freight shuttle, and once the amber door shuts you never see it again. Its streak has three jobs at three sizes. Orange things fall; Zoom makes a print bigger the closer you shot it.',
    sol: [
      { tp: [-3.0, 1.02, -3.4], yaw: 180 },
      { expose: 'shuttle', when: 'A', hold: 2.8, say: 'Expose the orange freight for its whole run: a long, heavy streak.' },
      { go: [0.5, -3.6] },
      { zprint: [0.5, 0, -11.0], rest: 1.0, yaw: 90, scale: 1.0, from: [0, 1], say: 'At the amber door, print it across the pit at the same size you shot it.' },
      { go: [0.5, -6.3], jump: true, say: 'Go through (the door locks) and climb onto the bridge.' },
      { go: [0.5, -17.0], jump: true },
      { snap: [0.5, 1.3, -11.0], say: 'From the far side, photograph the bridge again: it is all you have.' },
      { go: [-1.5, -20.4] },
      { zprint: [-1.5, 2.3, -22.5], yaw: 0, scale: 0.32, from: [0, 1], say: 'Up close to the letterbox, print it small and lengthways just inside: it drops onto both plates and the door opens.' },
      { wait: 1 },
      { go: [3.0, -21.0] },
      { go: [3.0, -24.6], say: 'Go through, round to the pen’s window.' },
      { go: [-1.5, -24.0] },
      { snap: [-1.5, 1.1, -22.5], say: 'Photograph the little streak through the glass, from as close as you can.' },
      { zprint: [0.5, 0, -30.0], rest: 1.0, yaw: 90, scale: 0.92, from: [0, 1], say: 'Print it across the last pit, pushed out until it is a bridge again.' },
      { go: [0.5, -25.2], jump: true },
      { go: [0.5, -35.0], jump: true, say: 'Cross.' },
      { exit: true },
    ],
    nope: [
      // full size, it won't fit in the pen
      [{ tp: [-3.0, 1.02, -3.4], yaw: 180 }, { expose: 'shuttle', when: 'A', hold: 2.8 }, { go: [0.5, -3.6] }, { zprint: [0.5, 0, -11.0], rest: 1.0, yaw: 90, scale: 1.0, from: [0, 1] }, { go: [0.5, -6.3], jump: true }, { go: [0.5, -17.0], jump: true }, { snap: [0.5, 1.3, -11.0] }, { go: [-1.5, -18.5] }, { print: [-1.5, 2.3, -22.5], yaw: 0 }, { wait: 1 }, { go: [3.0, -21.0] }, { go: [3.0, -24.6] }, { exit: true }],
      // kept small, the key is no bridge
      [{ tp: [-3.0, 1.02, -3.4], yaw: 180 }, { expose: 'shuttle', when: 'A', hold: 2.8 }, { go: [0.5, -3.6] }, { zprint: [0.5, 0, -11.0], rest: 1.0, yaw: 90, scale: 1.0, from: [0, 1] }, { go: [0.5, -6.3], jump: true }, { go: [0.5, -17.0], jump: true }, { snap: [0.5, 1.3, -11.0] }, { go: [-1.5, -20.4] }, { zprint: [-1.5, 2.3, -22.5], yaw: 0, scale: 0.32, from: [0, 1] }, { wait: 1 }, { go: [3.0, -21.0] }, { go: [3.0, -24.6] }, { go: [-1.5, -24.0] }, { snap: [-1.5, 1.1, -22.5] }, { print: [0.5, 1.1, -27.0], yaw: 90 }, { go: [0.5, -25.2], jump: true }, { go: [0.5, -35.0], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-8, -4, 8, 0, 8], [-8, 1, 8, 2, 4], [-1, -5, 1, -5, 8], [-4, -21, 4, -6, 8], [-4, -22, 4, -22, 8], [-4, -23, 0, -23, 3], [2, -23, 4, -23, 6], [-4, -38, 4, -24, 8]],
        { pits: [[-4, -15, 4, -8], [-4, -33, 4, -27]] });
      B.start(0, 1, -1, 180); // facing the freight shuttle, the one thing you can't come back for
      // the freight runs behind glass at your back
      B.glass(-8, 1, 1, 8, 4, 1);
      B.shuttle([-7, 1.3, 2], [1, 1.3, 2], { speed: 3, size: [2, 0.6, 0.9], orange: true });
      B.door([], -1, 1, -5, 1, 3, -5, { oneway: true }); B.solid(-1, 4, -5, 1, 8, -5);
      // a letterbox into a sealed pen with two plates, and the door they open
      B.solid(-4, 1, -22, 0, 1, -22); B.box([-4, 2.6, -22], [1, 9, -21]);
      B.solid(1, 1, -22, 1, 8, -22);
      B.door(['p1', 'p2'], 2, 1, -22, 4, 3, -22); B.solid(2, 4, -22, 4, 8, -22);
      B.plate('p1', -3, 1, -23); B.plate('p2', -1, 1, -23);
      B.glass(-4, 1, -24, 0, 4, -24);
      B.exit(0, 1, -36);
    },
  },
  {
    name: 'Final Print', film: 3, zoom: true, motion: true, postcard: true, exposure: true, diff: 10,
    hint: 'Everything at once. The way out is at the top of the dark tower, and the only way in is a postcard. Its spot can only be seen through the little port, once the frosted glass behind it is gone. You keep your speed through a postcard, and a doorway can be as big as you print it.',
    sol: [
      { tp: [1.2, 1.02, -2.5], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 3.0, say: 'Expose the model train for its whole run.' },
      { zprint: [0.5, 0, -11.5], rest: 1.0, yaw: 90, scale: 3.5, from: [-0.5, 1], say: 'From the edge, push the streak out over the pit until it spans it. No jumping under the lasers.' },
      { go: [0.5, -4.6] }, { go: [0.5, -19.5], say: 'Cross into the atrium.' },
      { go: [2.0, -23.0] },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'From across the atrium, photograph the falling crate: from that far it prints small.' },
      { tp: [5.5, 1.02, -25.5], yaw: 0 },
      { launch: [5.5, 2.4, -28.4], say: 'Up close to the port, throw it through: the little crate smashes the frosted glass behind.' },
      { wait: 1 },
      { tp: [5.5, 1.02, -25.0], yaw: 0 },
      { snap: [5.5, 2.6, -29.5], say: 'Now photograph the spot at the foot of the tower, through the port.' },
      { tp: [-6.2, 1.02, -20.5] },
      { snap: [-7.5, 2.05, -20.5], say: 'Photograph the model pad from right up close.' },
      { zprint: [-3.5, 0, -27.5], rest: 1.0, scale: 2.0, from: [0, 1], say: 'Print it far off in the open: it comes out huge.' },
      { sel: 0 },
      { zprint: [-3.5, 4.0, -27.4], yaw: 0, scale: 3.0, from: [1, 0.3], say: 'Push the postcard out until it stands three times as tall, right over the pad, facing the way you will come.' },
      { tp: [-3.5, 1.02, -22.5], yaw: 0 },
      { js: '__shutter.keys.KeyW = true', say: 'Run at the pad: you bounce into the giant postcard and shoot out of the spot, up the tower.' },
      { wait: 2.5 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // a pad at its model size can't throw you high enough
      [
        { tp: [1.2, 1.02, -2.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 3.0 },
        { zprint: [0.5, 0, -11.5], rest: 1.0, yaw: 90, scale: 3.5, from: [-0.5, 1] },
        { go: [0.5, -4.6] }, { go: [0.5, -19.5] }, { go: [2.0, -23.0] },
        { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' }, { tp: [5.5, 1.02, -25.5], yaw: 0 },
        { launch: [5.5, 2.4, -28.4] }, { wait: 1 }, { tp: [5.5, 1.02, -25.0], yaw: 0 }, { snap: [5.5, 2.6, -29.5] },
        { tp: [-6.2, 1.02, -20.5] }, { snap: [-7.5, 2.05, -20.5] },
        { zprint: [-3.5, 0, -27.5], rest: 1.0, scale: 1.0, from: [0, 1] },
        { sel: 0 }, { zprint: [-3.5, 4.0, -27.4], yaw: 0, scale: 3.0, from: [1, 0.3] },
        { tp: [-3.5, 1.02, -23.0], yaw: 0 },
        { js: '__shutter.keys.KeyW = true' }, { wait: 2.5 }, { js: '__shutter.keys.KeyW = false' },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-4, -5, 4, 0, 8], [-4, -18, 4, -6, 8], [-9, -19, 9, -19, 18], [-9, -38, 9, -20, 18]], { pits: [[-4, -18, 4, -6]] });
      B.start(0, 1, -1);
      const home = B.spot(-3, 1, -2, 180);
      // the model railway, and the void under a canopy of lasers
      B.solid(3, 1, -5, 3, 1, -1, 'trim'); B.glassCase(3, 2, -5, 3, 2, -1);
      B.shuttle([3, 2.02, -5], [3, 2.02, -1], { speed: 1.4, size: [0.3, 0.08, 0.2] });
      for (const z of [-7, -10, -13, -16]) B.emitter(4, 2.75, z, 90, { locked: true });
      // the wall into the atrium, with one doorway
      B.solid(-9, 1, -19, -2, 18, -19); B.solid(2, 1, -19, 9, 18, -19); B.solid(-1, 5, -19, 1, 18, -19);
      // the atrium: a crate chute in the far corner, the model pad tucked beside the doorway
      B.chute(-7, -34, 1, 10);
      B.solid(-8, 1, -21, -8, 1, -21, 'trim'); B.glassCase(-8, 2, -21, -8, 2, -21);
      B.miniPad(-7.5, 2, -20.5, 0.4);
      // the tower: solid to the roof, with one small port in its foot: frosted glass behind it, then clear glass
      B.solid(3, 1, -33, 3, 18, -29); B.solid(7, 1, -33, 7, 18, -29); B.solid(4, 1, -33, 6, 18, -33);
      B.solid(4, 1, -29, 4, 18, -29); B.solid(6, 1, -29, 6, 18, -29); B.solid(5, 1, -29, 5, 1, -29); B.solid(5, 3, -29, 5, 18, -29);
      B.box([5, 2, -28.0], [6, 2.22, -27.9], 'trim'); B.box([5, 2.78, -28.0], [6, 3, -27.9], 'trim');
      B.box([5, 2.22, -28.0], [5.22, 2.78, -27.9], 'trim'); B.box([5.78, 2.22, -28.0], [6, 2.78, -27.9], 'trim');
      B.fragile(5, 2, -29, 5, 2, -29, { axis: 'z', face: 'max' });
      B.glass(5, 2, -29, 5, 2, -29, { axis: 'z', face: 'min', frame: false });
      // inside: the spot, a light leak at its foot, the way out on a ledge high up, and a card home for anyone stuck
      B.spot(5, 1, -30);
      B.leak(4, 1, -31, 6, 4, -30);
      B.solid(4, 1, -32, 6, 8, -32);
      B.card(6, 1, -31, -90, home, { locked: true });
      B.exit(5, 9, -32);
    },
  },
  {
    name: 'Grand Entrance', film: 1, postcard: true, zoom: true, diff: 8.5,
    hint: 'The giant pad throws you higher than any ledge here, but it throws you fast: a postcard the usual size is past in a blink. On Zoom film a postcard grows the farther away you print it. Keep its bottom near the floor.',
    sol: [
      { tp: [0.5, 1.02, -10.0], yaw: 0 },
      { snap: [0.5, 1.6, -13.5], say: 'Photograph the spot at the foot of the glass tower.' },
      { zprint: [0.5, 4.0, -6.3], yaw: 0, scale: 3.0, from: [0, 1], say: 'Print the postcard three times as tall, standing on the floor right over the giant pad and facing back the way you will come.' },
      { tp: [0.5, 1.02, -3.0], yaw: 0 },
      { js: '__shutter.keys.KeyW = true', say: 'Run onto the pad: you bounce up into the postcard and shoot out of the spot, all the way up the tower.' },
      { wait: 2.4 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // walk in without bouncing and you are stuck at the foot of the tower
      [
        { tp: [0.5, 1.02, -10.0], yaw: 0 },
        { snap: [0.5, 1.6, -13.5] },
        { tp: [3.5, 1.02, -1.0], yaw: 0 },
        { print: [3.5, 2.02, -4.0], yaw: 0 },
        { walkin: true, yaw: 0 },
        { js: '__shutter.keys.KeyW = true' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' },
        { go: [0.5, -15.5], jump: true },
        { exit: true, jump: true },
      ],
      // a card hung up high catches you, but you come out of the spot too slow
      [
        { tp: [0.5, 1.02, -10.0], yaw: 0 },
        { snap: [0.5, 1.6, -13.5] },
        { tp: [0.5, 1.02, -2.5], yaw: 0 },
        { print: [0.5, 7.0, -7.0], yaw: 0 },
        { js: '__shutter.keys.KeyW = true' }, { wait: 2.4 }, { js: '__shutter.keys.KeyW = false' },
        { exit: true, jump: true },
      ],
    ],
    build(B) {
      B.plan([[-8, -18, 8, 4, 16]]);
      B.start(0, 1, 2);
      const home = B.spot(-4, 1, -2, 180);
      B.miniPad(0.5, 1, -6.5, 2, { locked: true });
      // the tower: sealed glass, a spot at its foot under a light leak, the way out on a ledge nine metres up
      B.glass(-2, 1, -17, -2, 16, -13, { axis: 'x', face: 'max' }); B.glass(2, 1, -17, 2, 16, -13, { axis: 'x', face: 'min' });
      B.glass(-1, 1, -13, 1, 16, -13, { axis: 'z', face: 'min' }); B.glass(-1, 1, -17, 1, 16, -17, { axis: 'z', face: 'max' });
      B.spot(0, 1, -14);
      B.leak(-1, 1, -15, 1, 4, -14);
      B.solid(-1, 1, -16, 1, 9, -16);
      B.card(1, 1, -15, -90, home, { locked: true });
      B.exit(0, 10, -16);
    },
  },
  {
    name: 'Pinhole', film: 1, zoom: true, diff: 6.5,
    hint: 'The beam runs through a crawlspace behind the wall, and only a little port lets you see in. A mirror the size of this one will never fit in there, but on Zoom film something photographed from far away prints small up close.',
    sol: [
      { tp: [-3.5, 1.02, -1.0], yaw: -90 },
      { snap: [3.5, 2.0, -4.5], say: 'From across the room, photograph the mirror.' },
      { tp: [0.5, 1.02, -9.6], yaw: 0 },
      { zprint: [0.5, 2.4, -11.5], yaw: 45, scale: 0.28, from: [0, 1], say: 'Walk up to the port and print it tiny, right in the beam, turned to send it to the target.' },
      { wait: 1 },
      { go: [3.0, -9.0] },
      { exit: true },
    ],
    nope: [
      // a mirror at full size has nowhere to go
      [
        { tp: [2.0, 1.02, -4.5], yaw: -90 },
        { snap: [3.5, 2.0, -4.5] },
        { tp: [0.5, 1.02, -9.6], yaw: 0 },
        { print: [0.5, 2.5, -11.5], yaw: 45 },
        { wait: 1 },
        { go: [3.0, -9.0] },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-5, -10, 5, 0, 7], [-5, -14, 5, -11, 7], [6, -9, 9, -7, 7]]);
      B.start(0, 1, 0);
      B.mirror(3, 1, -5, 0);
      // the wall with its port, and the crawlspace behind it: beam along the middle, target straight back from the port
      B.solid(-5, 1, -11, -1, 7, -11); B.solid(1, 1, -11, 5, 7, -11); B.solid(0, 1, -11, 0, 1, -11); B.solid(0, 3, -11, 0, 7, -11);
      B.box([0, 2, -11], [1, 2.27, -10], 'trim'); B.box([0, 2.73, -11], [1, 3, -10], 'trim');
      B.box([0, 2.27, -11], [0.27, 2.73, -10], 'trim'); B.box([0.73, 2.27, -11], [1, 2.73, -10], 'trim');
      B.solid(-5, 1, -14, 5, 1, -12); B.solid(-5, 3, -14, 5, 7, -12);
      B.solid(-5, 2, -14, -1, 2, -13); B.solid(1, 2, -14, 5, 2, -13);
      B.emitter(-5, 2, -12, -90, { locked: true });
      B.receptor('r1', 0, 2, -14);
      B.door(['r1'], 6, 1, -9, 6, 3, -7); B.solid(6, 4, -9, 6, 7, -7);
      B.exit(8, 1, -8);
    },
  },
  {
    name: 'Forwarding Address', film: 2, exposure: true, postcard: true, diff: 9,
    hint: 'The plates are in a sealed vault under the gallery, and only the gallery’s glass floor looks down into it. Nobody can take film into the vault, but a heavy streak goes through a postcard just fine. Keep a way back out.',
    sol: [
      { tp: [6.5, 1.02, -4.0], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 3.0, say: 'Expose the orange freight for its whole run.' },
      { tp: [0.5, 1.02, -0.5], yaw: 0 },
      { snap: [-4.5, 7.4, -9.5], say: 'From the back of the hall, photograph the photo spot up in the glass gallery.' },
      { print: [0.5, 2.02, -4.5], yaw: 0, say: 'Print the postcard and walk in, carrying the streak.' },
      { tp: [0.5, 1.02, -2.8] },
      { walkin: true, yaw: 0 },
      { go: [1.5, -9.5] },
      { snap: [-0.5, 2.0, -10.5], say: 'Stand on the glass floor and photograph the spot in the vault below.' },
      { go: [-1.0, -8.4] },
      { print: [-1.0, 6.02, -11.0], yaw: 0, say: 'Print that postcard up here.' },
      { print: [-1.0, 5.5, -11.0], yaw: 0, say: 'Turn the streak to lie flat across the card and print it right on it: it drops into the vault across both plates.' },
      { wait: 1.5 },
      { go: [2.5, -7.6] },
      { snap: [5.5, 2.0, -2.5], say: 'From the front of the gallery, photograph the spot down in the hall.' },
      { print: [2.5, 6.02, -10.0], yaw: 0, say: 'Print it behind you and step back out.' },
      { walkin: true, yaw: 0 },
      { exit: true },
    ],
    build(B) {
      B.plan([[-6, -12, 8, 0, 10], [5, 1, 7, 4, 10]], { pits: [[-6, -12, 3, -8]] });
      B.start(2, 1, -1);
      const hall = B.spot(5, 1, -3, 180);
      // the vault: sealed under the gallery, no floor with two islands of plates and a spot, all light-leaked
      B.solid(-6, 0, -12, -5, 0, -8, 'floor'); B.solid(2, 0, -12, 3, 0, -8, 'floor'); B.solid(-2, 0, -11, 0, 0, -10, 'floor');
      for (let z = -12; z <= -8; z++) { B.plate('pA', -6, 1, z); B.plate('pA', -5, 1, z); B.plate('pB', 2, 1, z); B.plate('pB', 3, 1, z); }
      B.spot(-1, 1, -11);
      B.leak(-6, 1, -12, 3, 3, -8);
      B.card(-1, 1, -10, 180, hall, { locked: true });
      B.solid(-6, 1, -7, 3, 4, -7); B.solid(4, 1, -12, 4, 4, -8);
      // the gallery on top: a solid floor around a glass panel that looks down into the vault, glass along the front
      B.solid(-6, 4, -12, 3, 4, -12); B.solid(-6, 4, -8, 3, 4, -8); B.solid(-6, 4, -11, -4, 4, -9); B.solid(2, 4, -11, 3, 4, -9);
      B.glass(-3, 4, -11, 1, 4, -9, { axis: 'y', face: 'max' });
      B.spot(-5, 5, -10);
      B.glass(-6, 5, -7, 4, 10, -7, { axis: 'z' }); B.solid(4, 5, -12, 4, 10, -8);
      // the freight runs along the east wall
      B.glassCase(8, 2, -11, 8, 2, -1);
      B.shuttle([8, 2.1, -11], [8, 2.1, -4], { speed: 2.5, size: [0.8, 0.4, 1], orange: true });
      B.door(['pA', 'pB'], 5, 1, 1, 7, 3, 1); B.solid(5, 4, 1, 7, 10, 1);
      B.exit(6, 1, 3);
    },
  },
  {
    name: 'Lens Cap', film: 1, diff: 2,
    hint: 'Red beams are lethal, and this corridor is too low to jump. Anything standing in a beam stops it dead.',
    sol: [
      { snap: [2.5, 1.45, -2.5], say: 'Photograph the crate.' },
      { go: [0.5, -6.6] },
      { print: [-0.55, 1.47, -8.5], say: 'Print it right in front of the emitter’s lens.' },
      { go: [1.2, -6.6] },
      { go: [1.2, -10.5], say: 'Walk past while it blocks the beam.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-3, -5, 3, 0, 6], [-2, -14, 1, -6, 2]]);
      B.start(0, 1, 0);
      B.crate(2, 1, -3);
      B.emitter(-2, 1, -9, -90, { locked: true });
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Vantage', film: 1, diff: 3,
    hint: 'You can only photograph what you can see. The crate is hidden behind the wall, so find somewhere higher to look from.',
    sol: [
      { snap: [1.5, 1.5, -1.5], say: 'Photograph the blue block.' },
      { go: [0.3, -2.5] },
      { print: [-1.5, 1.52, -2.5], say: 'Print it against the lookout as a step.' },
      { go: [-3.0, -2.5], jump: true, say: 'Climb up onto the lookout.' },
      { snap: [-1.5, 2.45, -9.5], say: 'From up here you can see through the high window: photograph the crate.' },
      { print: [2.5, 1.47, -3.5], say: 'Print it on the plate.' },
      { go: [0.5, -4.0] },
      { exit: true },
    ],
    nope: [
      // from the floor the crate is hidden behind the wall
      [{ tp: [0.5, 1.02, -4.0], yaw: 0 }, { snap: [-1.5, 2.45, -9.5] }, { print: [2.5, 1.47, -3.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -12, 4, 0, 8]]);
      B.start(0, 1, 0);
      B.block(1, 1, -2, 1, 1, -2, { fixed: true });
      // the lookout: a ledge in the corner, two cells high
      B.solid(-4, 1, -4, -3, 2, -1);
      // a wall across the room: a door, a band of high windows, and a crate on the floor beyond
      B.solid(-4, 1, -6, -2, 2, -6); B.solid(2, 1, -6, 4, 2, -6);
      B.door(['p1'], -1, 1, -6, 1, 3, -6);
      B.glass(-4, 3, -6, -2, 4, -6, { axis: 'z' }); B.glass(2, 3, -6, 4, 4, -6, { axis: 'z' }); B.glass(-1, 4, -6, 1, 4, -6, { axis: 'z' });
      B.solid(-4, 5, -6, 4, 8, -6);
      B.plate('p1', 2, 1, -4);
      B.solid(-2, 1, -10, -2, 1, -10, 'trim'); B.crate(-2, 2, -10);
      B.exit(0, 1, -11);
    },
  },
  {
    name: 'Hopscotch', film: 1, diff: 4,
    hint: 'Two blue blocks and a long drop. You can’t photograph the block you just jumped from, but you can always photograph the one behind it.',
    sol: [
      { snap: [-2, 1.5, -1], say: 'Photograph one of the blue blocks.' },
      { print: [0, 0.5, -8.25], say: 'Print it over the void, a jump from the edge.' },
      { snap: [2, 1.5, -1], say: 'Photograph the other one.' },
      { print: [0, 0.5, -13.5], say: 'Print it a jump further on.' },
      { leap: [0, -3.75, 0, -8.25], say: 'Jump across both.' },
      { leap: [0, -9.0, 0, -13.5] },
      { snap: [0, 0.5, -8.25], say: 'From the second block, photograph the first one behind you.' },
      { print: [0, 0.5, -18.75], say: 'Print it a jump ahead and keep going.' },
      { leap: [0, -14.25, 0, -18.75] },
      { leap: [0, -19.5, 0, -24.0] },
      { exit: true },
    ],
    nope: [
      [
        { snap: [-2, 1.5, -1] }, { print: [0, 0.5, -8.25] },
        { snap: [2, 1.5, -1] }, { print: [0, 0.5, -13.5] },
        { leap: [0, -3.75, 0, -8.25] }, { leap: [0, -9.0, 0, -13.5] },
        { face: 0 }, { runjump: 1, late: true },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-3, -27, 3, 0, 8]], { pits: [[-3, -23, 3, -5]] });
      B.start(0, 1, 0);
      B.block(-3, 1, -2, -2, 1, -1, { fixed: true });
      B.block(1, 1, -2, 2, 1, -1, { fixed: true });
      B.exit(0, 1, -25);
    },
  },
  {
    name: 'Trapdoor', film: 1, diff: 5,
    hint: 'A crate that falls far enough hits as hard as a thrown one, and fast things smash frosted glass. Teal-striped glass grows back, so be ready to follow it down.',
    sol: [
      { snap: [3.5, 5.45, -1.5], say: 'Photograph the crate.' },
      { go: [0.5, -6.5], say: 'Stand on the frosted glass.' },
      { print: [0.5, 8.5, -5.2], say: 'Print the crate high above the glass beside you. It smashes through, and you go with it.' },
      { wait: 1.5 },
      { ground: true },
      { snap: 'crate', say: 'Down below, photograph the crate again.' },
      { go: [0.5, -7.5] },
      { print: [3.5, 1.47, -9.5], say: 'Print it on the plate.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -16, 4, 0, 11]]);
      // the deck you start on, with a frosted floor panel and a small clear window looking down
      B.solid(-4, 4, -16, 4, 4, -8);
      B.solid(-4, 4, -4, 4, 4, 0);
      B.solid(-4, 4, -7, -2, 4, -5);
      B.solid(2, 4, -7, 2, 4, -5);
      B.solid(3, 4, -7, 4, 4, -7); B.solid(3, 4, -5, 4, 4, -5); B.solid(4, 4, -6, 4, 4, -6);
      B.glass(3, 4, -6, 3, 4, -6, { axis: 'y', face: 'max' });
      B.fragile(-1, 4, -7, 1, 4, -5, { axis: 'y', face: 'max', heal: 1.5 });
      B.start(0, 5, -1);
      B.crate(3, 5, -2);
      // below: a plate and the door out
      B.plate('p1', 3, 1, -10);
      B.solid(-4, 1, -12, -2, 3, -12); B.door(['p1'], -1, 1, -12, 1, 3, -12); B.solid(2, 1, -12, 4, 3, -12);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Doorstop', film: 1, diff: 5,
    hint: 'The door only stays open while its plate is held, and the plate is sealed under glass. But a door can’t close on anything in its way.',
    sol: [
      { snap: [-2.5, 1.15, -2.5], say: 'Photograph the plank.' },
      { go: [0.5, -4.5] },
      { print: [0.5, 1.15, -6.5], yaw: 0, say: 'Lay it through the open doorway, as a doorstop.' },
      { go: [6.5, -1.0] },
      { snap: [8.5, 1.45, -0.5], say: 'Round the corner, photograph the crate on the plate. The door tries to shut, but the plank is in the way.' },
      { go: [0.5, -4.0] },
      { go: [0.5, -9.5], say: 'Walk over the plank and through.' },
      { print: [0.5, 1.47, -11.5], say: 'Print the crate against the ledge as a step.' },
      { go: [0.5, -13.5], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    nope: [
      [{ go: [0.5, -9.5] }, { snap: [8.5, 1.45, -0.5] }, { print: [0.5, 1.47, -11.5] }, { go: [0.5, -13.5], jump: true }, { exit: true }],
      [{ go: [0.5, -5.75] }, { snap: [8.5, 1.45, -0.5] }, { go: [0.5, -9.5] }, { print: [0.5, 1.47, -11.5] }, { go: [0.5, -13.5], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -6, 4, 0, 6], [5, -2, 9, 0, 6], [-1, -7, 1, -7, 6], [-4, -15, 4, -8, 6]]);
      B.start(0, 1, -1);
      B.plank(-3, -4, -3, -2, { top: 1.3 });
      // the plate and its crate, sealed in glass round the corner
      B.glassCase(8, 1, -2, 9, 2, 0);
      B.plate('p1', 8, 1, -1);
      B.crate(8, 1, -1);
      B.door(['p1'], -1, 1, -7, 1, 3, -7); B.solid(-1, 4, -7, 1, 6, -7);
      B.box([-4, 1, -15], [5, 3.2, -12]);
      B.exit(0, 3.2, -14);
    },
  },
  {
    name: 'Return Policy', film: 1, diff: 6,
    hint: 'While the crate holds its plate down, the door stays open and the beam blocks the hall. A light leak sends every photo you carry back where you took it.',
    sol: [
      { snap: [5.5, 1.45, -2.5], say: 'Photograph the crate on the plate behind the glass. The door shuts and the beam goes out.' },
      { go: [0.5, -10.0], say: 'Walk past where the beam was.' },
      { go: [3.6, -12.0], say: 'Step into the light leak: your film fogs and the crate goes back on its plate.' },
      { wait: 1 },
      { go: [0.5, -13.0], say: 'The beam is back, on your far side now, and the target opens the way out.' },
      { exit: true },
    ],
    nope: [
      [{ go: [0.5, -10.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-2, -14, 2, 0, 6], [3, -4, 5, -2, 6], [3, -8, 3, -8, 6], [3, -13, 4, -11, 6], [-5, -8, -4, -8, 6], [-3, -9, -3, -7, 6], [-1, -15, 1, -15, 6], [-2, -19, 2, -16, 6]]);
      B.start(0, 1, 0);
      // the plate and crate, sealed behind glass
      B.glass(3, 1, -4, 3, 6, -2);
      B.plate('p1', 5, 1, -3);
      B.crate(5, 1, -3);
      // the emitter waits behind a door that opens while the plate is held, in a niche too tight to walk round it
      B.solid(-5, 1, -8, -5, 1, -8, 'trim');
      B.emitter(-5, 2, -8, -90, { locked: true });
      B.door(['p1'], -3, 1, -9, -3, 3, -7); B.solid(-3, 4, -9, -3, 6, -7);
      B.solid(3, 1, -8, 3, 1, -8, 'trim'); B.receptor('r1', 3, 2, -8);
      // a light leak in an alcove past the beam
      B.leak(3, 1, -13, 4, 6, -11);
      B.door(['r1'], -1, 1, -15, 1, 3, -15); B.solid(-1, 4, -15, 1, 6, -15);
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Hall of Mirrors', film: 1, diff: 7,
    hint: 'The beam has to go all the way round the hall to reach the target in the alcove, and wherever it runs, you can’t cross. Turn it one corner at a time.',
    sol: [
      { snap: [-6.5, 2.0, -3.5], say: 'Photograph the orange mirror.' },
      { print: [-4.5, 2.0, -14.5], yaw: 45, say: 'Stand it at the top of the left-hand hall, turned so the beam runs along the far end.' },
      { go: [-6.5, -12.0] },
      { go: [-6.5, -15.5] },
      { go: [2.0, -15.5], say: 'Go round behind it, along the far wall.' },
      { snap: [7.5, 3.0, -15.5], say: 'Photograph the blue mirror in the corner.' },
      { print: [6.5, 2.5, -14.5], yaw: 135, say: 'Hang it in the beam to turn it down the right-hand hall.' },
      { go: [7.5, -15.5] },
      { go: [7.5, -6.0], say: 'Go round it and down the far side of the beam.' },
      { snap: [5.5, 2.0, -7.5], say: 'Photograph the last mirror.' },
      { print: [6.5, 2.0, -2.5], yaw: 45, say: 'Stand it in the beam to turn it into the alcove.' },
      { go: [7.5, 0.0] },
      { exit: true },
    ],
    nope: [
      [
        { snap: [-6.5, 2.0, -3.5] }, { print: [-4.5, 2.0, -14.5], yaw: 45 },
        { go: [-6.5, -12.0] }, { go: [-6.5, -15.5] }, { go: [2.0, -15.5] },
        { snap: [7.5, 3.0, -15.5] }, { print: [5.5, 2.5, -14.5], yaw: 135 },
        { go: [7.5, -15.5] }, { go: [7.5, 0.0] }, { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-7, -13, -5, 0, 6], [-7, -16, 7, -14, 6], [5, -13, 7, 0, 6], [4, -3, 4, -3, 6], [5, 1, 7, 1, 6], [5, 2, 7, 4, 6]]);
      B.start(-6, 1, 0);
      B.solid(-5, 1, -1, -5, 1, -1, 'trim');
      B.emitter(-5, 2, -1, 0, { locked: true });
      B.mirror(-7, 1, -4, 0);
      B.mirror(7, 2, -16, 0, { fixed: true });
      B.mirror(5, 1, -8, 0);
      B.solid(4, 1, -3, 4, 1, -3, 'trim'); B.receptor('r1', 4, 2, -3);
      B.door(['r1'], 5, 1, 1, 7, 3, 1); B.solid(5, 4, 1, 7, 6, 1);
      B.exit(6, 1, 3);
    },
  },
  {
    name: 'Skylight', film: 1, diff: 6,
    hint: 'Pads throw crates too. Frosted glass gives way to anything that hits it fast enough, from below as well as above.',
    sol: [
      { snap: [3.5, 1.45, -0.5], say: 'Photograph the crate.' },
      { go: [-2.5, -3.0] },
      { print: [0.5, 2.9, -5.5], say: 'Print it above the jump pad. It drops onto the pad, and the pad throws it through the frosted ceiling.' },
      { wait: 1.5 },
      { snap: 'crate', say: 'Photograph the crate again as it bounces.' },
      { tp: [0.5, 1.3, -5.5], yaw: 0 },
      { until: '__shutter.player.position.y > 5.6', t: 3, say: 'Bounce up through the hole.' },
      { go: [0.5, -8.5] },
      { print: [3.5, 5.47, -2.5], say: 'Upstairs, print the crate on the plate.' },
      { exit: true },
    ],
    nope: [
      [{ tp: [0.5, 1.3, -5.5], yaw: 0 }, { until: '__shutter.player.position.y > 5.6', t: 3 }, { go: [0.5, -8.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -14, 4, 0, 10]]);
      // the ceiling of the lower room is the floor of the upper one, with a frosted panel over the pad
      B.solid(-4, 4, -14, 4, 4, -8);
      B.solid(-4, 4, -4, 4, 4, 0);
      B.solid(-4, 4, -7, -2, 4, -5);
      B.solid(2, 4, -7, 4, 4, -5);
      B.fragile(-1, 4, -7, 1, 4, -5, { axis: 'y', face: 'min' });
      B.pad(0, 1, -6, { locked: true });
      B.start(-2, 1, -1);
      B.crate(3, 1, -1);
      // upstairs
      B.plate('p1', 3, 5, -3);
      B.solid(-4, 5, -11, -2, 10, -11); B.door(['p1'], -1, 5, -11, 1, 7, -11); B.solid(-1, 8, -11, 1, 10, -11); B.solid(2, 5, -11, 4, 10, -11);
      B.exit(0, 5, -13);
    },
  },
  {
    name: 'Beanstalk', film: 1, copy: true, diff: 6,
    hint: 'One blue pad on a plate that holds the door at the top open, and a very tall shaft. Double-X can copy the very thing you bounce off, and a blue pad hangs wherever you print it, even at the top of a bounce.',
    sol: [
      { tp: [0.5, 1.3, -1.5], yaw: 0 },
      { until: '__shutter.player.position.y > 2.2', t: 2 },
      { snap: [0.5, 1.125, -1.5], say: 'Bounce, and copy the pad below you as you leave it.' },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25, say: 'At the top of the bounce, print the copy under your feet.' },
      { until: '__shutter.player.position.y > 8.0', t: 3, say: 'Land on it, and do it again.' },
      { snap: [0.5, 6.7, -1.5] },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25 },
      { until: '__shutter.player.position.y > 17.2', t: 3, say: 'On the last bounce, drift onto the ledge.' },
      { go: [0.5, -3.0] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-2, -4, 2, 0, 21], [-1, -7, 1, -5, 21]]);
      B.start(0, 1, 0);
      B.plate('p1', 0, 1, -2);
      B.pad(0, 1, -2, { fixed: true });
      B.box([-2, 1, -4], [3, 17, -2]);
      // the way out: a doorway off the top ledge that stays open while the pad sits on its plate
      B.box([-1, 1, -7], [2, 17, -4]);
      B.door(['p1'], -1, 17, -5, 1, 19, -5); B.solid(-1, 20, -5, 1, 21, -5);
      B.exit(0, 17, -6);
    },
  },
  {
    name: 'Red Tape', film: 2, diff: 7,
    hint: 'Two frames, three things, and the amber door won’t let you back. Red light keeps anything in it off your film for good, and the plate past the vestibule has to stay held until you leave.',
    sol: [
      { snap: [3.5, 1.5, -1.5], say: 'Photograph the blue block.' },
      { snap: [-2.5, 1.45, -1.5], say: 'And the crate (or the plank): whichever you take is going to be left behind.' },
      { go: [0.5, -8.5], say: 'Through the one-way door and the red vestibule.' },
      { go: [3.5, -10.5] },
      { sel: 1 },
      { print: [5.5, 1.47, -7.5], say: 'Give up the crate: print it on the plate in the red alcove.' },
      { go: [7.5, -12.5] },
      { print: [7.5, 0.5, -16.0], say: 'Print the block in the middle of the pit as a stepping stone.' },
      { leap: [7.5, -12.75, 7.5, -16.0], say: 'Jump across.' },
      { leap: [7.5, -16.4, 7.5, -20.0] },
      { snap: [7.5, 0.5, -16.0], say: 'Photograph the block again from the far side.' },
      { go: [8.5, -21.6], say: 'Through the door the plate is holding open.' },
      { print: [8.0, 1.875, -22.45], say: 'Hang the block in front of the ledge as a step.' },
      { go: [8.0, -24.0], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    nope: [
      [
        { snap: [3.5, 1.5, -1.5] }, { snap: [-2.5, 1.45, -1.5] }, { go: [0.5, -8.5] }, { go: [3.5, -10.5] },
        { sel: 0 }, { print: [5.5, 1.5, -7.5] }, { go: [7.5, -12.5] }, { print: [7.5, 1.47, -19.5] },
        { leap: [7.5, -12.75, 7.5, -20.0] }, { go: [8.5, -21.6] }, { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-4, -5, 4, 0, 6], [-1, -6, 1, -6, 6], [-1, -11, 1, -7, 6], [2, -11, 9, -10, 6], [4, -9, 5, -8, 6], [6, -25, 9, -12, 7]], { pits: [[6, -19, 9, -14]] });
      B.start(0, 1, -1);
      B.crate(-3, 1, -2);
      B.block(3, 1, -2, 3, 1, -2, { fixed: true });
      B.plank(-2, -4, 2, -4, { top: 1.3 });
      B.door([], -1, 1, -6, 1, 3, -6, { oneway: true }); B.solid(-1, 4, -6, 1, 6, -6);
      // the vestibule and the plate alcove are lit red: nothing printed there can be photographed again
      B.safelight(-1, 1, -11, 1, 6, -7);
      B.safelight(4, 1, -9, 5, 6, -8);
      B.plate('p1', 5, 1, -8);
      B.solid(6, 1, -21, 6, 7, -21); B.door(['p1'], 7, 1, -21, 9, 3, -21); B.solid(7, 4, -21, 9, 7, -21);
      B.box([6, 1, -25], [10, 3.75, -23]);
      B.exit(8, 3.75, -24);
    },
  },
  {
    name: 'Zigzag', film: 1, copy: true, diff: 7,
    hint: 'One mirror, as many copies as you like, and none of them can ever be taken back. Every beam you bend is a wall you can’t cross, so be on the right side of it when you make it.',
    sol: [
      { snap: [-2.5, 3.0, 0.5], say: 'Copy the blue mirror.' },
      { print: [3.5, 2.5, -1.5], yaw: -45, say: 'Hang a copy in the beam near the emitter, turning it up the room.' },
      { go: [1.0, -3.0] },
      { go: [0.5, -9.0], say: 'Walk up past where the next turn will be, before you make it.' },
      { snap: [-2.5, 3.0, 0.5] },
      { print: [3.5, 2.5, -7.5], yaw: 135, say: 'Turn the beam across the room behind you.' },
      { snap: [-2.5, 3.0, 0.5] },
      { print: [-3.5, 2.5, -7.5], yaw: 135, say: 'And once more, up into the target.' },
      { exit: true },
    ],
    nope: [
      [
        { snap: [-2.5, 3.0, 0.5] }, { print: [3.5, 2.5, -1.5], yaw: -45 },
        { snap: [-2.5, 3.0, 0.5] }, { print: [3.5, 2.5, -7.5], yaw: 135 },
        { snap: [-2.5, 3.0, 0.5] }, { print: [-3.5, 2.5, -7.5], yaw: 135 },
        { go: [1.0, -3.0] }, { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-5, -10, 5, 0, 7], [-4, -11, -4, -11, 7], [-1, -11, 1, -11, 7], [-2, -15, 2, -12, 7]]);
      B.start(-1, 1, 0);
      B.solid(5, 1, -2, 5, 1, -2, 'trim');
      B.emitter(5, 2, -2, 90, { locked: true });
      B.mirror(-3, 2, 0, 0, { fixed: true });
      B.solid(-4, 1, -11, -4, 1, -11, 'trim'); B.receptor('r1', -4, 2, -11); B.solid(-4, 3, -11, -4, 7, -11);
      B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 7, -11);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Enlargement', film: 1, copy: true, zoom: true, diff: 7,
    hint: 'A tiny orange cube, a wall five metres high. On Zoom film a copy comes out bigger the farther away you print it, and three steps of different heights make a staircase.',
    sol: [
      { tp: [-3.6, 1.02, -0.5], yaw: 90 },
      { snap: [-4.5, 2.125, -0.5], say: 'Copy the little cube from close up.' },
      { zprint: [0.5, 0, -18.0], rest: 1.02, scale: 4.0, from: [0, 1], say: 'Print the biggest step against the far wall, from far enough back to make it four metres tall.' },
      { go: [-3.6, -0.5] },
      { snap: [-4.5, 2.125, -0.5] },
      { zprint: [0.5, 0, -14.3], rest: 1.02, scale: 2.67, from: [0, 1], say: 'Copy it again and print a middle step in front of that one, from a little nearer.' },
      { go: [-3.6, -0.5] },
      { snap: [-4.5, 2.125, -0.5] },
      { zprint: [0.5, 0, -11.85], rest: 1.02, scale: 1.33, from: [0, 1], say: 'And a small step in front of that.' },
      { go: [0.5, -22.0], jump: true, say: 'Climb your staircase.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-5, -24, 5, 0, 9]]);
      B.start(0, 1, 0);
      B.solid(-5, 1, -1, -5, 1, -1, 'trim');
      B.glassCase(-5, 2, -1, -5, 2, -1);
      B.miniBlock(-4.5, 2, -0.5, 0.25);
      B.solid(-5, 1, -24, 5, 5, -21);
      B.exit(0, 6, -22);
    },
  },
  {
    name: 'Dark Copy', film: 1, copy: true, diff: 6,
    hint: 'The only crate bounces on a pad in red light, and nothing in red light shows up on film. Watch where it goes at the top of each bounce.',
    sol: [
      { until: 'T.obj("crate").body.position.y > 4.25', t: 4 },
      { snap: 'crate', say: 'Copy the crate at the top of a bounce, when it pops up out of the red light.' },
      { print: [-2.5, 1.47, -4.5], say: 'One copy on the floor plate.' },
      { until: 'T.obj("crate").body.position.y > 4.25', t: 4 },
      { snap: 'crate' },
      { print: [0.5, 1.47, -7.45], say: 'One against the ledge, as a step.' },
      { go: [0.5, -9.5], jump: true, say: 'Climb up.' },
      { until: 'T.obj("crate").body.position.y > 4.25', t: 4 },
      { snap: 'crate', say: 'Copy it once more from up here.' },
      { print: [3.5, 3.47, -9.5], say: 'And put it on the plate on the ledge.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -14, 4, 0, 8]]);
      B.start(0, 1, 0);
      B.pad(3, 1, -2, { locked: true });
      B.chute(3, -2, 1, 3.4, { loop: false });
      B.safelight(2, 1, -3, 4, 3, -1);
      B.solid(-4, 1, -14, 4, 2, -9);
      B.plate('p1', 3, 3, -10);
      B.plate('p2', -3, 1, -5);
      B.solid(-4, 3, -12, -2, 8, -12); B.door(['p1', 'p2'], -1, 3, -12, 1, 5, -12); B.solid(-1, 6, -12, 1, 8, -12); B.solid(2, 3, -12, 4, 8, -12);
      B.exit(0, 3, -13);
    },
  },
  {
    name: 'Blow-Up', film: 1, copy: true, zoom: true, diff: 8,
    hint: 'The model plank is tiny, the pit is wide, and the model’s stand is a plate that holds the far door open. A copy can be copied, from as close as you like.',
    sol: [
      { tp: [-2.6, 1.02, 0.5], yaw: 90 },
      { snap: [-3.5, 2.085, 0.5], say: 'Copy the model plank from close up.' },
      { go: [-1.54, 0.5] },
      { print: [3.0, 1.095, -1.5], yaw: 90, scale: 0.5, say: 'Print a bigger copy on the floor, as far away as the room allows.' },
      { go: [3.0, -0.3] },
      { snap: [3.0, 1.095, -1.5], say: 'Now copy that copy, from close up.' },
      { go: [3.0, -2.63] },
      { print: [0.5, 1.28, -8.5], yaw: 0, scale: 1.75, say: 'Print it out over the void: blown up twice, it spans the whole pit.' },
      { go: [0.5, -2.0] },
      { go: [0.5, -15.0], jump: true, say: 'Walk across.' },
      { exit: true },
    ],
    nope: [
      [{ tp: [-2.6, 1.02, 0.5], yaw: 90 }, { snap: [-3.5, 2.085, 0.5] }, { go: [3.5, 0.5] }, { print: [-1.5, 1.2, -8.5], yaw: 0, scale: 1.0 }, { go: [-1.5, -3.2] }, { go: [-1.5, -15.0], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -18, 4, 0, 8]], { pits: [[-4, -14, 4, -4]] });
      // you start a few steps from the model on its stand, facing it
      B.start(-1, 1, 0, 90);
      B.solid(-4, 1, 0, -4, 1, 0, 'trim');
      B.glassCase(-4, 2, 0, -4, 2, 0);
      // the model rests on a low riser on a plate: take the model and the far door shuts
      B.plate('p1', -4, 2, 0);
      B.box([-3.88, 2, 0.12], [-3.12, 2.07, 0.88], 'trim');
      B.miniPlank(-3.5, 2.07, 0.5, 7, 0.1);
      B.solid(-4, 1, -16, -2, 8, -16); B.door(['p1'], -1, 1, -16, 1, 3, -16); B.solid(-1, 4, -16, 1, 8, -16); B.solid(2, 1, -16, 4, 8, -16);
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Proof Sheet', film: 1, copy: true, diff: 8,
    hint: 'Everything you need is in the first room, and none of it can be seen from past the light leak. Copies don’t come home from a leak, they vanish. Copies of copies are just as good, and nothing you print on Double-X can be taken back.',
    sol: [
      { snap: [-3.0, 1.45, -1.0], say: 'Copy the crate.' },
      { go: [5.5, -4.0] }, { go: [7.5, -6.5] },
      { print: [8.5, 1.47, -13.0], say: 'Print it past the light leak: copies you carry through it are lost.' },
      { go: [6.5, -4.0] }, { go: [2.0, -2.5] },
      { snap: [3.5, 3.0, -1.5], say: 'Do the same with the mirror...' },
      { go: [5.5, -4.0] }, { go: [7.5, -6.5] },
      { print: [6.5, 3.0, -14.6], yaw: 0 },
      { go: [6.5, -4.0] }, { go: [1.5, -1.5] },
      { snap: [0.5, 1.125, -2.5], say: '...and the jump pad.' },
      { go: [5.5, -4.0] }, { go: [7.5, -6.5] },
      { print: [8.5, 1.125, -14.5] },
      { go: [7.5, -12.5], say: 'Now walk through the leak with nothing on your film.' },
      { go: [3.5, -13.0] },
      { snap: [6.5, 3.0, -14.6] },
      { print: [-2.5, 2.5, -15.5], yaw: 45, say: 'Turn the beam up the room with a copy of your copy.' },
      { snap: [8.5, 1.47, -13.0] },
      { print: [1.5, 1.47, -17.5], say: 'Weigh down both plates.' },
      { snap: [8.5, 1.47, -13.0] },
      { print: [5.5, 1.47, -17.5] },
      { go: [3.5, -21.5], say: 'Get past the next turn before you make it.' },
      { snap: [6.5, 3.0, -14.6] },
      { print: [-2.5, 2.5, -20.5], yaw: 45, say: 'Turn the beam into the target behind you.' },
      { go: [7.5, -21.5] },
      { snap: [8.5, 1.125, -14.5], say: 'Copy the pad and go through.' },
      { go: [0.5, -21.5] }, { go: [0.5, -24.5] }, { go: [0.5, -27.4] },
      { print: [0.5, 1.125, -28.5], say: 'Print it under the ledge.' },
      { tp: [0.5, 1.3, -28.5], yaw: 0 },
      { until: '__shutter.player.position.y > 2.2', t: 2 },
      { snap: [0.5, 1.125, -28.5], say: 'Bounce, copy the pad as you leave it, and print it under you at the top.' },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25 },
      { until: '__shutter.player.position.y > 11.3', t: 3 },
      { go: [0.5, -31.5] },
      { exit: true },
    ],
    nope: [
      [{ snap: [-3.0, 1.45, -1.0] }, { go: [5.5, -4.0] }, { go: [7.5, -12.5] }, { print: [1.5, 1.47, -17.5] }, { exit: true }],
      [
        { snap: [-3.0, 1.45, -1.0] }, { go: [5.5, -4.0] }, { go: [7.5, -6.5] }, { print: [8.5, 1.47, -13.0] },
        { go: [6.5, -4.0] }, { go: [2.0, -2.5] }, { snap: [3.5, 3.0, -1.5] }, { go: [5.5, -4.0] }, { go: [7.5, -6.5] }, { print: [6.5, 3.0, -14.6], yaw: 0 },
        { go: [7.5, -12.5] }, { go: [3.5, -13.0] },
        { snap: [6.5, 3.0, -14.6] }, { print: [-2.5, 2.5, -15.5], yaw: 45 },
        { snap: [6.5, 3.0, -14.6] }, { print: [-2.5, 2.5, -20.5], yaw: 45 },
        { snap: [8.5, 1.47, -13.0] }, { print: [1.5, 1.47, -17.5] }, { snap: [8.5, 1.47, -13.0] }, { print: [5.5, 1.47, -17.5] },
        { go: [3.5, -21.5] }, { go: [0.5, -21.5] }, { go: [0.5, -24.5] }, { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-4, -5, 4, 0, 7], [5, -5, 8, -3, 7], [6, -12, 8, -6, 7], [-4, -22, 8, -13, 7], [9, -21, 9, -21, 7], [-1, -23, 1, -23, 7], [-4, -33, 4, -24, 15]]);
      B.start(0, 1, 0);
      // the originals, out of sight of everything past the leak
      B.glassCase(-4, 1, -2, -3, 2, -1);
      B.crate(-3.5, 1, -1.5);
      B.mirror(3, 2, -2, 0, { fixed: true });
      B.pad(0, 1, -3, { fixed: true });
      B.leak(6, 1, -10, 8, 7, -10);
      // the beam room
      B.solid(-4, 1, -16, -4, 1, -16, 'trim');
      B.emitter(-4, 2, -16, -90, { locked: true });
      B.solid(9, 1, -21, 9, 1, -21, 'trim'); B.receptor('r1', 9, 2, -21);
      B.plate('p1', 1, 1, -18); B.plate('p2', 5, 1, -18);
      B.door(['p1', 'p2', 'r1'], -1, 1, -23, 1, 3, -23); B.solid(-1, 4, -23, 1, 7, -23);
      // the tower
      B.box([-4, 1, -33], [5, 11, -30]);
      B.exit(0, 11, -32);
    },
  },
  {
    name: 'Long Distance', film: 1, postcard: true, diff: 5,
    hint: 'A beam that goes into a postcard comes out of the photo spot, the way its arrow points. Turn the card to face the beam before you print it.',
    sol: [
      { snap: [2.5, 1.6, -7.5], say: 'Photograph the photo spot in the glass room.' },
      { print: [0.5, 2.02, -3.5], yaw: -90, say: 'Print the postcard in the beam, turned so its picture faces the emitter.' },
      { go: [2.0, -2.5] }, { go: [2.0, -4.5], say: 'The beam now ends at the card. Walk round behind it.' },
      { go: [-1.0, -6.0] }, { go: [0.0, -11.0] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-5, -11, 5, 0, 6], [-1, -15, 1, -12, 6]]);
      B.start(0, 1, 0);
      B.emitter(-5, 1, -4, -90, { locked: true });
      // a sealed glass room with a photo spot pointing at the target
      B.glass(1, 1, -10, 5, 6, -10); B.glass(1, 1, -6, 5, 6, -6); B.glass(1, 1, -10, 1, 6, -6);
      B.spot(2, 1, -8, -90);
      B.receptor('r1', 4, 1, -8);
      B.door(['r1'], -1, 1, -12, 1, 3, -12); B.solid(-1, 4, -12, 1, 6, -12);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Smash and Grab', film: 1, motion: true, diff: 5,
    hint: 'The plate is sealed behind frosted glass, so you can’t print onto it. A crate thrown hard enough goes straight through the glass and keeps going.',
    sol: [
      { wait: 1.5 },
      { snap: [-2.5, 4.0, -1.5], say: 'Photograph the crate while it falls down the tube.' },
      { tp: [3.0, 1.02, -3.5], yaw: 0 },
      { launch: [3.0, 3.0, -8.0], say: 'Throw it at the frosted window: it smashes through and drops onto the plates behind.' },
      { wait: 1.5 },
      { go: [-2.0, -7.6] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-4, -8, 4, 0, 7], [2, -11, 3, -9, 7], [-3, -14, -1, -9, 7]]);
      B.start(0, 1, 0);
      B.chute(-3, -2, 1, 8);
      // a cubby behind a frosted window, its floor all plate
      B.solid(2, 1, -9, 3, 1, -9); B.fragile(2, 2, -9, 3, 3, -9, { axis: 'z', face: 'max' }); B.solid(2, 4, -9, 3, 7, -9);
      B.plate('p1', 2, 1, -10); B.plate('p1', 3, 1, -10); B.plate('p1', 2, 1, -11); B.plate('p1', 3, 1, -11);
      B.door(['p1'], -3, 1, -9, -1, 3, -9); B.solid(-3, 4, -9, -1, 7, -9);
      B.exit(-2, 1, -13);
    },
  },
  {
    name: 'Double Duty', film: 1, postcard: true, diff: 6,
    hint: 'The plate wants weight and the target wants light, and both are sealed in the glass room. One photo spot can carry both, one after the other.',
    sol: [
      { snap: [3.5, 1.6, -7.5], say: 'Photograph the photo spot on the plate in the glass room.' },
      { print: [-4.5, 2.02, -1.5], yaw: 0, say: 'Print the postcard right over the crate: it goes through and lands on the plate. The first door opens.' },
      { wait: 1 },
      { snap: [3.5, 1.6, -7.5], say: 'Photograph the spot again.' },
      { go: [-3.0, -6.5] }, { go: [-3.0, -9.5], say: 'Go through, staying clear of the beam.' },
      { print: [-2.5, 2.02, -11.5], yaw: -90, say: 'Hang the postcard in the beam, facing the emitter: the light comes out of the spot, over the crate, into the target.' },
      { go: [-1.5, -10.5] }, { go: [-1.5, -13.5] }, { go: [-3.0, -16.0] },
      { exit: true },
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [-4, -20, -2, -17, 7]]);
      B.start(-3, 1, 0);
      B.glass(1, 1, -16, 1, 7, 0);
      B.plate('p1', 3, 1, -8); B.spot(3, 1, -8, -90);
      B.solid(5, 1, -8, 5, 1, -8, 'trim'); B.receptor('r1', 5, 2, -8);
      B.crate(-5, 1, -2);
      B.solid(-6, 1, -8, -5, 7, -8); B.solid(-1, 1, -8, 0, 7, -8); B.door(['p1'], -4, 1, -8, -2, 3, -8); B.solid(-4, 4, -8, -2, 7, -8);
      B.solid(-6, 1, -12, -6, 1, -12, 'trim'); B.emitter(-6, 2, -12, -90, { locked: true });
      B.door(['r1'], -4, 1, -17, -2, 3, -17); B.solid(-4, 4, -17, -2, 7, -17);
      B.exit(-3, 1, -19);
    },
  },
  {
    name: 'Terminal Velocity', film: 1, motion: true, diff: 6,
    hint: 'This tube has brakes: its crate never falls fast, and slow crates bounce off glass. Anything you print up high falls as fast as gravity likes.',
    sol: [
      { tp: [1.5, 1.02, -1.5] },
      { snap: [3.5, 4.0, -2.5], say: 'Photograph the slow crate in the tube.' },
      { print: [0.5, 9.0, -5.5], say: 'Print it up high, near the ceiling, and let it drop.' },
      { until: 'T.obj("crate") && T.obj("crate").body.velocity.y < -10.5', t: 3 },
      { snap: 'crate', nowait: true, say: 'Photograph it again just before it lands: now it is moving fast.' },
      { tp: [0.5, 1.02, -5.5], yaw: 0 },
      { launch: [0.5, 3.0, -10.0], say: 'Throw it at the frosted window.' },
      { wait: 1 },
      { go: [0.5, -9.6] },
      { go: [0.5, -11.9], jump: true, say: 'Climb in through the broken window.' },
      { go: [-0.5, -13.5] },
      { exit: true },
    ],
    nope: [
      // the slow crate straight at the glass
      [{ tp: [1.5, 1.02, -1.5] }, { snap: [3.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -7.5], yaw: 0 }, { launch: [0.5, 3.0, -10.0] }, { wait: 1 }, { go: [0.5, -9.6] }, { exit: true, jump: true }],
      // drop the slow crate in front of the glass and shove it
      [{ tp: [1.5, 1.02, -1.5] }, { snap: [3.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -6.5], yaw: 0 }, { print: [0.5, 1.47, -9.0] }, { tp: [0.5, 1.02, -6.0], yaw: 0 }, { go: [0.5, -9.6] }, { exit: true, jump: true }],
    ],
    build(B) {
      // (a long corridor behind the window, so the crate you throw through it never ends up on the exit)
      B.plan([[-4, -10, 4, 0, 10], [-1, -18, 1, -11, 10]]);
      B.start(0, 1, 0);
      B.chute(3, -3, 1, 10, { vmax: 2.5 });
      B.solid(-1, 1, -11, -1, 10, -11); B.solid(1, 1, -11, 1, 10, -11); B.solid(0, 1, -11, 0, 1, -11, 'trim'); B.solid(0, 4, -11, 0, 10, -11);
      B.fragile(0, 2, -11, 0, 3, -11, { face: 'max' });
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Knockout', film: 1, motion: true, diff: 6,
    hint: 'Gray crates can’t be photographed, but nothing stops you knocking one over. Hard.',
    sol: [
      { wait: 1.0 },
      { snap: [3.5, 4.0, -1.5], say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -1.5], yaw: 0 },
      { launch: [0.5, 4.45, -5.5], say: 'Throw it at the gray crate on the pillar, to knock it out of the beam.' },
      { wait: 3 },
      { go: [-2.0, -4.0] }, { go: [-2.0, -10.5] }, { go: [0.5, -11.0] },
      { exit: true },
    ],
    nope: [
      // drop a crate on top of the gray one instead of throwing it
      [{ wait: 1.0 }, { snap: [3.5, 4.0, -1.5] }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { print: [0.5, 5.6, -5.5] }, { wait: 3 }, { go: [-2.0, -4.0] }, { go: [-2.0, -10.5] }, { go: [0.5, -11.0] }, { exit: true }],
      [{ wait: 1.0 }, { snap: [3.5, 4.0, -1.5] }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { print: [0.8, 5.6, -5.2] }, { wait: 3 }, { go: [-2.0, -4.0] }, { go: [-2.0, -10.5] }, { go: [0.5, -11.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -11, 5, 0, 7], [-1, -15, 1, -12, 7]]);
      B.start(0, 1, 0);
      B.chute(3, -2, 1, 8);
      B.solid(-5, 1, -6, -5, 3, -6, 'trim'); B.emitter(-5, 4, -6, -90, { locked: true });
      B.solid(5, 1, -6, 5, 3, -6, 'trim'); B.receptor('r1', 5, 4, -6);
      B.box([0.25, 1, -5.75], [0.75, 4, -5.25], 'trim');
      B.crate(0, 4, -6, { pinned: true });
      B.door(['r1'], -1, 1, -12, 1, 3, -12); B.solid(-1, 4, -12, 1, 7, -12);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Detour', film: 2, postcard: true, diff: 6,
    hint: 'The way out is in the walled room with the glass roof, and you can only see into it from up high. Take what you need before you go.',
    sol: [
      { snap: [-4.5, 1.45, -1.5], say: 'Photograph the crate first: you will need it later.' },
      { go: [-6.5, -6.5] },
      { snap: [1.5, 10.0, -6.5], say: 'From the far side, photograph the photo spot in the glass lookout on the tower.' },
      { print: [-3.5, 2.02, -6.5], yaw: -90, say: 'Print the postcard and step up into the lookout.' },
      { walkin: true, yaw: -90 },
      { go: [3.0, -6.5] },
      { snap: [9.5, 3.0, -6.5], say: 'From up here you can see down through the glass roof: photograph the spot inside.' },
      { face: 90 },
      { print: [1.3, 9.02, -6.5], yaw: 90, say: 'Print that postcard in the lookout and walk in.' },
      { walkin: true, yaw: 90 },
      { print: [8.5, 1.47, -5.5], say: 'Inside, print the crate on the plate.' },
      { exit: true },
    ],
    build(B) {
      B.plan([[-7, -10, 10, 0, 10], [8, -14, 10, -11, 3]]);
      B.start(-3, 1, 0);
      B.crate(-5, 1, -2);
      B.spot(-5, 1, -8);
      // the lookout: a glass booth on a tower
      B.solid(0, 1, -9, 3, 7, -6);
      B.glass(0, 8, -9, 3, 10, -9); B.glass(0, 8, -6, 3, 10, -6); B.glass(0, 8, -9, 0, 10, -6); B.glass(3, 8, -9, 3, 10, -6);
      B.spot(1, 8, -7, 90);
      // the walled room with a glass roof
      B.box([7, 1, -10], [8, 4, -3]); B.box([8, 1, -4], [11, 4, -3]);
      B.glass(8, 3, -9, 10, 3, -5);
      B.spot(9, 1, -7);
      B.plate('p1', 8, 1, -6);
      B.door(['p1'], 8, 1, -10, 10, 3, -10);
      B.exit(9, 1, -13);
    },
  },
  {
    name: 'Window Seat', film: 2, motion: true, postcard: true, diff: 7,
    hint: 'A throw through a postcard comes out the way the spot’s arrow points, and this one points the wrong way. A photo keeps its speed for as long as you keep the photo.',
    sol: [
      { wait: 1.5 },
      { snap: [-3.5, 4.0, -1.5], say: 'Photograph the falling crate.' },
      { snap: [-0.5, 1.6, -8.5], say: 'Photograph the photo spot in the glass room as well.' },
      { sel: 1 },
      { print: [0.5, 2.02, -3.5], yaw: 0, say: 'Print the postcard and step through yourself, carrying the throw with you.' },
      { tp: [0.5, 1.02, -1.5], yaw: 0 },
      { walkin: true, yaw: 0 },
      { face: 0 },
      { launch: [-0.0, 3.0, -12.0], say: 'Inside, turn round and throw the crate at the frosted window.' },
      { wait: 1 },
      { go: [0.0, -11.5] },
      { exit: true, jump: true },
    ],
    nope: [
      // throw through the postcard from outside: it comes out heading the wrong way
      [{ wait: 1.5 }, { snap: [-0.5, 1.6, -8.5] }, { print: [0.5, 2.02, -3.5], yaw: 0 }, { snap: [-3.5, 4.0, -1.5] }, { tp: [0.5, 1.02, -0.5], yaw: 0 }, { launch: [-0.5, 3.0, -12.0], via: [0.5, 2.5, -3.5] }, { wait: 2 }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { walkin: true, yaw: 0 }, { face: 0 }, { go: [0.0, -11.5] }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 7], [-1, -16, 0, -13, 7]]);
      B.start(0, 1, 0);
      B.chute(-4, -2, 1, 8);
      // the glass room: a spot facing back the way you came, a frosted window behind it
      B.glass(-5, 1, -7, 5, 7, -7);
      B.spot(-1, 1, -9, 180);
      B.solid(-1, 1, -13, 0, 1, -13, 'trim'); B.fragile(-1, 2, -13, 0, 3, -13, { face: 'max' }); B.solid(-1, 4, -13, 0, 7, -13);
      B.exit(-1, 1, -15);
    },
  },
  {
    name: 'Quick Draw', film: 2, motion: true, diff: 7,
    hint: 'One window, two panes, and teal glass grows back unless the whole window goes at once. Hold two throws and fire them fast: Q swaps photos.',
    sol: [
      { wait: 1.5 },
      { snap: [-3.5, 4.0, -2.5], say: 'Photograph the crate in the left tube.' },
      { snap: [4.5, 4.0, -2.5], say: 'And the one in the right tube.' },
      { tp: [0.0, 1.02, -4.0], yaw: 0 },
      { sel: 0 },
      { launch: [0.0, 3.0, -9.0], settle: 8, say: 'Throw one at the lower pane…' },
      { sel: 0 },
      { launch: [0.0, 5.5, -9.0], settle: 60, say: '…and the other at the upper pane, before the first grows back.' },
      { go: [0.0, -8.6] },
      { exit: true, jump: true },
    ],
    nope: [
      // one pane at a time: the first grows back
      [{ wait: 1.5 }, { snap: [-3.5, 4.0, -2.5] }, { snap: [4.5, 4.0, -2.5] }, { tp: [0.0, 1.02, -4.0], yaw: 0 }, { sel: 0 }, { launch: [0.0, 3.0, -9.0], settle: 8 }, { wait: 2.5 }, { sel: 0 }, { launch: [0.0, 5.5, -9.0] }, { go: [0.0, -8.6] }, { exit: true, jump: true }],
      // one crate at the lintel between them
      [{ wait: 1.5 }, { snap: [-3.5, 4.0, -2.5] }, { tp: [0.0, 1.02, -4.0], yaw: 0 }, { launch: [0.0, 4.5, -9.0] }, { go: [0.0, -8.6] }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-5, -9, 5, 0, 9], [-1, -14, 0, -10, 9]]);
      B.start(0, 1, 0);
      B.chute(-4, -3, 1, 10); B.chute(4, -3, 1, 10);
      // a tall window in two healing panes, with a lintel between them
      B.solid(-1, 1, -10, 0, 1, -10, 'trim');
      B.fragile(-1, 2, -10, 0, 3, -10, { face: 'max', group: 'w', heal: 2 });
      B.solid(-1, 4, -10, 0, 4, -10);
      B.fragile(-1, 5, -10, 0, 5, -10, { face: 'max', group: 'w', heal: 2 });
      B.solid(-1, 6, -10, 0, 9, -10);
      B.exit(-1, 1, -13);
    },
  },
  {
    name: 'Special Delivery', film: 1, motion: true, postcard: true, diff: 7,
    hint: 'The plates are across a bottomless pit in the sealed shaft. Things keep their speed through a postcard, so give this one some.',
    sol: [
      { snap: [3.5, 2.6, -9.5], say: 'Photograph the photo spot on the platform in the shaft.' },
      { tp: [3.5, 1.02, -4.0], yaw: 0 },
      { print: [3.5, 2.5, -7.2], yaw: 0, say: 'Print the postcard by the glass, a little off the floor.' },
      { wait: 1.0 },
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [3.5, 1.02, -5.0], yaw: 0 },
      { launch: [3.5, 2.5, -17.0], via: [3.5, 2.5, -7.2], say: 'Throw it into the postcard, aiming a little up: it shoots out of the spot, over the pit and onto the plates.' },
      { wait: 1.5 },
      { go: [-2.0, -6.0] }, { go: [-4.5, -17.0] },
      { exit: true },
    ],
    nope: [
      // printed into the card it just drops out of the spot
      [{ snap: [3.5, 2.6, -9.5] }, { tp: [3.5, 1.02, -4.0], yaw: 0 }, { print: [3.5, 2.02, -7.2], yaw: 0 }, { wait: 1.0 }, { snap: [-3.5, 4.0, -1.5] }, { print: [3.5, 1.47, -7.2] }, { wait: 2 }, { go: [-2.0, -6.0] }, { go: [-4.5, -17.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -18, 6, 0, 9], [-6, -21, -4, -19, 3]], { pits: [[1, -16, 6, -12]] });
      B.start(0, 1, 0);
      B.chute(-4, -2, 1, 10);
      // the sealed shaft: a spot on a platform, a bottomless pit, and plates on the far side
      B.glass(1, 1, -9, 6, 9, -9); B.glass(0, 1, -18, 0, 9, -9);
      B.solid(1, 1, -11, 6, 1, -10);
      B.spot(3, 2, -10);
      B.solid(1, 1, -18, 6, 1, -17);
      B.plate('p1', 2, 2, -17); B.plate('p1', 3, 2, -17); B.plate('p1', 4, 2, -17);
      B.plate('p1', 2, 2, -18); B.plate('p1', 3, 2, -18); B.plate('p1', 4, 2, -18);
      B.door(['p1'], -6, 1, -19, -4, 3, -19);
      B.exit(-5, 1, -20);
    },
  },
  {
    name: 'Slingshot', film: 1, postcard: true, diff: 8,
    hint: 'You keep your speed through a postcard, and that includes going up.',
    sol: [
      { snap: [0.5, 1.6, -8.5], say: 'Photograph the photo spot at the bottom of the glass shaft.' },
      { tp: [0.5, 1.02, 0.6], yaw: 0 },
      { print: [0.5, 2.7, -2.6], yaw: 0, say: 'Hang the postcard in the air over the jump pad, its bottom edge about head high.' },
      { js: '__shutter.keys.KeyW = true' },
      { until: '__shutter.player.position.z < -6', t: 3, say: 'Run onto the pad: it throws you up into the card, and you fly out of the spot still going up.' },
      { wait: 0.8 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // walk into a card on the floor and try to climb out of the shaft
      [{ snap: [0.5, 1.6, -8.5] }, { tp: [3.5, 1.02, -1.5], yaw: 0 }, { print: [3.5, 2.02, -4.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [0.5, -12.5], jump: true }, { exit: true, jump: true }],
      // a card up at the top of the bounce: you go in slowly and come out slowly
      [{ snap: [0.5, 1.6, -8.5] }, { tp: [0.5, 1.02, 0.6], yaw: 0 }, { print: [0.5, 7.2, -2.6], yaw: 0 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 9]]);
      B.start(0, 1, 0);
      B.glass(-5, 1, -7, 5, 9, -7);
      B.pad(0, 1, -3, { locked: true });
      B.spot(0, 1, -9);
      B.spot(3, 1, -1, 180);
      B.solid(-5, 1, -14, 5, 4, -12);
      B.exit(0, 5, -13);
    },
  },
  {
    name: 'Mirror Mail', film: 2, postcard: true, diff: 8,
    hint: 'The target hides behind a pillar, so the beam has to turn a corner inside the sealed room. Postcards work both ways, and a printed postcard can be photographed again.',
    sol: [
      { snap: [2.5, 1.6, -8.5], say: 'From the west side of the room, photograph the photo spot through the glass.' },
      { snap: [2.5, 3.0, -0.5], say: 'Photograph the blue mirror too.' },
      { sel: 0 },
      { print: [-4.5, 2.02, -2.0], yaw: 0, say: 'Print the postcard well clear of the beam and step through.' },
      { walkin: true, yaw: 0 },
      { print: [4.5, 2.0, -8.5], yaw: 45, say: 'Inside, hang the mirror in front of the spot, angled to send the light round the pillar to the target.' },
      { snap: [-2.5, 1.6, -5.5], say: 'Photograph the photo spot on the far side of the beam, through the glass.' },
      { face: 180 },
      { print: [2.8, 2.02, -6.9], yaw: 180, say: 'Print it here and walk back out.' },
      { walkin: true, yaw: 180 },
      { snap: [-4.5, 2.02, -2.0], say: 'Photograph your first postcard again to pick it up.' },
      { print: [0.5, 2.02, -3.5], yaw: -90, say: 'Hang it in the beam, picture facing the emitter: the light comes out of the spot, hits the mirror and finds the target.' },
      { go: [0.0, -13.0] },
      { exit: true },
    ],
    nope: [
      // turn the beam into the sealed room from outside
      [{ snap: [2.5, 3.0, -0.5] }, { tp: [3.5, 1.02, -1.0], yaw: 0 }, { print: [4.5, 2.0, -3.5], yaw: 45 }, { wait: 0.5 }, { tp: [-1.0, 1.02, -7.0] }, { go: [0.0, -13.0] }, { exit: true }],
      // a card turned at an angle, so the beam comes out of the spot aimed at the target
      [{ snap: [2.5, 1.6, -8.5] }, { print: [0.5, 2.02, -3.5], yaw: -45 }, { wait: 0.5 }, { tp: [-1.0, 1.02, -7.0] }, { go: [0.0, -13.0] }, { exit: true }],
      [{ snap: [2.5, 1.6, -8.5] }, { print: [0.5, 2.02, -3.5], yaw: -135 }, { wait: 0.5 }, { tp: [-1.0, 1.02, -7.0] }, { go: [0.0, -13.0] }, { exit: true }],
      [{ snap: [2.5, 1.6, -8.5] }, { print: [0.5, 2.02, -3.5], yaw: -60 }, { wait: 0.5 }, { tp: [-1.0, 1.02, -7.0] }, { go: [0.0, -13.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -13, 6, 0, 7], [-1, -17, 1, -14, 7]]);
      B.start(-5, 1, 0);
      B.emitter(-6, 1, -4, -90, { locked: true });
      // the sealed room: solid walls except a glass window on the west side, and a pillar shading the target
      B.solid(1, 1, -12, 6, 7, -12); B.solid(1, 1, -6, 6, 7, -6); B.glass(1, 1, -11, 1, 7, -7);
      B.spot(2, 1, -9, -90);
      B.solid(3, 1, -10, 3, 7, -10);
      B.receptor('r1', 4, 1, -11);
      B.mirror(2, 2, -1, 0, { fixed: true });
      B.spot(-3, 1, -6, 90);
      B.door(['r1'], -1, 1, -14, 1, 3, -14); B.solid(-1, 4, -14, 1, 7, -14);
      B.exit(0, 1, -16);
    },
  },
  {
    name: 'Return Ticket', film: 3, motion: true, postcard: true, diff: 8,
    hint: 'The amber door only goes one way, and the frosted window is on this side of it. Before you go through, think about how you will get back, and then how you will get back again.',
    sol: [
      { snap: [-3.5, 1.6, -2.5], say: 'Before you go anywhere, photograph the photo spot in this room.' },
      { go: [0.0, -5.5] }, { go: [0.0, -9.5], say: 'Go through the one-way door. It locks behind you.' },
      { go: [0.0, -14.5] }, { go: [-3.5, -14.5] },
      { wait: 1 },
      { snap: [-3.5, 4.0, -11.5], say: 'Walk round behind the chute and photograph the falling crate.' },
      { snap: [3.5, 1.6, -9.5], say: 'And the photo spot in here, for the way back.' },
      { sel: 0 },
      { tp: [0.5, 1.02, -9.5], yaw: 0 },
      { print: [0.5, 2.02, -12.5], yaw: 0, say: 'Print the first postcard and step through, back to the first room.' },
      { walkin: true, yaw: 0 },
      { sel: 0 },
      { tp: [-2.0, 1.02, -3.5], yaw: 90 },
      { launch: [-6.0, 4.5, -3.5], say: 'Throw the crate at the frosted window: the beam behind it lights the target.' },
      { wait: 1 },
      { sel: 0 },
      { face: 180 },
      { print: [-2.0, 2.02, -0.6], yaw: 180, say: 'Print the second postcard and go back through.' },
      { walkin: true, yaw: 180 },
      { go: [4.5, -15.5] },
      { exit: true },
    ],
    nope: [
      // stand in the open doorway, photograph the crate without going through, then throw it from this side
      [
        { tp: [0.5, 1.02, -7.0], yaw: 0 },
        { wait: 1 },
        { snap: [-3.5, 4.0, -11.5] },
        { go: [0.0, -3.0] },
        { tp: [-2.0, 1.02, -3.5], yaw: 90 },
        { launch: [-6.0, 4.5, -3.5] },
        { wait: 1 },
        { go: [0.0, -5.5] }, { go: [0.0, -9.5] }, { go: [4.5, -15.5] },
        { exit: true },
      ],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [-8, -4, -7, -4, 7], [3, -20, 5, -17, 7]]);
      B.start(0, 1, 0);
      B.spot(-4, 1, -3);
      // a frosted window high in the west wall, with an emitter behind it aimed at a target across the room
      B.solid(-8, 1, -4, -8, 3, -4, 'trim'); B.emitter(-8, 4, -4, -90, { locked: true }); B.solid(-8, 5, -4, -8, 7, -4);
      B.solid(-7, 1, -4, -7, 3, -4); B.fragile(-7, 4, -4, -7, 4, -4, { axis: 'x', face: 'max' }); B.solid(-7, 5, -4, -7, 7, -4);
      B.solid(6, 1, -4, 6, 3, -4, 'trim'); B.receptor('r1', 6, 4, -4);
      // the one-way door
      B.solid(-6, 1, -7, -2, 7, -7); B.door([], -1, 1, -7, 1, 3, -7, { oneway: true }); B.solid(-1, 4, -7, 1, 7, -7); B.solid(2, 1, -7, 6, 7, -7);
      // beyond it: a chute, a spot and the exit door
      B.chute(-4, -12, 1, 8);
      // walls on the chute's door side, so it can only be seen from inside this room
      B.solid(-5, 1, -11, -3, 7, -11); B.solid(-3, 1, -13, -3, 7, -12);
      B.spot(3, 1, -10);
      B.door(['r1'], 3, 1, -17, 5, 3, -17); B.solid(3, 4, -17, 5, 7, -17);
      B.exit(4, 1, -19);
    },
  },
  {
    name: 'Air Lift', film: 1, motion: true, postcard: true, diff: 9,
    hint: 'The plates and the way out are both across the pit in the sealed shaft, and the pad room only opens for the plates. Things keep their speed through a postcard, and so do you.',
    sol: [
      { snap: [3.5, 2.6, -9.5], say: 'Photograph the photo spot on the platform in the shaft.' },
      { tp: [3.5, 1.02, -4.0], yaw: 0 },
      { print: [3.5, 2.5, -7.2], yaw: 0, say: 'Print the postcard by the glass, a little off the floor.' },
      { wait: 1 },
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [3.5, 1.02, -5.0], yaw: 0 },
      { launch: [3.5, 2.5, -17.0], via: [3.5, 2.5, -7.2], say: 'Throw it through the postcard, over the pit and onto the plates. The pad room opens.' },
      { wait: 1.5 },
      { tp: [1.5, 1.02, -4.5], yaw: 0 },
      { snap: [3.5, 2.5, -7.2], say: 'Pick the postcard up again.' },
      { go: [-3.5, -7.0] }, { go: [-3.5, -9.6], say: 'Into the pad room.' },
      { print: [-3.5, 2.7, -11.6], yaw: 0, say: 'Hang the postcard over the pad, its bottom edge about head high.' },
      { tp: [-3.5, 1.02, -9.6], yaw: 0 },
      { js: '__shutter.keys.KeyW = true' },
      { until: '__shutter.player.position.x > 0.8', t: 3, say: 'Run onto the pad: you fly up through the card, out of the spot and right over the pit.' },
      { wait: 1.2 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // the best you can do without the pad: come out of the spot as if you had jumped in from a crate, at full tilt
      [{ tp: [3.5, 2.95, -10.6], yaw: 0 }, { js: '__shutter.player.velocity.set(0, 8.4, -5.4); __shutter.keys.KeyW = true' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-6, -8, 6, 0, 10], [1, -18, 6, -9, 10], [-6, -14, -2, -9, 10]], { pits: [[1, -16, 6, -12]] });
      B.start(0, 1, 0);
      B.chute(-5, -2, 1, 11);
      B.spot(4, 1, -2, 180);
      // the sealed shaft: a spot on a platform, a bottomless pit, and the plates and the way out beyond it
      B.glass(1, 1, -9, 6, 10, -9);
      B.solid(1, 1, -11, 6, 1, -10);
      B.spot(3, 2, -10);
      B.solid(1, 1, -18, 6, 1, -17);
      B.plate('p1', 2, 2, -17); B.plate('p1', 3, 2, -17); B.plate('p1', 4, 2, -17);
      B.plate('p1', 2, 2, -18); B.plate('p1', 3, 2, -18); B.plate('p1', 4, 2, -18);
      B.exit(5, 2, -18);
      // the pad room, behind a door the plates open
      B.solid(-6, 1, -9, -6, 10, -9); B.door(['p1'], -5, 1, -9, -3, 3, -9); B.solid(-5, 4, -9, -3, 10, -9); B.solid(-2, 1, -9, -2, 10, -9);
      B.pad(-4, 1, -12, { locked: true });
    },
  },
  {
    name: 'Out of the Red', film: 1, diff: 2,
    hint: 'Anything whose middle sits in red safelight won’t show up on film. The light only reaches so far down.',
    sol: [
      { go: [-0.5, -1.0], say: 'The crate sits in red light, so it won’t show up on film. The block it stands on is out in the open.' },
      { snap: [-2.5, 2.0, -3.5], say: 'Photograph the block. The crate drops out of the light.' },
      { print: [2.5, 4.02, -4.5], say: 'Print the block on one of the plates up on the ledge.' },
      { snap: 'crate', say: 'Now the crate shows up on film: photograph it.' },
      { print: [3.5, 3.47, -4.5], say: 'Print it on the other plate.' },
      { exit: true },
    ],
    nope: [
      // the camera can't take the crate in the red light
      [{ go: [-0.5, -1.0] }, { snap: [-2.5, 3.45, -3.5] }, { print: [3.5, 3.47, -4.5] }, { exit: true, n: 400 }],
      // the door wants both plates
      [{ go: [-0.5, -1.0] }, { snap: [-2.5, 2.0, -3.5] }, { print: [2.5, 4.02, -4.5] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -12, 4, 0, 7]]);
      B.start(0, 1, 0);
      // the crate stands on an orange block, its top half in a pit of red light
      B.block(-3, 1, -4, -3, 2, -4);
      B.crate(-3, 3, -4);
      B.safelight(-4, 3, -5, -2, 5, -3);
      // two plates, up on a ledge too high to climb
      B.solid(1, 1, -7, 4, 2, -5);
      B.plate('p1', 2, 3, -5); B.plate('p2', 3, 3, -5);
      B.solid(-4, 1, -10, -2, 7, -10); B.door(['p1', 'p2'], -1, 1, -10, 1, 3, -10); B.solid(-1, 4, -10, 1, 7, -10); B.solid(2, 1, -10, 4, 7, -10);
      B.exit(0, 1, -11);
    },
  },
  {
    name: 'Iris', film: 1, diff: 3,
    hint: 'The beam reaches the target through the iris door, and the door only stays open while its plate is held. A shut door stops a beam dead.',
    sol: [
      { snap: [-2.5, 1.45, -2.5], say: 'Photograph the crate on the plate. The iris shuts and the beam is cut off.' },
      { go: [0.5, -9.0], say: 'Walk across where the beam was.' },
      { print: [-2.5, 1.47, -2.5], say: 'From the far side, print the crate back on its plate: the iris opens, and the beam lights the target behind you.' },
      { exit: true },
    ],
    nope: [
      // straight through the beam
      [{ go: [0.5, -9.0] }, { exit: true, n: 400 }],
      // take the crate and keep it: the target stays dark
      [{ snap: [-2.5, 1.45, -2.5] }, { go: [0.5, -9.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -14, 4, 0, 7], [-7, -8, -5, -6, 5]]);
      B.start(1, 1, -1, 20);
      // the emitter waits in a bay behind an iris door, aimed across the hall at the target
      B.solid(-7, 1, -7, -7, 1, -7, 'trim'); B.emitter(-7, 2, -7, -90, { locked: true });
      B.door(['p1'], -5, 1, -8, -5, 3, -6); B.solid(-5, 4, -8, -5, 5, -6);
      B.plate('p1', -3, 1, -3); B.crate(-3, 1, -3);
      B.solid(4, 1, -7, 4, 1, -7, 'trim'); B.receptor('r1', 4, 2, -7);
      B.solid(-4, 1, -11, -2, 7, -11); B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 7, -11); B.solid(2, 1, -11, 4, 7, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Stand-In', film: 1, diff: 3,
    hint: 'The door wants weight on the plate and light on the target, and you have one orange mirror. A mirror can stand anywhere along a beam and still be turned to the target.',
    sol: [
      { snap: [3.5, 2.0, -1.5], say: 'Photograph the orange mirror.' },
      { print: [-1.5, 2.02, -4.5], yaw: 37.4, say: 'Stand it on the plate, right in the beam, and turn it until the preview line finds the target. Its foot holds the plate down.' },
      { go: [3.5, -9.0], say: 'Walk round the end of the beam to the door.' },
      { exit: true },
    ],
    nope: [
      // turn the beam to the target from anywhere else: the plate stays empty
      [{ snap: [3.5, 2.0, -1.5] }, { print: [3.5, 2.02, -4.5], yaw: 61.2 }, { go: [4.7, -3.0] }, { go: [4.7, -7.0] }, { go: [3.5, -9.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7]]);
      B.start(1, 1, -1, 20);
      B.solid(-5, 1, -5, -5, 1, -5, 'trim'); B.emitter(-5, 2, -5, -90, { locked: true });
      // the plate sits right on the beam's path
      B.plate('p1', -2, 1, -5);
      B.mirror(3, 1, -2, 0);
      B.solid(-5, 1, -11, -2, 7, -11);
      B.solid(-1, 1, -11, 0, 1, -11, 'trim'); B.receptor('r1', -1, 2, -11); B.receptor('r1', 0, 2, -11); B.solid(-1, 3, -11, 0, 7, -11);
      B.solid(1, 1, -11, 1, 7, -11);
      B.door(['p1', 'r1'], 2, 1, -11, 4, 3, -11); B.solid(2, 4, -11, 4, 7, -11);
      B.solid(5, 1, -11, 5, 7, -11);
      B.exit(3, 1, -13);
    },
  },
  {
    name: 'Janus', film: 1, diff: 4,
    hint: 'Two beams, two targets, one mirror. Every mirror has two faces, and both of them reflect.',
    sol: [
      { snap: [3.5, 2.0, -3.5], say: 'Photograph the orange mirror.' },
      { print: [0.5, 2.02, -6.5], yaw: -55.5, say: 'Stand it where the two beams cross, turned so its front sends one beam to the far target. Its back catches the other beam and sends it to the second target.' },
      { exit: true },
    ],
    nope: [
      // anywhere else, a mirror only turns one of the beams
      [{ snap: [3.5, 2.0, -3.5] }, { print: [3.5, 2.02, -6.5], yaw: -65.1 }, { exit: true, n: 400 }],
      [{ snap: [3.5, 2.0, -3.5] }, { print: [0.5, 2.02, -4.0], yaw: -38.7 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7], [6, -3, 6, -1, 7], [7, -4, 9, 0, 7]]);
      B.start(2, 1, -1, 20);
      // one beam runs east from the west wall, the other south from the north wall; they cross mid-room
      B.solid(-5, 1, -7, -5, 1, -7, 'trim'); B.emitter(-5, 2, -7, -90, { locked: true });
      B.solid(0, 1, -14, 0, 1, -14, 'trim'); B.emitter(0, 2, -14, 180, { locked: true });
      // a target low on the south wall, another on the east wall
      B.solid(-3, 1, 0, -2, 1, 0, 'trim'); B.receptor('r1', -3, 2, 0); B.receptor('r1', -2, 2, 0);
      B.solid(5, 1, -6, 5, 1, -5, 'trim'); B.receptor('r2', 5, 2, -6); B.receptor('r2', 5, 2, -5);
      B.mirror(3, 1, -4, 0);
      B.door(['r1', 'r2'], 6, 1, -3, 6, 3, -1); B.solid(6, 4, -3, 6, 7, -1);
      B.exit(8, 1, -2);
    },
  },
  {
    name: 'Umbra', film: 1, diff: 4,
    hint: 'The tunnel is too low to jump the beam, and only the gray crate stands tall enough to shade it. You can’t photograph a gray crate, but you can photograph what carries it.',
    sol: [
      { go: [-1.5, -3.0], say: 'The gray crate rides an orange shuttle high over the glass room, where the beam crosses a pedestal.' },
      { until: "(() => { const c = __shutter.L.objs.find((o) => o.kind === 'crate'), s = T.shuttle(); return s && s.track.dir > 0 && c.body.position.z < -6.72; })()", t: 30 },
      { snap: 'shuttle', say: 'Photograph the shuttle just before the crate is over the pedestal. The crate drops, still drifting forward, and lands in the beam.' },
      { wait: 1.5 },
      { go: [1.5, -3.5] },
      { go: [1.5, -10.5], say: 'Its shadow covers the tunnel: walk through.' },
      { exit: true },
    ],
    nope: [
      // gray crates can't be photographed, and the beam fills the low tunnel
      [{ go: [-1.5, -3.0] }, { snap: [-2.5, 6.75, -4.5] }, { go: [1.5, -3.5] }, { go: [1.5, -10.5], n: 300 }, { exit: true, n: 250 }],
      // drop it anywhere but the pedestal and the beam still crosses the tunnel
      [{ go: [-1.5, -3.0] }, { until: "(() => { const c = __shutter.L.objs.find((o) => o.kind === 'crate'), s = T.shuttle(); return s && s.track.dir > 0 && c.body.position.z < -5.6; })()", t: 30 }, { snap: 'shuttle' }, { wait: 1.5 }, { go: [1.5, -3.5] }, { go: [1.5, -10.5], n: 300 }, { exit: true, n: 250 }],
      // the shuttle itself is too thin to shade anything
      [{ go: [-1.5, -3.0] }, { snap: 'shuttle' }, { wait: 1.5 }, { go: [1.5, -3.5] }, { go: [1.5, -6.0] }, { print: [1.5, 1.17, -7.5] }, { go: [1.5, -10.5], n: 300 }, { exit: true, n: 250 }],
    ],
    build(B) {
      B.plan([[-5, -4, 5, 0, 8], [-5, -9, 0, -5, 8], [1, -9, 1, -5, 8], [1, -12, 3, -10, 4]]);
      B.start(2, 1, -1, 0);
      // a sealed glass room: the emitter's beam runs over a pedestal and out through the glass, across a low tunnel
      B.glass(-5, 1, -5, 0, 4, -5); B.glass(0, 1, -9, 0, 4, -6);
      B.solid(-5, 1, -8, -5, 1, -8, 'trim'); B.emitter(-5, 2, -8, -90, { locked: true });
      B.solid(-3, 1, -8, -3, 1, -8);
      B.solid(1, 3, -9, 1, 8, -5);
      // the gray crate rides an orange shuttle high overhead, from over the hall to over the glass room
      B.shuttle([-3, 6, -2], [-3, 6, -8.8], { orange: true, speed: 1.2, size: [1.2, 0.3, 1.2] });
      B.crate(-3, 6.3, -2, { pinned: true });
      B.exit(2, 1, -11);
    },
  },
  {
    name: 'Last Light', film: 1, diff: 5,
    hint: 'The target is in the next room. Once the amber door shuts behind you, nothing gets through it, not even light.',
    sol: [
      { snap: [-2.5, 2.0, -1.5], say: 'Photograph the orange mirror.' },
      { print: [3.5, 2.02, -4.5], yaw: -45, say: 'Stand it in the beam by the window and turn the light north, through the glass to the target. The amber door would cut it off once it shuts.' },
      { go: [-0.3, -6.0] },
      { go: [-0.3, -11.0], say: 'Go through the amber door. It locks behind you, but the light still comes in through the window.' },
      { exit: true },
    ],
    nope: [
      // send the light through the doorway: the door cuts it off as it locks
      [{ snap: [-2.5, 2.0, -1.5] }, { print: [-0.5, 2.02, -4.5], yaw: -56.4 }, { go: [-2.0, -6.0] }, { go: [-0.6, -11.0] }, { exit: true, n: 400 }],
      // no mirror at all: the beam bars the room
      [{ go: [-0.3, -6.0] }, { go: [-0.3, -11.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -7, 5, 0, 7], [-5, -8, 5, -8, 7], [-5, -15, 5, -9, 7], [-6, -13, -6, -11, 7], [-9, -14, -7, -10, 7]]);
      B.start(-1, 1, -1, 0);
      B.solid(5, 1, -5, 5, 1, -5, 'trim'); B.emitter(5, 2, -5, 90, { locked: true });
      B.mirror(-3, 1, -2, 0);
      // the dividing wall: a one-way door, and a window at beam height
      B.solid(-5, 1, -8, -2, 7, -8);
      B.door([], -1, 1, -8, 1, 3, -8, { oneway: true }); B.solid(-1, 4, -8, 1, 7, -8);
      B.solid(2, 1, -8, 2, 7, -8);
      B.solid(3, 1, -8, 4, 1, -8); B.glass(3, 2, -8, 4, 3, -8, { axis: 'z' }); B.solid(3, 4, -8, 4, 7, -8);
      B.solid(5, 1, -8, 5, 7, -8);
      // the target, across the far room from the window
      B.solid(2, 1, -15, 4, 1, -15, 'trim'); B.receptor('r1', 2, 2, -15); B.receptor('r1', 3, 2, -15); B.receptor('r1', 4, 2, -15);
      B.door(['r1'], -6, 1, -13, -6, 3, -11); B.solid(-6, 4, -13, -6, 7, -11);
      B.exit(-8, 1, -12);
    },
  },
  {
    name: 'Rewind', film: 1, diff: 5,
    hint: 'Nothing can wedge an amber door. When it shuts behind you, whatever is standing in the doorway is crushed, and reprinted where it first stood.',
    sol: [
      { snap: [3.5, 1.45, -2.5], say: 'Photograph the crate in the glass vault. Its plate goes dark.' },
      { go: [0.5, -4.0] },
      { print: [0.5, 1.47, -5.5], say: 'Print it against the ledge as a step.' },
      { go: [0.5, -8.5], jump: true, say: 'Climb up.' },
      { go: [0.5, -6.3] },
      { snap: [0.5, 1.45, -5.5], say: 'From the edge, photograph the crate below.' },
      { print: [1.4, 3.47, -10.5], say: 'Print it in the amber doorway, to one side.' },
      { go: [-0.3, -13.0], say: 'Walk through. The door locks and crushes the crate, and it is reprinted on its plate in the vault.' },
      { exit: true },
    ],
    nope: [
      // leave the crate as a step
      [{ snap: [3.5, 1.45, -2.5] }, { go: [0.5, -4.0] }, { print: [0.5, 1.47, -5.5] }, { go: [0.5, -8.5], jump: true }, { go: [-0.3, -13.0] }, { exit: true, n: 400 }],
      // carry it through: the plate in the vault stays empty
      [{ snap: [3.5, 1.45, -2.5] }, { go: [0.5, -4.0] }, { print: [0.5, 1.47, -5.5] }, { go: [0.5, -8.5], jump: true }, { go: [0.5, -6.3] }, { snap: [0.5, 1.45, -5.5] }, { go: [-0.3, -13.0] }, { print: [0.5, 3.47, -16.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -10, 4, 0, 9], [-2, -11, 2, -11, 9], [-2, -21, 2, -12, 9]]);
      B.start(-2, 1, -1, -20);
      // the vault: the crate on its plate, sealed behind glass in the corner
      B.glass(2, 1, -5, 2, 9, -1, { axis: 'x' }); B.glass(3, 1, -5, 4, 9, -5, { axis: 'z' }); B.glass(3, 1, -1, 4, 9, -1, { axis: 'z' });
      B.plate('p1', 3, 1, -3); B.crate(3, 1, -3);
      // a ledge two metres high, with a wide one-way door at the back of it
      B.solid(-4, 1, -10, 4, 2, -7);
      B.solid(-2, 1, -11, 2, 2, -11); B.door([], -2, 3, -11, 2, 6, -11, { oneway: true }); B.solid(-2, 7, -11, 2, 9, -11);
      // beyond: a raised corridor and the door the vault plate opens
      B.solid(-2, 1, -21, 2, 2, -12);
      B.solid(-2, 3, -18, -2, 9, -18); B.solid(2, 3, -18, 2, 9, -18); B.door(['p1'], -1, 3, -18, 1, 5, -18); B.solid(-1, 6, -18, 1, 9, -18);
      B.exit(0, 3, -20);
    },
  },
  {
    name: 'Doppelganger', film: 1, copy: true, diff: 4,
    hint: 'Double-X never takes anything away: the blue emitter keeps firing whatever you do. But a beam stops at the first thing in its path, and a copy of the emitter is a thing too.',
    sol: [
      { snap: [-4.5, 2.5, -6.5], say: 'Copy the blue emitter. The original stays, beam and all.' },
      { print: [-3.38, 2.5, -6.5], yaw: 0, say: 'Hang the copy right against the original’s lens, facing the target. It smothers the old beam and fires a new one.' },
      { exit: true },
    ],
    nope: [
      // a copy aimed at the target from anywhere else leaves the old beam across the room
      [{ snap: [-4.5, 2.5, -6.5] }, { print: [-3.5, 2.5, -8.5], yaw: 0 }, { exit: true, n: 400 }],
      // lens to lens, the two smother each other and the target stays dark
      [{ snap: [-4.5, 2.5, -6.5] }, { print: [-3.45, 2.5, -6.5], yaw: 90 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -13, 5, 0, 7]]);
      B.start(2, 1, -1, 30);
      // a blue emitter hanging against the west wall, its beam across the room
      B.emitter(-5, 2, -7, -90, { fixed: true });
      B.solid(-5, 1, -11, -5, 7, -11);
      B.solid(-4, 1, -11, -4, 1, -11, 'trim'); B.receptor('r1', -4, 2, -11); B.solid(-4, 3, -11, -4, 7, -11);
      B.solid(-3, 1, -11, 0, 7, -11);
      B.door(['r1'], 1, 1, -11, 3, 3, -11); B.solid(1, 4, -11, 3, 7, -11);
      B.solid(4, 1, -11, 5, 7, -11);
      B.exit(2, 1, -12);
    },
  },
  {
    name: 'Twin Lens', film: 1, diff: 6,
    hint: 'Teal-striped glass grows back almost at once, unless the whole window breaks together. The plate is in the sealed room under the floor.',
    sol: [
      { snap: [3.0, 5.15, -11.5], say: 'Photograph the long plank.' },
      { go: [-0.5, -2.5] },
      { print: [-0.5, 6.2, -5.0], yaw: 0, say: 'Print it lengthways above the skylight, over both panes at once. It smashes them together, so neither grows back.' },
      { wait: 1.0 },
      { snap: [-3.5, 5.45, -11.5], say: 'Photograph the crate.' },
      { go: [-0.5, -3.4] },
      { print: [-0.5, 1.47, -8.5], say: 'Look down through the open skylight and print the crate on the plate below.' },
      { go: [3.5, -3.0] }, { go: [3.5, -10.0] },
      { exit: true },
    ],
    nope: [
      // one crate breaks one pane, falls straight through and misses the plate; the pane grows back
      [{ snap: [-3.5, 5.45, -11.5] }, { go: [-0.5, -2.5] }, { print: [0.5, 6.2, -5.0] }, { wait: 1.0 }, { go: [3.5, -3.0] }, { go: [3.5, -10.0] }, { exit: true, n: 400 }],
      // the plank across one pane only, then the crate through the other
      [{ snap: [3.0, 5.15, -11.5] }, { go: [-0.5, -2.5] }, { print: [0.5, 6.2, -5.0], yaw: 90 }, { wait: 1.0 }, { snap: [-3.5, 5.45, -11.5] }, { print: [-2.0, 6.2, -5.0] }, { wait: 1.0 }, { go: [3.5, -3.0] }, { go: [3.5, -10.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 11], [-1, -15, 1, -15, 11], [-2, -19, 2, -16, 11]]);
      // the deck you start on, over a sealed room: a skylight of two healing panes, and a small clear window
      B.box([-5, 4.7, -4], [6, 5, 1]); B.box([-5, 4.7, -6], [-3, 5, -4]); B.box([2, 4.7, -6], [6, 5, -4]);
      B.box([-5, 4.7, -8], [6, 5, -6]); B.box([-5, 4.7, -9], [-1, 5, -8]); B.box([0, 4.7, -9], [6, 5, -8]); B.box([-5, 4.7, -14], [6, 5, -9]);
      B.fragile(-3, 4, -6, -2, 4, -5, { axis: 'y', face: 'max', group: 'w', heal: 0.6 });
      B.fragile(-1, 4, -6, 1, 4, -5, { axis: 'y', face: 'max', group: 'w', heal: 0.6 });
      B.glass(-1, 4, -9, -1, 4, -9, { axis: 'y', face: 'max' });
      B.plate('p1', -1, 1, -9);
      B.start(2, 5, -1, 0);
      B.plank(1, -12, 4, -12, { top: 5.3 });
      B.crate(-4, 5, -12);
      // the way out, at deck level
      B.solid(-1, 1, -15, 1, 4, -15); B.door(['p1'], -1, 5, -15, 1, 7, -15); B.solid(-1, 8, -15, 1, 11, -15);
      B.solid(-2, 1, -19, 2, 4, -16);
      B.exit(0, 5, -18);
    },
  },
  {
    name: 'Freeze Frame', film: 1, diff: 6,
    hint: 'A light leak sends every photo you carry back to where you took it. The plate is sealed in with the shuttle, and the shuttle never quite touches it.',
    sol: [
      { go: [-0.5, -5.5] },
      { until: 'Math.abs(T.shuttle().body.position.z + 5.5) < 0.12', t: 10 },
      { snap: 'shuttle', say: 'Photograph the orange shuttle just as it passes over the plate.' },
      { go: [-0.5, -10.5], say: 'Walk into the light leak. Your film fogs and the shuttle goes back where you took it: right over the plate, where it drops.' },
      { wait: 0.5 },
      { exit: true },
    ],
    nope: [
      // taken anywhere else, it comes back off the plate
      [{ go: [-0.5, -5.5] }, { until: 'T.shuttle().body.position.z < -8.3', t: 10 }, { snap: 'shuttle' }, { go: [-0.5, -10.5] }, { wait: 0.5 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7]]);
      B.start(-2, 1, -1, -30);
      // the gallery: a sealed glass case along the east wall, an orange shuttle sliding just over the plate inside
      B.glass(1, 1, -10, 1, 7, -2, { axis: 'x' }); B.glass(2, 1, -10, 5, 7, -10, { axis: 'z' }); B.glass(2, 1, -2, 5, 7, -2, { axis: 'z' });
      B.plate('p1', 3, 1, -6);
      B.shuttle([3, 1.6, -9], [3, 1.6, -3], { speed: 1.6, size: [1.2, 0.4, 1.2], orange: true });
      // a light leak right across the way to the door
      B.leak(-5, 1, -11, 5, 7, -11);
      B.solid(-5, 1, -12, -3, 7, -12); B.door(['p1'], -2, 1, -12, 0, 3, -12); B.solid(-2, 4, -12, 0, 7, -12); B.solid(1, 1, -12, 5, 7, -12);
      B.exit(-1, 1, -13);
    },
  },
  {
    name: 'Dark Slide', film: 1, diff: 7,
    hint: 'The iris only lets the beam through while its plate is held, and the crate on the plate is sealed in. A door can’t close on anything in its way, and the crate is the only thing tall enough to climb on, or to cap a lens.',
    sol: [
      { snap: [2.0, 1.15, -2.5], say: 'Photograph the plank.' },
      { go: [0.5, -4.0] },
      { print: [-3.9, 1.17, -7.5], yaw: 0, say: 'Lay it through the open iris, low enough for the beam to pass over: now the door can’t close.' },
      { snap: [-3.5, 1.45, -1.5], say: 'Photograph the crate in the vault. The plate goes dark, but the iris stays open.' },
      { print: [-5.5, 2.47, -7.5], say: 'Print the crate on the pedestal in the bay, right against the emitter’s lens.' },
      { go: [0.5, -10.0], say: 'Cross the dark hall.' },
      { snap: [-5.5, 2.47, -7.5], say: 'Take the crate back through the iris: the beam lights the target and the door on the ledge opens.' },
      { go: [0.5, -8.8] },
      { print: [0.5, 1.47, -10.5], say: 'Print the crate against the ledge as a step.' },
      { go: [0.5, -13.0], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    nope: [
      // take the crate without wedging the iris: it shuts, and the target goes dark
      [{ snap: [-3.5, 1.45, -1.5] }, { go: [0.5, -8.8] }, { print: [0.5, 1.47, -10.5] }, { go: [0.5, -13.0], jump: true }, { exit: true, n: 400 }],
      // wedge it, take the crate, and walk straight into the beam
      [{ snap: [2.0, 1.15, -2.5] }, { go: [0.5, -4.0] }, { print: [-3.9, 1.17, -7.5], yaw: 0 }, { snap: [-3.5, 1.45, -1.5] }, { go: [0.5, -8.8] }, { print: [0.5, 1.47, -10.5] }, { go: [0.5, -13.0], jump: true }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -16, 4, 0, 8], [-7, -9, -5, -7, 5]]);
      B.start(2, 1, -1, 30);
      // the emitter in its bay, behind an iris door, with a low pedestal in front of its lens
      B.solid(-7, 1, -8, -7, 1, -8, 'trim'); B.emitter(-7, 2, -8, -90, { locked: true });
      B.solid(-6, 1, -8, -6, 1, -8, 'trim');
      B.door(['p1'], -5, 1, -9, -5, 3, -7); B.solid(-5, 4, -9, -5, 5, -7);
      B.solid(4, 1, -8, 4, 1, -8, 'trim'); B.receptor('r1', 4, 2, -8);
      // the crate on the plate, sealed in a glass vault
      B.glass(-2, 1, -4, -2, 8, -1, { axis: 'x' }); B.glass(-4, 1, -4, -3, 8, -4, { axis: 'z' });
      B.plate('p1', -4, 1, -2); B.crate(-4, 1, -2);
      B.plank(1, -3, 2, -3, { top: 1.3 });
      // the ledge, and the door the target opens
      B.solid(-4, 1, -16, 4, 2, -12);
      B.solid(-4, 3, -14, -2, 8, -14); B.door(['r1'], -1, 3, -14, 1, 5, -14); B.solid(-1, 6, -14, 1, 8, -14); B.solid(2, 3, -14, 4, 8, -14);
      B.exit(0, 3, -15);
    },
  },
  {
    name: 'Self-Timer', film: 1, diff: 8,
    hint: 'The iris lets the beam out only while the crate holds its plate, and the beam bars the way to the amber door. Red light keeps whatever is printed in it where it is. When an amber door shuts, whatever stands in the doorway is reprinted where it began.',
    sol: [
      { snap: [3.5, 2.0, -1.5], say: 'Photograph the orange mirror.' },
      { go: [2.5, -3.5] },
      { print: [-2.5, 2.02, -4.5], yaw: -45, say: 'Stand it in the beam and turn the light north, through the window to the target. In the red light it is there for good.' },
      { snap: [-3.5, 1.45, -1.5], say: 'Now photograph the crate in the vault. The iris shuts and the beam goes out.' },
      { go: [2.5, -8.0], say: 'Cross while the hall is dark.' },
      { print: [3.3, 1.47, -10.5], say: 'Print the crate in the amber doorway, to one side.' },
      { go: [1.75, -13.0], say: 'Walk through. The door shuts and crushes the crate; it is reprinted on its plate, the iris opens, and the light finds the target behind you.' },
      { exit: true },
    ],
    nope: [
      // carry the crate through: the iris stays shut
      [{ snap: [3.5, 2.0, -1.5] }, { go: [2.5, -3.5] }, { print: [-2.5, 2.02, -4.5], yaw: -45 }, { snap: [-3.5, 1.45, -1.5] }, { go: [2.5, -8.0] }, { go: [1.75, -13.0] }, { exit: true, n: 400 }],
      // use the mirror as a shield to cross: in the red light it can never be moved again
      [{ snap: [3.5, 2.0, -1.5] }, { print: [4.5, 2.02, -4.5], yaw: 90 }, { go: [2.5, -8.0] }, { snap: [4.5, 2.0, -4.5] }, { print: [-2.5, 2.02, -4.5], yaw: -45 }, { snap: [-3.5, 1.45, -1.5] }, { print: [3.3, 1.47, -10.5] }, { go: [1.75, -13.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -10, 5, 0, 7], [-5, -11, 5, -11, 7], [-5, -18, 5, -12, 7], [6, -6, 8, -4, 5], [6, -16, 6, -14, 7], [7, -17, 9, -13, 7]]);
      B.start(1, 1, -1, 0);
      // the crate on its plate, sealed in a glass vault
      B.glass(-2, 1, -4, -2, 7, -1, { axis: 'x' }); B.glass(-4, 1, -4, -3, 7, -4, { axis: 'z' });
      B.plate('p1', -4, 1, -2); B.crate(-4, 1, -2);
      // the emitter in its bay, behind an iris the plate holds open; red light along the whole beam
      B.solid(8, 1, -5, 8, 1, -5, 'trim'); B.emitter(8, 2, -5, 90, { locked: true });
      B.door(['p1'], 6, 1, -6, 6, 3, -4); B.solid(6, 4, -6, 6, 5, -4);
      B.safelight(-5, 1, -5, 8, 7, -5);
      B.mirror(3, 1, -2, 0);
      // the dividing wall: a window at beam height, and a wide one-way door
      B.solid(-5, 1, -11, -5, 7, -11);
      B.solid(-4, 1, -11, -2, 1, -11); B.glass(-4, 2, -11, -2, 3, -11, { axis: 'z' }); B.solid(-4, 4, -11, -2, 7, -11);
      B.solid(-1, 1, -11, -1, 7, -11);
      B.door([], 0, 1, -11, 4, 4, -11, { oneway: true }); B.solid(0, 5, -11, 4, 7, -11);
      B.solid(5, 1, -11, 5, 7, -11);
      // beyond: the target, and the door it opens
      B.solid(-4, 1, -18, -2, 1, -18, 'trim'); B.receptor('r1', -4, 2, -18); B.receptor('r1', -3, 2, -18); B.receptor('r1', -2, 2, -18);
      B.door(['r1'], 6, 1, -16, 6, 3, -14); B.solid(6, 4, -16, 6, 7, -14);
      B.exit(8, 1, -15);
    },
  },
  {
    name: 'Moving Picture', film: 1, copy: true, diff: 6,
    hint: 'Copies on your film vanish in a light leak, and from here you can’t see where the way on is. On Double-X you can copy anything you can see, even what you are standing on.',
    sol: [
      { go: [0.5, -0.6] },
      { until: '(() => { const t = T.shuttle().track; return t.dir < 0 && t.s < 0.35; })()', t: 10 },
      { js: "(() => { const S = __shutter, sh = T.shuttle(); S.setView(0, 0); for (let i = 0; i < 90; i++) { S.keys.KeyW = true; S.step(1); if (S.P.carry && S.player.position.z < sh.body.position.z + 0.2) break; } S.keys.KeyW = false; S.step(3); return T.pos() + ' carry ' + !!S.P.carry; })()", say: 'Step onto the shuttle as it comes in.' },
      { until: 'T.shuttle().body.position.z < -8.6', t: 8, say: 'Ride it through the light leak with nothing on your film.' },
      { snap: 'shuttle', say: 'Past the leak, copy the shuttle you are standing on.' },
      { print: [2.5, 0.85, -11.5], say: 'Hang the copy beside the end of its track, where you can now see round the corner.' },
      { until: 'T.shuttle().body.position.z < -11.3', t: 6 },
      { go: [2.5, -11.5], say: 'Step across onto the copy.' },
      { snap: [2.5, 0.85, -11.5], say: 'Copy the platform under your feet, and lay the copy ahead.' },
      { print: [4.5, 0.85, -12.5] },
      { go: [4.5, -12.5] },
      { snap: [4.5, 0.85, -12.5], say: 'And again.' },
      { print: [6.5, 0.85, -12.5] },
      { go: [6.5, -12.5] },
      { exit: true, jump: true },
    ],
    nope: [
      // copy it before the ride: the copy is lost in the leak
      [{ snap: 'shuttle' }, { go: [0.5, -0.6] }, { until: '(() => { const t = T.shuttle().track; return t.dir < 0 && t.s < 0.35; })()', t: 10 }, { js: "(() => { const S = __shutter, sh = T.shuttle(); S.setView(0, 0); for (let i = 0; i < 90; i++) { S.keys.KeyW = true; S.step(1); if (S.P.carry && S.player.position.z < sh.body.position.z + 0.2) break; } S.keys.KeyW = false; S.step(3); return T.pos() + ' carry ' + !!S.P.carry; })()" }, { until: 'T.shuttle().body.position.z < -11.3', t: 8 }, { print: [2.5, 0.85, -11.5] }, { go: [2.5, -11.5] }, { go: [6.5, -12.5] }, { exit: true, jump: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-3, -14, 3, 0, 8], [4, -14, 10, -12, 8]], { pits: [[-3, -14, 3, -2], [4, -14, 7, -12]] });
      B.start(0, 1, 0, 0);
      // a blue shuttle runs out over the void, through a light leak, to the corner of the room
      B.shuttle([0, 0.7, -2.5], [0, 0.7, -12], { speed: 2.5, size: [2, 0.3, 2] });
      B.leak(-3, 1, -7, 3, 8, -7);
      B.exit(9, 1, -13);
    },
  },
  {
    name: 'Negative', film: 1, copy: true, diff: 6,
    hint: 'Nothing in red light shows up on film, copies included, and you can only carry one frame past the amber door. Keep one copy where you can copy it again.',
    sol: [
      { snap: [-1.5, 1.45, -3.5], say: 'Copy the crate in the case.' },
      { go: [3.5, -2.0] }, { go: [6.0, -2.0], say: 'Go through the amber door. It locks behind you.' },
      { go: [6.0, -14.5] },
      { print: [3.5, 2.47, -16.5], say: 'In the darkroom, print the copy on the one pedestal out of the red light. That is your negative.' },
      { snap: [3.5, 2.47, -16.5], say: 'Copy it, and print the copies on the plates in the red light.' },
      { print: [-4.5, 1.47, -15.5] },
      { snap: [3.5, 2.47, -16.5] }, { print: [-4.5, 1.47, -20.5] },
      { snap: [3.5, 2.47, -16.5] }, { print: [0.5, 1.47, -18.5] },
      { exit: true },
    ],
    nope: [
      // print the only copy straight onto a plate in the red light: it can never be copied again
      [{ snap: [-1.5, 1.45, -3.5] }, { go: [3.5, -2.0] }, { go: [6.0, -2.0] }, { go: [6.0, -14.5] }, { print: [-4.5, 1.47, -15.5] }, { snap: [-4.5, 1.45, -15.5] }, { print: [-4.5, 1.47, -20.5] }, { snap: [-4.5, 1.45, -15.5] }, { print: [0.5, 1.47, -18.5] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-3, -6, 3, 0, 7], [4, -3, 4, -1, 7], [5, -14, 7, -1, 7], [-6, -22, 7, -15, 8], [-7, -20, -7, -18, 7], [-10, -21, -8, -17, 7]]);
      B.start(0, 1, -1, 0);
      B.glassCase(-2, 1, -4, -2, 1, -4); B.crate(-2, 1, -4);
      B.door([], 4, 1, -3, 4, 3, -1, { oneway: true }); B.solid(4, 4, -3, 4, 7, -1);
      // the darkroom: red light everywhere but over one pedestal near the way in
      B.solid(3, 1, -17, 3, 1, -17, 'trim');
      B.safelight(5, 1, -14, 7, 7, -1);
      B.safelight(-6, 1, -22, 2, 8, -15);
      B.safelight(3, 1, -22, 7, 8, -18); B.safelight(3, 1, -16, 7, 8, -15); B.safelight(4, 1, -17, 7, 8, -17);
      B.plate('p1', -5, 1, -16); B.plate('p2', -5, 1, -21); B.plate('p3', 0, 1, -19);
      B.door(['p1', 'p2', 'p3'], -7, 1, -20, -7, 3, -18); B.solid(-7, 4, -20, -7, 7, -18);
      B.exit(-9, 1, -19);
    },
  },
  {
    name: 'Stop Bath', film: 1, copy: true, diff: 7,
    hint: 'On Double-X nothing you print can be taken back, but the void takes copies for good. The glass lid in front of the lens gives way under anything that lands on it hard.',
    sol: [
      { snap: [2.5, 2.0, -2.5], say: 'Copy the tall orange block.' },
      { print: [-3.4, 0, -6.5], rest: 1.0, say: 'Stand the copy on the glass lid right in front of the lens: it caps the beam.' },
      { go: [0.5, -9.0], say: 'Cross the room.' },
      { snap: [2.5, 2.0, -2.5], say: 'Copy the block again.' },
      { print: [-3.3, 3.52, -8.5], say: 'Drop it from high up onto the far end of the lid. The glass gives way and both copies fall into the void, gone for good, and the beam finds the target.' },
      { wait: 1.0 },
      { exit: true },
    ],
    nope: [
      // cap the beam anywhere else and it can never be uncapped
      [{ snap: [2.5, 2.0, -2.5] }, { print: [1.5, 0, -6.5], rest: 1.0 }, { go: [3.0, -9.0] }, { snap: [2.5, 2.0, -2.5] }, { print: [1.5, 3.6, -6.5] }, { wait: 1.0 }, { exit: true, n: 400 }],
      // break the lid first: then nothing stands in front of the lens
      [{ snap: [2.5, 2.0, -2.5] }, { print: [-3.5, 3.52, -8.5] }, { wait: 1.0 }, { snap: [2.5, 2.0, -2.5] }, { print: [-3.5, 0, -6.5], rest: 1.0 }, { wait: 1.0 }, { go: [0.5, -9.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7]], { pits: [[-4, -9, -3, -7]] });
      B.start(2, 1, -1, 30);
      B.solid(-5, 1, -7, -5, 1, -7, 'trim'); B.emitter(-5, 2, -7, -90, { locked: true });
      // a little slot into the void running back from the lens, under a clear glass lid
      B.fragile(-4, 0, -9, -3, 0, -7, { axis: 'y', face: 'max', frosted: false });
      B.solid(5, 1, -7, 5, 1, -7, 'trim'); B.receptor('r1', 5, 2, -7);
      B.block(2, 1, -3, 2, 2, -3);
      B.solid(-5, 1, -11, -2, 7, -11); B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 7, -11); B.solid(2, 1, -11, 5, 7, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Vertigo', film: 1, diff: 9,
    hint: 'Two blue pads and a very tall shaft. A pad throws you about five metres up, and the band of light leak halfway up fogs any photo you carry through it.',
    sol: [
      { snap: [2.5, 1.125, 0.5], say: 'Photograph the blue pad in the case.' },
      { face: -90 },
      { js: '__shutter.keys.KeyW = true', say: 'Run east over the pad on the floor, drifting across the shaft as you go up.' },
      { until: '__shutter.player.position.y > 2.5', t: 2 },
      { until: '__shutter.player.position.x > 0.6', t: 2 },
      { js: '__shutter.keys.KeyW = false' },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25, say: 'At the top of the bounce, print the pad under your feet.' },
      { until: '__shutter.player.position.y > 10.2 && __shutter.player.velocity.y > 0', t: 3, say: 'Bounce off it, straight up through the light leak, carrying nothing.' },
      { snap: [-0.5, 1.125, -1.5], say: 'Only once you are above the leak, photograph a pad again: the one down on the floor will do.' },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25, say: 'Print it under you at the top.' },
      { until: '__shutter.player.position.y > 17.2', t: 3, say: 'One more bounce, and drift onto the ledge.' },
      { go: [1.7, -3.0] },
      { exit: true },
    ],
    nope: [
      // take the floor pad too soon: the leak fogs it on the way up
      [{ snap: [2.5, 1.125, 0.5] }, { face: -90 }, { js: '__shutter.keys.KeyW = true' }, { until: '__shutter.player.position.y > 2.5', t: 2 }, { until: '__shutter.player.position.x > 0.6', t: 2 }, { js: '__shutter.keys.KeyW = false' }, { until: '__shutter.player.velocity.y < 0.3', t: 3 }, { below: 0.25 },
        { until: '__shutter.player.position.y > 7.0 && __shutter.player.velocity.y > 0', t: 3 }, { snap: [-0.5, 1.125, -1.5] }, { until: '__shutter.player.velocity.y < 0.3', t: 3 }, { below: 0.25 }, { until: '__shutter.player.position.y > 17.2', t: 3 }, { go: [1.7, -3.0] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-2, -4, 2, 0, 21]]);
      B.start(-2, 1, -2, -90);
      B.pad(-1, 1, -2, { fixed: true });
      B.glassCase(2, 1, 0, 2, 1, 0); B.pad(2, 1, 0, { fixed: true });
      // a band of light leak right across the shaft, halfway up
      B.leak(-2, 9, -2, 2, 9, 0);
      B.box([-2, 1, -4], [3, 17, -2]);
      B.exit(0, 17, -3);
    },
  },
  {
    name: 'Facsimile', film: 1, copy: true, postcard: true, diff: 8,
    hint: 'The target is sealed in the vault, and you can only see its photo spot from this first room. A beam that goes into a postcard comes out of the spot, so the card in the beam has to stay put. On Double-X a printed postcard can be copied like anything else.',
    sol: [
      { snap: [-7.5, 1.6, -2.5], say: 'Photograph the photo spot in the vault, through the window.' },
      { go: [3.5, -2.0] }, { go: [7.0, -2.0], say: 'Go through the amber door. It locks behind you, and the vault is out of sight.' },
      { go: [7.0, -14.6] }, { go: [1.0, -14.6] },
      { print: [2.5, 1.6, -19.5], yaw: -90, say: 'Hang the postcard over the pit, in the beam, its picture facing the emitter. The light comes out of the spot and finds the target.' },
      { snap: [2.5, 1.6, -19.5], say: 'Now copy the postcard you just hung.' },
      { print: [0.5, 2.02, -16.0], yaw: 0, say: 'Print the copy on the shore: a second door to the same place.' },
      { go: [0.3, -14.6] },
      { walkin: true, yaw: 0, say: 'Walk in.' },
      { exit: true },
    ],
    nope: [
      // use the only card yourself: the target stays dark
      [{ snap: [-7.5, 1.6, -2.5] }, { go: [3.5, -2.0] }, { go: [7.0, -2.0] }, { go: [7.0, -14.6] }, { go: [1.0, -14.6] }, { print: [0.5, 2.02, -16.0], yaw: 0 }, { go: [0.3, -14.6] }, { walkin: true, yaw: 0 }, { exit: true, n: 400 }],
      // light the target, but leave yourself no door
      [{ snap: [-7.5, 1.6, -2.5] }, { go: [3.5, -2.0] }, { go: [7.0, -2.0] }, { go: [7.0, -14.6] }, { go: [1.0, -14.6] }, { print: [2.5, 1.6, -19.5], yaw: -90 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -5, 4, 0, 7], [-5, -4, -5, -2, 7], [-10, -6, -6, 0, 7], [-9, -7, -7, -7, 7], [-10, -10, -6, -8, 7],
        [5, -3, 5, -1, 7], [6, -14, 8, -1, 7], [-4, -22, 8, -15, 9]], { pits: [[-4, -22, 8, -18]] });
      B.start(-2, 1, -1, 55);
      // the sealed vault, seen only through this window: a photo spot aimed at the target, and the way out
      B.solid(-5, 1, -4, -5, 1, -2); B.glass(-5, 2, -4, -5, 3, -2, { axis: 'x' }); B.solid(-5, 4, -4, -5, 7, -2);
      B.spot(-8, 1, -3, 90);
      B.solid(-10, 1, -3, -10, 1, -3, 'trim'); B.receptor('r1', -10, 2, -3); B.receptor('r1', -10, 3, -3);
      B.door(['r1'], -9, 1, -7, -7, 3, -7); B.solid(-9, 4, -7, -7, 7, -7);
      B.exit(-8, 1, -9);
      // the amber door, and a corridor round to the pit
      B.door([], 5, 1, -3, 5, 3, -1, { oneway: true }); B.solid(5, 4, -3, 5, 7, -1);
      // a beam runs the length of the pit, out of reach
      B.solid(-4, -4, -20, -4, 1, -20, 'trim'); B.emitter(-4, 2, -20, -90, { locked: true });
    },
  },
  {
    name: 'Print Run', film: 1, copy: true, diff: 8,
    hint: 'The beam has to turn three corners to reach the target, and every corner is lit red, so a copy hung there can never be copied again. Once you are through the amber door the mirror you came with is out of sight. Make one copy you never use.',
    sol: [
      { js: "window.__printOnBeam = (x, y, z, yaw) => { const S = __shutter; let best = null; for (const [a, b] of S.L.beamSegs) { const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz; if (l2 < 1e-6) continue; const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)); const px = a.x + t * dx, pz = a.z + t * dz, d = Math.hypot(px - x, pz - z); if (!best || d < best.d) best = { d, x: px, z: pz }; } const X = best && best.d < 1.5 ? best.x : x, Z = best && best.d < 1.5 ? best.z : z; if (!S.L.photos[S.L.sel]) return 'no photo'; const r = window.__REAL ? T.realPrint(X, y, Z, yaw) : S.printAt(X, y, Z, yaw); S.step(30); return r + ' at ' + X.toFixed(2) + ',' + Z.toFixed(2); }; 'ok'" },
      { snap: [-4.5, 3.0, 4.5], say: 'Copy the blue mirror by the door.' },
      { go: [-6.0, 0.5] }, { go: [-6.0, -2.5], say: 'Go through the amber door. The mirror behind you is out of sight for good.' },
      { print: [0.5, 7.0, -7.0], yaw: 0, say: 'Hang your only copy high above the middle of the hall, out of the red light, where you can see it from anywhere. That is your master.' },
      { snap: [0.5, 7.0, -7.0], say: 'Copy the master.' },
      { go: [-6.2, -10.0] },
      { print: [-4.5, 2.5, -14.0], yaw: 45, say: 'Hang the copy in the beam at the far corner, turning it along the north hall.' },
      { go: [-6.2, -16.3] }, { go: [9.3, -16.3], say: 'Go round the corner, keeping well clear of the beam.' },
      { snap: [0.5, 7.0, -7.0], say: 'Copy the master again.' },
      { js: '__printOnBeam(6.5, 2.5, -14.0, -45)', say: 'Hang it where the beam crosses the east hall, turning the light south.' },
      { go: [9.3, -1.6] },
      { snap: [0.5, 7.0, -7.0], say: 'And once more.' },
      { js: '__printOnBeam(6.5, 2.5, -0.5, 45)', say: 'Hang the last copy where the beam reaches the end of the hall, turning it into the target.' },
      { exit: true },
    ],
    nope: [
      // spend the only copy on the first corner: in the red light it can never be copied again
      [{ js: "window.__printOnBeam = (x, y, z, yaw) => { const S = __shutter; let best = null; for (const [a, b] of S.L.beamSegs) { const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz; if (l2 < 1e-6) continue; const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)); const px = a.x + t * dx, pz = a.z + t * dz, d = Math.hypot(px - x, pz - z); if (!best || d < best.d) best = { d, x: px, z: pz }; } const X = best && best.d < 1.5 ? best.x : x, Z = best && best.d < 1.5 ? best.z : z; if (!S.L.photos[S.L.sel]) return 'no photo'; const r = window.__REAL ? T.realPrint(X, y, Z, yaw) : S.printAt(X, y, Z, yaw); S.step(30); return r + ' at ' + X.toFixed(2) + ',' + Z.toFixed(2); }; 'ok'" }, { snap: [-4.5, 3.0, 4.5] }, { go: [-6.0, 0.5] }, { go: [-6.0, -10.0] }, { print: [-4.5, 2.5, -14.0], yaw: 45 }, { go: [-6.2, -16.3] }, { go: [9.3, -16.3] },
        { snap: [-4.5, 2.5, -14.0] }, { js: '__printOnBeam(6.5, 2.5, -14.0, -45)' }, { go: [9.3, -1.6] }, { snap: [6.5, 2.5, -14.0] }, { js: '__printOnBeam(6.5, 2.5, -0.5, 45)' }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-7, -17, 9, 0, 10], [-7, 1, -5, 1, 6], [-7, 2, -5, 4, 6], [7, 1, 9, 1, 6], [7, 2, 9, 4, 6]]);
      B.start(-6, 1, 3, 180); // facing the mirror you have to copy before the amber door
      B.mirror(-5, 2, 4, 0, { fixed: true });
      B.door([], -7, 1, 1, -5, 3, 1, { oneway: true }); B.solid(-7, 4, 1, -5, 6, 1);
      // the hall runs round a block two metres high; the emitter fires up the west side
      B.solid(-4, 1, -13, 4, 2, -2); B.solid(-4, 1, -1, 3, 2, 0);
      B.solid(-5, 1, -1, -5, 1, -1, 'trim'); B.emitter(-5, 2, -1, 0, { locked: true });
      // the target faces the east hall from the block's far corner
      B.solid(4, 1, -1, 4, 1, 0, 'trim'); B.receptor('r1', 4, 2, -1); B.receptor('r1', 4, 2, 0);
      // the three corners are lit red
      B.safelight(-7, 1, -17, -5, 5, -14); B.safelight(5, 1, -17, 9, 5, -14); B.safelight(5, 1, -2, 9, 5, 0);
      B.door(['r1'], 7, 1, 1, 9, 3, 1); B.solid(7, 4, 1, 9, 6, 1);
      B.exit(8, 1, 3);
    },
  },
  {
    name: 'Limited Edition', film: 2, copy: true, diff: 8,
    hint: 'Two frames, three originals, and the amber door only goes one way. Past it you will need a bounce, two beams turned and three plates held down. Anything you print has weight.',
    sol: [
      { snap: [-3.5, 1.125, -4.5], say: 'Copy the blue pad.' },
      { snap: [-3.5, 2.0, -1.5], say: 'And the orange mirror. Leave the crate: a pad or a mirror weighs as much as you need.' },
      { go: [3.0, -2.0] }, { go: [6.0, -2.0], say: 'Through the amber door.' },
      { go: [6.0, -14.6] },
      { sel: 1 },
      { print: [2.5, 2.02, -17.5], yaw: 45, say: 'Stand the mirror on the plate in the first beam, turning it north into its target.' },
      { snap: [2.5, 2.0, -17.5], say: 'Copy it.' },
      { go: [5.0, -19.5] },
      { sel: 1 },
      { print: [8.5, 2.02, -21.5], yaw: -45, say: 'Stand the copy on the plate in the second beam, turning that one into its target too.' },
      { go: [5.5, -21.0] },
      { sel: 0 },
      { print: [5.5, 1.125, -23.5], say: 'Print the pad on the plate at the foot of the ledge.' },
      { go: [5.5, -25.5], say: 'Bounce up onto the ledge.' },
      { exit: true },
    ],
    nope: [
      // take the crate for the plates: then there is nothing to bounce on
      [{ snap: [2.5, 1.45, -4.5] }, { snap: [-3.5, 2.0, -1.5] }, { go: [3.0, -2.0] }, { go: [6.0, -2.0] }, { go: [6.0, -14.6] }, { sel: 1 }, { print: [2.5, 2.02, -17.5], yaw: 45 }, { snap: [2.5, 2.0, -17.5] }, { go: [5.0, -19.5] }, { sel: 1 }, { print: [8.5, 2.02, -21.5], yaw: -45 }, { go: [5.5, -21.0] }, { sel: 0 }, { print: [5.5, 1.47, -23.5] }, { go: [5.5, -25.5], jump: true }, { exit: true, n: 400 }],
      // take the crate and the pad: the first beam bars the room
      [{ snap: [2.5, 1.45, -4.5] }, { snap: [-3.5, 1.125, -4.5] }, { go: [3.0, -2.0] }, { go: [6.0, -2.0] }, { go: [6.0, -14.6] }, { go: [5.0, -19.5] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -6, 3, 0, 7], [4, -3, 4, -1, 7], [5, -14, 7, -1, 7], [-6, -26, 10, -15, 9], [4, -27, 6, -27, 9], [4, -30, 6, -28, 9]]);
      B.start(0, 1, -1, 30);
      // the gallery: a blue pad, an orange mirror and a crate
      B.glassCase(-4, 1, -5, -4, 1, -5); B.pad(-4, 1, -5, { fixed: true });
      B.mirror(-4, 1, -2, 90);
      B.glassCase(2, 1, -5, 2, 1, -5); B.crate(2, 1, -5);
      B.door([], 4, 1, -3, 4, 3, -1, { oneway: true }); B.solid(4, 4, -3, 4, 7, -1);
      // the hall beyond: two beams across it, a plate on each one's path, and a third plate below the ledge
      B.solid(-6, 1, -18, -6, 1, -18, 'trim'); B.emitter(-6, 2, -18, -90, { locked: true });
      B.solid(10, 1, -22, 10, 1, -22, 'trim'); B.emitter(10, 2, -22, 90, { locked: true });
      B.plate('p1', 2, 1, -18); B.plate('p3', 8, 1, -22); B.plate('p2', 5, 1, -24);
      B.solid(1, 1, -26, 3, 1, -26, 'trim'); B.receptor('r1', 1, 2, -26); B.receptor('r1', 2, 2, -26); B.receptor('r1', 3, 2, -26);
      B.solid(7, 1, -26, 9, 1, -26, 'trim'); B.receptor('r2', 7, 2, -26); B.receptor('r2', 8, 2, -26); B.receptor('r2', 9, 2, -26);
      B.solid(4, 1, -26, 6, 4, -25);
      B.solid(4, 1, -27, 6, 4, -27); B.door(['r1', 'r2', 'p1', 'p2', 'p3'], 4, 5, -27, 6, 7, -27); B.solid(4, 8, -27, 6, 9, -27);
      B.solid(4, 1, -30, 6, 4, -28);
      B.exit(5, 5, -29);
    },
  },
  {
    name: 'Retrospective', film: 1, copy: true, diff: 10,
    hint: 'The way out is up on the gallery, past a band of light leak that fogs whatever you carry, and from up there the archive is out of sight. Before you climb, set out copies of what you will need where you can still see them from the top.',
    sol: [
      { snap: [-9.5, 2.5, -4.5], say: 'Copy the blue emitter in the archive, through its low doorway.' },
      { print: [-8.38, 2.5, -4.5], yaw: 0, say: 'Hang the copy against the original’s lens, aimed at the target in the archive: the beam across the atrium is smothered, and the target lights.' },
      { snap: [-9.5, 2.5, -4.5], say: 'Copy the emitter again.' },
      { print: [5.5, 6.5, 0.45], yaw: 180, say: 'Hang this one high in the corner, facing the wall, where you will be able to see it from the gallery: an exhibit for later.' },
      { go: [0.5, -5.5] },
      { snap: [-10.5, 1.125, -2.5], say: 'Copy the blue pad in the archive.' },
      { print: [0.5, 1.125, -6.5], say: 'Print it on the floor below the gallery.' },
      { snap: [-10.5, 1.125, -2.5], say: 'Copy the pad once more, and keep it.' },
      { go: [-1.5, -6.5] },
      { js: '(() => { const S = __shutter; S.setView(-Math.PI / 2, 0); for (let i = 0; i < 120 && S.player.velocity.y < 8; i++) { S.keys.KeyW = true; S.step(1); } S.keys.KeyW = false; return T.pos(); })()', say: 'Walk east onto the pad.' },
      { until: '__shutter.player.velocity.y < 0.3', t: 3 },
      { below: 0.25, say: 'At the top of the bounce, print the pad under your feet.' },
      { until: '__shutter.player.position.y > 7.5 && __shutter.player.velocity.y > 0', t: 3 },
      { go: [0.5, -10.5], n: 150, say: 'Bounce again, up through the light leak with nothing on your film, and drift onto the gallery.' },
      { snap: [5.5, 6.5, 0.45], say: 'From the gallery, copy your exhibit.' },
      { print: [-3.5, 12.5, -11.5], yaw: 90, say: 'Hang it facing the target at the end of the gallery.' },
      { go: [0.5, -9.45] },
      { js: "(() => { const S = __shutter, o = S.L.objs.filter((q) => q.kind === 'pad').sort((u, v) => v.body.position.y - u.body.position.y)[0], p = o.body.position; T.aimAt(p.x, p.y, p.z); S.tryCapture(); S.step(2); return T.photo(); })()", say: 'From the edge, copy the pad hanging below.' },
      { print: [-1.5, 11.13, -11.5], say: 'A pad has weight: print it on the plate.' },
      { go: [4.5, -11.5] },
      { exit: true },
    ],
    nope: [
      // no exhibit: from the gallery there is no emitter in sight
      [{ snap: [-9.5, 2.5, -4.5] }, { print: [-8.45, 2.5, -4.5], yaw: 0 }, { go: [0.5, -5.5] }, { snap: [-10.5, 1.125, -2.5] }, { print: [0.5, 1.125, -6.5] }, { snap: [-10.5, 1.125, -2.5] },
        { go: [-1.5, -6.5] }, { js: '(() => { const S = __shutter; S.setView(-Math.PI / 2, 0); for (let i = 0; i < 120 && S.player.velocity.y < 8; i++) { S.keys.KeyW = true; S.step(1); } S.keys.KeyW = false; return T.pos(); })()' }, { until: '__shutter.player.velocity.y < 0.3', t: 3 }, { below: 0.25 }, { until: '__shutter.player.position.y > 7.5 && __shutter.player.velocity.y > 0', t: 3 }, { go: [0.5, -10.5], n: 150 },
        { snap: [5.5, 6.5, 0.45] }, { print: [-3.5, 12.5, -11.5], yaw: 90 }, { go: [0.5, -9.45] }, { js: "(() => { const S = __shutter, o = S.L.objs.filter((q) => q.kind === 'pad').sort((u, v) => v.body.position.y - u.body.position.y)[0], p = o.body.position; T.aimAt(p.x, p.y, p.z); S.tryCapture(); S.step(2); return T.photo(); })()" }, { print: [-1.5, 11.13, -11.5] }, { go: [4.5, -11.5] }, { exit: true, n: 400 }],
      // aim a copy at the gallery target from down in the atrium: the stub beside it takes the beam
      [{ snap: [-9.5, 2.5, -4.5] }, { print: [-8.45, 2.5, -4.5], yaw: 0 }, { snap: [-9.5, 2.5, -4.5] }, { print: [-5.5, 12.5, -8.5], yaw: 0 }, { go: [0.5, -5.5] }, { snap: [-10.5, 1.125, -2.5] }, { print: [0.5, 1.125, -6.5] }, { snap: [-10.5, 1.125, -2.5] },
        { go: [-1.5, -6.5] }, { js: '(() => { const S = __shutter; S.setView(-Math.PI / 2, 0); for (let i = 0; i < 120 && S.player.velocity.y < 8; i++) { S.keys.KeyW = true; S.step(1); } S.keys.KeyW = false; return T.pos(); })()' }, { until: '__shutter.player.velocity.y < 0.3', t: 3 }, { below: 0.25 }, { until: '__shutter.player.position.y > 7.5 && __shutter.player.velocity.y > 0', t: 3 }, { go: [0.5, -10.5], n: 150 }, { go: [0.5, -9.45] }, { js: "(() => { const S = __shutter, o = S.L.objs.filter((q) => q.kind === 'pad').sort((u, v) => v.body.position.y - u.body.position.y)[0], p = o.body.position; T.aimAt(p.x, p.y, p.z); S.tryCapture(); S.step(2); return T.photo(); })()" }, { print: [-1.5, 11.13, -11.5] }, { go: [4.5, -11.5] }, { exit: true, n: 400 }],
      // carry an emitter copy up instead: the light leak takes it on the way
      [{ snap: [-9.5, 2.5, -4.5] }, { print: [-8.45, 2.5, -4.5], yaw: 0 }, { go: [0.5, -5.5] }, { snap: [-10.5, 1.125, -2.5] }, { print: [0.5, 1.125, -6.5] }, { snap: [-10.5, 1.125, -2.5] }, { print: [5.0, 5.5, -6.5] }, { snap: [-9.5, 2.5, -4.5] }, { go: [-3.5, -6.5] }, { face: -90 }, { js: '__shutter.keys.KeyW = true' },
        { until: '__shutter.player.position.y > 7.5 && __shutter.player.velocity.y > 0 && __shutter.player.position.x > 3', t: 3 }, { face: 0 }, { until: '__shutter.P.onGround && __shutter.player.position.y > 10.5', t: 3 }, { js: '__shutter.keys.KeyW = false' },
        { go: [0.5, -10.5] }, { print: [-3.5, 12.5, -11.5], yaw: 90 }, { go: [0.5, -9.45] }, { js: "(() => { const S = __shutter, o = S.L.objs.filter((q) => q.kind === 'pad').sort((u, v) => v.body.position.y - u.body.position.y)[0], p = o.body.position; T.aimAt(p.x, p.y, p.z); S.tryCapture(); S.step(2); return T.photo(); })()" }, { print: [-1.5, 11.13, -11.5] }, { go: [4.5, -11.5] }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-6, -12, 6, 0, 16], [-11, -7, -8, -3, 5], [-7, -6, -7, -4, 5], [3, -13, 5, -13, 16], [3, -16, 5, -14, 16]]);
      B.start(2, 1, -1, 80);
      // the archive: a blue emitter firing out across the atrium through a low doorway, its target, and a blue pad
      B.solid(-7, 3, -6, -7, 5, -4);
      B.solid(-10, 1, -5, -10, 1, -5, 'trim'); B.emitter(-10, 2, -5, -90, { fixed: true });
      B.solid(-9, 1, -7, -9, 1, -7, 'trim'); B.receptor('r1', -9, 2, -7);
      B.glassCase(-11, 1, -3, -11, 1, -3); B.pad(-11, 1, -3, { fixed: true });
      // the gallery, ten metres up, with a band of light leak across the atrium below it
      B.solid(-6, 1, -12, 6, 10, -10);
      B.leak(-6, 9, -9, 6, 9, 0);
      B.solid(-6, 11, -12, -6, 11, -12, 'trim'); B.receptor('r2', -6, 12, -12); B.solid(-6, 12, -11, -6, 13, -11);
      B.plate('p2', -2, 11, -12);
      B.solid(3, 1, -13, 5, 10, -13); B.door(['r1', 'r2', 'p2'], 3, 11, -13, 5, 13, -13); B.solid(3, 14, -13, 5, 16, -13);
      B.solid(3, 1, -16, 5, 10, -14);
      B.exit(4, 11, -15);
    },
  },
  {
    name: 'Large Format', film: 1, zoom: true, diff: 2,
    hint: 'Four plates and only one crate. On Zoom film a print keeps its size in your viewfinder, so the farther away you push it, the bigger it comes out.',
    sol: [
      { snap: [2.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { zprint: [0.5, 0, -6.5], rest: 1.0, scale: 2.0, from: [0, 1], say: 'Back away from the square of plates and push the print out over the middle of it: that far off, it comes out big enough to sit on all four.' },
      { go: [3.6, -4.0] }, { go: [3.6, -9.0] }, { go: [0.5, -9.6] },
      { exit: true },
    ],
    nope: [
      // at its own size the crate only covers one plate
      [{ snap: [2.5, 1.45, -1.5] }, { print: [-0.5, 1.47, -7.5] }, { go: [3.6, -4.0] }, { go: [3.6, -9.0] }, { go: [0.5, -9.6] }, { exit: true }],
      // a normal-size crate in the middle reaches none of them
      [{ snap: [2.5, 1.45, -1.5] }, { zprint: [0.5, 0, -6.5], rest: 1.0, scale: 1.0, from: [0, 1] }, { go: [3.6, -4.0] }, { go: [3.6, -9.0] }, { go: [0.5, -9.6] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -14, 5, 0, 7]]);
      B.start(0, 1, 0);
      B.crate(2, 1, -2);
      // four plates in a square, a cell apart
      B.plate('p1', -1, 1, -8); B.plate('p2', 1, 1, -8); B.plate('p3', -1, 1, -6); B.plate('p4', 1, 1, -6);
      B.solid(-4, 1, -11, -2, 7, -11); B.door(['p1', 'p2', 'p3', 'p4'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 7, -11); B.solid(2, 1, -11, 5, 7, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Compact', film: 1, zoom: true, diff: 3,
    hint: 'Two beams, one above the other, and a target for each: one beam has to turn the corner while the other carries straight on.',
    sol: [
      { snap: [-2.5, 2.0, -1.5], say: 'Photograph the mirror.' },
      { zprint: [1.5, 1.52, -5.5], yaw: 45, scale: 0.5, from: [0, 1], say: 'Print it in the beams at half its size, turned to send light up the room. It only comes up to the lower beam; the upper one carries on over it.' },
      { go: [4.0, -2.0] }, { go: [7.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // full size, it turns both beams and the target on the right goes dark
      [{ snap: [-2.5, 2.0, -1.5] }, { zprint: [1.5, 2.02, -5.5], yaw: 45, scale: 1.0, from: [0, 1] }, { go: [4.0, -2.0] }, { go: [7.0, -2.0] }, { exit: true }],
      // too small, both beams pass over it
      [{ snap: [-2.5, 2.0, -1.5] }, { zprint: [1.5, 1.22, -5.5], yaw: 45, scale: 0.2, from: [0, 1] }, { go: [4.0, -2.0] }, { go: [7.0, -2.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -10, 5, 0, 7], [6, -3, 8, -1, 7]]);
      B.start(0, 1, 0);
      B.mirror(-3, 1, -2, 0);
      // two emitters, one above the other, firing across the room
      B.emitter(-5, 1, -6, -90, { locked: true }); B.emitter(-5, 2, -6, -90, { locked: true });
      B.solid(5, 1, -6, 5, 1, -6, 'trim'); B.receptor('r2', 5, 2, -6);
      B.receptor('r1', 1, 1, -10);
      B.door(['r1', 'r2'], 6, 1, -3, 6, 3, -1); B.solid(6, 4, -3, 6, 7, -1);
      B.exit(8, 1, -2);
    },
  },
  {
    name: 'High Beam', film: 1, zoom: true, diff: 3,
    hint: 'The target is high on the wall, and a beam leaves its emitter from the middle of the lens. On Zoom film everything about a print grows with it.',
    sol: [
      { go: [-3.5, -0.2] },
      { snap: [-3.5, 1.5, -1.5], say: 'Photograph the emitter from close up.' },
      { zprint: [-3.5, 3.17, -5.5], yaw: -90, scale: 4.3, from: [1, 0], say: 'Back off across the room and print it huge against the left wall, facing the target: from the middle of a lens that big, the beam runs high over your head.' },
      { go: [0.5, -9.5], say: 'Walk under the beam to the door.' },
      { exit: true },
    ],
    nope: [
      // at its own size the beam runs into the wall below the target
      [{ go: [-3.5, -0.2] }, { snap: [-3.5, 1.5, -1.5] }, { zprint: [-3.5, 1.52, -5.5], yaw: -90, scale: 1.0, from: [1, 0] }, { go: [3.0, -9.5] }, { go: [0.5, -9.5] }, { exit: true }],
      // three times the size is still too low
      [{ go: [-3.5, -0.2] }, { snap: [-3.5, 1.5, -1.5] }, { zprint: [-3.5, 2.52, -5.5], yaw: -90, scale: 3.0, from: [1, 0] }, { go: [0.5, -9.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 9]]);
      B.start(0, 1, 0);
      B.emitter(-4, 1, -2, -90);
      B.solid(6, 1, -6, 6, 2, -6, 'trim'); B.receptor('r1', 6, 3, -6);
      B.solid(-6, 1, -11, -2, 9, -11); B.door(['r1'], -1, 1, -11, 1, 3, -11); B.solid(-1, 4, -11, 1, 9, -11); B.solid(2, 1, -11, 6, 9, -11);
      B.exit(0, 1, -13);
    },
  },
  {
    name: 'Bounce Flash', film: 1, zoom: true, diff: 4,
    hint: 'The pad has to throw you up to the opening at the back of the shaft, but not up into the beam. A pad bounces in proportion to its size.',
    sol: [
      { snap: [-2.5, 2.04, -2.5], say: 'Photograph the model pad.' },
      { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 0.68, from: [0, 1], say: 'Print it on the floor of the shaft at a bit over twice its size: big enough to reach the opening, small enough to stay out of the beam.' },
      { go: [0.5, -12.0], say: 'Walk in, bounce, and step through into the passage.' },
      { exit: true },
    ],
    nope: [
      // at its own size it only hops
      [{ snap: [-2.5, 2.04, -2.5] }, { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 0.3, from: [0, 1] }, { go: [0.5, -12.0] }, { exit: true }],
      // a full-size pad throws you up into the beam
      [{ snap: [-2.5, 2.04, -2.5] }, { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 0.95, from: [0, 1] }, { go: [0.5, -12.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -8, 4, 0, 9], [0, -10, 0, -9, 9], [-1, -14, 1, -11, 7]]);
      B.start(0, 1, 0);
      B.solid(-3, 1, -3, -3, 1, -3, 'trim'); B.glassCase(-3, 2, -3, -3, 2, -3);
      B.miniPad(-2.5, 2, -2.5, 0.3);
      // the shaft: a low mouth, then a one-cell well; the passage leaves it three and a half metres up
      B.solid(0, 3, -9, 0, 9, -9);
      B.box([-1, 1, -14], [2, 4.5, -10]);
      // a beam runs down the passage and the length of the shaft, high up
      B.emitter(0, 7, -14, 180, { locked: true });
      B.exit(0, 4.5, -13);
    },
  },
  {
    name: 'Rangefinder', film: 1, zoom: true, diff: 4,
    hint: 'The plate is in a cubby across the pit, too far to walk to. On Zoom film a print is as big as how far you push it, compared with how far away you were when you took the photo.',
    sol: [
      { go: [0.5, -1.0] },
      { face: 0 },
      { snap: [2.5, 1.45, -9.5], say: 'Photograph the crate from right back here, a long way off.' },
      { go: [0.5, -10.6] },
      { print: [0.5, 1.4, -17.5], scale: 0.79, say: 'Walk to the edge of the pit and push the print into the cubby. Taken from about as far away as you print it, it comes out about its own size.' },
      { go: [-3.5, -3.0] },
      { exit: true },
    ],
    nope: [
      // taken up close it comes out far too big for the cubby
      [{ go: [2.5, -8.2] }, { snap: [2.5, 1.45, -9.5] }, { go: [0.5, -10.6] }, { print: [0.5, 1.4, -17.5], scale: 4.5 }, { go: [-3.5, -3.0] }, { exit: true }],
      // a crate in the void just falls out of frame
      [{ go: [2.5, -8.2] }, { snap: [2.5, 1.45, -9.5] }, { go: [0.5, -10.6] }, { print: [0.5, 1.47, -13.5] }, { go: [-3.5, -3.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -17, 4, 0, 7], [0, -18, 0, -18, 1], [-7, -4, -5, -2, 7]], { pits: [[-4, -17, 4, -12]] });
      B.start(0, 1, 0);
      B.crate(2, 1, -10);
      // a cubby low in the far wall, with the plate in it
      B.plate('p1', 0, 1, -18);
      B.door(['p1'], -5, 1, -4, -5, 3, -2); B.solid(-5, 4, -4, -5, 7, -2);
      B.exit(-7, 1, -3);
    },
  },
  {
    name: 'Letterbox', film: 1, zoom: true, postcard: true, diff: 5,
    hint: 'The beam runs along a duct behind the wall, and only the little port looks into it. A beam that goes into a postcard comes out of its photo spot, and on Zoom film a postcard is only as big as you print it.',
    sol: [
      { snap: [7.5, 2.0, -2.5], say: 'Photograph the photo spot in the glass room.' },
      { zprint: [0.5, 2.5, -8.5], yaw: -90, scale: 0.5, from: [0, 1], say: 'Walk up to the port and print the postcard small, inside the duct and standing in the beam, with its picture facing the emitter.' },
      { wait: 0.5, say: 'The beam goes into the card and comes out of the spot, straight into the target.' },
      { go: [-3.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // a postcard the usual size won't fit in the duct
      [{ snap: [7.5, 2.0, -2.5] }, { go: [0.5, -5.7] }, { print: [0.5, 2.5, -8.5], yaw: -90, scale: 1 }, { go: [-3.0, -2.0] }, { exit: true }],
      // turned the wrong way, the beam only hits the back of the card
      [{ snap: [7.5, 2.0, -2.5] }, { zprint: [0.5, 2.5, -8.5], yaw: 90, scale: 0.5, from: [0, 1] }, { go: [-3.0, -2.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -9, 4, 0, 8], [5, -6, 9, -1, 8], [-7, -3, -5, -1, 8]]);
      B.start(0, 1, 0);
      // the duct runs behind a thin wall, with a little port at eye height
      B.box([-4, 1, -9], [5, 1.8, -8]); B.box([-4, 3.2, -9], [5, 9, -8]);
      B.box([-4, 1, -8], [0.2, 9, -7.7]); B.box([0.8, 1, -8], [5, 9, -7.7]);
      B.box([0.2, 1, -8], [0.8, 2.25, -7.7]); B.box([0.2, 2.75, -8], [0.8, 9, -7.7]);
      B.emitter(-4, 2, -9, -90, { locked: true });
      // a sealed glass room with a photo spot facing its target
      B.glass(5, 1, -6, 5, 8, -1, { axis: 'x' });
      B.spot(7, 1, -3, 0);
      B.receptor('r1', 7, 1, -6);
      B.door(['r1'], -5, 1, -3, -5, 3, -1); B.solid(-5, 4, -3, -5, 8, -1);
      B.exit(-7, 1, -2);
    },
  },
  {
    name: 'Dumbwaiter', film: 1, zoom: true, postcard: true, diff: 5,
    hint: 'Things come out of a photo spot as high above it as they went into the postcard above its bottom edge. On Zoom film a postcard is as big as you print it.',
    sol: [
      { snap: [4.5, 2.0, -10.5], say: 'Photograph the photo spot under the shelf in the glass tower.' },
      { zprint: [-3.5, 3.82, -6.5], yaw: 90, scale: 2.8, from: [1, 0.3], say: 'Back right off and print the postcard huge, standing on the floor: nearly six metres tall.' },
      { snap: [-1.5, 1.45, -9.5], say: 'Photograph the crate.' },
      { print: [-3.5, 7.35, -6.5], scale: 1.17, say: 'Print it just above the top of the postcard. It drops in and comes out of the spot nearly six metres up, over the shelf, and lands on the plate.' },
      { wait: 2.5 },
      { go: [-3.5, -13.0] },
      { exit: true },
    ],
    nope: [
      // a postcard the usual size only lifts it two metres, under the shelf
      [{ snap: [4.5, 2.0, -10.5] }, { zprint: [-3.5, 2.02, -6.5], yaw: 90, scale: 1.0, from: [1, 0] }, { snap: [-1.5, 1.45, -9.5] }, { print: [-3.5, 3.6, -6.5], scale: 0.99 }, { wait: 2.5 }, { go: [-3.5, -13.0] }, { exit: true }],
      // the shelf is behind glass: you can't print onto it
      [{ snap: [-1.5, 1.45, -9.5] }, { go: [1.0, -8.0] }, { js: 'T.realPrint(4.5, 5.6, -11.5, 0)' }, { wait: 1 }, { go: [-3.5, -13.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 10], [-6, -18, -2, -15, 6]]);
      B.start(0, 1, 0);
      const home = B.spot(-4, 1, -2, 0);
      B.crate(-2, 1, -10);
      // the glass tower: a photo spot on the floor under a high shelf, and the plate on the shelf
      B.glass(2, 1, -14, 2, 10, -10, { axis: 'x' }); B.glass(2, 1, -10, 6, 10, -10, { axis: 'z' });
      B.box([2.56, 4.6, -14], [7, 5.0, -10]);
      B.spot(4, 1, -11, 0);
      B.leak(3, 1, -11, 5, 3, -11);
      B.plate('p1', 4, 5, -11);
      B.card(6, 1, -12, -90, home, { locked: true });
      // the way out
      B.solid(-6, 1, -15, -6, 6, -15); B.solid(-2, 1, -15, -2, 6, -15);
      B.door(['p1'], -5, 1, -15, -3, 3, -15); B.solid(-5, 4, -15, -3, 6, -15);
      B.exit(-4, 1, -17);
    },
  },
  {
    name: 'Thin Ice', film: 1, zoom: true, diff: 5,
    hint: 'The pit is wide and the lasers hang low over it, so there is no jumping out there. On Zoom film a print grows in every direction at once.',
    sol: [
      { go: [1.6, -2.0] },
      { snap: [2.5, 2.04, -2.0], say: 'Photograph the model plank on the table, from right beside it.' },
      { zprint: [0.5, 0, -8.5], rest: 1.0, yaw: 0, scale: 1.65, from: [0, 1], say: 'Push it out over the pit until it just reaches both edges. Any bigger and it gets so thick that walking on it puts your head in the lasers.' },
      { go: [0.5, -17.0], say: 'Walk across under the lasers.' },
      { exit: true },
    ],
    nope: [
      // at its own size it drops into the void
      [{ go: [1.6, -2.0] }, { snap: [2.5, 2.04, -2.0] }, { print: [0.5, 1.2, -8.5], yaw: 0, scale: 0.25 }, { go: [0.5, -17.0] }, { exit: true }],
      // blown up too far, it is thick enough to lift you into the beams
      [{ go: [1.6, -2.0] }, { snap: [2.5, 2.04, -2.0] }, { zprint: [0.5, 0, -8.5], rest: 1.0, yaw: 0, scale: 2.2, from: [0, 1] }, { go: [0.5, -17.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-3, -20, 3, 0, 7]], { pits: [[-3, -13, 3, -5]] });
      B.start(0, 1, 0);
      B.solid(2, 1, -3, 2, 1, -1, 'trim');
      B.miniPlank(2.5, 2, -2.0, 7, 0.25);
      // lasers across the void, a little over head height
      for (const z of [-5, -7, -9, -11, -13]) B.emitter(3, 2.75, z, 90, { locked: true });
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Highlight', film: 1, zoom: true, diff: 6,
    hint: 'Red light keeps anything in it off your film, and here it only fills the sunken tray. Whatever holds the plate down has to come through the door with you.',
    sol: [
      { snap: [6.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { zprint: [1.5, 0, -8.5], rest: 0, scale: 2.6, from: [0.4, 1], say: 'Print it on the plate in the tray, big enough that its middle sticks up out of the red light. The door opens.' },
      { go: [6.5, -4.0] }, { go: [6.5, -8.2], say: 'Go through.' },
      { go: [5.6, -8.5] },
      { snap: [1.5, 1.19, -8.5], say: 'Turn round and photograph the crate through the glass. The door shuts behind you.' },
      { zprint: [7.0, 0, -10.37], rest: 1.0, scale: 1.3, from: [0, 1], say: 'Print it against the ledge, a good bit smaller, as a step.' },
      { go: [7.0, -12.0], jump: true, say: 'Climb.' },
      { exit: true },
    ],
    nope: [
      // a crate the usual size holds the plate, but its middle is in the red light for good
      [{ snap: [6.5, 1.45, -1.5] }, { zprint: [1.5, 0, -8.5], rest: 0, scale: 1.0, from: [0.4, 1] }, { go: [6.5, -4.0] }, { go: [6.5, -8.2] }, { go: [5.6, -8.5] }, { snap: [1.5, 0.47, -8.5] }, { zprint: [7.0, 0, -10.37], rest: 1.0, scale: 1.3, from: [0, 1] }, { go: [7.0, -12.0], jump: true }, { exit: true }],
      // standing on the plate, you can't see the doorway to wedge it open
      [{ snap: [6.5, 1.45, -1.5] }, { go: [1.5, -4.0] }, { go: [1.5, -8.5] }, { js: 'T.realPrint(6.5, 1.47, -5.5, 0)' }, { go: [1.5, -4.0] }, { go: [6.5, -4.0] }, { go: [6.5, -8.2] }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[0, -5, 8, 0, 8], [5, -6, 7, -6, 8], [5, -13, 8, -7, 8], [0, -11, 3, -6, 8], [4, -11, 4, -7, 8]], { pits: [[0, -11, 3, -6]] });
      B.start(6, 1, 0);
      B.crate(6, 1, -2);
      // a sunken tray a metre deep, lit red, with the plate in it
      B.solid(0, -1, -11, 3, -1, -6, 'floor');
      B.safelight(0, 0, -11, 3, 0, -6);
      B.plate('p1', 1, 0, -9);
      // glass between the tray and the far room
      B.glass(4, 1, -11, 4, 8, -7, { axis: 'x' });
      B.door(['p1'], 5, 1, -6, 7, 3, -6); B.solid(5, 4, -6, 7, 8, -6);
      B.box([5, 1, -13], [9, 3.4, -11]);
      B.exit(7, 3.4, -13);
    },
  },
  {
    name: 'Over and Under', film: 1, copy: true, zoom: true, diff: 6,
    hint: 'One emitter, two targets: one high on the wall, one behind a slot at your ankles. Double-X copies come out any size, and a beam always leaves from the middle of its emitter.',
    sol: [
      { go: [4.0, -1.5] },
      { snap: [5.5, 2.5, -0.5], say: 'Copy the emitter in the case from close up.' },
      { zprint: [-3.5, 3.17, -4.5], yaw: -90, scale: 4.3, from: [1, 0], say: 'Print the copy huge against the left wall: its beam runs over your head into the high target.' },
      { go: [0.5, 0.0] },
      { snap: [5.5, 2.5, -0.5], say: 'Copy it again, this time from across the room.' },
      { go: [0.0, -7.6] },
      { zprint: [-4.5, 1.22, -7.5], yaw: -90, scale: 0.4, from: [1, -0.5], say: 'Print this one tiny on the floor by the left wall: its beam runs along the ground and in under the slot.' },
      { go: [0.5, -10.5] },
      { exit: true },
    ],
    nope: [
      // the usual size, its beam hits the wall above the slot
      [{ go: [4.0, -1.5] }, { snap: [5.5, 2.5, -0.5] }, { zprint: [-3.5, 3.17, -4.5], yaw: -90, scale: 4.3, from: [1, 0] }, { go: [0.5, 0.0] }, { snap: [5.5, 2.5, -0.5] }, { go: [0.0, -7.6] }, { zprint: [-4.5, 1.52, -7.5], yaw: -90, scale: 1.0, from: [1, -0.5] }, { go: [0.5, -10.5] }, { exit: true }],
      // only one target lit
      [{ go: [4.0, -1.5] }, { snap: [5.5, 2.5, -0.5] }, { zprint: [-3.5, 3.17, -4.5], yaw: -90, scale: 4.3, from: [1, 0] }, { go: [0.5, -10.5] }, { exit: true }],
      // three times the size isn't high enough for the top target
      [{ go: [4.0, -1.5] }, { snap: [5.5, 2.5, -0.5] }, { zprint: [-3.5, 2.52, -4.5], yaw: -90, scale: 3.0, from: [1, 0] }, { go: [0.5, 0.0] }, { snap: [5.5, 2.5, -0.5] }, { go: [0.0, -7.6] }, { zprint: [-4.5, 1.22, -7.5], yaw: -90, scale: 0.4, from: [1, -0.5] }, { go: [0.5, -10.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 9], [7, -8, 8, -8, 1]]);
      B.start(0, 1, 0);
      B.solid(5, 1, -1, 5, 1, -1, 'trim'); B.glassCase(5, 2, -1, 5, 2, -1);
      B.emitter(5, 2, -1, 180);
      // one target high on the right wall, the other in a pocket behind a low slot
      B.solid(6, 1, -5, 6, 2, -5, 'trim'); B.receptor('r2', 6, 3, -5);
      B.box([7, 1.4, -8], [8, 2, -7]); B.receptor('r1', 8, 1, -8);
      B.solid(-6, 1, -12, -2, 9, -12); B.door(['r1', 'r2'], -1, 1, -12, 1, 3, -12); B.solid(-1, 4, -12, 1, 9, -12); B.solid(2, 1, -12, 6, 9, -12);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Test Strip', film: 1, copy: true, zoom: true, diff: 6,
    hint: 'Three beams, one above another, and each has its own target. A mirror only turns the beams that reach its glass, and Double-X copies come out any size.',
    sol: [
      { snap: [-3.5, 2.0, -0.5], say: 'Copy the mirror.' },
      { zprint: [-2.5, 1.52, -5.5], yaw: 45, scale: 0.5, from: [0, 1], say: 'Nearest the emitters, print a copy at half size: it only reaches the bottom beam, and turns it to the first target.' },
      { snap: [-3.5, 2.0, -0.5], say: 'Copy it again.' },
      { zprint: [0.5, 2.02, -5.5], yaw: 45, scale: 1.0, from: [0, 1], say: 'Further along, a copy the usual size turns the middle beam, which is now the lowest one left.' },
      { go: [-1.8, -1.3] },
      { snap: [-3.5, 2.0, -0.5], say: 'Copy it once more, from close up.' },
      { zprint: [3.5, 2.72, -5.5], yaw: 45, scale: 1.7, from: [0, 1], say: 'And furthest along, a tall copy for the top beam.' },
      { go: [6.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // a full-size mirror first turns the bottom two beams together
      [{ snap: [-3.5, 2.0, -0.5] }, { zprint: [-2.5, 2.02, -5.5], yaw: 45, scale: 1.0, from: [0, 1] }, { go: [-1.8, -1.3] }, { snap: [-3.5, 2.0, -0.5] }, { zprint: [3.5, 2.72, -5.5], yaw: 45, scale: 1.7, from: [0, 1] }, { go: [6.0, -2.0] }, { exit: true }],
      // the tall one in the middle turns the top two together
      [{ snap: [-3.5, 2.0, -0.5] }, { zprint: [-2.5, 1.52, -5.5], yaw: 45, scale: 0.5, from: [0, 1] }, { go: [-1.8, -1.3] }, { snap: [-3.5, 2.0, -0.5] }, { zprint: [0.5, 2.72, -5.5], yaw: 45, scale: 1.7, from: [0, 1] }, { go: [6.0, -2.0] }, { exit: true }],
      // one tall mirror turns all three into the first target
      [{ go: [-1.8, -1.3] }, { snap: [-3.5, 2.0, -0.5] }, { zprint: [-2.5, 2.72, -5.5], yaw: 45, scale: 1.7, from: [0, 1] }, { go: [6.0, -2.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -10, 6, 0, 8], [7, -3, 9, -1, 8]]);
      B.start(0, 1, 0);
      B.mirror(-4, 1, -1, 0);
      // three emitters stacked on the left wall, firing across the room
      B.emitter(-6, 1, -6, -90, { locked: true }); B.emitter(-6, 2, -6, -90, { locked: true }); B.emitter(-6, 3, -6, -90, { locked: true });
      // three targets just past the beams, each at the height of its own beam
      B.receptor('r1', -3, 1, -9);
      B.solid(0, 1, -9, 0, 1, -9, 'trim'); B.receptor('r2', 0, 2, -9);
      B.solid(3, 1, -9, 3, 2, -9, 'trim'); B.receptor('r3', 3, 3, -9);
      B.door(['r1', 'r2', 'r3'], 7, 1, -3, 7, 3, -1); B.solid(7, 4, -3, 7, 8, -1);
      B.exit(9, 1, -2);
    },
  },
  {
    name: 'Big Shot', film: 1, zoom: true, motion: true, diff: 6,
    hint: 'The two beams need the whole teal window gone, and teal glass grows back unless every pane breaks at once. Action film keeps a thing’s speed whatever size you print it.',
    sol: [
      { go: [3.5, -5.5] },
      { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 },
      { snap: [4.5, 2.6, -5.5], say: 'Stand right against the tube and photograph the crate as it drops past your eyes, at full speed.' },
      { go: [1.0, -4.0] },
      { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel], e = T.eye(), D = Math.min(5.5, 3.0 * ph.relPos.length()), x = 1.0, y = 6.0, z = -11.0; const yaw0 = Math.atan2(-(x - e[0]), -(z - e[2])); let best = null; const tryAt = (dy, pd) => { ph.dist = D / ph.relPos.length(); S.setView(yaw0 + dy * Math.PI / 180, pd * Math.PI / 180); S.step(1, 0); const h = S.arcFirst || S.arcHit; if (!h || !S.ghostValid) return; const d = Math.hypot(h[0] - x, h[1] - y); if (!best || d < best.d) best = { d, dy, pd }; }; for (let dy = -12; dy <= 12; dy += 3) for (let pd = -10; pd <= 50; pd += 2) tryAt(dy, pd); if (!best) return "no throw"; const b = best; for (let dy = b.dy - 3; dy <= b.dy + 3; dy += 1) for (let pd = b.pd - 2; pd <= b.pd + 2; pd += 0.5) tryAt(dy, pd); tryAt(best.dy, best.pd); S.tryPrint(); S.step(60); return "throw d" + best.d.toFixed(2) + " pitch " + best.pd; })()', say: 'Push the print out three metres so it comes out huge, aim at the middle of the window and let it fly: it hits every pane at once.' },
      { wait: 1.5 },
      { go: [-4.5, -5.0] },
      { exit: true },
    ],
    nope: [
      // a crate the usual size breaks a few panes, and they grow back
      [{ go: [2.9, -5.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -5.5] }, { go: [1.0, -4.0] }, { launch: [1.0, 6.0, -11.0] }, { wait: 1.5 }, { go: [-4.5, -5.0] }, { exit: true }],
      // a big crate that isn't thrown just drops against the glass
      [{ go: [3.5, -5.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -5.5] }, { go: [1.0, -6.5] }, { print: [1.0, 6.0, -9.6], scale: 2.6 }, { wait: 1.5 }, { go: [-4.5, -5.0] }, { exit: true }],
      // a crate half again as big still can't reach the corner panes
      [{ go: [3.5, -5.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -5.5] }, { go: [1.0, -4.0] }, { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel], e = T.eye(), D = 1.6, x = 1.0, y = 6.0, z = -11.0; const yaw0 = Math.atan2(-(x - e[0]), -(z - e[2])); let best = null; const tryAt = (dy, pd) => { ph.dist = D / ph.relPos.length(); S.setView(yaw0 + dy * Math.PI / 180, pd * Math.PI / 180); S.step(1, 0); const h = S.arcFirst || S.arcHit; if (!h || !S.ghostValid) return; const d = Math.hypot(h[0] - x, h[1] - y); if (!best || d < best.d) best = { d, dy, pd }; }; for (let dy = -12; dy <= 12; dy += 3) for (let pd = -10; pd <= 50; pd += 2) tryAt(dy, pd); if (!best) return "no throw"; const b = best; for (let dy = b.dy - 3; dy <= b.dy + 3; dy += 1) for (let pd = b.pd - 2; pd <= b.pd + 2; pd += 0.5) tryAt(dy, pd); tryAt(best.dy, best.pd); S.tryPrint(); S.step(60); return "throw d" + best.d.toFixed(2) + " pitch " + best.pd; })()' }, { wait: 1.5 }, { go: [-4.5, -5.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -11, 5, 0, 9], [-2, -20, 3, -12, 9], [-8, -6, -6, -4, 4]], { pits: [[-2, -20, 3, -12]] });
      B.start(0, 1, -1);
      B.chute(4, -6, 1, 5);
      // two lasers run high over the hall at a teal window of sixteen panes, with void behind it
      B.solid(-1, 1, 0, -1, 3, 0, 'trim'); B.emitter(-1, 4, 0, 0, { locked: true });
      B.solid(2, 1, 0, 2, 6, 0, 'trim'); B.emitter(2, 7, 0, 0, { locked: true });
      B.box([-2, -1, -11.3], [-1, 10, -11]); B.box([3, -1, -11.3], [4, 10, -11]); B.box([-1, -1, -11.3], [3, 4, -11]); B.box([-1, 8, -11.3], [3, 10, -11]);
      for (let x = -1; x <= 2; x++) for (let y = 4; y <= 7; y++) B.fragile(x, y, -12, x, y, -12, { axis: 'z', face: 'max', group: 'w', heal: 1.5 });
      B.receptor('r1', -1, 4, -20); B.receptor('r2', 2, 7, -20);
      B.door(['r1', 'r2'], -6, 1, -6, -6, 3, -4); B.solid(-6, 4, -6, -6, 4, -4);
      B.exit(-8, 1, -5);
    },
  },
  {
    name: 'Mezzanine', film: 1, zoom: true, postcard: true, diff: 7,
    hint: 'You come out of a photo spot as high above it as you went into the postcard above its bottom edge. A postcard hangs wherever you print it, as far down as you like.',
    sol: [
      { go: [0.5, -3.4] },
      { snap: [0.5, 2.4, -12.5], say: 'From the edge of the balcony, photograph the photo spot in the glass tower.' },
      { zprint: [0.5, 5.2, -4.25], yaw: 0, scale: 2.5, from: [0, 1], say: 'Print the postcard huge, hanging just off the edge of the balcony with its bottom far down in the pit, its picture facing you.' },
      { walkin: true, yaw: 0, say: 'Walk off the edge into it. You are four metres above its bottom edge, so you come out four metres above the spot, high enough to land on the ledge.' },
      { exit: true },
    ],
    nope: [
      // a postcard the usual size, level with the balcony: you come out on the tower floor
      [{ go: [0.5, -3.4] }, { snap: [0.5, 2.4, -12.5] }, { zprint: [0.5, 8.04, -4.25], yaw: 0, scale: 1.0, from: [0, 1] }, { walkin: true, yaw: 0 }, { exit: true }],
      // hung as low as it will still catch you, it lifts you less than two metres
      [{ go: [0.5, -3.4] }, { snap: [0.5, 2.4, -12.5] }, { zprint: [0.5, 6.42, -4.25], yaw: 0, scale: 1.0, from: [0, 1] }, { walkin: true, yaw: 0 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -16, 4, 4, 11]], { pits: [[-4, -16, 4, -5]] });
      // the balcony you start on, seven metres up
      B.solid(-4, 1, -4, 4, 6, 4);
      B.start(0, 7, 3);
      const home = B.spot(3, 7, 3, 180);
      // a sealed glass tower across the pit, with a photo spot on its floor and the way out on a ledge
      B.solid(-3, 0, -16, 3, 0, -11, 'floor');
      B.glass(-3, 1, -11, 3, 11, -11, { axis: 'z' }); B.glass(-3, 1, -16, -3, 11, -12, { axis: 'x' }); B.glass(3, 1, -16, 3, 11, -12, { axis: 'x' });
      B.spot(0, 1, -13, 0);
      B.box([-3, 1, -16], [4, 4.5, -13.3]);
      B.card(2, 1, -12, -90, home, { locked: true });
      B.exit(0, 4.5, -15);
    },
  },
  {
    name: 'Glass Ceiling', film: 1, zoom: true, diff: 7,
    hint: 'A pad throws a crate as hard as it throws you, and a bigger pad throws harder. The skylight is teal: it only stays broken if every pane goes at once, so whatever hits it had better be big.',
    sol: [
      { go: [3.5, 0.6] },
      { snap: [3.5, 2.06, -0.5], say: 'Photograph the model pad from right up against its case.' },
      { zprint: [0.5, 0, -4.5], rest: 1.0, scale: 2.4, from: [0.5, 1], say: 'Print it huge, right under the skylight.' },
      { go: [-1.5, 0.4] },
      { snap: [-2.5, 1.45, -0.5], say: 'Photograph the crate from close up.' },
      { zprint: [0.5, 2.65, -4.5], scale: 2.0, from: [-0.5, 1], say: 'Print it huge too, over the giant pad: it drops on, and the pad throws it up through the whole skylight at once.' },
      { wait: 2.5 },
      { snap: 'crate', say: 'Photograph the crate as it bounces, to get it off the pad…' },
      { go: [0.5, -2.6] },
      { face: 0 },
      { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14', say: '…then hop onto the pad and ride it up through the hole yourself…' },
      { until: '__shutter.player.position.y > 9', t: 3 },
      { face: -29, say: '…and once you are above the floor up there, steer off to the side and land.' },
      { until: '__shutter.P.onGround && __shutter.player.position.y > 7.5', t: 4 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // a pad the usual size can't throw even a giant crate that high
      [{ go: [3.5, 0.6] }, { snap: [3.5, 2.06, -0.5] }, { zprint: [0.5, 0, -4.5], rest: 1.0, scale: 1.0, from: [0.5, 1] }, { go: [-1.5, 0.4] }, { snap: [-2.5, 1.45, -0.5] }, { zprint: [0.5, 2.65, -4.5], scale: 2.0, from: [-0.5, 1] }, { wait: 2.5 }, { snap: 'crate' }, { go: [0.5, -4.5], jump: true }, { go: [3.0, -8.0] }, { exit: true }],
      // and a crate the usual size, even off the giant pad, arrives too slowly to break anything
      [{ go: [3.5, 0.6] }, { snap: [3.5, 2.06, -0.5] }, { zprint: [0.5, 0, -4.5], rest: 1.0, scale: 2.4, from: [0.5, 1] }, { go: [-1.5, 0.4] }, { snap: [-2.5, 1.45, -0.5] }, { zprint: [0.5, 3.0, -4.5], scale: 1.0, from: [-0.5, 1] }, { wait: 2.5 }, { snap: 'crate' }, { go: [0.5, -4.5], jump: true }, { go: [3.0, -8.0] }, { exit: true }],
      // you can't break glass yourself
      [{ go: [3.5, 0.6] }, { snap: [3.5, 2.06, -0.5] }, { zprint: [0.5, 0, -4.5], rest: 1.0, scale: 2.4, from: [0.5, 1] }, { go: [0.5, -4.5], jump: true }, { go: [3.0, -8.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -10, 4, 0, 14]]);
      B.start(0, 1, 0);
      B.crate(-3, 1, -1);
      B.solid(3, 1, -1, 3, 1, -1, 'trim'); B.glassCase(3, 2, -1, 3, 2, -1);
      B.miniPad(3.5, 2, -0.5, 0.5);
      // the ceiling of the hall is the floor of the room upstairs, with a teal skylight in the middle
      B.solid(-4, 7, -10, 4, 7, -7); B.solid(-4, 7, -3, 4, 7, 0); B.solid(-4, 7, -6, -2, 7, -4); B.solid(2, 7, -6, 4, 7, -4);
      for (let x = -1; x <= 1; x++) for (let z = -6; z <= -4; z++) B.fragile(x, 7, z, x, 7, z, { axis: 'y', face: 'min', group: 'g', heal: 1.5 });
      B.exit(3, 8, -9);
    },
  },
  {
    name: 'Red Shift', film: 1, zoom: true, diff: 8,
    hint: 'The model is too far off to blow up in one go, and red light keeps anything on this floor off your film. But blue things hang wherever you print them, even up out of the light.',
    sol: [
      { go: [5.5, -2.5] },
      { snap: [15.5, 1.04, -2.5], say: 'Photograph the model pad down the far end of the tube.' },
      { go: [4.5, 0.4] },
      { zprint: [0.5, 3.4, -7.5], scale: 0.24, from: [0.45, 1], say: 'Print it out in the room, high up above the red light. Shot from that far away it comes out tiny, but blue prints hang where you put them.' },
      { go: [0.5, -6.6] },
      { snap: [0.5, 3.4, -7.5], say: 'Walk underneath it and photograph it again, from close up: up there it isn’t in the red.' },
      { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 2.0, from: [0.35, 1], say: 'Now print it on the floor by the high ledge, pushed far away: it comes out huge.' },
      { go: [0.5, -7.2] },
      { face: 0 },
      { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14', say: 'Hop onto the giant pad…' },
      { until: '__shutter.player.velocity.y > 15', t: 2 },
      { js: '__shutter.keys.KeyW = false' },
      { until: '__shutter.player.position.y > 12.4', t: 2 },
      { js: '__shutter.keys.KeyW = true', say: '…and once it has thrown you above the ledge, step onto it.' },
      { until: '__shutter.P.onGround && __shutter.player.position.y > 11.5', t: 3 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // straight from the tube, even pushed as far as the room allows, it only hops
      [{ go: [5.5, -2.5] }, { snap: [15.5, 1.04, -2.5] }, { go: [4.5, 0.4] }, { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 0.34, from: [0.45, 1] }, { go: [0.5, -9.5], jump: true }, { go: [0.5, -12.5] }, { exit: true }],
      // a small print on the floor sits in the red light and can't be photographed again
      [{ go: [5.5, -2.5] }, { snap: [15.5, 1.04, -2.5] }, { go: [4.5, 0.4] }, { zprint: [0.5, 0, -7.5], rest: 1.0, scale: 0.24, from: [0.45, 1] }, { go: [0.5, -6.6] }, { snap: [0.5, 1.03, -7.5] }, { zprint: [0.5, 0, -9.5], rest: 1.0, scale: 2.0, from: [0.35, 1] }, { go: [0.5, -9.5], jump: true }, { go: [0.5, -12.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 15], [6, -3, 15, -3, 2]]);
      B.start(0, 1, 0);
      B.safelight(-5, 1, -14, 5, 2, 0);
      // a blue model pad at the end of a long tube behind glass
      B.glass(6, 1, -3, 6, 2, -3, { axis: 'x' });
      B.miniPad(15.5, 1, -2.5, 0.3, { fixed: true });
      // the way on is up a sheer twelve-metre ledge
      B.box([-5, 1, -14], [6, 12, -11]);
      B.exit(0, 12, -13);
    },
  },
  {
    name: 'Parallax', film: 1, zoom: true, postcard: true, diff: 8,
    hint: 'A postcard is a window: anything that goes in comes out of the photo spot just as far to the side, and just as high, as it went in. Both the beam and the crate have to come out well off to one side.',
    sol: [
      { snap: [0.5, 1.8, -16.5], say: 'Photograph the photo spot in the sealed vault, through the glass.' },
      { zprint: [-3.5, 0, -9.0], rest: 1.0, yaw: 90, scale: 3.5, from: [1, 0.75], say: 'Back right off and print the postcard huge, standing in the laser, facing it, with the laser going in near one edge.' },
      { snap: [-4.5, 1.45, -1.5], say: 'The beam comes out of the spot beside the pillar, just as far to the side. Now photograph the crate.' },
      { zprint: [-3.5, 5.5, -7.4], scale: 1.0, from: [1, 0.6], say: 'Print it into the top of the postcard near the other edge: it comes out high and wide of the spot, over the ledge.' },
      { wait: 2 },
      { go: [-5.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // a postcard the usual size sends the beam into the pillar and the crate into the void
      [{ snap: [0.5, 1.8, -16.5] }, { zprint: [-3.5, 0, -10.5], rest: 1.0, yaw: 90, scale: 1.0, from: [1, 0.75] }, { snap: [-4.5, 1.45, -1.5] }, { zprint: [-3.5, 2.6, -10.1], scale: 1.0, from: [1, 0.6] }, { wait: 2 }, { go: [-5.0, -2.0] }, { exit: true }],
      // twice the size gets the beam past the pillar, but the crate still can't come out high or wide enough
      [{ snap: [0.5, 1.8, -16.5] }, { zprint: [-3.5, 0, -9.0], rest: 1.0, yaw: 90, scale: 2.0, from: [1, 0.75] }, { snap: [-4.5, 1.45, -1.5] }, { zprint: [-3.5, 4.5, -8.0], scale: 1.0, from: [1, 0.6] }, { wait: 2 }, { go: [-5.0, -2.0] }, { exit: true }],
      // walking in yourself fogs your film at the spot
      [{ snap: [0.5, 1.8, -16.5] }, { zprint: [-3.5, 0, -6.5], rest: 1.0, yaw: 90, scale: 1.0, from: [1, 0] }, { snap: [-4.5, 1.45, -1.5] }, { go: [-1.5, -6.5] }, { walkin: true, yaw: 90 }, { js: 'T.realPrint(-1.5, 5.0, -16.95, 0)' }, { wait: 2 }, { exit: true }],
      // and the glass won't let you print onto the ledge from out here
      [{ snap: [-4.5, 1.45, -1.5] }, { go: [-1.0, -6.0] }, { js: 'T.realPrint(-1.5, 5.0, -16.95, 0)' }, { wait: 2 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -15, 6, 0, 8], [-3, -22, 4, -16, 8], [-9, -3, -7, -1, 4]], { pits: [[-3, -22, 4, -16]] });
      B.start(0, 1, -1);
      B.crate(-5, 1, -2);
      // a laser across the hall, and the glass wall of the sealed vault
      B.emitter(6, 1, -11, 90, { locked: true });
      B.solid(-6, 1, -15, -4, 8, -15); B.solid(5, 1, -15, 6, 8, -15);
      B.glass(-3, 1, -15, 4, 8, -15, { axis: 'z' });
      // in the vault: the spot (in a light leak), a pillar right in front of it,
      // targets behind the pillar to the right, and a high ledge with a plate to the left
      B.solid(0, -1, -17, 0, 0, -17);
      B.spot(0, 1, -17, 0);
      B.leak(0, 1, -17, 0, 3, -17);
      B.box([-0.2, -1, -19.2], [1.2, 9, -18.0]);
      B.solid(1, -1, -21, 2, 0, -21, 'trim'); B.receptor('r1', 1, 1, -21); B.receptor('r1', 2, 1, -21);
      B.box([-3, 4.2, -17.6], [-0.9, 4.5, -16.2], 'trim'); B.plate('p1', -2, 4.5, -17);
      B.door(['p1', 'r1'], -7, 1, -3, -7, 3, -1); B.solid(-7, 4, -3, -7, 4, -1);
      B.exit(-9, 1, -2);
    },
  },
  {
    name: 'Burst Mode', film: 2, zoom: true, copy: true, motion: true, diff: 8,
    hint: 'Teal glass only stays broken if every teal pane goes at once: the big window and the little block behind the keyhole too. Double-X copies keep the falling crate’s speed, and each copy’s size depends on how far away you took it.',
    sol: [
      { go: [3.5, -2.5] },
      { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 },
      { snap: [4.5, 2.6, -2.5], say: 'Copy the falling crate from right beside the tube: a copy you’ll print big.' },
      { go: [-1.5, -6.0] },
      { snap: [4.5, 3.5, -2.5], say: 'Copy it again from across the room: a copy you’ll print tiny.' },
      { go: [1.5, -8.0] },
      { launch: [1.5, 2.4, -13.0], settle: 5, say: 'Throw the tiny copy straight through the keyhole at the teal block…' },
      { go: [-2.5, -8.0] },
      { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel], e = T.eye(), D = Math.min(3.4, 1.9 * ph.relPos.length()), x = -3.5, y = 5.6, z = -12.0; const yaw0 = Math.atan2(-(x - e[0]), -(z - e[2])); let best = null; const tryAt = (dy, pd) => { ph.dist = D / ph.relPos.length(); S.setView(yaw0 + dy * Math.PI / 180, pd * Math.PI / 180); S.step(1, 0); const h = S.arcFirst || S.arcHit; if (!h || !S.ghostValid) return; const d = Math.hypot(h[0] - x, h[1] - y); if (!best || d < best.d) best = { d, dy, pd }; }; for (let dy = -12; dy <= 12; dy += 3) for (let pd = -10; pd <= 50; pd += 2) tryAt(dy, pd); if (!best) return "no throw"; const b = best; for (let dy = b.dy - 3; dy <= b.dy + 3; dy += 1) for (let pd = b.pd - 2; pd <= b.pd + 2; pd += 0.5) tryAt(dy, pd); tryAt(best.dy, best.pd); S.tryPrint(); S.step(5); return "throw d" + best.d.toFixed(2) + " pitch " + best.pd; })()', say: '…then quickly step across, push the other copy out so it comes out huge, and throw it at the middle of the big window before the block grows back.' },
      { wait: 1 },
      { go: [-5.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // the big window alone grows back
      [{ go: [3.5, -2.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -2.5] }, { go: [-2.5, -8.0] }, { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel], e = T.eye(), D = 1.9, x = -3.5, y = 5.6, z = -12.0; const yaw0 = Math.atan2(-(x - e[0]), -(z - e[2])); let best = null; const tryAt = (dy, pd) => { ph.dist = D / ph.relPos.length(); S.setView(yaw0 + dy * Math.PI / 180, pd * Math.PI / 180); S.step(1, 0); const h = S.arcFirst || S.arcHit; if (!h || !S.ghostValid) return; const d = Math.hypot(h[0] - x, h[1] - y); if (!best || d < best.d) best = { d, dy, pd }; }; for (let dy = -12; dy <= 12; dy += 3) for (let pd = -10; pd <= 50; pd += 2) tryAt(dy, pd); if (!best) return "no throw"; const b = best; for (let dy = b.dy - 3; dy <= b.dy + 3; dy += 1) for (let pd = b.pd - 2; pd <= b.pd + 2; pd += 0.5) tryAt(dy, pd); tryAt(best.dy, best.pd); S.tryPrint(); S.step(5); return "throw d" + best.d.toFixed(2) + " pitch " + best.pd; })()' }, { wait: 4 }, { go: [-5.0, -2.0] }, { exit: true }],
      // a smaller copy can't break both corners of the window
      [{ go: [-1.5, -6.0] }, { snap: [4.5, 3.5, -2.5] }, { go: [2.0, -3.0] }, { snap: [4.5, 3.5, -2.5] }, { go: [1.5, -8.0] }, { sel: 0 }, { launch: [1.5, 2.4, -13.0], settle: 5 }, { go: [-2.5, -8.0] }, { launch: [-3.5, 5.6, -12.0] }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
      // throws too far apart: the block has grown back by the time the window breaks
      [{ go: [3.5, -2.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -2.5] }, { go: [-1.5, -6.0] }, { snap: [4.5, 3.5, -2.5] }, { go: [1.5, -8.0] }, { launch: [1.5, 2.4, -13.0], settle: 5 }, { wait: 4 }, { go: [-2.5, -8.0] }, { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel], e = T.eye(), D = 1.9, x = -3.5, y = 5.6, z = -12.0; const yaw0 = Math.atan2(-(x - e[0]), -(z - e[2])); let best = null; const tryAt = (dy, pd) => { ph.dist = D / ph.relPos.length(); S.setView(yaw0 + dy * Math.PI / 180, pd * Math.PI / 180); S.step(1, 0); const h = S.arcFirst || S.arcHit; if (!h || !S.ghostValid) return; const d = Math.hypot(h[0] - x, h[1] - y); if (!best || d < best.d) best = { d, dy, pd }; }; for (let dy = -12; dy <= 12; dy += 3) for (let pd = -10; pd <= 50; pd += 2) tryAt(dy, pd); if (!best) return "no throw"; const b = best; for (let dy = b.dy - 3; dy <= b.dy + 3; dy += 1) for (let pd = b.pd - 2; pd <= b.pd + 2; pd += 0.5) tryAt(dy, pd); tryAt(best.dy, best.pd); S.tryPrint(); S.step(5); return "throw d" + best.d.toFixed(2) + " pitch " + best.pd; })()' }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
      // a copy taken from close up is far too big for the keyhole
      [{ go: [3.5, -2.5] }, { until: '(c => c && c.body.velocity.y < -12 && c.body.position.y < 3.4 && c.body.position.y > 3.0)(T.obj("crate"))', t: 8 }, { snap: [4.5, 2.6, -2.5] }, { go: [1.5, -8.0] }, { launch: [1.5, 2.4, -13.0] }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -12, 6, 0, 8], [-6, -20, -2, -13, 8], [0, -14, 3, -13, 3], [1, -16, 1, -15, 3], [-9, -3, -7, -1, 4]], { pits: [[-6, -20, -2, -13], [1, -16, 1, -15]] });
      B.start(0, 1, 0);
      B.chute(4, -3, 1, 6);
      // two lasers high over the hall at opposite corners of a teal window, with void behind it...
      B.solid(-5, 1, 0, -5, 3, 0, 'trim'); B.emitter(-5, 4, 0, 0, { locked: true });
      B.solid(-3, 1, 0, -3, 5, 0, 'trim'); B.emitter(-3, 6, 0, 0, { locked: true });
      B.box([-6, -1, -12.3], [-5, 9, -12]); B.box([-2, -1, -12.3], [-1, 9, -12]); B.box([-5, -1, -12.3], [-2, 4, -12]); B.box([-5, 7, -12.3], [-2, 9, -12]);
      for (let x = -5; x <= -3; x++) for (let y = 4; y <= 6; y++) B.fragile(x, y, -13, x, y, -13, { axis: 'z', face: 'max', group: 'w', heal: 3 });
      B.receptor('rA', -5, 4, -20); B.receptor('rB', -3, 6, -20);
      // ...and a keyhole onto a teal block in the path of a third
      B.solid(0, 1, -13, 0, 3, -13); B.solid(2, 1, -13, 3, 3, -13); B.solid(1, 1, -13, 1, 1, -13); B.solid(1, 3, -13, 1, 3, -13);
      B.box([1, 2, -12.12], [1.15, 3, -12], 'trim'); B.box([1.85, 2, -12.12], [2, 3, -12], 'trim'); B.box([1.15, 2, -12.12], [1.85, 2.15, -12], 'trim'); B.box([1.15, 2.85, -12.12], [1.85, 3, -12], 'trim');
      B.solid(0, 1, -14, 3, 1, -14); B.solid(0, 3, -14, 3, 3, -14);
      B.emitter(0, 2, -14, -90, { locked: true });
      B.fragile(1, 2, -14, 1, 2, -14, { slab: true, group: 'w', heal: 3 });
      B.receptor('rC', 3, 2, -14);
      // (whatever smashes the block drops on down a shaft into the void)
      B.door(['rA', 'rB', 'rC'], -7, 1, -3, -7, 3, -1); B.solid(-7, 4, -3, -7, 4, -1);
      B.exit(-9, 1, -2);
    },
  },
  {
    name: 'Eye of the Needle', film: 1, zoom: true, motion: true, postcard: true, diff: 9,
    hint: 'The way to the frosted block is a long, thin duct high in the vault wall: only something small, going fast and flying level gets down it. A postcard sends things out of its spot as high above the floor as they went in above the card’s bottom edge.',
    sol: [
      { snap: [0.5, 1.8, -17.5], say: 'Photograph the photo spot in the vault, through the glass.' },
      { zprint: [0.5, 0, -14.0], rest: -2.9, yaw: 0, scale: 3.2, from: [0, 1], say: 'Print the postcard huge, standing down in the moat with its foot well below the edge: its top half is level with you.' },
      { go: [0.5, -11.0] },
      { snap: [4.5, 3.5, -5.5], say: 'From over here, photograph the crate falling in the tube. Shot from this far away it is tiny, and it keeps all its speed.' },
      { go: [0.5, -11.5] },
      { launch: [0.5, 6.5, -21.0], via: [0.5, 2.3, -14.0], say: 'Throw it into the postcard at eye height: five metres above the card’s foot, so it shoots out of the spot five metres up, straight down the duct and through the frosted block.' },
      { wait: 1 },
      { go: [-5.0, -2.0] },
      { exit: true },
    ],
    nope: [
      // a postcard the usual size: whatever goes in comes out too low to fly level down the duct
      [{ snap: [0.5, 1.8, -17.5] }, { zprint: [0.5, 1.9, -14.0], yaw: 0, scale: 1.0, from: [0, 1] }, { go: [0.5, -11.0] }, { snap: [4.5, 3.5, -5.5] }, { go: [0.5, -11.5] }, { launch: [0.5, 6.5, -21.0], via: [0.5, 2.5, -14.0] }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
      // twice the size still isn't tall enough
      [{ snap: [0.5, 1.8, -17.5] }, { zprint: [0.5, 0, -14.0], rest: -1.6, yaw: 0, scale: 2.0, from: [0, 1] }, { go: [0.5, -11.0] }, { snap: [4.5, 3.5, -5.5] }, { go: [0.5, -11.5] }, { launch: [0.5, 6.5, -21.0], via: [0.5, 2.2, -14.0] }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
      // a crate shot from close up is too big for the duct
      [{ snap: [0.5, 1.8, -17.5] }, { zprint: [0.5, 0, -14.0], rest: -2.9, yaw: 0, scale: 3.2, from: [0, 1] }, { go: [3.5, -5.5] }, { snap: [4.5, 2.5, -5.5] }, { go: [0.5, -11.5] }, { launch: [0.5, 6.5, -21.0], via: [0.5, 2.3, -14.0] }, { wait: 1 }, { go: [-5.0, -2.0] }, { exit: true }],
      // walking in yourself fogs your film at the spot
      [{ snap: [0.5, 1.8, -17.5] }, { zprint: [-2.5, 0, -8.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1] }, { go: [-2.5, -2.0] }, { snap: [4.5, 3.5, -5.5] }, { go: [-2.5, -6.5] }, { walkin: true, yaw: 0 }, { launch: [0.5, 6.5, -21.0] }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -15, 6, 0, 9], [-3, -22, 4, -16, 9], [-9, -3, -7, -1, 4]], { pits: [[-6, -15, 6, -13], [-3, -22, 4, -16]] });
      B.start(0, 1, 0);
      B.chute(4, -6, 1, 6);
      // across a deep moat, the glass front of the sealed vault
      B.glass(-3, -3, -16, 4, 9, -16, { axis: 'z' });
      B.solid(0, -1, -18, 0, 0, -18);
      B.spot(0, 1, -18, 0);
      B.leak(0, 1, -18, 0, 3, -18);
      // the vault's back wall: two metres thick, with one little duct high up
      B.box([-3, -4, -21], [0.2, 10, -19]); B.box([0.8, -4, -21], [5, 10, -19]);
      B.box([0.2, -4, -21], [0.8, 6.0, -19]); B.box([0.2, 7.0, -21], [0.8, 10, -19]);
      // behind it, a frosted block in a laser's path
      B.solid(-3, -4, -22, 4, 5, -22); B.solid(-3, 7, -22, 4, 9, -22);
      B.emitter(-3, 6, -22, -90, { locked: true });
      B.fragile(0, 6, -22, 0, 6, -22, { slab: true });
      B.receptor('r1', 4, 6, -22);
      B.door(['r1'], -7, 1, -3, -7, 3, -1); B.solid(-7, 4, -3, -7, 4, -1);
      B.exit(-9, 1, -2);
    },
  },
  {
    name: 'Carry-On', film: 2, zoom: true, diff: 9,
    hint: 'Two frames, and the amber door only opens one way. Past it everything stands in red light, so nothing you print in there can ever be photographed again. Take both pictures from the right distance before you go.',
    sol: [
      { go: [2.5, -11.5] },
      { snap: [2.5, 2.06, -12.5], say: 'Photograph the model pad from right up against its case.' },
      { go: [-1.5, -13.5] },
      { snap: [-1.5, 1.45, 0.5], say: 'Then photograph the crate from the far end of the room, as far away as you can get.' },
      { go: [0.5, -16.5], say: 'Through the amber door: it locks behind you.' },
      { go: [0.5, -17.5] },
      { go: [7.5, -17.5] },
      { sel: 1 },
      { zprint: [8.5, 0, -19.5], rest: 2.3, scale: 0.25, from: [0.25, 1], say: 'Print the crate into the letterbox. Shot from that far away it comes out tiny, and it fits.' },
      { wait: 1 },
      { go: [11.5, -18.0] },
      { go: [13.0, -17.0] },
      { zprint: [16.5, 0, -18.5], rest: 1.0, scale: 2.0, from: [-1, 0.7], say: 'In the shaft, print the pad by the ledge. Shot from that close, it comes out huge.' },
      { go: [14.3, -18.5] },
      { face: -90 },
      { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14', say: 'Hop onto the pad…' },
      { until: '__shutter.player.velocity.y > 15', t: 2 },
      { js: '__shutter.keys.KeyW = false' },
      { until: '__shutter.player.position.y > 10.4', t: 2 },
      { js: '__shutter.keys.KeyW = true', say: '…and once it has thrown you above the ledge, step onto it.' },
      { until: '__shutter.P.onGround && __shutter.player.position.y > 9.5', t: 3 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // photos taken from ordinary distances: the crate won't fit the letterbox and the pad stays small
      [{ go: [2.5, -10.5] }, { snap: [2.5, 2.06, -12.5] }, { go: [-1.5, -1.5] }, { snap: [-1.5, 1.45, 0.5] }, { go: [0.5, -16.5] }, { go: [0.5, -17.5] }, { go: [7.5, -17.5] }, { sel: 1 }, { zprint: [8.5, 0, -19.5], rest: 2.3, scale: 0.45, from: [0.25, 1] }, { wait: 1 }, { go: [11.5, -18.0] }, { go: [13.0, -17.0] }, { zprint: [16.5, 0, -18.5], rest: 1.0, scale: 1.0, from: [-1, 0.7] }, { go: [16.5, -18.5], jump: true }, { go: [18.8, -18.5] }, { exit: true }],
      // and a print in the red light can't be photographed again to fix it
      [{ go: [2.5, -10.0] }, { snap: [2.5, 2.06, -12.5] }, { go: [-1.5, -13.5] }, { snap: [-1.5, 1.45, 0.5] }, { go: [0.5, -16.5] }, { go: [0.5, -17.5] }, { go: [7.5, -17.5] }, { sel: 1 }, { zprint: [8.5, 0, -19.5], rest: 2.3, scale: 0.25, from: [0.25, 1] }, { wait: 1 }, { go: [11.5, -18.0] }, { go: [13.0, -17.0] }, { zprint: [14.5, 0, -18.5], rest: 1.0, scale: 0.8, from: [-1, 0.7] }, { snap: [14.5, 1.1, -18.5] }, { zprint: [16.5, 0, -18.5], rest: 1.0, scale: 2.0, from: [-1, 0.7] }, { go: [16.5, -18.5], jump: true }, { go: [18.8, -18.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-2, -14, 2, 0, 6], [-1, -15, 1, -15, 6], [-1, -18, 1, -16, 4], [2, -18, 6, -16, 4], [7, -19, 10, -16, 4], [8, -20, 8, -20, 4], [11, -19, 11, -17, 4], [12, -21, 19, -16, 13]]);
      B.start(0, 1, -1);
      B.crate(-2, 1, 0);
      B.solid(2, 1, -13, 2, 1, -13, 'trim'); B.glassCase(2, 2, -13, 2, 2, -13);
      B.miniPad(2.5, 2, -12.5, 0.5);
      B.door([], -1, 1, -15, 1, 3, -15, { oneway: true }); B.solid(-1, 4, -15, 1, 6, -15);
      // past the amber door, everything is under a red safelight
      B.safelight(-1, 1, -19, 11, 2, -16);
      B.safelight(12, 1, -21, 17, 2, -16);
      // a letterbox in the red room, with a plate inside
      B.box([8, 1, -20], [9, 2.3, -19]); B.box([8, 2.75, -20], [9, 5, -19]);
      B.plate('p1', 8, 2.3, -20);
      B.door(['p1'], 11, 1, -19, 11, 3, -17); B.solid(11, 4, -19, 11, 4, -17);
      // the shaft, and its ledge ten metres up
      B.box([18, 1, -21], [20, 10, -16]);
      B.exit(18, 10, -19);
    },
  },
  {
    name: 'Postage Stamp', film: 1, zoom: true, copy: true, postcard: true, diff: 10,
    hint: 'The photo spot stands in red light, so you can’t photograph it, but someone left a postcard to it in the case. Double-X copies a postcard like anything else, and on Zoom film each copy comes out bigger or smaller depending on how far away you took it. The laser needs a little one; you need a big one.',
    sol: [
      { go: [1.0, 3.5] },
      { snap: [-3.0, 8.0, 3.5], say: 'Copy the postcard in the case from about four metres away.' },
      { go: [5.5, 0.5] },
      { print: [7.5, 8.5, 0.5], yaw: 180, scale: 0.49, say: 'Through the little port, print the copy small in the duct, facing the laser: the beam goes in, comes out of the spot in the tower and lights the target under the ledge.' },
      { go: [0.0, 3.5] },
      { snap: [-3.0, 8.0, 3.5], say: 'Copy the postcard again, from three metres this time.' },
      { zprint: [0.5, 5.2, -4.25], yaw: 0, scale: 2.7, from: [0, 1], say: 'Back off and print it huge, hanging off the edge of the balcony with most of it below your feet.' },
      { walkin: true, yaw: 0, say: 'Walk off the edge into it: you come out of the spot as far above it as you were above the card’s bottom edge, level with the ledge.' },
      { exit: true },
    ],
    nope: [
      // the spot itself won't photograph in the red light
      [{ snap: [0.5, 1.8, -12.5] }, { zprint: [0.5, 5.2, -4.25], yaw: 0, scale: 2.7, from: [0, 1] }, { walkin: true, yaw: 0 }, { exit: true }],
      // a copy at its own size drops you onto the tower floor, far below the ledge
      [{ go: [1.0, 3.5] }, { snap: [-3.0, 8.0, 3.5] }, { go: [5.5, 0.5] }, { print: [7.5, 8.5, 0.5], yaw: 180, scale: 0.49 }, { go: [1.5, 3.5] }, { snap: [-3.0, 8.0, 3.5] }, { go: [0.5, 1.0] }, { print: [0.5, 7.4, -4.25], yaw: 0, scale: 1.0 }, { walkin: true, yaw: 0 }, { exit: true }],
      // without the little copy in the duct, the door on the ledge stays shut
      [{ go: [0.0, 3.5] }, { snap: [-3.0, 8.0, 3.5] }, { zprint: [0.5, 5.2, -4.25], yaw: 0, scale: 2.7, from: [0, 1] }, { walkin: true, yaw: 0 }, { exit: true }],
      // a copy too big for the duct won't go in
      [{ go: [-0.8, 3.5] }, { snap: [-3.0, 8.0, 3.5] }, { go: [5.5, 0.5] }, { print: [7.5, 8.5, 0.5], yaw: 180, scale: 0.88 }, { go: [0.0, 3.5] }, { snap: [-3.0, 8.0, 3.5] }, { zprint: [0.5, 5.2, -4.25], yaw: 0, scale: 2.7, from: [0, 1] }, { walkin: true, yaw: 0 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -17, 5, 5, 12], [6, -3, 7, 4, 12]], { pits: [[-5, -10, 5, -5]] });
      // the balcony you start on
      B.solid(-5, 1, -4, 5, 6, 5);
      B.start(0, 7, 3);
      const home = B.spot(3, 7, 2, 180);
      // the glass tower across the void: a photo spot in red light, a ledge, a target and a door
      B.glass(-5, 1, -11, 5, 12, -11, { axis: 'z' });
      const spot = B.spot(0, 1, -13, 0);
      // the postcard to it, in a case on the balcony
      B.glassCase(-4, 7, 3, -3, 8, 3);
      B.card(-3.5, 7, 3, 0, spot);
      B.safelight(-1, 1, -13, 1, 3, -12);
      B.box([-5, 1, -17], [6, 5, -13.3]);
      B.receptor('r1', 0, 1, -14);
      B.solid(-5, 5, -15, -2, 12, -15); B.solid(2, 5, -15, 5, 12, -15); B.solid(-1, 8, -15, 1, 12, -15);
      B.door(['r1'], -1, 5, -15, 1, 7, -15);
      B.exit(0, 5, -17);
      B.card(2, 1, -12, -90, home, { locked: true });
      // a duct beside the balcony: a laser runs along it, and a little port looks in
      B.box([6, 1, -3], [8, 7.8, 5]); B.box([6, 9.2, -3], [8, 13, 5]);
      B.box([6, 7.8, -3], [6.3, 9.2, 0.2]); B.box([6, 7.8, 0.8], [6.3, 9.2, 5]);
      B.box([6, 7.8, 0.2], [6.3, 8.25, 0.8]); B.box([6, 8.75, 0.2], [6.3, 9.2, 0.8]);
      B.emitter(7, 8, -3, 180, { locked: true });
    },
  },
  {
    name: 'Runaway', film: 1, motion: true, diff: 2,
    hint: 'Only something moving can break frosted glass, and Action film keeps the speed of anything orange that moves. Blue things never carry speed.',
    sol: [
      { snap: 'shuttle', say: 'Photograph the orange shuttle while it races along: the photo keeps its speed.' },
      { tp: [0.5, 1.02, -8.0], yaw: 0 },
      { launch: [0.5, 2.2, -10.8], say: 'Print it facing the frosted window. It flies off at the speed it was going and smashes the glass.' },
      { exit: true },
    ],
    nope: [
      // the blue shuttle is just as fast, but blue prints carry no speed: it only hangs there
      [{ until: '(o => o.body.position.z < -5.5 && o.body.position.z > -7.5)(__shutter.L.objs.filter((q) => q.kind === "shuttle")[1])', t: 6 }, { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.filter((q) => q.kind === "shuttle")[1])' },
        { tp: [0.5, 1.02, -8.0], yaw: 0 }, { print: [0.5, 2.2, -10.4] }, { exit: true }],
      // the parked crate has no speed to give
      [{ snap: [2.5, 1.45, -3.5] }, { tp: [0.5, 1.02, -8.0], yaw: 0 }, { print: [0.5, 2.0, -10.6] }, { wait: 1 }, { exit: true }],
      [{ snap: [2.5, 1.45, -3.5] }, { tp: [0.5, 1.02, -8.0], yaw: 0 }, { launch: [0.5, 2.0, -10.8] }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7]]);
      B.start(0, 1, -1);
      // two galleries behind glass: an orange shuttle on the left, a blue one on the right, both flying
      B.glass(-4, 1, -11, -4, 7, 0, { axis: 'x' });
      B.shuttle([-5, 1.5, -10], [-5, 1.5, -2], { speed: 9, size: [1.2, 0.4, 1.2], orange: true });
      B.glass(4, 1, -11, 4, 7, 0, { axis: 'x' });
      B.shuttle([5, 1.5, -10], [5, 1.5, -2], { speed: 9, size: [1.2, 0.4, 1.2], phase: 0.5 });
      B.crate(2, 1, -4);
      // the way out: a frosted window as big as a door
      B.solid(-6, 1, -12, -2, 7, -12); B.solid(2, 1, -12, 6, 7, -12); B.solid(-1, 4, -12, 1, 7, -12);
      B.fragile(-1, 1, -12, 1, 3, -12, { axis: 'z' });
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Dunk', film: 1, motion: true, diff: 3,
    hint: 'The plate is under the glass floor of the low alcove, and under that low ceiling nothing you print can drop far enough to break it. A throw goes the way you look, down included.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -8.4], yaw: 0 },
      { launch: [0.5, 1.0, -10.8], say: 'Stand at the mouth of the alcove, look down at its glass floor and print: the crate is thrown down hard and smashes through onto the plate below.' },
      { wait: 1 },
      { go: [4.0, -5.0] },
      { exit: true },
    ],
    nope: [
      // thrown flat into the alcove it only drops a little way: the glass holds
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -8.4], yaw: 0 }, { js: '__shutter.setView(0, 0); const ph = __shutter.L.photos[0]; ph.dist = 1.6 / ph.relPos.length(); __shutter.step(1, 0); __shutter.tryPrint(); __shutter.step(90); "flat"' }, { go: [4.0, -5.0] }, { exit: true }],
      // a crate printed (not thrown) as high as the alcove allows drops too short a way to break it
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -6.0], yaw: 0 }, { launch: [0.5, 1.0, -7.5] }, { wait: 0.3 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === "crate"))' },
        { tp: [0.5, 1.02, -8.4], yaw: 0 }, { print: [0.5, 2.03, -10.8] }, { wait: 1.5 }, { go: [4.0, -5.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -13, 5, 0, 6], [6, -6, 9, -4, 6]], { pits: [[-1, -12, 1, -10]] });
      B.start(0, 1, -1);
      B.chute(-4, -3, 1, 7);
      // the back wall, with a low alcove in it: a canopy one and a half metres over a frosted glass floor
      B.solid(-5, 1, -13, 5, 6, -13);
      B.solid(-5, 1, -12, -2, 6, -10); B.solid(2, 1, -12, 5, 6, -10);
      B.box([-1, 2.5, -12], [2, 7, -9]);
      B.fragile(-1, 0, -12, 1, 0, -10, { axis: 'y', face: 'max' });
      // the basement under it, its floor all plate
      B.solid(-2, -3, -13, 2, 0, -13); B.solid(-2, -3, -9, 2, 0, -9); B.solid(-2, -3, -12, -2, 0, -10); B.solid(2, -3, -12, 2, 0, -10);
      B.solid(-1, -3, -12, 1, -3, -10, 'floor');
      for (let x = -1; x <= 1; x++) for (let z = -12; z <= -10; z++) B.plate('p1', x, -2, z);
      B.door(['p1'], 6, 1, -6, 6, 3, -4); B.solid(6, 4, -6, 6, 6, -4);
      B.exit(8, 1, -5);
    },
  },
  {
    name: 'Head Start', film: 1, motion: true, diff: 3,
    hint: 'Walk through the light leak and your film fogs, so a throw has to start on this side of it. Teal-striped glass grows back a moment after it breaks: be right behind your throw.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -6.4], yaw: 0 },
      { launch: [0.5, 2.5, -14.9], settle: 10, say: 'From just short of the light leak, throw it down the corridor at the far window. A throw doesn’t mind the leak.' },
      { go: [0.5, -17.5], say: 'Run straight after it, through the leak (you carry nothing to fog) and through the hole before the glass grows back.' },
      { exit: true },
    ],
    nope: [
      // carry the photo through the leak to throw from close: the film fogs and the crate goes back to the chute
      [{ snap: 'crate' }, { go: [0.5, -13.0] }, { launch: [0.5, 2.5, -14.9], settle: 10 }, { go: [0.5, -17.5] }, { exit: true }],
      // throw from this side but dawdle: the window has grown back by the time you get there
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -6.4], yaw: 0 }, { launch: [0.5, 2.5, -14.9], settle: 150 }, { go: [0.5, -17.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -6, 4, 0, 6], [-1, -18, 1, -7, 6]]);
      B.start(0, 1, -1);
      B.chute(-3, -4, 1, 7);
      // a curtain of light leak across the mouth of the corridor, and a self-healing window at its far end
      B.leak(-1, 1, -8, 1, 6, -8);
      B.fragile(-1, 1, -16, 1, 3, -16, { axis: 'z', heal: 2.5 }); B.solid(-1, 4, -16, 1, 6, -16);
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Pincer', film: 1, motion: true, diff: 4,
    hint: 'The beam has to pass through both teal-striped panes, and each grows back unless the pair breaks together. With one crate at a time, find the place where the two panes meet.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [-2.5, 1.02, -4.5], yaw: -45 },
      { launch: [0.55, 2.5, -7.55], say: 'Stand back on the diagonal and throw it at the corner where the two panes meet: it hits both at once, and the pair stays broken.' },
      { wait: 3.5, say: 'The beam runs through the booth, off the mirror and into the target.' },
      { go: [5.0, -3.0] },
      { exit: true },
    ],
    nope: [
      // one pane at a time: each grows back
      [{ snap: 'crate' }, { tp: [4.5, 1.02, -3.5], yaw: 0 }, { launch: [4.5, 2.5, -7.3] }, { wait: 3.5 }, { go: [5.0, -3.0] }, { exit: true }],
      [{ snap: 'crate' }, { tp: [-3.0, 1.02, -9.5], yaw: -90 }, { launch: [0.3, 2.5, -10.0] }, { wait: 3.5 }, { go: [-2.0, -4.0] }, { go: [5.0, -3.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 7], [6, -4, 9, -2, 7]]);
      B.start(-3, 1, -1, -30);
      B.chute(-4, -2, 1, 8);
      // a booth in the corner: two teal frosted panes, one facing south and one facing west, meeting at its corner
      B.fragile(1, 1, -8, 4, 3, -8, { axis: 'z', face: 'min', group: 'pk', heal: 1.2 });
      B.fragile(0, 1, -12, 0, 3, -9, { axis: 'x', face: 'max', group: 'pk', heal: 1.2 });
      B.solid(1, 4, -8, 5, 7, -8); B.solid(0, 4, -12, 0, 7, -8);
      // the beam crosses the north end of the room, into the booth, off a mirror and out to the target
      B.emitter(-5, 2, -12, -90, { locked: true });
      B.mirror(2, 1.5, -12, -45, { fixed: true });
      B.solid(2, 1, -7, 2, 1, -7, 'trim'); B.receptor('r1', 2, 2, -7);
      B.door(['r1'], 6, 1, -4, 6, 3, -2); B.solid(6, 4, -4, 6, 7, -2);
      B.exit(8, 1, -3);
    },
  },
  {
    name: 'Flush Out', film: 1, motion: true, diff: 5,
    hint: 'The door wants both plates held, and a chute only ever has one crate out at a time. The other crate sits in red safelight, where film can’t see it, but nothing stops you hitting it.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -4.6], yaw: 0 },
      { launch: [0.5, 3.25, -10.0], say: 'Throw it across the pit at the top of the crate on the red-lit perch: it topples off, out of the light.' },
      { wait: 4 },
      { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo() + " " + T.pos(); })(__shutter.L.objs.find((q) => q.kind === "crate" && !q.chute))', say: 'Out of the red light it shows up on film: photograph it.' },
      { tp: [-3.5, 1.02, -1.5], yaw: 0 },
      { print: [-4.5, 1.47, 0.5], say: 'Print it on one plate.' },
      { until: 'T.fastIn(-10)', t: 10, say: 'Your first crate fizzles out and the chute drops a fresh one.' },
      { snap: [3.5, 4.0, -3.5] },
      { tp: [3.0, 1.02, -1.5], yaw: 0 },
      { launch: [5.45, 1.9, 0.45], say: 'Throw it into the corner over the other plate: it drops onto it and stays.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // a crate in red light won't go on film
      [{ tp: [0.5, 1.02, -4.6], yaw: 0 }, { snap: [0.5, 2.95, -10.5] }, { tp: [-3.5, 1.02, -1.5], yaw: 0 }, { print: [-4.5, 1.47, 0.5] }, { exit: true }],
      // the chute's crate on one plate: the chute won't give you another while it is there
      [{ snap: 'crate' }, { tp: [-3.0, 1.02, -1.5], yaw: 0 }, { launch: [-4.45, 1.9, 0.45] }, { wait: 6 }, { snap: [3.5, 4.0, -3.5] }, { tp: [3.0, 1.02, -1.5], yaw: 0 }, { launch: [5.45, 1.9, 0.45] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 7], [6, -4, 9, -2, 7]], { pits: [[-5, -12, 5, -6]] });
      B.start(0, 1, -2);
      B.chute(3, -4, 1, 8);
      // an island against the far wall: a crate on a thin perch, bathed in red safelight
      B.solid(-1, 0, -12, 1, 0, -9, 'floor');
      B.box([0.25, 1, -10.75], [0.75, 2.5, -10.25], 'trim');
      B.crate(0, 2.5, -11);
      B.safelight(0, 1, -11, 0, 4, -11);
      // two plates in the near corners, and the door they open
      B.plate('p1', -5, 1, 0); B.plate('p2', 5, 1, 0);
      B.door(['p1', 'p2'], 6, 1, -4, 6, 3, -2); B.solid(6, 4, -4, 6, 7, -2);
      B.exit(8, 1, -3);
    },
  },
  {
    name: 'Pull the Rug', film: 1, motion: true, diff: 5,
    hint: 'The beam runs the length of the trench, and anything small that lands in its path falls into the void. The big gray crate would bridge the trench, if the block of frosted glass weren’t holding it up.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [-2.5, 1.02, -3.5], yaw: 0 },
      { launch: [-2.5, 4.4, -5.5], say: 'Throw it at the block of frosted glass under the gray crate: it smashes, and the gray crate drops across the trench, right in the beam.' },
      { wait: 2 },
      { go: [1.5, -4.5] },
      { leap: [1.5, -6.55, 1.5, -9.5], say: 'Downstream of the gray crate the beam is gone: jump the trench under the low ceiling.' },
      { exit: true },
    ],
    nope: [
      // straight over the beam: too high to jump, and the low ceiling won't let you try from anything
      [{ tp: [1.5, 1.02, -4.5], yaw: 0 }, { leap: [1.5, -6.55, 1.5, -9.5] }, { exit: true }],
      // a crate thrown into the beam just drops into the void
      [{ snap: 'crate' }, { tp: [1.5, 1.02, -4.0], yaw: 0 }, { launch: [1.5, 2.2, -7.5] }, { wait: 0.4 }, { go: [1.5, -4.5] }, { leap: [1.5, -6.55, 1.5, -9.5] }, { exit: true }],
      // stand on a crate at the edge and jump the beam from there: the low ceiling stops you short
      [{ snap: 'crate' }, { tp: [2.5, 1.02, -3.0], yaw: 0 }, { launch: [2.5, 1.0, -5.5] }, { wait: 0.4 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === "crate" && !q.pinned))' },
        { print: [2.5, 1.47, -6.5] }, { tp: [2.5, 1.92, -6.4], yaw: 0 }, { go: [2.5, -9.5], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 8]], { pits: [[-5, -8, 6, -8]] });
      B.start(0, 1, -1);
      B.chute(4, -2, 1, 9);
      // the beam runs along the trench at head height
      B.solid(-6, 1, -8, -6, 1, -8, 'trim'); B.emitter(-6, 2, -8, -90, { locked: true });
      // west: a dead-end strip behind the trench, and a block of frosted glass over it with a big gray crate on top
      B.solid(-6, 1, -14, -1, 8, -10); B.solid(-1, 1, -9, -1, 8, -9);
      B.fragile(-4, 4, -9, -2, 4, -7, { slab: true });
      B.box([-4, 1, -9], [-3.9, 4, -8.9], 'trim'); B.box([-1.1, 1, -9], [-1, 4, -8.9], 'trim');
      B.crate(-3, 5.72, -8, { pinned: true, scale: 2.6 });
      // east: the crossing, under a ceiling too low to jump the beam from anything
      B.box([0, 4, -10], [7, 5, -5]);
      B.exit(3, 1, -12);
    },
  },
  {
    name: 'Ghosting', film: 1, motion: true, exposure: true, diff: 5,
    hint: 'Hold the shutter on something moving and Slow film takes the path it swept, with no speed at all. A quick tap takes the thing itself, speed and all, and then it’s gone.',
    sol: [
      { tp: [3.0, 1.02, -3.5], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 1.0, say: 'Hold the shutter on the orange shuttle for one whole run: a long orange streak.' },
      { print: [0.5, 0, -12.0], rest: 1.0, yaw: 90, say: 'Lay the streak across the pit.' },
      { tp: [3.0, 1.02, -3.5], yaw: -90 },
      { tap: 'shuttle', when: 'A', say: 'Now a quick tap on the shuttle itself: it comes away with its speed.' },
      { go: [0.5, -8.0] },
      { go: [0.5, -16.6], say: 'Cross on the streak.' },
      { launch: [0.5, 2.0, -19.9], say: 'Throw the shuttle at the frosted window.' },
      { exit: true },
    ],
    nope: [
      // take the shuttle first and there is nothing left to make a bridge from
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -8.0] }, { go: [0.5, -16.6] }, { launch: [0.5, 2.0, -19.9] }, { exit: true }],
      // the streak has no speed: it can't break the window
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 1.0 }, { print: [0.5, 0, -12.0], rest: 1.0, yaw: 90 }, { tp: [3.0, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 0.6 }, { go: [0.5, -8.0] }, { go: [0.5, -16.6] }, { launch: [0.5, 2.0, -19.9] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -24, 6, 0, 7]], { pits: [[-6, -15, 6, -10]] });
      B.start(0, 1, -1);
      // the orange shuttle races up and down its gallery behind glass
      B.glass(4, 1, -8, 4, 7, 0, { axis: 'x' });
      B.shuttle([5, 1.3, -7], [5, 1.3, 0], { speed: 8, size: [1.0, 0.4, 1.2], orange: true });
      // past the void, a frosted window is the way out
      B.solid(-6, 1, -21, -2, 7, -21); B.solid(2, 1, -21, 6, 7, -21); B.solid(-1, 4, -21, 1, 7, -21);
      B.fragile(-1, 1, -21, 1, 3, -21, { axis: 'z' });
      B.exit(0, 1, -23);
    },
  },
  {
    name: 'Sidewinder', film: 1, motion: true, postcard: true, diff: 6,
    hint: 'A throw into a postcard comes out of the spot at the same angle it went in, measured from the spot’s arrow. Nobody can carry film into that light leak.',
    sol: [
      { snap: [0.5, 1.6, -10.5], say: 'Photograph the photo spot in the sealed room.' },
      { print: [0.5, 2.02, -6.0], yaw: 0, say: 'Print the postcard facing you.' },
      { snap: [-4.5, 4.0, -5.5], say: 'Photograph the falling crate.' },
      { tp: [4.0, 1.02, -2.4], yaw: 0 },
      { launch: [-2.5, 2.2, -13.4], via: [0.5, 2.0, -6.0], say: 'From off to the right, throw it into the card at a slant: it comes out of the spot slanting the same way, left of the arrow, into the frosted window.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // straight in, straight out: into the blank wall
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { snap: [-4.5, 4.0, -5.5] }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { launch: [0.5, 2.2, -13.4], via: [0.5, 2.0, -6.0] }, { wait: 1.5 }, { exit: true }],
      // carry the throw in through the card: the light leak fogs it
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { snap: [-4.5, 4.0, -5.5] }, { tp: [0.5, 1.02, -4.2], yaw: 0 }, { walkin: true, yaw: 0 }, { face: 45 }, { launch: [-2.5, 2.2, -13.4] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [7, -4, 10, -2, 7]]);
      B.start(0, 1, -1);
      const hall = B.spot(-3, 1, -2, 180);
      B.chute(-5, -6, 1, 8);
      // a glass wall seals the north half; its spot stands in a light leak, its arrow pointing north
      B.glass(-6, 1, -9, 6, 7, -9, { axis: 'z' });
      B.spot(0, 1, -11, 0);
      B.leak(-1, 1, -12, 1, 4, -10);
      B.card(4, 1, -12, -90, hall, { locked: true });
      // the frosted window is off to the left in the far wall, a cubby of plates behind it
      B.solid(-6, 1, -15, -5, 7, -15); B.solid(-1, 1, -15, 6, 7, -15); B.solid(-4, 4, -15, -2, 7, -15);
      B.fragile(-4, 1, -15, -2, 3, -15, { axis: 'z', face: 'max' });
      for (let x = -4; x <= -2; x++) for (let z = -16; z <= -15; z++) B.plate('p1', x, 1, z);
      B.door(['p1'], 7, 1, -4, 7, 3, -2); B.solid(7, 4, -4, 7, 7, -2);
      B.exit(9, 1, -3);
    },
  },
  {
    name: 'Overdrive', film: 1, motion: true, zoom: true, diff: 6,
    hint: 'Four teal panes, all one window: only something going very fast gets through them all. The ceiling here is too low to drop anything far, but a jump pad bounces in proportion to its size.',
    sol: [
      { tp: [-3.5, 1.02, -0.6], yaw: 180 },
      { snap: [-3.5, 2.08, -1.5], say: 'Photograph the model pad from right up against its case.' },
      { zprint: [3.5, 0, -6.5], rest: 1.0, scale: 2.0, from: [-1, 0.6], say: 'Print it far off on the floor: it comes out huge, and a huge pad bounces hard.' },
      { tp: [0.5, 1.02, -3.0], yaw: 0 },
      { snap: [-2.5, 1.45, -4.5], say: 'Photograph the crate.' },
      { zprint: [3.5, 3.3, -6.5], scale: 1.0, from: [-1, 0.5], say: 'Print it just over the giant pad and let it drop.' },
      { until: 'T.obj("crate") && T.obj("crate").body.velocity.y > 14.5', t: 4 },
      { snap: 'crate', say: 'Catch it on film the instant it shoots back up, at its fastest.' },
      { tp: [0.5, 1.02, -6.5], yaw: 0 },
      { launch: [0.5, 2.3, -9.55], say: 'Throw it into the window: fast enough for all four panes at once.' },
      { exit: true },
    ],
    nope: [
      // a pad its usual size only throws a crate as fast as a fall from that ceiling: three panes, not four
      [{ tp: [-3.5, 1.02, -0.6], yaw: 180 }, { snap: [-3.5, 2.08, -1.5] }, { zprint: [3.5, 0, -6.5], rest: 1.0, scale: 1.0, from: [-1, 0.6] }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { snap: [-2.5, 1.45, -4.5] }, { zprint: [3.5, 3.3, -6.5], scale: 1.0, from: [-1, 0.5] },
        { until: 'T.obj("crate") && T.obj("crate").body.velocity.y > 10.5', t: 4 }, { snap: 'crate' }, { tp: [0.5, 1.02, -6.5], yaw: 0 }, { launch: [0.5, 2.3, -9.55] }, { exit: true }],
      // dropped from as high as the room allows, caught just before it lands
      [{ tp: [0.5, 1.02, -3.0], yaw: 0 }, { snap: [-2.5, 1.45, -4.5] }, { zprint: [0.5, 3.5, -6.5], scale: 1.0, from: [0, 1], settle: 1 }, { until: 'T.obj("crate") && T.obj("crate").body.position.y < 1.75', t: 3 }, { snap: 'crate' }, { tp: [0.5, 1.02, -6.5], yaw: 0 }, { launch: [0.5, 2.3, -9.55] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 3]]);
      B.start(0, 1, -1);
      B.crate(-3, 1, -5);
      // a model pad in a glass case
      B.solid(-4, 1, -2, -4, 1, -2, 'trim'); B.glassCase(-4, 2, -2, -4, 2, -2);
      B.miniPad(-3.5, 2, -1.5, 0.3, { fixed: true });
      // the way out: four teal panes, one behind another, all one window
      B.solid(-5, 1, -12, -2, 3, -10); B.solid(2, 1, -12, 5, 3, -10);
      for (const [z, f] of [[-11, 'max'], [-11, 'mid'], [-11, 'min'], [-12, 'max']]) B.fragile(-1, 1, z, 1, 3, z, { axis: 'z', face: f === 'mid' ? undefined : f, group: 'w', heal: 1.5 });
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Back to Back', film: 2, motion: true, copy: true, diff: 6,
    hint: 'One throw from this slow chute only gets three teal panes deep, and the window grows back unless it all goes at once. Double-X copies keep the speed of what you copy: send a second throw right behind the first.',
    sol: [
      { tp: [-2.5, 1.02, -3.0], yaw: 90 },
      { until: 'T.fastIn(-10)', t: 6 },
      { snap: 'crate', say: 'Copy the falling crate twice: two throws.' },
      { snap: 'crate' },
      { tp: [0.5, 1.02, -4.4], yaw: 0 },
      { launch: [0.5, 2.9, -7.5], settle: 45, say: 'Throw one high at the window: it breaks the first three panes, stops, and drops.' },
      { launch: [0.5, 2.9, -8.55], settle: 60, say: 'Give it a moment to fall out of the way, then throw the other the same way: it flies through the holes the first one made and breaks the rest before any grow back.' },
      { leap: [0.5, -6.55, 0.5, -11.0], say: 'Jump the slot under the window and walk out.' },
      { exit: true },
    ],
    nope: [
      // one throw on its own stops three panes deep
      [{ tp: [-2.5, 1.02, -3.0], yaw: 90 }, { until: 'T.fastIn(-10)', t: 6 }, { snap: 'crate' }, { tp: [0.5, 1.02, -4.4], yaw: 0 }, { launch: [0.5, 2.9, -7.5] }, { leap: [0.5, -6.55, 0.5, -11.0] }, { exit: true }],
      // two throws, but too far apart: the first three panes grow back in between
      [{ tp: [-2.5, 1.02, -3.0], yaw: 90 }, { until: 'T.fastIn(-10)', t: 6 }, { snap: 'crate' }, { snap: 'crate' }, { tp: [0.5, 1.02, -4.4], yaw: 0 }, { launch: [0.5, 2.9, -7.5], settle: 160 }, { launch: [0.5, 2.9, -8.55] }, { leap: [0.5, -6.55, 0.5, -11.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 6]], { pits: [[-1, -10, 1, -8]] });
      B.start(0, 1, -1);
      B.chute(-4, -3, 1, 7, { vmax: 11 });
      // a window five teal panes deep, all one window, over a slot of void that swallows any crate that stops inside it
      B.solid(-5, 1, -10, -2, 6, -8); B.solid(2, 1, -10, 5, 6, -8); B.solid(-1, 4, -10, 1, 6, -8);
      for (const [z, f] of [[-9, 'max'], [-9, 'mid'], [-9, 'min'], [-10, 'max'], [-10, 'mid']]) B.fragile(-1, 1, z, 1, 3, z, { axis: 'z', face: f === 'mid' ? undefined : f, group: 'w', heal: 1.8 });
      B.exit(0, 1, -12);
    },
  },
  {
    name: 'Raise the Roof', film: 1, motion: true, diff: 4,
    hint: 'The jump pad would take you up through the frosted skylight, if the glass weren’t in the way. A crate dropped on the pad only bounces so high, but a throw goes as high as you aim it.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -4.4], yaw: 0 },
      { launch: [0.5, 5.0, -5.6], say: 'Stand under the skylight and throw the crate straight up at it: it smashes through.' },
      { wait: 0.5 },
      { tp: [0.5, 1.3, -5.5], yaw: 0 },
      { until: '__shutter.player.position.y > 6.2', t: 3, say: 'Step onto the pad before the glass grows back: it throws you up through the hole.' },
      { go: [0.5, -10.0] },
      { exit: true },
    ],
    nope: [
      // the skylight stops you dead
      [{ tp: [0.5, 1.3, -5.5], yaw: 0 }, { until: '__shutter.player.position.y > 6.2', t: 3 }, { go: [0.5, -10.0] }, { exit: true }],
      // a crate dropped on the pad bounces, but not high enough to reach the glass
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { launch: [4.0, 1.0, -1.5] }, { wait: 1.2 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === "crate"))' },
        { print: [0.5, 2.6, -5.5] }, { wait: 2 }, { tp: [0.5, 1.3, -5.5], yaw: 0 }, { until: '__shutter.player.position.y > 6.2', t: 3 }, { go: [0.5, -10.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 10]]);
      B.start(0, 1, -1);
      B.chute(-4, -1, 1, 8);
      // the upper floor, with a self-healing frosted skylight over a jump pad
      B.solid(-5, 5, -12, 5, 5, -8); B.solid(-5, 5, -4, 5, 5, -3);
      B.solid(-5, 5, -7, -2, 5, -5); B.solid(2, 5, -7, 5, 5, -5);
      B.fragile(-1, 5, -7, 1, 5, -5, { axis: 'y', heal: 3 });
      B.pad(0, 1, -6, { locked: true });
      B.exit(0, 6, -10);
    },
  },
  {
    name: 'Battering Ram', film: 1, motion: true, zoom: true, diff: 7,
    hint: 'Two teal panes, one window: both have to break at once or they grow back, and the pillar between them is wider than a crate. On Zoom film, something you photograph up close prints bigger the farther away you push it.',
    sol: [
      { tp: [-2.55, 1.02, -2.5], yaw: 90 },
      { until: '(o => o && Math.abs(o.body.position.y - 3.45) < 0.12 && o.body.velocity.y < -8)(__shutter.L.objs.find((q) => q.chute))', t: 6 },
      { snap: [-3.5, 2.55, -2.5], say: 'Stand right up against the chute and photograph the crate as it falls past your face.' },
      { tp: [0.5, 1.02, -4.5], yaw: 0 },
      { launch: [0.5, 2.6, -7.27], scale: 1.7, say: 'Shot from that close, it prints big even near you: throw it at the pillar, and it is wide enough to smash both panes at once.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // a crate its usual size (shot from a normal distance) breaks one pane, which grows straight back
      [{ tp: [-1.9, 1.02, -2.5], yaw: 90 }, { until: '(o => o && Math.abs(o.body.position.y - 2.62) < 0.12)(__shutter.L.objs.find((q) => q.chute))', t: 6 }, { snap: [-3.5, 2.55, -2.5] }, { tp: [-1.0, 1.02, -4.5], yaw: 0 }, { launch: [-1.0, 2.6, -7.5] }, { wait: 1.5 }, { exit: true }],
      // thrown at the pillar it misses both
      [{ tp: [-1.9, 1.02, -2.5], yaw: 90 }, { until: '(o => o && Math.abs(o.body.position.y - 2.62) < 0.12)(__shutter.L.objs.find((q) => q.chute))', t: 6 }, { snap: [-3.5, 2.55, -2.5] }, { tp: [0.5, 1.02, -4.5], yaw: 0 }, { launch: [0.5, 2.6, -7.5] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -13, 6, 0, 7], [7, -4, 10, -2, 7]]);
      B.start(0, 1, -1);
      // a short chute: its crate is never far from eye level
      B.chute(-4, -3, 1, 5);
      // the window: two teal panes, one window, with a solid pillar between them a little wider than a crate
      B.solid(-6, 1, -9, -3, 7, -9); B.solid(3, 1, -9, 6, 7, -9); B.solid(-2, 5, -9, 2, 7, -9);
      B.solid(0, 1, -9, 0, 4, -9);
      B.fragile(-2, 1, -9, -1, 4, -9, { axis: 'z', face: 'max', group: 'w', heal: 0.8 });
      B.fragile(1, 1, -9, 2, 4, -9, { axis: 'z', face: 'max', group: 'w', heal: 0.8 });
      // two beams run high over the room, one through each pane, to targets in the sealed room behind
      B.emitter(-2, 4, 0, 0, { locked: true }); B.emitter(1, 4, 0, 0, { locked: true });
      B.receptor('r1', -2, 4, -13); B.receptor('r2', 1, 4, -13);
      B.door(['r1', 'r2'], 7, 1, -4, 7, 3, -2); B.solid(7, 4, -4, 7, 7, -2);
      B.exit(9, 1, -3);
    },
  },
  {
    name: 'Chase Scene', film: 1, motion: true, postcard: true, diff: 7,
    hint: 'The sealed room’s only way out is a teal window that grows back quickly, and its photo spot stands in a light leak, so whatever you carry in fogs. Be right behind your throw.',
    sol: [
      { snap: [0.5, 1.6, -10.5], say: 'Photograph the photo spot in the sealed room.' },
      { print: [0.5, 2.02, -5.0], yaw: 0, say: 'Print the postcard facing you.' },
      { snap: [4.5, 4.0, -2.5], say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -2.2], yaw: 0 },
      { launch: [0.5, 2.0, -13.9], via: [0.5, 2.0, -5.0], settle: 4, say: 'Throw it through the postcard: it shoots out of the spot and smashes the window.' },
      { walkin: true, yaw: 0, say: 'Now run straight in after it: you come out of the spot running, facing the hole.' },
      { go: [0.5, -16.6], say: 'Through the hole before the glass grows back.' },
      { exit: true },
    ],
    nope: [
      // carry the throw in: the light leak fogs it, and the window never breaks
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -5.0], yaw: 0 }, { snap: [4.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { walkin: true, yaw: 0 }, { launch: [0.5, 2.0, -13.9] }, { go: [0.5, -16.6] }, { exit: true }],
      // throw, then take your time: the window has grown back
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -5.0], yaw: 0 }, { snap: [4.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -2.2], yaw: 0 }, { launch: [0.5, 2.0, -13.9], via: [0.5, 2.0, -5.0], settle: 200 }, { walkin: true, yaw: 0 }, { go: [0.5, -16.6] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -15, 6, 0, 7], [-1, -18, 1, -16, 7]]);
      B.start(0, 1, -1);
      const hall = B.spot(-4, 1, -2, 180);
      B.chute(4, -3, 1, 8);
      // a glass wall seals the north half; its photo spot stands in a light leak, its arrow on the way out
      B.glass(-6, 1, -9, 6, 7, -9, { axis: 'z' });
      B.spot(0, 1, -11, 0);
      B.leak(-1, 1, -12, 1, 4, -10);
      B.card(4, 1, -13, -90, hall, { locked: true });
      // the only way out of the sealed room is a teal window that grows back fast
      B.solid(-6, 1, -15, -2, 7, -15); B.solid(2, 1, -15, 6, 7, -15); B.solid(-1, 4, -15, 1, 7, -15);
      B.fragile(-1, 1, -15, 1, 3, -15, { axis: 'z', heal: 2.2 });
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Rising Action', film: 1, motion: true, postcard: true, diff: 7,
    hint: 'The plates are up in the sealed loft, over a frosted lid, and the shaft’s photo spot hangs over the void where nobody can stand. A postcard turns a throw but never tips it: whatever goes in climbing comes out climbing.',
    sol: [
      { snap: [0.5, 1.6, -10.5], say: 'Photograph the photo spot hanging in the shaft.' },
      { tp: [0.5, 1.02, -1.5], yaw: 0 },
      { print: [0.5, 4.0, -4.0], yaw: 0, say: 'Hang the postcard high in the air, facing you.' },
      { snap: [-4.5, 4.0, -2.5], say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -2.9], yaw: 0 },
      { launch: [0.5, 4.0, -14.5], via: [0.5, 4.0, -4.0], final: true, say: 'Stand under the card and throw the crate up into it: it comes out of the spot still climbing, smashes the lid and lands on the plates in the loft.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // a card on the floor, thrown into flat: the crate comes out flat, under the lid
      [{ snap: [0.5, 1.6, -10.5] }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { print: [0.5, 2.02, -4.0], yaw: 0 }, { snap: [-4.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -1.0], yaw: 0 }, { launch: [0.5, 2.0, -14.5], via: [0.5, 2.0, -4.0] }, { wait: 1.5 }, { exit: true }],
      // walk in and throw from the spot: it hangs over the void
      [{ snap: [0.5, 1.6, -10.5] }, { tp: [0.5, 1.02, -1.5], yaw: 0 }, { print: [0.5, 2.02, -4.0], yaw: 0 }, { snap: [-4.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -2.6], yaw: 0 }, { walkin: true, yaw: 0 }, { launch: [0.5, 3.4, -12.0] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -17, 6, 0, 11], [7, -4, 10, -2, 6]], { pits: [[-2, -13, 2, -10]] });
      B.start(0, 1, -1);
      B.chute(-5, -3, 1, 9);
      // a glass wall seals the shaft; its photo spot hangs over the void, where nobody can stand
      B.glass(-6, 1, -9, 6, 11, -9, { axis: 'z' });
      B.spot(0, 1, -11, 0);
      // a frosted lid over the spot, and the loft above it with a floor of plates
      B.fragile(-2, 3, -13, 2, 3, -10, { axis: 'y', face: 'max' });
      B.solid(-6, 3, -17, 6, 3, -14); B.solid(-6, 3, -13, -3, 3, -10); B.solid(3, 3, -13, 6, 3, -10);
      for (let x = -2; x <= 2; x++) for (let z = -16; z <= -14; z++) B.plate('p1', x, 4, z);
      B.door(['p1'], 7, 1, -4, 7, 3, -2); B.solid(7, 4, -4, 7, 6, -2);
      B.exit(9, 1, -3);
    },
  },
  {
    name: 'Retake', film: 1, motion: true, diff: 8,
    hint: 'The two teal windows are one window: both have to break at once or they grow back, and the chute only has one crate out at a time. A crate that has just been thrown is still a moving crate.',
    sol: [
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -4.5], yaw: 0 },
      { launch: [0.5, 2.0, -8.95], settle: 14, say: 'Throw it at the north window. It smashes through and flies on down the tunnel behind.' },
      { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs[__shutter.L.objs.length - 1])', say: 'Photograph it again while it is still flying: the photo keeps its speed.' },
      { launch: [5.95, 2.0, -4.5], say: 'Turn and throw it at the east window before the first one grows back.' },
      { wait: 1.5, say: 'Both windows stay broken, and both beams reach their targets.' },
      { exit: true },
    ],
    nope: [
      // one window at a time, fetching a fresh crate in between: the first window has grown back
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -4.5], yaw: 0 }, { launch: [0.5, 2.0, -8.95] }, { until: 'T.fastIn(-10)', t: 10 }, { snap: 'crate' }, { tp: [0.5, 1.02, -4.5], yaw: 0 }, { launch: [5.95, 2.0, -4.5] }, { wait: 1.5 }, { exit: true }],
      // catch it in flight, but take your time over the second throw: the north window has grown back
      [{ snap: 'crate' }, { tp: [0.5, 1.02, -4.5], yaw: 0 }, { launch: [0.5, 2.0, -8.95], settle: 14 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs[__shutter.L.objs.length - 1])' },
        { wait: 1.8 }, { launch: [5.95, 2.0, -4.5] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -10, 5, 0, 7], [-1, -21, 1, -11, 7], [6, -6, 17, -4, 7], [-10, -3, -7, -1, 7]]);
      B.start(0, 1, -1);
      B.chute(-4, -3, 1, 8);
      // the north window, with a long tunnel behind it and a beam coming down the tunnel to a target hanging inside the room
      B.solid(-6, 1, -10, -2, 7, -10); B.solid(2, 1, -10, 5, 7, -10); B.solid(-1, 5, -10, 1, 7, -10);
      B.fragile(-1, 1, -10, 1, 4, -10, { axis: 'z', group: 'w', heal: 1.5 });
      B.emitter(0, 4, -21, 180, { locked: true });
      B.receptor('rA', 0, 4, -9); B.solid(0, 5, -9, 0, 7, -9, 'trim');
      // the east window, the same again
      B.solid(6, 1, -3, 6, 7, 0); B.solid(6, 1, -10, 6, 7, -7); B.solid(6, 5, -6, 6, 7, -4);
      B.fragile(6, 1, -6, 6, 4, -4, { axis: 'x', group: 'w', heal: 1.5 });
      B.emitter(17, 4, -5, 90, { locked: true });
      B.receptor('rB', 5, 4, -5); B.solid(5, 5, -5, 5, 7, -5, 'trim');
      B.door(['rA', 'rB'], -7, 1, -3, -7, 3, -1); B.solid(-7, 4, -3, -7, 7, -1);
      B.exit(-9, 1, -2);
    },
  },
  {
    name: 'Pass It On', film: 1, motion: true, copy: true, diff: 8,
    hint: 'Three cubbies, three plates, one frame of film, and the amber door won’t let you back to the chute. Double-X copies keep the speed of whatever they copy, and a crate in mid-throw is moving.',
    sol: [
      { snap: 'crate', say: 'Copy the falling crate: the only throw you can carry through the amber door.' },
      { go: [0.5, -5.5] }, { go: [0.5, -8.0], say: 'Go through the one-way door. It locks behind you.' },
      { go: [-4.5, -8.0] },
      { launch: [-4.5, 3.3, -11.6], settle: 6, say: 'Throw it at the left cubby’s frosted window…' },
      { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs[__shutter.L.objs.length - 1])', say: '…and copy it while it is still flying. The original smashes in and lands on the plate; the copy is your next throw.' },
      { wait: 1 },
      { go: [0.5, -8.0] },
      { launch: [0.5, 3.3, -11.6], settle: 6, say: 'Throw the copy at the middle window, and copy that one in flight too.' },
      { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs[__shutter.L.objs.length - 1])' },
      { wait: 1 },
      { go: [5.5, -8.0] },
      { launch: [5.5, 3.3, -11.6], say: 'And the last one into the right cubby.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // copy a crate once it has landed: the copy is standing still and can't break the next window
      [{ snap: 'crate' }, { go: [0.5, -5.5] }, { go: [0.5, -8.0] }, { go: [-4.5, -8.0] }, { launch: [-4.5, 3.3, -11.6], settle: 180 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs[__shutter.L.objs.length - 1])' },
        { go: [0.5, -8.0] }, { launch: [0.5, 3.3, -11.6] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -4, 4, 0, 7], [-1, -5, 1, -5, 7], [-7, -15, 7, -6, 7], [8, -9, 11, -7, 7]]);
      B.start(0, 1, -1);
      B.chute(-3, -3, 1, 8);
      B.door([], -1, 1, -5, 1, 3, -5, { oneway: true }); B.solid(-1, 4, -5, 1, 7, -5);
      // three cubbies in the far wall, each behind a frosted window, each floored with plates
      B.solid(-7, 1, -13, 7, 1, -13); B.solid(-7, 5, -13, 7, 7, -13);
      B.solid(-7, 2, -13, -7, 4, -13); B.solid(-3, 2, -13, -2, 4, -13); B.solid(2, 2, -13, 3, 4, -13); B.solid(7, 2, -13, 7, 4, -13);
      B.fragile(-6, 2, -13, -4, 4, -13, { axis: 'z', face: 'max' });
      B.fragile(-1, 2, -13, 1, 4, -13, { axis: 'z', face: 'max' });
      B.fragile(4, 2, -13, 6, 4, -13, { axis: 'z', face: 'max' });
      B.solid(-3, 1, -15, -2, 7, -14); B.solid(2, 1, -15, 3, 7, -14);
      for (const [id, x0, x1] of [['pA', -7, -4], ['pB', -1, 1], ['pC', 4, 7]]) for (let x = x0; x <= x1; x++) for (let z = -15; z <= -14; z++) B.plate(id, x, 1, z);
      B.door(['pA', 'pB', 'pC'], 8, 1, -9, 8, 3, -7); B.solid(8, 4, -9, 8, 7, -7);
      B.exit(10, 1, -8);
    },
  },
  {
    name: 'Excess Baggage', film: 2, motion: true, zoom: true, postcard: true, diff: 8,
    hint: 'Both teal panes in the vault have to break at once, and the pillar between them is wider than a crate. Nobody can stand on a photo spot over the void, but a postcard only cares that the middle of what you throw goes through it.',
    sol: [
      { snap: [0.5, 1.6, -10.5], say: 'Photograph the photo spot hanging over the void in the vault.' },
      { zprint: [0.5, 2.02, -5.5], scale: 1.0, yaw: 0, from: [0, 1], say: 'Print the postcard at its usual size, facing you.' },
      { tp: [-2.55, 1.02, -2.5], yaw: 90 },
      { until: '(o => o && Math.abs(o.body.position.y - 2.62) < 0.12 && o.body.velocity.y < -8)(__shutter.L.objs.find((q) => q.chute))', t: 6 },
      { snap: [-3.5, 2.55, -2.5], say: 'Photograph the falling crate from right up against the chute, so it prints big.' },
      { tp: [0.5, 1.02, -2.0], yaw: 0 },
      { launch: [0.5, 2.4, -12.24], via: [0.5, 2.0, -5.5], scale: 1.7, say: 'Throw the big crate into the little postcard: only its middle has to fit. It comes out in the vault and hits both panes at once.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // a crate its usual size breaks one pane, which grows straight back
      [{ snap: [0.5, 1.6, -10.5] }, { zprint: [0.5, 2.02, -5.5], scale: 1.0, yaw: 0, from: [0, 1] }, { tp: [-1.9, 1.02, -2.5], yaw: 90 },
        { until: '(o => o && Math.abs(o.body.position.y - 2.62) < 0.12)(__shutter.L.objs.find((q) => q.chute))', t: 6 }, { snap: [-3.5, 2.55, -2.5] },
        { tp: [0.5, 1.02, -2.0], yaw: 0 }, { launch: [0.5, 2.4, -12.5], via: [0.5, 2.0, -5.5] }, { wait: 1.5 }, { exit: true }],
      // walk into the card yourself: the spot hangs over the void
      [{ snap: [0.5, 1.6, -10.5] }, { zprint: [0.5, 2.02, -5.5], scale: 1.0, yaw: 0, from: [0, 1] }, { tp: [0.5, 1.02, -4.0], yaw: 0 }, { walkin: true, yaw: 0 }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [7, -4, 10, -2, 7]], { pits: [[-2, -12, 2, -10]] });
      B.start(0, 1, -1);
      // a short chute: its crate is never far from eye level
      B.chute(-4, -3, 1, 5);
      // a glass wall seals the vault; its photo spot hangs over the void
      B.glass(-6, 1, -9, 6, 7, -9, { axis: 'z' });
      B.spot(0, 1, -11, 0);
      // at the back of the vault, two teal panes, one window, with a pillar between them wider than a crate
      B.solid(-6, 1, -14, -3, 7, -14); B.solid(3, 1, -14, 6, 7, -14); B.solid(-2, 5, -14, 2, 7, -14);
      B.solid(0, 1, -14, 0, 4, -14);
      B.fragile(-2, 1, -14, -1, 4, -14, { axis: 'z', face: 'max', group: 'w', heal: 0.8 });
      B.fragile(1, 1, -14, 2, 4, -14, { axis: 'z', face: 'max', group: 'w', heal: 0.8 });
      // two beams, one through each pane, to targets behind them
      B.emitter(-2, 4, -10, 0, { locked: true }); B.emitter(1, 4, -10, 0, { locked: true });
      B.receptor('r1', -2, 4, -16); B.receptor('r2', 1, 4, -16);
      B.door(['r1', 'r2'], 7, 1, -4, 7, 3, -2); B.solid(7, 4, -4, 7, 7, -2);
      B.exit(9, 1, -3);
    },
  },
  {
    name: 'Layover', film: 1, motion: true, postcard: true, diff: 9,
    hint: 'The plates are in a vault you can’t see, and the only way in is the postcard standing over the void in the glass room. A throw can go through more than one postcard, and it leaves each spot at the angle it went into the card before.',
    sol: [
      { snap: [0.5, 3.6, -11.5], say: 'Photograph the photo spot hanging high over the void in the glass room.' },
      { print: [0.5, 2.02, -6.0], yaw: 0, say: 'Print the postcard facing you.' },
      { snap: [-4.5, 4.0, -2.5], say: 'Photograph the falling crate.' },
      { tp: [3.5, 1.02, -3.5], yaw: 45 },
      { launch: [-11.5, 1.0, -13.0], via: [0.5, 2.0, -6.0], say: 'From off to the right, throw it into your card at a slant: it comes out of the spot heading for the other postcard, goes through that too, and lands on the plates in the hidden vault.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // straight through: out of the spot and into the far wall, nowhere near the other card
      [{ snap: [0.5, 3.6, -11.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { snap: [-4.5, 4.0, -2.5] }, { tp: [0.5, 1.02, -2.0], yaw: 0 }, { launch: [0.5, 2.0, -18.5], via: [0.5, 2.0, -6.0] }, { wait: 1.5 }, { exit: true }],
      // walk through yourself: that spot hangs over the void
      [{ snap: [0.5, 3.6, -11.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { tp: [0.5, 1.02, -4.0], yaw: 0 }, { walkin: true, yaw: 0 }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -19, 7, 0, 7], [-14, -19, -9, -11, 5], [8, -4, 11, -2, 7]], { pits: [[-7, -19, 7, -11]] });
      B.start(0, 1, -1);
      B.chute(-5, -3, 1, 8);
      // the glass room: no floor, a photo spot hanging high over it, and a postcard to somewhere else far across it
      B.glass(-7, 1, -10, 7, 7, -10, { axis: 'z' });
      B.spot(0, 3, -12, 0);
      // the hidden vault to the west, behind a solid wall: a spot facing a floor of plates
      B.solid(-8, 1, -19, -8, 7, -11);
      const vault = B.spot(-12, 1, -13, 0);
      B.card(-6, 1, -18, 45, vault, { locked: true });
      for (let x = -13; x <= -10; x++) for (let z = -19; z <= -13; z++) B.plate('p1', x, 1, z);
      B.door(['p1'], 8, 1, -4, 8, 3, -2); B.solid(8, 4, -4, 8, 7, -2);
      B.exit(10, 1, -3);
    },
  },
  {
    name: 'Top Shelf', film: 1, motion: true, zoom: true, postcard: true, diff: 9,
    hint: 'The plates are up on the shelf, over a glass canopy, and the tower’s photo spot hangs over the void under it. Whatever goes into a postcard comes out of the spot as high above it as it went into the card, and on Zoom film a postcard can be as tall as you print it.',
    sol: [
      { snap: [0.5, 1.6, -11.5], say: 'Photograph the photo spot in the tower.' },
      { zprint: [0.5, 4.02, -5.0], scale: 3.0, yaw: 0, from: [0.7, 1], say: 'Back right off and print the postcard far away: it stands three times as tall.' },
      { snap: [-4.5, 4.0, -1.5], say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -0.5], yaw: 0 },
      { launch: [0.5, 5.5, -15.0], via: [0.5, 5.5, -5.0], say: 'Throw it high into the top of the giant postcard: it comes out of the spot just as high, over the canopy, and lands on the shelf.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // a postcard its usual size: whatever goes in comes out under the canopy
      [{ snap: [0.5, 1.6, -11.5] }, { zprint: [0.5, 2.02, -5.0], scale: 1.0, yaw: 0, from: [0, 1] }, { snap: [-4.5, 4.0, -1.5] }, { tp: [0.5, 1.02, -2.4], yaw: 0 }, { launch: [0.5, 5.5, -15.0], via: [0.5, 2.0, -5.0] }, { wait: 1.5 }, { exit: true }],
      // into the giant card low down: out of the spot low down
      [{ snap: [0.5, 1.6, -11.5] }, { zprint: [0.5, 4.02, -5.0], scale: 3.0, yaw: 0, from: [0.7, 1] }, { snap: [-4.5, 4.0, -1.5] }, { tp: [0.5, 1.02, -0.5], yaw: 0 }, { launch: [0.5, 1.5, -13.6], via: [0.5, 2.0, -5.0] }, { wait: 1.5 }, { exit: true }],
      // walk in: the spot hangs over the void
      [{ snap: [0.5, 1.6, -11.5] }, { zprint: [0.5, 4.02, -5.0], scale: 3.0, yaw: 0, from: [0.7, 1] }, { tp: [0.5, 1.02, -3.0], yaw: 0 }, { walkin: true, yaw: 0 }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -16, 7, 3, 10], [8, -4, 11, -2, 6]], { pits: [[-3, -14, 3, -11]] });
      B.start(0, 1, 1);
      B.chute(-5, -2, 1, 9);
      // the tower behind glass: a photo spot hanging over the void, a glass canopy over it, and a high shelf of plates
      B.glass(-7, 1, -10, 7, 10, -10, { axis: 'z' });
      B.spot(0, 1, -12, 0);
      B.glass(-7, 3, -14, 7, 3, -11, { axis: 'y' });
      B.solid(-7, 1, -16, 7, 4, -15);
      for (let x = -2; x <= 2; x++) for (let z = -16; z <= -15; z++) B.plate('p1', x, 5, z);
      B.door(['p1'], 8, 1, -4, 8, 3, -2); B.solid(8, 4, -4, 8, 6, -2);
      B.exit(10, 1, -3);
    },
  },
  {
    name: 'Blockbuster', film: 1, motion: true, postcard: true, diff: 10,
    hint: 'Only a crate going flat out gets through all five teal panes, and nothing falls far in a room this low, but the shaft under the glass floor goes down a long way. The vault’s arrow points at a wall: a postcard turns a throw by the angle it went in.',
    sol: [
      { snap: [5.5, 1.6, -11.5], say: 'Photograph the photo spot hanging over the void in the vault.' },
      { print: [4.5, 2.02, -6.0], yaw: 0, say: 'Print that postcard facing you, over on the right.' },
      { tp: [-4.5, 1.02, -3.6], yaw: 0 },
      { snap: [-4.5, -1.5, -5.5], say: 'Look down through the glass floor and photograph the photo spot hanging in the shaft.' },
      { print: [-2.0, 2.02, -6.4], yaw: -90, say: 'Print that one beside the glass, facing the shaft.' },
      { tp: [-4.5, 1.02, -6.4], yaw: -90 },
      { snap: [-6.5, 1.5, -8.5], say: 'Stand on the glass and photograph the crate in the glass tube.' },
      { print: [-2.0, 1.47, -6.4], settle: 1, say: 'Print it right into the shaft’s postcard: it drops out of the spot under your feet, straight down the shaft.' },
      { until: '(o => o && o.body.position.y < -9 && o.body.velocity.y < -18.3)(__shutter.L.objs.find((q) => q.kind === \'crate\'))', t: 3 },
      { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === \'crate\'))', say: 'Look straight down and photograph it deep in the shaft, flat out.' },
      { tp: [1.3, 1.02, -2.8], yaw: -45 },
      { launch: [5.5, 1.45, -15.9], via: [4.5, 2.0, -6.0], final: true, say: 'From off to the left, throw it into the vault’s postcard at a slant: the slant turns it straight onto the window, and it goes through all five panes.' },
      { wait: 2, say: 'The beam reaches its target through the open window, and the way out opens.' },
      { exit: true },
    ],
    nope: [
      // caught the moment it drops out of the spot: it isn't going fast yet
      [{ snap: [5.5, 1.6, -11.5] }, { print: [4.5, 2.02, -6.0], yaw: 0 }, { tp: [-4.5, 1.02, -3.6], yaw: 0 }, { snap: [-4.5, -1.5, -5.5] }, { print: [-2.0, 2.02, -6.4], yaw: -90 },
        { tp: [-4.5, 1.02, -6.4], yaw: -90 }, { snap: [-6.5, 1.5, -8.5] }, { print: [-2.0, 1.47, -6.4], settle: 1 },
        { until: '(o => o && o.body.position.y < -2.8)(__shutter.L.objs.find((q) => q.kind === \'crate\'))', t: 2 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === \'crate\'))' },
        { tp: [1.3, 1.02, -2.8], yaw: -45 }, { launch: [5.5, 2.4, -12.6], via: [4.5, 2.0, -6.0] }, { wait: 2 }, { exit: true }],
      // dropped from as high as this room allows and caught just before it lands: still not fast enough for five panes
      [{ snap: [5.5, 1.6, -11.5] }, { print: [4.5, 2.02, -6.0], yaw: 0 }, { snap: [-6.5, 1.5, -8.5] }, { tp: [-1.0, 1.02, -3.0], yaw: 0 }, { print: [-1.0, 3.5, -5.0], settle: 1 },
        { until: '(o => o && o.body.position.y < 1.9 && o.body.velocity.y < -1)(__shutter.L.objs.find((q) => q.kind === \'crate\'))', t: 3 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === \'crate\'))' },
        { tp: [1.3, 1.02, -2.8], yaw: -45 }, { launch: [5.5, 2.4, -12.6], via: [4.5, 2.0, -6.0] }, { wait: 2 }, { exit: true }],
      // flat out, but thrown straight into the card: it leaves the spot along its arrow, into the wall
      [{ snap: [5.5, 1.6, -11.5] }, { print: [4.5, 2.02, -6.0], yaw: 0 }, { tp: [-4.5, 1.02, -3.6], yaw: 0 }, { snap: [-4.5, -1.5, -5.5] }, { print: [-2.0, 2.02, -6.4], yaw: -90 },
        { tp: [-4.5, 1.02, -6.4], yaw: -90 }, { snap: [-6.5, 1.5, -8.5] }, { print: [-2.0, 1.47, -6.4], settle: 1 },
        { until: '(o => o && o.body.position.y < -9 && o.body.velocity.y < -18.3)(__shutter.L.objs.find((q) => q.kind === \'crate\'))', t: 3 },
        { js: '(o => { T.aimAt(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.tryCapture(); __shutter.step(2); return T.photo(); })(__shutter.L.objs.find((q) => q.kind === \'crate\'))' },
        { tp: [4.5, 1.02, -3.0], yaw: 0 },
        { js: '(() => { const S = __shutter, ph = S.L.photos[S.L.sel]; ph.dist = 1.6 / ph.relPos.length(); S.setView(0, 0.03); S.step(1); S.tryPrint(); S.step(90); return T.photo(); })()' },
        { wait: 2 }, { exit: true }],
      // walk into the vault's card yourself: that spot hangs over the void
      [{ snap: [5.5, 1.6, -11.5] }, { print: [4.5, 2.02, -6.0], yaw: 0 }, { tp: [4.5, 1.02, -4.0], yaw: 0 }, { walkin: true, yaw: 0 }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-8, -10, 8, 0, 3], [3, -16, 8, -11, 7], [9, -3, 12, -1, 3]], { pits: [[-6, -7, -4, -5], [3, -13, 8, -11]] });
      B.start(0, 1, -1);
      // a crate sitting in a glass tube
      B.chute(-7, -9, 1, 3, { loop: false });
      // a shaft going down a long way, a glass floor over it, and its photo spot hanging just under the glass
      B.solid(-7, -20, -8, -3, -1, -8); B.solid(-7, -20, -4, -3, -1, -4); B.solid(-7, -20, -7, -7, -1, -5); B.solid(-3, -20, -7, -3, -1, -5);
      B.glass(-6, 0, -7, -4, 0, -5, { axis: 'y', face: 'max' });
      B.spot(-5, -2.5, -6, 0);
      // the vault: glass at the front, a photo spot hanging over the void with its arrow on the west wall, and the window due north of it
      B.glass(3, 1, -11, 8, 7, -11, { axis: 'z', face: 'max' });
      B.spot(5, 1, -12, 45);
      B.solid(3, 1, -15, 3, 7, -14); B.solid(7, 1, -15, 8, 7, -14); B.solid(4, 5, -15, 6, 7, -14);
      for (const [z, f] of [[-14, 'max'], [-14, 'mid'], [-14, 'min'], [-15, 'max'], [-15, 'mid']]) B.fragile(4, 1, z, 6, 4, z, { axis: 'z', face: f === 'mid' ? undefined : f, group: 'w', heal: 1.5 });
      // a beam waits behind the window for it to open
      B.emitter(5, 4, -16, 180, { locked: true });
      B.receptor('r1', 5, 4, -13);
      B.door(['r1'], 9, 1, -3, 9, 3, -1);
      B.exit(11, 1, -2);
    },
  },
  {
    name: 'Picture Rail', film: 1, postcard: true, diff: 2,
    hint: 'That postcard leads somewhere, but it stands too high to step into. A postcard is a print like any other.',
    sol: [
      { snap: [-2.5, 5.0, -5.5], say: 'Photograph the postcard up on the shelf: it comes down into your film.' },
      { print: [0.5, 2.02, -4.0], yaw: 0, say: 'Print it on the floor in front of you.' },
      { walkin: true, yaw: 0, say: 'Walk into it.' },
      { exit: true },
    ],
    nope: [
      // jump at the postcard where it stands
      [{ go: [-1.5, -5.5] }, { face: 90 }, { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14' }, { wait: 1.2 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
    ],
    build(B) {
      B.plan([[-4, -13, 4, 0, 7]]);
      B.start(0, 1, 0, 20);
      // the room behind the back wall: no way in, and no way to see in. The postcard on the shelf shows it.
      B.solid(-4, 1, -9, 4, 7, -9);
      const sp = B.spot(0, 1, -11, 0);
      B.exit(0, 1, -12);
      // a shelf three metres up the left wall, with a postcard standing on it
      B.solid(-4, 1, -7, -3, 3, -5);
      B.card(-3, 4, -6, 90, sp);
    },
  },
  {
    name: 'Aperture', film: 1, postcard: true, diff: 3,
    hint: 'The round window only opens while someone stands on the plate, and nobody can climb up to it. You only need to see a photo spot once.',
    sol: [
      { go: [0.5, -2.5], say: 'Stand on the plate: the round window high in the wall opens.' },
      { snap: [0.5, 5.8, -10.5], say: 'Through it you can see a photo spot in the loft. Photograph it.' },
      { go: [0.5, -0.5] },
      { print: [0.5, 2.02, -4.5], yaw: 0, say: 'Step off the plate (the window shuts) and print the postcard.' },
      { walkin: true, yaw: 0, say: 'Walk into it, up to the loft.' },
      { exit: true },
    ],
    nope: [
      [{ go: [0.5, -7.6] }, { js: '__shutter.P.jumpBuf = 0.14' }, { wait: 1 }, { exit: true }],
      [{ go: [0.5, -2.5] }, { go: [0.5, -7.6], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -14, 5, 0, 7]]);
      B.start(0, 1, 0);
      B.plate('p1', 0, 1, -3);
      // the wall, with a round window three metres up that opens while the plate is held
      B.solid(-5, 1, -8, 5, 3, -8);
      B.solid(-5, 4, -8, -2, 7, -8); B.solid(2, 4, -8, 5, 7, -8); B.solid(-1, 7, -8, 1, 7, -8);
      B.door(['p1'], -1, 4, -8, 1, 6, -8);
      // the loft behind it
      B.solid(-5, 1, -14, 5, 3, -9);
      B.spot(0, 4, -11, 0);
      B.exit(0, 4, -13);
    },
  },
  {
    name: 'Safelight', film: 1, postcard: true, diff: 3,
    hint: 'Nothing standing in red light shows up on film, and the crate is out of reach anyway. Anything that is inside a postcard when it is printed goes to the spot.',
    sol: [
      { snap: [0.5, 1.6, -7.5], say: 'Photograph the photo spot at the foot of the ledge.' },
      { print: [4.5, 5.02, -3.5], yaw: 90, say: 'Print the postcard right over the crate on the red shelf: the crate goes through and lands by the ledge.' },
      { wait: 1 },
      { go: [0.5, -6.0] },
      { go: [0.5, -10.5], jump: true, say: 'Climb the crate, then the ledge.' },
      { exit: true },
    ],
    nope: [
      // the crate can't be photographed in the red light
      [{ snap: [4.5, 4.45, -3.5] }, { print: [0.5, 1.47, -8.4] }, { go: [0.5, -10.5], jump: true }, { exit: true }],
      // walk into the spot yourself: still at the foot of the ledge
      [{ snap: [0.5, 1.6, -7.5] }, { print: [-2.5, 2.02, -3.5], yaw: 0 }, { tp: [-2.5, 1.02, -1.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [0.5, -10.5], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 8]]);
      B.start(0, 1, 0);
      // a ledge two metres high across the back, the way out on top
      B.solid(-5, 1, -12, 5, 2, -10);
      B.exit(0, 3, -11);
      B.spot(0, 1, -8, 0);
      // a crate on a shelf three metres up, under a red safelight
      B.solid(4, 1, -5, 5, 3, -3);
      B.crate(4, 4, -4);
      B.safelight(4, 4, -5, 5, 6, -3);
    },
  },
  {
    name: 'Perch', film: 1, postcard: true, diff: 4,
    hint: 'The photo spot is on a perch too small to stand on, over the void. You come out of a postcard moving just as you went in.',
    sol: [
      { snap: [0.5, 1.6, -9.5], say: 'Photograph the photo spot on the perch.' },
      { print: [0.5, 2.02, -4.5], yaw: 0, say: 'Print the postcard in the hall.' },
      { tp: [0.5, 1.02, -0.5], yaw: 0 },
      { js: '__shutter.keys.KeyW = true', say: 'Take a run at it, and jump just before you reach it.' },
      { until: '__shutter.player.position.z < -3.6', t: 3 },
      { js: '__shutter.P.jumpBuf = 0.14' },
      { until: '__shutter.player.position.z < -8', t: 2, say: 'You come out of the spot still in the air, and land on the far side.' },
      { wait: 1.0 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // just walk in: you come out beside the perch and drop into the void
      [{ snap: [0.5, 1.6, -9.5] }, { print: [0.5, 2.02, -4.5], yaw: 0 }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { walkin: true, yaw: 0 }, { js: '__shutter.keys.KeyW = true' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // a standing jump into it, no run-up
      [{ snap: [0.5, 1.6, -9.5] }, { print: [0.5, 2.02, -4.5], yaw: 0 }, { tp: [0.5, 1.02, -3.7], yaw: 0 }, { js: '__shutter.P.jumpBuf = 0.14' }, { wait: 0.05 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
    ],
    build(B) {
      B.plan([[-5, -16, 5, 0, 7]], { pits: [[-5, -12, 5, -8]] });
      B.start(0, 1, 0);
      B.glass(-5, 1, -7, 5, 7, -7, { axis: 'z' });
      // a thin perch in the void, with the photo spot on top, pointing at the far side
      B.box([0.35, -4, -9.65], [0.65, 1, -9.35], 'trim');
      B.spot(0, 1, -10, 0);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Reply Paid', film: 1, postcard: true, diff: 4,
    hint: 'The pit is full of light leak: whatever film you carry down there fogs, and you can’t climb back out. Think about how you will leave before you go.',
    sol: [
      { snap: [-3.5, 1.6, -1.5], say: 'Photograph the photo spot in the hall.' },
      { go: [2.5, -7.6] },
      { print: [2.5, 0.02, -11.0], yaw: 180, say: 'Print it down in the pit before you go down there: it is your way back up.' },
      { go: [-2.5, -7.6] },
      { go: [-2.5, -10.0], say: 'Jump down behind the gray crate.' },
      { go: [-2.5, -14.8], n: 300, say: 'Shove it under the low shelf at the far end, onto the plates. The door in the hall opens.' },
      { go: [-0.5, -14.0] },
      { go: [2.5, -14.0] },
      { walkin: true, yaw: 180, say: 'Walk into your postcard: it takes you back up to the hall.' },
      { exit: true },
    ],
    nope: [
      // go down without a way back
      [{ go: [-2.5, -7.6] }, { go: [-2.5, -10.0] }, { go: [-2.5, -14.8], n: 300 }, { snap: [-3.5, 1.6, -1.5] }, { go: [2.5, -13.0] }, { print: [2.5, 0.02, -11.0], yaw: 180 }, { go: [2.5, -14.0] }, { walkin: true, yaw: 180 }, { exit: true }],
      // send the gray crate up to the hall instead
      [{ snap: [-3.5, 1.6, -1.5] }, { go: [-2.5, -7.6] }, { print: [-2.5, 0.02, -11.5], yaw: 0 }, { wait: 1 }, { exit: true }],
      // a postcard can't hold the plates down: there's no room for one under the shelf
      [{ snap: [-3.5, 1.6, -1.5] }, { go: [-2.5, -7.6] }, { print: [-2.5, 0.02, -15.5], yaw: 0 }, { wait: 1 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [-10, -5, -7, -3, 7]], { pits: [[-6, -16, 6, -9]] });
      B.start(0, 1, 0);
      const hall = B.spot(-4, 1, -2, 90);
      // the pit: two metres down, a gray crate, plates along the far wall, and light leak all through it
      B.solid(-6, -2, -16, 6, -2, -9, 'floor');
      B.solid(-6, -2, -8, 6, -1, -8);
      B.leak(-6, -1, -16, 6, -1, -9);
      B.crate(-3, -1, -12, { pinned: true });
      B.plate('p1', -4, -1, -16); B.plate('p1', -3, -1, -16); B.plate('p1', -2, -1, -16);
      // a low shelf over the plates: room for a crate under it, not for you or a postcard
      B.box([-6, 0.5, -16], [7, 1, -15]);
      // the way out, behind a door the plates open
      B.door(['p1'], -7, 1, -5, -7, 3, -3); B.solid(-7, 4, -5, -7, 7, -3);
      B.exit(-9, 1, -4);
    },
  },
  {
    name: 'Off Axis', film: 1, postcard: true, diff: 5,
    hint: 'A beam that goes into a postcard comes out of the photo spot, and it leaves the spot at the same angle it met the card.',
    sol: [
      { snap: [2.5, 1.6, -7.5], say: 'Photograph the photo spot in the glass room.' },
      { print: [0.5, 2.02, -3.5], yaw: -45, say: 'Hang the postcard in the beam, turned at an angle to it.' },
      { go: [2.0, -2.5] }, { go: [2.0, -5.0], say: 'The beam comes out of the spot at that same angle, past the pillar and into the target. Walk round behind the card.' },
      { go: [-0.5, -5.5] }, { go: [-2.0, -12.0] },
      { exit: true },
    ],
    nope: [
      // straight on: the beam runs into the pillar
      [{ snap: [2.5, 1.6, -7.5] }, { print: [0.5, 2.02, -3.5], yaw: -90 }, { go: [2.0, -2.5] }, { go: [2.0, -5.0] }, { go: [-0.5, -5.5] }, { go: [-2.0, -12.0] }, { exit: true }],
      // turned the other way
      [{ snap: [2.5, 1.6, -7.5] }, { print: [0.5, 2.02, -3.5], yaw: -135 }, { go: [2.0, -2.5] }, { go: [2.0, -5.0] }, { go: [-0.5, -5.5] }, { go: [-2.0, -12.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 7], [-3, -20, -1, -17, 7]]);
      B.start(0, 1, 0);
      const hall = B.spot(-4, 1, -1, 0);
      B.emitter(-6, 1, -4, -90, { locked: true });
      // the sealed glass room: a photo spot, a pillar right in front of it, and the target off to one side
      B.glass(1, 1, -16, 1, 7, -7, { axis: 'x' }); B.glass(1, 1, -7, 6, 7, -7, { axis: 'z' });
      B.spot(2, 1, -8, 0);
      B.solid(2, 1, -11, 2, 7, -11);
      B.receptor('r1', 5, 1, -11);
      B.card(5, 1, -15, 0, hall, { locked: true });
      B.door(['r1'], -3, 1, -17, -1, 3, -17); B.solid(-3, 4, -17, -1, 7, -17);
      B.exit(-2, 1, -19);
    },
  },
  {
    name: 'Pillar Box', film: 1, postcard: true, diff: 5,
    hint: 'The way out is under the glass floor of the sealed room, and only a hard knock breaks that glass. Nothing you carry survives the light leak in there. Things come out of a postcard as high above the spot as they went in.',
    sol: [
      { snap: [3.5, 1.6, -9.5], say: 'Photograph the photo spot on the glass floor.' },
      { print: [-1.5, 2.02, -4.5], yaw: 0, say: 'Print the postcard in the hall.' },
      { snap: [-3.5, 1.45, -4.5], say: 'Photograph the crate.' },
      { tp: [-1.5, 1.02, -0.5], yaw: 0 },
      { print: [-1.5, 6.0, -4.6], say: 'Print it high above the postcard, so it drops in through the top: it comes out of the spot high up, falls, and smashes the glass.' },
      { wait: 1.5 },
      { walkin: true, yaw: 0, say: 'Now walk in, and drop through the hole.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // printed into the card at floor level, the crate arrives gently and the glass holds
      [{ snap: [3.5, 1.6, -9.5] }, { print: [-1.5, 2.02, -4.5], yaw: 0 }, { snap: [-3.5, 1.45, -4.5] }, { tp: [-1.5, 1.02, -0.5], yaw: 0 }, { print: [-1.5, 1.47, -4.6] }, { wait: 1.5 }, { walkin: true, yaw: 0 }, { wait: 1.5 }, { exit: true }],
      // carry the crate in yourself: the light leak fogs it
      [{ snap: [3.5, 1.6, -9.5] }, { print: [-1.5, 2.02, -4.5], yaw: 0 }, { snap: [-3.5, 1.45, -4.5] }, { tp: [-1.5, 1.02, -0.5], yaw: 0 }, { walkin: true, yaw: 0 }, { print: [3.5, 4.5, -9.5] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -16, 6, 0, 8]], { pits: [[2, -12, 4, -10]] });
      B.start(0, 1, 0);
      const hall = B.spot(-5, 1, -1, 0);
      B.crate(-4, 1, -5);
      // the sealed glass room: a well under a glass floor, the spot on the glass, light leak all through it
      B.glass(0, 1, -14, 0, 8, -7, { axis: 'x' }); B.glass(6, 1, -14, 6, 8, -7, { axis: 'x' });
      B.glass(1, 1, -14, 5, 8, -14, { axis: 'z' }); B.glass(1, 1, -7, 5, 8, -7, { axis: 'z' });
      B.solid(2, -2, -12, 4, -2, -10, 'floor');
      B.solid(1, -2, -13, 5, -1, -13); B.solid(1, -2, -9, 5, -1, -9); B.solid(1, -2, -12, 1, -1, -10); B.solid(5, -2, -12, 5, -1, -10);
      B.fragile(2, 0, -12, 4, 0, -10, { axis: 'y', face: 'max', frosted: false });
      B.spot(3, 1, -10, 0);
      B.leak(1, 1, -13, 5, 3, -8);
      B.exit(3, -1, -11);
      B.card(1, 1, -12, 90, hall, { locked: true });
    },
  },
  {
    name: 'Clearance', film: 1, postcard: true, diff: 5,
    hint: 'A beam that goes into a postcard comes out of the photo spot as high above it as it went in above the card’s bottom. The target sits just over head height, and the way out is in there too.',
    sol: [
      { snap: [2.5, 1.6, -7.5], say: 'Photograph the photo spot in the glass room.' },
      { print: [0.5, 2.65, -3.5], yaw: -90, say: 'Hang the postcard so the high beam crosses it right near its top edge, picture toward the emitter.' },
      { go: [-2.0, -2.0] }, { go: [-2.0, -3.5] },
      { walkin: true, yaw: -90, say: 'The beam comes out of the spot over your head and lights the target. Walk in under it.' },
      { go: [4.5, -12.0] },
      { exit: true },
    ],
    nope: [
      // standing on the floor, the card is too short to catch the beam at all
      [{ snap: [2.5, 1.6, -7.5] }, { print: [0.5, 2.02, -3.5], yaw: -90 }, { go: [-2.0, -2.0] }, { go: [-2.0, -3.5] }, { walkin: true, yaw: -90 }, { go: [4.5, -12.0] }, { exit: true }],
      // the beam across the middle of the card comes out low, into the wall (and into you)
      [{ snap: [2.5, 1.6, -7.5] }, { print: [0.5, 3.5, -3.5], yaw: -90 }, { wait: 0.5 }, { snap: [2.5, 1.6, -7.5] }, { print: [-3.5, 2.02, -1.5], yaw: 0 }, { tp: [-3.5, 1.02, 0.4], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [4.5, -12.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -14, 6, 0, 8], [3, -18, 5, -15, 8]]);
      B.start(0, 1, 0);
      const hall = B.spot(-4, 1, -1, 180);
      // a beam across the hall, well over your head
      B.solid(-6, 1, -4, -6, 2, -4, 'trim'); B.emitter(-6, 3, -4, -90, { locked: true });
      // the glass room: the spot, a target just over head height behind a low wall, and the way out
      B.glass(1, 1, -14, 1, 8, -7, { axis: 'x' }); B.glass(1, 1, -7, 6, 8, -7, { axis: 'z' });
      B.spot(2, 1, -8, -90);
      B.box([5.0, 1, -8], [5.4, 2.66, -7], 'trim');
      B.receptor('r1', 6, 2, -8);
      B.card(6, 1, -13, 0, hall, { locked: true });
      B.door(['r1'], 3, 1, -15, 5, 3, -15); B.solid(3, 4, -15, 5, 8, -15);
      B.exit(4, 1, -17);
    },
  },
  {
    name: 'Souvenir', film: 1, exposure: true, postcard: true, diff: 6,
    hint: 'The pit is too wide for anything in the hall. Something in the side room isn’t: hold the shutter on it. You can only hold one photo at a time, and you will want to come back.',
    sol: [
      { snap: [-8.5, 1.6, -1.5], say: 'Photograph the photo spot through the window into the side room.' },
      { print: [-2.5, 2.02, -3.5], yaw: 90, say: 'Print the postcard in the hall.' },
      { tp: [-0.5, 1.02, -3.5], yaw: 90 },
      { walkin: true, yaw: 90, say: 'Walk in.' },
      { snap: [-4.5, 1.6, -1.5], say: 'Before anything else, photograph the photo spot back in the hall, through the window.' },
      { print: [-8.5, 2.02, -7.5], yaw: 180, say: 'Print it here: that is your way back. Now your frame is free.' },
      { go: [-9.0, -10.5] }, { go: [-12.0, -10.5] }, { go: [-12.0, -6.0] },
      { expose: 'shuttle', when: 'A', hold: 2.7, say: 'Round the partition, hold the shutter on the shuttle for its whole run.' },
      { go: [-12.0, -10.5] }, { go: [-9.0, -10.5] }, { go: [-8.5, -9.5] },
      { walkin: true, yaw: 180, say: 'Walk back through your postcard, carrying the streak.' },
      { print: [0.5, 1.17, -11.0], yaw: 90, rest: 1.0, say: 'Lay the streak across the pit.' },
      { go: [0.5, -6.0] }, { go: [0.5, -16.0] },
      { exit: true },
    ],
    nope: [
      // the shuttle can't be seen from the hall
      [{ expose: 'shuttle', when: 'A', hold: 2.7 }, { print: [0.5, 1.17, -11.0], yaw: 90, rest: 1.0 }, { go: [0.5, -16.0] }, { exit: true }],
      [{ go: [0.5, -7.6] }, { leap: [0.5, -7.8, 0.5, -16.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -18, 6, 0, 7], [-14, -12, -7, 0, 7]], { pits: [[-6, -14, 6, -9]] });
      B.start(0, 1, 0, 30);
      B.exit(0, 1, -17);
      B.spot(-5, 1, -2, -90);
      // the side room: a glass window onto the hall, a spot by it, and a shuttle hidden behind a partition
      B.solid(-7, 1, -12, -7, 7, -4); B.glass(-7, 1, -3, -7, 7, 0, { axis: 'x' });
      B.spot(-9, 1, -2, 90);
      B.solid(-11, 1, -9, -11, 7, 0);
      B.glassCase(-14, 1, -11, -14, 1, -4);
      B.shuttle([-14, 1.1, -11], [-14, 1.1, -4], { speed: 3, size: [0.8, 0.3, 1] });
    },
  },
  {
    name: 'Dogleg', film: 1, motion: true, postcard: true, diff: 6,
    hint: 'The plates are tucked away to one side in the sealed room, and nothing you carry survives its light leak. A throw comes out of the photo spot at the same angle it went into the card.',
    sol: [
      { snap: [0.5, 1.6, -10.5], say: 'Photograph the photo spot in the sealed room.' },
      { print: [0.5, 2.02, -6.0], yaw: 45, say: 'Print the postcard in the hall, turned at an angle.' },
      { until: 'T.fastIn(-11)', t: 6 },
      { snap: 'crate', say: 'Photograph the falling crate.' },
      { tp: [0.5, 1.02, -2.5], yaw: 0 },
      { launch: [6.5, 1.45, -16.0], via: [0.5, 2.02, -6.0], say: 'Throw it into the angled postcard: it leaves the spot at that angle, round the partition and onto the plates.' },
      { wait: 1.5 },
      { exit: true },
    ],
    nope: [
      // straight through, the crate hits the partition
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' }, { tp: [0.5, 1.02, -2.5], yaw: 0 }, { launch: [6.5, 1.45, -16.0], via: [0.5, 2.02, -6.0] }, { wait: 1.5 }, { exit: true }],
      // carry the throw in yourself: the light leak fogs it
      [{ snap: [0.5, 1.6, -10.5] }, { print: [0.5, 2.02, -6.0], yaw: 0 }, { until: 'T.fastIn(-11)', t: 6 }, { snap: 'crate' }, { tp: [0.5, 1.02, -3.5], yaw: 0 }, { walkin: true, yaw: 0 }, { launch: [6.5, 1.45, -16.0] }, { wait: 1.5 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -20, 6, 0, 8], [7, -5, 9, -3, 8]]);
      B.start(0, 1, 0);
      const hall = B.spot(3, 1, -2, 0);
      B.chute(-5, -3, 1, 8);
      // the sealed room, light-leaked all through: the spot faces a partition, the plates are off to one side
      B.glass(-6, 1, -9, 6, 8, -9, { axis: 'z' });
      B.leak(-6, 1, -20, 6, 4, -10);
      B.spot(0, 1, -11, 0);
      B.solid(-1, 1, -15, 0, 5, -14);
      for (let z = -18; z <= -13; z++) { B.plate('p1', 5, 1, z); B.plate('p1', 6, 1, z); }
      B.card(-5, 1, -12, 90, hall, { locked: true });
      B.door(['p1'], 7, 1, -5, 7, 3, -3); B.solid(7, 4, -5, 7, 8, -3);
      B.exit(8, 1, -4);
    },
  },
  {
    name: 'Photostat', film: 1, copy: true, postcard: true, diff: 6,
    hint: 'The photo spot is in red light, so nobody can photograph it: the postcard on the shelf is the only door to it. Two beams, two targets. On Double-X nothing you print can be taken back, but a beam can always be caught again nearer its emitter.',
    sol: [
      { snap: [-6.5, 5.0, -4.5], say: 'Copy the postcard on the high shelf.' },
      { print: [3.5, 2.02, -2.5], yaw: 45, say: 'Hang the copy in the first beam, turned so the light comes out of the spot toward the left-hand target.' },
      { go: [-1.5, -1.0] }, { go: [-1.5, -4.5], say: 'Cross where the beam no longer reaches.' },
      { snap: [-6.5, 5.0, -4.5], say: 'Copy it again.' },
      { print: [3.5, 2.02, -6.5], yaw: 135, say: 'Hang this one in the second beam, turned the other way: its light goes to the right-hand target.' },
      { go: [-5.5, -8.0] },
      { go: [-5.5, -17.5] },
      { exit: true },
    ],
    nope: [
      // one copy lights only one target
      [{ snap: [-6.5, 5.0, -4.5] }, { print: [3.5, 2.02, -2.5], yaw: 45 }, { go: [-1.5, -1.0] }, { go: [-1.5, -4.5] }, { go: [-5.5, -8.0] }, { go: [-5.5, -17.5] }, { exit: true }],
      // both copies turned the same way
      [{ snap: [-6.5, 5.0, -4.5] }, { print: [3.5, 2.02, -2.5], yaw: 45 }, { go: [-1.5, -1.0] }, { go: [-1.5, -4.5] }, { snap: [-6.5, 5.0, -4.5] }, { print: [3.5, 2.02, -6.5], yaw: 45 }, { go: [-5.5, -8.0] }, { go: [-5.5, -17.5] }, { exit: true }],
      // straight on, both beams hit the pillar
      [{ snap: [-6.5, 5.0, -4.5] }, { print: [3.5, 2.02, -2.5], yaw: 90 }, { go: [-1.5, -1.0] }, { go: [-1.5, -4.5] }, { snap: [-6.5, 5.0, -4.5] }, { print: [3.5, 2.02, -6.5], yaw: 90 }, { go: [-5.5, -8.0] }, { go: [-5.5, -17.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -18, 7, 0, 8], [-7, -22, -5, -19, 8]]);
      B.start(0, 1, 0);
      const hall = B.spot(-3, 1, -1, 0);
      // two beams across the hall, from the east wall
      B.emitter(7, 1, -3, 90, { locked: true });
      B.emitter(7, 1, -7, 90, { locked: true });
      // the glass room: the spot under a safelight, a pillar straight ahead, a target to each side
      B.glass(-3, 1, -9, 4, 8, -9, { axis: 'z' }); B.glass(-3, 1, -16, 4, 8, -16, { axis: 'z' });
      B.glass(-4, 1, -16, -4, 8, -9, { axis: 'x' }); B.glass(5, 1, -16, 5, 8, -9, { axis: 'x' });
      const sp = B.spot(0, 1, -11, 0);
      B.safelight(-1, 1, -12, 1, 3, -10);
      B.solid(0, 1, -14, 0, 3, -13);
      B.receptor('r1', -3, 1, -14); B.receptor('r2', 3, 1, -14);
      B.card(4, 1, -11, -90, hall, { locked: true });
      // the only postcard to the red spot, on a shelf out of reach
      B.solid(-7, 1, -5, -7, 3, -4);
      B.card(-7, 4, -5, 90, sp);
      B.door(['r1', 'r2'], -7, 1, -19, -5, 3, -19); B.solid(-7, 4, -19, -5, 8, -19);
      B.exit(-6, 1, -21);
    },
  },
  {
    name: 'Connecting Flight', film: 1, postcard: true, diff: 8,
    hint: 'The postcard high in the glass shaft goes somewhere nobody can see, and it is locked in place. You keep your speed through a postcard, and through the next one too.',
    sol: [
      { snap: [0.5, 1.6, -12.5], say: 'Photograph the photo spot at the bottom of the glass shaft.' },
      { tp: [0.5, 1.02, -1.0], yaw: 0 },
      { print: [0.5, 2.7, -4.6], yaw: 0, say: 'Hang the postcard over the jump pad, its bottom edge about head high.' },
      { js: '__shutter.keys.KeyW = true', say: 'Run onto the pad: you bounce into the postcard, fly up out of the spot, and on into the high postcard.' },
      { until: '__shutter.player.position.z < -18.5', t: 4 },
      { wait: 1.0 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // walk in: the high postcard is out of reach from the bottom of the shaft
      [{ snap: [0.5, 1.6, -12.5] }, { tp: [3.5, 1.02, -1.0], yaw: 0 }, { print: [3.5, 2.02, -4.0], yaw: 0 }, { walkin: true, yaw: 0 }, { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // a postcard at the top of the bounce: in slowly, out slowly
      [{ snap: [0.5, 1.6, -12.5] }, { tp: [0.5, 1.02, -1.0], yaw: 0 }, { print: [0.5, 6.0, -4.9], yaw: 0 }, { js: '__shutter.keys.KeyW = true' }, { wait: 3 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -18, 6, 0, 12], [-2, -24, 2, -19, 12]]);
      B.start(0, 1, 0);
      const hall = B.spot(4, 1, -2, 180);
      B.pad(0, 1, -5, { locked: true });
      // the glass shaft: a spot at the bottom, and a locked postcard hanging high up at the far end, facing it
      B.glass(-3, 1, -18, -3, 12, -12, { axis: 'x' }); B.glass(3, 1, -18, 3, 12, -12, { axis: 'x' });
      B.glass(-3, 1, -11, 3, 12, -11, { axis: 'z' });
      B.spot(0, 1, -13, 0);
      B.card(2, 1, -18, 0, hall, { locked: true });
      // the hidden loft behind the shaft, with the way out
      B.solid(-2, 1, -24, 2, 8, -19); B.solid(-2, 9, -19, 2, 12, -19);
      const loft = B.spot(0, 9, -21, 0);
      B.exit(0, 9, -23);
      B.card(0, 6.2, -16.5, 0, loft, { locked: true });
    },
  },
  {
    name: 'Tall Order', film: 1, zoom: true, postcard: true, diff: 7,
    hint: 'A beam comes out of the photo spot as high above it as it went in above the card’s bottom, and this target is a long way up. On Zoom film, the farther away you print a postcard, the bigger it is.',
    sol: [
      { snap: [4.5, 1.6, -7.5], say: 'Photograph the photo spot in the glass room.' },
      { zprint: [-3.5, 0, -10.0], rest: 1.0, yaw: 0, scale: 3.3, from: [0.5, 1], say: 'From well back, print the postcard huge: standing on the floor, reaching up into the high beam, picture toward the emitter.' },
      { wait: 0.5 },
      { go: [0.5, -12.0], say: 'The beam goes in six metres above the card’s bottom, so it comes out six metres above the spot, into the target.' },
      { exit: true },
    ],
    nope: [
      // a postcard of the usual size, hung in the beam: the light comes out low
      [{ snap: [4.5, 1.6, -7.5] }, { tp: [-3.5, 1.02, -6.0], yaw: 0 }, { print: [-3.5, 6.5, -9.0], yaw: 0 }, { wait: 0.5 }, { go: [0.5, -12.0] }, { exit: true }],
      // a big postcard, but hung high: same thing
      [{ snap: [4.5, 1.6, -7.5] }, { zprint: [-3.5, 6.3, -10.0], yaw: 0, scale: 3.3, from: [0.5, 1] }, { wait: 0.5 }, { go: [0.5, -12.0] }, { exit: true }],
      // standing on the floor, but too short to reach the beam
      [{ snap: [4.5, 1.6, -7.5] }, { zprint: [-3.5, 0, -10.0], rest: 1.0, yaw: 0, scale: 2.0, from: [0.5, 1] }, { wait: 0.5 }, { go: [0.5, -12.0] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -16, 7, 0, 9], [-1, -20, 1, -17, 9]]);
      B.start(0, 1, 0);
      const hall = B.spot(3, 1, -2, 180);
      // a beam six metres up, down the length of the hall
      B.solid(-4, 1, 0, -4, 5, 0, 'trim'); B.emitter(-4, 6, 0, 0, { locked: true });
      // the glass room: the spot on the floor, the target high on the back wall
      B.glass(1, 1, -16, 1, 9, -7, { axis: 'x' }); B.glass(1, 1, -7, 7, 9, -7, { axis: 'z' });
      B.spot(4, 1, -8, 0);
      B.receptor('r1', 4, 6, -16);
      B.card(6, 1, -15, 0, hall, { locked: true });
      B.door(['r1'], -1, 1, -17, 1, 3, -17); B.solid(-1, 4, -17, 1, 9, -17);
      B.exit(0, 1, -19);
    },
  },
  {
    name: 'Crane Shot', film: 1, zoom: true, postcard: true, diff: 8,
    hint: 'You come out of a postcard as high above the photo spot as you were above the card’s bottom. On Zoom film, the farther away you print a postcard, the bigger it is.',
    sol: [
      { snap: [3.5, 1.6, -5.5], say: 'Photograph the photo spot at the foot of the glass tower.' },
      { zprint: [0.5, 0, -19.7], rest: 1.0, yaw: 180, scale: 3.8, from: [0, 1], say: 'From the far end of the hall, print the postcard huge, standing on the floor right against the gallery, its picture turned to face the gallery.' },
      { go: [-5.5, -8.0] },
      { go: [-6.0, -16.0], jump: true, say: 'Climb up to the gallery.' },
      { go: [-6.0, -21.0] }, { go: [0.5, -22.0] },
      { face: 180 },
      { js: '__shutter.keys.KeyW = true', say: 'Walk off the edge into the postcard, and keep walking: you come out of the spot six metres up, over the high ledge.' },
      { until: '__shutter.player.position.x > 3', t: 3 },
      { wait: 0.8 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // a postcard of the usual size, hung at the gallery's edge
      [{ snap: [3.5, 1.6, -5.5] }, { go: [-5.5, -8.0] }, { go: [-6.0, -16.0], jump: true }, { go: [-6.0, -21.0] }, { go: [0.5, -22.0] }, { print: [0.5, 8.02, -19.4], yaw: 180 }, { face: 180 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2.0 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // a big postcard that is still too short to reach up to the gallery
      [{ snap: [3.5, 1.6, -5.5] }, { zprint: [0.5, 0, -19.7], rest: 1.0, yaw: 180, scale: 2.5, from: [0, 1] }, { go: [-5.5, -8.0] }, { go: [-6.0, -16.0], jump: true }, { go: [-6.0, -21.0] }, { go: [0.5, -22.0] }, { face: 180 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2.0 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // walk in from the floor and jump
      [{ snap: [3.5, 1.6, -5.5] }, { tp: [-2.5, 1.02, -6.0], yaw: 0 }, { print: [-2.5, 2.02, -9.0], yaw: 0 }, { walkin: true, yaw: 0 }, { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true, jump: true }],
    ],
    build(B) {
      B.plan([[-7, -24, 7, 0, 14]]);
      B.start(0, 1, -1);
      const hall = B.spot(-3, 1, -3, 180);
      // the gallery across the back, six metres up, and the steps up to it along the west wall
      B.solid(-7, 1, -24, 7, 6, -21);
      for (let i = 0; i < 6; i++) B.solid(-7, 1, -9 - i, -6, 1 + i, -9 - i);
      B.solid(-7, 1, -20, -6, 6, -15);
      // the glass tower: the spot at its foot, the way out on a ledge five metres up
      B.glass(2, 1, -8, 2, 14, -3, { axis: 'x' }); B.glass(3, 1, -8, 7, 14, -8, { axis: 'z' }); B.glass(3, 1, -3, 7, 14, -3, { axis: 'z' });
      B.spot(3, 1, -6, -90);
      B.solid(5, 1, -7, 7, 5, -4);
      B.exit(6, 6, -6);
      B.card(3, 1, -4, 180, hall, { locked: true });
    },
  },
  {
    name: 'Flat Pack', film: 1, zoom: true, postcard: true, diff: 8,
    hint: 'The way out is up a high ledge in the sealed room, nothing you carry survives its light leak, and the only stairs here are a model. Whatever you print into a postcard goes through just as you printed it: that big, turned that way.',
    sol: [
      { snap: [-2.5, 1.6, -13.5], say: 'Photograph the photo spot on the left of the sealed room.' },
      { zprint: [-2.5, 0, -6.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1], say: 'Print the postcard in the hall, at its usual size: about three metres from you.' },
      { tp: [-4.5, 1.02, -1.0], yaw: 0 },
      { snap: [-4.5, 2.375, -2.5], say: 'Photograph the model stairs from close up.' },
      { zprint: [-2.5, 2.52, -6.1], scale: 1.0, yaw: 90, from: [0, 1], say: 'Back away until they come out full size, and print them right into the postcard, climbing away from you.' },
      { wait: 1 },
      { snap: [3.5, 1.6, -11.5], say: 'Photograph the other photo spot.' },
      { zprint: [3.5, 0, -4.5], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1] },
      { walkin: true, yaw: 0, say: 'Print it at its usual size too, and follow the stairs in.' },
      { go: [-2.5, -11.6] },
      { go: [-2.5, -17.5], jump: true, say: 'Climb them, and step from the top onto the ledge.' },
      { exit: true },
    ],
    nope: [
      // carry the model in yourself: the light leak fogs it
      [{ snap: [3.5, 1.6, -11.5] }, { print: [3.5, 2.02, -4.5], yaw: 0 }, { tp: [-4.5, 1.02, -1.0], yaw: 0 }, { snap: [-4.5, 2.375, -2.5] }, { tp: [3.5, 1.02, -2.0], yaw: 0 }, { walkin: true, yaw: 0 }, { zprint: [-2.5, 2.52, -14.0], scale: 1.0, yaw: 90, from: [0.6, 0.8] }, { go: [-2.5, -11.6] }, { go: [-2.5, -17.5], jump: true }, { exit: true }],
      // mailed at half size, the stairs are too short
      [{ snap: [-2.5, 1.6, -13.5] }, { print: [-2.5, 2.02, -6.0], yaw: 0 }, { tp: [-4.5, 1.02, -1.0], yaw: 0 }, { snap: [-4.5, 2.375, -2.5] }, { zprint: [-2.5, 1.77, -6.1], scale: 0.5, yaw: 90, from: [0, 1] }, { wait: 1 }, { snap: [3.5, 1.6, -11.5] }, { print: [3.5, 2.02, -4.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [-2.5, -12.4] }, { go: [-2.5, -17.5], jump: true }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -19, 7, 0, 8]]);
      B.start(0, 1, 0);
      const hall = B.spot(5, 1, -2, 180);
      // the model stairs on a plinth
      B.solid(-5, 1, -3, -5, 1, -3, 'trim');
      B.miniStairs(-4.5, 2, -2.5, 3, 0.25);
      // the sealed room, light-leaked: two photo spots, and the way out up a ledge three and a half metres high
      B.glass(-7, 1, -10, 7, 8, -10, { axis: 'z' });
      B.leak(-7, 1, -19, 7, 4, -11);
      B.box([-7, 1, -19], [8, 4.5, -16]);
      B.spot(-3, 1, -14, 0);
      B.spot(3, 1, -12, 0);
      B.exit(0, 4.5, -18);
      B.card(5, 1, -15, 0, hall, { locked: true });
    },
  },
  {
    name: 'Slow Boat', film: 1, exposure: true, postcard: true, diff: 8,
    hint: 'The pit in the sealed room is too wide to jump, and nothing you carry survives its light leak. A heavy streak goes through a postcard like anything else, and comes out pointing the way it went in.',
    sol: [
      { snap: [0.5, 1.6, -13.5], say: 'Photograph the middle photo spot in the sealed room.' },
      { print: [-1.0, 2.02, -5.0], yaw: 90, say: 'Print the postcard in the hall, its picture toward the east wall.' },
      { tp: [3.5, 1.02, -3.5], yaw: 180 },
      { expose: 'shuttle', when: 'A', hold: 2.95, say: 'Hold the shutter on the orange freight for its whole run: one long, heavy streak.' },
      { print: [-1.0, 1.17, -5.0], yaw: 0, rest: 1.0, say: 'Print the streak lying on the floor, running straight through the postcard: it goes through lengthways and comes out across the pit.' },
      { wait: 1 },
      { snap: [-3.5, 1.6, -9.5], say: 'Photograph the other photo spot.' },
      { print: [4.5, 2.02, -4.5], yaw: -90 },
      { tp: [2.0, 1.02, -4.5], yaw: -90 },
      { walkin: true, yaw: -90, say: 'Walk in after it.' },
      { go: [0.5, -12.0] }, { go: [0.5, -20.5], say: 'Cross on the streak.' },
      { exit: true },
    ],
    nope: [
      // mailed crossways, the streak lands along the near bank
      [{ snap: [0.5, 1.6, -13.5] }, { print: [-1.0, 2.02, -5.0], yaw: 90 }, { tp: [3.5, 1.02, -3.5], yaw: 180 }, { expose: 'shuttle', when: 'A', hold: 2.95 }, { print: [-1.0, 1.17, -5.0], yaw: 90, rest: 1.0 }, { wait: 1 }, { snap: [-3.5, 1.6, -9.5] }, { print: [4.5, 2.02, -4.5], yaw: -90 }, { tp: [2.0, 1.02, -4.5], yaw: -90 }, { walkin: true, yaw: -90 }, { go: [0.5, -12.0] }, { go: [0.5, -20.5] }, { exit: true }],
      // carry the streak in yourself: the light leak fogs it
      [{ snap: [-3.5, 1.6, -9.5] }, { print: [4.5, 2.02, -4.5], yaw: -90 }, { tp: [3.5, 1.02, -3.5], yaw: 180 }, { expose: 'shuttle', when: 'A', hold: 2.95 }, { tp: [2.0, 1.02, -4.5], yaw: -90 }, { walkin: true, yaw: -90 }, { print: [0.5, 1.17, -15.0], yaw: 90, rest: 1.0 }, { go: [0.5, -12.0] }, { go: [0.5, -20.5] }, { exit: true }],
    ],
    build(B) {
      B.plan([[-7, -23, 7, 0, 8]], { pits: [[-7, -19, 7, -15]] });
      B.start(4, 1, -3);
      const hall = B.spot(-6, 1, -4, -90);
      // the orange freight, in a glass case along the south wall
      B.glassCase(-6, 1, -2, 6, 1, 0);
      B.shuttle([-6, 1.1, -1], [4, 1.1, -1], { speed: 3.5, size: [1, 0.3, 1.2], orange: true });
      // the sealed room, light-leaked: a near bank with two photo spots, five metres of void, the way out beyond
      B.glass(-7, 1, -8, 7, 8, -8, { axis: 'z' });
      B.leak(-7, 1, -23, 7, 4, -9);
      B.spot(0, 1, -14, 0);
      B.spot(-4, 1, -10, 0);
      B.exit(0, 1, -21);
      B.card(-6, 1, -12, 90, hall, { locked: true });
    },
  },
  {
    name: 'Poste Restante', film: 1, postcard: true, diff: 7,
    hint: 'The way out is on a ledge high in the glass tower, and the only thing that throws you that high is the jump pad in the glass pen. The pen is all light leak: whatever you carry in there fogs. Post what you will need before you go in.',
    sol: [
      { snap: [4.5, 1.6, -7.5], say: 'Photograph the photo spot at the foot of the tower.' },
      { go: [3.0, -5.5] },
      { print: [-3.3, 3.42, -5.5], yaw: -90, say: 'Through the open window in the pen, hang that postcard just past the jump pad, its bottom edge above your head, picture toward the pen’s photo spot.' },
      { go: [1.0, -1.0] }, { go: [-6.0, -1.0] },
      { snap: [-9.5, 1.6, -5.5], say: 'Now photograph the photo spot at the far end of the pen.' },
      { print: [-3.0, 2.02, -1.0], yaw: 90, say: 'Print it out here and walk in.' },
      { go: [-1.5, -1.0] },
      { walkin: true, yaw: 90 },
      { js: '__shutter.keys.KeyW = true', say: 'Keep running, over the pad: up into the postcard you posted, out of the tower’s spot and up onto the ledge.' },
      { until: '__shutter.player.position.x > 3', t: 3 },
      { wait: 1.0 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // go in first: inside the pen you have nothing left to print
      [{ go: [-6.0, -1.0] }, { snap: [-9.5, 1.6, -5.5] }, { print: [-3.0, 2.02, -1.0], yaw: 90 }, { tp: [3.0, 1.02, -5.5], yaw: 0 }, { snap: [4.5, 1.6, -7.5] }, { go: [-1.5, -1.0] }, { walkin: true, yaw: 90 }, { print: [-3.3, 3.42, -5.5], yaw: -90 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // no pad: walk into the tower and try to climb
      [{ snap: [4.5, 1.6, -7.5] }, { print: [0.5, 2.02, -4.0], yaw: 0 }, { go: [0.5, -1.5] }, { walkin: true, yaw: 0 }, { js: '__shutter.keys.KeyW = true; __shutter.P.jumpBuf = 0.14' }, { wait: 1.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true, jump: true }],
      // posted too high: you reach it at the top of the bounce, slow, and come out slow
      [{ snap: [4.5, 1.6, -7.5] }, { go: [0.0, -5.5] }, { print: [-3.3, 6.2, -5.5], yaw: -90 }, { go: [1.0, -1.0] }, { go: [-6.0, -1.0] }, { snap: [-9.5, 1.6, -5.5] }, { print: [-3.0, 2.02, -1.0], yaw: 90 }, { go: [-1.5, -1.0] }, { walkin: true, yaw: 90 }, { js: '__shutter.keys.KeyW = true' }, { wait: 2.5 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
    ],
    build(B) {
      B.plan([[-10, -14, 8, 0, 11]]);
      B.start(2, 1, -2, 90);
      const hall = B.spot(0, 1, -2, 180);
      // the glass pen: a photo spot at its far end, a jump pad near the near end, light leak all through it,
      // and one open window high in its east wall
      B.glass(-10, 1, -9, -2, 11, -9, { axis: 'z' }); B.glass(-10, 1, -3, -2, 11, -3, { axis: 'z' });
      B.glass(-2, 1, -8, -2, 2, -4, { axis: 'x' }); B.glass(-2, 5, -8, -2, 11, -4, { axis: 'x' });
      B.glass(-2, 3, -8, -2, 4, -8, { axis: 'x' }); B.glass(-2, 3, -5, -2, 4, -4, { axis: 'x' });
      B.pad(-4, 1, -6, { locked: true });
      B.spot(-10, 1, -6, -90);
      B.leak(-10, 1, -8, -3, 3, -4);
      // the glass tower: the spot at its foot, the way out on a ledge four metres up
      B.glass(2, 1, -14, 2, 11, -8, { axis: 'x' }); B.glass(3, 1, -7, 8, 11, -7, { axis: 'z' });
      B.spot(4, 1, -8, 0);
      B.solid(3, 1, -14, 8, 4, -12);
      B.exit(5, 5, -13);
      B.card(7, 1, -9, 180, hall, { locked: true });
    },
  },
  {
    name: 'Holding Pattern', film: 1, postcard: true, diff: 7,
    hint: 'The way out is in a room under the hall, and nothing up here looks into it. Once you drop into the pit you bounce for ever: its whole floor is jump pads. At the top of each bounce your eyes are level with a little window. A postcard can be printed in mid-air.',
    sol: [
      { go: [0.5, -7.5] },
      { go: [0.5, -9.5], say: 'Drop into the bounce pit.' },
      { until: '__shutter.player.position.y < 0 && __shutter.player.position.y > -4.4 && Math.abs(__shutter.player.velocity.y) < 0.45', t: 6 },
      { snap: [0.5, -3.0, -16.5], say: 'At the top of a bounce, photograph the photo spot through the little window.' },
      { print: [0.5, -4.5, -8.26], yaw: 180, settle: 1, say: 'Still in the air, print the postcard against the pit’s back wall, picture toward you.' },
      { face: 180 },
      { js: '__shutter.keys.KeyW = true', say: 'Drift into it.' },
      { until: '__shutter.player.position.z < -12.5', t: 4 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // the spot can't be seen from up in the hall: the window only looks out level
      [{ go: [0.5, -7.5] }, { snap: [0.5, -3.0, -16.5] }, { print: [0.5, 2.02, -5.0], yaw: 0 }, { go: [0.5, -3.0] }, { walkin: true, yaw: 0 }, { exit: true }],
      [{ go: [0.5, -7.5] }, { snap: [0.5, -3.9, -16.0] }, { print: [0.5, 2.02, -5.0], yaw: 0 }, { go: [0.5, -3.0] }, { walkin: true, yaw: 0 }, { exit: true }],
      // drop in and wait
      [{ go: [0.5, -7.5] }, { go: [0.5, -9.5] }, { wait: 4 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-6, -20, 6, 0, 8]], { pits: [[-1, -11, 1, -9]] });
      B.start(0, 1, -3);
      // the bounce pit: eleven metres deep, floored with jump pads
      B.solid(-2, -11, -12, -2, -1, -8); B.solid(2, -11, -12, 2, -1, -8); B.solid(-1, -11, -8, 1, -1, -8);
      B.solid(-1, -11, -11, 1, -11, -9);
      for (let x = -1; x <= 1; x++) for (let z = -11; z <= -9; z++) B.pad(x, -10, z, { locked: true });
      // its north wall, with a window at the top of the bounce
      B.solid(-3, -11, -12, 3, -5, -12); B.solid(-3, -2, -12, 3, -1, -12);
      B.solid(-3, -4, -12, -2, -3, -12); B.solid(2, -4, -12, 3, -3, -12);
      B.glass(-1, -4, -12, 1, -3, -12, { axis: 'z', face: 'max' });
      // the room under the hall, behind the window, with the way out
      B.solid(-3, -5, -19, 3, -5, -13);
      B.solid(-4, -5, -20, -4, -1, -12); B.solid(4, -5, -20, 4, -1, -12); B.solid(-3, -5, -20, 3, -1, -20);
      B.spot(0, -4, -17, 0);
      B.exit(0, -4, -19);
    },
  },
  {
    name: 'Ricochet', film: 1, motion: true, postcard: true, diff: 9,
    hint: 'The way out is under the glass floor of the closed room, and only a fast crate breaks glass. The closed room’s photo spot can only be seen from the vault, through its little window. The vault is under safelight, and you can only go in or out of it through light leaks: nothing comes in or goes out on your film. A throw goes through one postcard after another.',
    sol: [
      { go: [-4.5, -4.0] },
      { walkin: true, yaw: 0, say: 'Walk into the anchored postcard on the wall: it takes you into the red vault.' },
      { go: [-3.0, -12.0] }, { go: [-1.5, -13.5], say: 'Go to the little window in the vault’s east wall.' },
      { snap: [4.5, 1.6, -8.5], say: 'Through it, photograph the photo spot in the closed room.' },
      { print: [-4.5, 2.02, -14.5], yaw: 0, say: 'Print that postcard a good way straight ahead of the vault’s photo spot, picture toward it. It has to stay here: you could never carry it out.' },
      { go: [-6.5, -10.0] }, { go: [-6.5, -7.6] },
      { walkin: true, yaw: 90, say: 'Leave by the anchored postcard beside the spot.' },
      { go: [-4.5, -2.5] },
      { until: 'T.fastIn(-15.5)', t: 8 },
      { snap: 'crate', say: 'Back in the hall, photograph the falling crate.' },
      { launch: [4.5, 1.0, -11.5], via: [-4.5, 2.8, -5.5], say: 'Throw it up into the postcard on the wall: out of the vault’s spot, on into your postcard, out in the closed room and down through the glass floor.' },
      { wait: 1.0 },
      { go: [-4.5, -4.0] },
      { walkin: true, yaw: 0 },
      { go: [-4.5, -13.0] },
      { walkin: true, yaw: 0, say: 'Back through the vault and into your postcard, and drop through the hole.' },
      { exit: true },
    ],
    nope: [
      // no second postcard: the throw lands in the vault
      [{ go: [-4.5, -2.5] }, { until: 'T.fastIn(-15.5)', t: 8 }, { snap: 'crate' }, { launch: [4.5, 1.0, -11.5], via: [-4.5, 2.8, -5.5] }, { wait: 1.5 }, { go: [-4.5, -4.0] }, { walkin: true, yaw: 0 }, { exit: true }],
      // carry the closed room's postcard out of the vault: the leak fogs it
      [{ go: [-4.5, -4.0] }, { walkin: true, yaw: 0 }, { go: [-3.0, -12.0] }, { go: [-1.5, -13.5] }, { snap: [4.5, 1.6, -8.5] }, { go: [-6.5, -10.0] }, { go: [-6.5, -7.6] }, { walkin: true, yaw: 90 }, { print: [0.5, 2.02, -4.5], yaw: 0 }, { exit: true }],
    ],
    build(B) {
      B.plan([[-8, -21, 8, 0, 8]], { pits: [[2, -18, 7, -10]] });
      B.start(2, 1, 0);
      const hall = B.spot(0, 1, -2, 180);
      B.chute(6, -3, 1, 8);
      B.solid(-8, 1, -7, 8, 8, -7);
      // the vault, under safelight: its spot, beside it an anchored way back, and light leak over both
      B.safelight(-8, 1, -21, -1, 7, -8);
      const vault = B.spot(-5, 1, -8, 0);
      B.card(-8, 1, -8, 90, hall, { locked: true });
      B.leak(-8, 1, -9, -4, 3, -8);
      B.card(-5, 1.8, -6, 0, vault, { locked: true });
      // the wall between the vault and the closed room, with a little window
      B.solid(0, 1, -21, 0, 8, -16); B.solid(0, 4, -15, 0, 8, -11); B.solid(0, 1, -10, 0, 8, -8);
      B.glass(0, 1, -15, 0, 3, -11, { axis: 'x' });
      // the closed room, all light leak: its spot, a glass floor, the way out underneath, and an anchored way back
      B.spot(4, 1, -9, 0);
      B.fragile(2, 0, -18, 7, 0, -10, { axis: 'y', face: 'max', frosted: false });
      B.solid(1, -4, -19, 1, -1, -9); B.solid(8, -4, -19, 8, -1, -9); B.solid(2, -4, -19, 7, -1, -19); B.solid(2, -4, -9, 7, -1, -9);
      B.solid(2, -4, -18, 7, -4, -10, 'floor');
      B.exit(4, -3, -14);
      B.leak(1, 1, -21, 8, 4, -8);
      B.card(7, 1, -8, 180, hall, { locked: true });
    },
  },
  {
    name: 'The Last Post', film: 1, zoom: true, postcard: true, diff: 10,
    hint: 'The way out is nine metres up the glass tower. The jump pad is on the gallery, behind a door the target in the tower opens, and the gallery is all light leak. You keep your speed through a postcard, and your height above its bottom, and on Zoom film a postcard can be as big as you print it.',
    sol: [
      { snap: [5.5, 1.6, -5.5], say: 'Photograph the photo spot at the foot of the tower.' },
      { zprint: [0.5, 0, -14.7], rest: 1.0, yaw: 180, scale: 4.5, from: [0, 1], say: 'From the far end of the hall, print it as big as it goes: standing on the floor, right against the gallery, picture toward the gallery. The beam goes in, comes out in the tower and lights the target: the gallery door opens.' },
      { wait: 0.5 },
      { snap: [-4.5, 5.6, -17.5], say: 'Photograph the photo spot up on the gallery.' },
      { zprint: [-4.5, 0, -8.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1], say: 'Print it in the hall at its usual size.' },
      { walkin: true, yaw: 0, say: 'Walk in: you arrive on the gallery with empty hands.' },
      { go: [-1.0, -18.0] }, { go: [2.5, -18.0] },
      { face: 180 },
      { js: '__shutter.keys.KeyW = true', say: 'Run at the edge over the jump pad: you bounce up into the giant postcard, and come out of the tower’s spot higher and faster than anything else could throw you.' },
      { until: '__shutter.player.position.z > -8', t: 3 },
      { wait: 1.2 },
      { js: '__shutter.keys.KeyW = false' },
      { exit: true },
    ],
    nope: [
      // the giant postcard facing the hall: the beam hits its back, and the gallery door stays shut
      [{ snap: [5.5, 1.6, -5.5] }, { zprint: [0.5, 0, -14.7], rest: 1.0, yaw: 0, scale: 4.5, from: [0, 1] }, { wait: 0.5 }, { snap: [-4.5, 5.6, -17.5] }, { zprint: [-4.5, 0, -8.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1] }, { walkin: true, yaw: 0 }, { go: [-1.0, -18.0] }, { go: [2.5, -18.0] }, { face: 180 }, { js: '__shutter.keys.KeyW = true' }, { wait: 3 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // big enough to light the target, too short to catch you off the pad
      [{ snap: [5.5, 1.6, -5.5] }, { zprint: [0.5, 0, -14.7], rest: 1.0, yaw: 180, scale: 2.5, from: [0, 1] }, { wait: 0.5 }, { snap: [-4.5, 5.6, -17.5] }, { zprint: [-4.5, 0, -8.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1] }, { walkin: true, yaw: 0 }, { go: [-1.0, -18.0] }, { go: [2.5, -18.0] }, { face: 180 }, { js: '__shutter.keys.KeyW = true' }, { wait: 3 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
      // walk off the gallery into the giant postcard without the pad: not high enough
      [{ snap: [5.5, 1.6, -5.5] }, { zprint: [0.5, 0, -14.7], rest: 1.0, yaw: 180, scale: 4.5, from: [0, 1] }, { wait: 0.5 }, { snap: [-4.5, 5.6, -17.5] }, { zprint: [-4.5, 0, -8.0], rest: 1.0, yaw: 0, scale: 1.0, from: [0, 1] }, { walkin: true, yaw: 0 }, { go: [-1.0, -18.0] }, { go: [-0.6, -16.0] }, { face: 180 }, { js: '__shutter.keys.KeyW = true' }, { wait: 3 }, { js: '__shutter.keys.KeyW = false' }, { exit: true }],
    ],
    build(B) {
      B.plan([[-8, -20, 8, 0, 12]]);
      B.start(0, 1, -1);
      const hall = B.spot(-6, 1, -2, 180);
      // the gallery, four metres up, with an emitter set into its face firing down the hall over your head
      B.solid(-8, 1, -20, 8, 4, -17);
      B.solid(-8, 1, -16, -2, 4, -16); B.solid(0, 1, -16, 8, 4, -16);
      B.solid(-1, 1, -16, -1, 2, -16); B.solid(-1, 4, -16, -1, 4, -16);
      B.emitter(-1, 3, -16, 180, { locked: true });
      // on the gallery: its photo spot, a door the tower's target opens, and the jump pad at the edge; all light leak
      B.spot(-5, 5, -18, -90);
      B.solid(0, 5, -20, 0, 12, -20); B.door(['r1'], 0, 5, -19, 0, 7, -17); B.solid(0, 8, -19, 0, 12, -17); B.solid(0, 5, -16, 0, 12, -16);
      B.pad(2, 5, -16, { locked: true });
      B.leak(-8, 5, -20, 8, 7, -16);
      // the glass tower: the spot at its foot, the target, and the way out on a ledge nine metres up
      B.glass(2, 1, -7, 2, 12, 0, { axis: 'x' }); B.glass(3, 1, -8, 8, 12, -8, { axis: 'z' });
      B.spot(5, 1, -6, 180);
      B.receptor('r1', 4, 3, -4);
      B.solid(3, 1, -2, 8, 9, 0);
      B.exit(5, 10, -1);
      B.card(7, 1, -6, -90, hall, { locked: true });
    },
  },
  {
    name: 'Downpour', film: 1, exposure: true, diff: 2,
    hint: 'One crate stops one laser. The crate in the tube never stops falling, so hold the shutter on it instead of clicking.',
    sol: [
      { expose: [3.5, 5.0, -2.5], hold: 1.0, say: 'Hold the shutter on the falling crate. It smears into one tall pillar.' },
      { print: [-2.4, 0, -6.5], rest: 1.0, yaw: 0, say: 'Stand the pillar right in front of the stack of lasers.' },
      { go: [1.5, -9.0], say: 'Walk past while it blocks them all.' },
      { exit: true },
    ],
    nope: [
      // a quick click takes just the crate: it stops one laser of three
      [{ snap: 'crate' }, { print: [-2.5, 1.47, -6.5] }, { go: [1.5, -9.0], n: 400 }, { exit: true, n: 400 }],
      // nothing in the way
      [{ go: [1.5, -9.0], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.shell(-4, 4, -13, 1, 9);
      B.start(0, 1, 0);
      B.chute(3, -3, 1, 9);
      // a stack of three lasers against the left wall, firing right across the hall
      for (const y of [1, 2, 3]) B.emitter(-4, y, -7, -90, { locked: true });
      B.exit(0, 1, -11);
    },
  },
  {
    name: 'Handrail', film: 1, exposure: true, diff: 2,
    hint: 'A row of lasers in a light leak: the shuttle itself would only stop one of them, and nothing you carry gets past the leak. A streak is as long as the trip you catch.',
    sol: [
      { tp: [1.0, 1.02, -2.0], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 1.8, say: 'Hold the shutter on the shuttle for its whole trip.' },
      { print: [-2.45, 2.5, -9.5], yaw: 90, say: 'Hang the streak along the wall, right in front of the row of lasers, at their height.' },
      { go: [0.5, -16.0], say: 'Walk down the hall.' },
      { exit: true },
    ],
    nope: [
      // the shuttle itself only covers one laser
      [{ tp: [1.0, 1.02, -2.0], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { print: [-2.45, 2.5, -7.5], yaw: 90 }, { go: [0.5, -16.0], n: 400 }, { exit: true, n: 400 }],
      // a short streak misses one end of the row
      [{ tp: [1.0, 1.02, -2.0], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 0.6 }, { print: [-2.45, 2.5, -8.5], yaw: 90 }, { go: [0.5, -16.0], n: 400 }, { exit: true, n: 400 }],
      // leapfrogging the shuttle from laser to laser: picking it up again inside the leak fogs it
      [{ tp: [1.0, 1.02, -2.0], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { print: [-2.45, 2.5, -7.5], yaw: 90 }, { go: [0.5, -8.5] },
        { snap: [-2.45, 2.5, -7.5] }, { print: [-2.45, 2.5, -9.5], yaw: 90 }, { go: [0.5, -10.5] }, { snap: [-2.45, 2.5, -9.5] }, { print: [-2.45, 2.5, -11.5], yaw: 90 },
        { go: [0.5, -16.0], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -18, 2, 0, 7], [3, -6, 4, 0, 4]]);
      B.start(0, 1, 0);
      // the shuttle's gallery off the right of the hall, behind glass
      B.glass(3, 1, -6, 3, 4, 0, { axis: 'x' });
      B.shuttle([4, 1.6, -5], [4, 1.6, -1], { speed: 2.5, size: [0.8, 0.6, 1.0] });
      // a row of lasers along the left wall at head height, in a light leak
      for (const z of [-8, -10, -12]) B.emitter(-4, 2, z, -90, { locked: true });
      B.leak(-3, 1, -12, 2, 7, -7);
      B.exit(0, 1, -17);
    },
  },
  {
    name: 'Made to Measure', film: 1, exposure: true, diff: 3,
    hint: 'The readout shows how long the streak is getting. Too short and it drops into the void; too long and it won’t fit in the room.',
    sol: [
      { tp: [6.0, 1.02, -6.0], yaw: -90 },
      { expose: 'shuttle', when: 'A', hold: 1.6, say: 'Expose the shuttle, but let go when the readout says about seven metres.' },
      { go: [3.0, -4.0] },
      { go: [-1.0, -4.0] },
      { print: [-2.5, 0, -7.0], rest: 1.0, yaw: 90, say: 'Lay it along the narrow room, across the pit.' },
      { go: [-2.5, -4.0] },
      { go: [-2.5, -11.5], say: 'Cross.' },
      { exit: true },
    ],
    nope: [
      // the whole trip makes a streak too long for the room: it can't be printed in there
      [{ tp: [6.0, 1.02, -6.0], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 2.9 }, { go: [3.0, -4.0], n: 400 }, { go: [-1.0, -4.0], n: 400 }, { print: [-2.5, 0, -7.1], rest: 1.0, yaw: 90 }, { go: [-2.5, -4.0], n: 400 }, { go: [-2.5, -11.5], n: 400 }, { exit: true, n: 400 }],
      // too short, it falls in
      [{ tp: [6.0, 1.02, -6.0], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 0.8 }, { go: [3.0, -4.0], n: 400 }, { go: [-1.0, -4.0], n: 400 }, { print: [-2.5, 0, -7.5], rest: 1.0, yaw: 90 }, { go: [-2.5, -4.0], n: 400 }, { go: [-2.5, -11.5], n: 400 }, { exit: true, n: 400 }],
      // and the gap is too wide to jump
      [{ go: [3.0, -4.0], n: 400 }, { go: [-1.0, -4.0], n: 400 }, { go: [-2.5, -3.0], n: 400 }, { face: 180 }, { tp: [-2.5, 1.02, -2.4], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[2, -13, 8, 0, 7], [-1, -5, 1, -3, 3], [-4, -12, -2, -3, 7], [9, -12, 10, -1, 4]], { pits: [[-4, -10, -2, -6]] });
      B.start(5, 1, -1);
      // the shuttle's gallery along the east wall
      B.glass(9, 1, -12, 9, 4, -1, { axis: 'x' });
      B.shuttle([10, 1.3, -11], [10, 1.3, -1], { speed: 4, size: [1, 0.3, 1], orange: true });
      B.exit(-3, 1, -12);
    },
  },
  {
    name: 'Escalator', film: 1, exposure: true, diff: 4,
    hint: 'The car climbs as it goes, so its streak is a whole block, not a ramp. Let go early and the block comes out smaller every way.',
    sol: [
      { tp: [-3.5, 1.02, -4.5], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.0, say: 'Expose the climbing car for its whole trip: a big block, too tall to climb.' },
      { print: [0.5, 0, -8.2], rest: 1.0, yaw: 0, say: 'Stand it against the ledge anyway.' },
      { tp: [-3.5, 1.02, -4.5], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 0.9, say: 'Expose it again, but let go halfway: a block about half as tall.' },
      { print: [0.5, 0, -6.65], rest: 1.0, yaw: 0, say: 'Put it in front of the big one as the first step.' },
      { go: [0.5, -5.0] },
      { go: [0.5, -10.5], jump: true, say: 'Climb the two blocks to the ledge.' },
      { exit: true },
    ],
    nope: [
      // the big block on its own is too tall to get onto
      [{ tp: [-3.5, 1.02, -4.5], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { print: [0.5, 0, -8.2], rest: 1.0, yaw: 0 }, { go: [0.5, -5.0], n: 400 }, { go: [0.5, -10.5], jump: true, n: 400 }, { exit: true, jump: true, n: 400 }],
      // the small one on its own leaves the ledge out of reach
      [{ tp: [-3.5, 1.02, -4.5], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 1.05 }, { print: [0.5, 0, -8.2], rest: 1.0, yaw: 0 }, { go: [0.5, -5.0], n: 400 }, { go: [0.5, -10.5], jump: true, n: 400 }, { exit: true, jump: true, n: 400 }],
      // the car itself is only a thin slab, even on top of the small block
      [{ tp: [-3.5, 1.02, -4.5], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 1.05 }, { print: [0.5, 0, -8.2], rest: 1.0, yaw: 0 }, { tp: [-3.5, 1.02, -4.5], yaw: 90 }, { tap: 'shuttle', when: 'A' }, { print: [0.5, 0, -8.2], rest: 2.62, yaw: 0 }, { go: [0.5, -5.0], n: 400 }, { go: [0.5, -10.5], jump: true, n: 400 }, { exit: true, jump: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -12, 5, 0, 8], [-11, -6, -6, -4, 6]]);
      B.start(2, 1, -1, 20);
      // the climbing car, behind glass in an alcove on the left
      B.glass(-6, 1, -6, -6, 6, -4, { axis: 'x' });
      B.shuttle([-11, 1.0, -5], [-8, 3.4, -5], { speed: 2, size: [1, 0.3, 1.5], orange: true });
      // the ledge across the back
      B.box([-5, 1, -12], [6, 4.6, -9]);
      B.exit(0, 4.6, -11);
    },
  },
  {
    name: 'Plummet', film: 1, exposure: true, diff: 4,
    hint: 'The laser runs high over the jump pad, and an orange crate won’t stay up there. A crate you have just printed is moving too, for a moment.',
    sol: [
      { snap: [2.5, 1.45, -1.5], say: 'Photograph the crate.' },
      { tp: [0.5, 1.02, -3.0], yaw: 0 },
      { print: [-2.4, 11.0, -3.0], settle: 8, say: 'Print it high up near the ceiling. It starts to fall at once...' },
      { js: 'T.look(-2.4, 10.6, -3.0); __shutter.startExposure(); !!__shutter.expo', say: '...so hold the shutter on it as it drops...' },
      { wait: 1.6 },
      { js: 'T.look(-2.4, 5.9, -3.0); __shutter.endExposure(); T.photo() + " " + T.dims()', say: '...and let go once it lands: it has smeared into a pillar.' },
      { print: [0.5, 0, -0.4], rest: 1.0, yaw: 0, say: 'Stand the pillar in the laser’s path, just in front of it.' },
      { go: [0.5, -10.5], say: 'Bounce up to the ledge.' },
      { exit: true },
    ],
    nope: [
      // the crate itself is far too short to reach the laser
      [{ snap: [2.5, 1.45, -1.5] }, { tp: [0.5, 1.02, -2.0], yaw: 0 }, { print: [0.5, 1.47, -0.4] }, { go: [0.5, -10.5], n: 400 }, { exit: true, n: 400 }],
      // nothing in the way
      [{ go: [0.5, -10.5], n: 400 }, { exit: true, n: 400 }],
      // start the exposure too late and the pillar is too short
      [{ snap: [2.5, 1.45, -1.5] }, { tp: [0.5, 1.02, -2.0], yaw: 0 }, { print: [-2.4, 11.0, -3.0], settle: 52 }, { expose: [-2.4, 2.0, -3.0], hold: 1.0 }, { print: [0.5, 0, -0.4], rest: 1.0, yaw: 0 }, { go: [0.5, -10.5], n: 400 }, { exit: true, n: 400 }],
      // even stepping onto the pad from behind, at its very back edge, the bounce goes through the beam
      [{ tp: [0.5, 1.02, -6.6], yaw: 180 }, { go: [0.5, -5.85], n: 400 }, { go: [0.5, -10.5], n: 400 }, { exit: true, n: 400 }],
      // and the pad can't be reached from the side, clear of the beam
      [{ go: [3.0, -5.9], n: 400 }, { go: [-2.0, -5.9], n: 400 }, { go: [0.5, -10.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.shell(-4, 4, -12, 1, 11);
      B.start(0, 1, 0);
      B.crate(2, 1, -2);
      // the jump pad, with a wall either side so you can only step on from the front or the back
      B.pad(0, 1, -6, { locked: true });
      B.solid(-1, 1, -6, -1, 3, -6); B.solid(1, 1, -6, 1, 3, -6);
      // a laser down the length of the room, high over the pad, from a post on the back wall
      B.solid(0, 1, 1, 0, 2, 1, 'trim'); B.emitter(0, 3, 1, 0, { locked: true });
      B.solid(-4, 1, -12, 4, 5, -9);
      B.exit(0, 6, -11);
    },
  },
  {
    name: 'Panorama', film: 2, exposure: true, diff: 5,
    hint: 'The door wants all three plates held at once. The shuttle passes over every one of them, just never all at the same time, and it is always in the way.',
    sol: [
      { tp: [-0.5, 1.02, -2.0], yaw: 0 },
      { expose: 'shuttle', when: 'A', hold: 2.95, say: 'Expose the shuttle for its whole sweep: the streak covers all three plates. It won’t print on them while the shuttle is in the way.' },
      { tap: 'shuttle', say: 'So take the shuttle itself: a quick click lifts it off its rail.' },
      { sel: 0 },
      { print: [-0.5, 0, -8.5], rest: 1.0, yaw: 0, say: 'Lay the streak where the shuttle ran, over all three plates.' },
      { go: [4.5, -2.0] },
      { exit: true },
    ],
    nope: [
      // with the shuttle still running, the streak can't go on the plates
      [{ tp: [-0.5, 1.02, -2.0], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.95 }, { print: [-0.5, 0, -8.5], rest: 1.0, yaw: 0 }, { go: [4.5, -2.0], n: 400 }, { exit: true, n: 400 }],
      // the shuttle on its own covers one plate
      [{ tp: [-0.5, 1.02, -2.0], yaw: 0 }, { tap: 'shuttle', when: 'A' }, { print: [-0.5, 0, -8.5], rest: 1.0, yaw: 0 }, { go: [4.5, -2.0], n: 400 }, { exit: true, n: 400 }],
      // a short streak fits beside the shuttle, but only covers two plates, and gets shoved into the void
      [{ tp: [-0.5, 1.02, -2.0], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 1.4 }, { until: 'T.shuttle().track.s > T.shuttle().track.len - 0.1', t: 6 }, { print: [-1.5, 0, -8.5], rest: 1.0, yaw: 0, settle: 0 }, { go: [4.5, -2.0], n: 400 }, { exit: true, n: 400 }],
      // printed in the air above the running shuttle, it falls onto it and gets carried off and shoved into the void
      [{ tp: [-0.5, 1.02, -2.0], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.95 }, { until: 'T.shuttle().track.s > 1.5 && T.shuttle().track.s < 2.3', t: 6 }, { print: [-0.5, 2.25, -8.5], yaw: 0, settle: 0 }, { wait: 6 }, { go: [4.5, -2.0], n: 400 }, { exit: true, n: 400 }],
      // two short streaks, one at each end
      [{ tp: [-0.5, 1.02, -2.0], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 0.9 }, { expose: 'shuttle', when: 'A', hold: 0.9 }, { until: 'T.shuttle().track.s > T.shuttle().track.len - 0.1', t: 6 }, { print: [-2.4, 0, -8.5], rest: 1.0, yaw: 0, settle: 0 }, { until: 'T.shuttle().track.s < 0.1', t: 6 }, { print: [1.4, 0, -8.5], rest: 1.0, yaw: 0, settle: 0 }, { go: [4.5, -2.0], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -9, 5, 0, 7], [6, -3, 8, -1, 6]], { pits: [[-5, -8, 5, -4]] });
      B.start(0, 1, -1);
      // across the void: three plates in a row on a strip of floor, and a shuttle gliding just above them
      B.plate('p1', -3, 1, -9); B.plate('p2', -1, 1, -9); B.plate('p3', 1, 1, -9);
      B.shuttle([-2.9, 1.35, -9], [0.9, 1.35, -9], { speed: 1.3, size: [1.0, 0.4, 1.0], orange: true });
      B.door(['p1', 'p2', 'p3'], 6, 1, -3, 6, 3, -1); B.solid(6, 4, -3, 6, 6, -1);
      B.exit(8, 1, -2);
    },
  },
  {
    name: 'Apex', film: 1, exposure: true, diff: 5,
    hint: 'The shuttle can only be seen through the high window, from the top of a bounce. You only have to see something to start an exposure, not to keep it going.',
    sol: [
      { tp: [1.5, 1.02, -1.0], yaw: 180 },
      { go: [1.5, 0.6], say: 'Step onto the jump pad in the corner and let it bounce you.' },
      { until: '__shutter.player.position.y > 6.6 && __shutter.player.velocity.y < 1.5 && T.shuttle().track.s > 0.4 && T.shuttle().track.s < 2.0 && T.shuttle().track.dir > 0', t: 30 },
      { expose: 'shuttle', hold: 2.9, say: 'At the top of a bounce, just as the shuttle sets off from the far end, you can see it through the high window: start exposing, and keep holding all the way down.' },
      { until: '__shutter.player.position.y < 2.2 && __shutter.player.velocity.y < 0', t: 3 },
      { go: [-1.0, -1.5] },
      { go: [2.5, -8.0] },
      { print: [0.5, 0, -11.5], rest: 1.0, yaw: 90, say: 'Lay the streak across the pit.' },
      { go: [0.5, -8.3] },
      { go: [0.5, -17.5], say: 'Walk across under the lasers.' },
      { exit: true },
    ],
    nope: [
      // a quick click at the top takes the shuttle itself: a stepping stone, and there is no jumping
      [{ tp: [1.5, 1.02, -1.0], yaw: 180 }, { go: [1.5, 0.6] }, { until: '__shutter.player.position.y > 6.6 && __shutter.player.velocity.y < 1.5 && T.shuttle().track.s > 0.4 && T.shuttle().track.s < 2.0 && T.shuttle().track.dir > 0', t: 30 }, { tap: 'shuttle' }, { until: '__shutter.player.position.y < 2.2 && __shutter.player.velocity.y < 0', t: 3 }, { go: [-1.0, -1.5], n: 400 }, { go: [0.5, -8.5], n: 400 }, { print: [0.5, 0.85, -12.5], yaw: 90 }, { tp: [0.5, 1.02, -8.2], yaw: 0 }, { runjump: 2 }, { exit: true, n: 400 }],
      // let go early and the streak is too short
      [{ tp: [1.5, 1.02, -1.0], yaw: 180 }, { go: [1.5, 0.6] }, { until: '__shutter.player.position.y > 6.6 && __shutter.player.velocity.y < 1.5 && T.shuttle().track.s > 0.4 && T.shuttle().track.s < 2.0 && T.shuttle().track.dir > 0', t: 30 }, { expose: 'shuttle', hold: 0.6 }, { until: '__shutter.player.position.y < 2.2 && __shutter.player.velocity.y < 0', t: 3 }, { go: [-1.0, -1.5], n: 400 }, { go: [0.5, -8.5], n: 400 }, { print: [0.5, 0, -11.0], rest: 1.0, yaw: 90 }, { tp: [0.5, 1.02, -8.2], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
      // and from the floor it can't be seen at all
      [{ tp: [-2.5, 1.02, -6.0], yaw: -90 }, { expose: 'shuttle', hold: 2.9 }, { go: [0.5, -8.5], n: 400 }, { print: [0.5, 0, -12.5], rest: 1.0, yaw: 90 }, { go: [0.5, -17.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -20, 4, 0, 9], [5, -10, 10, -1, 9]], { pits: [[-4, -14, 4, -10]] });
      B.start(0, 1, 0, -45);
      // a jump pad in the corner by the back wall, so you can bounce on it in place
      B.pad(1, 1, 0, { locked: true });
      // the wall between the hall and the gallery, with one high window
      B.solid(5, 1, -10, 5, 4, -1); B.solid(5, 8, -10, 5, 9, -1); B.solid(5, 5, -10, 5, 7, -7); B.solid(5, 5, -1, 5, 7, -1);
      B.glass(5, 5, -6, 5, 7, -2, { axis: 'x' });
      // the gallery: the shuttle runs on a raised floor, below the window
      B.solid(6, 1, -10, 10, 3, -1);
      B.shuttle([9, 4.0, -10], [9, 4.0, -2], { speed: 3.2, size: [1.0, 0.3, 1.2] });
      // a canopy of lasers over the void
      for (const z of [-10, -12, -14]) B.emitter(4, 2.75, z, 90, { locked: true });
      B.exit(0, 1, -18);
    },
  },
  {
    name: 'Ditto', film: 1, exposure: true, copy: true, diff: 5,
    hint: 'The amber door locks behind you and the shuttle stays here, so you get one streak. On Double-X film, photographing a print copies it.',
    sol: [
      { tp: [-3.0, 1.02, -4.0], yaw: 90 },
      { until: 'T.shuttle().track.s < 0.05 && T.shuttle().track.dir > 0', t: 6 },
      { js: 'const p = T.shuttle().body.position; T.look(p.x, p.y, p.z); __shutter.startExposure(); !!__shutter.expo', say: 'Expose the orange shuttle for its whole run: one long, heavy streak.' },
      { wait: 2.0 },
      { js: 'T.look(-5.5, 1.45, -3.75); __shutter.endExposure(); T.photo() + " " + T.dims()', say: 'Let go looking at the middle of its run.' },
      { go: [0.5, -8.0] },
      { go: [0.5, -11.0], say: 'Go through the one-way door. It locks behind you.' },
      { tp: [-1.5, 1.02, -10.5], yaw: 0 },
      { print: [-1.5, 0, -11.5], rest: 1.0, yaw: 0, say: 'Lay the streak across both plates.' },
      { snap: [-1.5, 1.15, -11.5], say: 'Photograph it: on Double-X that copies it, and the original keeps the plates down.' },
      { go: [4.5, -11.0] },
      { print: [4.5, 0, -15.5], rest: 1.0, yaw: 90, say: 'Lay the copy across the pit.' },
      { go: [4.5, -18.5] },
      { go: [0.5, -18.5] },
      { go: [0.5, -19.5], say: 'Into the doorway.' },
      { snap: [4.5, 1.15, -15.5], say: 'Copy the bridge behind you.' },
      { print: [0.5, 0, -23.5], rest: 1.0, yaw: 90, say: 'And lay that across the last pit.' },
      { exit: true },
    ],
    nope: [
      // the bridge alone: the door stays shut
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -11.0], n: 400 }, { go: [4.5, -11.0], n: 400 }, { print: [4.5, 0, -15.5], rest: 1.0, yaw: 90 }, { go: [4.5, -18.5], n: 400 }, { go: [0.5, -18.5], n: 400 }, { go: [0.5, -20.6], n: 400 }, { exit: true, n: 400 }],
      // the plates alone: no way over the void
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -11.0], n: 400 }, { tp: [-1.5, 1.02, -10.5], yaw: 0 }, { print: [-1.5, 0, -11.5], rest: 1.0, yaw: 0 }, { tp: [3.5, 1.02, -11.0], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
      // a copy of the shuttle itself holds only one plate
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -11.0], n: 400 }, { tp: [-1.5, 1.02, -10.5], yaw: 0 }, { print: [-4.5, 0, -11.5], rest: 1.0, yaw: 0 }, { snap: [-4.5, 1.15, -11.5] }, { print: [1.5, 0, -11.5], rest: 1.0, yaw: 0 }, { go: [4.5, -11.0], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -8, 4, 0, 7], [-6, -8, -5, 0, 4], [-1, -9, 1, -9, 7], [-6, -29, 6, -10, 7]], { pits: [[-6, -18, 6, -14], [-6, -26, 6, -22]] });
      B.start(0, 1, -1);
      B.glass(-5, 1, -8, -5, 4, 0, { axis: 'x' });
      B.shuttle([-6, 1.3, -7], [-6, 1.3, -1.5], { speed: 3, size: [0.9, 0.3, 1.0], orange: true });
      B.door([], -1, 1, -9, 1, 3, -9, { oneway: true }); B.solid(-1, 4, -9, 1, 7, -9);
      // two plates far apart, and the door they open beyond the first pit
      B.plate('pA', -5, 1, -12); B.plate('pB', 1, 1, -12);
      B.solid(-6, 1, -20, -2, 7, -20); B.solid(-1, 4, -20, 1, 7, -20); B.door(['pA', 'pB'], -1, 1, -20, 1, 3, -20); B.solid(2, 1, -20, 6, 7, -20);
      B.exit(0, 1, -28);
    },
  },
  {
    name: 'Curtain', film: 1, exposure: true, diff: 6,
    hint: 'Six lasers, two high and three wide, and all you can bring through the amber door is one flat slab. Anything falling leaves a streak, even a slab you just printed, and the slab is still there afterwards.',
    sol: [
      { tp: [3.0, 1.02, -3.5], yaw: -90 },
      { until: 'T.shuttle().track.s < 0.05 && T.shuttle().track.dir > 0', t: 6 },
      { js: 'const p = T.shuttle().body.position; T.look(p.x, p.y, p.z); __shutter.startExposure(); !!__shutter.expo', say: 'Expose the orange shuttle for its whole run: a long, flat slab.' },
      { wait: 2.1 },
      { js: 'T.look(6.5, 1.45, -3.0); __shutter.endExposure(); T.photo() + " " + T.dims()', say: 'Let go looking at the middle of its run.' },
      { go: [0.5, -6.5] },
      { go: [0.5, -10.5], say: 'Go through the one-way door. It locks behind you.' },
      { print: [1.0, 10.0, -16.0], yaw: 90, settle: 8, say: 'Print the slab high up near the ceiling, away from the pit. It falls...' },
      { js: 'const o = __shutter.L.objs.filter((q) => q.kind === "streak").pop(); T.look(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.startExposure(); !!__shutter.expo', say: '...so hold the shutter on it as it drops.' },
      { wait: 1.5 },
      { js: '__shutter.endExposure(); T.photo() + " " + T.dims()', say: 'Let go once it lands: the photo is a wall as long as the slab and as tall as its fall.' },
      { print: [-3.45, 0, -12.5], rest: 1.0, yaw: 0, say: 'Stand the wall right in front of the lasers.' },
      { go: [3.5, -12.0] },
      { go: [3.5, -17.5], say: 'Walk past.' },
      { snap: [1.0, 1.15, -16.0], say: 'The slab is still lying where it fell. Photograph it.' },
      { print: [0.5, 0, -21.5], rest: 1.0, yaw: 90, say: 'Lay it across the pit.' },
      { go: [0.5, -18.0] },
      { go: [0.5, -27.5] },
      { exit: true },
    ],
    nope: [
      // the slab lying on the floor is far too low to stop anything
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 2.1 }, { go: [0.5, -6.5], n: 400 }, { go: [0.5, -10.5], n: 400 }, { print: [-3.45, 0, -12.5], rest: 1.0, yaw: 90 }, { go: [3.5, -12.0], n: 400 }, { go: [3.5, -17.5], n: 400 }, { exit: true, n: 400 }],
      // nothing at all
      [{ go: [0.5, -6.5], n: 400 }, { go: [0.5, -10.5], n: 400 }, { go: [3.5, -12.0], n: 400 }, { go: [3.5, -17.5], n: 400 }, { exit: true, n: 400 }],
      // make the wall before the door and there is nothing left to bridge the void
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { expose: 'shuttle', when: 'A', hold: 2.1 }, { tp: [0.5, 1.02, -1.0], yaw: 0 }, { print: [-1.0, 7.4, -4.0], yaw: 90, settle: 8 },
        { js: 'const o = __shutter.L.objs.filter((q) => q.kind === "streak").pop(); T.look(o.body.position.x, o.body.position.y, o.body.position.z); __shutter.startExposure(); !!__shutter.expo' }, { wait: 1.5 }, { js: '__shutter.endExposure()' },
        { go: [0.5, -6.5], n: 400 }, { go: [0.5, -10.5], n: 400 }, { print: [-3.45, 0, -12.5], rest: 1.0, yaw: 0 }, { go: [3.5, -12.0], n: 400 }, { go: [3.5, -17.5], n: 400 }, { tp: [0.5, 1.02, -18.4], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
      // the shuttle itself stops one laser
      [{ tp: [3.0, 1.02, -3.5], yaw: -90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -6.5], n: 400 }, { go: [0.5, -10.5], n: 400 }, { print: [-3.45, 0, -12.5], rest: 1.0, yaw: 90 }, { go: [3.5, -12.0], n: 400 }, { go: [3.5, -17.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -7, 4, 0, 7], [5, -7, 6, 0, 4], [-1, -8, 1, -8, 7], [-5, -30, 5, -9, 11]], { pits: [[-5, -24, 5, -20]] });
      B.start(0, 1, -1, -40);
      B.glass(5, 1, -7, 5, 4, 0, { axis: 'x' });
      B.shuttle([6, 1.3, -6], [6, 1.3, -1], { speed: 2.5, size: [0.9, 0.3, 1.0], orange: true });
      B.door([], -1, 1, -8, 1, 3, -8, { oneway: true }); B.solid(-1, 4, -8, 1, 7, -8);
      // two rows of three lasers along the left wall
      for (const z of [-12, -13, -14]) for (const y of [1, 2]) B.emitter(-5, y, z, -90, { locked: true });
      B.exit(0, 1, -28);
    },
  },
  {
    name: 'Pylon', film: 1, exposure: true, diff: 6,
    hint: 'Orange bars need something under both ends, and the pit is wider than any bar you can make. There is a pedestal at the bottom, and a crate that falls exactly as far as the pit is deep.',
    sol: [
      { tp: [1.5, 1.02, -2.0], yaw: -90 },
      { expose: [3.5, 3.5, -2.5], hold: 1.0, say: 'Hold the shutter on the falling crate: a pillar as tall as its tube.' },
      { go: [0.5, -6.3] },
      { print: [0.5, 0, -11.5], rest: -2.36, yaw: 0, say: 'Stand it on the pedestal down in the pit. Its top comes up level with the floor.' },
      { tp: [-4.0, 1.02, -3.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.3, say: 'Expose the orange shuttle: a bar five and a half metres long.' },
      { go: [0.5, -5.0] },
      { print: [0.5, 0, -8.7], rest: 1.0, yaw: 90, say: 'Lay it from the edge onto the near half of the pillar.' },
      { tp: [-4.0, 1.02, -3.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.3, say: 'Expose the shuttle again.' },
      { go: [0.5, -5.0] },
      { print: [0.5, 0, -14.3], rest: 1.0, yaw: 90, say: 'And lay this one from the far half of the pillar to the far side.' },
      { go: [0.5, -21.5], say: 'Cross.' },
      { exit: true },
    ],
    nope: [
      // without the pillar each bar tips into the void
      [{ tp: [-4.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -5.0], n: 400 }, { print: [0.5, 0, -8.7], rest: 1.0, yaw: 90 }, { tp: [-4.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -5.0], n: 400 }, { print: [0.5, 0, -14.3], rest: 1.0, yaw: 90 }, { go: [0.5, -21.5], n: 400 }, { exit: true, n: 400 }],
      // a bar sticking out from the edge, and a jump from its tip
      [{ tp: [-4.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -3.0], n: 400 }, { print: [0.5, 0, -6.2], rest: 1.0, yaw: 90 }, { tp: [0.5, 1.02, -4.0], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
      // the crate itself is far too short a pillar
      [{ until: 'T.fastIn(-6)', t: 4 }, { snap: 'crate' }, { go: [0.5, -6.3], n: 400 }, { print: [0.5, 0, -11.5], rest: -2.36, yaw: 0 }, { tp: [-4.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -5.0], n: 400 }, { print: [0.5, 0, -8.7], rest: 1.0, yaw: 90 }, { tp: [-4.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -5.0], n: 400 }, { print: [0.5, 0, -14.3], rest: 1.0, yaw: 90 }, { go: [0.5, -21.5], n: 400 }, { exit: true, n: 400 }],
      // one bar and a running jump off its end across the far gap: the laser overhead catches you
      [{ tp: [1.5, 1.02, -2], yaw: -90 }, { expose: [3.5, 3.5, -2.5], hold: 1 }, { go: [0.5, -6.3] }, { print: [0.5, 0, -11.5], rest: -2.36, yaw: 0 },
        { tp: [-4, 1.02, -3], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -5] }, { print: [0.5, 0, -8.7], rest: 1, yaw: 90 },
        { go: [0.5, -6.6] }, { face: 0 }, { runjump: 1, late: true }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-5, -24, 5, 0, 10], [-7, -6, -6, 0, 4]], { pits: [[-5, -16, 5, -8]] });
      B.start(0, 1, -1);
      B.chute(3, -3, 1, 6);
      // a pedestal at the bottom of the pit, its top a pillar's height below the floor
      B.box([0, -4, -12], [1, -2.36, -11], 'trim');
      // lasers high over both gaps: you walk the bars under them, but jumping a gap takes your head into one
      for (const z of [-10, -15]) B.emitter(-5, 3, z, -90, { locked: true, fixed: true });
      // the orange shuttle's gallery
      B.glass(-6, 1, -6, -6, 4, 0, { axis: 'x' });
      B.shuttle([-7, 1.3, -5.5], [-7, 1.3, -1], { speed: 2, size: [1.0, 0.3, 1.0], orange: true });
      B.exit(0, 1, -22);
    },
  },
  {
    name: 'Wingspan', film: 1, exposure: true, diff: 6,
    hint: 'Each plate is sealed in a glass case, but the cases don’t quite reach the floor. A print only needs its middle where you can see it.',
    sol: [
      { tp: [0.5, 1.02, -0.5], yaw: 180 },
      { expose: 'shuttle', when: 'A', hold: 2.5, say: 'Expose the orange shuttle for its whole run: over ten metres long.' },
      { go: [0.5, -5.0] },
      { print: [0.5, 0, -7.5], rest: 1.0, yaw: 0, say: 'Lay it across the corridor at floor level, so its ends slide under both cases and onto both plates.' },
      { go: [0.5, -13.5] },
      { exit: true },
    ],
    nope: [
      // the shuttle itself can't reach either plate
      [{ tp: [0.5, 1.02, -0.5], yaw: 180 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -5.0], n: 400 }, { print: [-0.6, 0, -7.5], rest: 1.0, yaw: 0 }, { go: [0.5, -13.5], n: 400 }, { exit: true, n: 400 }],
      // a shorter streak only reaches one case
      [{ tp: [0.5, 1.02, -0.5], yaw: 180 }, { expose: 'shuttle', when: 'A', hold: 1.5 }, { go: [0.5, -5.0], n: 400 }, { print: [-0.9, 0, -7.5], rest: 1.0, yaw: 0 }, { go: [0.5, -13.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-1, -16, 1, -4, 7], [-5, -9, -2, -6, 6], [2, -9, 5, -6, 6], [-6, -3, 6, 2, 5]]);
      B.start(0, 1, -1, 0);
      // the shuttle runs right across the hall behind glass, end to end
      B.glass(-6, 1, 1, 6, 5, 1, { axis: 'z' });
      B.shuttle([-5, 1.3, 2], [4.5, 1.3, 2], { speed: 4, size: [1.0, 0.3, 1.0], orange: true });
      // two glass cases facing each other across the corridor, each with a plate at the back, and a gap along the bottom
      B.glass(-2, 1.45, -9, -2, 6, -6, { axis: 'x', face: 'max' }); B.plate('pL', -5, 1, -8);
      B.glass(2, 1.45, -9, 2, 6, -6, { axis: 'x', face: 'min' }); B.plate('pR', 5, 1, -8);
      B.solid(-1, 4, -12, 1, 7, -12); B.door(['pL', 'pR'], -1, 1, -12, 1, 3, -12);
      B.exit(0, 1, -14);
    },
  },
  {
    name: 'Midstream', film: 1, exposure: true, copy: true, postcard: true, diff: 7,
    hint: 'One streak gets through the amber door, and it is needed both as a bridge and as a weight on the vault’s plates. Double-X copies anything, even what you’re standing on, and a parcel leaves a postcard turned the way it went in.',
    sol: [
      { tp: [-3.0, 1.02, -4.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.1, say: 'Expose the orange shuttle for its whole run.' },
      { go: [0.5, -7.0] },
      { go: [0.5, -10.0], say: 'Go through the one-way door. It locks behind you.' },
      { print: [0.5, 0, -13.5], rest: 1.0, yaw: 90, say: 'Lay the streak across the pit.' },
      { go: [0.5, -13.5], say: 'Walk out onto it. From the middle you can see into the vault.' },
      { snap: [10.5, 2.3, -12.5], say: 'Photograph the spot in the vault, through its window.' },
      { print: [2.6, 2.02, -13.5], yaw: -90, say: 'Print the postcard beside you, hanging over the void.' },
      { snap: [0.5, 1.15, -12.0], say: 'Copy the bridge you are standing on.' },
      { print: [2.6, 2.0, -13.5], yaw: 90, say: 'Print the copy right on the card, lying flat along it: it drops through and lands across both plates in the vault.' },
      { wait: 1.5 },
      { go: [0.5, -17.5], say: 'Cross to the door.' },
      { exit: true },
    ],
    nope: [
      // a bridge alone: the door stays shut
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.1 }, { go: [0.5, -7.0], n: 400 }, { go: [0.5, -10.0], n: 400 }, { print: [0.5, 0, -13.5], rest: 1.0, yaw: 90 }, { go: [0.5, -17.5], n: 400 }, { exit: true, n: 400 }],
      // a quick click takes the shuttle itself, far too short to bridge the pit
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -7.0], n: 400 }, { go: [0.5, -10.0], n: 400 }, { print: [0.5, 0, -12.0], rest: 1.0, yaw: 90 }, { go: [0.5, -17.5], n: 400 }, { exit: true, n: 400 }],
      // post the copy crosswise (from back on the shore, where it fits) and it lands across the vault, not along the plates
      [{ tp: [-3.0, 1.02, -4.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.1 }, { go: [0.5, -7.0], n: 400 }, { go: [0.5, -10.0], n: 400 }, { print: [0.5, 0, -13.5], rest: 1.0, yaw: 90 }, { go: [0.5, -13.5], n: 400 }, { snap: [10.5, 2.3, -12.5] }, { print: [2.6, 2.02, -13.5], yaw: -90 }, { snap: [0.5, 1.15, -12.0] }, { go: [0.5, -10.0], n: 400 }, { print: [2.6, 2.0, -13.5], yaw: 0 }, { wait: 1.5 }, { go: [0.5, -17.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -7, 4, 0, 6], [-6, -7, -5, 0, 4], [-1, -8, 1, -8, 6], [-6, -24, 6, -9, 7], [7, -17, 10, -9, 5]], { pits: [[-6, -16, 6, -12]] });
      B.start(0, 1, -1);
      const home = B.spot(-4, 1, -10, 180);
      B.glass(-5, 1, -7, -5, 4, 0, { axis: 'x' });
      B.shuttle([-6, 1.3, -6], [-6, 1.3, -1], { speed: 2.5, size: [1.4, 0.3, 1.0], orange: true });
      B.door([], -1, 1, -8, 1, 3, -8, { oneway: true }); B.solid(-1, 4, -8, 1, 6, -8);
      // the vault along the east side of the pit: one window, two plates and a spot, and a card back out
      B.solid(7, 1, -17, 7, 5, -15); B.solid(7, 1, -12, 7, 5, -9); B.solid(7, 4, -14, 7, 5, -13);
      B.glass(7, 1, -14, 7, 3, -13, { axis: 'x', face: 'min' });
      B.plate('v1', 9, 1, -15); B.plate('v2', 9, 1, -11);
      B.spot(10, 1, -13, 90);
      B.card(8, 1, -16, 0, home, { locked: true });
      // the door out, beyond the pit
      B.solid(-6, 1, -19, -2, 7, -19); B.solid(2, 1, -19, 6, 7, -19); B.solid(-1, 4, -19, 1, 7, -19); B.door(['v1', 'v2'], -1, 1, -19, 1, 3, -19);
      B.exit(0, 1, -22);
    },
  },
  {
    name: 'Trestle', film: 2, exposure: true, copy: true, diff: 7,
    hint: 'Three spans, two pedestals, and only one bar gets through the amber door. On Double-X you can copy even the bar you’re standing on, and the crate in the tube falls exactly as far as the pedestals are deep.',
    sol: [
      { tp: [-3.0, 1.02, -2.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.3, say: 'Expose the orange shuttle for its whole run: a bar five and a half metres long.' },
      { go: [0.5, -4.5] },
      { go: [0.5, -7.5], say: 'Through the one-way door.' },
      { tp: [1.5, 1.02, -7.5], yaw: -90 },
      { expose: [3.5, 3.5, -7.5], hold: 1.0, say: 'Hold the shutter on the falling crate: a pillar exactly as tall as the pedestals are deep.' },
      { print: [0.5, 0, -14.0], rest: -2.36, yaw: 0, say: 'Stand it on the first pedestal.' },
      { expose: [3.5, 3.5, -7.5], hold: 1.0, say: 'And another.' },
      { tp: [-2.5, 1.02, -8.5], yaw: 0 },
      { print: [0.5, 0, -19.6], rest: -2.36, yaw: 0, say: 'On the second pedestal.' },
      { sel: 0 },
      { print: [0.5, 0, -11.2], rest: 1.0, yaw: 90, say: 'Lay the bar from the edge to the first pillar.' },
      { go: [0.5, -8.0] },
      { go: [0.5, -13.6], say: 'Walk out to the pillar.' },
      { snap: [0.5, 1.15, -11.5], say: 'Copy the bar you are standing on.' },
      { print: [0.5, 0, -16.8], rest: 1.0, yaw: 90, say: 'Lay the copy on to the second pillar.' },
      { go: [0.5, -19.2] },
      { snap: [0.5, 1.15, -17.0], say: 'Copy that one too.' },
      { print: [0.5, 0, -22.45], rest: 1.0, yaw: 90, say: 'And lay it to the far side.' },
      { go: [0.5, -26.5] },
      { exit: true },
    ],
    nope: [
      // no pillars: the bar tips into the void
      [{ tp: [-3.0, 1.02, -2.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -4.5], n: 400 }, { go: [0.5, -7.5], n: 400 }, { tp: [-2.5, 1.02, -8.5], yaw: 0 }, { print: [0.5, 0, -11.2], rest: 1.0, yaw: 90 }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -26.5], n: 400 }, { exit: true, n: 400 }],
      // one pillar is one span short
      [{ tp: [-3.0, 1.02, -2.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -4.5], n: 400 }, { go: [0.5, -7.5], n: 400 }, { tp: [1.5, 1.02, -7.5], yaw: -90 }, { expose: [3.5, 3.5, -7.5], hold: 1.0 }, { print: [0.5, 0, -14.0], rest: -2.36, yaw: 0 }, { tp: [-2.5, 1.02, -8.5], yaw: 0 }, { print: [0.5, 0, -11.2], rest: 1.0, yaw: 90 }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -13.6], n: 400 }, { snap: [0.5, 1.15, -11.5] }, { print: [0.5, 0, -16.8], rest: 1.0, yaw: 90 }, { go: [0.5, -26.5], n: 400 }, { exit: true, n: 400 }],
      // crates are far too short to be pillars
      [{ tp: [-3.0, 1.02, -2.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -4.5], n: 400 }, { go: [0.5, -7.5], n: 400 }, { tp: [1.5, 1.02, -7.5], yaw: -90 }, { until: 'T.fastIn(-6)', t: 4 }, { snap: 'crate' }, { print: [0.5, 0, -14.0], rest: -2.36, yaw: 0 }, { tp: [-2.5, 1.02, -8.5], yaw: 0 }, { sel: 0 }, { print: [0.5, 0, -11.2], rest: 1.0, yaw: 90 }, { go: [0.5, -8.0], n: 400 }, { go: [0.5, -26.5], n: 400 }, { exit: true, n: 400 }],
      // two bars and a running jump off the second across the last gap: the laser overhead catches you
      [{ tp: [-3, 1.02, -2], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [0.5, -4.5] }, { go: [0.5, -7.5] }, { tp: [1.5, 1.02, -7.5], yaw: -90 },
        { expose: [3.5, 3.5, -7.5], hold: 1 }, { print: [0.5, 0, -14], rest: -2.36, yaw: 0 }, { expose: [3.5, 3.5, -7.5], hold: 1 }, { tp: [-2.5, 1.02, -8.5], yaw: 0 },
        { print: [0.5, 0, -19.6], rest: -2.36, yaw: 0 }, { sel: 0 }, { print: [0.5, 0, -11.2], rest: 1, yaw: 90 }, { go: [0.5, -8] }, { go: [0.5, -13.6] },
        { snap: [0.5, 1.15, -11.5] }, { print: [0.5, 0, -16.8], rest: 1, yaw: 90 }, { face: 0 }, { runjump: 1, late: true }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -5, 4, 0, 6], [-6, -5, -5, 0, 4], [-1, -6, 1, -6, 6], [-5, -28, 5, -7, 8]], { pits: [[-5, -24, 5, -10]] });
      B.start(0, 1, -1);
      B.glass(-5, 1, -5, -5, 4, 0, { axis: 'x' });
      B.shuttle([-6, 1.3, -4.5], [-6, 1.3, 0], { speed: 2, size: [1.0, 0.3, 1.0], orange: true });
      B.door([], -1, 1, -6, 1, 3, -6, { oneway: true }); B.solid(-1, 4, -6, 1, 6, -6);
      B.chute(3, -8, 1, 6);
      // two pedestals down in the pit, a pillar's height below the floor
      B.box([0, -4, -14.5], [1, -2.36, -13.5], 'trim'); B.box([0, -4, -20.1], [1, -2.36, -19.1], 'trim');
      // lasers high over every gap: you walk the bars under them, but jumping a gap takes your head into one
      for (const z of [-12, -17, -23]) B.emitter(-5, 3, z, -90, { locked: true, fixed: true });
      B.exit(0, 1, -27);
    },
  },
  {
    name: 'Dodge and Burn', film: 1, exposure: true, diff: 7,
    hint: 'One streak for two pits, and nothing in the red light can be photographed. A print counts as in the red only if its middle is.',
    sol: [
      { tp: [-3.0, 1.02, -6.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 2.4, say: 'Expose the shuttle for its whole run: eleven metres.' },
      { go: [0.5, -11.0] },
      { go: [0.5, -14.0], say: 'Through the one-way door.' },
      { print: [0.5, 0, -20.0], rest: 1.0, yaw: 90, say: 'Lay it across the first pit, but slide it far over, so its middle is past the edge of the red light.' },
      { go: [0.5, -15.0] },
      { go: [0.5, -23.0], say: 'Cross.' },
      { go: [2.5, -23.0] },
      { snap: [0.5, 1.15, -21.5], say: 'Its middle is out of the light, so you can photograph it again.' },
      { print: [0.5, 0, -27.5], rest: 1.0, yaw: 90, say: 'Lay it across the second pit.' },
      { go: [0.5, -24.0] },
      { go: [0.5, -38.0] },
      { exit: true },
    ],
    nope: [
      // laid neatly across the middle of the pit, it sits in the red for good
      [{ tp: [-3.0, 1.02, -6.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 2.4 }, { go: [0.5, -11.0], n: 400 }, { go: [0.5, -14.0], n: 400 }, { tp: [3.5, 1.02, -13.5], yaw: 0 }, { print: [0.5, 0, -18.5], rest: 1.0, yaw: 90 }, { go: [0.5, -15.0], n: 400 }, { go: [0.5, -23.0], n: 400 }, { go: [2.5, -23.0], n: 400 }, { snap: [0.5, 1.15, -21.5] }, { print: [0.5, 0, -27.5], rest: 1.0, yaw: 90 }, { go: [0.5, -24.0], n: 400 }, { go: [0.5, -38.0], n: 400 }, { exit: true, n: 400 }],
      // and the pits are too wide to jump
      [{ go: [0.5, -11.0], n: 400 }, { go: [0.5, -14.0], n: 400 }, { tp: [0.5, 1.02, -14.0], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -11, 4, 0, 6], [-6, -11, -5, 0, 4], [-1, -12, 1, -12, 6], [-4, -40, 4, -13, 7]], { pits: [[-4, -21, 4, -17], [-4, -30, 4, -26]] });
      B.start(0, 1, -1);
      B.glass(-5, 1, -11, -5, 4, 0, { axis: 'x' });
      B.shuttle([-6, 1.3, -10], [-6, 1.3, 0], { speed: 4.4, size: [1.0, 0.3, 1.0] });
      B.door([], -1, 1, -12, 1, 3, -12, { oneway: true }); B.solid(-1, 4, -12, 1, 6, -12);
      // red light over the near side and most of the first pit
      B.safelight(-4, 1, -19, 4, 7, -13);
      B.exit(0, 1, -38);
    },
  },
  {
    name: 'Push Process', film: 1, exposure: true, diff: 8,
    hint: 'The plates are sealed in the vault, and only the shuttle goes in there, down its long low tunnel. It shoves whatever is lying on its rail ahead of it.',
    sol: [
      { tp: [-4.5, 1.02, -1.5], yaw: 0 },
      { expose: 'shuttle', when: 'A', hold: 1.8, say: 'Expose the shuttle as it sets off, and let go when the streak is about five and a half metres long.' },
      { until: 'T.shuttle().track.s < 0.3 && T.shuttle().track.dir > 0', t: 14 },
      { print: [-2.2, 0, -3.5], rest: 1.0, yaw: 0, settle: 0, say: 'Next time it sets off, print the streak on the rail ahead of it, poking into the tunnel.' },
      { wait: 6.5, say: 'The shuttle shoves it down the tunnel and leaves it lying across both plates in the vault.' },
      { go: [-5.0, 0.5] },
      { exit: true },
    ],
    nope: [
      // beside the rail it just lies there
      [{ tp: [-4.5, 1.02, -1.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 1.8 }, { print: [-2.9, 0, -2.4], rest: 1.0, yaw: 0 }, { wait: 6.5 }, { go: [-5.0, 0.5], n: 400 }, { exit: true, n: 400 }],
      // too short, it only reaches the first plate
      [{ tp: [-4.5, 1.02, -1.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 0.8 }, { until: 'T.shuttle().track.s < 0.3 && T.shuttle().track.dir > 0', t: 14 }, { print: [-4.15, 0, -3.5], rest: 1.0, yaw: 0, settle: 0 }, { wait: 6.5 }, { go: [-5.0, 0.5], n: 400 }, { exit: true, n: 400 }],
      // in front of the shuttle on its way back, it gets shoved the wrong way, into the void
      [{ tp: [-4.5, 1.02, -1.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 1.8 }, { until: 'T.shuttle().track.s < 6.5 && T.shuttle().track.dir < 0', t: 14 }, { print: [-3.2, 0, -3.5], rest: 1.0, yaw: 0, settle: 0 }, { wait: 8 }, { go: [-5.0, 0.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-12, -6, -1, 0, 6], [0, -4, 5, -4, 1], [6, -6, 14, -1, 4], [-1, 0, 14, 1, 4], [-6, 1, -4, 3, 6]], { pits: [[-12, -5, -8, -3]] });
      B.start(-4, 1, -1);
      // the shuttle runs along the hall, through a long low tunnel in the thick wall, into the sealed vault
      B.shuttle([-7, 1.0, -4], [6, 1.0, -4], { speed: 2.5, size: [1.0, 0.5, 0.6], orange: true });
      B.box([0, 1.6, -4], [6, 2, -3]);
      B.plate('v1', 8, 1, -4); B.plate('v2', 11, 1, -4);
      // a window onto the vault from the passage round the back
      B.glass(6, 1, -1, 14, 4, -1, { axis: 'z' });
      B.door(['v1', 'v2'], -6, 1, 1, -4, 3, 1); B.solid(-6, 4, 1, -4, 6, 1);
      B.exit(-5, 1, 3);
    },
  },
  {
    name: 'Blueprint', film: 1, exposure: true, copy: true, diff: 8,
    hint: 'Walking through the light leak fogs every photo you carry, and the plates beside the leak hold the far door open. On Double-X, photographing a print copies it and leaves the original where it is.',
    sol: [
      { tp: [6.5, 1.02, -0.5], yaw: 0 },
      { expose: 'shuttle', when: 'A', hold: 2.3, say: 'From the booth, expose the shuttle for its whole run: a long streak.' },
      { go: [3.5, -0.5] },
      { go: [-3.0, -8.0] },
      { go: [-3.0, -11.0], say: 'Round the screen and down the hall.' },
      { go: [0.5, -16.5] },
      { print: [0.5, 0, -18.5], rest: 1.0, yaw: 0, say: 'Lay it across both plates by the light leak.' },
      { go: [0.5, -23.5], say: 'Walk through the leak with nothing on your film.' },
      { snap: [0.5, 1.15, -18.5], say: 'From the far side, photograph the streak back through the leak. Double-X copies it, and the original keeps the plates down.' },
      { go: [3.5, -25.5] },
      { go: [6.5, -25.5] },
      { print: [11.0, 0, -25.5], rest: 1.0, yaw: 0, say: 'Round the corner, lay the copy across the pit.' },
      { go: [17.0, -25.5] },
      { exit: true },
    ],
    nope: [
      // carried through the leak, the streak fogs away
      [{ tp: [6.5, 1.02, -0.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [3.5, -0.5], n: 400 }, { go: [-3.0, -8.0], n: 400 }, { go: [-3.0, -11.0], n: 400 }, { go: [0.5, -16.5], n: 400 }, { go: [0.5, -23.5], n: 400 }, { go: [3.5, -25.5], n: 400 }, { go: [6.5, -25.5], n: 400 }, { print: [11.0, 0, -25.5], rest: 1.0, yaw: 0 }, { go: [17.0, -25.5], n: 400 }, { exit: true, n: 400 }],
      // a copy made on this side fogs just the same
      [{ tp: [6.5, 1.02, -0.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [3.5, -0.5], n: 400 }, { go: [-3.0, -8.0], n: 400 }, { go: [-3.0, -11.0], n: 400 }, { go: [0.5, -16.5], n: 400 }, { print: [0.5, 0, -18.5], rest: 1.0, yaw: 0 }, { snap: [0.5, 1.15, -18.5] }, { go: [0.5, -23.5], n: 400 }, { go: [3.5, -25.5], n: 400 }, { go: [6.5, -25.5], n: 400 }, { print: [11.0, 0, -25.5], rest: 1.0, yaw: 0 }, { go: [17.0, -25.5], n: 400 }, { exit: true, n: 400 }],
      // from this side of the leak the bridge can only be printed as far round as you can see, nowhere near the void
      [{ tp: [6.5, 1.02, -0.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.3 }, { go: [3.5, -0.5], n: 400 }, { go: [-3.0, -8.0], n: 400 }, { go: [-3.0, -11.0], n: 400 }, { go: [3.5, -20.5], n: 400 }, { print: [3.0, 0, -25.5], rest: 1.0, yaw: 0 }, { go: [0.5, -23.5], n: 400 }, { go: [-0.5, -25.5], n: 400 }, { go: [17.0, -25.5], n: 400 }, { exit: true, n: 400 }],
      // walk through the leak first: from down there the screen hides the shuttle
      [{ go: [-3.0, -8.0], n: 400 }, { go: [-3.0, -11.0], n: 400 }, { go: [0.5, -16.5], n: 400 }, { go: [0.5, -23.5], n: 400 }, { until: 'T.shuttle().track.s < 0.05', t: 6 }, { expose: 'shuttle', hold: 2.3 }, { print: [0.5, 0, -18.5], rest: 1.0, yaw: 0 }, { until: 'T.shuttle().track.s < 0.05', t: 6 }, { expose: 'shuttle', hold: 2.3 }, { go: [3.5, -25.5], n: 400 }, { go: [6.5, -25.5], n: 400 }, { print: [11.0, 0, -25.5], rest: 1.0, yaw: 0 }, { go: [17.0, -25.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -21, 4, 0, 6], [5, -1, 12, 0, 5], [5, 1, 12, 2, 4], [-4, -27, 4, -22, 6], [5, -27, 20, -25, 6]], { pits: [[9, -27, 13, -25]] });
      B.start(0, 1, -1, -70);
      // the shuttle's booth at the top of the hall, far from the leak, and a screen across the hall so it can't be seen from down there
      B.solid(-2, 1, -10, 4, 6, -10);
      B.glass(5, 1, 1, 12, 4, 1, { axis: 'z' });
      B.shuttle([5, 1.3, 2], [12, 1.3, 2], { speed: 3.5, size: [1.0, 0.3, 1.0], orange: true });
      // the plates by the leak, and the leak right across the hall
      B.plate('n1', -3, 1, -19); B.plate('n2', 3, 1, -19);
      B.leak(-4, 1, -22, 4, 6, -22);
      // round the corner beyond: the void, and the door the plates open
      B.door(['n1', 'n2'], 16, 1, -27, 16, 3, -25); B.solid(16, 4, -27, 16, 6, -25);
      B.exit(19, 1, -26);
    },
  },
  {
    name: 'Rack Focus', film: 1, exposure: true, zoom: true, diff: 8,
    hint: 'The freight car is far too tall for the crawlspace, you can only see it up close, and nothing in the red light can be photographed. On Zoom film a print is sized by how far away its subject was, and a long exposure isn’t taken until you let go.',
    sol: [
      { tp: [2.5, 1.02, -3.6], yaw: 0 },
      { until: 'T.shuttle().track.s < 0.05 && T.shuttle().track.dir > 0', t: 6 },
      { js: 'const p = T.shuttle().body.position; T.look(p.x, p.y, p.z); __shutter.startExposure(); !!__shutter.expo', say: 'Stand by the way out of the booth and start exposing the freight car as it sets off...' },
      { go: [2.5, -1.3], say: '...and keep the shutter open as you run out of the booth...' },
      { go: [-11.5, -1.3], say: '...and right down the hall.' },
      { js: '__shutter.endExposure(); T.photo() + " " + T.dims()', say: 'Let go out here, fifteen metres away: that is where the photo counts as taken from.' },
      { go: [-13.5, -1.5] },
      { print: [-16.5, 0, -1.5], rest: 1.0, yaw: 90, scale: 0.2, say: 'Print it into the crawlspace across the pit. From that far a shot it comes out a fifth of the size, and it lies across both plates.' },
      { go: [-11.0, 0.5] },
      { exit: true },
    ],
    nope: [
      // let go in the booth and it is far too big for the crawlspace
      [{ tp: [5.0, 1.02, -3.8], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { go: [2.5, -3.6], n: 400 }, { go: [2.5, -1.3], n: 400 }, { go: [-13.5, -1.5], n: 400 }, { print: [-16.5, 0, -1.5], rest: 1.0, yaw: 90, scale: 1.7 }, { go: [-11.0, 0.5], n: 400 }, { exit: true, n: 400 }],
      // printed out in the hall it sits in the red, so it can't be photographed again from far off
      [{ tp: [5.0, 1.02, -3.8], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { go: [2.5, -3.6], n: 400 }, { go: [2.5, -1.3], n: 400 }, { go: [-6.0, -0.4], n: 400 }, { print: [-6.0, 0, -2.2], rest: 1.0, yaw: 0, scale: 1.05 }, { go: [-13.5, -1.0], n: 400 }, { snap: [-6.0, 2.0, -2.2] }, { print: [-16.5, 0, -1.5], rest: 1.0, yaw: 90, scale: 0.2 }, { go: [-11.0, 0.5], n: 400 }, { exit: true, n: 400 }],
      // the car itself is too tall and too short
      [{ tp: [5.0, 1.02, -3.8], yaw: 0 }, { tap: 'shuttle', when: 'A' }, { go: [2.5, -3.6], n: 400 }, { go: [2.5, -1.3], n: 400 }, { go: [-13.5, -1.5], n: 400 }, { print: [-16.5, 0, -1.5], rest: 1.0, yaw: 90, scale: 0.81 }, { go: [-11.0, 0.5], n: 400 }, { exit: true, n: 400 }],
      // out in the hall the car can't be seen at all, even from where it would come out small enough
      [{ go: [2.5, -3.6], n: 400 }, { go: [2.5, -1.3], n: 400 }, { go: [-8.5, -0.4], n: 400 }, { until: 'T.shuttle().track.s > T.shuttle().track.len - 0.1', t: 6 }, { expose: 'shuttle', hold: 2.0 }, { go: [-13.5, -1.5], n: 400 }, { print: [-16.5, 0, -1.5], rest: 1.0, yaw: 90, scale: 0.22 }, { go: [-11.0, 0.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[0, -6, 9, -4, 5], [0, -3, 2, -1, 4], [-14, -3, -1, -1, 5], [-16, -3, -15, -1, 5], [-20, -3, -17, -1, 3], [-12, 0, -10, 2, 5]], { pits: [[-16, -3, -15, -1]] });
      B.start(5, 1, -4, 0);
      // the freight car shuttles in a glass case along the booth's back wall
      B.glassCase(1, 1, -6, 8, 3, -6);
      B.solid(0, 1, -3, 1, 4, -3);
      B.shuttle([1, 1.0, -6], [8, 1.0, -6], { speed: 4, size: [1.0, 2.0, 0.8], orange: true });
      // across the void at the end of the hall, a low crawlspace with two plates
      B.box([-20, 1.55, -3], [-16, 4, 0], 'trim');
      B.plate('c1', -17, 1, -3); B.plate('c2', -17, 1, -1);
      // red light everywhere you can stand or print, except in the car's case
      B.safelight(0, 1, -5, 9, 5, -4); B.safelight(0, 4.06, -6, 9, 5, -6); B.safelight(0, 1, -6, 0, 4, -6); B.safelight(9, 1, -6, 9, 4, -6);
      B.safelight(0, 1, -3, 2, 4, -1); B.safelight(-16, 1, -3, -1, 5, -1);
      B.door(['c1', 'c2'], -12, 1, 0, -10, 3, 0); B.solid(-12, 4, 0, -10, 5, 0);
      B.exit(-11, 1, 2);
    },
  },
  {
    name: 'Sizing Up', film: 1, exposure: true, copy: true, zoom: true, diff: 8,
    hint: 'One streak through the amber door, two jobs at two sizes: a key for the letterbox pen and a bridge beyond the door it opens. Double-X copies a print, and Zoom sizes each copy by how far away you took it.',
    sol: [
      { tp: [-3.0, 1.02, -3.0], yaw: 90 },
      { expose: 'shuttle', when: 'A', hold: 1.7, say: 'Expose the orange shuttle for its whole run.' },
      { go: [0.5, -6.5] },
      { go: [0.5, -9.5], say: 'Through the one-way door.' },
      { zprint: [4.5, 0, -12.0], rest: 1.0, yaw: 90, scale: 1.0, from: [-1, 0.4], say: 'Print it on the floor at its own size, as your master.' },
      { tp: [4.5, 1.02, -16.5], yaw: 0 },
      { snap: [4.5, 1.15, -12.0], say: 'From four and a half metres off, copy it.' },
      { tp: [-4.0, 1.02, -12.5], yaw: 90 },
      { print: [-6.5, 2.3, -12.5], yaw: 90, scale: 0.53, say: 'Print the copy just through the letterbox: shot from that far, it comes out half size, and drops across both plates in the pen.' },
      { tp: [4.5, 1.02, -15.0], yaw: 0 },
      { snap: [4.5, 1.15, -12.0], say: 'Now copy the master again from close up.' },
      { go: [0.5, -16.0] },
      { go: [0.5, -19.0], say: 'Through the door the key opened.' },
      { print: [0.5, 0, -25.0], rest: 1.0, yaw: 90, scale: 1.86, say: 'Push the copy out over the pit: shot from close, it grows into a bridge.' },
      { go: [0.5, -21.0], jump: true, say: 'Hop up onto it.' },
      { go: [0.5, -30.0] },
      { exit: true },
    ],
    nope: [
      // the streak at its own size won't fit the pen
      [{ tp: [-3.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 1.7 }, { go: [0.5, -6.5], n: 400 }, { go: [0.5, -9.5], n: 400 }, { tp: [-3.9, 1.02, -12.5], yaw: 90 }, { print: [-6.5, 2.3, -12.5], yaw: 90, scale: 1.0 }, { go: [0.5, -16.0], n: 400 }, { go: [0.5, -19.0], n: 400 }, { exit: true, n: 400 }],
      // a key alone: the bridge is missing
      [{ tp: [-3.0, 1.02, -3.0], yaw: 90 }, { expose: 'shuttle', when: 'A', hold: 1.7 }, { go: [0.5, -6.5], n: 400 }, { go: [0.5, -9.5], n: 400 }, { zprint: [4.5, 0, -12.0], rest: 1.0, yaw: 90, scale: 1.0, from: [-1, 0.4] }, { tp: [4.5, 1.02, -16.5], yaw: 0 }, { snap: [4.5, 1.15, -12.0] }, { tp: [-4.0, 1.02, -12.5], yaw: 90 }, { print: [-6.5, 2.3, -12.5], yaw: 90, scale: 0.53 }, { go: [0.5, -16.0], n: 400 }, { go: [0.5, -19.0], n: 400 }, { tp: [0.5, 1.02, -21.5], yaw: 0 }, { runjump: 1 }, { exit: true, n: 400 }],
      // the shuttle itself is too short for either job
      [{ tp: [-3.0, 1.02, -3.0], yaw: 90 }, { tap: 'shuttle', when: 'A' }, { go: [0.5, -6.5], n: 400 }, { go: [0.5, -9.5], n: 400 }, { tp: [-4.0, 1.02, -12.5], yaw: 90 }, { print: [-6.5, 2.3, -12.5], yaw: 90, scale: 0.81 }, { go: [0.5, -16.0], n: 400 }, { go: [0.5, -19.0], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -6, 4, 0, 6], [-6, -6, -5, 0, 4], [-1, -7, 1, -7, 6], [-5, -32, 8, -8, 7], [-6, -14, -6, -12, 3], [-8, -14, -7, -12, 3]], { pits: [[-5, -28, 8, -23]] });
      B.start(0, 1, -1);
      B.glass(-5, 1, -6, -5, 4, 0, { axis: 'x' });
      B.shuttle([-6, 1.3, -5], [-6, 1.3, -1], { speed: 2.5, size: [1.0, 0.3, 1.0], orange: true });
      B.door([], -1, 1, -7, 1, 3, -7, { oneway: true }); B.solid(-1, 4, -7, 1, 6, -7);
      // a letterbox at chest height into a little pen with two plates
      B.solid(-6, 1, -14, -6, 1, -12); B.box([-6, 2.6, -14], [-5, 8, -11]);
      B.plate('k1', -7, 1, -14); B.plate('k2', -7, 1, -12);
      // the door the pen opens, and the void beyond it
      B.solid(-5, 1, -18, -2, 7, -18); B.solid(2, 1, -18, 8, 7, -18); B.solid(-1, 4, -18, 1, 7, -18); B.door(['k1', 'k2'], -1, 1, -18, 1, 3, -18);
      B.exit(0, 1, -31);
    },
  },
  {
    name: 'Overtime', film: 2, exposure: true, postcard: true, diff: 9,
    hint: 'The shuttle’s rail is sealed behind glass, with a photo spot on it, and the plates are in the vault at the end of its tunnel. The shuttle shoves whatever lies on its rail, and a parcel leaves a postcard turned the way it went in.',
    sol: [
      { tp: [-4.5, 1.02, 3.5], yaw: 0 },
      { snap: [-4.5, 2.3, -3.5], say: 'Photograph the photo spot on the rail, through the glass.' },
      { expose: 'shuttle', when: 'A', hold: 1.8, say: 'Expose the shuttle as it sets off, and let go at about five and a half metres.' },
      { sel: 0 },
      { print: [-4.5, 2.02, 1.5], yaw: 90, say: 'Print the postcard in front of you.' },
      { sel: 0 },
      { until: 'T.shuttle().track.s < 1.0 && T.shuttle().track.dir < 0', t: 14, say: 'Wait until the shuttle is coming back to its far end.' },
      { print: [-4.5, 2.0, 1.5], yaw: 0, settle: 0, say: 'Then post the streak end first into the card: it lands on the rail, pointing along it, ahead of the shuttle.' },
      { wait: 9, say: 'The shuttle turns round and shoves it down the tunnel, onto both plates in the vault.' },
      { go: [-9.5, 2.5] },
      { exit: true },
    ],
    nope: [
      // posted while the shuttle is heading for the vault, the streak lands behind it and gets shoved the other way, into the void
      [{ tp: [-4.5, 1.02, 3.5], yaw: 0 }, { snap: [-4.5, 2.3, -3.5] }, { expose: 'shuttle', when: 'A', hold: 1.8 }, { sel: 0 }, { print: [-4.5, 2.02, 1.5], yaw: 90 }, { sel: 0 }, { until: 'T.shuttle().track.s > 6.5 && T.shuttle().track.dir > 0', t: 14 }, { print: [-4.5, 2.0, 1.5], yaw: 0, settle: 0 }, { wait: 12 }, { go: [-9.5, 2.5], n: 400 }, { exit: true, n: 400 }],
      // posted flat across the card, it lands across the rail and jams
      [{ tp: [-6.5, 1.02, 3.5], yaw: 0 }, { snap: [-4.5, 2.3, -3.5] }, { expose: 'shuttle', when: 'A', hold: 1.8 }, { sel: 0 }, { print: [-4.5, 2.02, 1.5], yaw: 90 }, { sel: 0 }, { until: 'T.shuttle().track.s < 1.0 && T.shuttle().track.dir < 0', t: 14 }, { print: [-4.5, 2.0, 1.5], yaw: 90, settle: 0 }, { wait: 9 }, { go: [-9.5, 2.5], n: 400 }, { exit: true, n: 400 }],
      // too short, it reaches only the first plate
      [{ tp: [-4.5, 1.02, 3.5], yaw: 0 }, { snap: [-4.5, 2.3, -3.5] }, { expose: 'shuttle', when: 'A', hold: 0.8 }, { sel: 0 }, { print: [-4.5, 2.02, 1.5], yaw: 90 }, { sel: 0 }, { until: 'T.shuttle().track.s < 1.0 && T.shuttle().track.dir < 0', t: 14 }, { print: [-4.5, 2.0, 1.5], yaw: 0, settle: 0 }, { wait: 9 }, { go: [-9.5, 2.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-12, -5, -1, -3, 5], [-12, -2, -1, 4, 6], [0, -4, 5, -4, 1], [6, -6, 14, -1, 4], [-1, 0, 14, 2, 4], [-11, 5, -8, 7, 6]], { pits: [[-12, -5, -10, -3]] });
      B.start(-5, 1, 2);
      // the rail, sealed behind glass, with a photo spot on it; the tunnel and the vault beyond
      B.glass(-12, 1, -2, -1, 6, -2, { axis: 'z' });
      B.shuttle([-9, 1.0, -4], [6, 1.0, -4], { speed: 2.5, size: [1.0, 0.5, 0.4], orange: true });
      B.spot(-5, 1, -4, -90);
      B.box([0, 1.6, -4], [6, 2, -3]);
      B.plate('v1', 8, 1, -4); B.plate('v2', 11, 1, -4);
      B.glass(6, 1, -1, 14, 4, -1, { axis: 'z' });
      B.door(['v1', 'v2'], -11, 1, 5, -9, 3, 5); B.solid(-11, 4, 5, -9, 6, 5); B.solid(-8, 1, 5, -8, 6, 5);
      B.exit(-10, 1, 6);
    },
  },
  {
    name: 'Dolly Zoom', film: 1, exposure: true, zoom: true, postcard: true, diff: 10,
    hint: 'The model train can only be seen through its hooded window, from across the pit, and the red light spoils every photo but the spot’s. On Zoom film a long exposure is sized from wherever you are when you let go.',
    sol: [
      { tp: [3.5, 1.02, -5.5], yaw: 0 },
      { snap: [4.5, 2.3, -15.5], say: 'Photograph the photo spot on the island, beside the train’s case.' },
      { print: [3.5, 2.02, -7.5], yaw: 0, say: 'Print the postcard just in front of you.' },
      { until: 'T.shuttle().track.s < 0.05 && T.shuttle().track.dir > 0', t: 6 },
      { js: 'const p = T.shuttle().body.position; T.look(p.x, p.y, p.z); __shutter.startExposure(); !!__shutter.expo', say: 'Look through the hood and start exposing the train as it sets off...' },
      { walkin: true, yaw: 0, say: '...and keep the shutter open as you walk into the postcard.' },
      { go: [3.7, -15.8], say: 'On the island, step right up beside the case...' },
      { wait: 1.4 },
      { js: '__shutter.endExposure(); T.photo() + " " + T.dims()', say: '...and let go there: the photo counts as taken from up close.' },
      { print: [1.0, 0, -23.5], rest: 1.0, yaw: 90, scale: 4.1, say: 'Push it far out over the pit behind the island: from so close a shot, it comes out a bridge.' },
      { go: [1.0, -16.9] },
      { go: [1.0, -29.6] },
      { exit: true },
    ],
    nope: [
      // exposed from the gallery, even from the very edge and printed as far off as it goes, it comes out too short for the far pit
      [{ tp: [3.5, 1.02, -5.5], yaw: 0 }, { snap: [4.5, 2.3, -15.5] }, { print: [3.5, 2.02, -7.5], yaw: 0 }, { tp: [1.5, 1.02, -7.6], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { tp: [6.3, 1.02, -2.6], yaw: 0 }, { print: [6.0, 0, -23.5], rest: 1.0, yaw: 90, scale: 2.65 }, { tp: [3.5, 1.02, -5.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [6.0, -18.0], n: 400 }, { go: [6.0, -29.5], n: 400 }, { exit: true, n: 400 }],
      // on the island the train can't be seen at all
      [{ tp: [3.5, 1.02, -5.5], yaw: 0 }, { snap: [4.5, 2.3, -15.5] }, { print: [3.5, 2.02, -7.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [3.7, -15.8], n: 400 }, { expose: 'shuttle', hold: 2.0 }, { print: [1.0, 0, -23.5], rest: 1.0, yaw: 90, scale: 4.1 }, { go: [1.0, -17.5], n: 400 }, { go: [1.0, -29.5], n: 400 }, { exit: true, n: 400 }],
      // let go before the postcard and it is still a long-distance shot
      [{ tp: [3.5, 1.02, -5.5], yaw: 0 }, { snap: [4.5, 2.3, -15.5] }, { print: [3.5, 2.02, -7.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { walkin: true, yaw: 0 }, { go: [3.7, -15.8], n: 400 }, { print: [1.0, 0, -23.5], rest: 1.0, yaw: 90, scale: 0.81 }, { go: [1.0, -17.5], n: 400 }, { go: [1.0, -29.5], n: 400 }, { exit: true, n: 400 }],
      // a small print in the red light can't be photographed again from close up to blow it up
      [{ tp: [3.5, 1.02, -5.5], yaw: 0 }, { expose: 'shuttle', when: 'A', hold: 2.0 }, { print: [0.5, 0, -4.0], rest: 1.0, yaw: 0, scale: 0.36 }, { tp: [0.5, 1.02, -2.6], yaw: 0 }, { snap: [0.5, 1.05, -4.0] }, { print: [1.0, 0, -12.0], rest: 1.0, yaw: 90, scale: 3.0 }, { exit: true, n: 400 }],
      // a quick click takes the train itself, which is far too small even blown up
      [{ tp: [3.5, 1.02, -5.5], yaw: 0 }, { snap: [4.5, 2.3, -15.5] }, { print: [3.5, 2.02, -7.5], yaw: 0 }, { tp: [1.5, 1.02, -7.6], yaw: 0 }, { tap: 'shuttle', when: 'A' }, { tp: [3.5, 1.02, -5.5], yaw: 0 }, { walkin: true, yaw: 0 }, { go: [3.7, -15.8], n: 400 }, { print: [1.0, 0, -23.5], rest: 1.0, yaw: 90, scale: 1.04 }, { go: [1.0, -17.5], n: 400 }, { go: [1.0, -29.5], n: 400 }, { exit: true, n: 400 }],
    ],
    build(B) {
      B.plan([[-4, -32, 6, -3, 9]], { pits: [[-4, -15, 6, -9], [-4, -28, 6, -20], [-4, -19, -2, -16]] });
      B.start(2, 1, -3);
      const home = B.spot(-2, 1, -4, 180);
      // the island: the model train in a case whose one window looks back across the void through a deep hood, and a spot beside it
      B.box([0, 1, -16], [3, 2, -15], 'trim');
      B.box([0, 2, -16], [3, 3, -15.9], 'trim'); B.box([-0.12, 1, -16], [0, 3, -15], 'trim'); B.box([3, 1, -16], [3.12, 3, -15], 'trim'); B.box([-0.12, 3, -16], [3.12, 3.12, -15], 'trim');
      B.glass(0, 2, -15, 2, 2, -15, { axis: 'z', face: 'min' });
      B.box([-0.12, 2, -15], [0, 3.12, -14], 'trim'); B.box([3, 2, -15], [3.12, 3.12, -14], 'trim'); B.box([-0.12, 3, -15], [3.12, 3.12, -14], 'trim');
      B.shuttle([-0.2, 2.3, -16], [2.35, 2.3, -16], { speed: 1.5, size: [0.3, 0.1, 0.25], orange: true });
      B.spot(4, 1, -16, 0);
      B.card(-1, 1, -19, 0, home, { locked: true });
      // red light everywhere you could print, except where the spot is read and inside the case
      B.safelight(-4, 1, -8, 6, 9, -3); B.safelight(-4, 1, -32, 6, 9, -28);
      B.safelight(-1, 0.75, -19, 6, 0.85, -17); B.safelight(-1, 0.75, -16, 3, 0.85, -16); B.safelight(5, 0.75, -16, 6, 0.85, -16); B.safelight(4, 0.75, -16, 4, 0.75, -16);
      B.safelight(-1, 1.85, -19, 6, 8, -17); B.safelight(-1, 1.85, -16, -1, 8, -16); B.safelight(3, 1.85, -16, 6, 8, -16); B.safelight(0, 3.13, -16, 2, 8, -16);
      B.safelight(-1, 1.85, -15, 6, 8, -15);
      B.exit(2, 1, -31);
    },
  },
];

// The order chambers are played in: difficulty climbs steadily from 1 to 200, ranked by an independent review,
// the designers' own ratings and how much each solution asks of you. Each roll is twenty chambers.
window.SHUTTER_ORDER = [
  // roll 1: first exposures
  'Step', 'Cut the Floor', 'Hover', 'Lens Cap', 'Drop', 'Crosswise',
  'Spring', 'Stack', 'Leapfrog', 'Vantage', 'Terrace', 'Tripwire',
  'Updraft', 'Stairwell', 'Aim', 'Mirror', 'Light Leak', 'Counterweight',
  'Hopscotch', 'Two Frames',
  // roll 2: new stock
  'Pocket Bridge', 'Big Picture', 'Darkroom', 'Key', 'Scale Model', 'Wish You Were Here',
  'Picture Rail', 'Large Format', 'Mouse Hole', 'Aperture', 'Stand-In', 'Iris',
  'Out of the Red', 'Long Distance', 'Bulb', 'Handrail', 'Made to Measure', 'Heavy Exposure',
  'Ladder', 'Forced Perspective',
  // roll 3: fast film
  'Crossfire', 'Copy Shop', 'Double Exposure', 'Doppelganger', 'Paper Trail', 'Periscope',
  'Magnify', 'Last Light', 'Trapdoor', 'Fastball', 'Dunk', 'Smash and Grab',
  'Runaway', 'Breakthrough', 'Downpour', 'Return to Sender', 'Shield', 'Safelight',
  'Compact', 'Time Lapse',
  // roll 4: hard light
  'Rangefinder', 'High Beam', 'Freefall', 'Janus', 'Doorstop', 'Smear',
  'Splitter', 'Head Start', 'Knockout', 'Raise the Roof', 'Catch', 'Contact Sheet',
  'Perch', 'Choir', 'Reply Paid', 'Window Shopping', 'Return Policy', 'Bounce Flash',
  'Off Axis', 'Stop Motion',
  // roll 5: long exposures
  'Wingspan', 'Postmark', 'Umbra', 'Thin Ice', 'Double Glazing', 'Pincer',
  'Escalator', 'Express', 'Wide Angle', 'Clearance', 'Night Bus', 'Skylight',
  'Double Duty', 'Twin Lens', 'Panorama', 'Dark Copy', 'Freeze Frame', 'Recall',
  'Model Railway', 'Rewind',
  // roll 6: mixed stock
  'Pull the Rug', 'Second Exposure', 'Ghosting', 'Hall of Mirrors', 'Terminal Velocity', 'Pillar Box',
  'Negative', 'Slingshot', 'Pinhole', 'Detour', 'Letterbox', 'Air Mail',
  'Apex', 'Tight Squeeze', 'Dodge and Burn', 'Round Trip', 'Ditto', 'Short Cut',
  'Connecting Flight', 'Dogleg',
  // roll 7: cross processing
  'Flush Out', 'Beanstalk', 'Souvenir', 'Sidewinder', 'Special Delivery', 'Plummet',
  'Tall Order', 'Zigzag', 'Dumbwaiter', 'Pylon', 'Quick Draw', 'Long Lens',
  'Stop Bath', 'Highlight', 'Test Strip', 'Big Shot', 'Window Seat', 'Rising Action',
  'Enlargement', 'Night Train',
  // roll 8: high contrast
  'Mezzanine', 'Chase Scene', 'Over and Under', 'Battering Ram', 'Photostat', 'Keyhole',
  'Dark Slide', 'Facsimile', 'Freight Mail', 'Rush Hour', 'Moving Picture', 'Red Tape',
  'Holding Pattern', 'Back to Back', 'Push Process', 'Blueprint', 'Blow-Up', 'Crane Shot',
  'Retake', 'Self-Timer',
  // roll 9: master prints
  'Grand Entrance', 'Slow Boat', 'Glass Ceiling', 'Poste Restante', 'Overdrive', 'Print Run',
  'Red Shift', 'Limited Edition', 'Curtain', 'Air Lift', 'Midstream', 'Pass It On',
  'Flat Pack', 'Layover', 'Bracketing', 'Carry-On', 'Top Shelf', 'Parallax',
  'Mass Mailing', 'Trestle',
  // roll 10: exhibition
  'Rapid Fire', 'Rack Focus', 'Excess Baggage', 'Mirror Mail', 'Return Ticket', 'Overtime',
  'Vertigo', 'Sizing Up', 'Burst Mode', 'Forwarding Address', 'Ricochet', 'Eye of the Needle',
  'The Last Post', 'The Enlarger', 'Postage Stamp', 'Proof Sheet', 'Dolly Zoom', 'Blockbuster',
  'Retrospective', 'Final Print',
];
