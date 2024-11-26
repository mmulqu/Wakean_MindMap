// scripts/main.js

window.addEventListener('load', async () => {
    if (!window.markmap) {
        console.error('Markmap library not loaded');
        return;
    }

    const { Transformer } = window.markmap;
    const { Markmap } = window.markmap;
    const transformer = new Transformer();

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
            
            const chapterData = indexData.chapters.find(ch => ch.id === parseInt(chapterId));
            if (!chapterData) throw new Error(`Chapter ${chapterId} not found in index`);

            let processedText = text;
            for (const [keyword, data] of Object.entries(chapterData.keywords)) {
                const keywordRegex = new RegExp(
                    keyword.replace(/\s+/g, '\\s+'),
                    'gi'
                );
                
                // Explicitly include the chapter folder in the data-markmap attribute
                const markmapPath = `ch${chapterId}/${data.markmapFile}`;
                console.log('Creating link with path:', markmapPath);
                
                const replacement = `<a href="#" class="markmap-link" data-markmap="${markmapPath}">${keyword}</a>`;
                processedText = processedText.replace(keywordRegex, replacement);
            }

            document.getElementById('text-content').innerHTML = processedText;

            // Log all created links for debugging
            document.querySelectorAll('.markmap-link').forEach(link => {
                console.log('Created link with data-markmap:', link.getAttribute('data-markmap'));
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mapFile = e.target.getAttribute('data-markmap');
                    console.log('Markmap link clicked, loading:', mapFile);
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
            
            // Ensure we're using the chapter-specific path
            const fullPath = `content/markmaps/${markmapFile}`;
            console.log('Attempting to load markmap from:', fullPath);

            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const markdown = await response.text();
            console.log('Successfully loaded markdown content');

            const { root } = transformer.transform(markdown);
            
            const svg = document.getElementById('markmap');
            svg.innerHTML = '';
            
            Markmap.create(svg, {
                autoFit: true,
                duration: 500,
            }, root);

        } catch (error) {
            console.error('Error loading markmap:', error);
            const svg = document.getElementById('markmap');
            svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error: ${error.message}</text>`;
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    document.getElementById('chapter-select').addEventListener('change', (e) => {
        loadChapter(e.target.value);
    });

    loadChapter(1);
});