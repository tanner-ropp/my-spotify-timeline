import React, { Component, useEffect, useState } from "react";
import Spotify from "spotify-web-api-js";

const spotifyWebApi = new Spotify();
const calendar = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const today = new Date();

export const ReleaseCard = ({ releaseInfo }) => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    spotifyWebApi.getAlbum(releaseInfo.id).then((fullRelease) => {
      setTracks(fullRelease.tracks.items);
    });
  }, []);

  const releaseDate = new Date(releaseInfo.release_date);

  var displayedDate = "";
  if (releaseDate.getFullYear() === today.getFullYear()) {
    displayedDate = displayedDate.concat(calendar[releaseDate.getMonth()]);
    displayedDate = displayedDate.concat(" " + releaseDate.getDate() + ", ");
  }
  displayedDate = displayedDate.concat(releaseDate.getFullYear());

  const trackList = () =>
    tracks.map((track) => {
      return (
        <div key={track.id} className="track-playbar">
          <div style={{ display: "inline-block", paddingTop: "8px" }}>
            {track.track_number + " - " + track.name}
          </div>
          <button
            className="play-button"
            onClick={() => {
              spotifyWebApi
                .play({
                  context_uri: releaseInfo.uri,
                  offset: { uri: track.uri },
                })
                .catch((err) => {
                  if (err.status === 404) {
                    console.log("OOPS");
                    var modal = document.getElementById("modal");
                    modal.style.display = "block";
                  }

                  document.getElementById(track.id).play();
                });
            }}
          >
            <audio id={track.id} src={track.preview_url}></audio>
            <div className="play-symbol"></div>
          </button>
        </div>
      );
    });

  return (
    <div key={releaseInfo.id} className="release-card">
      <div>
        <img
          src={releaseInfo.images[0].url}
          height="200"
          onClick={() => spotifyWebApi.play({ context_uri: releaseInfo.uri })}
        ></img>
      </div>
      <div className="release-card-body">
        <div>{displayedDate}</div>
        <h2>{releaseInfo.name}</h2>
        <h3>by {releaseInfo.artists[0].name}</h3>
      </div>
      <div className="release-tracklist">{trackList()}</div>
    </div>
  );
};
