"""
Comprehensive seed script for SSC GD content.

This script populates the database with:
- 4 SSC GD subjects
- 40+ topics with descriptions and estimated hours
- 200+ lessons with content and video URLs
- 1000+ MCQ questions in question bank
- 20+ test series (5 full-length, 5 sectional, 5 chapter, 5 quiz)
- PYQ data for 2019-2024
- Physical training plans
- Document checklists for PST, PET, Medical, DV stages

Run with: python -m apps.api.internal.seed
"""
import asyncio
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import AsyncSessionLocal, init_db, Base

# Import all models to ensure they are registered with Base.metadata
from .auth.models import User  # noqa: F401
from .users.models import Profile, UserStats  # noqa: F401
from .syllabus.models import Subject, Topic, Lesson, Note, Bookmark, LessonProgress
from .questions.models import Question, QuestionType, Difficulty
from .tests.models import TestSeries, TestType, MockAttempt, AttemptAnswer
from .physical.models import PhysicalPlan, PhysicalPlanType, PhysicalGoalGender, PhysicalProgressLog
from .documents.models import DocumentChecklist, DocumentStage, UserDocumentChecklist


# ============================================================================
# SSC GD SUBJECTS
# ============================================================================

SSC_GD_SUBJECTS = [
    {
        "name": "General Intelligence & Reasoning",
        "code": "GIR",
        "description": "Covers non-verbal and verbal reasoning, analogies, classification, coding-decoding, blood relations, and more.",
        "icon_url": "https://example.com/icons/gir.png",
        "order_index": 1,
    },
    {
        "name": "General Knowledge & General Awareness",
        "code": "GKA",
        "description": "Covers current affairs, history, geography, polity, economics, and general science.",
        "icon_url": "https://example.com/icons/gka.png",
        "order_index": 2,
    },
    {
        "name": "Elementary Mathematics",
        "code": "EM",
        "description": "Covers number system, arithmetic, algebra, geometry, and data interpretation.",
        "icon_url": "https://example.com/icons/em.png",
        "order_index": 3,
    },
    {
        "name": "English/Hindi",
        "code": "EH",
        "description": "Covers grammar, vocabulary, comprehension, and language proficiency in English or Hindi.",
        "icon_url": "https://example.com/icons/eh.png",
        "order_index": 4,
    },
]


# ============================================================================
# SSC GD TOPICS (40+)
# ============================================================================

SSC_GD_TOPICS = {
    "GIR": [  # General Intelligence & Reasoning
        {"name": "Analogies", "description": "Finding similarity between given words, letters, or numbers", "estimated_hours": 8, "order_index": 1},
        {"name": "Blood Relations", "description": "Family tree problems, directional blood relation questions", "estimated_hours": 6, "order_index": 2},
        {"name": "Coding-Decoding", "description": "Letter and number coding patterns, substitution cipher", "estimated_hours": 10, "order_index": 3},
        {"name": "Series", "description": "Number series, letter series, alphanumeric series", "estimated_hours": 8, "order_index": 4},
        {"name": "Missing Number", "description": "Finding missing number in patterns, matrices, pyramids", "estimated_hours": 5, "order_index": 5},
        {"name": "Arrangement (Sitting/Circle)", "description": "Linear and circular seating arrangements", "estimated_hours": 10, "order_index": 6},
        {"name": "Direction and Distance", "description": "Direction sense, distance calculations", "estimated_hours": 5, "order_index": 7},
        {"name": "Ranking and Order", "description": "Arranging by height, weight, rank in queue", "estimated_hours": 4, "order_index": 8},
        {"name": "Classification", "description": "Odd one out, finding uncommon among common", "estimated_hours": 4, "order_index": 9},
        {"name": "Syllogism", "description": "Logical deduction, if-then statements, conclusions", "estimated_hours": 8, "order_index": 10},
        {"name": "Cube and Dice", "description": "Visualizing dice positions, cube folding", "estimated_hours": 6, "order_index": 11},
        {"name": "Mirror and Water Image", "description": "Finding mirror image or water image of figures", "estimated_hours": 4, "order_index": 12},
    ],
    "GKA": [  # General Knowledge & General Awareness
        {"name": "Current Affairs", "description": "National and international current events", "estimated_hours": 20, "order_index": 1},
        {"name": "History", "description": "Ancient, medieval, and modern Indian history", "estimated_hours": 15, "order_index": 2},
        {"name": "Geography", "description": "Indian geography, physical geography, world geography", "estimated_hours": 12, "order_index": 3},
        {"name": "Polity", "description": "Indian constitution, governance, political system", "estimated_hours": 10, "order_index": 4},
        {"name": "Economics", "description": "Indian economy, economic terms, budget basics", "estimated_hours": 8, "order_index": 5},
        {"name": "General Science", "description": "Physics, Chemistry, Biology basics", "estimated_hours": 10, "order_index": 6},
        {"name": "Static GK", "description": "Important facts, awards, sports, books, capitals", "estimated_hours": 10, "order_index": 7},
    ],
    "EM": [  # Elementary Mathematics
        {"name": "Number System", "description": "HCF, LCM, fractions, decimals, surds", "estimated_hours": 10, "order_index": 1},
        {"name": "Percentage", "description": "Percentage calculations, profit-loss, discount", "estimated_hours": 8, "order_index": 2},
        {"name": "Ratio and Proportion", "description": "Direct, inverse proportion, mixture problems", "estimated_hours": 6, "order_index": 3},
        {"name": "Average", "description": "Mean, weighted average, average speed", "estimated_hours": 5, "order_index": 4},
        {"name": "Time and Work", "description": "Work efficiency, pipes and cisterns", "estimated_hours": 8, "order_index": 5},
        {"name": "Speed, Distance and Time", "description": "Relative speed, train problems, boat-stream", "estimated_hours": 10, "order_index": 6},
        {"name": "Profit and Loss", "description": "Cost price, selling price, discount, GST", "estimated_hours": 8, "order_index": 7},
        {"name": "Simple and Compound Interest", "description": "SI, CI, interest formulas, population problems", "estimated_hours": 6, "order_index": 8},
        {"name": "Algebra", "description": "Linear equations, quadratic equations, polynomials", "estimated_hours": 8, "order_index": 9},
        {"name": "Geometry", "description": "Lines, angles, triangles, circles, quadrilaterals", "estimated_hours": 12, "order_index": 10},
        {"name": "Mensuration", "description": "Area, volume, surface area of 2D and 3D shapes", "estimated_hours": 10, "order_index": 11},
        {"name": "Data Interpretation", "description": "Bar graphs, pie charts, tables, caselets", "estimated_hours": 8, "order_index": 12},
    ],
    "EH": [  # English/Hindi
        {"name": "Grammar (English)", "description": "Parts of speech, tenses, voice, speech", "estimated_hours": 15, "order_index": 1},
        {"name": "Vocabulary", "description": "Synonyms, antonyms, one-word substitution", "estimated_hours": 10, "order_index": 2},
        {"name": "Idioms and Phrases", "description": "Common idioms, proverbs, phrases", "estimated_hours": 8, "order_index": 3},
        {"name": "Reading Comprehension", "description": "Passage reading, inference, vocabulary in context", "estimated_hours": 10, "order_index": 4},
        {"name": "Fill in the Blanks", "description": "Grammar-based fill in the blanks, sentence completion", "estimated_hours": 6, "order_index": 5},
        {"name": "Sentence Correction", "description": "Error spotting, sentence improvement", "estimated_hours": 8, "order_index": 6},
        {"name": "Spelling", "description": "Correct spelling, misspelled words identification", "estimated_hours": 4, "order_index": 7},
        {"name": "Hindi Grammar", "description": "संज्ञा, सर्वनाम, क्रिया, विशेषण, लिंग, वचन", "estimated_hours": 10, "order_index": 8},
    ],
}


# ============================================================================
# LESSON TEMPLATES (5-6 lessons per topic)
# ============================================================================

def generate_lessons_for_topic(topic_name: str, topic_id: uuid.UUID, start_index: int = 0) -> List[Dict]:
    """Generate lessons for a topic with realistic content."""
    lessons = []
    
    # Base lesson templates
    templates = [
        {"title": f"Introduction to {topic_name}", "minutes": 15, "content_type": "intro"},
        {"title": f"Basic Concepts of {topic_name}", "minutes": 25, "content_type": "basics"},
        {"title": f"{topic_name} - Important Formulas and Rules", "minutes": 20, "content_type": "formulas"},
        {"title": f"{topic_name} - Examples and Solutions", "minutes": 30, "content_type": "examples"},
        {"title": f"{topic_name} - Practice Problems Set 1", "minutes": 25, "content_type": "practice"},
        {"title": f"{topic_name} - Advanced Techniques", "minutes": 30, "content_type": "advanced"},
    ]
    
    for i, template in enumerate(templates):
        lesson = {
            "title": template["title"],
            "content": generate_lesson_content(topic_name, template["content_type"]),
            "video_url": f"https://example.com/videos/{topic_name.lower().replace(' ', '-')}/lesson-{i+1}",
            "order_index": start_index + i,
            "estimated_minutes": template["minutes"],
            "is_premium": i >= 4,  # First 4 lessons free, rest premium
        }
        lessons.append(lesson)
    
    return lessons


def generate_lesson_content(topic_name: str, content_type: str) -> str:
    """Generate placeholder lesson content."""
    contents = {
        "intro": f"""# Introduction to {topic_name}

Welcome to the chapter on {topic_name}. This is a fundamental topic in SSC GD examination.

## Learning Objectives
- Understand the basic concepts of {topic_name}
- Learn important terminology
- Develop problem-solving approach

## Why {topic_name} Matters
{topic_name} is an essential part of the General Intelligence & Reasoning section. Questions from this topic appear frequently in SSC GD examinations.

## Key Takeaways
1. Master the fundamental concepts
2. Practice regularly with different question types
3. Learn to identify patterns quickly

Start your journey into {topic_name} now!
""",
        "basics": f"""# Basic Concepts of {topic_name}

## Fundamentals of {topic_name}

In this lesson, we will cover the basic concepts that form the foundation of {topic_name}.

### Core Principles

**Principle 1: Pattern Recognition**
The first step in solving {topic_name} problems is to identify the underlying pattern.

**Principle 2: Systematic Approach**
Follow a systematic approach to break down complex problems.

**Principle 3: Practice Makes Perfect**
Regular practice helps develop intuition for these problems.

### Examples

Example 1: [Sample problem and solution]
Example 2: [Sample problem and solution]

### Common Mistakes to Avoid
- Don't rush through problems
- Always verify your answer
- Look for hidden patterns
""",
        "formulas": f"""# Important Formulas and Rules for {topic_name}

## Formulas to Memorize

### Formula 1
For any problem in {topic_name}, the key formula is:
**Formula expression here**

### Formula 2
**Secondary formula**

### Formula 3
**Tertiary formula**

## Quick Reference Table

| Type | Formula | Application |
|------|---------|-------------|
| Basic | ... | ... |
| Advanced | ... | ... |

## Tips for Remembering
1. Write formulas daily
2. Practice application
3. Create mnemonics
""",
        "examples": f"""# {topic_name} - Examples and Solutions

## Solved Examples

### Example 1
**Problem:** [Sample problem statement]
**Solution:** 
Step 1: [Explanation]
Step 2: [Explanation]
**Answer:** [Final answer]

### Example 2
**Problem:** [Sample problem statement]
**Solution:**
Step 1: [Explanation]
Step 2: [Explanation]
**Answer:** [Final answer]

### Example 3
**Problem:** [Sample problem statement]
**Solution:**
[Detailed solution]
**Answer:** [Final answer]

## Key Insights
- Pattern identification is crucial
- Multiple approaches can solve the same problem
- Time management is essential
""",
        "practice": f"""# {topic_name} - Practice Problems Set 1

## Exercise Questions

### Question 1
[Problem statement with options]
A) Option A
B) Option B
C) Option C
D) Option D
**Answer:** [Correct answer with explanation]

### Question 2
[Problem statement with options]
A) Option A
B) Option B
C) Option C
D) Option D
**Answer:** [Correct answer with explanation]

### Question 3
[Problem statement with options]
A) Option A
B) Option B
C) Option C
D) Option D
**Answer:** [Correct answer with explanation]

## More Practice
Attempt these problems before checking solutions.
Time yourself: 2 minutes per question.
""",
        "advanced": f"""# {topic_name} - Advanced Techniques

## Expert-Level Strategies

### Technique 1: Quick Elimination
Learn to eliminate wrong options quickly.

### Technique 2: Shortcut Methods
Discover faster ways to solve problems.

### Technique 3: Pattern Detection
Advanced pattern recognition techniques.

## Complex Examples

### Example 1: High Difficulty
[Complex problem with multi-step solution]

### Example 2: Multi-Concept
[Problem combining multiple concepts]

## Pro Tips
1. Always look for alternative solutions
2. Time management is crucial
3. Practice with timed mock tests
"""
    }
    return contents.get(content_type, contents["intro"])


# ============================================================================
# QUESTION TEMPLATES (1000+ questions)
# ============================================================================

def generate_questions_for_topic(topic_name: str, topic_id: uuid.UUID, difficulty_distribution: Dict[Difficulty, int]) -> List[Dict]:
    """Generate questions for a topic."""
    questions = []
    
    question_templates = {
        "Analogies": [
            {"text": "Book : Reading :: Food : ?", "options": ["Hunger", "Eat", "Cook", "Kitchen"], "answer": "B", "explanation": "A book is used for reading. Similarly, food is used for eating."},
            {"text": "Cow : Milk :: Bee : ?", "options": ["Flower", "Honey", "Wax", "Hive"], "answer": "B", "explanation": "Cow gives milk. Similarly, bee gives honey."},
            {"text": "Painter : Canvas :: Sculptor : ?", "options": ["Chisel", "Stone", "Museum", "Statue"], "answer": "B", "explanation": "A painter works on canvas. A sculptor works on stone."},
        ],
        "Blood Relations": [
            {"text": "A is B's sister. B is C's father. How is A related to C?", "options": ["Aunt", "Uncle", "Sister", "Cannot determine"], "answer": "A", "explanation": "A is B's sister and B is C's father, so A is C's aunt."},
            {"text": "Pointing to a man, a woman said 'His mother is the only daughter of my mother'. How is the woman related to the man?", "options": ["Mother", "Grandmother", "Sister", "Daughter"], "answer": "A", "explanation": "The only daughter of her mother is herself. So the woman is the man's mother."},
        ],
        "Coding-Decoding": [
            {"text": "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?", "options": ["MFEJDJOF", "EIKICINM", "FNEDICIM", "ENJDJOFM"], "answer": "B", "explanation": "Each letter is replaced by the one opposite in the alphabet, then reversed."},
            {"text": "If APPLE is coded as ELPPA, how is MANGO coded?", "options": ["OGNAM", "OGNMA", "OGANM", "NGOMA"], "answer": "A", "explanation": "The word is reversed: MANGO -> OGNAM"},
        ],
        "Series": [
            {"text": "Find the missing number: 2, 6, 12, 20, 30, ?", "options": ["40", "42", "44", "46"], "answer": "B", "explanation": "The pattern is n(n+1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42"},
            {"text": "What comes next: AZ, BY, CX, DW, ?", "options": ["EV", "EU", "FV", "EW"], "answer": "A", "explanation": "First letters go forward, second letters go backward."},
        ],
        "Percentage": [
            {"text": "If 15% of a number is 45, what is the number?", "options": ["300", "350", "400", "450"], "answer": "A", "explanation": "Let x be the number. 15% of x = 45, so x = 45 * 100 / 15 = 300"},
            {"text": "A shopkeeper increases the price of an article by 20% and then offers a discount of 10%. What is the net effect?", "options": ["8% increase", "10% increase", "12% increase", "No change"], "answer": "A", "explanation": "Net effect = 20 - 10 - (20*10/100) = 8% increase"},
        ],
        "Profit and Loss": [
            {"text": "A man buys an article for Rs. 800 and sells it at a profit of 20%. What is the selling price?", "options": ["Rs. 920", "Rs. 960", "Rs. 1000", "Rs. 880"], "answer": "B", "explanation": "SP = CP * (100 + Profit%) / 100 = 800 * 120 / 100 = Rs. 960"},
            {"text": "If the cost price of 20 articles equals the selling price of 25 articles, find the loss percentage.", "options": ["20%", "25%", "15%", "10%"], "answer": "A", "explanation": "Loss% = (25-20)/25 * 100 = 20%"},
        ],
        "Time and Work": [
            {"text": "A can do a work in 10 days and B can do it in 20 days. In how many days can they complete together?", "options": ["6.67 days", "7.5 days", "8 days", "15 days"], "answer": "A", "explanation": "Combined rate = 1/10 + 1/20 = 3/20, so time = 20/3 = 6.67 days"},
            {"text": "If 4 men can paint a wall in 12 days, how long will 6 men take?", "options": ["6 days", "8 days", "9 days", "18 days"], "answer": "B", "explanation": "Work = 4*12 = 48 man-days. Time = 48/6 = 8 days"},
        ],
        "Speed Distance Time": [
            {"text": "A train 100m long passes a platform 150m long in 10 seconds. What is its speed?", "options": ["25 m/s", "30 m/s", "15 m/s", "20 m/s"], "answer": "A", "explanation": "Distance = 100 + 150 = 250m. Speed = 250/10 = 25 m/s"},
            {"text": "A car travels at 60 km/h and returns at 40 km/h. What is the average speed for the entire journey?", "options": ["50 km/h", "48 km/h", "52 km/h", "45 km/h"], "answer": "B", "explanation": "Average speed = (2*60*40)/(60+40) = 4800/100 = 48 km/h"},
        ],
    }
    
    base_questions = question_templates.get(topic_name, [
        {"text": f"Sample question for {topic_name} - 1", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Explanation for the answer."},
        {"text": f"Sample question for {topic_name} - 2", "options": ["A", "B", "C", "D"], "answer": "B", "explanation": "Explanation for the answer."},
        {"text": f"Sample question for {topic_name} - 3", "options": ["A", "B", "C", "D"], "answer": "C", "explanation": "Explanation for the answer."},
        {"text": f"Sample question for {topic_name} - 4", "options": ["A", "B", "C", "D"], "answer": "D", "explanation": "Explanation for the answer."},
        {"text": f"Sample question for {topic_name} - 5", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Explanation for the answer."},
    ])
    
    # Replicate questions to reach desired count
    easy_count = difficulty_distribution.get(Difficulty.EASY, 5)
    medium_count = difficulty_distribution.get(Difficulty.MEDIUM, 10)
    hard_count = difficulty_distribution.get(Difficulty.HARD, 3)
    total = easy_count + medium_count + hard_count
    
    for i in range(total):
        template = base_questions[i % len(base_questions)]
        
        if i < easy_count:
            diff = Difficulty.EASY
        elif i < easy_count + medium_count:
            diff = Difficulty.MEDIUM
        else:
            diff = Difficulty.HARD
        
        question = {
            "topic_id": topic_id,
            "question_text": f"{template['text']} (Q{i+1})",
            "question_type": QuestionType.MCQ,
            "options": json.dumps(template["options"]),
            "correct_answer": template["answer"],
            "explanation": template["explanation"],
            "difficulty": diff,
            "marks": 2.0,
            "negative_marks": 0.5,
            "is_premium": diff == Difficulty.HARD,
            "source": f"SSC GD Question Bank",
        }
        questions.append(question)
    
    return questions


# ============================================================================
# TEST SERIES CONFIGURATION (20+ tests)
# ============================================================================

TEST_SERIES_CONFIG = [
    # 5 Full-Length Tests (100 Q, 90 min)
    *[{
        "title": f"SSC GD Full Length Mock Test {i}",
        "description": f"Complete full-length mock test {i} for SSC GD exam pattern. Covers all subjects.",
        "test_type": TestType.FULL_LENGTH,
        "duration_minutes": 90,
        "total_questions": 100,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": i > 3,
        "passing_percentage": 35.0,
        "instructions": "1. All questions are compulsory.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Total time is 90 minutes.\n5. Do not refresh the page.",
    } for i in range(1, 6)],
    
    # 5 Sectional Tests (25 Q, 30 min each)
    *[{
        "title": f"General Intelligence Sectional Test {i}",
        "description": f"Sectional test for General Intelligence & Reasoning - Set {i}",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "passing_percentage": 35.0,
        "instructions": "1. 25 questions from General Intelligence & Reasoning.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Time limit is 30 minutes.",
    } for i in range(1, 6)],
    *[{
        "title": f"General Knowledge Sectional Test {i}",
        "description": f"Sectional test for General Knowledge & General Awareness - Set {i}",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "passing_percentage": 35.0,
        "instructions": "1. 25 questions from General Knowledge.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Time limit is 30 minutes.",
    } for i in range(1, 6)],
    
    # 5 Chapter Tests (15 Q, 20 min)
    *[{
        "title": f"Number System Chapter Test {i}",
        "description": f"Chapter test for Number System - Set {i}",
        "test_type": TestType.CHAPTER,
        "duration_minutes": 20,
        "total_questions": 15,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "passing_percentage": 40.0,
        "instructions": "1. 15 questions from Number System chapter.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Time limit is 20 minutes.",
    } for i in range(1, 6)],
    
    # 5 Quick Quizzes (5 Q, 5 min)
    *[{
        "title": f"Reasoning Quick Quiz {i}",
        "description": f"Quick 5-minute reasoning quiz - Set {i}",
        "test_type": TestType.QUIZ,
        "duration_minutes": 5,
        "total_questions": 5,
        "marks_per_question": 2.0,
        "negative_marking": False,
        "negative_marks_per_question": 0.0,
        "is_premium": False,
        "passing_percentage": 40.0,
        "instructions": "1. Quick 5-question quiz.\n2. Each correct answer carries 2 marks.\n3. No negative marking.\n4. Time limit is 5 minutes.",
    } for i in range(1, 6)],
]


# ============================================================================
# PYQ DATA (2019-2024)
# ============================================================================

PYQ_TOPICS = {
    2019: [
        {"topic": "Coding-Decoding", "count": 8},
        {"topic": "Series", "count": 6},
        {"topic": "Blood Relations", "count": 5},
    ],
    2020: [
        {"topic": "Analogs", "count": 7},
        {"topic": "Classification", "count": 6},
        {"topic": "Syllogism", "count": 5},
    ],
    2021: [
        {"topic": "Arrangement", "count": 8},
        {"topic": "Direction", "count": 6},
        {"topic": "Missing Number", "count": 5},
    ],
    2022: [
        {"topic": "Cube and Dice", "count": 7},
        {"topic": "Mirror Image", "count": 5},
        {"topic": "Series", "count": 6},
    ],
    2023: [
        {"topic": "Coding-Decoding", "count": 8},
        {"topic": "Blood Relations", "count": 6},
        {"topic": "Analogs", "count": 5},
    ],
    2024: [
        {"topic": "Syllogism", "count": 7},
        {"topic": "Classification", "count": 6},
        {"topic": "Arrangement", "count": 5},
    ],
}


def generate_pyqs_for_year(year: int, topic_map: Dict[str, Any]) -> List[Dict]:
    """Generate PYQs for a specific year."""
    pyqs = []
    for topic_data in PYQ_TOPICS.get(year, []):
        topic_name = topic_data["topic"]
        count = topic_data["count"]
        
        if topic_name in topic_map:
            for i in range(count):
                pyq = {
                    "topic_id": topic_map[topic_name].id,  # Extract UUID from Topic object
                    "question_text": f"SSC GD {year} - {topic_name} Question {i+1}",
                    "question_type": QuestionType.MCQ,
                    "options": json.dumps(["Option A", "Option B", "Option C", "Option D"]),
                    "correct_answer": "A",
                    "explanation": f"This is a previous year question from SSC GD {year} examination.",
                    "difficulty": Difficulty.MEDIUM,
                    "marks": 2.0,
                    "negative_marks": 0.5,
                    "is_premium": False,
                    "source": f"SSC GD {year}",
                    "exam_year": year,
                }
                pyqs.append(pyq)
    
    return pyqs


# ============================================================================
# PHYSICAL TRAINING PLANS
# ============================================================================

PHYSICAL_PLANS = [
    # Running Plans
    {
        "title": "5K Run Training Plan (Male)",
        "description": "8-week training program to build endurance for 1.5km PET run. Target: Complete 1.5km in 7 minutes.",
        "plan_type": PhysicalPlanType.RUNNING,
        "target_gender": PhysicalGoalGender.MALE,
        "duration_weeks": 8,
        "difficulty_level": "intermediate",
        "is_premium": False,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Easy Run", "duration": 30, "description": "Light jogging at comfortable pace"},
            {"day": "Tuesday", "activity": "Sprint Intervals", "duration": 25, "description": "100m sprints with 30s rest"},
            {"day": "Wednesday", "activity": "Rest", "duration": 0, "description": "Recovery day"},
            {"day": "Thursday", "activity": "Tempo Run", "duration": 35, "description": "Run at moderate pace"},
            {"day": "Friday", "activity": "HIIT", "duration": 20, "description": "High intensity intervals"},
            {"day": "Saturday", "activity": "Long Run", "duration": 45, "description": "Build endurance"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest"},
        ]),
        "targets": json.dumps({"distance_km": 1.5, "time_minutes": 7, "pace_min_per_km": 4.67}),
    },
    {
        "title": "5K Run Training Plan (Female)",
        "description": "8-week training program to build endurance for 800m PET run. Target: Complete 800m in 4 minutes.",
        "plan_type": PhysicalPlanType.RUNNING,
        "target_gender": PhysicalGoalGender.FEMALE,
        "duration_weeks": 8,
        "difficulty_level": "intermediate",
        "is_premium": False,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Easy Run", "duration": 25, "description": "Light jogging at comfortable pace"},
            {"day": "Tuesday", "activity": "Sprint Intervals", "duration": 20, "description": "80m sprints with 30s rest"},
            {"day": "Wednesday", "activity": "Rest", "duration": 0, "description": "Recovery day"},
            {"day": "Thursday", "activity": "Tempo Run", "duration": 30, "description": "Run at moderate pace"},
            {"day": "Friday", "activity": "HIIT", "duration": 15, "description": "High intensity intervals"},
            {"day": "Saturday", "activity": "Long Run", "duration": 35, "description": "Build endurance"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest"},
        ]),
        "targets": json.dumps({"distance_km": 0.8, "time_minutes": 4, "pace_min_per_km": 5.0}),
    },
    {
        "title": "10K Running Plan (Advanced)",
        "description": "12-week advanced program for serious runners targeting excellent PET performance.",
        "plan_type": PhysicalPlanType.RUNNING,
        "target_gender": PhysicalGoalGender.ALL,
        "duration_weeks": 12,
        "difficulty_level": "advanced",
        "is_premium": True,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Interval Training", "duration": 40, "description": "400m repeats at race pace"},
            {"day": "Tuesday", "activity": "Easy Run", "duration": 30, "description": "Recovery pace"},
            {"day": "Wednesday", "activity": "Tempo Run", "duration": 45, "description": "Threshold training"},
            {"day": "Thursday", "activity": "Rest", "duration": 0, "description": "Active recovery"},
            {"day": "Friday", "activity": "Fartlek", "duration": 35, "description": "Speed play"},
            {"day": "Saturday", "activity": "Long Run", "duration": 60, "description": "Endurance building"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest"},
        ]),
        "targets": json.dumps({"distance_km": 1.5, "time_minutes": 6, "pace_min_per_km": 4.0}),
    },
    
    # Strength Plans
    {
        "title": "Strength Training Plan (Male)",
        "description": "8-week strength program for PET preparation. Focus on explosive power for long jump and high jump.",
        "plan_type": PhysicalPlanType.STRENGTH,
        "target_gender": PhysicalGoalGender.MALE,
        "duration_weeks": 8,
        "difficulty_level": "intermediate",
        "is_premium": False,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Lower Body", "sets": 4, "reps": "8-10", "description": "Squats, lunges, calf raises"},
            {"day": "Tuesday", "activity": "Upper Body", "sets": 3, "reps": "10-12", "description": "Push-ups, pull-ups, rows"},
            {"day": "Wednesday", "activity": "Plyometrics", "sets": 3, "reps": "8", "description": "Jump training, box jumps"},
            {"day": "Thursday", "activity": "Rest", "duration": 0, "description": "Recovery"},
            {"day": "Friday", "activity": "Full Body", "sets": 4, "reps": "8-10", "description": "Compound movements"},
            {"day": "Saturday", "activity": "Core & Flexibility", "duration": 30, "description": "Planks, stretching"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest"},
        ]),
        "targets": json.dumps({"long_jump_m": 2.65, "high_jump_m": 1.20}),
    },
    {
        "title": "Strength Training Plan (Female)",
        "description": "8-week strength program for female candidates. Focus on explosive power for long jump and high jump.",
        "plan_type": PhysicalPlanType.STRENGTH,
        "target_gender": PhysicalGoalGender.FEMALE,
        "duration_weeks": 8,
        "difficulty_level": "intermediate",
        "is_premium": False,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Lower Body", "sets": 3, "reps": "10-12", "description": "Squats, lunges, calf raises"},
            {"day": "Tuesday", "activity": "Upper Body", "sets": 3, "reps": "12-15", "description": "Push-ups (modified), rows"},
            {"day": "Wednesday", "activity": "Plyometrics", "sets": 3, "reps": "8", "description": "Jump training, box jumps"},
            {"day": "Thursday", "activity": "Rest", "duration": 0, "description": "Recovery"},
            {"day": "Friday", "activity": "Full Body", "sets": 3, "reps": "10-12", "description": "Compound movements"},
            {"day": "Saturday", "activity": "Core & Flexibility", "duration": 30, "description": "Planks, stretching"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest"},
        ]),
        "targets": json.dumps({"long_jump_m": 2.35, "high_jump_m": 1.00}),
    },
    
    # Flexibility Plans
    {
        "title": "Flexibility & Mobility Plan",
        "description": "Daily stretching routine to improve flexibility for PET activities and prevent injuries.",
        "plan_type": PhysicalPlanType.FLEXIBILITY,
        "target_gender": PhysicalGoalGender.ALL,
        "duration_weeks": 4,
        "difficulty_level": "beginner",
        "is_premium": False,
        "exercises": json.dumps([
            {"day": "Daily", "activity": "Morning Stretch", "duration": 15, "description": "Full body stretch routine"},
            {"day": "Daily", "activity": "Hip Flexors", "duration": 10, "description": "Focus on hip flexibility for running"},
            {"day": "Daily", "activity": "Hamstring Stretch", "duration": 10, "description": "Critical for sprinting"},
            {"day": "Daily", "activity": "Shoulder Mobility", "duration": 10, "description": "Arm circles, cross-body stretch"},
        ]),
        "targets": json.dumps({"flexibility_level": "improved", "injury_prevention": True}),
    },
    
    # Mixed Plans
    {
        "title": "Complete PET Preparation Plan (Male)",
        "description": "12-week comprehensive program covering running, strength, and flexibility for complete PET readiness.",
        "plan_type": PhysicalPlanType.MIXED,
        "target_gender": PhysicalGoalGender.MALE,
        "duration_weeks": 12,
        "difficulty_level": "advanced",
        "is_premium": True,
        "exercises": json.dumps([
            {"day": "Monday", "activity": "Running + Strength", "duration": 50, "description": "5K run followed by lower body strength"},
            {"day": "Tuesday", "activity": "Plyometrics", "duration": 40, "description": "Jump training for long jump practice"},
            {"day": "Wednesday", "activity": "Easy Run + Core", "duration": 45, "description": "Light jog and core workout"},
            {"day": "Thursday", "activity": "Upper Body Strength", "duration": 45, "description": "Push, pull, and arm exercises"},
            {"day": "Friday", "activity": "Tempo Run", "duration": 40, "description": "Speed work at race pace"},
            {"day": "Saturday", "activity": "Long Run + Flexibility", "duration": 60, "description": "Endurance run and stretching"},
            {"day": "Sunday", "activity": "Rest", "duration": 0, "description": "Complete rest and recovery"},
        ]),
        "targets": json.dumps({
            "distance_km": 1.5, 
            "time_minutes": 6.5, 
            "long_jump_m": 2.65, 
            "high_jump_m": 1.20
        }),
    },
]


# ============================================================================
# DOCUMENT CHECKLISTS
# ============================================================================

DOCUMENT_CHECKLISTS = [
    # PST Stage Documents
    {
        "title": "10th Class Marksheet",
        "description": "Original and photocopy of 10th class marksheet or equivalent",
        "stage": DocumentStage.PST,
        "document_type": "marksheet",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Upload clear scanned copy of your 10th marksheet. Both sides if required.",
        "order_index": 1,
    },
    {
        "title": "12th Class Marksheet",
        "description": "Original and photocopy of 12th class marksheet or equivalent",
        "stage": DocumentStage.PST,
        "document_type": "marksheet",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Upload clear scanned copy of your 12th marksheet.",
        "order_index": 2,
    },
    {
        "title": "Caste Certificate (if applicable)",
        "description": "Caste certificate issued by competent authority for SC/ST/OBC candidates",
        "stage": DocumentStage.PST,
        "document_type": "certificate",
        "is_required": False,
        "is_required_for_all": False,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Only for reserved category candidates. Upload if you want to claim reservation benefit.",
        "order_index": 3,
    },
    
    # PET Stage Documents
    {
        "title": "Physical Efficiency Test Certificate",
        "description": "Certificate from recognized doctor or physical trainer confirming fitness",
        "stage": DocumentStage.PET,
        "document_type": "certificate",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Download format from official website. Get it filled from registered medical practitioner.",
        "order_index": 4,
    },
    {
        "title": "Chest Measurement Certificate (Male Only)",
        "description": "Certificate showing chest measurements (unextended and extended) for male candidates",
        "stage": DocumentStage.PET,
        "document_type": "certificate",
        "is_required": True,
        "is_required_for_all": False,
        "is_required_for_gender": "male",
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Required for male candidates only. Minimum 80cm without expansion, 5cm expansion required.",
        "order_index": 5,
    },
    
    # Medical Stage Documents
    {
        "title": "Medical Fitness Certificate",
        "description": "Certificate from Government Hospital (MBBS doctor) confirming medical fitness",
        "stage": DocumentStage.MEDICAL,
        "document_type": "certificate",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Must be from Government Hospital or CGHS empaneled hospital. Format available on official website.",
        "order_index": 6,
    },
    {
        "title": "Eye Certificate",
        "description": "Certificate from ophthalmologist confirming vision meets required standards",
        "stage": DocumentStage.MEDICAL,
        "document_type": "certificate",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 3,
        "instructions": "Must mention visual standards - Near vision and Distant vision specifications.",
        "order_index": 7,
    },
    
    # Document Verification Stage
    {
        "title": "Valid Identity Proof",
        "description": "Aadhaar Card / Voter ID / PAN Card / Driving License / Passport",
        "stage": DocumentStage.DOCUMENT_VERIFICATION,
        "document_type": "id_proof",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Upload clear copy of any one valid identity proof with photograph.",
        "order_index": 8,
    },
    {
        "title": "Domicile Certificate",
        "description": "Domicile certificate or Residence certificate of the state",
        "stage": DocumentStage.DOCUMENT_VERIFICATION,
        "document_type": "certificate",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 5,
        "instructions": "Issued by competent authority of the state where candidate is domicile.",
        "order_index": 9,
    },
    {
        "title": "Bank Passbook Copy",
        "description": "First page of bank passbook or cancelled cheque showing account details",
        "stage": DocumentStage.DOCUMENT_VERIFICATION,
        "document_type": "other",
        "is_required": True,
        "is_required_for_all": True,
        "accepted_formats": "PDF,JPG,PNG",
        "max_file_size_mb": 3,
        "instructions": "Required for salary crediting. Ensure account is in candidate's name.",
        "order_index": 10,
    },
]


# ============================================================================
# SEED FUNCTIONS
# ============================================================================

async def seed_subjects(db: AsyncSession) -> Dict[str, Subject]:
    """Seed SSC GD subjects."""
    print("Seeding subjects...")
    subjects = {}
    
    for subj_data in SSC_GD_SUBJECTS:
        # Check if subject already exists
        result = await db.execute(
            select(Subject).where(Subject.code == subj_data["code"])
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            subjects[existing.code] = existing
            print(f"  Subject '{existing.name}' already exists, skipping...")
        else:
            subject = Subject(id=uuid.uuid4(), **subj_data)
            db.add(subject)
            subjects[subj_data["code"]] = subject
            print(f"  Created subject: {subj_data['name']}")
    
    await db.commit()
    print(f"Seeded {len(subjects)} subjects")
    return subjects


async def seed_topics(db: AsyncSession, subjects: Dict[str, Subject]) -> Dict[str, Topic]:
    """Seed SSC GD topics."""
    print("Seeding topics...")
    topics = {}
    
    for subj_code, topic_list in SSC_GD_TOPICS.items():
        subject = subjects.get(subj_code)
        if not subject:
            print(f"  Subject {subj_code} not found, skipping topics...")
            continue
        
        for topic_data in topic_list:
            # Check if topic already exists
            result = await db.execute(
                select(Topic).where(
                    Topic.subject_id == subject.id,
                    Topic.name == topic_data["name"]
                )
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                topics[existing.name] = existing
                print(f"  Topic '{existing.name}' already exists, skipping...")
            else:
                topic = Topic(
                    id=uuid.uuid4(),
                    subject_id=subject.id,
                    **topic_data
                )
                db.add(topic)
                topics[topic_data["name"]] = topic
                print(f"  Created topic: {topic_data['name']}")
    
    await db.commit()
    print(f"Seeded {len(topics)} topics")
    return topics


async def seed_lessons(db: AsyncSession, topics: Dict[str, Topic]) -> int:
    """Seed SSC GD lessons."""
    print("Seeding lessons...")
    lessons_count = 0
    
    for topic_name, topic in topics.items():
        # Generate 5-6 lessons per topic
        lessons_data = generate_lessons_for_topic(topic_name, topic.id)
        
        for lesson_data in lessons_data:
            # Check if lesson already exists
            result = await db.execute(
                select(Lesson).where(
                    Lesson.topic_id == topic.id,
                    Lesson.title == lesson_data["title"]
                )
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                lesson = Lesson(id=uuid.uuid4(), topic_id=topic.id, **lesson_data)
                db.add(lesson)
                lessons_count += 1
    
    await db.commit()
    print(f"Seeded {lessons_count} lessons")
    return lessons_count


async def seed_questions(db: AsyncSession, topics: Dict[str, Topic]) -> int:
    """Seed SSC GD questions (1000+)."""
    print("Seeding questions...")
    questions_count = 0
    
    # Difficulty distribution per topic type
    difficulty_map = {
        "GIR": {Difficulty.EASY: 8, Difficulty.MEDIUM: 15, Difficulty.HARD: 5},
        "GKA": {Difficulty.EASY: 10, Difficulty.MEDIUM: 20, Difficulty.HARD: 8},
        "EM": {Difficulty.EASY: 8, Difficulty.MEDIUM: 15, Difficulty.HARD: 5},
        "EH": {Difficulty.EASY: 8, Difficulty.MEDIUM: 15, Difficulty.HARD: 5},
    }
    
    # Get subject code for topic
    topic_subject_map = {}
    for subj_code, topic_list in SSC_GD_TOPICS.items():
        for t in topic_list:
            topic_subject_map[t["name"]] = subj_code
    
    for topic_name, topic in topics.items():
        subject_code = topic_subject_map.get(topic_name, "GIR")
        difficulty_dist = difficulty_map.get(subject_code, {Difficulty.EASY: 5, Difficulty.MEDIUM: 10, Difficulty.HARD: 3})
        
        # Generate questions for this topic
        questions_data = generate_questions_for_topic(topic_name, topic.id, difficulty_dist)
        
        for q_data in questions_data:
            question = Question(id=uuid.uuid4(), **q_data)
            db.add(question)
            questions_count += 1
    
    await db.commit()
    print(f"Seeded {questions_count} questions")
    return questions_count


async def seed_pyqs(db: AsyncSession, topics: Dict[str, Topic]) -> int:
    """Seed Previous Year Questions (2019-2024)."""
    print("Seeding PYQs...")
    pyqs_count = 0
    
    for year in range(2019, 2025):
        pyqs = generate_pyqs_for_year(year, topics)
        for pyq_data in pyqs:
            pyq = Question(id=uuid.uuid4(), **pyq_data)
            db.add(pyq)
            pyqs_count += 1
    
    await db.commit()
    print(f"Seeded {pyqs_count} PYQs")
    return pyqs_count


async def seed_test_series(db: AsyncSession) -> int:
    """Seed test series (20+ tests)."""
    print("Seeding test series...")
    ts_count = 0
    
    for ts_data in TEST_SERIES_CONFIG:
        test_series = TestSeries(id=uuid.uuid4(), **ts_data)
        db.add(test_series)
        ts_count += 1
        print(f"  Created test series: {ts_data['title']}")
    
    await db.commit()
    print(f"Seeded {ts_count} test series")
    return ts_count


async def seed_physical_plans(db: AsyncSession) -> int:
    """Seed physical training plans."""
    print("Seeding physical training plans...")
    plans_count = 0
    
    for plan_data in PHYSICAL_PLANS:
        plan = PhysicalPlan(id=uuid.uuid4(), **plan_data)
        db.add(plan)
        plans_count += 1
        print(f"  Created physical plan: {plan_data['title']}")
    
    await db.commit()
    print(f"Seeded {plans_count} physical plans")
    return plans_count


async def seed_document_checklists(db: AsyncSession) -> int:
    """Seed document checklists."""
    print("Seeding document checklists...")
    docs_count = 0
    
    for doc_data in DOCUMENT_CHECKLISTS:
        # Check if document already exists
        result = await db.execute(
            select(DocumentChecklist).where(
                DocumentChecklist.title == doc_data["title"],
                DocumentChecklist.stage == doc_data["stage"]
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            doc = DocumentChecklist(id=uuid.uuid4(), **doc_data)
            db.add(doc)
            docs_count += 1
            print(f"  Created document checklist: {doc_data['title']}")
        else:
            print(f"  Document '{existing.title}' already exists, skipping...")
    
    await db.commit()
    print(f"Seeded {docs_count} document checklists")
    return docs_count


async def seed_all():
    """Main seed function to seed all SSC GD content."""
    print("=" * 60)
    print("Starting SSC GD Content Seed Process...")
    print("=" * 60)
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # Seed all content
            subjects = await seed_subjects(db)
            topics = await seed_topics(db, subjects)
            lessons_count = await seed_lessons(db, topics)
            questions_count = await seed_questions(db, topics)
            pyqs_count = await seed_pyqs(db, topics)
            test_series_count = await seed_test_series(db)
            physical_count = await seed_physical_plans(db)
            docs_count = await seed_document_checklists(db)
            
            print("\n" + "=" * 60)
            print("SEED SUMMARY")
            print("=" * 60)
            print(f"  Subjects: {len(subjects)}")
            print(f"  Topics: {len(topics)}")
            print(f"  Lessons: {lessons_count}")
            print(f"  Questions: {questions_count}")
            print(f"  PYQs: {pyqs_count}")
            print(f"  Test Series: {test_series_count}")
            print(f"  Physical Plans: {physical_count}")
            print(f"  Document Checklists: {docs_count}")
            print("=" * 60)
            print("Seed completed successfully!")
            print("=" * 60)
            
        except Exception as e:
            print(f"Error during seed: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_all())
