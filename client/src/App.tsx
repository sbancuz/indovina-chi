import { useState } from 'react';
import './App.css';
import io from 'socket.io-client';

const sock = io('http://localhost:3001');

interface Player {
  nick: string;
  identity: string;
}

function App() {
  const [username, setUsername] = useState('');
  const [identity, setidentity] = useState('');
  const [selectedNick, setSelectedNick] = useState('');
  const [state, setState] = useState<'login' | 'chooseword' | 'showlist'>('login')
  const [players, setPlayers] = useState<Player[]>([])

  const login = () => {
    if (username === '')
      return;

    sock.emit('login', username);
  };
  
  const chooseWord = () => {
    console.log(identity, selectedNick)
    if (identity === '' || selectedNick === '')
      return;

    sock.emit('setIdentity', { nick: selectedNick, identity: identity });

    setState('showlist');
  };

  const newGame = () => {
    sock.emit('newGame');

    setState('login');
  };

  sock.on('login_successful', () => {
    setState('chooseword');
  });

  sock.on('login_falied', (msg) => {
     alert(msg);
  });

  sock.on('update_list', (newList) => {
    setPlayers(newList);

    console.log(players);
    if (selectedNick === '' && newList.length > 0)
      setSelectedNick(newList[0].nick);

    console.log(selectedNick)
  }); 
  
  const getByState = () => {
    switch (state) {
      case 'login':
        return ( 
          <div>
            <h3>Join the room </h3>
            <input type='text' placeholder='Nick' onChange={(event) => {setUsername(event.target.value)}} />
            <button onClick={login}> Join </button>
          </div>
        ); 
      case 'chooseword':
        return ( 
          <div>
            <h3>Give identity to a player</h3>
            <h2>You are: {username}</h2>
            <h1>Select a player</h1>
            <select onChange={(event) => {setSelectedNick(event.target.value)}}>
              {players.filter(player => player.identity === '').map((player, index) => (
              <option key={index} value={player.nick}>
                {player.nick}
              </option>
              ))}
            </select>
            <input type='text' placeholder='Word' onChange={(event) => {setidentity(event.target.value)}} />
            <button onClick={chooseWord}> Set word</button>
          </div>
          ); 
        case 'showlist': return ( 
          <div>
            <h3>The list</h3>
            <h2>You are: {username}</h2>
            {players.map(player => (
              <h2>{player.nick}:{player.identity}</h2>
            ))}
            <button onClick={newGame}>New game</button>
          </div>
        ); 
    }
  };

  return (
    <div className="App">
      { getByState() }
    </div>
  );
}

export default App;
