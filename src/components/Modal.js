import React, {Component} from 'react';

class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }


  render() {

      return (
          <div id="modal" className="modal">
              <div className="modal-box">
                  <div className="modal-message">
                      <h2>Before using the play feature in this app, make sure you have started playing a song from within Spotify.</h2>
                      <button className="close-modal" onClick={() => {
                          var modal = document.getElementById("modal");
                          modal.style.display = "none";
                          }}>Got it!</button>
                  </div>
              </div>
          </div>
      );
  }
}

export default Modal;
