interface Equalizer {
  src?: MediaElementAudioSourceNode;
  analyser?: AnalyserNode;
  eq?: Uint8Array;
  context?: AudioContext;
  bands?: Uint8Array;
}
