import { Graphics } from 'pixi.js'
import { InventorySystem } from './inventory'

export class Chest extends Graphics {
	private opened = false
	private inventory: InventorySystem
	constructor(inventory: InventorySystem) {
		super()
		this.inventory = inventory
		this.draw()
	}

	private draw() {
		this.clear()
		this.rect(-6, -6, 12, 12).fill({ color: 0x8b5a2b })
		this.rect(-6, -1, 12, 2).fill({ color: 0xd2b48c })
	}

	tryOpen(): boolean {
		if (this.opened) return false
		this.opened = true
		this.inventory.addGold(100)
		// simple open visual
		this.clear()
		this.rect(-6, -6, 12, 6).fill({ color: 0x8b5a2b })
		this.rect(-6, 0, 12, 6).fill({ color: 0x553311 })
		return true
	}
}


