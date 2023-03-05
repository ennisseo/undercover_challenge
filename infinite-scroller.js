const scrollContainer = document.querySelector('.scroll-container');

async function createImage(url, albumName) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Cover of the album ${albumName}`;
    return img;
}


async function loadPlaylist() {
    const token = await APIController.getToken();
    const response = await APIController.getPlaylist(token, '6VOUcjNtXUzH8ntKNbOI1R');
    const tracks = response.items;
    const images = tracks.map(track => ({ url: track.track.album.images[0].url, altText: track.track.album.name }));
    const imgElements = await Promise.all(images.map(image => createImage(image.url, image.altText)));

    // Create the image wrapper elements
    const imgWrapper = document.createElement('div');
    const imgWrapperClone = document.createElement('div');
    imgWrapper.classList.add('img-wrapper');
    imgWrapperClone.classList.add('img-wrapper');

    // Append the images to the first wrapper
    imgElements.forEach(img => {
        imgWrapper.appendChild(img);
    });

    // Clone the images and append to the second wrapper
    const clonedImages = imgElements.map(img => img.cloneNode(true));
    clonedImages.forEach(clonedImg => {
        imgWrapperClone.appendChild(clonedImg);
    });

    // Append both wrappers to the container
    const container = document.querySelector('.scroll-container');
    container.appendChild(imgWrapper);
    container.appendChild(imgWrapperClone);

    // Set the wrapper width to fit all the images
    container.style.width = `${imgElements.length * 100}px`;
}

loadPlaylist();