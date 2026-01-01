/**
 * In-memory data store for insights
 * In a production system, this would be replaced with a database
 */

const Insight = require('../models/insight');

class DataStore {
  constructor() {
    this.insights = [];
    this.initializeSampleData();
  }
  
  initializeSampleData() {
    // Add a sample insight to demonstrate the platform
    const sampleInsight = new Insight({
      title: 'Choosing Between Eventual Consistency and Strong Consistency',
      author: 'Platform Team',
      tags: ['distributed-systems', 'architecture', 'databases'],
      context: {
        domain: 'Distributed Systems',
        scale: 'Multi-region deployment serving millions of users',
        timeframe: '6 month project'
      },
      problem: {
        description: 'We needed to replicate data across multiple geographic regions while maintaining good user experience. Users expected to see their changes immediately.',
        impact: 'User experience and data integrity were at stake. Wrong choice could lead to confused users or data loss.',
        constraints: [
          'Network latency between regions (100-300ms)',
          'Limited engineering resources (team of 4)',
          'Strict SLA requirements (99.9% uptime)',
          'Budget constraints on infrastructure'
        ]
      },
      approach: {
        alternatives: [
          'Strong consistency with distributed transactions',
          'Eventual consistency with conflict resolution',
          'Hybrid approach with different consistency levels per data type'
        ],
        chosen: 'Hybrid approach with different consistency levels',
        tradeoffs: [
          'Added complexity in the system design',
          'Reduced latency for most operations',
          'Some data types still had higher latency'
        ],
        reasoning: 'Most data (90%) could tolerate eventual consistency. Critical data like billing needed strong consistency. Hybrid approach gave us best of both worlds without over-engineering.'
      },
      outcome: {
        results: 'Successfully deployed to 3 regions. Average latency improved significantly for most operations.',
        metrics: [
          'P95 latency reduced by 60% for read operations',
          'Write latency increased by 20% for critical data',
          'Zero data inconsistencies reported in first 3 months'
        ],
        surprises: 'Users didn\'t notice the rare cases of eventual consistency. Our concerns about UX impact were overblown.'
      },
      lessons: {
        whatWorked: [
          'Starting with data classification exercise',
          'Prototyping both approaches with real data patterns',
          'Incremental rollout with metrics at each step'
        ],
        whatDidnt: [
          'Initial attempt to use a single consistency model',
          'Over-engineering conflict resolution for data that rarely conflicted'
        ],
        wouldDoDifferently: [
          'Start with simpler approach and add complexity only when needed',
          'Invest more in monitoring and observability upfront'
        ],
        keyTakeaways: [
          'Not all data needs the same consistency guarantees',
          'User perception often differs from engineering assumptions',
          'Measure twice, cut once - data-driven decisions saved us months of work'
        ]
      }
    });
    
    this.insights.push(sampleInsight);
  }
  
  getAllInsights() {
    return this.insights.map(i => i.toJSON());
  }
  
  getInsightById(id) {
    const insight = this.insights.find(i => i.id === id);
    return insight ? insight.toJSON() : null;
  }
  
  createInsight(data) {
    const insight = new Insight(data);
    const validation = insight.validate();
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    this.insights.push(insight);
    return { success: true, insight: insight.toJSON() };
  }
  
  updateInsight(id, data) {
    const index = this.insights.findIndex(i => i.id === id);
    
    if (index === -1) {
      return { success: false, errors: ['Insight not found'] };
    }
    
    // Preserve id and timestamp
    data.id = id;
    data.timestamp = this.insights[index].timestamp;
    
    const insight = new Insight(data);
    const validation = insight.validate();
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    this.insights[index] = insight;
    return { success: true, insight: insight.toJSON() };
  }
  
  deleteInsight(id) {
    const index = this.insights.findIndex(i => i.id === id);
    
    if (index === -1) {
      return { success: false, errors: ['Insight not found'] };
    }
    
    this.insights.splice(index, 1);
    return { success: true };
  }
  
  searchInsights(query) {
    const lowerQuery = query.toLowerCase();
    return this.insights
      .filter(insight => {
        const searchText = JSON.stringify(insight.toJSON()).toLowerCase();
        return searchText.includes(lowerQuery);
      })
      .map(i => i.toJSON());
  }
  
  getInsightsByTag(tag) {
    return this.insights
      .filter(insight => insight.tags.includes(tag))
      .map(i => i.toJSON());
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
