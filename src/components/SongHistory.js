import React, {Component} from 'react';

class SongHistory extends Component {
  constructor(props){
    super(props);
    this.state = {
      displayList: false,
    }
  }

  toggleDisplay = () => {
    this.setState({
      displayList: !this.state.displayList
    })
  }

  render(){
    const {songHistory} = this.props;
    const songs = songHistory.map(song => song.song).reverse()
    return(
      <div id='song-history' onClick={this.toggleDisplay}>
        {
          this.state.displayList &&
          <div id='song-list'>
            {songs.map(song =>
              <div key={song.id} class='song-info'>
                <img src={song.art} alt={`Album Title: ${song.album}`}/>
                <p>
                  <b>Song Title: {song.title}</b><br />
                  Artist: {song.artist}
                </p>
              </div>
            )}
          </div>
        }
         <p id='recently-played-text'>Recently Played Songs</p>
      </div>
    )
  }
}

export default SongHistory;
