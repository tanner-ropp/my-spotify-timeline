import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Spotify from 'spotify-web-api-js'

const spotifyWebApi = new Spotify();

class App extends Component {
  constructor(props) {
    super(props);
    const params = this.getHashParams();

    this.state = {
        loggedIn : params.access_token ? true : false,
        artists : [], // just artists
        artistAlbums : [], // albums grouped by artist,
        artistReleases : [],
        userDataReceived : false, // used to control rendering,
        displayName: "",
        profileImage: ""
    }

    if (params.access_token) {
        spotifyWebApi.setAccessToken(params.access_token);
    }

  }

  componentDidMount() {
      /*if (this.state.loggedIn) {
          spotifyWebApi.getFollowedArtists({limit:50}) // WHAT IF YOU HAVE MORE THAN 50 FOLLOWED ARTISTS?
          .then((response) => { // waits for artists followed
              this.setState({
                  artists : response.artists.items
              });
              return response.artists.items.map((artist) => {return {name : artist.name, id : artist.id}});
          })
          .then((artists) => { // waits for artist id array
              const artistAlbums = artists.map((artist) => {
                  return spotifyWebApi.getArtistAlbums(artist.id, {limit:10, country:'US'});
              });
              return Promise.all(artistAlbums); // this resolves the promise for each album request
          })
          .then((albums) => {
              console.log(albums);
              this.setState({
                  artistAlbums: albums,
                  userDataReceived : true
              });
          });
      }*/
      //spotifyWebApi.play({});

      if (this.state.loggedIn) {
          spotifyWebApi.getMe().then((response) => {this.setState({displayName: response.display_name, profileImage: response.images[0].url})})

          spotifyWebApi.getFollowedArtists({limit:20}) // WHAT IF YOU HAVE MORE THAN 50 FOLLOWED ARTISTS?
          .then((response) => { // waits for artists followed
              this.setState({
                  artists : response.artists.items
              });
              return response.artists.items.map((artist) => {return {name : artist.name, id : artist.id}});
          })
          .then((artists) => { // waits for artist id array
              const artistAlbums = artists.map((artist) => {
                  return spotifyWebApi.getArtistAlbums(artist.id, {limit:10, country:'US'})
                  .then((albums) => {
                      //console.log(albums.items);
                      return (albums.items);
                  })
              });
              return Promise.all(artistAlbums);
              //return Promise.all(artistAlbums); // this resolves the promise for each album request
          })
          .then((albums) => {
              //console.log(albums.flat());

              this.setState({
                  artistReleases : albums.flat().sort((a,b) => a.release_date < b.release_date),
                  artistAlbums: albums,
                  userDataReceived : true
              });
          });
      }
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

    const artistReleases = this.state.artistReleases;
    const releaseList = artistReleases.map((release)=> {
        return (
            <div key={release.id} style={{
            border:'1px solid charcoal',
            margin: '4px',
            padding: '5px'
            }}>
                <div>{release.name}</div>
                <img src={release.images[0].url} height="200" onClick={() => spotifyWebApi.play({context_uri : release.uri})}></img>
                <div>{release.release_date}</div>
            </div>
        )
    })

      return (
        <div className="App">
            <header className="stickyHeader">
                <h1 className="header-brand">My Music Timeline</h1>
                <div className="header-profile">{this.state.displayName}<img src={this.state.profileImage} height="40px"/></div>
            </header>
            <div className="body">
                <a href="http://localhost:8888">
                    <button style={{background: '#1DB954'}}>Login to Spotify</button>
                </a>
                {releaseList}
            </div>
        </div>
      );
  }
}

export default App;
