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

    async function loadChapter(chapterId) {
        try {
            const response = await fetch(`content/chapters/chapter${chapterId}.txt`);
            const text = await response.text();
            document.getElementById('text-content').innerHTML = text;
            
            // Add click handlers to any markmap links
            document.querySelectorAll('.markmap-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderMarkmap(e.target.getAttribute('data-markmap'));
                });
            });
        } catch (error) {
            console.error('Error loading chapter:', error);
        }
    }

    async function renderMarkmap(markmapFile) {
        try {
            // Show loading
            document.getElementById('loading').style.display = 'block';

            // 1. Fetch markdown content
            const response = await fetch(`content/markmaps/${markmapFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const markdown = await response.text();

            // 2. Transform markdown to markmap data
            const { root } = transformer.transform(markdown);

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

    // Add event listener for chapter selection
    document.getElementById('chapter-select').addEventListener('change', (e) => {
        loadChapter(e.target.value);
    });

    // Initial load of chapter 1
    loadChapter(1);
});