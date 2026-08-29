const apiKey = 'YOUR_UNSPLASH_ACCESS_KEY'; 
const gallery = document.getElementById('wallpaper-gallery');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Fetch initial wallpapers on load
fetchWallpapers('wallpapers');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) fetchWallpapers(query);
});

async function fetchWallpapers(query) {
  gallery.innerHTML = '<p>Loading wallpapers...</p>';
  const url = `https://api.unsplash.com/search/photos?page=1&query=${query}&per_page=12&client_id=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayWallpapers(data.results);
  } catch (error) {
    gallery.innerHTML = '<p>Failed to load images. Check your API key.</p>';
  }
}

function displayWallpapers(images) {
  gallery.innerHTML = '';
  if (images.length === 0) {
    gallery.innerHTML = '<p>No wallpapers found.</p>';
    return;
  }

  images.forEach(img => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Using full-resolution image URL for high-quality downloads
    const downloadUrl = img.urls.full;

    card.innerHTML = `
      <img src="${img.urls.small}" alt="${img.alt_description || 'Wallpaper'}">
      <button class="download-btn" onclick="downloadImage('${downloadUrl}', 'wallpaper-${img.id}.jpg')">Download</button>
    `;

    gallery.appendChild(card);
  });
}

// Function to handle blob downloading to avoid CORS issues
async function downloadImage(imageSrc, name) {
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
