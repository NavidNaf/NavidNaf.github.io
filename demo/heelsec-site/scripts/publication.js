const publicationList = document.querySelector("#publication-list");

function createOptionalLink(field, label, iconClass) {
  if (!field) {
    return null;
  }

  const anchor = document.createElement("a");
  anchor.className = "publication-action";
  anchor.href = field.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.setAttribute("aria-label", `${label}: ${field.label}`);

  const icon = document.createElement("i");
  icon.className = iconClass;
  icon.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.textContent = label;

  anchor.append(icon, text);
  return anchor;
}

function createPublicationItem(item) {
  const article = document.createElement("article");
  article.className = "publication-item";

  const marker = document.createElement("p");
  marker.className = "pub-year";
  marker.textContent = getPublicationMarker(item.Conference);

  const content = document.createElement("div");

  const title = document.createElement("h2");
  title.textContent = item.Title;

  const authors = document.createElement("p");
  authors.className = "authors";
  authors.textContent = item.Authors;

  content.append(title, authors);

  if (item["Acceptance Rate"]) {
    const rate = document.createElement("p");
    rate.className = "publication-extra";
    rate.append(document.createTextNode("Acceptance Rate: "));

    const percentage = document.createElement("span");
    percentage.className = "publication-rate";
    percentage.textContent = item["Acceptance Rate"];

    rate.append(percentage);
    content.append(rate);
  }

  const actions = document.createElement("div");
  actions.className = "publication-actions";

  const paper = createOptionalLink(item["Read the paper"], "Read the paper", "fa-solid fa-file-lines");
  if (paper) {
    paper.classList.add("publication-action-primary");
    actions.append(paper);
  }

  const website = createOptionalLink(item.Website, "Website", "fa-solid fa-globe");
  if (website) {
    actions.append(website);
  }

  const news = createOptionalLink(item.News, "News", "fa-regular fa-newspaper");
  if (news) {
    actions.append(news);
  }

  if (actions.children.length > 0) {
    content.append(actions);
  }

  article.append(marker, content);
  return article;
}

function getPublicationMarker(conference) {
  if (!conference) {
    return "";
  }

  const yearMatch = conference.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : "";
  const shortNameMatch = conference.match(/\(([^)]*)\)/);
  const conferenceName = shortNameMatch ? shortNameMatch[1] : conference
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/[, ]+$/g, "")
    .trim();

  return [year, conferenceName].filter(Boolean).join(" - ");
}

fetch("data/publication.json")
  .then((response) => response.json())
  .then((items) => {
    items.forEach((item) => {
      publicationList.append(createPublicationItem(item));
    });
  })
  .catch(() => {
    publicationList.innerHTML = '<p class="load-error">Publications could not be loaded.</p>';
  });
