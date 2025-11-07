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

            projectCard.innerHTML = `
                <h2>${project.title}</h2>
                <p>${project.description}</p>
                <a href="${project.liveUrl}">प्रोजेक्ट खोलें</a>
            `;

            projectListContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('project-list').innerHTML = "<p>प्रोजेक्ट्स लोड करने में विफल।</p>";
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
