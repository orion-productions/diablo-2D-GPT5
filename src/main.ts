import { Application, Assets, Container, Sprite } from 'pixi.js'
import './style.css'
import { InputManager } from './input'
import { World } from './world'
import { PIXEL_SCALE } from './constants'
import { CombatSystem } from './combat'
import { InventorySystem } from './inventory'
import { InventoryOverlay } from './ui'
import { Enemy } from './enemy'
import { PlayerAnimator } from './player'
import { Minimap } from './minimap'

async function boot() {
	const appContainer = document.querySelector<HTMLDivElement>('#app')!
	appContainer.innerHTML = ''

	const app = new Application()
	document.body.style.margin = '0'
	await app.init({ background: '#1e1e1e', resizeTo: window })
	appContainer.appendChild(app.canvas)

	// Pixel-perfect rendering
	app.canvas.style.imageRendering = 'pixelated'

	// World + player container
	const world = new World()
	const camera = new Container()
	camera.addChild(world)
	app.stage.addChild(camera)

	// Temporary player sprite (bunny) until real assets are placed
	const texture = await Assets.load('https://pixijs.com/assets/bunny.png')
	const player = new Sprite(texture)
	player.anchor.set(0.5)
	player.x = 128
	player.y = 128
	world.playerLayer.addChild(player)

	// Player animator handles visuals and animations
	const animator = new PlayerAnimator(player)
	const minimap = new Minimap(world)

	const inventory = new InventorySystem()
	inventory.add({ id: 'sword-1', name: 'Rusty Sword', slot: 'weapon', attack: 2 })
	inventory.add({ id: 'helm-1', name: 'Leather Cap', slot: 'helmet', defense: 1 })
	inventory.add({ id: 'boots-1', name: 'Worn Boots', slot: 'boots', defense: 1 })
	inventory.add({ id: 'armor-1', name: 'Cloth Tunic', slot: 'armor', defense: 1 })
	// Spare gear in bag to swap
	inventory.add({ id: 'sword-2', name: 'Short Sword', slot: 'weapon', attack: 3 })
	inventory.add({ id: 'helm-2', name: 'Cap', slot: 'helmet', defense: 2 })
	inventory.add({ id: 'boots-2', name: 'Leather Boots', slot: 'boots', defense: 2 })
	inventory.add({ id: 'armor-2', name: 'Padded Armor', slot: 'armor', defense: 2 })
	inventory.add({ id: 'off-1', name: 'Buckler', slot: 'offhand', defense: 2 })
	inventory.add({ id: 'amu-1', name: 'Simple Amulet', slot: 'amulet', magicPower: 1 })
	inventory.add({ id: 'ring-1', name: 'Copper Ring', slot: 'ring', magicPower: 1 })
	inventory.add({ id: 'p1', name: 'Healing Potion', slot: 'potion' })
	inventory.add({ id: 'p2', name: 'Healing Potion', slot: 'potion' })
	inventory.add({ id: 'p3', name: 'Healing Potion', slot: 'potion' })
	// Auto-equip some basics for now
	inventory.equip('helm-1')
	inventory.equip('armor-1')
	inventory.equip('boots-1')
	inventory.equip('sword-1')

	const combat = new CombatSystem(world.playerLayer)
	const overlay = new InventoryOverlay(inventory)
	;(window as any).__inventory = inventory

	// One enemy that chases the player but cannot hurt yet
	const enemy = new Enemy(player)
	enemy.x = player.x + 200
	enemy.y = player.y + 50
	world.addChild(enemy)
	combat.enemies.push(enemy)

	const input = new InputManager()
	const speed = 180 // px/sec

	// Track mouse in screen space for casting
	const mouse = { x: 0, y: 0 }
	app.stage.eventMode = 'static'
	app.stage.on('pointermove', (e) => {
		mouse.x = e.global.x
		mouse.y = e.global.y
	})
	app.ticker.add((ticker) => {
		const s = input.readMovement()
		const delta = ticker.deltaTime / 60
		let dx = 0
		let dy = 0
		if (s.up) dy -= 1
		if (s.down) dy += 1
		if (s.left) dx -= 1
		if (s.right) dx += 1
		if (dx !== 0 || dy !== 0) {
			const len = Math.hypot(dx, dy)
			dx /= len; dy /= len
			player.x += dx * speed * delta
			player.y += dy * speed * delta
		}
		animator.setMoving(dx !== 0 || dy !== 0)

		// Cast magic toward mouse position on Space
		if (input.wasPressed(' ') || input.wasPressed('enter')) {
			const worldX = (mouse.x - camera.x) / PIXEL_SCALE
			const worldY = (mouse.y - camera.y) / PIXEL_SCALE
			combat.castMagic(player.x, player.y, worldX, worldY)
			animator.triggerCast()
		}

		// Melee on keyboard 'b' or controller east button (index 1)
		if (input.wasPressed('b') || input.wasGamepadButtonPressed(1)) {
			combat.meleeAttack(player.x, player.y, 22)
			animator.triggerMelee()
		}

		combat.update(delta)
		if (!enemy.destroyed) enemy.update(delta)

		// Toggle inventory overlay with I
		if (input.wasPressed('i')) overlay.toggle()
		// Open nearest chest with E
		if (input.wasPressed('e')) {
			const children = world.children.slice()
			let nearest: any = null
			let best = Infinity
			for (const child of children) {
				if ((child as any).tryOpen) {
					const dx = (child as any).x - player.x
					const dy = (child as any).y - player.y
					const d2 = dx * dx + dy * dy
					if (d2 < best) { best = d2; nearest = child }
				}
			}
			if (nearest && best < 32 * 32) {
				(nearest as any).tryOpen()
				overlay.render()
			}
		}

		// Apply equipment visibility
		animator.applyEquipmentVisibility(inventory.equipment)

		// Update animations/UI and end frame
		animator.update(delta)
		minimap.update(player.x, player.y)
		input.endFrame()

		// Camera follows player (scaled world)
		camera.scale.set(PIXEL_SCALE)
		const centerX = app.renderer.width / 2
		const centerY = app.renderer.height / 2
		camera.x = Math.round(centerX - player.x * PIXEL_SCALE)
		camera.y = Math.round(centerY - player.y * PIXEL_SCALE)
	})
}

boot()
