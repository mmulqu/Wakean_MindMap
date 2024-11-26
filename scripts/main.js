// scripts/main.js

window.addEventListener('load', async () => {
    if (!window.markmap) {
        console.error('Markmap library not loaded');
        return;
    }

    const { Transformer } = window.markmap;
    const { Markmap } = window.markmap;
    const transformer = new Transformer();

    // Load index data
    let indexData;
    try {
        const response = await fetch('data/index.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        indexData = await response.json();
        console.log('Successfully loaded index data:', indexData);
    } catch (error) {
        console.error('Error loading index:', error);
        return;
    }

    async function loadChapter(chapterId) {
        try {
            const response = await fetch(`content/chapters/chapter${chapterId}.txt`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            let text = await response.text();
            
            // Get chapter data from index
            const chapterData = indexData.chapters.find(ch => ch.id === parseInt(chapterId));
            if (!chapterData) throw new Error(`Chapter ${chapterId} not found in index`);

            // Process text with keywords
            let processedText = text;
            for (const [keyword, data] of Object.entries(chapterData.keywords)) {
                console.log(`Processing keyword: "${keyword}"`);
                // Create a regex that matches the keyword even with line breaks
                const keywordRegex = new RegExp(
                    keyword.replace(/\s+/g, '\\s+'),
                    'gi'
                );
                // Add chapter folder to the markmap path
                const markmapPath = `ch${chapterId}/${data.markmapFile}`;
                const replacement = `<a href="#" class="markmap-link" data-markmap="${markmapPath}">${keyword}</a>`;
                processedText = processedText.replace(keywordRegex, replacement);
            }

            // Update the content
            document.getElementById('text-content').innerHTML = processedText;

            // Add click handlers to markmap links
            document.querySelectorAll('.markmap-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mapFile = e.target.getAttribute('data-markmap');
                    console.log('Markmap link clicked:', mapFile);
                    renderMarkmap(mapFile);
                });
            });
        } catch (error) {
            console.error('Error loading chapter:', error);
            document.getElementById('text-content').innerHTML = `Error: ${error.message}`;
        }
    }

    async function renderMarkmap(markmapFile) {
        try {
            document.getElementById('loading').style.display = 'block';
            console.log('Loading markmap from:', `content/markmaps/${markmapFile}`);

            const response = await fetch(`content/markmaps/${markmapFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const markdown = await response.text();
            console.log('Markdown content loaded successfully');

            const { root } = transformer.transform(markdown);
            
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