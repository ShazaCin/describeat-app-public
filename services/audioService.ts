import { Mp3MediaRecorder } from 'mp3-mediarecorder';

export let mediaRecorder: Mp3MediaRecorder | null = null;
export let audioChunks: Blob[] = [];

let audioRecorderWorker: Worker | null = null;

export const startAudioRecording = async (): Promise<void> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Media Devices API not supported.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];

  // Create a Web Worker for mp3-mediarecorder encoding
  audioRecorderWorker = new Worker(
    new URL('./audioRecorder.worker.ts', import.meta.url),
    { type: 'module' }
  );

  mediaRecorder = new Mp3MediaRecorder(stream, {
    worker: audioRecorderWorker,
  });

  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
};

export const stopAudioRecording = (): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      return reject(new Error('Recorder not initialized'));
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });

      // Stop all tracks to release microphone
      mediaRecorder?.stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;
      audioChunks = [];

      // Terminate the worker
      if (audioRecorderWorker) {
        audioRecorderWorker.terminate();
        audioRecorderWorker = null;
      }

      resolve(audioBlob);
    };

    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      // Already stopped
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });

      if (audioRecorderWorker) {
        audioRecorderWorker.terminate();
        audioRecorderWorker = null;
      }

      resolve(audioBlob);
    }
  });
};