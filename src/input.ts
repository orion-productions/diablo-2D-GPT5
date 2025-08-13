export type MovementState = {
	up: boolean
	down: boolean
	left: boolean
	right: boolean
	attack: boolean
}

export class InputManager {
	private keys: Set<string> = new Set()
	private pressedThisFrame: Set<string> = new Set()
	private gamepadIndex: number | null = null
	private prevGamepadButtons: boolean[] = []
	private currentGamepadButtons: boolean[] = []

	constructor() {
		window.addEventListener('keydown', (e) => {
			const k = e.key.toLowerCase()
			this.keys.add(k)
			this.pressedThisFrame.add(k)
		})
		window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()))
		window.addEventListener('gamepadconnected', (e) => {
			this.gamepadIndex = e.gamepad.index
		})
		window.addEventListener('gamepaddisconnected', () => {
			this.gamepadIndex = null
		})
	}

	beginFrame() {
		this.pressedThisFrame.clear()
	}

	readMovement(): MovementState {
		const state: MovementState = {
			up: this.isKeyDown('w') || this.isKeyDown('arrowup'),
			down: this.isKeyDown('s') || this.isKeyDown('arrowdown'),
			left: this.isKeyDown('a') || this.isKeyDown('arrowleft'),
			right: this.isKeyDown('d') || this.isKeyDown('arrowright'),
			attack: this.isKeyDown(' ') || this.isKeyDown('enter')
		}

		const gp = this.readGamepad()
		if (gp) {
			const [lx, ly] = gp.axes
			if (ly < -0.3) state.up = true
			if (ly > 0.3) state.down = true
			if (lx < -0.3) state.left = true
			if (lx > 0.3) state.right = true
			// South (A / Cross) button
			if (gp.buttons[0]?.pressed) state.attack = true
			this.currentGamepadButtons = gp.buttons.map(b => !!b?.pressed)
		}

		return state
	}

	wasPressed(key: string): boolean {
		return this.pressedThisFrame.has(key.toLowerCase())
	}

	private isKeyDown(key: string): boolean {
		return this.keys.has(key)
	}

	private readGamepad(): Gamepad | null {
		if (this.gamepadIndex == null) return null
		const gp = navigator.getGamepads?.()[this.gamepadIndex] || null
		return gp
	}

	wasGamepadButtonPressed(index: number): boolean {
		const cur = this.currentGamepadButtons[index] || false
		const prev = this.prevGamepadButtons[index] || false
		return cur && !prev
	}

	endFrame() {
		this.pressedThisFrame.clear()
		this.prevGamepadButtons = this.currentGamepadButtons.slice()
	}
}


