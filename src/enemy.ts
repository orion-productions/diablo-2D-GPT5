import { Container, Graphics } from 'pixi.js'
import { Chest } from './loot'

export class Enemy extends Graphics {
  public target: Container
  speed = 100
  detectionRadius = 220
  maxHealth = 20
  health = 20
  private barBg: Graphics
  private barFg: Graphics
  private damageDisplayTimer = 0 // seconds remaining to show health bar
  constructor(target: Container) {
    super()
    this.target = target
    this.circle(0, 0, 6).fill({ color: 0xcc4444 })
    // Health bar
    this.barBg = new Graphics()
    this.barFg = new Graphics()
    this.addChild(this.barBg)
    this.addChild(this.barFg)
    this.barBg.visible = false
    this.barFg.visible = false
  }

  update(dt: number) {
    if (this.destroyed) return
    const dx = this.target.x - this.x
    const dy = this.target.y - this.y
    const dist = Math.hypot(dx, dy)
    if (dist < this.detectionRadius && dist > 1) {
      this.x += (dx / dist) * this.speed * dt
      this.y += (dy / dist) * this.speed * dt
    }

    if (this.damageDisplayTimer > 0) {
      this.damageDisplayTimer -= dt
      this.drawHealthBar()
      const visible = this.damageDisplayTimer > 0
      this.barBg.visible = visible
      this.barFg.visible = visible
    }
  }

  takeDamage(amount: number, knockbackX = 0, knockbackY = 0) {
    this.health = Math.max(0, this.health - amount)
    // immediate knockback displacement
    this.x += knockbackX
    this.y += knockbackY
    // show bar for 3 seconds
    this.damageDisplayTimer = 3
    this.drawHealthBar()
    this.barBg.visible = true
    this.barFg.visible = true
    if (this.health <= 0 && !this.destroyed) {
      const inv = (this.target as any).inventory ?? (window as any).__inventory
      const chest = new Chest(inv)
      chest.x = this.x
      chest.y = this.y
      this.parent?.addChild(chest)
      this.destroy()
    }
  }

  private drawHealthBar() {
    const width = 24
    const height = 3
    const pad = 1
    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth))
    this.barBg.clear()
    this.barBg.rect(-width / 2, -14, width, height).fill({ color: 0x552222 })
    this.barFg.clear()
    this.barFg.rect(-width / 2 + pad, -14 + pad, (width - pad * 2) * ratio, height - pad * 2).fill({ color: 0x44dd55 })
  }
}


