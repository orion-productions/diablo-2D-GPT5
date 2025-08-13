import { Container, Graphics } from 'pixi.js'
import { Chest } from './loot'

export class Enemy extends Container {
	public target: Container
	speed = 100
	detectionRadius = 220
	maxHealth = 20
	health = 20

	// visuals
	private body: Graphics
	private eyeL: Graphics
	private eyeR: Graphics
	private legL: Graphics
	private legR: Graphics
	private barBg: Graphics
	private barFg: Graphics
	private flash: Graphics | null = null

	// anim state
	private walkPhase = 0
	private blinkTimer = 1.5
	private blinkState = 0
	private damageDisplayTimer = 0

	constructor(target: Container) {
		super()
		this.target = target

		// legs
		this.legL = new Graphics().rect(-4, 6, 3, 4).fill({ color: 0x772222 })
		this.legR = new Graphics().rect(1, 6, 3, 4).fill({ color: 0x772222 })
		// body
		this.body = new Graphics().roundRect(-6, -8, 12, 14, 3).fill({ color: 0xcc4444 })
		// eyes
		this.eyeL = new Graphics().rect(-3, -2, 2, 2).fill({ color: 0xffffff })
		this.eyeR = new Graphics().rect(1, -2, 2, 2).fill({ color: 0xffffff })

		// health bar
		this.barBg = new Graphics()
		this.barFg = new Graphics()

		this.addChild(this.legL, this.legR, this.body, this.eyeL, this.eyeR, this.barBg, this.barFg)
		this.barBg.visible = false
		this.barFg.visible = false
	}

	update(dt: number) {
		if (this.destroyed) return
		// chase
    const dx = (this.target?.x ?? this.x) - this.x
    const dy = (this.target?.y ?? this.y) - this.y
		const dist = Math.hypot(dx, dy)
		const moving = dist < this.detectionRadius && dist > 1
		if (moving) {
			const stepX = (dx / dist) * this.speed * dt
			const stepY = (dy / dist) * this.speed * dt
			const world: any = this.parent
			if (world?.resolveMovement) {
				const res = world.resolveMovement(this.x, this.y, stepX, stepY, 6)
				this.position.set(res.x, res.y)
			} else {
				this.x += stepX
				this.y += stepY
			}
			this.walkPhase += dt * 12
			const legSwing = Math.sin(this.walkPhase) * 0.6
			this.legL.rotation = legSwing
			this.legR.rotation = -legSwing
			this.body.y = Math.sin(this.walkPhase) * 0.5
		} else {
			this.legL.rotation = 0
			this.legR.rotation = 0
			this.body.y = 0
		}

		// simple eye blink
		this.blinkTimer -= dt
		if (this.blinkTimer <= 0) {
			this.blinkState = (this.blinkState + 1) % 2
			const closed = this.blinkState === 1
			this.eyeL.visible = !closed
			this.eyeR.visible = !closed
			this.blinkTimer = closed ? 0.08 : 1.5 + Math.random() * 1.5
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
		// knockback
		this.x += knockbackX
		this.y += knockbackY
		// show bar for 3 seconds
		this.damageDisplayTimer = 3
		this.drawHealthBar()
		this.barBg.visible = true
		this.barFg.visible = true
		// brief damage flash
		if (!this.flash) {
			this.flash = new Graphics().roundRect(-7, -9, 14, 16, 3).fill({ color: 0xffffff, alpha: 0.6 })
			this.addChild(this.flash)
			setTimeout(() => {
				this.flash?.destroy()
				this.flash = null
			}, 60)
		}
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


