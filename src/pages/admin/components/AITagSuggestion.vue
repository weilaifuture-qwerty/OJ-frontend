<template>
  <div class="ai-tag-suggestion">
    <el-button 
      size="small" 
      type="primary" 
      @click="getSuggestions" 
      :loading="loading"
      :disabled="!canSuggest"
    >
      <i class="el-icon-magic-stick"></i>
      {{ $t('m.AI_Suggest_Tags') }}
    </el-button>
    
    <el-popover
      v-model="showSuggestions"
      placement="bottom"
      width="400"
      trigger="manual"
    >
      <div class="suggestion-content">
        <div class="suggestion-header">
          <span>{{ $t('m.AI_Suggested_Tags') }}</span>
          <el-button 
            type="text" 
            size="mini" 
            @click="showSuggestions = false"
          >
            <i class="el-icon-close"></i>
          </el-button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="el-icon-loading"></i>
          <p>{{ $t('m.Analyzing_problem_content') }}</p>
        </div>
        
        <div v-else-if="suggestions.length > 0" class="suggestions-list">
          <div class="suggestion-item" v-for="tag in suggestions" :key="tag.name">
            <div class="tag-info">
              <el-tag 
                size="default"
                :type="tag.confidence >= 0.8 ? 'success' : tag.confidence >= 0.6 ? 'warning' : 'info'"
              >
                {{ tag.name }}
              </el-tag>
              <span class="confidence">
                {{ (tag.confidence * 100).toFixed(0) }}% {{ $t('m.confidence') }}
              </span>
            </div>
            <div class="tag-reason">
              <i class="el-icon-info"></i>
              {{ tag.reason }}
            </div>
            <el-button 
              size="mini" 
              @click="addSuggestedTag(tag.name)"
              :disabled="isTagAdded(tag.name)"
            >
              {{ isTagAdded(tag.name) ? $t('m.Added') : $t('m.Add') }}
            </el-button>
          </div>
          
          <div class="suggestion-footer">
            <el-button 
              size="small" 
              @click="addAllSuggestions"
              :disabled="allTagsAdded"
            >
              {{ $t('m.Add_All_Suggestions') }}
            </el-button>
          </div>
        </div>
        
        <div v-else class="no-suggestions">
          <i class="el-icon-warning-outline"></i>
          <p>{{ $t('m.No_tag_suggestions_available') }}</p>
          <small>{{ $t('m.Try_adding_more_problem_details') }}</small>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import api from '@admin/api'

export default {
  name: 'AITagSuggestion',
  props: {
    problem: {
      type: Object,
      required: true
    },
    existingTags: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      showSuggestions: false,
      suggestions: []
    }
  },
  computed: {
    canSuggest() {
      // Require at least title and description
      return this.problem.title && 
             this.problem.title.length > 5 && 
             this.problem.description && 
             this.problem.description.length > 50
    },
    allTagsAdded() {
      return this.suggestions.every(tag => this.isTagAdded(tag.name))
    }
  },
  methods: {
    async getSuggestions() {
      this.loading = true
      this.showSuggestions = true
      
      try {
        // Prepare problem data for AI analysis
        const problemData = {
          title: this.problem.title,
          description: this.stripHtml(this.problem.description),
          input_description: this.stripHtml(this.problem.input_description || ''),
          output_description: this.stripHtml(this.problem.output_description || ''),
          samples: this.problem.samples || [],
          difficulty: this.problem.difficulty,
          time_limit: this.problem.time_limit,
          memory_limit: this.problem.memory_limit
        }
        
        const res = await api.getAITagSuggestions(problemData)
        
        if (res.data.error === null && res.data.data) {
          this.suggestions = res.data.data.suggestions
        } else {
          // Use mock suggestions for testing
          this.suggestions = await this.getMockSuggestions(problemData)
        }
      } catch (error) {
        console.error('Failed to get AI suggestions:', error)
        // Fallback to mock suggestions
        this.suggestions = await this.getMockSuggestions()
      } finally {
        this.loading = false
      }
    },
    
    async getMockSuggestions(problemData) {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock AI analysis based on problem content
      const suggestions = []
      const title = (problemData?.title || '').toLowerCase()
      const description = (problemData?.description || '').toLowerCase()
      const fullText = title + ' ' + description
      
      // Pattern matching for common algorithm types
      const patterns = [
        {
          keywords: ['two sum', 'pair', 'target sum', 'find two'],
          tags: [
            { name: 'Array', confidence: 0.95, reason: 'Problem involves array manipulation' },
            { name: 'Hash Table', confidence: 0.85, reason: 'Optimal solution uses hash table for O(n) complexity' },
            { name: 'Two Pointers', confidence: 0.7, reason: 'Alternative approach using two pointers' }
          ]
        },
        {
          keywords: ['binary tree', 'tree traversal', 'binary search tree', 'bst'],
          tags: [
            { name: 'Tree', confidence: 0.95, reason: 'Problem involves tree data structure' },
            { name: 'Binary Tree', confidence: 0.9, reason: 'Specifically mentions binary tree' },
            { name: 'DFS', confidence: 0.8, reason: 'Tree traversal often uses depth-first search' },
            { name: 'Recursion', confidence: 0.75, reason: 'Tree problems commonly use recursion' }
          ]
        },
        {
          keywords: ['dynamic programming', 'dp', 'optimal substructure', 'memoization'],
          tags: [
            { name: 'Dynamic Programming', confidence: 0.95, reason: 'Classic DP problem pattern detected' },
            { name: 'Memoization', confidence: 0.8, reason: 'Can be solved with memoization technique' }
          ]
        },
        {
          keywords: ['graph', 'nodes', 'edges', 'vertices', 'path', 'dijkstra', 'bfs', 'dfs'],
          tags: [
            { name: 'Graph', confidence: 0.95, reason: 'Problem involves graph traversal or manipulation' },
            { name: 'BFS', confidence: 0.75, reason: 'Breadth-first search might be applicable' },
            { name: 'DFS', confidence: 0.75, reason: 'Depth-first search might be applicable' }
          ]
        },
        {
          keywords: ['sort', 'sorting', 'order', 'arrange'],
          tags: [
            { name: 'Sorting', confidence: 0.9, reason: 'Problem requires sorting elements' },
            { name: 'Array', confidence: 0.8, reason: 'Sorting typically involves arrays' }
          ]
        },
        {
          keywords: ['substring', 'palindrome', 'anagram', 'pattern matching'],
          tags: [
            { name: 'String', confidence: 0.95, reason: 'Problem involves string manipulation' },
            { name: 'Sliding Window', confidence: 0.7, reason: 'String problems often use sliding window' }
          ]
        },
        {
          keywords: ['linked list', 'node', 'next', 'reverse list'],
          tags: [
            { name: 'Linked List', confidence: 0.95, reason: 'Problem involves linked list operations' },
            { name: 'Two Pointers', confidence: 0.7, reason: 'Linked list problems often use two pointers' }
          ]
        },
        {
          keywords: ['stack', 'push', 'pop', 'lifo', 'parentheses', 'bracket'],
          tags: [
            { name: 'Stack', confidence: 0.95, reason: 'Problem requires stack data structure' }
          ]
        },
        {
          keywords: ['queue', 'enqueue', 'dequeue', 'fifo', 'level order'],
          tags: [
            { name: 'Queue', confidence: 0.95, reason: 'Problem requires queue data structure' },
            { name: 'BFS', confidence: 0.8, reason: 'Queue is commonly used in BFS' }
          ]
        },
        {
          keywords: ['binary search', 'search', 'sorted array', 'logarithmic'],
          tags: [
            { name: 'Binary Search', confidence: 0.9, reason: 'Problem can be solved using binary search' },
            { name: 'Array', confidence: 0.8, reason: 'Binary search operates on arrays' }
          ]
        }
      ]
      
      // Check each pattern
      patterns.forEach(pattern => {
        const matchCount = pattern.keywords.filter(keyword => fullText.includes(keyword)).length
        if (matchCount > 0) {
          pattern.tags.forEach(tag => {
            // Adjust confidence based on match count
            const adjustedConfidence = Math.min(tag.confidence * (1 + matchCount * 0.1), 1)
            suggestions.push({
              ...tag,
              confidence: adjustedConfidence
            })
          })
        }
      })
      
      // Add general tags based on difficulty
      if (problemData?.difficulty) {
        if (problemData.difficulty === 'Low') {
          suggestions.push({
            name: 'Basic',
            confidence: 0.7,
            reason: 'Low difficulty problem suitable for beginners'
          })
        } else if (problemData.difficulty === 'High') {
          suggestions.push({
            name: 'Advanced',
            confidence: 0.7,
            reason: 'High difficulty problem requiring advanced techniques'
          })
        }
      }
      
      // Remove duplicates and sort by confidence
      const uniqueSuggestions = []
      const seen = new Set()
      
      suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .forEach(tag => {
          if (!seen.has(tag.name)) {
            seen.add(tag.name)
            uniqueSuggestions.push(tag)
          }
        })
      
      return uniqueSuggestions.slice(0, 8) // Return top 8 suggestions
    },
    
    stripHtml(html) {
      const tmp = document.createElement('DIV')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    },
    
    isTagAdded(tagName) {
      return this.existingTags.includes(tagName)
    },
    
    addSuggestedTag(tagName) {
      if (!this.isTagAdded(tagName)) {
        this.$emit('add-tag', tagName)
      }
    },
    
    addAllSuggestions() {
      this.suggestions.forEach(tag => {
        if (!this.isTagAdded(tag.name)) {
          this.$emit('add-tag', tag.name)
        }
      })
      this.showSuggestions = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-tag-suggestion {
  display: inline-block;
  margin-left: 10px;
}

.suggestion-content {
  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    
    span {
      font-weight: 500;
      font-size: 16px;
    }
  }
  
  .loading-state {
    text-align: center;
    padding: 30px;
    
    i {
      font-size: 24px;
      color: #409EFF;
    }
    
    p {
      margin-top: 10px;
      color: #666;
    }
  }
  
  .suggestions-list {
    max-height: 400px;
    overflow-y: auto;
    
    .suggestion-item {
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background: #f9f9f9;
      
      &:hover {
        background: #f5f7fa;
      }
      
      .tag-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .el-tag {
          margin-right: 10px;
        }
        
        .confidence {
          font-size: 12px;
          color: #909399;
        }
      }
      
      .tag-reason {
        display: flex;
        align-items: flex-start;
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        line-height: 1.4;
        
        i {
          margin-right: 5px;
          margin-top: 2px;
          color: #909399;
        }
      }
    }
    
    .suggestion-footer {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      text-align: center;
    }
  }
  
  .no-suggestions {
    text-align: center;
    padding: 30px;
    
    i {
      font-size: 48px;
      color: #C0C4CC;
    }
    
    p {
      margin: 10px 0;
      color: #666;
    }
    
    small {
      color: #999;
      font-size: 12px;
    }
  }
}
</style>