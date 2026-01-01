// Engineering Insights Platform - Frontend JavaScript

const API_BASE = '/api';

// Navigation
document.getElementById('viewInsightsBtn').addEventListener('click', () => showSection('viewSection', 'viewInsightsBtn'));
document.getElementById('shareInsightBtn').addEventListener('click', () => showSection('shareSection', 'shareInsightBtn'));
document.getElementById('aboutBtn').addEventListener('click', () => showSection('aboutSection', 'aboutBtn'));

function showSection(sectionId, btnId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(btnId).classList.add('active');
}

// Load insights on page load
document.addEventListener('DOMContentLoaded', () => {
    loadInsights();
});

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        searchInsights(query);
    } else {
        loadInsights();
    }
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Load all insights
async function loadInsights() {
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '<div class="loading">Loading insights...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/insights`);
        const data = await response.json();
        
        if (data.success && data.insights.length > 0) {
            displayInsights(data.insights);
        } else {
            insightsList.innerHTML = `
                <div class="empty-state">
                    <h3>No insights yet</h3>
                    <p>Be the first to share your engineering insights!</p>
                </div>
            `;
        }
    } catch (error) {
        insightsList.innerHTML = `
            <div class="error-message show">
                Failed to load insights. Please try again later.
            </div>
        `;
        console.error('Error loading insights:', error);
    }
}

// Search insights
async function searchInsights(query) {
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/insights/search/${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.insights.length > 0) {
            displayInsights(data.insights);
        } else {
            insightsList.innerHTML = `
                <div class="empty-state">
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
        }
    } catch (error) {
        insightsList.innerHTML = `
            <div class="error-message show">
                Search failed. Please try again later.
            </div>
        `;
        console.error('Error searching insights:', error);
    }
}

// Display insights
function displayInsights(insights) {
    const insightsList = document.getElementById('insightsList');
    
    insightsList.innerHTML = insights.map(insight => {
        const date = new Date(insight.timestamp).toLocaleDateString();
        const tags = insight.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="insight-card" data-id="${insight.id}">
                <h3>${escapeHtml(insight.title)}</h3>
                <div class="insight-meta">
                    <span>👤 ${escapeHtml(insight.author)}</span>
                    <span>📅 ${date}</span>
                </div>
                ${tags ? `<div class="insight-tags">${tags}</div>` : ''}
                <div class="insight-preview">
                    <strong>Problem:</strong> ${escapeHtml(truncate(insight.problem.description, 200))}
                </div>
                <div class="insight-details" id="details-${insight.id}">
                    ${renderInsightDetails(insight)}
                </div>
                <button class="toggle-details" onclick="toggleDetails('${insight.id}')">
                    Show Details
                </button>
            </div>
        `;
    }).join('');
}

// Render full insight details
function renderInsightDetails(insight) {
    let html = '';
    
    // Context
    if (insight.context.domain || insight.context.scale || insight.context.timeframe) {
        html += '<div class="detail-section"><h4>📋 Context</h4><div class="detail-grid">';
        if (insight.context.domain) html += `<div class="detail-item"><strong>Domain:</strong> ${escapeHtml(insight.context.domain)}</div>`;
        if (insight.context.scale) html += `<div class="detail-item"><strong>Scale:</strong> ${escapeHtml(insight.context.scale)}</div>`;
        if (insight.context.timeframe) html += `<div class="detail-item"><strong>Timeframe:</strong> ${escapeHtml(insight.context.timeframe)}</div>`;
        html += '</div></div>';
    }
    
    // Problem
    html += '<div class="detail-section"><h4>❓ Problem</h4>';
    html += `<p>${escapeHtml(insight.problem.description)}</p>`;
    if (insight.problem.impact) html += `<p><strong>Impact:</strong> ${escapeHtml(insight.problem.impact)}</p>`;
    if (insight.problem.constraints.length > 0) {
        html += '<p><strong>Constraints:</strong></p><ul>';
        insight.problem.constraints.forEach(c => html += `<li>${escapeHtml(c)}</li>`);
        html += '</ul>';
    }
    html += '</div>';
    
    // Approach
    if (insight.approach.chosen || insight.approach.alternatives.length > 0) {
        html += '<div class="detail-section"><h4>💡 Approach</h4>';
        if (insight.approach.alternatives.length > 0) {
            html += '<p><strong>Alternatives Considered:</strong></p><ul>';
            insight.approach.alternatives.forEach(a => html += `<li>${escapeHtml(a)}</li>`);
            html += '</ul>';
        }
        if (insight.approach.chosen) html += `<p><strong>Chosen:</strong> ${escapeHtml(insight.approach.chosen)}</p>`;
        if (insight.approach.tradeoffs.length > 0) {
            html += '<p><strong>Trade-offs:</strong></p><ul>';
            insight.approach.tradeoffs.forEach(t => html += `<li>${escapeHtml(t)}</li>`);
            html += '</ul>';
        }
        if (insight.approach.reasoning) html += `<p><strong>Reasoning:</strong> ${escapeHtml(insight.approach.reasoning)}</p>`;
        html += '</div>';
    }
    
    // Outcome
    if (insight.outcome.results || insight.outcome.metrics.length > 0) {
        html += '<div class="detail-section"><h4>📊 Outcome</h4>';
        if (insight.outcome.results) html += `<p>${escapeHtml(insight.outcome.results)}</p>`;
        if (insight.outcome.metrics.length > 0) {
            html += '<p><strong>Metrics:</strong></p><ul>';
            insight.outcome.metrics.forEach(m => html += `<li>${escapeHtml(m)}</li>`);
            html += '</ul>';
        }
        if (insight.outcome.surprises) html += `<p><strong>Surprises:</strong> ${escapeHtml(insight.outcome.surprises)}</p>`;
        html += '</div>';
    }
    
    // Lessons
    const hasLessons = insight.lessons.whatWorked.length > 0 || 
                      insight.lessons.whatDidnt.length > 0 || 
                      insight.lessons.wouldDoDifferently.length > 0 || 
                      insight.lessons.keyTakeaways.length > 0;
    
    if (hasLessons) {
        html += '<div class="detail-section"><h4>🎓 Lessons Learned</h4>';
        if (insight.lessons.whatWorked.length > 0) {
            html += '<p><strong>What Worked:</strong></p><ul>';
            insight.lessons.whatWorked.forEach(l => html += `<li>${escapeHtml(l)}</li>`);
            html += '</ul>';
        }
        if (insight.lessons.whatDidnt.length > 0) {
            html += '<p><strong>What Didn\'t Work:</strong></p><ul>';
            insight.lessons.whatDidnt.forEach(l => html += `<li>${escapeHtml(l)}</li>`);
            html += '</ul>';
        }
        if (insight.lessons.wouldDoDifferently.length > 0) {
            html += '<p><strong>Would Do Differently:</strong></p><ul>';
            insight.lessons.wouldDoDifferently.forEach(l => html += `<li>${escapeHtml(l)}</li>`);
            html += '</ul>';
        }
        if (insight.lessons.keyTakeaways.length > 0) {
            html += '<p><strong>Key Takeaways:</strong></p><ul>';
            insight.lessons.keyTakeaways.forEach(l => html += `<li>${escapeHtml(l)}</li>`);
            html += '</ul>';
        }
        html += '</div>';
    }
    
    return html;
}

// Toggle insight details
function toggleDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const buttons = document.querySelectorAll(`[onclick="toggleDetails('${id}')"]`);
    const button = buttons[0];
    
    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        button.textContent = 'Show Details';
    } else {
        details.classList.add('expanded');
        button.textContent = 'Hide Details';
    }
}

// Form submission
document.getElementById('insightForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formErrors = document.getElementById('formErrors');
    formErrors.classList.remove('show');
    formErrors.innerHTML = '';
    
    // Collect form data
    const formData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim() || 'Anonymous',
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
        context: {
            domain: document.getElementById('domain').value.trim(),
            scale: document.getElementById('scale').value.trim(),
            timeframe: document.getElementById('timeframe').value.trim()
        },
        problem: {
            description: document.getElementById('problemDesc').value.trim(),
            impact: document.getElementById('impact').value.trim(),
            constraints: textareaToArray('constraints')
        },
        approach: {
            alternatives: textareaToArray('alternatives'),
            chosen: document.getElementById('chosen').value.trim(),
            tradeoffs: textareaToArray('tradeoffs'),
            reasoning: document.getElementById('reasoning').value.trim()
        },
        outcome: {
            results: document.getElementById('results').value.trim(),
            metrics: textareaToArray('metrics'),
            surprises: document.getElementById('surprises').value.trim()
        },
        lessons: {
            whatWorked: textareaToArray('whatWorked'),
            whatDidnt: textareaToArray('whatDidnt'),
            wouldDoDifferently: textareaToArray('wouldDoDifferently'),
            keyTakeaways: textareaToArray('keyTakeaways')
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = '✅ Insight shared successfully!';
            document.getElementById('insightForm').prepend(successDiv);
            
            // Reset form
            document.getElementById('insightForm').reset();
            
            // Reload insights
            loadInsights();
            
            // Switch to view section after 2 seconds
            setTimeout(() => {
                showSection('viewSection', 'viewInsightsBtn');
                successDiv.remove();
            }, 2000);
        } else {
            formErrors.innerHTML = data.errors.join('<br>');
            formErrors.classList.add('show');
        }
    } catch (error) {
        formErrors.innerHTML = 'Failed to submit insight. Please try again.';
        formErrors.classList.add('show');
        console.error('Error submitting insight:', error);
    }
});

// Helper functions
function textareaToArray(id) {
    const value = document.getElementById(id).value;
    return value.split('\n').map(line => line.trim()).filter(line => line);
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
