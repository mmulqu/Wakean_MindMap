// scripts/main.js

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for markmap to be available
    const waitForMarkmap = () => {
        return new Promise((resolve) => {
            const check = () => {
                if (window.markmap) {
                    resolve(window.markmap);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    };

    // Initialize Markmap
    const markmap = await waitForMarkmap();
    const { Markmap, Transformer } = markmap;
    const transformer = new Transformer();

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
        const loadingEl = document.getElementById('loading');
        const svgEl = document.getElementById('markmap');
        
        try {
            loadingEl.style.display = 'block';
            
            // Fetch and transform markdown
            const response = await fetch(`content/markmaps/${markmapFile}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const markdown = await response.text();
            
            // Clear existing content
            svgEl.innerHTML = '';
            
            // Transform markdown and create markmap
            const { root } = transformer.transform(markdown);
            const mm = Markmap.create(svgEl, {
                autoFit: true,
                duration: 500,
                maxWidth: 800,
            }, root);
            
            // Force layout recalculation
            setTimeout(() => mm.fit(), 100);
            
        } catch (error) {
            console.error('Error:', error);
            svgEl.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red">Error: ${error.message}</text>`;
        } finally {
            loadingEl.style.display = 'none';
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

    // Handle window resize
    window.addEventListener('resize', () => {
        const svgEl = document.getElementById('markmap');
        const mm = Markmap.find(svgEl);
        if (mm) {
            mm.fit();
        }
    });

    // Load initial chapter
    loadChapter(1);
});