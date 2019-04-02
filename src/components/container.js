import React from "react";
import "./container.css";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import uuid from "uuid/v4";
import Tile from "./tile.js";
import { setRecord } from "../services/scoreBoard";
import ScoreBoard from "./ScoreBoard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

const merge = function(matrix, y, x, projectile, rotation) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const index = rotate(j, i, rotation);
      if (projectile[index] === 1) {
        const newY = y + i;
        const newX = x + j;
        if (newX > -1 && newY > -1) {
          matrix[newY][newX] = 1;
        }
      }
    }
  }

  return matrix;
};

const projectiles = [
  // stick
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  // square
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],

  [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],

  [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],

  [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],

  [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
];

const detectCollision = function(matrix, x, y, projectile, rotation) {
  if (x > matrix[0].length - 1 || y > matrix.length - 1) {
    return false;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const index = rotate(j, i, rotation);
      if (
        y + i > -1 &&
        x + j > -1 &&
        projectile[index] === 1 &&
        matrix[y + i][x + j] !== 0
      ) {
        return false;
      }
    }
  }
  return true;
};

const rotate = (x, y, r) => {
  if (r === 0) return y * 4 + x;
  if (r === 1) return 12 + y - x * 4;
  if (r === 2) return 15 - y * 4 - x;
  if (r === 3) return 3 - y + x * 4;
  return 0;
};

const score = numberOfLines => {
  switch (numberOfLines) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 800;
    case 4:
      return 1200;
    default:
      return 0;
  }
};

const nextRotation = rotation => {
  switch (rotation) {
    case 0:
      return 1;
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 0;
    default:
      return 0;
  }
};

const START_POSITION_X = 4;
const START_POSITION_Y = -2;

class App extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    const matrix = [];
    for (let i = 0; i < props.lines; i++) {
      const inner = [];
      if (i === props.lines - 1) {
        for (let j = 0; j < props.lineLength; j++) {
          inner.push(-1);
        }
      } else {
        for (let j = 0; j < props.lineLength; j++) {
          if (j === 0 || j === props.lineLength - 1) {
            inner.push(-1);
          } else {
            inner.push(0);
          }
        }
      }
      matrix.push(inner);
    }

    const user = cookies.get("user") || {
      id: uuid(),
      name: "Anonymous"
    };

    console.log(user);

    this.state = {
      user,
      score: 0,
      totalProjectiles: 1,
      isGameInProgress: true,
      isGameOver: false,
      matrix,
      x: START_POSITION_X,
      y: START_POSITION_Y,
      rotation: 0,
      projectile: this.nextProjectile(),
      nextProjectile: this.nextProjectile(),
      speed: 1,
      shouldUpdateSpeed: false,
      showScore: false
    };
  }

  nextProjectile = () => {
    return Object.assign(
      projectiles[Math.floor(Math.random() * projectiles.length)],
      []
    );
  };

  gameloop = () => {
    if (!this.state.isGameInProgress) {
      return;
    }

    if (
      this.state.totalProjectiles % 10 === 0 &&
      this.state.shouldUpdateSpeed
    ) {
      this.setState({
        ...this.state,
        speed: this.state.speed + 1,
        shouldUpdateSpeed: false
      });
      clearInterval(this.interval);
      this.startGameLoop();
    }

    if (
      detectCollision(
        this.state.matrix,
        this.state.x,
        this.state.y + 1,
        this.state.projectile,
        this.state.rotation
      )
    ) {
      this.setState({
        ...this.state,
        y: this.state.y + 1
      });
    } else {
      if (
        !detectCollision(
          this.state.matrix,
          START_POSITION_X,
          START_POSITION_Y,
          this.state.nextProjectile,
          this.state.rotation
        )
      ) {
        //gameover
        clearInterval(this.interval);
        document.removeEventListener("keydown", this.listener, false);

        this.setState({
          ...this.state,
          isGameOver: true
        });
      } else {
        //spawn new projectile
        this.setState({
          ...this.state,
          score: this.state.score + 25,
          rotation: 0,
          x: START_POSITION_X,
          y: START_POSITION_Y,
          totalProjectiles: this.state.totalProjectiles + 1,
          matrix: merge(
            this.state.matrix,
            this.state.y,
            this.state.x,
            this.state.projectile,
            this.state.rotation
          ),
          projectile: this.state.nextProjectile,
          nextProjectile: this.nextProjectile()
        });

        //clear lines
        const matrix = Object.assign(this.state.matrix, {});
        const linesToClear = [];
        for (let i = 0; i < matrix.length; i++) {
          const line = matrix[i];
          let clear = true;
          for (let j = 1; j < line.length - 1; j++) {
            const element = line[j];
            if (element < 1) {
              clear = false;
            }
          }

          if (clear) {
            linesToClear.push(i);
          }
        }

        if (linesToClear.length > 0) {
          for (let i = 0; i < linesToClear.length; i++) {
            const index = linesToClear[i];
            matrix[index] = [-1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, -1];
          }
          this.setState({
            ...this.state,
            matrix,
            score: this.state.score + score(linesToClear.length),
            shouldUpdateSpeed: true,
            isGameInProgress: false
          });

          setTimeout(() => {
            console.log("linesToClear: ", linesToClear);
            if (linesToClear.length > 0) {
              this.setState({
                ...this.state
                // isGameInProgress: false
              });
              for (let i = 0; i < linesToClear.length; i++) {
                for (let index = linesToClear[i]; index > 0; index--) {
                  matrix[index] = matrix[index - 1];
                }
                const temp = [];
                for (let i = 0; i < this.props.lineLength; i++) {
                  if (i === 0 || i === this.props.lineLength - 1) {
                    temp.push(-1);
                  } else {
                    temp.push(0);
                  }
                }
                matrix[0] = temp;
              }
            }
            this.setState({
              ...this.state,
              matrix,
              score: this.state.score + score(linesToClear.length),
              shouldUpdateSpeed: true,
              isGameInProgress: true
            });
          }, 100);
        }
      }
    }
  };

  changeName = event => {
    const { cookies } = this.props;

    const user = this.state.user;
    user.name = event.target.value;
    console.log(user);
    cookies.set("user", JSON.stringify(user), { path: "/" });
    this.setState({ ...this.state, user });
  };

  saveScore = async () => {
    const { cookies } = this.props;
    const { name } = this.state.user;
    const score = this.state.score;
    const user = await setRecord(name, score);
    console.log(user);
    delete user.score;
    cookies.set("user", JSON.stringify(user), { path: "/" });
    this.setState({ ...this.state, user, showScore: true });
  };

  keyDown = event => {
    if (event.keyCode === 80) {
      //pause
      this.setState({
        ...this.state,
        isGameInProgress: !this.state.isGameInProgress
      });
    }

    if (event.keyCode === 37) {
      if (
        detectCollision(
          this.state.matrix,
          this.state.x - 1,
          this.state.y,
          this.state.projectile,
          this.state.rotation
        )
      )
        this.setState({
          ...this.state,
          x: this.state.x - 1
        });
    }

    if (event.keyCode === 39) {
      if (
        detectCollision(
          this.state.matrix,
          this.state.x + 1,
          this.state.y,
          this.state.projectile,
          this.state.rotation
        )
      )
        this.setState({
          ...this.state,
          x: this.state.x + 1
        });
    }
    if (event.keyCode === 32) {
      if (
        detectCollision(
          this.state.matrix,
          this.state.x,
          this.state.y,
          this.state.projectile,
          nextRotation(this.state.rotation)
        )
      ) {
        this.setState({
          ...this.state,
          rotation: nextRotation(this.state.rotation)
        });
      } else if (
        detectCollision(
          this.state.matrix,
          this.state.x + 1,
          this.state.y,
          this.state.projectile,
          nextRotation(this.state.rotation)
        )
      ) {
        this.setState({
          ...this.state,
          x: this.state.x + 1,
          rotation: nextRotation(this.state.rotation)
        });
      } else if (
        detectCollision(
          this.state.matrix,
          this.state.x - 1,
          this.state.y,
          this.state.projectile,
          nextRotation(this.state.rotation)
        )
      ) {
        this.setState({
          ...this.state,
          x: this.state.x - 1,
          rotation: nextRotation(this.state.rotation)
        });
      }
    }

    if (event.keyCode === 40) {
      //down

      const matrix = this.state.matrix;
      const x = this.state.x;
      let y = this.state.y + 1;
      while (
        detectCollision(
          matrix,
          x,
          y,
          this.state.projectile,
          this.state.rotation
        )
      ) {
        y += 1;
        console.log("while called", y);
      }
      this.setState({
        ...this.state,
        y: y - 1
      });
    }
  };

  startGameLoop = () => {
    this.interval = setInterval(
      () => this.gameloop(),
      900 - (1 - 1 / this.state.speed) * 800
    );
  };

  componentDidMount() {
    this.listener = document.addEventListener("keydown", this.keyDown, false);
    this.startGameLoop();
  }

  render() {
    const tileSize = this.props.tileSize;
    const width = this.props.lineLength * tileSize;
    const height = this.props.lines * tileSize;

    const m = JSON.parse(JSON.stringify(this.state.matrix));
    const matrix = merge(
      m,
      this.state.y,
      this.state.x,
      this.state.projectile,
      this.state.rotation
    );
    if (this.state.showScore)
      return (
        <div style={{ marginTop: 10 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ ...this.state, showScore: false })}
          >
            Hide score
          </Button>
          <ScoreBoard user={this.state.user} />
        </div>
      );

    if (this.state.isGameOver) {
      return (
        <div style={{ marginTop: 10, fontSize: 25 }}>
          <div>
            <h3>Game over!</h3>
          </div>
          <div>
            Your name:
            <input
              defaultValue={this.state.user.name}
              onChange={this.changeName}
              placeholder="Enter your name"
              style={{
                textAlign: "center",
                fontSize: 20,
                border: 0,
                borderBottom: "1px solid",
                margin: 20
              }}
            />
          </div>

          <div>Your score: {this.state.score}</div>
          <div style={{ marginTop: 15 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.saveScore}
            >
              SAVE MY SCORE
            </Button>
          </div>
          <div style={{ marginTop: 15 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ ...this.state, showScore: true })}
            >
              SHOW HIGHSCORE
            </Button>
          </div>
          <div style={{ marginTop: 15 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => window.location.reload()}
              title="Restart"
            >
              Restart
            </Button>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: 15,
            alignItems: "start",
            justifyContent: "center"
          }}
        >
          <div className="tetris">
            <div
              className="container"
              style={{ height, width, minWidth: width }}
              ref={this.container}
            >
              {matrix.map((inner, i) => {
                return inner.map((val, j) => {
                  const top = j * tileSize;

                  if (val > 0) {
                    return (
                      <Tile
                        key={i + j}
                        top={top}
                        value={val}
                        tileSize={tileSize}
                        active={true}
                      />
                    );
                  } else if (val === -1) {
                    return (
                      <Tile
                        value={val}
                        key={i + j}
                        top={top}
                        tileSize={tileSize}
                        border
                      />
                    );
                  } else {
                    return (
                      <Tile
                        value={val}
                        key={i + j}
                        top={top}
                        tileSize={tileSize}
                      />
                    );
                  }
                });
              })}
            </div>
          </div>

          <div style={{ margin: 10 }}>
            <div>Score: {this.state.score} </div>
            {!this.state.isGameInProgress && "Paused "}
            <div>Speed: {this.state.speed} </div>
            <br />
            Next:
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: 4 * tileSize + "px",
                alignItems: "center",
                left: 0,
                right: 0,
                margin: "auto"
              }}
            >
              {this.state.nextProjectile.map((val, index) => {
                if (val === 0) {
                  return (
                    <Tile
                      value={val}
                      key={index}
                      tileSize={tileSize}
                      backgroundColor={"#fff"}
                    />
                  );
                } else {
                  return (
                    <Tile
                      key={index}
                      value={val}
                      tileSize={tileSize}
                      active={true}
                    />
                  );
                }
              })}
            </div>
          </div>
        </div>
        <div className="controls">
          <div className="options">
            <Fab
              variant="contained"
              color="primary"
              onClick={() => this.keyDown({ keyCode: 80 })}
            >
              <FontAwesomeIcon icon="pause" />
            </Fab>
          </div>
          <div className="piece">
            <div className="position">
              <div className="x-scale">
                <Fab
                  variant="contained"
                  color="primary"
                  style={{ minWidth: tileSize * 4, minHeight: tileSize * 4 }}
                  onClick={() => this.keyDown({ keyCode: 37 })}
                >
                  <FontAwesomeIcon icon="chevron-left" />
                </Fab>
                <Fab
                  variant="contained"
                  color="primary"
                  style={{ minWidth: tileSize * 4, minHeight: tileSize * 4 }}
                  onClick={() => this.keyDown({ keyCode: 39 })}
                >
                  <FontAwesomeIcon icon="chevron-right" />
                </Fab>
              </div>
              <div className="y-scale">
                <Fab
                  variant="contained"
                  color="primary"
                  style={{ minWidth: tileSize * 4, minHeight: tileSize * 4 }}
                  onClick={() => this.keyDown({ keyCode: 40 })}
                >
                  <FontAwesomeIcon icon="chevron-down" />
                </Fab>
              </div>
            </div>
            <div className="change">
              <Fab
                variant="contained"
                color="primary"
                style={{ minWidth: tileSize * 6, minHeight: tileSize * 6 }}
                onClick={() => this.keyDown({ keyCode: 32 })}
              >
                <FontAwesomeIcon icon="sync-alt" />
              </Fab>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withCookies(App);
