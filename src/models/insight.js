/**
 * Insight Model
 * Represents an engineering insight or case study shared on the platform
 * Focus: Abstracted problems, constraints, decisions, trade-offs, outcomes, lessons
 * NO source code, proprietary data, or confidential details
 */

class Insight {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.author = data.author || 'Anonymous';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.tags = data.tags || [];
    
    // Core components of an engineering insight
    this.context = data.context || {
      domain: '', // e.g., "Distributed Systems", "Mobile Development"
      scale: '', // e.g., "Millions of users", "High throughput"
      timeframe: '' // e.g., "3 months", "2 weeks sprint"
    };
    
    this.problem = data.problem || {
      description: '', // What challenge was faced?
      impact: '', // Why did it matter?
      constraints: [] // What limitations existed? (time, resources, technical)
    };
    
    this.approach = data.approach || {
      alternatives: [], // What options were considered?
      chosen: '', // What was selected?
      tradeoffs: [], // What was gained vs. lost?
      reasoning: '' // Why this choice?
    };
    
    this.outcome = data.outcome || {
      results: '', // What happened?
      metrics: [], // How was success measured? (abstract metrics only)
      surprises: '' // What was unexpected?
    };
    
    this.lessons = data.lessons || {
      whatWorked: [],
      whatDidnt: [],
      wouldDoDifferently: [],
      keyTakeaways: []
    };
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!this.problem.description || this.problem.description.trim().length === 0) {
      errors.push('Problem description is required');
    }
    
    // Basic validation to discourage code sharing
    const sensitivePatterns = [
      /```[\s\S]*?```/, // Code blocks
      /function\s+\w+\s*\(/, // Function definitions
      /class\s+\w+/, // Class definitions
      /import\s+.*from/, // Import statements
      /\bAPI[_\s]?KEY\b/i, // API keys
      /\bPASSWORD\b/i, // Passwords
      /\bSECRET\b/i, // Secrets
    ];
    
    const allText = JSON.stringify(this);
    for (const pattern of sensitivePatterns) {
      if (pattern.test(allText)) {
        errors.push('Content appears to contain code or sensitive data. Please share insights in abstract terms.');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      timestamp: this.timestamp,
      tags: this.tags,
      context: this.context,
      problem: this.problem,
      approach: this.approach,
      outcome: this.outcome,
      lessons: this.lessons
    };
  }
}

module.exports = Insight;
