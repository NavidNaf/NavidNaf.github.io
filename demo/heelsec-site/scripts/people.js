const peopleSources = [
  { target: "#faculty-list", url: "data/faculty.json" },
  { target: "#students-list", url: "data/students.json" },
  { target: "#alumni-list", url: "data/alumni.json" }
];

function createPersonCard(person) {
  const article = document.createElement("article");
  article.className = "person-card";

  const avatar = document.createElement("div");
  avatar.className = "avatar";

  if (person.Image) {
    const image = document.createElement("img");
    image.src = person.Image;
    image.alt = person.Name;
    avatar.append(image);
  } else {
    avatar.textContent = person.Initials || getInitials(person.Name);
  }

  const name = document.createElement("h2");
  name.textContent = person.Name;

  const role = document.createElement("p");
  role.textContent = person.Role;

  article.append(avatar, name, role);

  if (person["Current Role"]) {
    const currentRole = document.createElement("p");
    currentRole.className = "current-role";
    currentRole.textContent = person["Current Role"];
    article.append(currentRole);
  }

  const interests = createResearchInterests(person);
  if (interests) {
    article.append(interests);
  }

  const email = createEmailLink(person);
  if (email) {
    article.append(email);
  }

  const externalLinks = document.createElement("div");
  externalLinks.className = "person-links";
  appendExternalPersonLinks(externalLinks, person);

  if (externalLinks.children.length > 0) {
    article.append(externalLinks);
  }

  return article;
}

function createResearchInterests(person) {
  const interests = Array.isArray(person["Research Interests"])
    ? person["Research Interests"].filter((interest) => interest && interest.trim())
    : [];

  if (!interests || interests.length === 0) {
    return null;
  }

  const list = document.createElement("div");
  list.className = "research-interest-tags";

  interests.forEach((interest) => {
    const tag = document.createElement("span");
    tag.textContent = interest;

    list.append(tag);
  });

  return list;
}

function createEmailLink(person) {
  if (!person.Email) {
    return null;
  }

  const email = document.createElement("a");
  email.className = "person-email";
  email.href = `mailto:${person.Email}`;
  email.textContent = obfuscateEmail(person.Email);

  return email;
}

function appendExternalPersonLinks(links, person) {
  const linkItems = [
    {
      label: "Website",
      value: person.Website,
      href: person.Website,
      icon: "fa-solid fa-globe"
    },
    {
      label: "GitHub",
      value: person.Github,
      href: person.Github,
      icon: "fa-brands fa-github"
    },
    {
      label: "LinkedIn",
      value: person.LinkedIn,
      href: person.LinkedIn,
      icon: "fa-brands fa-linkedin"
    },
    {
      label: "ORCID",
      value: person.ORCID,
      href: person.ORCID,
      icon: "fa-brands fa-orcid"
    }
  ];

  linkItems.forEach((item) => {
    if (!item.value) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = item.href;
    anchor.setAttribute("aria-label", item.label);

    if (!item.href.startsWith("mailto:")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }

    const icon = document.createElement("i");
    icon.className = item.icon;
    icon.setAttribute("aria-hidden", "true");
    anchor.append(icon);

    links.append(anchor);
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function obfuscateEmail(email) {
  return email.replace("@", " (at) ").replace(/\./g, " (dot) ");
}

peopleSources.forEach((source) => {
  const target = document.querySelector(source.target);

  fetch(source.url)
    .then((response) => response.json())
    .then((people) => {
      people.forEach((person) => {
        target.append(createPersonCard(person));
      });
    })
    .catch(() => {
      target.innerHTML = '<p class="load-error">People could not be loaded.</p>';
    });
});
