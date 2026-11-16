import { useEffect, useRef } from 'react';

const FILL = 'rgba(10, 10, 35, 0.6)';
const HEIGHT_SCALE = 0.7529;
const IGNORED_HIGH_BANDS = 32;
const CLEAR_DELAY_MS = 500;

export default function Visualizer({ analyser, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const { offsetWidth, offsetHeight } = canvas.parentNode;
      canvas.width = offsetWidth * ratio;
      canvas.height = offsetHeight * ratio;
      canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!active || !analyser) {
      const id = setTimeout(clear, CLEAR_DELAY_MS);
      return () => clearTimeout(id);
    }

    const bands = new Uint8Array(
      analyser.frequencyBinCount - IGNORED_HIGH_BANDS
    );
    let frame;

    const draw = () => {
      analyser.getByteFrequencyData(bands);
      const width = canvas.parentNode.offsetWidth;
      const barWidth = width / bands.length;

      clear();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = FILL;
      bands.forEach((band, index) => {
        const x = index * barWidth;
        const y = band * HEIGHT_SCALE;
        ctx.lineTo(x, y);
        ctx.lineTo(x + barWidth, y);
      });
      ctx.lineTo(width, 0);
      ctx.fill();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [analyser, active]);

  return (
    <div className='visualizer'>
      <canvas aria-label='visualizer' ref={canvasRef} />
    </div>
  );
}
