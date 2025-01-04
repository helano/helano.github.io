let nextPageToken = '';
let prevPageToken = '';
let currentQuery = '';
let currentType = '';

async function performSearch(type, pageToken = '') {
  const query = document.getElementById('search-bar').value.trim();
  const apiKey = document.getElementById('api-key').value.trim();

  if (!query) {
    alert('Please enter a search term!');
    return;
  }

  if (!apiKey) {
    alert('Please enter your API key!');
    return;
  }

  currentQuery = query;
  currentType = type;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=${type}&key=${apiKey}&pageToken=${pageToken}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch results.');

    const data = await response.json();
    nextPageToken = data.nextPageToken || '';
    prevPageToken = data.prevPageToken || '';
    displayResults(data.items, type);
    displayPagination();
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again later.');
  }
}

function displayResults(results, type) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  results.forEach(item => {
    const snippet = item.snippet;
    let link, title, id;

    if (type === 'video') {
      id = item.id.videoId;
      link = `https://www.youtube.com/watch?v=${id}`;
      title = snippet.title;
    } else if (type === 'channel') {
      id = item.id.channelId;
      link = `https://www.youtube.com/channel/${id}`;
      title = snippet.channelTitle;
    } else if (type === 'playlist') {
      id = item.id.playlistId;
      link = `https://www.youtube.com/playlist?list=${id}`;
      title = snippet.title;
    }

    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result', 'd-flex', 'align-items-start');
    resultDiv.innerHTML = `
    <a onclick="${type === 'channel' ? `window.open('${link}', '_blank')` : `playContent('${id}', '${type}')`}">
      <img src="${snippet.thumbnails.default.url}" alt="Thumbnail" class="me-3" width="120">
      <div>
        <h3><a onclick="${type === 'channel' ? `window.open('${link}', '_blank')` : `playContent('${id}', '${type}')`}">${title}</h3>
        <p>${snippet.description}</p>
      </div>
    `;

    resultsContainer.appendChild(resultDiv);
  });
}

function displayPagination() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  if (prevPageToken) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'btn btn-secondary mx-1';
    prevButton.onclick = () => performSearch(currentType, prevPageToken);
    paginationContainer.appendChild(prevButton);
  }

  if (nextPageToken) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'btn btn-secondary mx-1';
    nextButton.onclick = () => performSearch(currentType, nextPageToken);
    paginationContainer.appendChild(nextButton);
  }
}

function playContent(id, type) {
  const player = document.getElementById('player');
  const playerIframe = document.getElementById('player-iframe');

  if (type === 'video') {
    playerIframe.src = `https://www.youtube.com/embed/${id}`;
  } else if (type === 'playlist') {
    playerIframe.src = `https://www.youtube.com/embed/videoseries?list=${id}`;
  } else {
    alert('Cannot play this content type.');
    return;
  }

  player.style.display = 'block';
  window.scrollTo(0,0)
}

// Toggle between light and dark mode
const themeToggleButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('.navbar').classList.toggle('dark-mode');

  // Toggle the icon
  if (document.body.classList.contains('dark-mode')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }

  // Save theme preference to localStorage
  const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

// Load saved theme preference
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelector('.navbar').classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
});
