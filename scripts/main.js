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
  
  // Clear previous markmap
  svg.innerHTML = '';

  // Transform markdown to markmap data
  const { root } = markmap.transformer.transform(markdown);

  // Create a Markmap instance
  markmap.Markmap.create(svg, null, root);
}

// Add this function to load text content
function loadTextContent() {
  fetch('content/chapter1.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const textContent = document.getElementById('text-content');
      // Split text into paragraphs and add markmap links
      const formattedText = formatTextWithLinks(text);
      textContent.innerHTML = formattedText;
      
      // Reinitialize markmap links
      initializeMarkmapLinks();
    })
    .catch(error => console.error('Error loading text:', error));
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', loadTextContent);

// Add this function to format text with markmap links
function formatTextWithLinks(text) {
  // Define the phrases that should be linked to markmaps
  const markmapLinks = {
    'swerve of shore': 'swerve-of-shore.md',
    'bend of bay': 'bend-of-bay.md',
    'Howth Castle': 'howth-castle.md'
  };

  // Replace phrases with links
  let formattedText = text;
  for (const [phrase, filename] of Object.entries(markmapLinks)) {
    const link = `<a href="#" class="markmap-link" data-markmap="${filename}">${phrase}</a>`;
    formattedText = formattedText.replace(phrase, link);
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
      
      fetch(`markmaps/${markmapFile}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then(markdown => {
          renderMarkmap(markdown);
        })
        .catch(error => console.error('Error loading Markmap:', error));
    });
  });
}