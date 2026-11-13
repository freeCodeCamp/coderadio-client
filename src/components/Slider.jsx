const MAX = 100;
const STEP = 5;

export default function Slider({ volume, onChange }) {
  return (
    <div className='slider-container'>
      <input
        aria-label='volume'
        className='slider'
        id='volume-input'
        max={MAX}
        min='0'
        onChange={event => onChange(event.target.value / MAX)}
        step={STEP}
        type='range'
        value={Math.round(volume * MAX)}
      />
    </div>
  );
}
