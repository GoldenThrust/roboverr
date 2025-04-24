import asset from "./assetLoader.js";

export let audioCtx = new (window.AudioContext || window.webkitaudioContext)();

export async function createAudioBuffer(path) {
  const response = await fetch(path);
  const audioData = await response.arrayBuffer();
  const buffer = await audioCtx.decodeAudioData(audioData);

  return buffer;
}

async function playSound(buffer, gain = null) {
  const source = audioCtx.createBufferSource();
  if (gain) {
    source.connect(gain).connect(audioCtx.destination);
  } else {
    source.connect(audioCtx.destination);
  }

  source.buffer = buffer;

  source.start();
}

export async function playGunshot() {
  const buffer = asset['shoot'];
  if (!buffer) {
    console.error('Audio buffer not found for gunshot sound');
    return;
  }
  await playSound(buffer);
}


export async function playWalk(panner) {
  const buffer = asset['walk'];
  if (!buffer) {
    console.error('Audio buffer not found for walk sound');
    return;
  }
  await playSound(buffer);
}