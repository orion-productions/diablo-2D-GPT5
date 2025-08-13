import { Container, Graphics } from 'pixi.js'
import { TILE_SIZE, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES } from './constants'

export class World extends Container {
	public playerLayer: Container
	private grid: number[][]

	constructor() {
		super()
		this.playerLayer = new Container()
		this.grid = this.generateGrid()
		this.drawGrid()
		this.addChild(this.playerLayer)
	}

	getGrid(): number[][] { return this.grid }

	private generateGrid(): number[][] {
		const w = WORLD_WIDTH_TILES
		const h = WORLD_HEIGHT_TILES
		const grid: number[][] = Array.from({ length: h }, () => Array(w).fill(0))
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const isBorder = x === 0 || y === 0 || x === w - 1 || y === h - 1
				grid[y][x] = isBorder ? 1 : 0
			}
		}
		return grid
	}

	private drawGrid() {
		const g = new Graphics()
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[0].length; x++) {
				const v = this.grid[y][x]
				const color = v === 1 ? 0x444444 : ((x + y) % 2 === 0 ? 0x2a2a2a : 0x262626)
				g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({ color })
			}
		}
		this.addChild(g)
	}
}


