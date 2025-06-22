# AI Tag Suggestions Backend Specification

## Overview
This document describes the backend requirements for the AI-powered tag suggestion feature in the admin problem creation interface.

## API Endpoint

### Get AI Tag Suggestions
**Endpoint:** `POST /api/admin/ai_tag_suggestions`

**Description:** Analyzes problem content and returns AI-suggested tags with confidence scores and reasoning.

**Authentication:** Admin required

**Request Body:**
```json
{
  "title": "Two Sum",
  "description": "Given an array of integers and a target sum...",
  "input_description": "First line contains n...",
  "output_description": "Return indices of the two numbers...",
  "samples": [
    {
      "input": "4\n2 7 11 15\n9",
      "output": "0 1"
    }
  ],
  "difficulty": "Low",
  "time_limit": 1000,
  "memory_limit": 256
}
```

**Response:**
```json
{
  "error": null,
  "data": {
    "suggestions": [
      {
        "name": "Array",
        "confidence": 0.95,
        "reason": "Problem involves array manipulation and element searching"
      },
      {
        "name": "Hash Table",
        "confidence": 0.85,
        "reason": "Optimal O(n) solution uses hash table for value lookups"
      },
      {
        "name": "Two Pointers",
        "confidence": 0.70,
        "reason": "Alternative O(n log n) solution uses sorted array with two pointers"
      }
    ]
  }
}
```

## AI Analysis Implementation

### 1. Content Analysis Pipeline

```python
# views.py
from django.views import View
from django.utils.decorators import method_decorator
from account.decorators import super_admin_required
import openai
import re
from collections import defaultdict

class AITagSuggestionsAPI(APIView):
    @method_decorator(super_admin_required)
    def post(self, request):
        data = request.data
        
        # Extract and clean problem content
        problem_text = self.extract_problem_text(data)
        
        # Get AI suggestions
        suggestions = self.analyze_with_ai(problem_text, data)
        
        # Filter and rank suggestions
        final_suggestions = self.rank_suggestions(suggestions)
        
        return self.success({
            "suggestions": final_suggestions[:8]  # Return top 8 suggestions
        })
    
    def extract_problem_text(self, data):
        """Extract and clean text from problem data"""
        # Remove HTML tags
        def strip_html(text):
            return re.sub('<.*?>', '', text)
        
        parts = []
        if data.get('title'):
            parts.append(f"Title: {data['title']}")
        if data.get('description'):
            parts.append(f"Description: {strip_html(data['description'])}")
        if data.get('input_description'):
            parts.append(f"Input: {strip_html(data['input_description'])}")
        if data.get('output_description'):
            parts.append(f"Output: {strip_html(data['output_description'])}")
        
        # Include sample I/O
        if data.get('samples'):
            for i, sample in enumerate(data['samples'][:2]):  # First 2 samples
                parts.append(f"Sample Input {i+1}: {sample.get('input', '')}")
                parts.append(f"Sample Output {i+1}: {sample.get('output', '')}")
        
        return "\n".join(parts)
    
    def analyze_with_ai(self, problem_text, data):
        """Use AI to analyze problem and suggest tags"""
        try:
            # OpenAI API call
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert at categorizing programming problems. 
                        Analyze the problem and suggest appropriate tags from common algorithmic categories.
                        For each tag, provide a confidence score (0-1) and a brief reason.
                        Common tags include: Array, String, Hash Table, Dynamic Programming, Tree, 
                        Graph, Binary Search, Sorting, Greedy, Stack, Queue, Linked List, 
                        Two Pointers, Sliding Window, Recursion, Backtracking, DFS, BFS, etc."""
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this problem and suggest tags:\n\n{problem_text}"
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Parse AI response
            return self.parse_ai_response(response.choices[0].message.content)
            
        except Exception as e:
            # Fallback to rule-based analysis
            return self.rule_based_analysis(problem_text, data)
    
    def rule_based_analysis(self, problem_text, data):
        """Fallback rule-based tag suggestion"""
        suggestions = []
        text_lower = problem_text.lower()
        
        # Pattern matching rules
        patterns = {
            'Array': {
                'keywords': ['array', 'list', 'elements', 'index', 'indices'],
                'confidence': 0.9,
                'reason': 'Problem involves array/list operations'
            },
            'Hash Table': {
                'keywords': ['hash', 'map', 'dictionary', 'lookup', 'frequency'],
                'confidence': 0.85,
                'reason': 'Hash table provides efficient lookups'
            },
            'Dynamic Programming': {
                'keywords': ['optimal', 'subproblem', 'memoization', 'dp', 'maximum', 'minimum'],
                'confidence': 0.85,
                'reason': 'Problem has optimal substructure'
            },
            'Tree': {
                'keywords': ['tree', 'node', 'root', 'leaf', 'parent', 'child'],
                'confidence': 0.95,
                'reason': 'Problem involves tree data structure'
            },
            'Graph': {
                'keywords': ['graph', 'vertex', 'edge', 'path', 'connected', 'cycle'],
                'confidence': 0.95,
                'reason': 'Problem involves graph traversal or manipulation'
            },
            'String': {
                'keywords': ['string', 'substring', 'character', 'palindrome', 'anagram'],
                'confidence': 0.9,
                'reason': 'Problem involves string manipulation'
            },
            'Binary Search': {
                'keywords': ['binary search', 'sorted', 'search', 'logarithmic'],
                'confidence': 0.85,
                'reason': 'Binary search applicable for efficient searching'
            },
            'Two Pointers': {
                'keywords': ['two pointers', 'two sum', 'pair', 'sliding'],
                'confidence': 0.8,
                'reason': 'Two pointer technique applicable'
            },
            'Sorting': {
                'keywords': ['sort', 'order', 'arrange', 'ascending', 'descending'],
                'confidence': 0.85,
                'reason': 'Problem requires sorting elements'
            },
            'Stack': {
                'keywords': ['stack', 'push', 'pop', 'lifo', 'parentheses', 'bracket'],
                'confidence': 0.9,
                'reason': 'Stack data structure required'
            },
            'Queue': {
                'keywords': ['queue', 'enqueue', 'dequeue', 'fifo', 'bfs'],
                'confidence': 0.9,
                'reason': 'Queue data structure required'
            },
            'Math': {
                'keywords': ['prime', 'factorial', 'gcd', 'lcm', 'modulo', 'arithmetic'],
                'confidence': 0.85,
                'reason': 'Mathematical concepts involved'
            }
        }
        
        # Check each pattern
        for tag, pattern in patterns.items():
            score = 0
            for keyword in pattern['keywords']:
                if keyword in text_lower:
                    score += 1
            
            if score > 0:
                confidence = min(pattern['confidence'] * (1 + score * 0.1), 1.0)
                suggestions.append({
                    'name': tag,
                    'confidence': confidence,
                    'reason': pattern['reason']
                })
        
        # Add difficulty-based tags
        if data.get('difficulty') == 'Low':
            suggestions.append({
                'name': 'Basic',
                'confidence': 0.7,
                'reason': 'Suitable for beginners'
            })
        elif data.get('difficulty') == 'High':
            suggestions.append({
                'name': 'Advanced',
                'confidence': 0.7,
                'reason': 'Requires advanced problem-solving skills'
            })
        
        return suggestions
    
    def rank_suggestions(self, suggestions):
        """Rank and filter suggestions"""
        # Remove duplicates
        seen = set()
        unique_suggestions = []
        for s in suggestions:
            if s['name'] not in seen:
                seen.add(s['name'])
                unique_suggestions.append(s)
        
        # Sort by confidence
        unique_suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return unique_suggestions
```

### 2. Database Models

```python
# models.py
class TagSuggestionLog(models.Model):
    """Log AI tag suggestions for analysis and improvement"""
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, null=True)
    problem_data = models.JSONField()  # Store problem data if not saved yet
    suggested_tags = models.JSONField()
    selected_tags = models.JSONField(null=True)  # Tags actually used
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "tag_suggestion_log"
        ordering = ["-created_at"]
```

### 3. Caching Strategy

```python
# Use Redis for caching suggestions
from django.core.cache import cache
import hashlib

def get_cache_key(problem_data):
    """Generate cache key from problem data"""
    content = f"{problem_data.get('title', '')}{problem_data.get('description', '')}"
    return f"tag_suggestions:{hashlib.md5(content.encode()).hexdigest()}"

# In the API view
cache_key = get_cache_key(data)
cached_suggestions = cache.get(cache_key)
if cached_suggestions:
    return self.success({"suggestions": cached_suggestions})

# After getting suggestions
cache.set(cache_key, final_suggestions, 3600)  # Cache for 1 hour
```

### 4. Configuration

```python
# settings.py
AI_TAG_SUGGESTIONS = {
    'ENABLED': True,
    'OPENAI_API_KEY': os.environ.get('OPENAI_API_KEY'),
    'MODEL': 'gpt-3.5-turbo',
    'MAX_TOKENS': 500,
    'TEMPERATURE': 0.3,
    'CACHE_TIMEOUT': 3600,
    'MAX_SUGGESTIONS': 8,
    'MIN_CONFIDENCE': 0.5
}
```

### 5. Monitoring and Analytics

```python
# Track suggestion effectiveness
class TagSuggestionMetrics(models.Model):
    tag = models.CharField(max_length=50)
    suggested_count = models.IntegerField(default=0)
    accepted_count = models.IntegerField(default=0)
    acceptance_rate = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "tag_suggestion_metrics"
```

## Integration with Existing System

1. **Permissions**: Only admin users can access this endpoint
2. **Rate Limiting**: Limit to 100 requests per hour per admin
3. **Logging**: Log all suggestions for future ML model training
4. **Fallback**: Always provide rule-based suggestions if AI fails
5. **Validation**: Ensure suggested tags exist in the system's tag list

## Future Enhancements

1. **Machine Learning Model**: Train custom model on historical data
2. **Tag Relationships**: Suggest related tags based on co-occurrence
3. **Language-Specific Tags**: Detect programming language from code
4. **Complexity Analysis**: Analyze time/space complexity and suggest tags
5. **Similar Problems**: Find similar problems and inherit their tags