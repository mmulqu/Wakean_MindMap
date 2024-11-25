// scripts/main.js

document.getElementById('render-btn').addEventListener('click', () => {
  const markdown = document.getElementById('markdown-input').value;
  renderMarkmap(markdown);
});

document.querySelectorAll('.markmap-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const markmapFile = e.target.getAttribute('data-markmap');
    
    fetch(`markmaps/${markmapFile}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(markdown => {
        document.getElementById('markdown-input').value = markdown;
        renderMarkmap(markdown);
      })
      .catch(error => console.error('Error loading Markmap:', error));
  });
});

function renderMarkmap(markdown) {
  const { markmap } = window.markmap;
  const svg = document.getElementById('markmap');
  
  try {
    // Transform markdown to markmap data
    const { root } = markmap.transformer.transform(markdown);

    // Create a Markmap instance with some default options
    markmap.Markmap.create(svg, {
      autoFit: true, // Automatically fit the content
      duration: 500, // Animation duration
      maxWidth: 300, // Maximum node width
    }, root);
  } catch (error) {
    console.error('Error rendering markmap:', error);
    svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error rendering markmap: ${error.message}</text>`;
  }
}

// Add this function to load text content
function loadTextContent() {
  // Add console.log to debug
  console.log('Loading text content...');
  
  // Use the full GitHub Pages URL path
  const repoName = 'Wakean_MindMap'; // Change this to match your repo name
  const contentPath = `/${repoName}/content/chapter1.txt`;
  
  console.log('Fetching from:', contentPath);
  
  fetch(contentPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      console.log('Text loaded:', text.substring(0, 50) + '...'); // Log first 50 chars
      const textContent = document.getElementById('text-content');
      const formattedText = formatTextWithLinks(text);
      textContent.innerHTML = formattedText;
      
      initializeMarkmapLinks();
    })
    .catch(error => {
      console.error('Error loading text:', error);
      // Show error in the text panel
      const textContent = document.getElementById('text-content');
      textContent.innerHTML = `<p style="color: red;">Error loading text: ${error.message}</p>`;
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', loadTextContent);

// Add this function to format text with markmap links
function formatTextWithLinks(text) {
  // First, normalize the text by replacing line breaks with spaces
  let normalizedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  
  // Define the phrases that should be linked to markmaps
  const markmapLinks = {
    'swerve of shore': 'swerve-of-shore.md',
    'bend of bay': 'bend-of-bay.md',
    'Howth Castle': 'howth-castle.md'
  };

  // Replace phrases with links
  let formattedText = normalizedText;
  for (const [phrase, filename] of Object.entries(markmapLinks)) {
    const link = `<a href="#" class="markmap-link" data-markmap="${filename}">${phrase}</a>`;
    // Use case-insensitive regular expression to match phrases
    const regex = new RegExp(phrase, 'gi');
    formattedText = formattedText.replace(regex, link);
  }

  // Split into paragraphs and wrap in <p> tags
  return formattedText
    .split('\n\n')
    .map(para => `<p>${para}</p>`)
    .join('');
}

// Add this function to initialize markmap links
function initializeMarkmapLinks() {
  document.querySelectorAll('.markmap-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const markmapFile = e.target.getAttribute('data-markmap');
      
      // Show loading indicator
      const loading = document.getElementById('loading');
      loading.style.display = 'block';
      
      fetch(`markmaps/${markmapFile}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then(markdown => {
          // Hide loading indicator
          loading.style.display = 'none';
          // Clear any previous content
          const svg = document.getElementById('markmap');
          svg.innerHTML = '';
          // Render the new markmap
          renderMarkmap(markdown);
        })
        .catch(error => {
          console.error('Error loading Markmap:', error);
          loading.style.display = 'none';
          // Show error message in the markmap panel
          const svg = document.getElementById('markmap');
          svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error loading markmap: ${error.message}</text>`;
        });
    });
  });
}