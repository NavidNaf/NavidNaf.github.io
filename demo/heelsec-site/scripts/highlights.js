const projectList = document.querySelector("#project-list");
const awardList = document.querySelector("#award-list");

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const icon = document.createElement("img");
  icon.className = "project-icon";
  icon.src = project.icon;
  icon.alt = project.iconAlt || "";
  icon.setAttribute("aria-hidden", project.iconAlt ? "false" : "true");

  const content = document.createElement("div");

  const meta = document.createElement("p");
  meta.className = "highlight-meta";
  const venue = document.createElement("span");
  venue.textContent = project.venue;
  meta.append(venue, document.createTextNode(project.year));

  const title = document.createElement("h4");
  title.textContent = project.title;

  const links = document.createElement("div");
  links.className = "project-links";

  project.links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label;
    links.append(anchor);
  });

  content.append(meta, title, links);
  article.append(icon, content);

  return article;
}

function createAwardRow(award) {
  const article = document.createElement("article");
  article.className = "award-item";

  const meta = document.createElement("p");
  meta.className = "highlight-meta";
  const category = document.createElement("span");
  category.textContent = award.category;
  meta.append(category, document.createTextNode(award.date));

  const text = document.createElement("p");
  text.textContent = award.text;

  const children = [meta, text];

  const awardLinks = Array.isArray(award.links) ? award.links : award.links ? [award.links] : [];

  if (awardLinks.length > 0) {
    const links = document.createElement("div");
    links.className = "news-links";

    awardLinks.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.label;
      links.append(anchor);
    });

    children.push(links);
  }

  article.append(...children);

  return article;
}

fetch("data/highlights.json")
  .then((response) => response.json())
  .then((projects) => {
    projects.forEach((project) => {
      projectList.append(createProjectCard(project));
    });
  })
  .catch(() => {
    projectList.innerHTML = '<p class="load-error">Projects could not be loaded.</p>';
  });

fetch("data/news.json")
  .then((response) => response.json())
  .then((awards) => {
    awards.forEach((award) => {
      awardList.append(createAwardRow(award));
    });
  })
  .catch(() => {
    awardList.innerHTML = '<p class="load-error">News and awards could not be loaded.</p>';
  });
