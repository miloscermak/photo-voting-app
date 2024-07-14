console.log("App.js se načetl");

const testPhotos = [
  { id: 1, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto1.png' },
  { id: 2, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto2.png' },
  { id: 3, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto3.png' },
  { id: 4, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto4.png' },
  { id: 5, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto5.png' },
  { id: 6, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto6.png' },
  { id: 7, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto7.png' },
  { id: 8, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto8.png' },
  { id: 9, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto9.png' },
  { id: 10, url: 'https://cdn.jsdelivr.net/gh/miloscermak/photo-voting-test-images@main/foto10.png' },
];

const PhotoVotingApp = () => {
  const [photos, setPhotos] = React.useState([]);
  const [currentPair, setCurrentPair] = React.useState([]);
  const [rankings, setRankings] = React.useState([]);

  React.useEffect(() => {
    setPhotos(testPhotos);
    selectRandomPair(testPhotos);
  }, []);

  const selectRandomPair = (photoList) => {
    const shuffled = [...photoList].sort(() => 0.5 - Math.random());
    setCurrentPair(shuffled.slice(0, 2));
  };

  const handleVote = (votedPhotoId) => {
    const updatedPhotos = photos.map(photo => 
      photo.id === votedPhotoId ? { ...photo, votes: (photo.votes || 0) + 1 } : photo
    );
    setPhotos(updatedPhotos);
    updateRankings(updatedPhotos);
    selectRandomPair(updatedPhotos);
  };

  const updateRankings = (updatedPhotos) => {
    const sortedPhotos = [...updatedPhotos].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    setRankings(sortedPhotos);
  };

  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <h1 style={{textAlign: 'center'}}>Hlasování o fotkách</h1>
      <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '20px'}}>
        {currentPair.map(photo => (
          <div key={photo.id} style={{textAlign: 'center'}}>
            <img src={photo.url} alt={`Foto ${photo.id}`} style={{width: '300px', height: '200px', objectFit: 'cover'}} />
            <br />
            <button onClick={() => handleVote(photo.id)} style={{marginTop: '10px', padding: '5px 10px'}}>
              Hlasovat
            </button>
          </div>
        ))}
      </div>
      <h2 style={{textAlign: 'center'}}>Aktuální žebříček</h2>
      <ol>
        {rankings.map(photo => (
          <li key={photo.id} style={{marginBottom: '5px'}}>
            Foto {photo.id} - {photo.votes || 0} hlasů
          </li>
        ))}
      </ol>
    </div>
  );
};

ReactDOM.render(<PhotoVotingApp />, document.getElementById('app'));