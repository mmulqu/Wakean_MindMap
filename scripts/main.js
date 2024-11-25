// scripts/main.js

window.addEventListener('load', () => {
    // Verify libraries are loaded
    if (!window.markmap) {
        console.error('Markmap library not loaded');
        return;
    }

    // Get required components from markmap
    const { Transformer } = window.markmap;
    const { Markmap } = window.markmap;
    const transformer = new Transformer();

    async function renderMarkmap(markmapFile) {
        try {
            // Show loading
            document.getElementById('loading').style.display = 'block';

            // 1. Fetch markdown content
            console.log('Fetching:', `markmaps/${markmapFile}`); // Debug log
            const response = await fetch(`markmaps/${markmapFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const markdown = await response.text();
            console.log('Markdown content:', markdown); // Debug log

            // 2. Transform markdown to markmap data
            const { root, features } = transformer.transform(markdown);
            console.log('Transformed data:', root); // Debug log

            // 3. Clear and render markmap
            const svg = document.getElementById('markmap');
            svg.innerHTML = '';
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
    }

    // Add click handlers
    document.querySelectorAll('.markmap-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Link clicked:', e.target.getAttribute('data-markmap')); // Debug log
            renderMarkmap(e.target.getAttribute('data-markmap'));
        });
    });
});
