import { Container, Graphics, Sprite, Texture, Rectangle } from 'pixi.js'
import type { Equipment } from './inventory'

export class PlayerAnimator {
	private player: Sprite
	private attachments: Container
    private helm: Sprite
    private armor: Sprite
    private boots: Sprite
    private weapon: Sprite
	private castGlow: Graphics
	private ring: Sprite

	private moving = false
	private walkPhase = 0
	private meleeTimer = 0
	private castTimer = 0
	private facing: 1 | -1 = 1

	constructor(player: Sprite) {
		this.player = player
		this.attachments = new Container()
        this.player.parent?.addChild(this.attachments)
        this.attachments.position.copyFrom(this.player.position)

        // Asset-based overlays (sprites)
        this.helm = new Sprite(Texture.WHITE)
        this.armor = new Sprite(Texture.WHITE)
        this.boots = new Sprite(Texture.WHITE)
        this.weapon = new Sprite(Texture.from('/assets/characters/weapon_regular_sword.png'))
        this.weapon.anchor.set(0, 0.5)
		// small ring overlay
		this.ring = new Sprite(Texture.from('/assets/tiles/coin/coin_1.png'))
		this.ring.anchor.set(0.5)
		this.ring.scale.set(0.5)
		this.castGlow = new Graphics().circle(0, 0, 10).fill({ color: 0x77ccff, alpha: 0.5 })
		this.castGlow.visible = false

        this.helm.anchor.set(0.5)
        this.armor.anchor.set(0.5)
        this.boots.anchor.set(0.5)
        this.helm.position.set(0, -9)
        this.armor.position.set(0, 1)
        this.boots.position.set(0, 12)
        this.weapon.position.set(6, 0)
        this.ring.position.set(4, 0)
        // enforce overlay draw order: behind player for armor/boots, on top for weapon/glow
        ;(this.attachments as any).sortableChildren = true
        this.armor.zIndex = 0
        this.boots.zIndex = 0
        this.helm.zIndex = 1
        this.ring.zIndex = 2
        this.weapon.zIndex = 3
        this.castGlow.zIndex = 4
        this.attachments.addChild(this.armor, this.boots, this.helm, this.ring, this.weapon, this.castGlow)
	}

	private slice(basePath: string, rect: Rectangle): Texture {
		const base = Texture.from(basePath)
		return new Texture({ source: (base as any).source, frame: rect })
	}

    private getHelmetTexture(name: string): Texture {
        // wider crop to cover the whole face region
        const rect = new Rectangle(1, 0, 14, 10)
        return this.slice('/assets/characters/knight_m_idle_anim_f2.png', rect)
	}

    private getArmorTexture(name: string): Texture {
        // larger torso crop to cover most of the body
        const isCloth = name.includes('cloth')
        const base = isCloth ? '/assets/characters/knight_m_idle_anim_f1.png' : '/assets/characters/knight_m_run_anim_f1.png'
        const rect = new Rectangle(1, 4, 14, 12)
        return this.slice(base, rect)
	}

    private getBootsTexture(_name: string): Texture {
        // feet area wide slice along the bottom
        const rect = new Rectangle(2, 13, 12, 3)
        return this.slice('/assets/characters/knight_m_run_anim_f0.png', rect)
	}

	setMoving(isMoving: boolean) {
		this.moving = isMoving
		if (!isMoving) this.walkPhase = 0
	}

	setFacing(dir: 1 | -1) {
		if (this.facing === dir) return
		this.facing = dir
		this.attachments.scale.x = dir
		// adjust weapon origin when flipping
		this.weapon.position.set(dir === 1 ? 6 : -6, 0)
		this.weapon.anchor.set(dir === 1 ? 0 : 1, 0.5)
	}

	triggerMelee() {
		this.meleeTimer = 0.2 // seconds
	}

	triggerCast() {
		this.castTimer = 0.3 // seconds
		this.castGlow.visible = true
	}

	applyEquipmentVisibility(equipment: Equipment) {
		// weapon
		if (equipment.weapon) {
			const nm = equipment.weapon.name.toLowerCase()
			if (nm.includes('rusty')) this.weapon.texture = Texture.from('/assets/characters/weapon_rusty_sword.png')
			else if (nm.includes('short')) this.weapon.texture = Texture.from('/assets/characters/weapon_regular_sword.png')
			else if (nm.includes('staff')) this.weapon.texture = Texture.from('/assets/characters/weapon_green_magic_staff.png')
			this.weapon.visible = true
		} else {
			this.weapon.visible = false
		}
		// helmet (cropped overlay)
		if (equipment.helmet) {
			this.helm.texture = this.getHelmetTexture(equipment.helmet.name.toLowerCase())
			this.helm.visible = true
		} else this.helm.visible = false
		// armor (cropped overlay)
		if (equipment.armor) {
			const nm = equipment.armor.name.toLowerCase()
			this.armor.texture = this.getArmorTexture(nm)
			this.armor.visible = true
		} else this.armor.visible = false
		// boots (cropped overlay)
		if (equipment.boots) {
			this.boots.texture = this.getBootsTexture(equipment.boots.name.toLowerCase())
			this.boots.visible = true
		} else this.boots.visible = false
        // ring appears only when equipped
        this.ring.visible = !!equipment.ring
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

		// keep attachments following player
        this.attachments.position.copyFrom(this.player.position)
	}
}


