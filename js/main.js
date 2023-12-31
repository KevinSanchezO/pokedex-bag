/* Backpack containter */
let pokemonsInBackpack = [];
let backpackWeight = 0.0;

const weightLimit = 25.0;
const pokemonLimit = 6;

const percentOperation = 0.9;

/* Pokedex content */
const pokemonContainer = document.querySelector('.pokedex-content');
const backpackContainer = document.querySelector('.backpack-content')
const backToTopButton = document.querySelector('#back-to-top');
const creatorTitle = document.querySelector('.creator');

const searchButton = document.querySelector('#searchButton');
searchButton.addEventListener('click', searchPokemon);

const randomButton = document.querySelector('#randomButton');
randomButton.addEventListener('click', obtainRandomId);

const actualWeightBackpack = document.querySelector('.operation')
actualWeightBackpack.textContent = `Backpack weight: ${backpackWeight}`;



let offset = 20;
let isGenerationSelected = false; // Track if a generation is selected
fetchPokemons(20);

/* When the button at the bottom is pressed it scrolls to the top smoothly */
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

creatorTitle.addEventListener('click', () => {
  window.location.assign("https://github.com/KevinSanchezO");
});

/*
It fetches resources from the pokeapi of a specific pokemon.
*/
function fetchPokemon(id) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
        .then((res) =>res.json());
}

/* When scrolled to the bottom of the page more pokemons load */
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (!isGenerationSelected && scrollTop + clientHeight >= scrollHeight - 5) {
        fetchPokemons(20, offset);
        offset += 20;
    }
});

/*
n is the number of pokemons to fetch and offset where to start fetching
'em all. The list pokemons holds the list of promises for each pokemon
obtain in fetchPokemon.

Promise.all is used to resolve all the promises concurrently. 
This ensures that all of the Pokemons' data has been fetched 
before continuing.

the .then() sorts the promises to be shown by id order and creates
a card for every pokemon
*/
function fetchPokemons(n, offset = 0) {
    const startId = offset + 1;
    const endId = offset + n;
    const pokemons = [];
  
    for (let i = startId; i <= endId; i++) {
      pokemons.push(fetchPokemon(i));
    }
  
    Promise.all(pokemons)
      .then((data) => {
        data.sort((a, b) => a.id - b.id);
        data.forEach((pokemon) => createPokemonCard(pokemon));
      });
  }


async function lenPokemons() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon');
    const data = await response.json();
    return data.count;
}

/* Obtains a random pokemon ID, clears the container of the cards and shows the
pokemon that has that random ID */
async function obtainRandomId() {
  const count = await lenPokemons();
  id = Math.floor((Math.random() * count) + 1) - 273;

  pokemonContainer.innerHTML = '';
  fetchPokemon(id)
    .then((pokemon) => {
      createPokemonCard(pokemon);
    })
}

/* Checks if the pokemon can be added to the backpack, the sum of the weight of previous
pokemons inside backpack cannot surpass 25.0 and there cannot be more than 6 pokemons */
function checkSaveBackpack(pokemon) {
  const weightValue = parseFloat((pokemon.weight / 10).toFixed(1));
  const pokeballWeight = parseFloat((weightValue - (weightValue * percentOperation)).toFixed(1));

  if (backpackWeight + pokeballWeight <= weightLimit && pokemonsInBackpack.length < pokemonLimit) {
    
    // creates a pokemon object to only use the desired data
    pokemonObj = {
      id: pokemonsInBackpack.length,
      sprite: pokemon.sprites.front_default,
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      types: pokemon.types,
      weight: pokeballWeight
    };

    pokemonsInBackpack.push(pokemonObj)

    createPokemonBackpackCard(pokemonObj);
  } else {
    alert('No more pokemons can be added to the backpack.');
  }
}

/* It deletes the cards inside the backpack when they are clicked, it's called by the event listener */
function deleteCard(pokemon) {
  const newArray = pokemonsInBackpack.filter(item => item !== pokemon);
  pokemonsInBackpack = newArray;

  backpackContainer.innerHTML = '';
  backpackWeight = 0.0;

  if (pokemonsInBackpack.length == 0) {
    actualWeightBackpack.textContent = `Backpack weight: ${backpackWeight}`;
  }

  pokemonsInBackpack.forEach((pokemon) => {
    createPokemonBackpackCard(pokemon);
  });
}

/* Creates the cards inside the backpack */
function createPokemonBackpackCard(pokemon) {
  //container of the elements inside the card
  const card = document.createElement('div');
  card.classList.add('pokemon-backpack-card');
  card.style.backgroundColor = colors[pokemon.types[0].type.name];

  /* When the card is clicked it deletes it from the backpack */
  card.addEventListener('click', () => {
    const clickedPokemon = pokemon;
    deleteCard(clickedPokemon);
  });

  // container of the image of the pokemon
  const spriteContainter = document.createElement('div');
  spriteContainter.classList.add('image-backpack-container');
  const sprite = document.createElement('img');
  sprite.src = pokemon.sprite;
  spriteContainter.appendChild(sprite);

  // container of the name
  const name = document.createElement('h3');
  name.classList.add('info-pokemon');
  name.textContent = pokemon.name;

  // container of the weight inside the pokeball
  const weight = document.createElement('p');
  weight.textContent = `Weight: ${pokemon.weight} kg`;
  weight.classList.add('pokeball-weight');

  // container of both name and weight to place them easily
  const cardContent = document.createElement('div');
  cardContent.classList.add('card-content');
  cardContent.appendChild(name);
  cardContent.appendChild(weight);

  card.appendChild(spriteContainter);
  card.appendChild(cardContent);

  backpackContainer.appendChild(card);

  backpackWeight = parseFloat((backpackWeight + pokemon.weight).toFixed(1));
  actualWeightBackpack.textContent = `Backpack weight: ${backpackWeight}`;
}

function createPokemonCard(pokemon) {
    //Container of all the elements of the pokemon, can be seen as a card
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.style.backgroundColor = colors[pokemon.types[0].type.name];

    /* When the card is pressed the pokemon is saved inside the backpack */
    card.addEventListener('click', () => {
      const clickedPokemon = pokemon;
      checkSaveBackpack(clickedPokemon);
    });
    
    //Container of the image sprite of the pokemon
    const spriteContainter = document.createElement('div');
    spriteContainter.classList.add('image-container')
    //The image itself
    const sprite = document.createElement('img');
    sprite.src = pokemon.sprites.front_default;

    //adds the image into the container
    spriteContainter.appendChild(sprite);

    //Identifier of the pokemon
    const number = document.createElement('p');
    number.textContent = `#${pokemon.id.toString().padStart(3,0)}`;

    //name of the pokemon
    const name = document.createElement('h3');
    name.classList.add('name-pokemon')
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    //types of the pokemon
    const types = document.createElement('div');
    types.classList.add('pokemon-types');
    pokemon.types.forEach(type => {
        const typeElement = document.createElement('p');
        typeElement.textContent = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);
        typeElement.classList.add(`type-${type.type.name}`);
        types.appendChild(typeElement);
    });

    // Weight of the pokemon
    const weight = document.createElement('p');
    
    weight.textContent = `Weight: ${(pokemon.weight / 10).toFixed(1)} kg`;
    weight.classList.add('pokemon-weight');

    // Weight of pokemon inside a pokeball
    const weightValue = parseFloat((pokemon.weight / 10).toFixed(1));
    const pokeballWeight = parseFloat((weightValue - (weightValue * percentOperation)).toFixed(1));

    const weightPokeball = document.createElement('p');
    weightPokeball.textContent = `Pokeball weight: ${pokeballWeight} kg`;
    weightPokeball.classList.add('pokeball-weight')

    card.appendChild(spriteContainter)
    card.appendChild(number)
    card.appendChild(name)
    card.appendChild(types);
    card.appendChild(weight);
    card.appendChild(weightPokeball);

    pokemonContainer.appendChild(card);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchIDPokemon');
  
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('search-input').value;
      searchPokemon(searchInput);
    });
});

//card colors depending on the type
const colors = {
    normal: '#fff0d4',
    fire: '#FFA05D',
    water: '#78abff',
    grass: '#7bed8e',
    fighting: '#ff7575',
    poison: '#c97dc7',
    electric: '#f7e96f',
    ground: '#966859',
	  rock: '#9c9c9c',
    psychic: '#fcacc4',
    ice: '#acfcf4',
    bug: '#abf5d4',
    ghost: '#b473ff',
    steel: '#8a8a8a',
    dragon: '#ff7452',
    dark: '#7475a8',
    fairy: '#ff9cf8',
    flying: '#e9ffbf'
}

/* Obtains the value of the input section to search the pokemon by id, if blank it shows 'em all */
function searchPokemon() {
    const input = document.querySelector('#search-input');
    isGenerationSelected = false;

    if (input.value === '') {
        pokemonContainer.innerHTML = '';
        offset = 20
        fetchPokemons(20);
    } else {
        searchShowPokemon(input)
    }

    input.value = '';
}

/*
Tries to transform the input value into an integer to be used into
the fetch, the input value must be integer, over and under 1008
if this occurs the pokemon is fetch and the card is created 
*/
async function searchShowPokemon(input) {
    const id = parseInt(input.value);
    const count = await lenPokemons();

    if (!isNaN(id) && id > 0 && id <= count - 273) {
        pokemonContainer.innerHTML = '';
        fetchPokemon(id)
            .then((pokemon) => {
                createPokemonCard(pokemon);
            })
    } else {
        alert('Please enter a valid Pokemon ID.');
    }
}

/* It checks for what button was pressed and recieves the total amount of pokemons for
the gen selected */
const genButtons = document.querySelectorAll('.gen-button');
genButtons.forEach(button => {
  button.addEventListener('click', () => {
    const gen = parseInt(button.dataset.gen);
    fetchPokemonsByGeneration(gen);
  });
});

function fetchPokemonsByGeneration(gen) {
    isGenerationSelected = true;

    const startId = getStartIdByGeneration(gen);
    const endId = getEndIdByGeneration(gen);
    offset = startId - 1;
    pokemonContainer.innerHTML = '';
    fetchPokemons(endId - startId + 1, offset);
}


function getStartIdByGeneration(gen) {
    switch (gen) {
      case 1:
        return 1;
      case 2:
        return 152;
      case 3:
        return 252;
      case 4:
        return 387;
      case 5:
        return 494;
      case 6:
        return 650;
      case 7:
        return 722;
      default:
        return 1;
    }
  }
  
  function getEndIdByGeneration(gen) {
    switch (gen) {
      case 1:
        return 151;
      case 2:
        return 251;
      case 3:
        return 386;
      case 4:
        return 493;
      case 5:
        return 649;
      case 6:
        return 721;
      case 7:
        return 809;
      default:
        return 151;
    }
  }
  