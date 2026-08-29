// Unsplash Demo API Key (Use demo access key or replace with your own)
const ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with key or fetch demo fallback
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categories = document.getElementById('categories');
const loader = document.getElementById('loader');
const favCountEl = document.getElementById('favCount');
const favTabBtn = document.getElementById('favTabBtn');

// Modal Elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalAuthor = document.getElementById('modalAuthor');
const modalFavBtn = document.getElementById('modalFavBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const closeModal = document.getElementById('closeModal');

let favorites = JSON.parse(localStorage.getItem('pixelVault_favs')) || [];
let activeWallpaper = null;
let showingFavorites = false;

// Update Favorites Counter UI
function updateFavCounter() {
    favCountEl.textContent = favorites.length;
}
updateFavCounter();

// Fetch Images from Unsplash API
async function fetchWallpapers(query = 'popular') {
    showingFavorites = false;
    loader.classList.remove('hidden');
    gallery.innerHTML = '';
    
    // Fallback Mock Data if no API Key provided
    if (ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
        renderMockData(query);
        loader.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}`,{
        headers:{Authorization:`Client-ID${ACCESS_KEY}`}
    });
        const data = await response.json();
        renderGallery(data.results.map(img => ({
            id: img.id,
            url: img.urls.regular,
            downloadUrl: img.urls.full,
            author: img.user.name
        })));
    } catch (error) {
        console.error("API Error, loading fallback data", error);
        renderMockData(query);
    } finally {
        loader.classList.add('hidden');
    }
}

// Render Gallery Cards
function renderGallery(images) {
    gallery.innerHTML = '';
    images.forEach(img => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<img src="${img.url}" alt="Wallpaper" loading="lazy">`;
        card.addEventListener('click', () => openModal(img));
        gallery.appendChild(card);
    });
}

// Fallback Mock Data Generator
function renderMockData(tag) {
    const mockImages = Array.from({ length: 9 }).map((_, i) => ({
        id: `mock-${i}-${tag}`,
        url: `https://picsum.photos/600/900?random=${i + Math.floor(Math.random() * 100)}`,
        downloadUrl: `https://picsum.photos/1080/1920?random=${i}`,
        author: `Artist ${i + 1} (${tag})`
    }));
    renderGallery(mockImages);
}

// Open Image Preview Modal
function openModal(item) {
    activeWallpaper = item;
    modalImg.src = item.url;
    modalAuthor.textContent = `Photo by ${item.author}`;
    
    const isFav = favorites.some(fav => fav.id === item.id);
    modalFavBtn.textContent = isFav ? '❤️ Saved' : '🤍 Save';
    
    modal.classList.remove('hidden');
}

// Close Modal Event
closeModal.addEventListener('click', () =>{
    modal.classList.add('hidden');
    activeWallpaper=null;
});

// Handle Image Download via JavaScript Blob
modalDownloadBtn.addEventListener('click', async () => {
    if (!activeWallpaper) return;
    try {
        const response = await fetch(activeWallpaper.downloadUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `wallpaper-${activeWallpaper.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Downloading image... (Right-click preview to save if direct download fails)");
        window.open(activeWallpaper.downloadUrl,'_blank');
    }
});

// Toggle Favorite State with LocalStorage
modalFavBtn.addEventListener('click', () => {
    if (!activeWallpaper) return;
    const index = favorites.findIndex(fav => fav.id === activeWallpaper.id);
    
    if (index === -1) {
        favorites.push(activeWallpaper);
        modalFavBtn.textContent = '❤️ Saved';
    } else {
        favorites.splice(index, 1);
        modalFavBtn.textContent = '🤍 Save';
    }
    
    localStorage.setItem('pixelVault_favs', JSON.stringify(favorites));
    updateFavCounter();
    if (showingFavorites) renderGallery(favorites);
});

// Category Chip Selection
categories.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        fetchWallpapers(e.target.dataset.query);
    }
});

// Search functionality
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) fetchWallpapers(query);
});

// Show Saved Favorites View
favTabBtn.addEventListener('click', () => {
    showingFavorites = true;
    renderGallery(favorites);
});

// Initial Load
fetchWallpapers('popular');
