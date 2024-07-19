// Použití globálních proměnných místo importů
const { useState, useEffect, useCallback } = React;

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDYu55EbUa20RR2OdECkTy6_85Xw8L3Krg",
  authDomain: "photo-voting-app-8d063.firebaseapp.com",
  projectId: "photo-voting-app-8d063",
  storageBucket: "photo-voting-app-8d063.appspot.com",
  messagingSenderId: "942848998122",
  appId: "1:942848998122:web:bae5f4522763fd8a437593"
};

// Inicializace Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const auth = firebase.auth();

console.log("Firebase inicializován:", firebase.apps.length > 0);

// Kontrola připojení k Firebase
firebase.database().ref('.info/connected').on('value', function(snapshot) {
  if (snapshot.val() === true) {
    console.log("Připojeno k Firebase");
  } else {
    console.log("Odpojeno od Firebase");
  }
});

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

// Komponenta pro zobrazení jednotlivé fotky
const Photo = React.memo(({ photo, onVote }) => {
  return (
    <div style={{textAlign: 'center'}}>
      <img 
        src={photo.url} 
        alt={`Foto ${photo.id}`} 
        style={{width: '300px', height: '200px', objectFit: 'cover'}} 
        onError={(e) => console.error(`Error loading image ${photo.id}:`, e)}
      />
      <br />
      <button onClick={() => onVote(photo.id)} style={{marginTop: '10px', padding: '5px 10px'}}>
        Hlasovat
      </button>
    </div>
  );
});

// Hlavní komponenta aplikace
const PhotoVotingApp = () => {
  const [photos, setPhotos] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("useEffect se spustil");
    const storedPhotos = JSON.parse(localStorage.getItem('photos')) || testPhotos;
    console.log("Načtené fotky:", storedPhotos);
    setPhotos(storedPhotos);
    setCurrentPair(selectRandomPair(storedPhotos));
    loadVotesFromFirebase();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setIsAdmin(true);
        console.log("Uživatel přihlášen:", user.email);
      } else {
        setUser(null);
        setIsAdmin(false);
        console.log("Uživatel odhlášen");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadVotesFromFirebase = () => {
    console.log("Začátek načítání hlasů z Firebase");
    database.ref('votes').once('value')
      .then((snapshot) => {
        const votesData = snapshot.val() || {};
        console.log("Načtená data z Firebase:", votesData);
        const updatedPhotos = photos.map(photo => ({
          ...photo,
          votes: votesData[photo.id] || 0
        }));
        setPhotos(updatedPhotos);
        updateRankings(updatedPhotos);
      })
      .catch((error) => {
        console.error("Chyba při načítání hlasů:", error);
        alert("Nastala chyba při načítání hlasů. Zkuste to prosím později.");
      });
  };

  const selectRandomPair = useCallback((photoList) => {
    const shuffled = [...photoList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, []);

  const handleVote = useCallback((votedPhotoId) => {
    setPhotos(prevPhotos => {
      const updatedPhotos = prevPhotos.map(photo => 
        photo.id === votedPhotoId ? { ...photo, votes: (photo.votes || 0) + 1 } : photo
      );
      updateRankings(updatedPhotos);
      setCurrentPair(selectRandomPair(updatedPhotos));
      saveVotesToFirebase(votedPhotoId);
      return updatedPhotos;
    });
  }, [selectRandomPair]);

  const saveVotesToFirebase = (votedPhotoId) => {
    console.log("Ukládání hlasu do Firebase:", votedPhotoId);
    database.ref(`votes/${votedPhotoId}`).transaction((currentVotes) => {
      return (currentVotes || 0) + 1;
    }).catch((error) => {
      console.error("Chyba při ukládání hlasu:", error);
      alert("Nastala chyba při ukládání hlasu. Zkuste to prosím znovu.");
    });
  };

  const updateRankings = (updatedPhotos) => {
    const sortedPhotos = [...updatedPhotos].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    setRankings(sortedPhotos);
    localStorage.setItem('photos', JSON.stringify(sortedPhotos));
    console.log("Aktualizovaný žebříček:", sortedPhotos);
  };

  const handleReset = () => {
    if (window.confirm('Opravdu chcete resetovat všechny hlasy?')) {
      const resetPhotos = photos.map(photo => ({ ...photo, votes: 0 }));
      setPhotos(resetPhotos);
      updateRankings(resetPhotos);
      database.ref('votes').set({})
        .catch((error) => {
          console.error("Chyba při resetování hlasů:", error);
          alert("Nastala chyba při resetování hlasů. Zkuste to prosím znovu.");
        });
    }
  };

  const handleLogin = () => {
    const email = prompt("Zadejte e-mail:");
    const password = prompt("Zadejte heslo:");

    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        console.error("Chyba při přihlašování:", error);
        alert("Nesprávné přihlašovací údaje");
      });
  };

  const handleLogout = () => {
    auth.signOut()
      .catch((error) => {
        console.error("Chyba při odhlašování:", error);
      });
  };

  console.log("Current pair:", currentPair);
  console.log("Rankings:", rankings);

  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <h1 style={{textAlign: 'center'}}>Hlasování o fotkách</h1>
      <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '20px'}}>
        {currentPair.map(photo => (
          <Photo key={photo.id} photo={photo} onVote={handleVote} />
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
      {user ? (
        <>
          <button onClick={handleLogout} style={{marginTop: '20px'}}>Odhlásit se</button>
          {isAdmin && (
            <button onClick={handleReset} style={{marginLeft: '10px', backgroundColor: 'red', color: 'white'}}>
              Resetovat hlasy
            </button>
          )}
        </>
      ) : (
        <button onClick={handleLogin} style={{marginTop: '20px'}}>Přihlásit se jako admin</button>
      )}
    </div>
  );
};

ReactDOM.render(<PhotoVotingApp />, document.getElementById('app'));