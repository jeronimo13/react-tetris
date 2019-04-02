import React from "react";
import "./tile.css";

export default class element extends React.Component {
  state = {
    isFalling: true
  };

  color = (val)=> {
    switch(val){
      case 2: return "#7d4040"
      case 1: return "#527d40"
      case -1: return "#3a5a27"
      case 0: return "#c2e4b4"
      default: return "#c2e4b4"
    }
  }

  render() {
    const backgroundColor =this.color(this.props.value);
    return (
      <div
        className="tile"
        style={{
          width: this.props.tileSize,
          height: this.props.tileSize,
          top: this.props.top,
          backgroundColor: this.props.backgroundColor
            ? this.props.backgroundColor
            : "#c2e4b4",
          borderWidth: this.props.active || this.props.border ? " 1px" : 0,
          borderColor: "black",
          borderStyle: "solid"
        }}
      >
        <div
          style={{
            margin: 2,
            backgroundColor: this.props.backgroundColor
              ? this.props.backgroundColor
              : backgroundColor,
            width: this.props.tileSize - 6,
            height: this.props.tileSize - 6
          }}
        />
      </div>
    );
  }
}
