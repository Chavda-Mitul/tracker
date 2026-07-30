let completeAudio: HTMLAudioElement | null = null

export function playCompleteSound() {
  completeAudio ??= new Audio("/sounds/task-complete.wav")
  completeAudio.currentTime = 0
  void completeAudio.play()
}
