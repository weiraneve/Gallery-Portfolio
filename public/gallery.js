document.addEventListener('DOMContentLoaded', () => {
    const galleryElement = document.getElementById('gallery');
    const columns = 3;
    const columnElements = [];
    const loadMoreButton = document.getElementById('load-more');
    let imageUrls = [];
    let currentIndex = 0;
    const imagesPerLoad = 10;
    let imagesLoadedCount = 0;

    // 创建列元素
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.classList.add('column');
        columnElements.push(column);
        galleryElement.appendChild(column);
    }

    // 从服务器获取所有图片 URL
    fetch('/images')
        .then(response => response.json())
        .then(urls => {
            imageUrls = urls;
            loadNextImages();
        })
        .catch(error => console.error('Error loading images:', error));

    // 获取最短列的索引
    function getShortestColumn() {
        let minIndex = 0;
        let minHeight = columnElements[0].offsetHeight;
        for (let i = 1; i < columnElements.length; i++) {
            if (columnElements[i].offsetHeight < minHeight) {
                minHeight = columnElements[i].offsetHeight;
                minIndex = i;
            }
        }
        return minIndex;
    }

    // 加载下一批图片
    function loadNextImages() {
        const endIndex = Math.min(currentIndex + imagesPerLoad, imageUrls.length);
        for (let i = currentIndex; i < endIndex; i++) {
            const img = document.createElement('img');
            img.src = imageUrls[i];
            img.alt = `Photo ${i + 1}`;
            img.onload = function() {
                this.classList.add('loaded'); // Add loaded class when image is loaded
                const shortestColumn = getShortestColumn();
                columnElements[shortestColumn].appendChild(img);
                imagesLoadedCount++;
                checkIfAllImagesLoaded();
            };
            img.onclick = function() {
                openModal(img.src, img.alt);
            };
            img.onerror = () => {
                console.error(`Error loading image: ${imageUrls[i]}`);
            };
        }
        currentIndex = endIndex;
        if (currentIndex >= imageUrls.length) {
            loadMoreButton.style.display = 'none';
        }
    }

    // 检查是否所有图片都加载完成
    function checkIfAllImagesLoaded() {
        const totalImagesToLoad = Math.min(currentIndex, imageUrls.length);
        if (imagesLoadedCount >= totalImagesToLoad) {
            document.querySelector('.gallery').style.opacity = '1'; // Show gallery
            document.querySelector('footer').style.opacity = '1'; // Show footer
            loadMoreButton.style.opacity = '1'; // Show load more button
        }
    }

    loadMoreButton.onclick = loadNextImages;

    // 模态窗口逻辑
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const captionText = document.getElementById('caption');
    const exifInfo = document.getElementById('exif-info');
    const span = document.getElementsByClassName('close')[0];

    function openModal(src, alt) {
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
        modalImg.src = src;
        captionText.innerHTML = alt;
        exifInfo.innerHTML = ''; // Clear previous EXIF info

        // Fetch and display EXIF data
        modalImg.onload = function() {
            EXIF.getData(modalImg, function() {
                const aperture = EXIF.getTag(this, 'FNumber');
                const exposureTime = EXIF.getTag(this, 'ExposureTime');
                const iso = EXIF.getTag(this, 'ISOSpeedRatings');

                exifInfo.innerHTML = `
                    <p>光圈: ${aperture ? `f/${aperture}` : 'N/A'}</p>
                    <p>快门: ${exposureTime ? `${exposureTime}s` : 'N/A'}</p>
                    <p>ISO: ${iso ? iso : 'N/A'}</p>
                `;
            });
        };
    }

    span.onclick = function() {
        closeModal();
    }

    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});
