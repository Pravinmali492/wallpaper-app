const ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"; 

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Fetch photos from Unsplash
async function fetchWallpapers(query) {
  gallery.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Loading wallpapers...</p>";

  const url = `https://api.unsplash.com/search/photos?page=1&per_page=20&query=${query}&client_id=${ACCESS_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length === 0) {
      gallery.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No wallpapers found.</p>";
      return;
    }

    renderGallery(data.results);
  } catch (error) {
    console.error("Error fetching images:", error);
    gallery.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Failed to load wallpapers. Please check your API key.</p>";
  }
}

// Render cards dynamically
function renderGallery(photos) {
  gallery.innerHTML = "";

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Use full/raw resolution URL for actual downloading
    const downloadUrl = photo.urls.full;
    const previewUrl = photo.urls.regular;

    card.innerHTML = `
      <img src="${previewUrl}" alt="${photo.alt_description || 'Wallpaper'}" loading="lazy">
      <div class="card-info">
        <span class="photographer">By ${photo.user.name}</span>
        <button class="download-btn" onclick="downloadImage('${downloadUrl}', '${photo.id}')">
          Download
        </button>
      </div>
    `;

    gallery.appendChild(card);
  });
}

// Convert image to Blob for direct download without CORS redirect
async function downloadImage(imageSrc, id) {
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `wallpaper-${id}.jpg`;
    document.body.appendChild(link);
    link.click();

    // Cleanup memory
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: Open image in new tab if direct fetch is blocked
    window.open(imageSrc, "_blank");
  }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchWallpapers(query);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchWallpapers(query);
  }
});

// Initial Load
fetchWallpapers("nature");
