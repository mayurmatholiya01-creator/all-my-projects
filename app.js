// app.js - (root folder)
window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    registerSW();
});

async function fetchProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        const projectListContainer = document.getElementById('project-list');
        
        projectListContainer.innerHTML = ''; // Clear existing
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            // SVG आइकॉन, टाइटल, विवरण और लिंक जोड़ें
            projectCard.innerHTML = `
                <div class="card-icon">${project.icon}</div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.liveUrl}">Launch Tool &rarr;</a>
            `;
            
            projectListContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('project-list').innerHTML = "<p>Projects failed to load.</p>";
    }
}

// Service Worker को रजिस्टर करें
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!', reg))
            .catch(err => console.error('Service Worker Registration Failed!', err));
    }
}
