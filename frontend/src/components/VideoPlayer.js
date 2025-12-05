import React from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

const VideoPlayer = ({ url }) => {
  return (
    <div className="video-player-container">
      <ReactPlayer
        url={`http://localhost:5000${url}`}
        controls
        width="100%"
        height="100%"
        className="react-player"
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
