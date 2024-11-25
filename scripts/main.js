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
  const svg = document.getElementById('markmap');
  svg.innerHTML = ''; // Clear existing content
  
  try {
    const { Markmap, loadCSS, loadJS } = window.markmap;
    const { root } = window.markmap.transform(markdown);
    
    // Create markmap
    Markmap.create(svg, {
      autoFit: true,
      duration: 500,
    }, root);
  } catch (error) {
    console.error('Error rendering markmap:', error);
    svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error rendering markmap: ${error.message}</text>`;
  }
}

// Initialize Markmap when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get Markmap from window object
    const { Markmap, loadCSS, loadJS } = window.markmap;
    const { transform } = window.markmap;
    
    // Initialize markmap links
    document.querySelectorAll('.markmap-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const markmapFile = e.target.getAttribute('data-markmap');
            
            try {
                // Show loading indicator
                document.getElementById('loading').style.display = 'block';
                
                // Fetch the markdown content
                const response = await fetch(`markmaps/${markmapFile}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const markdown = await response.text();
                
                // Transform markdown to markmap data
                const { root } = transform(markdown);
                
                // Clear existing content
                const svg = document.getElementById('markmap');
                svg.innerHTML = '';
                
                // Create markmap
                Markmap.create(svg, {
                    autoFit: true,
                    duration: 500,
                }, root);
                
            } catch (error) {
                console.error('Error:', error);
                const svg = document.getElementById('markmap');
                svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error: ${error.message}</text>`;
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        });
    });
});