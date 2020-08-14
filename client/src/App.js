import React, {Component} from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js'
import ReleaseCard from './components/ReleaseCard.js'
import InfiniteScroll from 'react-infinite-scroll-component';

const spotifyWebApi = new Spotify();
//const calendar = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//const today = new Date();

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
        hasMore: true
    }

    if (params.access_token) {
        spotifyWebApi.setAccessToken(params.access_token);
        console.log("hmm")
    }

    console.log("constructor");
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
      if (this.state.loggedIn) {
          console.log("logged in did mount")
          spotifyWebApi.getMe().then((response) => {this.setState({displayName: response.display_name, profileImage: response.images[0].url})})

          spotifyWebApi.getFollowedArtists({limit:50}) // WHAT IF YOU HAVE MORE THAN 50 FOLLOWED ARTISTS?
          .then((response) => { // waits for artists followed
              /*this.setState({
                  artists : response.artists.items
              });*/
              return response.artists.items.map((artist) => {return {name : artist.name, id : artist.id}});
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
  }

  fetchData() {
      const oldLength = this.state.loadedReleases.length;
      this.setState({
          loadedReleases : this.state.loadedReleases.concat(this.state.artistReleases.slice(oldLength, oldLength + 10))
      })
      console.log("FETCH");
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
      console.log("app rendered");

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
            <header className="stickyHeader">
                <h1 className="header-brand">My Music Timeline</h1>
                <div>INSERT NOW PLAYING SECTION</div>
                <div className="header-profile">
                    <div className="displayName">{this.state.displayName}</div>
                    <div className="imageCropper"><img src={this.state.profileImage} height="50px"/></div>
                </div>
            </header>
            <div className="body">
                {!this.state.loggedIn &&
                    <a href="http://localhost:8888">
                        <button style={{background: '#1DB954'}}>Login to Spotify</button>
                    </a>
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
        </div>
      );
  }
}

export default App;
