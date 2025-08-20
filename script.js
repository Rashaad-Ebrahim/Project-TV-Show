//You can edit ALL of the code here
// --- Global State and DOM References ---
let allShows = [];
let allEpisodes = [];
//Cache to prevent re-fetching the same episode data during a session.
const episodeCache = {};
const statusMessage = document.getElementById("status-message");
const episodesContainer = document.getElementById("episodes-container");
const searchInput = document.getElementById("episode-search");
const resultsCountSpan = document.getElementById("results-count");
const showSelector = document.getElementById("show-selector");
const episodeSelector = document.getElementById("episode-selector");
const resetButton = document.getElementById("reset-button");


// --- App Initialization ---

/**
 * Main entry point. Starts by fetching all available shows.
 */
async function initializeApp() {
  await fetchShows();
}

/**
 * Fetches all TV shows from the API, sorts them, and populates the show selector.
 */
async function fetchShows() {
  showLoadingMessage("Loading TV show list...");
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    allShows = await response.json();
    // Sort shows alphabetically by name, case-insensitive.
    allShows.sort((a, b) => a.name.localeCompare(b.name));
    hideLoadingMessage();
    setupShowSelector();
    // Auto load the first show's episodes to get started.
    if (allShows.length > 0) {
      showSelector.value = allShows[0].id;
      await fetchEpisodes(allShows[0].id);
    }
  } catch (error) {
    console.error("Fetch shows error:", error);
    showErrorMessage("Failed to load TV show list. Please try again later.");
  }
}

/**
 * Fetches and displays episodes for a specific show, using a cache
 * avoid re-fetching data during the same session.
 * @param {number} showId - The ID of the show to fetch episodes for.
 */
async function fetchEpisodes(showId) {
  // Check the cache first. If data exists, use it and skip the fetch.
  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    initializeAppUI();
    return;
  }

  showLoadingMessage("Loading episodes for the selected show...");
  try {
    const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const episodes = await response.json();
    allEpisodes = episodes;
    // Store fetched episodes in the cache.
    episodeCache[showId] = episodes;
    initializeAppUI();
  } catch (error) {
    console.error("Fetch episodes error:", error);
    showErrorMessage("Failed to load episodes. Please select another show.");
  } finally {
    hideLoadingMessage();
  }
}

/**
 * Init all UI components (render cards, set up search, blah blah etc).
 * Called after episodes are loaded.
 */
function initializeAppUI() {
  makePageForEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
}

// --- UI Generation Functions ---

/**
 * Renders a list of episode cards to the page.
 * @param {Array<Object>} episodeList - The list of episode objects.
 */
function makePageForEpisodes(episodeList) {
  episodesContainer.innerHTML = "";
  
  if (episodeList.length === 0) {
    episodesContainer.innerHTML = `<p class="no-results">No episodes found</p>`;
    return;
  }
  
  episodeList.forEach(episode => {
    episodesContainer.appendChild(createEpisodeCard(episode));
  });
}

/**
 * Creates a single episode card element.
 * @param {Object} episode - The episode data.
 * @returns {HTMLElement} The created episode card element.
 */
function createEpisodeCard({ name, season, number, image, summary, url }) {
  const episodeCard = document.createElement("article");
  episodeCard.className = "episode-card";

  const imageUrl = image?.medium || "https://via.placeholder.com/210x295?text=No+Image";
  const episodeImg = document.createElement("img");
  episodeImg.className = "episode-image";
  episodeImg.src = imageUrl;
  episodeImg.alt = `${name || "Episode"} thumbnail`;

  const episodeContent = document.createElement("div");
  episodeContent.className = "episode-content";

  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "episode-title";
  episodeTitle.textContent = name || "Untitled episode";

  const episodeCode = document.createElement("span");
  episodeCode.className = "episode-code";
  episodeCode.textContent = `S${pad(season)}E${pad(number)}`;

  const episodeSummary = document.createElement("p");
  episodeSummary.className = "episode-summary";
  episodeSummary.innerHTML = summary || "No summary available";

  const tvMazeLink = document.createElement("a");
  tvMazeLink.href = url;
  tvMazeLink.target = "_blank";
  tvMazeLink.rel = "noopener";
  tvMazeLink.textContent = "View on TVMaze";

  episodeContent.append(episodeTitle, episodeCode, episodeSummary, tvMazeLink);
  episodeCard.append(episodeImg, episodeContent);

  return episodeCard;
}

// --- Event Listeners and Setup Functions ---

/**
 * Populate the show dropdown and sets up event listener.
 */
function setupShowSelector() {
  // Clear the dropdown, add sorted shows, listen for selection.
  showSelector.innerHTML = '<option value="">-- Select a show --</option>';

  allShows.forEach(show => {
    const option = new Option(show.name, show.id);
    showSelector.add(option);
  });

  showSelector.addEventListener("change", (event) => {
    const showId = event.target.value;
    if (showId) {
      episodesContainer.innerHTML = ""; // Clear old cards
      resultsCountSpan.textContent = ""; // Clear old count
      searchInput.value = ""; // Clear search input
      fetchEpisodes(showId); // Fetch and render new epis
    }
  });
}

/**
 * Sets up the search input and filtering logic.
 */
function setupSearch() {
  updateResultsCount(allEpisodes.length, allEpisodes.length);
  
  searchInput.addEventListener("input", function() {
    const term = this.value.toLowerCase().trim();
    
    const filtered = allEpisodes.filter(episode => 
      (episode.name?.toLowerCase().includes(term) || 
      (episode.summary?.toLowerCase().includes(term)))
    );
      
    makePageForEpisodes(filtered);
    updateResultsCount(filtered.length, allEpisodes.length);

    if (term) {
        episodeSelector.value = "";
        resetButton.style.display = "none";
    }
  });
}

/**
 * Populates the episode dropdown and sets up listeners.
 */
function setupEpisodeSelector() {
  while (episodeSelector.options.length > 1) {
    episodeSelector.remove(1);
  }
  
  allEpisodes.forEach(episode => {
    const option = new Option(
      `S${pad(episode.season)}E${pad(episode.number)} - ${episode.name}`,
      episode.id
    );
    episodeSelector.add(option);
  });
  
  episodeSelector.addEventListener("change", function() {
    if (!this.value) return;
    
    const selectedEpisode = allEpisodes.find(ep => ep.id === parseInt(this.value));
    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode]);
      resetButton.style.display = "inline-block";
      searchInput.value = "";
      updateResultsCount(1, allEpisodes.length);
    }
  });
  
  resetButton.addEventListener("click", function() {
    episodeSelector.value = "";
    searchInput.value = "";
    makePageForEpisodes(allEpisodes);
    updateResultsCount(allEpisodes.length, allEpisodes.length);
    resetButton.style.display = "none";
  });
}

// --- Helpers ---
// check JSDoc, its like my new thing, think its so sexy.
/**
 * Updates the displayed results count.
 * @param {number} displayed - Number of epis displayed.
 * @param {number} total - Total number of epis for current show.
 */
function updateResultsCount(displayed, total) {
  resultsCountSpan.textContent = `Showing ${displayed} of ${total} episodes`;
}

/**
 * Pads a number with a leading zero if needed.
 * @param {number} num - The number to pad.
 * @returns {string} The padded number as a string.
 */
function pad(num) {
  return String(num).padStart(2, "0");
}

/**
 * loading message.
 * @param {string} message - The message to display.
 */
function showLoadingMessage(message) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message loading";
}

/**
 * error message.
 * @param {string} message - The message to display.
 */
function showErrorMessage(message) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message error";
}

/**
 * Hides status message.
 */
function hideLoadingMessage() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

window.onload = initializeApp;