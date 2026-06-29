const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/2605-DEE`;

let players = [];
let selectedPlayer = null;

async function fetchPlayers() {
  try {
    const response = await fetch(`${API_URL}/players`);
    const result = await response.json();
    players = result.data.players;
    render();
  } catch (error) {
    console.error(`Failed to fetch data`, error);
  }
}

async function fetchSinglePlayer(id) {
  try {
    const response = await fetch(`${API_URL}/players/${id}`);
    const result = await response.json();
    selectedPlayer = result.data.player;
    render();
  } catch (error) {
    console.error(`Error fetching ID ${id}:`, error);
  }
}

async function removePlayer(id) {
  try {
    const response = await fetch(`${API_URL}/players/${id}`, {
      method: "DELETE",
    });
    await response.json();

    selectedPlayer = null;
    await fetchPlayers();
  } catch (error) {
    console.error(`Failed to remove player ID ${id}:`, error);
  }
}

function puppyRosterComponent() {
  if (players.length === 0) {
    return `<p>Loading the puppy roster...</p>`;
  }

  return players
    .map(
      (player) => `
      <div class="puppy-card" data-id="${player.id}">
        <h3>${player.name}</h3>
        <img src="${player.imageUrl}" alt="${player.name}" class="puppy-thumb" />
      </div>
    `,
    )
    .join("");
}

function puppyDetailsComponent() {
  if (selectedPlayer === null) {
    return `<p class="placeholder-msg">Please select a puppy from the roster to view their stats!</p>`;
  }

  let teamName = "Unassigned";
  if (selectedPlayer.team) {
    teamName = selectedPlayer.team.name;
  }

  return `
    <div class="details-card">
      <h2>${selectedPlayer.name} (Selected)</h2>
      <img src="${selectedPlayer.imageUrl}" alt="${selectedPlayer.name}" class="puppy-large-img" />
      <p><strong>ID:</strong> ${selectedPlayer.id}</p>
      <p><strong>Breed:</strong> ${selectedPlayer.breed}</p>
      <p><strong>Status:</strong> ${selectedPlayer.status}</p>
      <p><strong>Team:</strong> ${teamName}</p>
      <button id="delete-btn" data-id="${selectedPlayer.id}">Remove from Roster</button>
    </div>
  `;
}

function puppyFormComponent() {
  return `
    <form id="add-puppy-form">
      <h2>Add a New Competitor</h2>
      <div class="form-group">
        <label for="puppy-name">Puppy Name:</label>
        <input type="text" id="puppy-name" required />
      </div>
      <div class="form-group">
        <label for="puppy-breed">Breed:</label>
        <input type="text" id="puppy-breed" required />
      </div>
      <div class="form-group">
        <label for="puppy-team">Team:</label>
        <input type="text" id="puppy-team" required />
      </div>
      <div class="form-group">
        <label for="puppy-image">Image URL:</label>
        <input type="url" id="puppy-image" placeholder="Upload your puppy picture" />
      </div>
      <button type="submit">Add to Roster</button>
    </form>
  `;
}

function render() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <header>
      <h1>Puppy Bowl Tournament Manager</h1>
    </header>

    <main class="admin-container">
      <section class="form-column">
        ${puppyFormComponent()}
      </section>

      <section class="roster-column">
        <h2>Current Contestants</h2>
        <div class="roster-grid">
          ${puppyRosterComponent()}
        </div>
      </section>

      <section class="details-column">
        <h2>Player Profile</h2>
        <div id="details-view">
          ${puppyDetailsComponent()}
        </div>
      </section>
    </main>
  `;

  const rosterGrid = document.querySelector(".roster-grid");
  if (rosterGrid) {
    rosterGrid.addEventListener("click", async function (event) {
      const clickedCard = event.target.closest(".puppy-card");
      if (clickedCard) {
        const puppyId = clickedCard.getAttribute("data-id");
        await fetchSinglePlayer(puppyId);
      }
    });
  }

  const deleteBtn = document.querySelector("#delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async function () {
      const puppyId = deleteBtn.getAttribute("data-id");
      await removePlayer(puppyId);
    });
  }

  const form = document.querySelector("#add-puppy-form");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nameInput = document.querySelector("#puppy-name");
      const breedInput = document.querySelector("#puppy-breed");

      try {
        const response = await fetch(`${API_URL}/players`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameInput.value,
            breed: breedInput.value,
          }),
        });

        await response.json();

        nameInput.value = "";
        breedInput.value = "";
        await fetchPlayers();
      } catch (error) {
        console.error("Failed to add new puppy:", error);
      }
    });
  }
}

fetchPlayers();

//added so I can make another commit
