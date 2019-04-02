import React from "react";
import { getUsers } from "../services/scoreBoard";
import moment from "moment";

import "./ScoreBoard.css";

export default class element extends React.Component {
  state = {
    users: []
  };

  async componentDidMount() {
    const data = await getUsers();
    this.setState({ users: data.allUsers });
  }

  render() {
    return (
      <div style={{ marginTop: 15 }}>
        Highscore Top 100
        <br />
        <table className="score-board">
          <tbody>
            <tr>
              <td>Name</td>
              <td>Score</td>
              <td>When</td>
            </tr>

            {this.state.users.map(u => {
              return (
                <tr
                  key={u.id}
                  className={this.props.user.id === u.id ? "you" : ""}
                >
                  <td>{u.name} </td>
                  <td>{u.score}</td>
                  <td>{moment(u.createdAt).format("YYYY-MM-DD")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
