monaco.editor.create(document.getElementById("editor"), {
	value: "function hello() {\n\talert('Hello world!');\n}",
	language: "javascript"
});

fetch('https://cdn.jsdelivr.net/npm/monaco-themes@0.3.3/themes/Monokai.json')
  .then(data => data.json())
  .then(data => {
    monaco.editor.defineTheme('monokai', data);
    monaco.editor.setTheme('monokai');
  })