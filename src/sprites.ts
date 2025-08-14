import { Assets, Texture } from 'pixi.js'

export type AnimSet = { idle: Texture[]; run: Texture[] }

export async function loadCharacterAnim(prefix: 'knight_m' | 'goblin' | 'skeleton' | 'skelet' | 'wizzard_m' | 'wizzard_f'): Promise<AnimSet> {
  const effective = prefix === 'skeleton' ? 'skelet' : prefix
  const idlePaths = [0,1,2,3].map(i => `/assets/characters/${effective}_idle_anim_f${i}.png`)
  const runPaths = [0,1,2,3].map(i => `/assets/characters/${effective}_run_anim_f${i}.png`)
  const idle = await Promise.all(idlePaths.map(p => Assets.load<Texture>(p)))
  const run = await Promise.all(runPaths.map(p => Assets.load<Texture>(p)))
  return { idle, run }
}

export async function loadChestAnim(): Promise<{ closed: Texture[]; open: Texture[] }> {
  const closed = [1,2,3,4].map(i => `/assets/tiles/chest/chest_${i}.png`)
  const open = [1,2,3,4].map(i => `/assets/tiles/chest/chest_open_${i}.png`)
  return {
    closed: await Promise.all(closed.map(p => Assets.load<Texture>(p))),
    open: await Promise.all(open.map(p => Assets.load<Texture>(p)))
  }
}


