import { useNavigate } from "react-router-dom";
import "./App.css";
import pokemonLogo from "./assets/pokemonLogo.svg";
import React, { useState, useEffect } from 'react';

function App() {
    const [pokemonData, setPokemonData] = useState([]);
    const [showDeleteBtn, setShowDeleteBtn] = useState(false);
    const [selectedPokemon, setSelectedPokemon] = useState([]);
    const [winner, setWinner] = useState(null);
    const [battleStarted, setBattleStarted] = useState(false);

    useEffect(() => {
        // Initial fetch when the component mounts
        fetchKantoPokemon();
    }, []);

    const fetchKantoPokemon = () => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
            .then(response => response.json())
            .then(data => {
                const promises = data.results.map(pokemon => fetchPokemonData(pokemon.url));
                Promise.all(promises).then(results => setPokemonData(results));
            });
    };

    const fetchPokemonData = (url) => {
        return fetch(url)
            .then(response => response.json());
    };

    const renderEverything = () => {
        setPokemonData([]);
        fetchKantoPokemon();
        setShowDeleteBtn(true);
    };

    const deleteEverything = () => {
        setPokemonData([]);
        setShowDeleteBtn(false);
        setSelectedPokemon([]);
        setWinner(null);
        setBattleStarted(false);
    };

    const selectPokemonForBattle = (pokeData) => {
        if (selectedPokemon.length < 2 && !selectedPokemon.includes(pokeData)) {
            setSelectedPokemon([...selectedPokemon, pokeData]);
        } else if (selectedPokemon.includes(pokeData)) {
            setSelectedPokemon(selectedPokemon.filter(pokemon => pokemon.id !== pokeData.id));
        }
    };

    const renderPokemon = (pokeData) => {
        const isSelected = selectedPokemon.includes(pokeData);
        return (
            <div 
                key={pokeData.id} 
                className={`ui card ${isSelected ? 'selected' : ''}`} 
                onClick={() => selectPokemonForBattle(pokeData)}
            >
                <div className="image small-image">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeData.id}.png`} alt={pokeData.name} />
                </div>
                <h4>{pokeData.name}</h4>
                <p>#{pokeData.id}</p>
                <ul>
                    {pokeData.types.map(type => (
                        <li key={type.type.name}>{type.type.name}</li>
                    ))}
                </ul>
            </div>
        );
    };

    const startBattle = () => {
        if (selectedPokemon.length === 2) {
            const winner = determineWinner(selectedPokemon[0], selectedPokemon[1]);
            setWinner(winner);
            setBattleStarted(true);
        }
    };

    const determineWinner = (pokemon1, pokemon2) => {
        const stat1 = pokemon1.stats.reduce((total, stat) => total + stat.base_stat, 0);
        const stat2 = pokemon2.stats.reduce((total, stat) => total + stat.base_stat, 0);
        return stat1 > stat2 ? pokemon1 : pokemon2;
    };

    return (
        <div>
            <button id="generate-pokemon" className="ui secondary button" onClick={renderEverything}>
                Generate Pokemon
            </button>
            {showDeleteBtn && (
                <button id="delete-btn" className="ui secondary button" onClick={deleteEverything}>
                    Delete Everything
                </button>
            )}
            <div id="poke-container" className="vertical">
                {!battleStarted && pokemonData.map(pokeData => renderPokemon(pokeData))}
                {battleStarted && (
                    <div className="battle-container">
                        {selectedPokemon.map(pokeData => renderPokemon(pokeData))}
                        {winner && (
                            <div className="winner">
                                <h3>Winner: {winner.name}</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {selectedPokemon.length === 2 && !battleStarted && (
                <div className="battle-container">
                    <h2>Battle between {selectedPokemon[0].name} and {selectedPokemon[1].name}</h2>
                    <button className="ui primary button" onClick={startBattle}>
                        go Battle
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
