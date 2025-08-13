import { Application, Graphics } from 'pixi.js'
import type { World } from './world'
import { TILE_SIZE } from './constants'

export class Minimap {
	private root: HTMLDivElement
	private app: Application
	private layer: Graphics
	private playerDot: Graphics
	private world: World

	constructor(world: World) {
		this.world = world
		this.root = document.createElement('div')
		this.root.id = 'minimap'
		this.root.style.position = 'fixed'
		this.root.style.top = '16px'
		this.root.style.right = '16px'
		this.root.style.width = '160px'
		this.root.style.height = '160px'
		this.root.style.border = '1px solid #444'
		this.root.style.background = 'rgba(0,0,0,0.6)'
		this.root.style.zIndex = '1000'
		document.body.appendChild(this.root)

		this.app = new Application()
		this.app.init({ backgroundAlpha: 0, width: 160, height: 160 }).then(() => {
			this.root.appendChild(this.app.canvas)
		})
		this.layer = new Graphics()
		this.playerDot = new Graphics().rect(-2, -2, 4, 4).fill({ color: 0xffffff })
		this.app.stage.addChild(this.layer)
		this.app.stage.addChild(this.playerDot)

		this.drawStatic()
	}

	private drawStatic() {
		const grid = this.world.getGrid()
		this.layer.clear()
		const w = grid[0].length
		const h = grid.length
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const v = grid[y][x]
				const color = v === 1 ? 0x333333 : 0x888888
				this.layer.rect(x * 2, y * 2, 2, 2).fill({ color })
			}
		}
	}

	update(playerX: number, playerY: number) {
		this.playerDot.x = (playerX / TILE_SIZE) * 2
		this.playerDot.y = (playerY / TILE_SIZE) * 2
	}
}


