import React from 'react';
import PropTypes from 'prop-types';

const MAX = 100;
const STEP = 5;

const Slider = ({ currentVolume, setTargetVolume }) => {
  const handleChange = event => {
    let { value } = event.target;
    setTargetVolume(value / MAX);
  };

  const sliderVal = currentVolume * MAX;

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

Slider.propTypes = {
  currentVolume: PropTypes.number,
  setTargetVolume: PropTypes.func
};

export default Slider;
