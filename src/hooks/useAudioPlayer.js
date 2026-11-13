import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { isLowBandwidth } from '../lib/connection';
import { getStoredVolume, storeVolume } from '../lib/storage';
import { nextAttempt, orderStreams, withCacheBuster } from '../lib/streams';

const FADE_SECONDS = 0.5;
const STALL_TIMEOUT_MS = 10000;
const HEALTHY_AFTER_MS = 15000;
const WATCHDOG_INTERVAL_MS = 1000;

function createAudioGraph(audio) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  try {
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);
    return { context, analyser, gain };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}

export default function useAudioPlayer(audioRef, { mounts, remotes }) {
  const graphRef = useRef(undefined);
  const wantsPlay = useRef(false);
  const failures = useRef(0);
  const retryTimer = useRef(null);
  const fadeTimer = useRef(null);
  const lastProgress = useRef({ time: 0, at: 0, since: 0 });

  const [status, setStatus] = useState('idle');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [volume, setVolumeState] = useState(getStoredVolume);
  const [analyser, setAnalyser] = useState(null);

  const streamKey = [...remotes, ...mounts].map(s => s.url).join('|');
  const streams = useMemo(
    () => orderStreams({ mounts, remotes }, { lowBandwidth: isLowBandwidth() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reorder only when the set of streams changes
    [streamKey]
  );
  const url =
    selectedUrl && streams.some(s => s.url === selectedUrl)
      ? selectedUrl
      : (streams[0]?.url ?? '');

  const latest = useRef({ url, streams, volume });
  useEffect(() => {
    latest.current = { url, streams, volume };
  });

  const rampGain = useCallback(
    (value, seconds = FADE_SECONDS) => {
      const graph = graphRef.current;
      if (!graph) {
        audioRef.current.volume = value;
        return;
      }
      const param = graph.gain.gain;
      const now = graph.context.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(value, now + seconds);
    },
    [audioRef]
  );

  const connect = useCallback(
    target => {
      const audio = audioRef.current;
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
      lastProgress.current = { time: 0, at: Date.now(), since: 0 };
      audio.src = withCacheBuster(target);
      audio.play().catch(error => {
        if (error.name === 'NotAllowedError') {
          wantsPlay.current = false;
          setStatus('idle');
        }
      });
    },
    [audioRef]
  );

  const scheduleRetry = useCallback(() => {
    if (!wantsPlay.current || retryTimer.current) return;
    const { streams, url } = latest.current;
    const attempt = nextAttempt(failures.current++, streams, url);
    setStatus('reconnecting');
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      setSelectedUrl(attempt.url);
      connect(attempt.url);
    }, attempt.delay);
  }, [connect]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !latest.current.url) return;

    clearTimeout(fadeTimer.current);
    wantsPlay.current = true;
    failures.current = 0;
    setStatus('connecting');

    if (graphRef.current === undefined) {
      graphRef.current = createAudioGraph(audio);
      setAnalyser(graphRef.current?.analyser ?? null);
    }
    graphRef.current?.context.resume();
    rampGain(0, 0);
    connect(latest.current.url);
  }, [audioRef, connect, rampGain]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    wantsPlay.current = false;
    clearTimeout(retryTimer.current);
    retryTimer.current = null;
    setStatus('idle');

    const stop = () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
    if (graphRef.current) {
      rampGain(0);
      fadeTimer.current = setTimeout(stop, FADE_SECONDS * 1000);
    } else {
      stop();
    }
  }, [audioRef, rampGain]);

  const toggle = useCallback(
    () => (wantsPlay.current ? pause() : play()),
    [pause, play]
  );

  const selectStream = useCallback(
    next => {
      setSelectedUrl(next);
      if (wantsPlay.current) {
        failures.current = 0;
        connect(next);
      }
    },
    [connect]
  );

  const setVolume = useCallback(
    value => {
      const next = Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
      setVolumeState(next);
      storeVolume(next);
      if (wantsPlay.current) rampGain(next, 0.05);
    },
    [rampGain]
  );

  const getLatencyMs = useCallback(() => {
    const audio = audioRef.current;
    if (!wantsPlay.current || !audio?.buffered.length) return 0;
    const ahead =
      audio.buffered.end(audio.buffered.length - 1) - audio.currentTime;
    return Math.max(0, Math.round(ahead * 1000));
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;

    const onPlaying = () => {
      if (!wantsPlay.current) return;
      setStatus('playing');
      rampGain(latest.current.volume);
    };
    const onFailure = () => {
      if (wantsPlay.current && audio.getAttribute('src')) scheduleRetry();
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onFailure);
    audio.addEventListener('ended', onFailure);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onFailure);
      audio.removeEventListener('ended', onFailure);
    };
  }, [audioRef, rampGain, scheduleRetry]);

  // Live streams can stall without firing any event, so watch playback progress.
  useEffect(() => {
    const id = setInterval(() => {
      if (!wantsPlay.current || retryTimer.current) return;
      const audio = audioRef.current;
      const progress = lastProgress.current;
      const now = Date.now();

      if (audio.currentTime > progress.time) {
        lastProgress.current = {
          time: audio.currentTime,
          at: now,
          since: progress.since || now
        };
        if (now - lastProgress.current.since > HEALTHY_AFTER_MS) {
          failures.current = 0;
        }
      } else if (now - progress.at > STALL_TIMEOUT_MS) {
        scheduleRetry();
      }

      const context = graphRef.current?.context;
      if (context && context.state !== 'running') context.resume();
    }, WATCHDOG_INTERVAL_MS);
    return () => clearInterval(id);
  }, [audioRef, scheduleRetry]);

  useEffect(
    () => () => {
      clearTimeout(retryTimer.current);
      clearTimeout(fadeTimer.current);
    },
    []
  );

  return {
    analyser,
    status,
    playing: status !== 'idle',
    url,
    streams,
    volume,
    play,
    pause,
    toggle,
    selectStream,
    setVolume,
    getLatencyMs
  };
}
