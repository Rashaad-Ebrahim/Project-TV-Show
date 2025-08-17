// You can edit ALL of the code here
// vars to store eps and filtered eps
let allEpisodes = [];
let currentEpisodes = [];
const statusMessage = document.getElementById("status-message");

function setup() {
  currentEpisodes = [...allEpisodes]; // Initialize currentEpisodes with all episodes

  // Create UI
  makePageForEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
  setupFooter();
}

const url = "https://api.tvmaze.com/shows/82/episodes";

function fetchEpisodes() {
  showLoadingMessage("Loading episodes...");

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((episodes) => {
      allEpisodes = episodes;
      hideLoadingMessage();
      setup();
    })
    .catch((error) => {
      showErrorMessage("Failed to load episodes. Please try again later.");
    });
}

function showLoadingMessage(message) {
  statusMessage.textContent = message;
  statusMessage.style.color = "var(--primary)";
}

function hideLoadingMessage() {
  statusMessage.textContent = "";
}

function showErrorMessage(message) {
  statusMessage.textContent = message;
  statusMessage.style.color = "red";
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; //clear

  // Create card container (unchanged)
  const cardContainer = document.createElement("div");
  cardContainer.className = "cardContainer";

  // Create episode cards (added null check)
  episodeList.forEach((episode) => {
    if (episode) cardContainer.append(makeEpisodeCard(episode)); // Skip if episode is undefined
  });

  rootElem.append(cardContainer);
  updateSearchCount(episodeList.length); // Update search count
}

// Function to create individual card (added fallbacks + safer HTML)
function makeEpisodeCard({ name, season, number, image, summary }) {
  const episodeCard = document.createElement("div");
  episodeCard.className = "episode-card";
  episodeCard.id = `episode-${season}-${number}`; // ID so can jump to episode

  // Title with fallback
  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "episode-title";
  episodeTitle.textContent = `${name || "Untitled Episode"} - S${pad(
    season
  )}E${pad(number)}`;

  // Image with fallback
  const episodeImg = document.createElement("img");
  episodeImg.className = "episode-img";
  episodeImg.src = image?.medium || "https://via.placeholder.com/300x170"; // fallback
  episodeImg.alt = `${name || "Untitled Episode"} thumbnail`; //accessibility

  // Summary with HTML tag cleanup + fallback
  const episodeSummary = document.createElement("p");
  episodeSummary.className = "episode-summary";
  episodeSummary.textContent =
    summary?.replace(/<[^>]+>/g, "") || "No summary available";

  // Build card (unchanged)
  episodeCard.append(episodeTitle, episodeImg, episodeSummary);
  return episodeCard;
}

function setupEpisodeSelector() {
  const selector = document.getElementById("episode-selector");
  const resetBtn = document.getElementById("reset-btn");

  // populate dropdown
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = `S${pad(episode.season)}E${pad(episode.number)}`;
    option.textContent = `S${pad(episode.season)}E${pad(episode.number)} - ${
      episode.name || "Untitled Episode"
    }`;
    selector.append(option);
  });

  selector.addEventListener("change", (e) => {
    if (!e.target.value) {
      currentEpisodes = [...allEpisodes]; // filtering
      makePageForEpisodes(currentEpisodes);
      return;
    }
    const [, season, number] = e.target.value.match(/S(\d+)E(\d+)/); // tried to update to this from .split cause of the what if value is not in the format S01E01
    const selected = allEpisodes.find(
      (ep) => ep.season == parseInt(season) && ep.number == parseInt(number)
    );

    if (selected) {
      currentEpisodes = [selected];
      makePageForEpisodes(currentEpisodes);
    }
  });
  resetBtn.addEventListener("click", () => {
    selector.value = "";
    currentEpisodes = [...allEpisodes];
    makePageForEpisodes(currentEpisodes);
  });
}

// Footer (unchanged, just added aria-label for accessibility)
function setupFooter() {
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML =
    'The data on this page was provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  document.body.append(footer);
}

function updateSearchCount(count) {
  const countElement = document.getElementById("search-count");
  countElement.textContent = `Displaying ${count}/${allEpisodes.length} episodes`;
}

function setupSearch() {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    currentEpisodes = term
      ? allEpisodes.filter(
          (ep) =>
            ep.name?.toLowerCase().includes(term) ||
            ep.summary?.toLowerCase().includes(term)
        )
      : [...allEpisodes]; // Filter or reset to all // Reset to all when empty
    makePageForEpisodes(currentEpisodes);
  });
}
// Helper function - unchanged (perfect as-is 🥑)
function pad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = fetchEpisodes;

/* NOTES
Key Differences compared to my code for level-100
- modular approach
- DOM creation explicit
- Footer in setup
- summary cleanup
- yours destructures vs mine accesses properties directly
- pads using a helper
- yours was missing the error handling other than that its nice and forward thinking 🥑 i learnt a lot and will consider being more modular in my approach, it reads easier, or rather more pleasantly.
- oh an before i forget the regex was a thoughtful touch. 
*/
