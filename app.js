// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDYu55EbUa20RR2OdECkTy6_85Xw8L3Krg",
  authDomain: "photo-voting-app-8d063.firebaseapp.com",
  projectId: "photo-voting-app-8d063",
  storageBucket: "photo-voting-app-8d063.appspot.com",
  messagingSenderId: "942848998122",
  appId: "1:942848998122:web:bae5f4522763fd8a437593"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Definice testových fotek
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
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const storedPhotos = JSON.parse(localStorage.getItem('photos')) || testPhotos;
    setPhotos(storedPhotos);
    selectRandomPair(storedPhotos);
    loadVotesFromFirebase();
  }, []);

  const loadVotesFromFirebase = () => {
    database.ref('votes').once('value', (snapshot) => {
      const votesData = snapshot.val() || {};
      const updatedPhotos = photos.map(photo => ({
        ...photo,
        votes: votesData[photo.id] || 0
      }));
      setPhotos(updatedPhotos);
      updateRankings(updatedPhotos);
    });
  };

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
    saveVotesToFirebase(votedPhotoId);
  };

  const saveVotesToFirebase = (votedPhotoId) => {
    database.ref(`votes/${votedPhotoId}`).transaction((currentVotes) => {
      return (currentVotes || 0) + 1;
    });
  };

  const updateRankings = (updatedPhotos) => {
    const sortedPhotos = [...updatedPhotos].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    setRankings(sortedPhotos);
    localStorage.setItem('photos', JSON.stringify(sortedPhotos));
  };

  const handleReset = () => {
    if (window.confirm('Opravdu chcete resetovat všechny hlasy?')) {
      const resetPhotos = photos.map(photo => ({ ...photo, votes: 0 }));
      setPhotos(resetPhotos);
      updateRankings(resetPhotos);
      database.ref('votes').set({});
    }
  };

  const toggleAdmin = () => {
    const password = prompt('Zadejte heslo pro přístup k admin funkcím:');
    if (password === 'berenika') {  // Nahraďte skutečným heslem
      setIsAdmin(!isAdmin);
    } else {
      alert('Nesprávné heslo');
    }
  };

  // Debug logs
  console.log("Current pair:", currentPair);
  console.log("All photos:", photos);

  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <h1 style={{textAlign: 'center'}}>Hlasování o fotkách</h1>
      <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '20px'}}>
        {currentPair.map(photo => (
          <div key={photo.id} style={{textAlign: 'center'}}>
            <p>Debug: Photo ID: {photo.id}, URL: {photo.url}</p>
            <img 
              src={photo.url} 
              alt={`Foto ${photo.id}`} 
              style={{width: '300px', height: '200px', objectFit: 'cover'}} 
              onError={(e) => console.error(`Error loading image ${photo.id}:`, e)}
            />
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
      <button onClick={toggleAdmin} style={{marginTop: '20px'}}>
        {isAdmin ? 'Skrýt admin funkce' : 'Zobrazit admin funkce'}
      </button>
      {isAdmin && (
        <button onClick={handleReset} style={{marginLeft: '10px', backgroundColor: 'red', color: 'white'}}>
          Resetovat hlasy
        </button>
      )}
    </div>
  );
};

ReactDOM.render(<PhotoVotingApp />, document.getElementById('app'));