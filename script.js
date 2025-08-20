// --- Global State and DOM References ---
let allShows = [];
let allEpisodes = [];
//Cache to prevent re-fetching the same episode data during a session.
const episodeCache = {};
const statusMessage = document.getElementById("status-message");
const episodesContainer = document.getElementById("episodes-container");
const showsContainer = document.getElementById("shows-container");
const searchInput = document.getElementById("episode-search");
const resultsCountSpan = document.getElementById("results-count");
const showSelector = document.getElementById("show-selector");
const episodeSelector = document.getElementById("episode-selector");
const resetButton = document.getElementById("reset-button");
const backToShowsButton = document.getElementById("back-to-shows-button");

// --- App Initialization ---

/**
 * Main entry point. Starts by fetching all available shows.
 */
async function initializeApp() {
  await fetchShows();
  makePageForShows(allShows);
  document.getElementById("show-selector").style.display = "none";
  setupShowSearch();

  // Back button listener
  backToShowsButton.addEventListener("click", () => {
    showShowsView();
    setupShowSearch(); // Restore show search
    searchInput.value = "";
  });
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
  } catch (error) {
    console.error("Fetch shows error:", error);
    showErrorMessage("Failed to load TV show list. Please try again later.");
  }
}

/**
 * Fetches and displays episodes for a specific show, using a cache
 * to avoid re-fetching data during the same session.
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

  episodeList.forEach((episode) => {
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

  const imageUrl =
    image?.medium || "https://via.placeholder.com/210x295?text=No+Image";
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
  episodeCode.textContent = formatEpisodeCode(season, number);

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

/**
 * Renders a list of all shows with full details.
 * @param {Array<Object>} showList - The list of show objects.
 */
function makePageForShows(showList) {
  showsContainer.innerHTML = "";

  showList.forEach((show) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    const imageUrl =
      show.image?.medium || "https://via.placeholder.com/210x295?text=No+Image";
    const img = document.createElement("img");
    img.className = "episode-image";
    img.src = imageUrl;
    img.alt = `${show.name} thumbnail`;

    const content = document.createElement("div");
    content.className = "episode-content";

    const title = document.createElement("h2");
    title.className = "episode-title";
    title.textContent = show.name;

    const summary = document.createElement("p");
    summary.className = "episode-summary";
    summary.innerHTML = show.summary || "No summary available";

    const details = document.createElement("p");
    details.innerHTML = `
      <strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}<br>
      <strong>Status:</strong> ${show.status || "N/A"}<br>
      <strong>Rating:</strong> ${show.rating?.average || "N/A"}<br>
      <strong>Runtime:</strong> ${show.runtime || "N/A"} mins
    `;

    card.append(img, content);
    content.append(title, summary, details);

    card.addEventListener("click", () => {
      showEpisodesView(show.id);
    });

    showsContainer.appendChild(card);
  });

  showsContainer.style.display = "flex";
  episodesContainer.style.display = "none";
  backToShowsButton.style.display = "none";
  document.getElementById("search-container").style.display = "flex";
  document.getElementById("episode-selector-container").style.display = "none";
}

/**
 * Handles switching to the episodes view for a selected show.
 * @param {number} showId - The ID of the selected show.
 */
async function showEpisodesView(showId) {
  searchInput.value = "";
  await fetchEpisodes(showId);
  showsContainer.style.display = "none";
  episodesContainer.style.display = "flex";
  backToShowsButton.style.display = "inline-block";
  document.getElementById("search-container").style.display = "flex";
  document.getElementById("episode-selector-container").style.display = "flex";
  document.getElementById("show-selector").style.display = "inline-block";
  setupSearch();
  document.getElementById("show-selector-container").style.display = "flex";
}

/**
 * Handles switching back to the shows listing view.
 */
function showShowsView() {
  searchInput.value = "";
  showsContainer.style.display = "flex";
  episodesContainer.style.display = "none";
  backToShowsButton.style.display = "none";
  document.getElementById("search-container").style.display = "flex";
  document.getElementById("episode-selector-container").style.display = "none";
  document.getElementById("show-selector").style.display = "none";
  makePageForShows(allShows);
  document.getElementById("show-selector-container").style.display = "none";
}

// --- Event Listeners and Setup Functions ---

/**
 * Populate the show dropdown and sets up event listener.
 */
function setupShowSelector() {
  showSelector.innerHTML = '<option value="">-- Select a show --</option>';

  allShows.forEach((show) => {
    const option = new Option(show.name, show.id);
    showSelector.add(option);
  });

  showSelector.addEventListener("change", (event) => {
    const showId = event.target.value;
    if (showId) {
      episodesContainer.innerHTML = "";
      resultsCountSpan.textContent = "";
      searchInput.value = "";
      fetchEpisodes(showId);
    }
  });
}

/**
 * Sets up the search input and filtering logic for episodes.
 */
function setupSearch() {
  updateResultsCount(allEpisodes.length, allEpisodes.length);

  searchInput.placeholder = "Search episodes...";
  searchInput.oninput = function () {
    const term = this.value.toLowerCase().trim();

    const filtered = allEpisodes.filter(
      (episode) =>
        episode.name?.toLowerCase().includes(term) ||
        episode.summary?.toLowerCase().includes(term)
    );

    makePageForEpisodes(filtered);
    updateResultsCount(filtered.length, allEpisodes.length);

    if (term) {
      episodeSelector.value = "";
      resetButton.style.display = "none";
    }
  };
}

/**
 * Sets up the search input and filtering logic for shows.
 */
function setupShowSearch() {
  searchInput.placeholder = "Search shows...";
  searchInput.oninput = function () {
    const term = this.value.toLowerCase().trim();

    const filtered = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(term) ||
        show.genres.join(" ").toLowerCase().includes(term) ||
        show.summary?.toLowerCase().includes(term)
    );

    makePageForShows(filtered);
  };
}

/**
 * Populates the episode dropdown and sets up listeners.
 */
function setupEpisodeSelector() {
  episodeSelector.innerHTML =
    '<option value="">-- Select an episode --</option>';

  allEpisodes.forEach((episode) => {
    const option = new Option(
      `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`,
      episode.id
    );

    episodeSelector.add(option);
  });

  episodeSelector.addEventListener("change", function () {
    if (!this.value) return;

    const selectedEpisode = allEpisodes.find(
      (ep) => ep.id === parseInt(this.value)
    );
    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode]);
      resetButton.style.display = "inline-block";
      searchInput.value = "";
      updateResultsCount(1, allEpisodes.length);
    }
  });

  resetButton.addEventListener("click", function () {
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
 * Formats an episode code like S01E02.
 * @param {number} season - Season number.
 * @param {number} number - Episode number.
 * @returns {string} Formatted episode code.
 */
function formatEpisodeCode(season, number) {
  return `S${pad(season)}E${pad(number)}`;
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
