// scripts/main.js

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Markmap
    const { markmap } = window;
    if (!markmap) {
        console.error('Markmap library not loaded');
        return;
    }
    const { Markmap } = markmap;
    const { transform } = markmap;

    // Load index data
    let indexData;
    try {
        const response = await fetch('data/index.json');
        indexData = await response.json();
    } catch (error) {
        console.error('Error loading index:', error);
        return;
    }

    // Function to load chapter content
    async function loadChapter(chapterId) {
        try {
            const response = await fetch(`content/chapters/chapter${chapterId}.txt`);
            const text = await response.text();
            const processedText = processText(text, indexData.chapters[chapterId - 1].keywords);
            document.getElementById('text-content').innerHTML = processedText;
        } catch (error) {
            console.error('Error loading chapter:', error);
        }
    }

    // Process text and add links
    function processText(text, keywords) {
        let processedText = text;
        for (const [keyword, data] of Object.entries(keywords)) {
            const regex = new RegExp(keyword, 'gi');
            processedText = processedText.replace(regex, 
                `<a href="#" class="markmap-link" data-markmap="${data.file}">${keyword}</a>`
            );
        }
        return processedText;
    }

    // Handle markmap rendering
    async function renderMarkmap(markmapFile) {
        try {
            document.getElementById('loading').style.display = 'block';
            
            const response = await fetch(`content/markmaps/${markmapFile}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const markdown = await response.text();
            
            const { root } = transform(markdown);
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

    // Add event listeners
    document.getElementById('chapter-select').addEventListener('change', (e) => {
        loadChapter(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('markmap-link')) {
            e.preventDefault();
            const markmapFile = e.target.getAttribute('data-markmap');
            renderMarkmap(markmapFile);
        }
    });

    // Load initial chapter
    loadChapter(1);
});
