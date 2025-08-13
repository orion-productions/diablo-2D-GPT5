import type { Item } from './inventory'
import { InventorySystem } from './inventory'

export class InventoryOverlay {
  private root: HTMLDivElement
  private list: HTMLDivElement
  private equipped: HTMLDivElement
  private inventory: InventorySystem

  constructor(inventory: InventorySystem) {
    this.inventory = inventory
    this.root = document.createElement('div')
    this.root.id = 'inventory-overlay'
    this.root.style.display = 'block'

    const title = document.createElement('div')
    title.className = 'inv-title'
    title.textContent = 'Inventory (click item to equip, I to close)'

    this.equipped = document.createElement('div')
    this.equipped.className = 'inv-equipped'

    this.list = document.createElement('div')
    this.list.className = 'inv-list'

    this.root.appendChild(title)
    this.root.appendChild(this.equipped)
    this.root.appendChild(this.list)
    document.body.appendChild(this.root)

    this.render()
  }

  toggle() {
    const isHidden = this.root.style.display === 'none'
    this.root.style.display = isHidden ? 'block' : 'none'
    if (!isHidden) return
    this.render()
  }

  render() {
    // Equipped
    const eq = this.inventory.equipment
    this.equipped.innerHTML = ''
    const eqTitle = document.createElement('div')
    eqTitle.textContent = `Equipped (Gold: ${this.inventory.gold}):`
    this.equipped.appendChild(eqTitle)
    const eqList = document.createElement('ul')
    for (const slot of ['weapon','armor','helmet','boots','offhand','amulet','ring'] as const) {
      const li = document.createElement('li')
      const item = eq[slot]
      li.textContent = `${slot}: ${item ? item.name : '-'}`
      eqList.appendChild(li)
    }
    this.equipped.appendChild(eqList)

    // Bag
    this.list.innerHTML = ''
    const bagTitle = document.createElement('div')
    bagTitle.textContent = 'Bag:'
    this.list.appendChild(bagTitle)
    const grid = document.createElement('div')
    grid.className = 'inv-grid'
    this.inventory.bag.forEach((item) => {
      const cell = document.createElement('button')
      cell.className = 'inv-cell'
      cell.textContent = item.name
      cell.onclick = () => this.onItemClick(item)
      grid.appendChild(cell)
    })
    this.list.appendChild(grid)
  }

  private onItemClick(item: Item) {
    if (item.slot === 'potion') return
    this.inventory.equip(item.id)
    this.render()
  }
}


