import { Container, AnimatedSprite, Texture, Assets } from 'pixi.js'
import { InventorySystem } from './inventory'

export class Chest extends Container {
    private opened = false
    private inventory: InventorySystem
    private sprite: AnimatedSprite | null = null
    private closedFrames: Texture[] = []
    private openFrames: Texture[] = []

    constructor(inventory: InventorySystem) {
        super()
        this.inventory = inventory
        void this.init()
    }

    private async init() {
        const closedPaths = [1,2,3,4].map(i => `/assets/tiles/chest/chest_${i}.png`)
        const openPaths = [1,2,3,4].map(i => `/assets/tiles/chest/chest_open_${i}.png`)
        this.closedFrames = await Promise.all(closedPaths.map(p => Assets.load<Texture>(p)))
        this.openFrames = await Promise.all(openPaths.map(p => Assets.load<Texture>(p)))
        this.sprite = new AnimatedSprite(this.closedFrames)
        this.sprite.animationSpeed = 0.12
        this.sprite.anchor.set(0.5)
        this.sprite.play()
        this.addChild(this.sprite)
    }

    tryOpen(): boolean {
        if (this.opened) return false
        this.opened = true
        this.inventory.addGold(100)
        if (this.sprite && this.openFrames.length > 0) {
            this.sprite.textures = this.openFrames
            this.sprite.loop = false
            this.sprite.gotoAndPlay(0)
        }
        return true
    }
}


