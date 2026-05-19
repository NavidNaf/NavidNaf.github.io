const galleryList = document.querySelector("#gallery-list");

function createGalleryCard(item) {
  const article = document.createElement("article");
  article.className = "gallery-card";

  let media;

  if (item.image) {
    media = document.createElement("img");
    media.className = "gallery-image";
    media.src = item.image;
    media.alt = item.imageAlt || "";
  } else {
    media = document.createElement("div");
    media.className = "gallery-placeholder";
    media.setAttribute("aria-hidden", "true");
    media.textContent = "Photo";
  }

  const body = document.createElement("div");
  body.className = "gallery-card-body";

  const meta = document.createElement("p");
  meta.className = "gallery-meta";
  meta.textContent = item.date;

  const title = document.createElement("h2");
  title.textContent = item.title;

  const caption = document.createElement("p");
  caption.textContent = item.caption;

  body.append(meta, title, caption);
  article.append(media, body);

  return article;
}

fetch("data/gallery.json")
  .then((response) => response.json())
  .then((items) => {
    items.forEach((item) => {
      galleryList.append(createGalleryCard(item));
    });
  })
  .catch(() => {
    galleryList.innerHTML = '<p class="load-error">Gallery photos could not be loaded.</p>';
  });
