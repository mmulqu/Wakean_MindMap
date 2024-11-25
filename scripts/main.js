// scripts/main.js

document.getElementById('render-btn').addEventListener('click', () => {
    const markdown = document.getElementById('markdown-input').value;
    const { markmap } = window.markmap;
    const svg = document.getElementById('markmap');
    
    // Clear previous markmap
    svg.innerHTML = '';
  
    // Create a Markmap instance
    markmap.Markmap.create(svg, null, window.markmap.transformer.transform(markdown));
  });