import React, { Component } from "react";
import "./App.css";

import Container from "./components/container";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faSyncAlt,
  faPause
} from "@fortawesome/free-solid-svg-icons";

library.add(faChevronLeft);
library.add(faChevronRight);
library.add(faChevronDown);
library.add(faSyncAlt);
library.add(faPause);

class App extends Component {
  state = { width: 0, height: 0 };
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  render() {
    const height = Math.floor(
      (this.state.height - this.state.height * 0.45) / 18
    );
    const width = Math.floor(this.state.width / 18);
    const size = width >= height ? height : width;
    return (
      <div className="App">
        <Container tileSize={size} lines={21} lineLength={12} />
      </div>
    );
  }
}

export default App;
