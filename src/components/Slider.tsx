import React from 'react';

const MAX = 100;
const STEP = 5;

interface SliderProps {
  currentVolume: number;
  setTargetVolume: (arg0: number) => void;
}

const Slider : React.FC<SliderProps> = (SliderProps) => {
  const handleChange = (event: { target: { value: any; }; }) => {
    let { value } = event.target;
    SliderProps.setTargetVolume(value / MAX);
  };

  const sliderVal = SliderProps.currentVolume * MAX;

  return (
    <div className='slider-container'>
      <input
        aria-label='volume'
        className='slider'
        id='volume-input'
        max={MAX}
        min='0'
        onChange={handleChange}
        step={STEP}
        type='range'
        value={sliderVal}
      />
    </div>
  );
};

export default Slider;
