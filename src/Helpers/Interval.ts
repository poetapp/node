export class Interval {
  private readonly callback: () => void
  private readonly interval: number
  private timerId: NodeJS.Timer

  constructor(callback: () => void, interval: number) {
    this.callback = callback
    this.interval = interval
  }

  start() {
    this.timerId = setInterval(this.callback, this.interval)
  }

  stop() {
    clearInterval(this.timerId)
    this.timerId = null
  }

}
