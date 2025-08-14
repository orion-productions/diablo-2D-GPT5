import { Graphics, AnimatedSprite, Texture, Container, Sprite, Assets } from 'pixi.js'
import type { InventorySystem, Item } from './inventory'

export class Candle extends Container {
    private phase = Math.random() * Math.PI * 2
    private anim: AnimatedSprite | null = null
    private fallback: Graphics | null = null
    constructor(frames?: Texture[]) {
        super()
        if (frames && frames.length > 0) {
            this.anim = new AnimatedSprite(frames)
            this.anim.animationSpeed = 0.15
            this.anim.anchor.set(0.5)
            this.addChild(this.anim)
            this.anim.play()
        } else {
            this.fallback = new Graphics()
            this.addChild(this.fallback)
            this.drawFlame(0.6)
        }
    }

    private drawFlame(intensity: number) {
        if (!this.fallback) return
        this.fallback.clear()
    // wall sconce + candle flame
        this.fallback.rect(-2, 4, 4, 6).fill({ color: 0x6b4f2a }) // sconce wood
        this.fallback.rect(-1, 1, 2, 4).fill({ color: 0xffffff }) // candle body
        this.fallback.circle(0, -2, 2 + intensity * 0.8).fill({ color: 0xffcc55 })
	}

    update(dt: number) {
        if (this.anim) return
        this.phase += dt * 6
        const i = 0.5 + Math.sin(this.phase) * 0.3
        this.drawFlame(i)
    }
}

export class Breakable extends Container {
    hp: number
    public kind: 'table' | 'chair'
    private sprite: Sprite | null = null
    constructor(kind: 'table' | 'chair' = 'table') {
        super()
        this.kind = kind
        this.hp = kind === 'table' ? 6 : 3
        void this.draw()
    }

    private async draw() {
        const tex = this.kind === 'table'
            ? await Assets.load<Texture>('/assets/characters/crate.png')
            : await Assets.load<Texture>('/assets/tiles/box_1/box_1_1.png')
        this.sprite?.destroy()
        this.sprite = new Sprite(tex)
        this.sprite.anchor.set(0.5)
        this.addChild(this.sprite)
    }

    takeDamage(dmg: number) {
        this.hp -= dmg
        if (this.hp <= 0) {
            const debris = new Graphics().rect(-6, -4, 12, 8).fill({ color: 0x3a2a15, alpha: 0.5 })
            debris.x = this.x; debris.y = this.y
            this.parent?.addChild(debris)
            setTimeout(() => debris.destroy(), 150)
            try { (window as any).__audio?.playSfx('/assets/sfx/breakable_smash.wav') } catch {}
            this.destroy()
        }
    }
}

export class Pickup extends Graphics {
	public item: Item
	constructor(item: Item) {
		super()
		this.item = item
		this.circle(0, 0, 5).fill({ color: 0x88cc88 })
	}

	collect(inv: InventorySystem): boolean {
		inv.add(this.item)
		this.destroy()
		return true
	}
}


