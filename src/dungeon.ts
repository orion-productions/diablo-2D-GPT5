export type RectRoom = { x: number; y: number; w: number; h: number; cx: number; cy: number }

export type Dungeon = { grid: number[][]; rooms: RectRoom[] }

// 0 = floor, 1 = wall
export function generateDungeon(widthTiles: number, heightTiles: number, maxRooms = 12): Dungeon {
	const grid: number[][] = Array.from({ length: heightTiles }, () => Array(widthTiles).fill(1))

	const rooms: RectRoom[] = []
	const rand = () => Math.random()

	function carveRoom(x: number, y: number, w: number, h: number) {
		for (let j = y; j < y + h; j++) {
			for (let i = x; i < x + w; i++) {
				if (i <= 0 || j <= 0 || i >= widthTiles - 1 || j >= heightTiles - 1) continue
				grid[j][i] = 0
			}
		}
	}

	function carveHTunnel(x1: number, x2: number, y: number) {
		for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) grid[y][x] = 0
	}
	function carveVTunnel(y1: number, y2: number, x: number) {
		for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) grid[y][x] = 0
	}

	for (let r = 0; r < maxRooms; r++) {
    const w = 8 + Math.floor(rand() * 8) // wider rooms
    const h = 8 + Math.floor(rand() * 8)
		const x = 2 + Math.floor(rand() * (widthTiles - w - 4))
		const y = 2 + Math.floor(rand() * (heightTiles - h - 4))

		// Reject if overlaps existing room (allow 1 tile padding)
		let overlaps = false
		for (const rm of rooms) {
			if (x <= rm.x + rm.w + 1 && x + w + 1 >= rm.x && y <= rm.y + rm.h + 1 && y + h + 1 >= rm.y) {
				overlaps = true
				break
			}
		}
		if (overlaps) continue

		carveRoom(x, y, w, h)
		const cx = Math.floor(x + w / 2)
		const cy = Math.floor(y + h / 2)
		rooms.push({ x, y, w, h, cx, cy })
    if (rooms.length > 1) {
			// connect to previous room with L corridor
			const prev = rooms[rooms.length - 2]
      if (rand() < 0.5) {
        carveHTunnel(prev.cx, cx, prev.cy)
        carveHTunnel(prev.cx, cx, prev.cy + 1)
        carveVTunnel(prev.cy, cy, cx)
        carveVTunnel(prev.cy, cy, cx + 1)
      } else {
        carveVTunnel(prev.cy, cy, prev.cx)
        carveVTunnel(prev.cy, cy, prev.cx + 1)
        carveHTunnel(prev.cx, cx, cy)
        carveHTunnel(prev.cx, cx, cy + 1)
      }
		}
	}

	// ensure borders stay walls
	for (let x = 0; x < widthTiles; x++) {
		grid[0][x] = 1
		grid[heightTiles - 1][x] = 1
	}
	for (let y = 0; y < heightTiles; y++) {
		grid[y][0] = 1
		grid[y][widthTiles - 1] = 1
	}

	return { grid, rooms }
}


