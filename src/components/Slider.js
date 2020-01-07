import React from "react";
import PropTypes from "prop-types";

class Slider extends React.Component {
  state = {
    sliderVal: 5
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // if the keyboards are changing the volume, adjust slider accordingly
    if (nextProps.currentVolume * 10 !== prevState.sliderVal) {
      return { sliderVal: nextProps.currentVolume * 10 };
    }
    return null;
  }

  handleSliderChange(e) {
    let { value } = e.target;
    this.props.setTargetVolume(value / 10);
    this.setState({ sliderVal: e.target.value });
  }

  render() {
    return (
      <div className="slider-container">
        <input
          id="slider"
          max="10"
          min="0"
          onChange={this.handleSliderChange.bind(this)}
          type="range"
          value={this.state.sliderVal}
        />
      </div>
    );
  }
}

Slider.propTypes = {
  currentVolume: PropTypes.number,
  setTargetVolume: PropTypes.func
};

export default Slider;
