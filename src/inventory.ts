export type ItemSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'offhand' | 'amulet' | 'ring'

export type Item = {
	id: string
	name: string
	slot: ItemSlot | 'potion'
	attack?: number
	defense?: number
	magicPower?: number
}

export type Equipment = Partial<Record<ItemSlot, Item>>

export class InventorySystem {
	bag: Item[] = []
	equipment: Equipment = {}
	gold: number = 0

	add(item: Item) {
		this.bag.push(item)
	}

	equip(itemId: string): boolean {
			const idx = this.bag.findIndex((i) => i.id === itemId)
			if (idx < 0) return false
			const item = this.bag[idx]
		if (item.slot === 'potion') return false
			const prev = this.equipment[item.slot]
			// avoid equipping if identical item already equipped
			if (prev && prev.id === item.id) return false
			// place previous back into bag in the same position for stability
			this.equipment[item.slot] = item
			this.bag.splice(idx, 1)
			if (prev) {
				this.bag.splice(idx, 0, prev)
			}
		return true
	}

	usePotion(): boolean {
		const idx = this.bag.findIndex((i) => i.slot === 'potion')
		if (idx < 0) return false
		this.bag.splice(idx, 1)
		return true
	}

	addGold(amount: number) {
		this.gold += Math.max(0, Math.floor(amount))
	}
}


