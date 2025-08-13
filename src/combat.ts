import { Container, Graphics } from 'pixi.js'
import { Enemy } from './enemy'
import { Breakable } from './props'

export class Projectile extends Graphics {
	private vx: number
	private vy: number
	private lifetime: number = 1.2
  private damage = 3

	constructor(x: number, y: number, dirX: number, dirY: number, speed: number, color = 0x66ccff) {
		super()
		this.circle(0, 0, 3).fill({ color })
		this.x = x
		this.y = y
		const len = Math.hypot(dirX, dirY) || 1
		this.vx = (dirX / len) * speed
		this.vy = (dirY / len) * speed
	}

	update(dt: number): boolean {
		this.x += this.vx * dt
		this.y += this.vy * dt
		this.lifetime -= dt
		return this.lifetime <= 0
	}

  tryHit(enemies: Enemy[]): boolean {
    for (const e of enemies) {
      if (e.destroyed) continue
      const dx = e.x - this.x
      const dy = e.y - this.y
      if (dx * dx + dy * dy <= 10 * 10) {
        e.takeDamage(this.damage, dx * 0.05, dy * 0.05)
        return true
      }
    }
    return false
  }
}

export class CombatSystem {
  projectiles: Projectile[] = []
  layer: Container
  enemies: Enemy[] = []
  breakablesLayer?: Container

  constructor(layer: Container, breakablesLayer?: Container) {
    this.layer = layer
    this.breakablesLayer = breakablesLayer
  }

	castMagic(x: number, y: number, targetX: number, targetY: number) {
		const p = new Projectile(x, y, targetX - x, targetY - y, 280, 0x99ddff)
		this.layer.addChild(p)
		this.projectiles.push(p)
	}

  update(dt: number) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i]
      let dead = p.update(dt)
      // enemy hit
      if (!dead && p.tryHit(this.enemies)) dead = true
      // breakable hit
      if (!dead && this.breakablesLayer) {
        for (const child of this.breakablesLayer.children) {
          if (child instanceof Breakable) {
            const dx = child.x - p.x
            const dy = child.y - p.y
            if (dx * dx + dy * dy <= 10 * 10) {
              child.takeDamage(3)
              dead = true
              break
            }
          }
        }
      }
			if (dead) {
				p.destroy()
				this.projectiles.splice(i, 1)
			}
		}
    // update enemies, then prune destroyed
    for (const e of this.enemies) {
      if (!e.destroyed && (e as any).update) e.update(dt)
    }
    this.enemies = this.enemies.filter((e) => !e.destroyed)
	}

  meleeAttack(x: number, y: number, radius: number) {
		// hit enemies in radius and knock them back slightly
		for (const e of this.enemies) {
      if (e.destroyed) continue
      const ex = e.x
      const ey = e.y
      const dx = ex - x
      const dy = ey - y
			const dist = Math.hypot(dx, dy)
			if (dist <= radius && dist > 0.001) {
        const nx = dx / dist
        const ny = dy / dist
        e.takeDamage(2, nx * 20, ny * 20)
				// small flash
				const flash = new Graphics().circle(0, 0, 8).fill({ color: 0xffff99 })
        flash.x = ex
        flash.y = ey
				this.layer.addChild(flash)
				setTimeout(() => flash.destroy(), 80)
			}
		}
    // breakables in decor layer
    if (this.breakablesLayer) {
      for (const child of this.breakablesLayer.children.slice()) {
        if (child instanceof Breakable) {
          const dx = child.x - x
          const dy = child.y - y
          if (dx * dx + dy * dy <= radius * radius) child.takeDamage(3)
        }
      }
    }
	}
}


