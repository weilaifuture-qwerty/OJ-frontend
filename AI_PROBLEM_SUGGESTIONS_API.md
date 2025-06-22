# AI-Powered Problem Suggestions API Specification

## Overview
This document describes the backend API requirements for the AI-powered problem suggestion feature on the OnlineJudge platform.

## API Endpoints

### 1. Get Problem Suggestions
**Endpoint:** `GET /api/problem_suggestions`

**Description:** Returns personalized problem suggestions based on user's practice history and AI analysis.

**Authentication:** Required

**Response:**
```json
{
  "error": null,
  "data": {
    "suggestions": [
      {
        "_id": "problem-id-1",
        "title": "Two Sum",
        "difficulty": "Low",
        "accepted_number": 1523,
        "submission_number": 2341,
        "tags": ["Array", "Hash Table"],
        "ai_reason": "Good for practicing hash table techniques based on your recent submissions",
        "match_score": 0.92
      },
      {
        "_id": "problem-id-2",
        "title": "Binary Tree Level Order Traversal",
        "difficulty": "Mid",
        "accepted_number": 892,
        "submission_number": 1456,
        "tags": ["Tree", "BFS", "Queue"],
        "ai_reason": "You solved similar tree problems recently, this will strengthen your BFS skills",
        "match_score": 0.87
      }
    ],
    "analysis_metadata": {
      "analyzed_submissions": 50,
      "user_skill_level": "intermediate",
      "strongest_tags": ["Array", "String", "Dynamic Programming"],
      "weakest_tags": ["Graph", "Bit Manipulation"],
      "recent_difficulty_trend": "increasing"
    }
  }
}
```

### 2. Get User Practice History
**Endpoint:** `GET /api/user_practice_history`

**Description:** Returns detailed practice history for AI analysis.

**Authentication:** Required

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)
- `limit` (optional): Maximum number of records (default: 100)

**Response:**
```json
{
  "error": null,
  "data": {
    "practice_history": [
      {
        "problem_id": "problem-id",
        "problem_title": "Maximum Subarray",
        "difficulty": "Mid",
        "tags": ["Array", "Dynamic Programming"],
        "submission_time": "2024-06-15T10:30:00Z",
        "result": "Accepted",
        "language": "Python3",
        "time_spent": 1523,
        "attempts": 3
      }
    ],
    "statistics": {
      "total_problems_solved": 142,
      "difficulty_distribution": {
        "Low": 58,
        "Mid": 72,
        "High": 12
      },
      "tag_frequency": {
        "Array": 45,
        "String": 38,
        "Dynamic Programming": 25
      },
      "average_attempts_per_problem": 2.3,
      "success_rate": 0.75
    }
  }
}
```

## AI Recommendation Algorithm

### Core Logic
The AI recommendation system should consider:

1. **Skill Level Assessment**
   - Recent success rate
   - Difficulty progression
   - Time to solve problems

2. **Learning Path Optimization**
   - Gradual difficulty increase
   - Tag diversity
   - Building on recently learned concepts

3. **Personalization Factors**
   - Preferred problem types
   - Time of day patterns
   - Language preferences

### Recommendation Scoring
Each problem gets a match score (0-1) based on:
- **Difficulty Match (30%)**: Appropriate for user's current level
- **Tag Relevance (25%)**: Related to recent practice
- **Learning Value (25%)**: Introduces new concepts appropriately
- **Success Probability (20%)**: Likelihood of solving within reasonable attempts

### Implementation Suggestions

```python
# Example Django model
class UserPracticeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    skill_level = models.FloatField(default=0.5)  # 0-1 scale
    strongest_tags = JSONField(default=list)
    weakest_tags = JSONField(default=list)
    last_analyzed = models.DateTimeField(auto_now=True)
    
class ProblemRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    match_score = models.FloatField()
    ai_reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    clicked = models.BooleanField(default=False)
    solved = models.BooleanField(default=False)
```

### AI Service Integration
Consider integrating with:
- OpenAI GPT API for natural language reasoning
- Custom ML model for pattern recognition
- Rule-based system for basic recommendations

### Caching Strategy
- Cache recommendations for 6 hours
- Refresh on significant user activity
- Store analysis results for trend tracking

## Error Handling
All endpoints should handle:
- User not found
- Insufficient practice history
- AI service unavailable (fallback to rule-based)
- Invalid parameters

## Future Enhancements
1. **Collaborative Filtering**: Recommend based on similar users
2. **Contest Performance**: Factor in contest rankings
3. **Time-based Recommendations**: Different problems for different times
4. **Study Plan Generation**: Multi-week learning paths
5. **Weakness Detection**: Identify and target weak areas