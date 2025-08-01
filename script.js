//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Create card container
  const cardContainer = document.createElement('div')
  cardContainer.className = "cardContainer";

  // Create episode cards within the card container
  episodeList.forEach((episode) => cardContainer.append(makeEpisodeCard(episode)));

  rootElem.append(cardContainer)
}

// Function to create individual card
function makeEpisodeCard({ name, season, number, image, summary }) {
  // Create card
  const episodeCard = document.createElement("div");
  episodeCard.className = "episode-card";

  // Create title
  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "episode-title";

  episodeTitle.textContent = `${name} - S${pad(season)}E${pad(number)}`;

  // Create image
  const episodeImg = document.createElement("img");
  episodeImg.className = "episode-img";
  episodeImg.src = image.medium;
  episodeImg.alt = `${name} thumbnail`;

  // Add summary
  const episodeSummary = document.createElement("div");
  episodeSummary.className = "episode-summary";
  episodeSummary.innerHTML = summary;

  // Building card
  episodeCard.append(episodeTitle, episodeImg, episodeSummary);

  return episodeCard;
}

// Helper function - number padding
function pad(num) {
  return num.toString().padStart(2, "0");
}

console.log(getOneEpisode());

window.onload = setup;
