import React from 'react';
import PropTypes from 'prop-types';

const MAX = 100;

const Slider = ({ currentVolume, setTargetVolume }) => {
  const handleChange = e => {
    let { value } = e.target;
    setTargetVolume(value / MAX);
  };

  const sliderVal = currentVolume * MAX;

  return (
    <div className='slider-container'>
      <input
        aria-label='slider'
        id='slider'
        max={MAX}
        min='0'
        onChange={handleChange}
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
