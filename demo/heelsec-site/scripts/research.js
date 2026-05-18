const researchList = document.querySelector("#research-list");

function createResearchCard(item) {
  const article = document.createElement("article");
  article.className = "research-card";

  const media = document.createElement("img");
  media.className = "research-card-image";
  media.src = item.Image;
  media.alt = "";
  media.setAttribute("aria-hidden", "true");

  const body = document.createElement("div");
  body.className = "research-card-body";

  const title = document.createElement("h2");
  title.textContent = item.Title;

  const about = document.createElement("p");
  about.textContent = item.About;

  body.append(title, about);
  article.append(media, body);

  return article;
}

fetch("data/research.json")
  .then((response) => response.json())
  .then((items) => {
    items.forEach((item) => {
      researchList.append(createResearchCard(item));
    });
  })
  .catch(() => {
    researchList.innerHTML = '<p class="load-error">Research areas could not be loaded.</p>';
  });
