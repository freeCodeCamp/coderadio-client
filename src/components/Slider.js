import React from "react";
import PropTypes from "prop-types";

const Slider = ({ currentVolume, setTargetVolume }) => {
  const sliderVal = currentVolume * 10;
  const handleChange = e => {
    let { value } = e.target;
    setTargetVolume(value / 10);
  }

  return (
    <div className="slider-container">
      <input
        id="slider"
        max="10"
        min="0"
        onChange={handleChange}
        type="range"
        value={sliderVal}
      />
    </div>
  );
}

Slider.propTypes = {
  currentVolume: PropTypes.number,
  setTargetVolume: PropTypes.func
};

export default Slider;
