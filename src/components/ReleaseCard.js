import React, {Component} from 'react';
import Spotify from 'spotify-web-api-js'


const spotifyWebApi = new Spotify();
const calendar = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const today = new Date();

class ReleaseCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
        tracks : []
    }
  }

  componentDidMount() {
      const release = this.props.releaseInfo;
      spotifyWebApi.getAlbum(release.id)
      .then((fullRelease) => {
          this.setState({
              tracks : fullRelease.tracks.items
          })
      });
  }

  render() {
    const release = this.props.releaseInfo;
    const releaseDate = new Date(release.release_date);

    var displayedDate = '';
    if (releaseDate.getFullYear() === today.getFullYear()) {
        displayedDate = displayedDate.concat(calendar[releaseDate.getMonth()]);
        displayedDate = displayedDate.concat(' ' + releaseDate.getDate() + ', ');
    }
    displayedDate = displayedDate.concat(releaseDate.getFullYear());

    const trackList = this.state.tracks.map((track) => {
        return (
            <div key={track.id} className="track-playbar">
                <div style={{display: "inline-block", paddingTop: "8px"}}>{track.track_number + ' - ' + track.name}</div>
                <button className="play-button" onClick={() => spotifyWebApi.play({context_uri : release.uri, offset : {"uri" : track.uri}})}>
                    <div className="play-symbol"></div>
                </button>
            </div>
        );
    })

      return (
          <div key={release.id} className="release-card">
              <div><img src={release.images[0].url} height="200" onClick={() => spotifyWebApi.play({context_uri : release.uri})}></img></div>
              <div className="release-card-body">
                  <div>{displayedDate}</div>
                  <h2>{release.name}</h2>
                  <h3>by {release.artists[0].name}</h3>
              </div>
              <div className="release-tracklist">{trackList}</div>
          </div>
      );
  }
}

export default ReleaseCard;
