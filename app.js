const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function showToast(message) {
  let toast = $(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function initNav() {
  const toggle = $(".menu-toggle");
  const links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const current = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });
}

function initFilters() {
  const groups = $$("[data-filter-group]");
  groups.forEach((group) => {
    const targetId = group.dataset.filterGroup;
    const cards = $$(`[data-filter-list="${targetId}"] [data-category]`);
    group.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (!chip) return;
      $$("[data-filter]", group).forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      const value = chip.dataset.filter;
      cards.forEach((card) => {
        card.hidden = value !== "all" && card.dataset.category !== value;
      });
    });
  });
}

const tracks = [
  {
    title: "Sauti Sol - Suzanna",
    detail: "Afro-pop / Nairobi",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e8/68/2e/e8682e64-8979-2529-1868-3bb973c98aa4/mzaf_7775549575609635808.plus.aac.p.m4a"
  },
  {
    title: "Khaligraph Jones - Yego",
    detail: "Hip hop / Nairobi",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/89/f3/9d/89f39df7-ec76-ff5e-53a9-9896f448a7f5/mzaf_2770255499184191385.plus.aac.p.m4a"
  },
  {
    title: "Ayub Ogada - Kothbiro",
    detail: "Luo nyatiti / folk",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/3d/10/ee/3d10ee37-fb38-d15d-fb5d-06c4836b814d/mzaf_16313995260044419254.plus.aac.p.m4a"
  },
  {
    title: "Kakai Kilonzo - Munguti",
    detail: "Kamba traditional folk",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a7/52/09/a752096a-5b38-36e3-e7f8-b66f350151f2/mzaf_10247010573520375124.plus.aac.p.m4a"
  },
  {
    title: "D.O. Misiani & Shirati Jazz - Nyar Gombe",
    detail: "Luo benga guitar",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b9/a9/b0/b9a9b0cf-a9f2-5219-422e-fea06f6c7c61/mzaf_7901890365442082608.plus.aac.p.m4a"
  },
  {
    title: "Angela Laur - Maasai Tribe",
    detail: "Maasai-themed instrumental",
    src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/03/15/25/03152558-f13c-3593-5f68-82f8f7d4b55b/mzaf_9554498404340847391.plus.aac.p.m4a"
  },
  {
    title: "Kenya National Anthem",
    detail: "Anthem / public audio",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/49/National_Anthem_of_Kenya.ogg"
  }
];

function initPlayer() {
  if (window.__kenyaPlayerReady) return;
  window.__kenyaPlayerReady = true;

  const player = $(".player");
  if (!player) return;

  const audio = new Audio(tracks[0].src);
  audio.preload = "none";
  let index = 0;
  const title = $("[data-track-title]", player);
  const detail = $("[data-track-detail]", player);
  const progress = $("[data-progress]", player);
  const play = $("[data-player-play]", player);
  const playlist = $("[data-playlist]", player);

  function loadTrack(nextIndex, autoplay = false) {
    index = (nextIndex + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    title.textContent = tracks[index].title;
    if (detail) detail.textContent = tracks[index].detail;
    progress.style.width = "0%";
    $$("[data-track-index]", player).forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.trackIndex) === index);
    });
    if (autoplay) audio.play().catch(() => showToast("Tap play again to start audio."));
  }

  if (playlist) {
    playlist.innerHTML = tracks.map((track, trackIndex) => `
      <button class="playlist-track" type="button" data-track-index="${trackIndex}">
        <span>${track.title}</span>
        <small>${track.detail}</small>
      </button>
    `).join("");
    playlist.addEventListener("click", (event) => {
      const item = event.target.closest("[data-track-index]");
      if (!item) return;
      loadTrack(Number(item.dataset.trackIndex), !audio.paused);
    });
  }

  $(".player-head", player).addEventListener("click", () => player.classList.toggle("collapsed"));
  $("[data-player-prev]", player).addEventListener("click", () => loadTrack(index - 1, !audio.paused));
  $("[data-player-next]", player).addEventListener("click", () => loadTrack(index + 1, !audio.paused));
  play.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        play.textContent = "Pause";
      }).catch(() => showToast("Your browser blocked autoplay. Tap play once more."));
    } else {
      audio.pause();
      play.textContent = "Play";
    }
  });
  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.style.width = `${percent}%`;
  });
  audio.addEventListener("ended", () => loadTrack(index + 1, true));
  audio.addEventListener("pause", () => play.textContent = "Play");
  audio.addEventListener("play", () => play.textContent = "Pause");
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-player]");
    if (!trigger) return;

    event.preventDefault();
    player.classList.remove("collapsed");

    const requestedTrack = Number(trigger.dataset.playerTrack);
    if (Number.isInteger(requestedTrack)) {
      loadTrack(requestedTrack, true);
      showToast(`Playing ${tracks[index].title}.`);
      return;
    }

    showToast("Audio player opened.");
  });
  loadTrack(0);
}

const recipes = {
  ugali: {
    title: "Ugali and Sukuma",
    ingredients: ["Maize flour", "Water", "Sukuma wiki", "Tomatoes", "Onion", "Salt"],
    steps: ["Bring salted water to a boil.", "Add maize flour gradually while stirring.", "Fold until firm and smooth.", "Saute onion, tomato, and greens.", "Serve hot with the greens."]
  },
  nyama: {
    title: "Nyama Choma",
    ingredients: ["Goat or beef ribs", "Salt", "Lemon", "Kachumbari", "Charcoal heat"],
    steps: ["Salt the meat generously.", "Grill slowly over medium charcoal.", "Turn often until smoky and tender.", "Rest, slice, and serve with kachumbari."]
  },
  pilau: {
    title: "Coastal Pilau",
    ingredients: ["Rice", "Pilau masala", "Beef or chicken", "Garlic", "Ginger", "Onion"],
    steps: ["Brown onions and spices.", "Add meat and cook until sealed.", "Add washed rice and stock.", "Steam on low heat until fluffy.", "Serve with kachumbari or chutney."]
  },
  mandazi: {
    title: "Mandazi",
    ingredients: ["Flour", "Coconut milk", "Sugar", "Cardamom", "Yeast or baking powder", "Oil"],
    steps: ["Mix dough and rest until soft.", "Roll and cut into triangles.", "Fry until golden.", "Serve with tea or coffee."]
  }
};

function initRecipes() {
  const modal = $(".recipe-modal");
  if (!modal) return;

  const title = $("[data-recipe-title]", modal);
  const ingredients = $("[data-recipe-ingredients]", modal);
  const steps = $("[data-recipe-steps]", modal);

  function close() {
    modal.classList.remove("open");
  }

  $$("[data-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      const recipe = recipes[button.dataset.recipe];
      if (!recipe) return;
      title.textContent = recipe.title;
      ingredients.innerHTML = recipe.ingredients.map((item) => `<li>${item}</li>`).join("");
      steps.innerHTML = recipe.steps.map((item) => `<li>${item}</li>`).join("");
      modal.classList.add("open");
    });
  });

  $$("[data-close-modal]", modal).forEach((button) => button.addEventListener("click", close));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  if (!window.__recipeEscapeBound) {
    window.__recipeEscapeBound = true;
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") $(".recipe-modal.open")?.classList.remove("open");
    });
  }
}

function initPlanner() {
  const form = $("[data-planner-form]");
  const list = $("[data-itinerary]");
  if (!form || !list) return;

  const saved = JSON.parse(localStorage.getItem("kenyaTrips") || "[]");

  function render() {
    list.innerHTML = "";
    if (!saved.length) {
      list.innerHTML = '<p class="lede">No saved plans yet. Build one from the form and it will stay in this browser.</p>';
      return;
    }
    saved.forEach((trip, idx) => {
      const item = document.createElement("div");
      item.className = "itinerary-item";
      item.innerHTML = `
        <div>
          <strong>${trip.route}</strong>
          <div class="font-mono" style="color:#b9b9b9;font-size:.75rem">${trip.days} days / ${trip.style} / ${trip.month}</div>
          <p style="margin:.4rem 0 0;color:#ddd">${trip.notes || "Open itinerary"}</p>
        </div>
        <button class="icon-btn" type="button" aria-label="Remove trip" data-remove-trip="${idx}">Remove</button>
      `;
      list.appendChild(item);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    saved.unshift({
      route: data.get("route"),
      days: data.get("days"),
      style: data.get("style"),
      month: data.get("month"),
      notes: data.get("notes")
    });
    localStorage.setItem("kenyaTrips", JSON.stringify(saved));
    form.reset();
    render();
    showToast("Trip saved to your local itinerary.");
  });

  list.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-trip]");
    if (!remove) return;
    saved.splice(Number(remove.dataset.removeTrip), 1);
    localStorage.setItem("kenyaTrips", JSON.stringify(saved));
    render();
    showToast("Trip removed.");
  });

  render();
}

function initContact() {
  const form = $("[data-contact-form]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = new FormData(form).get("email");
    localStorage.setItem("kenyaDispatchEmail", email);
    form.reset();
    showToast("Dispatch saved locally. No spam, no dead end.");
  });
}

const kenyaMapBounds = {
  north: 5.1,
  south: -5.1,
  west: 33.5,
  east: 42.2
};

const kenyaMapCenter = { lat: 0.0236, lng: 37.9062 };
const defaultGoogleMapsKey = "AIzaSyABk1VoKgSscZhZdqp6SL-cLQ020DRKUFg";

const kenyaDestinationImages = [
  { match: ["mount kenya"], src: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Mount_Kenya_gate.jpg" },
  { match: ["nairobi national park", "nairobi safari walk"], src: "https://upload.wikimedia.org/wikipedia/commons/6/64/Lions_of_Kenya_02.jpg" },
  { match: ["hells gate", "hell's gate"], src: "https://upload.wikimedia.org/wikipedia/commons/8/87/Hell%27s_Gate%2C_Kenya.jpg" },
  { match: ["rift valley"], src: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tectonic_African_Arabian_Rift_System.jpg" },
  { match: ["lake nakuru"], src: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Lake-Nakuru-Baboon-Hill-View.JPG" },
  { match: ["diani", "beach"], src: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Diani_Beach_Ukunda.jpg" },
  { match: ["lamu"], src: "https://upload.wikimedia.org/wikipedia/commons/4/49/Lamu%2C_Lamu_Island%2C_Kenya.jpg" },
  { match: ["maasai mara", "masai mara"], src: "https://upload.wikimedia.org/wikipedia/commons/1/17/Masai_Mara_at_Sunset.jpg" },
  { match: ["mombasa"], src: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Mombasa_Island.jpg" },
  { match: ["restaurant", "nyama", "food", "grill"], src: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Goat_meat_being_roasted.jpg" },
  { match: ["nightlife", "club", "lounge", "westlands"], src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Buildings_along_Woodvale_Grove.jpg" },
  { match: ["hotel", "cafe", "market", "nairobi"], src: "https://upload.wikimedia.org/wikipedia/commons/b/be/Nairobi_skyline_from_Gem_Hotel.jpg" }
];

const kenyaSeedDestinations = [
  { name: "Mount Kenya National Park", formattedAddress: "Central Kenya", rating: 4.4, user_ratings_total: 5891, primaryTypeDisplayName: "National Park", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Mount_Kenya_gate.jpg" },
  { name: "Nairobi National Park", formattedAddress: "Nairobi, Kenya", rating: 4.5, user_ratings_total: 11442, primaryTypeDisplayName: "National Park", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/6/64/Lions_of_Kenya_02.jpg" },
  { name: "Hell's Gate National Park", formattedAddress: "Naivasha, Kenya", rating: 4.5, user_ratings_total: 4100, primaryTypeDisplayName: "National Park", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/8/87/Hell%27s_Gate%2C_Kenya.jpg" },
  { name: "Lake Nakuru", formattedAddress: "Nakuru County, Kenya", rating: 4.6, user_ratings_total: 5200, primaryTypeDisplayName: "Lake / Park", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Lake-Nakuru-Baboon-Hill-View.JPG" },
  { name: "Diani Beach", formattedAddress: "Kwale County, Kenya", rating: 4.7, user_ratings_total: 8300, primaryTypeDisplayName: "Beach", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Diani_Beach_Ukunda.jpg" },
  { name: "Lamu Island", formattedAddress: "Lamu County, Kenya", rating: 4.6, user_ratings_total: 2100, primaryTypeDisplayName: "Island / Culture", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/4/49/Lamu%2C_Lamu_Island%2C_Kenya.jpg" },
  { name: "Maasai Mara", formattedAddress: "Narok County, Kenya", rating: 4.8, user_ratings_total: 9200, primaryTypeDisplayName: "Game Reserve", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/1/17/Masai_Mara_at_Sunset.jpg" },
  { name: "Mombasa Island", formattedAddress: "Mombasa, Kenya", rating: 4.5, user_ratings_total: 4100, primaryTypeDisplayName: "Coast / City", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Mombasa_Island.jpg" },
  { name: "Westlands Nightlife", formattedAddress: "Nairobi, Kenya", rating: 4.3, user_ratings_total: 2800, primaryTypeDisplayName: "Nightlife", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Buildings_along_Woodvale_Grove.jpg" },
  { name: "Nyama Choma Food Stop", formattedAddress: "Kenya", rating: 4.4, user_ratings_total: 3600, primaryTypeDisplayName: "Restaurant", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Goat_meat_being_roasted.jpg" },
  { name: "Nairobi City Hotels", formattedAddress: "Nairobi, Kenya", rating: 4.4, user_ratings_total: 5000, primaryTypeDisplayName: "Hotels", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/b/be/Nairobi_skyline_from_Gem_Hotel.jpg" },
  { name: "Great Rift Valley View", formattedAddress: "Kenya", rating: 4.6, user_ratings_total: 1272, primaryTypeDisplayName: "Viewpoint", __fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tectonic_African_Arabian_Rift_System.jpg" }
];

function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.importLibrary) return Promise.resolve();
  if (window.__kenyaGoogleMapsPromise) return window.__kenyaGoogleMapsPromise;

  window.__kenyaGoogleMapsPromise = new Promise((resolve, reject) => {
    window.__kenyaGoogleMapsReady = resolve;
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      loading: "async",
      callback: "__kenyaGoogleMapsReady",
      libraries: "places,marker"
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      window.__kenyaGoogleMapsPromise = null;
      reject(new Error("Google Maps could not load."));
    };
    document.head.appendChild(script);
  });

  return window.__kenyaGoogleMapsPromise;
}

function getPlaceName(place) {
  return place.displayName || place.name || "Unnamed place";
}

function getPlaceAddress(place) {
  return place.formattedAddress || place.formatted_address || "";
}

function getPlaceLocation(place) {
  return place.location || place.geometry?.location || null;
}

function toLatLngLiteral(location) {
  if (!location) return null;
  if (typeof location.lat === "function") return { lat: location.lat(), lng: location.lng() };
  return { lat: location.lat, lng: location.lng };
}

function getPlaceRating(place) {
  const rating = place.rating;
  const count = place.userRatingCount || place.user_ratings_total;
  if (!rating) return "No rating yet";
  return `${Number(rating).toFixed(1)} stars${count ? ` / ${count} reviews` : ""}`;
}

function getPlacePhotoUrl(photo, maxWidth = 720) {
  if (!photo) return "";
  if (typeof photo.getURI === "function") return photo.getURI({ maxWidth, maxHeight: 520 });
  if (typeof photo.getUrl === "function") return photo.getUrl({ maxWidth, maxHeight: 520 });
  return "";
}

function getPlaceMapsUrl(place) {
  if (place.googleMapsURI) return place.googleMapsURI;
  if (place.url) return place.url;
  const location = toLatLngLiteral(getPlaceLocation(place));
  if (!location) return "https://www.google.com/maps/search/Kenya";
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

function getPlaceDirectionsUrl(place, origin = null) {
  const location = toLatLngLiteral(getPlaceLocation(place));
  const destination = location ? `${location.lat},${location.lng}` : getPlaceName(place);
  const originParam = origin ? `&origin=${encodeURIComponent(`${origin.lat},${origin.lng}`)}` : "";
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function getPlaceHours(place) {
  return place.regularOpeningHours?.weekdayDescriptions || place.opening_hours?.weekday_text || [];
}

function initKenyaMapExplorer() {
  const root = $("[data-google-map-explorer]");
  if (!root || root.dataset.mapReady === "true") return;
  root.dataset.mapReady = "true";

  const keyInput = $("[data-map-key]", root);
  const loadButton = $("[data-map-load]", root);
  const clearKeyButton = $("[data-map-clear-key]", root);
  const locateButton = $("[data-map-locate]", root);
  const resetButton = $("[data-map-reset]", root);
  const searchForm = $("[data-map-search-form]", root);
  const categoryWrap = $("[data-map-categories]", root);
  const status = $("[data-map-status]", root);
  const results = $("[data-map-results]", root);
  const gallery = $("[data-place-gallery]", root);
  const galleryCount = $("[data-gallery-count]", root);
  const detail = $("[data-place-detail]", root);
  const routeCard = $("[data-route-card]", root);

  if (!gallery) return;

  const savedKey = localStorage.getItem("kenyaGoogleMapsKey") || defaultGoogleMapsKey;
  keyInput.value = savedKey;

  const state = {
    placesReady: false,
    placesService: null,
    places: [],
    selectedPlace: null,
    userPosition: null,
    activeQuery: "best places to visit in Kenya"
  };

  function setStatus(message) {
    status.textContent = message;
  }

  function setActivePlace(index) {
    $$("[data-place-index]", root).forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.placeIndex) === index);
    });
  }

  function renderPhoto(place, className = "") {
    const name = getPlaceName(place);
    const photo = getPlacePhotoUrl((place.photos || [])[0], 900) || place.__fallbackImage || "";
    if (photo) return `<img class="${className}" src="${escapeHtml(photo)}" alt="${escapeHtml(name)}">`;
    return `<div class="place-card-placeholder ${className}" aria-hidden="true">${escapeHtml(name.charAt(0) || "K")}</div>`;
  }

  async function attachFallbackImage(place) {
    if (getPlacePhotoUrl((place.photos || [])[0], 900)) return place;
    const haystack = [
      getPlaceName(place),
      getPlaceAddress(place),
      place.primaryTypeDisplayName,
      ...(place.types || [])
    ].join(" ").toLowerCase();
    const match = kenyaDestinationImages.find((item) => item.match.some((term) => haystack.includes(term)));
    place.__fallbackImage = match?.src || kenyaDestinationImages[kenyaDestinationImages.length - 1].src;
    return place;
  }

  function renderResults(places) {
    results.innerHTML = "";
    if (!places.length) {
      results.innerHTML = '<p class="lede" style="font-size:.9rem">No Google Places results returned for that search. Try a category or a more specific town.</p>';
      return;
    }

    places.forEach((place, index) => {
      const item = document.createElement("button");
      item.className = "map-result";
      item.type = "button";
      item.dataset.placeIndex = String(index);
      item.innerHTML = `
        <strong>${escapeHtml(getPlaceName(place))}</strong>
        <small>${escapeHtml(getPlaceRating(place))}</small>
        <small>${escapeHtml(getPlaceAddress(place) || "Kenya")}</small>
      `;
      results.appendChild(item);
    });
  }

  function renderGallery(places) {
    galleryCount.textContent = `${places.length} ${places.length === 1 ? "place" : "places"}`;
    gallery.innerHTML = "";
    if (!places.length) {
      gallery.innerHTML = `
        <div class="gallery-empty">
          <strong>No destination images yet.</strong>
          <p>Search another Kenyan place category to refill this grid.</p>
        </div>
      `;
      return;
    }

    places.forEach((place, index) => {
      const card = document.createElement("button");
      card.className = "place-card";
      card.type = "button";
      card.dataset.placeIndex = String(index);
      card.innerHTML = `
        ${renderPhoto(place)}
        <span class="place-card-body">
          <strong>${escapeHtml(getPlaceName(place))}</strong>
          <small>${escapeHtml(getPlaceRating(place))}</small>
          <small>${escapeHtml(getPlaceAddress(place) || "Kenya")}</small>
        </span>
      `;
      gallery.appendChild(card);
    });
  }

  function renderPlaceDetail(place) {
    const name = getPlaceName(place);
    const address = getPlaceAddress(place);
    const photos = (place.photos || []).map((photo) => getPlacePhotoUrl(photo)).filter(Boolean).slice(0, 4);
    const hours = getPlaceHours(place).slice(0, 7);
    const phone = place.nationalPhoneNumber || place.formatted_phone_number || "";
    const website = place.websiteURI || place.website || "";
    const type = place.primaryTypeDisplayName || place.types?.[0]?.replaceAll("_", " ") || "Place";
    const mapsUrl = getPlaceMapsUrl(place);
    const directionsUrl = getPlaceDirectionsUrl(place, state.userPosition);

    detail.innerHTML = `
      <p class="font-mono text-xs text-red-500 tracking-widest">${escapeHtml(type)}</p>
      <h3>${escapeHtml(name)}</h3>
      <div class="map-detail-meta">
        <span>${escapeHtml(getPlaceRating(place))}</span>
        ${place.businessStatus || place.business_status ? `<span>${escapeHtml(place.businessStatus || place.business_status)}</span>` : ""}
      </div>
      ${photos.length ? `<div class="map-photo-grid">${photos.map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(name)} photo">`).join("")}</div>` : renderPhoto(place, "map-detail-fallback")}
      <p class="font-serif text-gray-300">${escapeHtml(address || "Address unavailable from the selected result.")}</p>
      ${phone ? `<p class="font-mono text-xs text-gray-400">PHONE: ${escapeHtml(phone)}</p>` : ""}
      ${hours.length ? `<div><p class="font-mono text-xs text-green-500 mb-2">HOURS</p>${hours.map((line) => `<p class="text-sm text-gray-400">${escapeHtml(line)}</p>`).join("")}</div>` : ""}
      <div class="map-detail-actions">
        <a href="${escapeHtml(directionsUrl)}" target="_blank" rel="noreferrer" data-map-route>Directions</a>
        <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noreferrer">Open Maps</a>
        ${website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noreferrer">Website</a>` : ""}
      </div>
    `;
  }

  async function fetchPlaceDetails(place) {
    if (typeof place.fetchFields === "function") {
      try {
        await place.fetchFields({
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "rating",
            "userRatingCount",
            "photos",
            "businessStatus",
            "nationalPhoneNumber",
            "websiteURI",
            "googleMapsURI",
            "regularOpeningHours",
            "primaryTypeDisplayName",
            "types"
          ]
        });
      } catch (error) {
        console.warn("Place details unavailable", error);
      }
      return place;
    }

    const placeId = place.place_id || place.id;
    if (!placeId || !state.placesService) return place;
    return new Promise((resolve) => {
      state.placesService.getDetails({
        placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "user_ratings_total",
          "photos",
          "formatted_phone_number",
          "website",
          "url",
          "opening_hours",
          "types",
          "business_status"
        ]
      }, (detailsPlace, serviceStatus) => {
        resolve(serviceStatus === google.maps.places.PlacesServiceStatus.OK && detailsPlace ? detailsPlace : place);
      });
    });
  }

  async function selectPlace(index) {
    const basePlace = state.places[index];
    if (!basePlace) return;

    setActivePlace(index);
    state.selectedPlace = await fetchPlaceDetails(basePlace);
    state.places[index] = state.selectedPlace;
    renderPlaceDetail(state.selectedPlace);
    renderGallery(state.places);
    setActivePlace(index);
    routeCard.hidden = false;
    routeCard.innerHTML = `
      <strong>${escapeHtml(getPlaceName(state.selectedPlace))}</strong>
      <p class="font-mono text-xs text-gray-300 mt-1">Use Directions to route in Google Maps${state.userPosition ? " from your current location" : ""}.</p>
    `;
    setStatus(`Selected ${getPlaceName(state.selectedPlace)}. Photos and details are from Google Places.`);
  }

  async function searchGooglePlaces(query) {
    if (!state.placesReady) {
      state.places = kenyaSeedDestinations;
      renderResults(state.places);
      renderGallery(state.places);
      setStatus("Showing curated Kenya destination images. Load places to search live Google Places data.");
      return;
    }

    state.activeQuery = query;
    setStatus(`Searching Google Places for "${query}"...`);
    routeCard.hidden = true;

    try {
      const { Place } = await google.maps.importLibrary("places");
      const response = await Place.searchByText({
        textQuery: query,
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "rating",
          "userRatingCount",
          "photos",
          "primaryTypeDisplayName",
          "businessStatus"
        ],
        locationBias: kenyaMapBounds,
        maxResultCount: 12
      });
      const foundPlaces = (response.places || []).slice(0, 12);
      state.places = await Promise.all(foundPlaces.map((place) => fetchPlaceDetails(place)));
      state.places = await Promise.all(state.places.map((place) => attachFallbackImage(place)));
      renderResults(state.places);
      renderGallery(state.places);
      if (state.places.length) {
        setStatus(`${state.places.length} live Google Places loaded for "${query}". Click a photo card or list item for details.`);
      } else {
        setStatus(`Google Places returned no places for "${query}".`);
      }
    } catch (error) {
      console.error(error);
      if (!state.places.length) {
        state.places = kenyaSeedDestinations;
        renderResults(state.places);
        renderGallery(state.places);
      }
      setStatus("Google Places search failed, so curated Kenya destination images are showing instead.");
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus("Your browser does not support geolocation.");
      return;
    }

    setStatus("Requesting your current location...");
    navigator.geolocation.getCurrentPosition((position) => {
      state.userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      if (state.selectedPlace) renderPlaceDetail(state.selectedPlace);
      setStatus("Current location saved for Directions links. Your position is not shown on this page.");
    }, () => {
      setStatus("Location permission was denied or unavailable. Directions still open in Google Maps without a starting point.");
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 15000
    });
  }

  async function bootPlaces() {
    const apiKey = keyInput.value.trim();
    if (!apiKey) {
      setStatus("Paste a Google Maps API key first. It is saved only in this browser.");
      return;
    }

    localStorage.setItem("kenyaGoogleMapsKey", apiKey);
    setStatus("Loading Google Places...");
    try {
      await loadGoogleMaps(apiKey);
      await google.maps.importLibrary("places");
      state.placesReady = true;
      setStatus("Google Places loaded. Pick a category or search any Kenyan place.");
      searchGooglePlaces(state.activeQuery);
    } catch (error) {
      console.error(error);
      setStatus("Google Places could not load. Check that the key allows Maps JavaScript API and Places API (New).");
    }
  }

  loadButton.addEventListener("click", bootPlaces);
  clearKeyButton.addEventListener("click", () => {
    localStorage.removeItem("kenyaGoogleMapsKey");
    keyInput.value = "";
    setStatus("Saved key removed from this browser.");
  });
  locateButton.addEventListener("click", requestLocation);
  resetButton.addEventListener("click", () => searchGooglePlaces("best places to visit in Kenya"));
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(searchForm).get("query");
    searchGooglePlaces(query);
  });
  categoryWrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-query]");
    if (!button) return;
    $$("[data-map-query]", categoryWrap).forEach((item) => item.classList.toggle("active", item === button));
    searchGooglePlaces(button.dataset.mapQuery);
  });
  results.addEventListener("click", (event) => {
    const item = event.target.closest("[data-place-index]");
    if (!item) return;
    selectPlace(Number(item.dataset.placeIndex));
  });
  gallery.addEventListener("click", (event) => {
    const item = event.target.closest("[data-place-index]");
    if (!item) return;
    selectPlace(Number(item.dataset.placeIndex));
  });

  state.places = kenyaSeedDestinations;
  renderResults(state.places);
  renderGallery(state.places);
  setStatus("Curated Kenya destination images are ready. Load places for live Google results.");

  if (savedKey) bootPlaces();
}

function initOriginalDecor() {
  if (!matchMedia("(pointer: fine)").matches) return;

  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.innerHTML = `
    <img src="assets/kenya-shield-cursor.svg" alt="">
  `;
  document.body.appendChild(cursor);

  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button, input, select, textarea, .feature-card, .catalog-card, .story-row, .bracelet-container")) {
      cursor.classList.add("hovered");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button, input, select, textarea, .feature-card, .catalog-card, .story-row, .bracelet-container")) {
      cursor.classList.remove("hovered");
    }
  });
}

function initSharedArtifacts() {
  if (!$(".grain")) {
    const grain = document.createElement("div");
    grain.className = "grain";
    document.body.appendChild(grain);
  }

  if (!$(".bracelet-container")) {
    const bracelet = document.createElement("div");
    bracelet.className = "bracelet-container";
    bracelet.title = "Maasai Beaded Bracelet";
    bracelet.innerHTML = `
      <img class="bracelet-img" src="assets/maasai-bracelet.png" alt="Maasai Beaded Bracelet" draggable="false">
    `;
    bracelet.addEventListener("click", () => showToast("Maasai beadwork energy activated."));
    const nav = document.querySelector("nav");
    if (nav) {
      nav.after(bracelet);
    } else {
      document.body.appendChild(bracelet);
    }
  }

  $$("h1").forEach((heading) => {
    if (!heading.dataset.text) heading.dataset.text = heading.textContent.trim();
  });
}

function initSharedPlayerShell() {
  if ($(".player")) return;

  const player = document.createElement("aside");
  player.className = "player collapsed";
  player.setAttribute("aria-label", "Audio preview player");
  player.innerHTML = `
    <div class="player-head">
      <div>
        <span class="font-mono" data-track-title>Loading</span>
        <small data-track-detail></small>
      </div>
      <div class="bars"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="player-body">
      <div class="progress"><span data-progress></span></div>
      <div class="player-controls">
        <button class="icon-btn" type="button" data-player-prev>Prev</button>
        <button class="icon-btn" type="button" data-player-play>Play</button>
        <button class="icon-btn" type="button" data-player-next>Next</button>
      </div>
      <div class="playlist" data-playlist></div>
      <p class="lede" style="font-size:.9rem">Audio keeps playing while you switch pages inside the site.</p>
    </div>
  `;
  document.body.appendChild(player);
}

function initPageFeatures() {
  initNav();
  initFilters();
  initRecipes();
  initPlanner();
  initContact();
  initKenyaMapExplorer();
  initSharedArtifacts();
}

function getPageName(url = location.href) {
  return new URL(url, location.href).pathname.split("/").pop() || "index.html";
}

function setActiveNav(pageName) {
  $$("nav .hidden a[href$='.html']").forEach((link) => {
    link.classList.toggle("text-red-500", link.getAttribute("href") === pageName);
  });
}

async function softNavigate(url, push = true) {
  const nextUrl = new URL(url, location.href);
  const response = await fetch(nextUrl.href);
  if (!response.ok) throw new Error(`Could not load ${nextUrl.pathname}`);

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nextNav = doc.querySelector("nav");
  const nextMain = doc.querySelector("main");
  if (!nextNav || !nextMain) {
    location.href = nextUrl.href;
    return;
  }

  document.title = doc.title;
  document.querySelector("nav")?.replaceWith(nextNav);
  document.querySelector("main")?.replaceWith(nextMain);
  document.querySelector(".recipe-modal")?.remove();
  const nextModal = doc.querySelector(".recipe-modal");
  if (nextModal) document.body.insertBefore(nextModal, $("script[src='app.js']") || null);

  if (push) history.pushState({ soft: true }, "", nextUrl.href);
  initPageFeatures();
  setActiveNav(getPageName(nextUrl.href));

  const hashTarget = nextUrl.hash ? $(nextUrl.hash) : null;
  if (hashTarget) hashTarget.scrollIntoView();
  else window.scrollTo(0, 0);
}

function initSoftNavigation() {
  if (window.__softNavigationReady) return;
  window.__softNavigationReady = true;

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith(".html")) return;

    event.preventDefault();
    try {
      await softNavigate(url.href);
    } catch (error) {
      console.error(error);
      location.href = url.href;
    }
  });

  window.addEventListener("popstate", () => {
    softNavigate(location.href, false).catch(() => location.reload());
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSharedArtifacts();
  initSharedPlayerShell();
  initOriginalDecor();
  initPlayer();
  initSoftNavigation();
  initPageFeatures();
  setActiveNav(getPageName());
});
