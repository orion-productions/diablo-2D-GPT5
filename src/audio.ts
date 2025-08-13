export class AudioManager {
	private tracks: string[]
	private currentIndex = 0
	private audio: HTMLAudioElement | null = null
	private started = false
	private muted = false
	private volume = 0.5

	constructor(trackPaths: string[]) {
		this.tracks = trackPaths
	}

	start() {
		if (this.started) return
		this.started = true
		this.playCurrent()
	}

	private playCurrent() {
		if (this.tracks.length === 0) return
		const src = this.tracks[this.currentIndex % this.tracks.length]
		if (this.audio) {
			this.audio.pause()
		}
		this.audio = new Audio(src)
		this.audio.loop = true
		this.audio.volume = this.muted ? 0 : this.volume
		// Some browsers require user gesture; caller should invoke start() after input
		void this.audio.play().catch(() => {
			// ignore autoplay rejection; will try again on next user gesture
			this.started = false
		})
	}

	next() {
		if (this.tracks.length <= 1) return
		this.currentIndex = (this.currentIndex + 1) % this.tracks.length
		this.playCurrent()
	}

	toggleMute() {
		this.muted = !this.muted
		if (this.audio) this.audio.volume = this.muted ? 0 : this.volume
	}

	setVolume(v: number) {
		this.volume = Math.max(0, Math.min(1, v))
		if (this.audio && !this.muted) this.audio.volume = this.volume
	}

	adjustVolume(delta: number) {
		this.setVolume(this.volume + delta)
	}
}


