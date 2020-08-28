import React, {Component} from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js'
import ReleaseCard from './components/ReleaseCard.js'
import Modal from './components/Modal.js'
import InfiniteScroll from 'react-infinite-scroll-component';

const spotifyWebApi = new Spotify();

class App extends Component {
  constructor(props) {
    super(props);
    const params = this.getHashParams();

    this.state = {
        loggedIn : params.access_token ? true : false,
        artists : [], // just artists
        //artistAlbums : [], // albums grouped by artist,
        artistReleases : [],
        loadedReleases : [],
        userDataReceived : false, // used to control rendering,
        displayName: "",
        profileImage: "",
        hasMore: true,
        nowPlaying: {}
    }

    if (params.access_token && (params.state === localStorage.getItem('auth_state'))) {
        spotifyWebApi.setAccessToken(params.access_token);
        //localStorage.removeItem('auth_state');
        console.log("Authorization successful!")
    }

    this.fetchData = this.fetchData.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
      if (this.state.loggedIn) {
          spotifyWebApi.getMe().then((response) => {this.setState({displayName: response.display_name, profileImage: response.images[0].url})});

          spotifyWebApi.getFollowedArtists({limit: 50})
          .then((response) => { // waits for artists followed
              const prevResponse = response.artists.items.map((artist) => {return {name : artist.name, id : artist.id}});

              return this.getNextArtists(prevResponse, response.artists.cursors.after, response.artists.next);
          })
          .then((artists) => { // waits for artist id array
              const artistAlbums = artists.map((artist) => {
                  return spotifyWebApi.getArtistAlbums(artist.id, {limit:50, country:'US', include_groups: 'album,single'})
                  .then((albums) => {
                      return (albums.items);
                  })
              });
              return Promise.all(artistAlbums);
          })
          .then((albums) => {
              const releases = albums.flat().sort((a,b) => a.release_date < b.release_date ? 1 : -1);
              this.setState({
                  artistReleases : releases, // hack for chrome functionality
                  loadedReleases : releases.slice(0,10),
                  //artistAlbums: albums,
                  userDataReceived : true
              });
          });
      }
      this.checkInterval = setInterval(() => {this.tick()}, 1000);
  }

  getNextArtists(prevResponse, offsetId, next) {
      if (next) {
          return spotifyWebApi.getFollowedArtists({limit: 50, after: offsetId})
          .then((response) => {
              const _prevResponse = prevResponse.concat(response.artists.items.map((artist) => {return {name : artist.name, id : artist.id}}));
              return this.getNextArtists(_prevResponse, response.artists.cursors.after, response.artists.next);
          })
      } else { //no more artist pages to call
          return prevResponse;
      }
  }

  tick() {
      if (this.state.loggedIn) {
          spotifyWebApi.getMyCurrentPlayingTrack()
          .then((track) => {
              this.setState({
                  nowPlaying: track
              })
          })
      }
  }

  requestAuthorization() {
      console.log("requesting authorization");

      const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID; // client id
      const redirect_uri = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000'; // redirect uri

      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      const state = text;

      localStorage.setItem('auth_state', state);
      localStorage.getItem('auth_state'); // chrome bug, must access local storage for it to persist
      const scope = 'user-read-private user-read-email user-follow-read user-read-playback-state user-modify-playback-state';

      var url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(client_id);
      url += '&scope=' + encodeURIComponent(scope);
      url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
      url += '&state=' + encodeURIComponent(state);
      url += '&show_dialog=' + encodeURIComponent(false);

      window.location = url;
  }

  fetchData() {
      const oldLength = this.state.loadedReleases.length;
      this.setState({
          loadedReleases : this.state.loadedReleases.concat(this.state.artistReleases.slice(oldLength, oldLength + 10))
      })
  }

  getHashParams() { // provided by jmperez
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  render() {
      //const artistsFollowed = this.state.artists;
      //console.log("app rendered");

    /*const artistReleases = this.state.artistReleases;
    const releaseList = artistReleases.map((release)=> {
        return (
            <ReleaseCard key={release.id} releaseInfo={release}/>
        );
    })*/

    const loadedReleases = this.state.loadedReleases;
    const releaseList = loadedReleases.map((release)=> {
        return (
            <ReleaseCard key={release.id} releaseInfo={release}/>
        );
    })

      return (
        <div className="App">
            {this.state.loggedIn &&
                <div>
                <header className="stickyHeader">
                    <h1 className="header-brand">My Music Timeline</h1>
                    {this.state.nowPlaying.item &&
                        <div className="now-playing">
                            <div className="current-art">
                                <img src={this.state.nowPlaying.item.album.images[0].url} height="60px"></img>
                            </div>
                            <div className="current-track">
                                <div>{this.state.nowPlaying.item.name}</div>
                                <div>by {this.state.nowPlaying.item.artists[0].name}</div>
                            </div>
                        </div>
                    }
                    <div className="header-profile">
                        <div className="displayName">{this.state.displayName}</div>
                        <div className="imageCropper"><img src={this.state.profileImage} height="50px"/></div>
                    </div>
                </header>
                <div className="body">
                    {!this.state.loggedIn &&
                        <button onClick={this.requestAuthorization}>Login to Spotify</button>
                    }
                    <InfiniteScroll
                      dataLength={this.state.loadedReleases.length} //This is important field to render the next data
                      next={this.fetchData}
                      hasMore={this.state.hasMore}
                      loader={<h4>Loading...</h4>}
                      endMessage={
                        <p style={{textAlign: 'center'}}>
                          <b>Yay! You have seen it all</b>
                        </p>
                      }>
                      {releaseList}
                    </InfiniteScroll>
                    {/*releaseList*/}
                </div>
                <footer className="stickyFooter">
                    <small>&copy; 2020, Tanner Ropp</small>
                </footer>
                </div>
            }
            {!this.state.loggedIn &&
                <div style={{backgroundColor: "black", height: "100vh", position: "fixed", width: "100%"}}>
                    <div style={{
                        position: "relative",
                        top: "50%",
                        transform: "translateY(-75%)"
                        }}>
                        <h1 style={{fontSize: "80px", color: "white", textShadow: "2px 4px 1px #6EC1FF", lineHeight: "60px"}}>My Music Timeline</h1>
                        <h1>Never lose track of another release.</h1>
                        <button className="login-button" onClick={this.requestAuthorization}>Login with Spotify</button>
                    </div>
                </div>
            }
            <Modal/>
        </div>
      );
  }
}

export default App;
