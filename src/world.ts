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

	constructor() {
		super()
		this.decorLayer = new Container()
		this.tileLayer = new Container()
		this.entityLayer = new Container()
		this.pickupLayer = new Container()
		this.playerLayer = new Container()
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
	}

	async renderTilesFromAssets() {
		// Preload a basic set of floor and wall tiles from your pack
		const floorPaths = Array.from({ length: 8 }, (_, i) => `/assets/characters/floor_${i + 1}.png`)
		await Assets.load([...floorPaths, '/assets/characters/wall_mid.png', '/assets/characters/wall_top_mid.png'])
		const floorTextures = floorPaths.map((p) => Texture.from(p))
		const wallMid = Texture.from('/assets/characters/wall_mid.png')
		const wallTop = Texture.from('/assets/characters/wall_top_mid.png')

		// Clear any previous tile sprites
		this.tileLayer.removeChildren()
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[0].length; x++) {
				const v = this.grid[y][x]
				if (v === 0) {
					const s = new Sprite(floorTextures[(x * 31 + y * 17) % floorTextures.length])
					s.x = x * TILE_SIZE
					s.y = y * TILE_SIZE
					s.scale.set(1)
					this.tileLayer.addChild(s)
				} else {
					// wall body
					const mid = new Sprite(wallMid)
					mid.x = x * TILE_SIZE
					mid.y = y * TILE_SIZE
					this.tileLayer.addChild(mid)
					// wall top cap if above is floor
					if (y > 0 && this.grid[y - 1][x] === 0) {
						const top = new Sprite(wallTop)
						top.x = x * TILE_SIZE
						top.y = y * TILE_SIZE - TILE_SIZE
						this.tileLayer.addChild(top)
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


