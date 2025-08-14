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
    const getIconFor = (item: Item): string => {
      const name = item.name.toLowerCase()
      switch (item.slot) {
        case 'weapon':
          if (name.includes('rusty')) return '/assets/characters/weapon_rusty_sword.png'
          return '/assets/characters/weapon_regular_sword.png'
        case 'helmet':
          return name.includes('leather') ? '/assets/characters/knight_m_idle_anim_f0.png' : '/assets/characters/knight_m_idle_anim_f2.png'
        case 'armor':
          if (name.includes('cloth')) return '/assets/characters/knight_m_idle_anim_f1.png'
          if (name.includes('padded')) return '/assets/characters/knight_m_run_anim_f1.png'
          return '/assets/characters/knight_m_idle_anim_f1.png'
        case 'boots':
          return name.includes('leather') ? '/assets/characters/knight_m_run_anim_f0.png' : '/assets/characters/knight_m_run_anim_f2.png'
        case 'offhand':
          return '/assets/characters/knight_m_run_anim_f3.png'
        case 'amulet':
          return '/assets/tiles/keys/keys_1_1.png'
        case 'ring':
          return '/assets/tiles/coin/coin_1.png'
        default:
          return ''
      }
    }
    for (const slot of ['weapon','armor','helmet','boots','offhand','amulet','ring'] as const) {
      const cell = document.createElement('div')
      cell.className = 'inv-cell'
      const item = eq[slot]
      const img = document.createElement('img')
      img.style.width = '24px'; img.style.height = '24px'
      let src = ''
      if (item) src = getIconFor(item)
      if (src) img.src = src
      if (item) cell.title = item.name
      if (item) cell.classList.add('filled')
      if (src && item) cell.appendChild(img)
      // rarity/class badge per item type for quick differentiation
      const badge = document.createElement('div')
      badge.className = 'badge'
      let color = '#3a3a3a'
      if (item) {
        if (item.name.toLowerCase().includes('leather') || item.name.toLowerCase().includes('buckler')) color = '#7a5230'
        else if (item.name.toLowerCase().includes('cloth') || item.name.toLowerCase().includes('padded')) color = '#556b9a'
        else if (item.name.toLowerCase().includes('rusty') || item.name.toLowerCase().includes('copper')) color = '#9a7b4f'
        else if (item.name.toLowerCase().includes('short') || item.name.toLowerCase().includes('simple')) color = '#6d8a3c'
      }
      badge.style.background = color
      cell.appendChild(badge)
      const label = document.createElement('div')
      label.className = 'slot-label'
      label.textContent = SLOT_LABELS[slot]
      cell.appendChild(label)
      if (item) {
        cell.classList.add('clickable')
        cell.onclick = () => { this.inventory.unequip(slot); this.render() }
      }
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
      if (item.slot === 'potion') src = '/assets/tiles/flasks/flasks_1_1.png'
      else src = getIconFor(item)
      if (src) img.src = src; else cell.textContent = item.name
      if (src) cell.appendChild(img)
      const badge = document.createElement('div')
      badge.className = 'badge'
      let color = '#3a3a3a'
      const nm = item.name.toLowerCase()
      if (nm.includes('leather') || nm.includes('buckler')) color = '#7a5230'
      else if (nm.includes('cloth') || nm.includes('padded')) color = '#556b9a'
      else if (nm.includes('rusty') || nm.includes('copper')) color = '#9a7b4f'
      else if (nm.includes('short') || nm.includes('simple')) color = '#6d8a3c'
      badge.style.background = color
      cell.appendChild(badge)
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


