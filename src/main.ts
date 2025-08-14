import { Application, Container, AnimatedSprite, Assets } from 'pixi.js'
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
import { Candle, Breakable, Pickup, SideTorch, Banner, Fountain } from './props'
import { loadTiles } from './tiles'
import { loadCharacterAnim } from './sprites'
import { AudioManager } from './audio'

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

  // Preload common character/equipment/UI textures before creating overlays
  await Assets.load([
    '/assets/characters/weapon_regular_sword.png',
    '/assets/characters/weapon_rusty_sword.png',
    '/assets/characters/weapon_green_magic_staff.png',
    '/assets/characters/knight_m_idle_anim_f1.png',
    '/assets/characters/knight_m_idle_anim_f2.png',
    '/assets/characters/knight_m_run_anim_f0.png',
    '/assets/characters/knight_m_run_anim_f1.png',
    '/assets/characters/wall_banner_red.png',
    '/assets/tiles/coin/coin_1.png'
  ])

    // Player animated sprite (knight)
    const playerAnim = await loadCharacterAnim('knight_m')
    const player = new AnimatedSprite(playerAnim.idle)
    player.animationSpeed = 0.12
    player.play()
    player.anchor.set(0.5)
	// Place player at first room center
	const firstRoom = world.getRooms()[0]
	player.x = firstRoom ? (firstRoom.cx * 16 + 8) : 128
	player.y = firstRoom ? (firstRoom.cy * 16 + 8) : 128
	world.playerLayer.addChild(player)

	// Player animator handles visuals and animations
	const animator = new PlayerAnimator(player)
	const minimap = new Minimap(world)
	const audio = new AudioManager([
		'/assets/music/8bit Dungeon Boss.mp3',
		'/assets/music/8bit Dungeon Level.mp3',
		'/assets/music/Aggressor.mp3'
	])
	;(window as any).__audio = audio

    // Load tiles and use animated candle frames if available
    const tiles = await loadTiles()
    // Preload common character/equipment/UI textures used by overlays/props
    await Assets.load([
        '/assets/characters/weapon_regular_sword.png',
        '/assets/characters/weapon_rusty_sword.png',
        '/assets/characters/weapon_green_magic_staff.png',
        '/assets/characters/knight_m_idle_anim_f1.png',
        '/assets/characters/knight_m_idle_anim_f2.png',
        '/assets/characters/knight_m_run_anim_f0.png',
        '/assets/characters/knight_m_run_anim_f1.png',
        '/assets/characters/wall_banner_red.png'
    ])
    await world.renderTilesFromAssets()
    for (const room of world.getRooms()) {
        for (let x = room.x; x < room.x + room.w; x += 4) {
            const top = world.tileToWorld(x, room.y)
            const bottom = world.tileToWorld(x, room.y + room.h - 1)
            const c1 = new Candle(tiles.candleFrames); c1.x = top.x; c1.y = top.y - 6; world.decorLayer.addChild(c1)
            const c2 = new Candle(tiles.candleFrames); c2.x = bottom.x; c2.y = bottom.y + 6; world.decorLayer.addChild(c2)
        }
        for (let y = room.y; y < room.y + room.h; y += 4) {
            const left = world.tileToWorld(room.x, y)
            const right = world.tileToWorld(room.x + room.w - 1, y)
            const c3 = new Candle(tiles.candleFrames); c3.x = left.x - 6; c3.y = left.y; world.decorLayer.addChild(c3)
            const c4 = new Candle(tiles.candleFrames); c4.x = right.x + 6; c4.y = right.y; world.decorLayer.addChild(c4)
        }
        // add banners and fountains occasionally
        if ((room.x + room.y) % 3 === 0) {
            const b = new Banner('red'); b.x = (room.x + 1) * 16 + 8; b.y = room.y * 16 + 8; world.decorLayer.addChild(b)
        }
        // add fountain only if assets exist (lazy-created inside)
        if ((room.x + room.y) % 5 === 0) {
            const f = new Fountain('blue'); f.x = (room.cx) * 16 + 8; f.y = (room.y + 1) * 16 + 8; world.decorLayer.addChild(f)
        }
    }

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

	const combat = new CombatSystem(world.playerLayer, world.decorLayer, (x, y, r) => world.projectileHitsWall(x, y, r))
	const overlay = new InventoryOverlay(inventory)
	;(window as any).__inventory = inventory

	// Quick in-game equipment preview: 1=weapon, 2=armor, 3=helmet, 4=boots
	const weaponVariants = [
		{ id: 'wpn-rusty', name: 'Rusty Sword', slot: 'weapon', attack: 2 },
		{ id: 'wpn-short', name: 'Short Sword', slot: 'weapon', attack: 3 },
		{ id: 'wpn-golden', name: 'Golden Sword', slot: 'weapon', attack: 5 },
	]
	const armorVariants = [
		{ id: 'arm-cloth', name: 'Cloth Tunic', slot: 'armor', defense: 1 },
		{ id: 'arm-padded', name: 'Padded Armor', slot: 'armor', defense: 2 },
	]
	const helmVariants = [
		{ id: 'hlm-leather', name: 'Leather Cap', slot: 'helmet', defense: 1 },
		{ id: 'hlm-cap', name: 'Cap', slot: 'helmet', defense: 2 },
	]
	const bootsVariants = [
		{ id: 'bt-worn', name: 'Worn Boots', slot: 'boots', defense: 1 },
		{ id: 'bt-leather', name: 'Leather Boots', slot: 'boots', defense: 2 },
	]
	let idxW = 0, idxA = 0, idxH = 0, idxB = 0

    // One enemy that chases the player but cannot hurt yet
    const enemy = new Enemy(player)
    await enemy.init('goblin', (x,y,dx,dy,r)=> world.resolveMovement(x,y,dx,dy,r))
	// Place enemy in another room center if available
	const secondRoom = world.getRooms()[1]
	if (secondRoom) {
        enemy.x = secondRoom.cx * 16 + 8
        enemy.y = secondRoom.cy * 16 + 8
	} else {
		enemy.x = player.x + 200
		enemy.y = player.y + 50
	}
	world.addChild(enemy)
	combat.enemies.push(enemy)

	// Spawn additional enemies and breakables/pickups in rooms
    for (let i = 2; i < Math.min(world.getRooms().length, 10); i++) {
		const rm = world.getRooms()[i]
        const e = new Enemy(player)
        const kind = i % 3 === 0 ? 'ogre' : i % 3 === 1 ? 'skeleton' : 'goblin'
        await e.init(kind as any, (x,y,dx,dy,r)=> world.resolveMovement(x,y,dx,dy,r))
		e.x = rm.cx * 16 + 8
		e.y = rm.cy * 16 + 8
		world.entityLayer.addChild(e)
		combat.enemies.push(e)

		// breakables
		const b1 = new Breakable('table'); b1.x = e.x + 20; b1.y = e.y; world.decorLayer.addChild(b1)
		const b2 = new Breakable('chair'); b2.x = e.x - 28; b2.y = e.y + 10; world.decorLayer.addChild(b2)

		// a pickup item
		const p = new Pickup({ id: `ring-${i}`, name: 'Ring', slot: 'ring', magicPower: 1 })
		p.x = e.x - 10; p.y = e.y - 10; world.pickupLayer.addChild(p)
	}

    // Hero swap preview: H cycles candidate heroes
    const heroOptions = ['knight_m','wizzard_m','elf_m','dwarf_m'] as const
    let heroIdx = 0

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
			const moveX = dx * speed * delta
			const moveY = dy * speed * delta
			const r = 6
			const resolved = world.resolveMovement(player.x, player.y, moveX, moveY, r)
			player.x = resolved.x
			player.y = resolved.y
		}
		animator.setMoving(dx !== 0 || dy !== 0)
		if (dx !== 0) animator.setFacing(dx > 0 ? 1 : -1)

		// Cast magic toward mouse position on Space
		if (input.wasPressed(' ') || input.wasPressed('enter')) {
			const worldX = (mouse.x - camera.x) / PIXEL_SCALE
			const worldY = (mouse.y - camera.y) / PIXEL_SCALE
			combat.castMagic(player.x, player.y, worldX, worldY)
			animator.triggerCast()
			audio.playSfx('/assets/sfx/cast_whoosh.wav')
		}

		// Melee on keyboard 'b' or controller east button (index 1)
		if (input.wasPressed('b') || input.wasGamepadButtonPressed(1)) {
			combat.meleeAttack(player.x, player.y, 22)
			animator.triggerMelee()
			audio.playSfx('/assets/sfx/melee_hit.wav')
		}

		combat.update(delta)
		// animate candles
		for (const c of world.decorLayer.children) {
			if ((c as any).update) (c as any).update(delta)
		}
		if (!enemy.destroyed) enemy.update(delta)

		// Toggle inventory overlay with I
		if (input.wasPressed('i')) { overlay.toggle(); audio.playSfx('/assets/sfx/ui_click.wav') }
		// Start music on first input if not already (gesture requirement)
		if (input.wasPressed('i') || input.wasPressed(' ') || input.wasPressed('enter') || input.wasPressed('b')) {
			audio.start()
		}
		// Audio hotkeys: M to mute toggle, +/- to adjust volume
		if (input.wasPressed('m')) audio.toggleMute()
		if (input.wasPressed('+') || input.wasPressed('=')) audio.adjustVolume(0.05)
		if (input.wasPressed('-') || input.wasPressed('_')) audio.adjustVolume(-0.05)
		// Preview hotkeys 1-4 to cycle gear variants
		if (input.wasPressed('1')) { const it = weaponVariants[idxW = (idxW + 1) % weaponVariants.length]; inventory.add(it); inventory.equip(it.id); overlay.render() }
		if (input.wasPressed('2')) { const it = armorVariants[idxA = (idxA + 1) % armorVariants.length]; inventory.add(it); inventory.equip(it.id); overlay.render() }
		if (input.wasPressed('3')) { const it = helmVariants[idxH = (idxH + 1) % helmVariants.length]; inventory.add(it); inventory.equip(it.id); overlay.render() }
		if (input.wasPressed('4')) { const it = bootsVariants[idxB = (idxB + 1) % bootsVariants.length]; inventory.add(it); inventory.equip(it.id); overlay.render() }
		// Hero swap
		if (input.wasPressed('h')) {
			heroIdx = (heroIdx + 1) % heroOptions.length
			loadCharacterAnim(heroOptions[heroIdx]).then(frames => {
				player.textures = frames.idle
				player.gotoAndPlay(0)
			})
		}
		// Open nearest chest/pickup with E
		if (input.wasPressed('e')) {
			let nearest: any = null
			let best = Infinity
			const layers: any[] = [world, world.decorLayer, world.pickupLayer, world.entityLayer, world.playerLayer]
			for (const layer of layers) {
				const list = (layer?.children ?? []) as any[]
				for (const child of list) {
					const cx = (child as any).x; const cy = (child as any).y
					if (typeof cx !== 'number' || typeof cy !== 'number') continue
					const dx = cx - player.x
					const dy = cy - player.y
					const d2 = dx * dx + dy * dy
					if ((child as any).tryOpen || (child as any).collect) {
						if (d2 < best) { best = d2; nearest = child }
					}
				}
			}
			if (nearest && best < 32 * 32) {
				if ((nearest as any).tryOpen) {
					(nearest as any).tryOpen()
					audio.playSfx('/assets/sfx/chest_open.wav')
				}
				if ((nearest as any).collect) { (nearest as any).collect((window as any).__inventory); audio.playSfx('/assets/sfx/pickup.wav') }
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
