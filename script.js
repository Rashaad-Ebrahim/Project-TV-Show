//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  // Footer
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerText = "The data on this page was provided by TVMaze.com";
  document.body.append(footer);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Create card container
  const cardContainer = document.createElement("div");
  cardContainer.className = "cardContainer";

  // Create episode cards within the card container
  episodeList.forEach((episode) =>
    cardContainer.append(makeEpisodeCard(episode))
  );

  rootElem.append(cardContainer);
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
  const episodeSummary = document.createElement("p");
  episodeSummary.className = "episode-summary";

  // Used regex to remove <p></p> tags from data
  episodeSummary.textContent = summary.replace(/<[^>]+>/g, "");

  // Building card
  episodeCard.append(episodeTitle, episodeImg, episodeSummary);

  return episodeCard;
}

// Helper function - number padding
function pad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = setup;
