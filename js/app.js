/**
 * Chettinad Heritage Digital Gallery - Application Controller
 */

let currentFolderId = null;
let currentImageIndex = 0;
let currentFolderImages = [];

document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    setupKeyboard();
});

/**
 * Encodes spaces (%20) AND ampersands (%26) correctly for local paths
 * e.g. "product & dye making/C1246T01.JPG" -> "product%20%26%20dye%20making/C1246T01.JPG"
 */
function getCleanUrl(path) {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }
    // Split by slash and encode each folder/file segment individually
    return path.split('/').map(part => encodeURIComponent(part)).join('/');
}

function showMainPage() {
    document.getElementById('folderPage').classList.remove('active');
    document.getElementById('mainPage').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCards() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    GALLERY_FOLDERS.forEach(folder => {
        const coverSrc = folder.images[0] ? getCleanUrl(folder.images[0]) : '';
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openFolder(folder.id);

        card.innerHTML = `
            <div class="card-img">
                <img src="${coverSrc}" alt="${folder.title}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400/18120D/D4A359?text=${encodeURIComponent(folder.folderName)}';" loading="lazy">
            </div>
            <div class="card-info">
                <div class="card-tag">/${folder.folderName}</div>
                <h3 class="card-title">${folder.title}</h3>
                <span class="btn-link">Explore Collection (${folder.images.length} Photos) <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openFolder(folderId) {
    const folder = GALLERY_FOLDERS.find(f => f.id === folderId);
    if (!folder) return;

    currentFolderId = folderId;
    currentFolderImages = folder.images;

    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('folderPage').classList.add('active');
    
    document.getElementById('folderTitle').textContent = folder.title;
    document.getElementById('folderBadge').textContent = `/${folder.folderName}`;

    const grid = document.getElementById('imageGrid');
    grid.innerHTML = '';

    if (folder.images.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 3rem;">No images found in folder "/${folder.folderName}".</p>`;
        return;
    }

    folder.images.forEach((imgUrl, index) => {
        const cleanUrl = getCleanUrl(imgUrl);
        const filename = imgUrl.split('/').pop();
        const item = document.createElement('div');
        item.className = 'img-item';
        item.onclick = () => openLightbox(index);

        item.innerHTML = `
            <img src="${cleanUrl}" alt="${filename}" 
                 onerror="handleImageError(this, '${imgUrl}')" loading="lazy">
            <div class="img-item-name">${filename}</div>
        `;
        grid.appendChild(item);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleImageError(imgElem, rawPath) {
    imgElem.onerror = null;
    imgElem.src = `https://via.placeholder.com/600x400/18120D/D4A359?text=Cannot+Find+Image`;
    
    const parent = imgElem.closest('.img-item');
    if (parent) {
        const nameDiv = parent.querySelector('.img-item-name');
        if (nameDiv) {
            nameDiv.innerHTML = `<span style="color:#ff6b6b; font-size:0.75rem;" title="${rawPath}"><i class="fa-solid fa-triangle-exclamation"></i> Cannot find: ${rawPath.split('/').pop()}</span>`;
        }
    }
}

function openLightbox(index) {
    if (!currentFolderImages || currentFolderImages.length === 0) return;
    currentImageIndex = index;
    
    const rawUrl = currentFolderImages[currentImageIndex];
    const cleanUrl = getCleanUrl(rawUrl);
    const filename = rawUrl.split('/').pop();

    document.getElementById('lightboxImg').src = cleanUrl;
    document.getElementById('lightboxCaption').textContent = filename;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(dir) {
    if (!currentFolderImages || currentFolderImages.length === 0) return;
    currentImageIndex = (currentImageIndex + dir + currentFolderImages.length) % currentFolderImages.length;
    openLightbox(currentImageIndex);
}

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}