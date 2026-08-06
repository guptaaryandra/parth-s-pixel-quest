# Auto-fit screen + smoother, calmer character motion

Two things to fix: the view should size itself to whatever device it runs on, and the character motion should feel smooth instead of laggy.

## 1. Screen auto-adjust

The canvas is already sized 1:1 to its container (no CSS stretch), so the fit problem is in the camera math and in how often the backdrop is rebuilt.

- Compute zoom from both axes with a real fit rule: keep a target view height of 480 world units, allow wide screens to reveal more world up to a cap, and clamp so the camera never asks for more world than the level has.
- Cap the device pixel ratio the renderer uses (e.g. max 2). On high-DPI phones the game currently renders far more pixels than needed, which is a large part of the "laggy" feel.
- Debounce the resize handler so rotation/keyboard-driven resizes don't re-run camera + backdrop layout dozens of times.
- Re-apply zoom and camera bounds on level start so every level uses the same unified world/camera sizing.

## 2. Background fit

- Stop resizing the sky/stars/hill tile sprites every frame. Resize them only when the camera viewport or zoom actually changes; per frame, update just their scroll offsets.
- Size backdrop layers slightly larger than the camera view so no edge can ever show, at any ratio.

## 3. Character animation: keep it subtle

Remove the layered per-frame transforms that fight each other and cause the jitter:

- Delete the running tilt (`setAngle` sine) and the vertical bob (`setScale` sine).
- Delete the idle "breathing" scale.
- Keep the 4-frame leg run cycle (cheap, and it is what actually reads as running), at a slightly slower 10 fps.
- Keep a single squash-and-stretch pulse on jump and on landing, but as one short tween instead of a per-frame scale write.
- Keep a small, clamped air lean while jumping (much smaller than now), or drop it if it still reads as wobble.

Net effect: legs animate, jump/land has a little pop, and the sprite no longer rotates and scales every frame — which is both smoother and less busy.

## 4. Verification

Screenshot and measure the game at several ratios (16:9, 19.5:9, 21:9, 16:10, and a small phone size) confirming: no black bars, no stretch, no visible backdrop edge, and the player at a comfortable size. Check frame timing in the preview before/after.

## Technical notes

- `src/components/game/PhaserCanvas.tsx`: add capped `resolution`/DPR handling and debounce the `ResizeObserver` callback.
- `src/game/GameScene.ts`: rework `applyZoom` (clamped two-axis fit); split `layoutBackdrop` into a resize path and a cheap per-frame scroll path; strip the sine-based `setAngle`/`setScale` blocks in `update`; convert `stretch` to a tween.
