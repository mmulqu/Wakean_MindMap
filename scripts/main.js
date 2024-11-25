// scripts/main.js

// Wait for page load
window.addEventListener('load', () => {
    // Get Markmap components from window object
    const { Transformer } = window.markmap;
    const { Markmap, loadCSS, loadJS } = window.markmap;
    
    // Create transformer instance
    const transformer = new Transformer();
    
    // Get SVG element
    const svg = document.getElementById('markmap');
    
    // Function to render markmap
    async function renderMarkmap(markmapFile) {
        try {
            // Show loading
            document.getElementById('loading').style.display = 'block';
            
            // Fetch markdown
            const response = await fetch(`markmaps/${markmapFile}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const markdown = await response.text();
            
            // Transform markdown
            const { root, features } = transformer.transform(markdown);
            
            // Load assets if needed
            const assets = transformer.getUsedAssets(features);
            if (assets.styles) loadCSS(assets.styles);
            if (assets.scripts) loadJS(assets.scripts, { getMarkmap: () => window.markmap });
            
            // Clear and create markmap
            svg.innerHTML = '';
            Markmap.create(svg, {
                autoFit: true,
                duration: 500,
                zoom: true,
                pan: true,
                color: d3.schemeCategory10
            }, root);
            
        } catch (error) {
            console.error('Error:', error);
            svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error: ${error.message}</text>`;
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }
    
    // Add click handlers to links
    document.querySelectorAll('.markmap-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const markmapFile = e.target.getAttribute('data-markmap');
            renderMarkmap(markmapFile);
        });
    });
    
    // Load initial markmap
    renderMarkmap('howth-castle.md');
});