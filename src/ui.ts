import type { Item } from './inventory'
import { InventorySystem } from './inventory'

export class InventoryOverlay {
  private root: HTMLDivElement
  private list: HTMLDivElement
  private equipped: HTMLDivElement
  private inventory: InventorySystem
  private headGold: HTMLSpanElement

  constructor(inventory: InventorySystem) {
    this.inventory = inventory
    this.root = document.createElement('div')
    this.root.id = 'inventory-overlay'
    this.root.style.display = 'block'

    // Minimal header with gold
    const head = document.createElement('div')
    head.className = 'inv-head'
    const coin = document.createElement('img')
    coin.src = '/assets/tiles/coin/coin_1.png'
    coin.width = 16
    coin.height = 16
    const goldSpan = document.createElement('span')
    goldSpan.className = 'inv-gold'
    goldSpan.textContent = String(this.inventory.gold)
    this.headGold = goldSpan
    head.appendChild(coin)
    head.appendChild(goldSpan)

    this.equipped = document.createElement('div')
    this.equipped.className = 'inv-equipped'

    this.list = document.createElement('div')
    this.list.className = 'inv-list'

    this.root.appendChild(head)
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
    // update gold
    this.headGold.textContent = String(this.inventory.gold)
    // Equipped
    const eq = this.inventory.equipment
    this.equipped.innerHTML = ''
    const eqGrid = document.createElement('div')
    eqGrid.className = 'eq-grid'
    const SLOT_LABELS: Record<string, string> = {
      weapon: 'Wpn', armor: 'Armor', helmet: 'Helm', boots: 'Boots', offhand: 'Off', amulet: 'Amu', ring: 'Ring',
    }
    for (const slot of ['weapon','armor','helmet','boots','offhand','amulet','ring'] as const) {
      const cell = document.createElement('div')
      cell.className = 'inv-cell'
      const item = eq[slot]
      const img = document.createElement('img')
      img.style.width = '24px'; img.style.height = '24px'
      let src = ''
      // icon atlas mapping
      if (slot === 'weapon') src = '/assets/characters/weapon_regular_sword.png'
      else if (slot === 'helmet') src = '/assets/characters/knight_m_idle_anim_f0.png'
      else if (slot === 'boots') src = '/assets/characters/knight_m_run_anim_f0.png'
      else if (slot === 'armor') src = '/assets/characters/knight_m_idle_anim_f1.png'
      else if (slot === 'amulet') src = '/assets/tiles/keys/keys_1_1.png'
      else if (slot === 'ring') src = '/assets/tiles/coin/coin_1.png'
      if (item && item.slot === 'potion') src = '/assets/tiles/flasks/flasks_1_1.png'
      if (src) img.src = src
      if (item) cell.title = item.name
      if (item) cell.classList.add('filled')
      if (src && item) cell.appendChild(img)
      const label = document.createElement('div')
      label.className = 'slot-label'
      label.textContent = SLOT_LABELS[slot]
      cell.appendChild(label)
      eqGrid.appendChild(cell)
    }
    this.equipped.appendChild(eqGrid)

    // Bag
    this.list.innerHTML = ''
    const grid = document.createElement('div')
    grid.className = 'bag-grid'
    this.inventory.bag.forEach((item) => {
      const cell = document.createElement('div')
      cell.className = 'inv-cell clickable'
      const img = document.createElement('img')
      img.style.width = '24px'
      img.style.height = '24px'
      img.alt = item.name
      // crude icon mapping
      let src = ''
      if (item.slot === 'weapon') src = '/assets/characters/weapon_rusty_sword.png'
      else if (item.slot === 'helmet') src = '/assets/characters/knight_m_idle_anim_f0.png'
      else if (item.slot === 'boots') src = '/assets/characters/knight_m_run_anim_f0.png'
      else if (item.slot === 'armor') src = '/assets/characters/knight_m_idle_anim_f1.png'
      else if (item.slot === 'potion') src = '/assets/tiles/flasks/flasks_1_1.png'
      else if (item.slot === 'ring') src = '/assets/tiles/coin/coin_1.png'
      else if (item.slot === 'amulet') src = '/assets/tiles/keys/keys_1_1.png'
      if (src) img.src = src; else cell.textContent = item.name
      if (src) cell.appendChild(img)
      cell.title = item.name
      cell.onclick = () => this.onItemClick(item)
      const sl = document.createElement('div')
      sl.className = 'slot-label'
      sl.textContent = (item.slot === 'potion') ? 'Potion' : SLOT_LABELS[item.slot]
      cell.appendChild(sl)
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


