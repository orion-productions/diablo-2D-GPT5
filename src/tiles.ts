import { Assets, Texture } from 'pixi.js'

export type Tiles = {
	floor: Texture
	wallLow: Texture
	wallHigh: Texture
	candleFrames: Texture[]
}

export async function loadTiles(): Promise<Tiles> {
	// Load main tileset images
  // Preload base images into cache to avoid warnings when creating textures
  await Assets.load(['/assets/tiles/atlas_floor-16x16.png','/assets/tiles/atlas_walls_low-16x16.png','/assets/tiles/atlas_walls_high-16x32.png'])
  const floor = Texture.from('/assets/tiles/atlas_floor-16x16.png')
  const wallLow = Texture.from('/assets/tiles/atlas_walls_low-16x16.png')
  const wallHigh = Texture.from('/assets/tiles/atlas_walls_high-16x32.png')
	// Candle frames (ensure textures are loaded before use in AnimatedSprite)
	const candlePaths = [
		'/assets/tiles/torch/candlestick_1_1.png',
		'/assets/tiles/torch/candlestick_1_2.png',
		'/assets/tiles/torch/candlestick_1_3.png',
		'/assets/tiles/torch/candlestick_1_4.png',
	]
	const candleFrames: Texture[] = await Promise.all(candlePaths.map((p) => Assets.load<Texture>(p)))
	return { floor, wallLow, wallHigh, candleFrames }
}


