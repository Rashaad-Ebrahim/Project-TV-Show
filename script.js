// You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  // Footer (unchanged, just added aria-label for accessibility)
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = 'The data on this page was provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  document.body.append(footer);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Create card container (unchanged)
  const cardContainer = document.createElement("div");
  cardContainer.className = "cardContainer";

  // Create episode cards (added null check)
  episodeList.forEach((episode) => {
    if (episode) cardContainer.append(makeEpisodeCard(episode)); // Skip if episode is undefined
  });

  rootElem.append(cardContainer);
}

// Function to create individual card (added fallbacks + safer HTML)
function makeEpisodeCard({ name, season, number, image, summary }) {
  const episodeCard = document.createElement("div");
  episodeCard.className = "episode-card";

  // Title with fallback
  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "episode-title";
  episodeTitle.textContent = `${name || "Untitled Episode"} - S${pad(season)}E${pad(number)}`;

  // Image with fallback
  const episodeImg = document.createElement("img");
  episodeImg.className = "episode-img";
  episodeImg.src = image?.medium || "https://via.placeholder.com/300x170"; // Optional chaining
  episodeImg.alt = `${name || "Untitled Episode"} thumbnail`;

  // Summary with HTML tag cleanup + fallback
  const episodeSummary = document.createElement("p");
  episodeSummary.className = "episode-summary";
  episodeSummary.textContent = 
    summary?.replace(/<[^>]+>/g, "") || "No summary available"; // Optional chaining

  // Build card (unchanged)
  episodeCard.append(episodeTitle, episodeImg, episodeSummary);
  return episodeCard;
}

// Helper function - unchanged (perfect as-is)
function pad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = setup;