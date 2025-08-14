import { Container, Graphics, Sprite, Texture, Assets } from 'pixi.js'
import { TILE_SIZE, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES } from './constants'
import type { Dungeon, RectRoom } from './dungeon'
import { loadTiles } from './tiles'
import { generateDungeon } from './dungeon'

export class World extends Container {
	public playerLayer: Container
	public decorLayer: Container
	public entityLayer: Container
	public pickupLayer: Container
	public tileLayer: Container
	private grid: number[][]
	private dungeon: Dungeon
	private debugGrid?: Graphics

	constructor() {
		super()
    // Enable zIndex-based sorting for deterministic draw order
    this.sortableChildren = true
		this.decorLayer = new Container()
		this.tileLayer = new Container()
		this.entityLayer = new Container()
		this.pickupLayer = new Container()
		this.playerLayer = new Container()
    this.tileLayer.zIndex = 0
    this.decorLayer.zIndex = 2
    this.entityLayer.zIndex = 3
    this.pickupLayer.zIndex = 4
    this.playerLayer.zIndex = 5
		this.dungeon = generateDungeon(WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES)
		this.grid = this.dungeon.grid
		this.drawGrid()
		this.addChild(this.decorLayer)
		this.addChildAt(this.tileLayer, 0)
		this.addChild(this.entityLayer)
		this.addChild(this.pickupLayer)
		this.addChild(this.playerLayer)
	}

	getGrid(): number[][] { return this.grid }
	getRooms(): RectRoom[] { return this.dungeon.rooms }

	tileToWorld(tx: number, ty: number): { x: number; y: number } {
		return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 }
	}

    // removed old generateGrid in favor of procedural dungeon

  private drawGrid() {
		const g = new Graphics()
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[0].length; x++) {
				const v = this.grid[y][x]
				const floor = (x + y) % 2 === 0 ? 0x2a2a2a : 0x262626
				const wall = 0x3a3a3a
				g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({ color: v === 1 ? wall : floor })
				// draw wall edge highlight
				if (v === 1) {
					g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 2).fill({ color: 0x555555 })
				}
			}
		}
		this.addChild(g)
		this.debugGrid = g
	}

	async renderTilesFromAssets() {
		// Remove debug grid if present to avoid covering tiles
		if (this.debugGrid) {
			this.debugGrid.destroy()
			this.debugGrid = undefined
		}
		// Load atlases from assets/tiles
		await Assets.load([
			'/assets/tiles/atlas_floor-16x16.png',
			'/assets/tiles/atlas_walls_low-16x16.png',
			'/assets/tiles/atlas_walls_high-16x32.png',
			// wall tile requested
			'/assets/characters/wall_mid.png',
			'/assets/characters/wall_left.png',
		])
		// floor atlas loaded above (not slicing; we use single-file textures below)

		// Clear any previous tile sprites
		this.tileLayer.removeChildren()
		// Use only specific light-brown single tiles (avoid dark variants entirely)
		const lightFloorPaths = [
			'/assets/characters/floor_3.png',
			'/assets/characters/floor_4.png',
		]
		await Assets.load(lightFloorPaths)
		const floorSubset = lightFloorPaths.map((p) => Texture.from(p))
		const wallMidTex = Texture.from('/assets/characters/wall_mid.png')
		const wallLeftTex = Texture.from('/assets/characters/wall_left.png')
		const clusterSize = 3 // tiles per cluster to reduce patchwork look
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[0].length; x++) {
				const v = this.grid[y][x]
				if (v === 0) {
					// choose a stable pseudo-random floor variant per cluster to improve coherence
					const cx = Math.floor(x / clusterSize)
					const cy = Math.floor(y / clusterSize)
					const idx = ((cx * 73856093) ^ (cy * 19349663)) >>> 0
					const tex = floorSubset[(idx % Math.max(1, floorSubset.length))]
					const s = new Sprite(tex)
					s.x = x * TILE_SIZE
					s.y = y * TILE_SIZE
					this.tileLayer.addChild(s)
				} else {
					const s = new Sprite(wallMidTex)
					s.x = x * TILE_SIZE
					s.y = y * TILE_SIZE
					this.tileLayer.addChild(s)
					const up = y > 0 && this.grid[y - 1][x] === 0
					const down = y < this.grid.length - 1 && this.grid[y + 1][x] === 0
					const left = x > 0 && this.grid[y][x - 1] === 0
					const right = x < this.grid[0].length - 1 && this.grid[y][x + 1] === 0
					if (left) {
						const e = new Sprite(wallLeftTex)
						e.anchor.set(0.5)
						e.x = x * TILE_SIZE + TILE_SIZE / 2
						e.y = y * TILE_SIZE + TILE_SIZE / 2
						e.rotation = 0
						this.tileLayer.addChild(e)
					}
					if (right) {
						const e = new Sprite(wallLeftTex)
						e.anchor.set(0.5)
						e.x = x * TILE_SIZE + TILE_SIZE / 2
						e.y = y * TILE_SIZE + TILE_SIZE / 2
						e.rotation = Math.PI
						this.tileLayer.addChild(e)
					}
					if (up) {
						const e = new Sprite(wallLeftTex)
						e.anchor.set(0.5)
						e.x = x * TILE_SIZE + TILE_SIZE / 2
						e.y = y * TILE_SIZE + TILE_SIZE / 2
						e.rotation = -Math.PI / 2
						this.tileLayer.addChild(e)
					}
					if (down) {
						const e = new Sprite(wallLeftTex)
						e.anchor.set(0.5)
						e.x = x * TILE_SIZE + TILE_SIZE / 2
						e.y = y * TILE_SIZE + TILE_SIZE / 2
						e.rotation = Math.PI / 2
						this.tileLayer.addChild(e)
					}
				}
			}
		}
	}

  async replaceWithTiles() {
    await loadTiles()
    // Placeholder hook for future full tileset rendering
  }

	// Collision helpers
	isWall(tileX: number, tileY: number): boolean {
		if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid[0].length) return true
		return this.grid[tileY][tileX] === 1
	}

	isBlockedAt(px: number, py: number, radius: number): boolean {
		const left = Math.floor((px - radius) / TILE_SIZE)
		const right = Math.floor((px + radius) / TILE_SIZE)
		const top = Math.floor((py - radius) / TILE_SIZE)
		const bottom = Math.floor((py + radius) / TILE_SIZE)
		return this.isWall(left, top) || this.isWall(right, top) || this.isWall(left, bottom) || this.isWall(right, bottom)
	}

	// light-weight point collision for projectiles
	projectileHitsWall(px: number, py: number, _radius: number): boolean {
		const tx = Math.floor(px / TILE_SIZE)
		const ty = Math.floor(py / TILE_SIZE)
		return this.isWall(tx, ty)
	}

	resolveMovement(px: number, py: number, dx: number, dy: number, radius: number): { x: number; y: number } {
		let nx = px
		let ny = py
		// move X
		if (dx !== 0) {
			const tryX = nx + dx
			if (!this.isBlockedAt(tryX, ny, radius)) nx = tryX
		}
		// move Y
		if (dy !== 0) {
			const tryY = ny + dy
			if (!this.isBlockedAt(nx, tryY, radius)) ny = tryY
		}
		return { x: nx, y: ny }
	}
}


