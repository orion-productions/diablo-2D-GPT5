import { Container, Graphics, Sprite } from 'pixi.js'
import type { Equipment } from './inventory'

export class PlayerAnimator {
	private player: Sprite
	private attachments: Container
	private helm: Graphics
	private armor: Graphics
	private boots: Graphics
	private weapon: Graphics
	private castGlow: Graphics

	private moving = false
	private walkPhase = 0
	private meleeTimer = 0
	private castTimer = 0

	constructor(player: Sprite) {
		this.player = player
		this.attachments = new Container()
		this.player.addChild(this.attachments)

		this.helm = new Graphics().rect(-3, -12, 6, 3).fill({ color: 0xbbaa77 })
		this.armor = new Graphics().rect(-5, -6, 10, 8).fill({ color: 0x7788aa })
		this.boots = new Graphics().rect(-4, 6, 8, 3).fill({ color: 0x664422 })
		this.weapon = new Graphics().rect(6, -1, 8, 2).fill({ color: 0xccaa55 })
		this.weapon.pivot.set(0, 0)
		this.castGlow = new Graphics().circle(0, 0, 10).fill({ color: 0x77ccff, alpha: 0.5 })
		this.castGlow.visible = false

		this.attachments.addChild(this.helm, this.armor, this.boots, this.weapon, this.castGlow)
	}

	setMoving(isMoving: boolean) {
		this.moving = isMoving
		if (!isMoving) this.walkPhase = 0
	}

	triggerMelee() {
		this.meleeTimer = 0.2 // seconds
	}

	triggerCast() {
		this.castTimer = 0.3 // seconds
		this.castGlow.visible = true
	}

	applyEquipmentVisibility(equipment: Equipment) {
		this.helm.visible = !!equipment.helmet
		this.armor.visible = !!equipment.armor
		this.boots.visible = !!equipment.boots
		this.weapon.visible = !!equipment.weapon
	}

	update(dt: number) {
		// Walk bob (apply to attachments only so gameplay coords remain stable)
		if (this.moving) {
			this.walkPhase += dt * 10
			this.attachments.y = Math.sin(this.walkPhase) * 1.5
		} else {
			this.attachments.y = 0
		}

		// Melee swing animation
		if (this.meleeTimer > 0) {
			this.meleeTimer = Math.max(0, this.meleeTimer - dt)
			const t = 1 - this.meleeTimer / 0.2 // 0 -> 1
			const swing = (Math.sin(t * Math.PI) * 1.4) - 0.7
			this.weapon.rotation = swing
		} else {
			this.weapon.rotation = 0
		}

		// Cast glow pulse
		if (this.castTimer > 0) {
			this.castTimer = Math.max(0, this.castTimer - dt)
			const t = 1 - this.castTimer / 0.3
			this.castGlow.visible = true
			this.castGlow.alpha = 0.6 * (1 - t)
			this.castGlow.scale.set(1 + t * 0.5)
		} else {
			this.castGlow.visible = false
			this.castGlow.scale.set(1)
		}
	}
}


