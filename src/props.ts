import { Graphics } from 'pixi.js'
import type { InventorySystem, Item } from './inventory'

export class Candle extends Graphics {
	private phase = Math.random() * Math.PI * 2
	constructor() {
		super()
    this.drawFlame(0.6)
	}

  private drawFlame(intensity: number) {
		this.clear()
    // wall sconce + candle flame
    this.rect(-2, 4, 4, 6).fill({ color: 0x6b4f2a }) // sconce wood
    this.rect(-1, 1, 2, 4).fill({ color: 0xffffff }) // candle body
    this.circle(0, -2, 2 + intensity * 0.8).fill({ color: 0xffcc55 })
	}

	update(dt: number) {
		this.phase += dt * 6
		const i = 0.5 + Math.sin(this.phase) * 0.3
		this.drawFlame(i)
	}
}

export class Breakable extends Graphics {
	hp: number
	public kind: 'table' | 'chair'
	constructor(kind: 'table' | 'chair' = 'table') {
		super()
		this.kind = kind
		this.hp = kind === 'table' ? 6 : 3
		this.draw()
	}

	private draw() {
		this.clear()
		if (this.kind === 'table') {
			this.rect(-6, -4, 12, 8).fill({ color: 0x6b4f2a })
			this.rect(-5, 4, 3, 3).fill({ color: 0x4a3720 })
			this.rect(2, 4, 3, 3).fill({ color: 0x4a3720 })
		} else {
			this.rect(-3, -6, 6, 8).fill({ color: 0x6b4f2a })
		}
	}

	takeDamage(dmg: number) {
		this.hp -= dmg
		if (this.hp <= 0) {
			const debris = new Graphics().rect(-6, -4, 12, 8).fill({ color: 0x3a2a15, alpha: 0.5 })
			debris.x = this.x; debris.y = this.y
			this.parent?.addChild(debris)
			setTimeout(() => debris.destroy(), 150)
			try { (window as any).__audio?.playSfx('/assets/sfx/breakable_smash.wav') } catch {}
			this.destroy()
		}
	}
}

export class Pickup extends Graphics {
	public item: Item
	constructor(item: Item) {
		super()
		this.item = item
		this.circle(0, 0, 5).fill({ color: 0x88cc88 })
	}

	collect(inv: InventorySystem): boolean {
		inv.add(this.item)
		this.destroy()
		return true
	}
}


