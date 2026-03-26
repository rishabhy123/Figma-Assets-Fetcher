import React from 'react';
import FigmaViewer from './components/FigmaViewer/FigmaViewer';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Figma Assets Fetcher</h1>
      </header>
      <main>
        <FigmaViewer />
      </main>
    </div>
  );
}

export default App;
