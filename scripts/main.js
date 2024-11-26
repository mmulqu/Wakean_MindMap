// scripts/main.js

window.addEventListener('load', async () => {
    // Verify libraries are loaded
    if (!window.markmap) {
        console.error('Markmap library not loaded');
        return;
    }

    // Get required components from markmap
    const { Transformer } = window.markmap;
    const { Markmap } = window.markmap;
    const transformer = new Transformer();

    // Load index data first
    let indexData;
    try {
        const response = await fetch('data/index.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        indexData = await response.json();
    } catch (error) {
        console.error('Error loading index:', error);
        return;
    }

    async function loadChapter(chapterId) {
        try {
            const response = await fetch(`content/chapters/chapter${chapterId}.txt`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const text = await response.text();

            // Get chapter data from index
            const chapterData = indexData.chapters.find(ch => ch.id === parseInt(chapterId));
            if (!chapterData) throw new Error(`Chapter ${chapterId} not found in index`);

            // Process text with keywords
            let processedText = text;
            for (const [keyword, data] of Object.entries(chapterData.keywords)) {
                const regex = new RegExp(keyword, 'gi');
                processedText = processedText.replace(regex, 
                    `<a href="#" class="markmap-link" data-markmap="${data.markmapFile}">${keyword}</a>`
                );
            }

            // Update the content
            document.getElementById('text-content').innerHTML = processedText;

            // Add click handlers to markmap links
            document.querySelectorAll('.markmap-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderMarkmap(e.target.getAttribute('data-markmap'));
                });
            });
        } catch (error) {
            console.error('Error loading chapter:', error);
            document.getElementById('text-content').innerHTML = `Error: ${error.message}`;
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