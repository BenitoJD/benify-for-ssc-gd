"""
Seed script for question bank and test series.

This script populates the database with sample questions and test series
for development and testing purposes.
"""
import asyncio
import json
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import AsyncSessionLocal, init_db
from ..syllabus.models import Subject, Topic
from ..questions.models import Question, QuestionType, Difficulty
from .models import TestSeries, TestType


# Sample questions organized by topic
SAMPLE_QUESTIONS = {
    "general_intelligence": [
        {
            "question_text": "Find the missing number: 2, 6, 12, 20, 30, ?",
            "options": ["40", "42", "44", "46"],
            "correct_answer": "B",
            "explanation": "The pattern is n(n+1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "If APPLE is coded as ELPPA, how is MANGO coded?",
            "options": ["OGNAM", "OGNMA", "OGANM", "NGOMA"],
            "correct_answer": "A",
            "explanation": "The word is reversed: MANGO -> OGNAM",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "Complete the analogy: Doctor : Hospital :: Teacher : ?",
            "options": ["Student", "School", "Book", "Education"],
            "correct_answer": "B",
            "explanation": "A doctor works in a hospital, similarly a teacher works in a school.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "What comes next in the series: AZ, BY, CX, DW, ?",
            "options": ["EV", "EU", "FV", "EW"],
            "correct_answer": "A",
            "explanation": "First letters go forward (A, B, C, D, E), second letters go backward (Z, Y, X, W, V)",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "A is B's sister. B is C's father. How is A related to C?",
            "options": ["Aunt", "Uncle", "Sister", "Cannot determine"],
            "correct_answer": "A",
            "explanation": "A is B's sister and B is C's father, so A is C's aunt.",
            "difficulty": Difficulty.MEDIUM,
        },
    ],
    "general_knowledge": [
        {
            "question_text": "Which planet is known as the Red Planet?",
            "options": ["Venus", "Mars", "Jupiter", "Saturn"],
            "correct_answer": "B",
            "explanation": "Mars is called the Red Planet due to the presence of iron oxide on its surface.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "Who wrote the Indian National Anthem?",
            "options": ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Swami Vivekananda", "Mahatma Gandhi"],
            "correct_answer": "B",
            "explanation": "Rabindranath Tagore wrote the Indian National Anthem 'Jana Gana Mana'.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "The headquarters of the Reserve Bank of India is located in:",
            "options": ["Mumbai", "Delhi", "Kolkata", "Chennai"],
            "correct_answer": "A",
            "explanation": "RBI's headquarters is in Mumbai.",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "Which is the longest river in India?",
            "options": ["Yamuna", "Brahmaputra", "Ganga", "Godavari"],
            "correct_answer": "C",
            "explanation": "Ganga is the longest river in India at 2,525 km.",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "In which year did India gain independence?",
            "options": ["1945", "1946", "1947", "1948"],
            "correct_answer": "C",
            "explanation": "India gained independence on August 15, 1947.",
            "difficulty": Difficulty.EASY,
        },
    ],
    "mathematics": [
        {
            "question_text": "If 15% of a number is 45, what is the number?",
            "options": ["300", "350", "400", "450"],
            "correct_answer": "A",
            "explanation": "Let the number be x. 15% of x = 45, so x = 45 * 100 / 15 = 300",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "The average of first 10 natural numbers is:",
            "options": ["5", "5.5", "6", "6.5"],
            "correct_answer": "B",
            "explanation": "Sum of first n natural numbers = n(n+1)/2 = 10*11/2 = 55. Average = 55/10 = 5.5",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "A train 100m long passes a platform 150m long in 10 seconds. What is its speed?",
            "options": ["25 m/s", "30 m/s", "15 m/s", "20 m/s"],
            "correct_answer": "A",
            "explanation": "Distance covered = 100 + 150 = 250m. Speed = 250/10 = 25 m/s",
            "difficulty": Difficulty.HARD,
        },
        {
            "question_text": "The ratio of ages of A and B is 3:4. If A is 15 years old, how old is B?",
            "options": ["18 years", "20 years", "21 years", "24 years"],
            "correct_answer": "B",
            "explanation": "A:B = 3:4. If A=15, then 3 parts = 15, 1 part = 5, so B = 4*5 = 20 years",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "What is the compound interest on Rs. 10,000 at 10% p.a. for 2 years?",
            "options": ["Rs. 2,000", "Rs. 2,100", "Rs. 2,200", "Rs. 2,500"],
            "correct_answer": "B",
            "explanation": "CI = P(1 + r/100)^n - P = 10000(1.1)^2 - 10000 = 12100 - 10000 = 2100",
            "difficulty": Difficulty.MEDIUM,
        },
    ],
    "english": [
        {
            "question_text": "Choose the synonym of 'Abundant':",
            "options": ["Scarce", "Plentiful", "Expensive", "Rare"],
            "correct_answer": "B",
            "explanation": "Abundant means existing in large quantities; plentiful is its synonym.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "Choose the antonym of 'Brave':",
            "options": ["Courageous", "Fearless", "Cowardly", "Bold"],
            "correct_answer": "C",
            "explanation": "Cowardly is the opposite of brave.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "Fill in the blank: She ___ to the market yesterday.",
            "options": ["goes", "went", "going", "gone"],
            "correct_answer": "B",
            "explanation": "The sentence is in past tense, so 'went' is correct.",
            "difficulty": Difficulty.EASY,
        },
        {
            "question_text": "Which sentence is grammatically correct?",
            "options": [
                "He don't know anything.",
                "He doesn't knows anything.",
                "He doesn't know anything.",
                "He not know anything."
            ],
            "correct_answer": "C",
            "explanation": "'He doesn't know anything' is the correct grammatical form.",
            "difficulty": Difficulty.MEDIUM,
        },
        {
            "question_text": "The idiom 'Break the ice' means:",
            "options": [
                "To break something cold",
                "To start a conversation awkwardly",
                "To shatter frozen objects",
                "To begin a difficult task"
            ],
            "correct_answer": "B",
            "explanation": "'Break the ice' means to initiate conversation in a social setting.",
            "difficulty": Difficulty.MEDIUM,
        },
    ],
}

# Sample test series
SAMPLE_TEST_SERIES = [
    {
        "title": "SSC GD Full Length Mock Test 1",
        "description": "Complete full-length mock test for SSC GD exam pattern",
        "test_type": TestType.FULL_LENGTH,
        "duration_minutes": 90,
        "total_questions": 100,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. All questions are compulsory.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Total time is 90 minutes.",
        "passing_percentage": 35.0,
    },
    {
        "title": "SSC GD Full Length Mock Test 2",
        "description": "Complete full-length mock test for SSC GD exam pattern",
        "test_type": TestType.FULL_LENGTH,
        "duration_minutes": 90,
        "total_questions": 100,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. All questions are compulsory.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.\n4. Total time is 90 minutes.",
        "passing_percentage": 35.0,
    },
    {
        "title": "General Intelligence Sectional Test",
        "description": "Sectional test for General Intelligence & Reasoning",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. This is a sectional test for General Intelligence.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.",
        "passing_percentage": 35.0,
    },
    {
        "title": "General Knowledge Sectional Test",
        "description": "Sectional test for General Knowledge & General Awareness",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. This is a sectional test for General Knowledge.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.",
        "passing_percentage": 35.0,
    },
    {
        "title": "Mathematics Sectional Test",
        "description": "Sectional test for Elementary Mathematics",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. This is a sectional test for Mathematics.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.",
        "passing_percentage": 35.0,
    },
    {
        "title": "English Sectional Test",
        "description": "Sectional test for English Language",
        "test_type": TestType.SECTIONAL,
        "duration_minutes": 30,
        "total_questions": 25,
        "marks_per_question": 2.0,
        "negative_marking": True,
        "negative_marks_per_question": 0.5,
        "is_premium": False,
        "instructions": "1. This is a sectional test for English.\n2. Each correct answer carries 2 marks.\n3. Each wrong answer carries -0.5 marks.",
        "passing_percentage": 35.0,
    },
    {
        "title": "Reasoning Quick Quiz",
        "description": "Quick 5-minute quiz on reasoning topics",
        "test_type": TestType.QUIZ,
        "duration_minutes": 5,
        "total_questions": 5,
        "marks_per_question": 2.0,
        "negative_marking": False,
        "negative_marks_per_question": 0.0,
        "is_premium": False,
        "instructions": "1. This is a quick quiz.\n2. Each correct answer carries 2 marks.\n3. No negative marking.",
        "passing_percentage": 40.0,
    },
    {
        "title": " GK Quick Quiz",
        "description": "Quick 5-minute quiz on general knowledge",
        "test_type": TestType.QUIZ,
        "duration_minutes": 5,
        "total_questions": 5,
        "marks_per_question": 2.0,
        "negative_marking": False,
        "negative_marks_per_question": 0.0,
        "is_premium": False,
        "instructions": "1. This is a quick quiz.\n2. Each correct answer carries 2 marks.\n3. No negative marking.",
        "passing_percentage": 40.0,
    },
]


async def seed_questions(db: AsyncSession):
    """Seed questions from all topics."""
    print("Seeding questions...")
    
    # Get topics
    result = await db.execute(select(Topic))
    topics = {t.name.lower(): t for t in result.scalars().all()}
    
    # Get subjects to find their IDs
    result = await db.execute(select(Subject))
    subjects = {s.name.lower(): s for s in result.scalars().all()}
    
    questions_created = 0
    
    for topic_key, questions in SAMPLE_QUESTIONS.items():
        # Map topic keys to actual topic names
        topic_mapping = {
            "general_intelligence": ["blood relations", "analogy", "coding decoding", "series", "missing number"],
            "general_knowledge": ["current affairs", "static gk", "history", "geography", "polity"],
            "mathematics": ["percentage", "profit loss", "time work", "speed distance", "average"],
            "english": ["synonym antonym", "fill in blanks", "grammar", "idioms", "reading comprehension"],
        }
        
        # Find a matching topic
        matched_topic = None
        for topic_name, topic_obj in topics.items():
            for pattern in topic_mapping.get(topic_key, []):
                if pattern in topic_name:
                    matched_topic = topic_obj
                    break
            if matched_topic:
                break
        
        if not matched_topic:
            # Use any available topic
            if topics:
                matched_topic = list(topics.values())[0]
            else:
                print(f"No topics found, skipping questions for {topic_key}")
                continue
        
        for q_data in questions:
            question = Question(
                id=uuid.uuid4(),
                topic_id=matched_topic.id,
                question_text=q_data["question_text"],
                question_type=QuestionType.MCQ,
                options=json.dumps(q_data["options"]),
                correct_answer=q_data["correct_answer"],
                explanation=q_data.get("explanation"),
                difficulty=q_data.get("difficulty", Difficulty.MEDIUM),
                marks=2.0,
                negative_marks=0.5,
                is_premium=False,
                source="Sample Question Bank",
            )
            db.add(question)
            questions_created += 1
    
    await db.commit()
    print(f"Created {questions_created} questions")
    return questions_created


async def seed_test_series(db: AsyncSession):
    """Seed test series."""
    print("Seeding test series...")
    
    # Get subjects for sectional tests
    result = await db.execute(select(Subject))
    subjects = list(result.scalars().all())
    
    test_series_created = 0
    
    for ts_data in SAMPLE_TEST_SERIES:
        # Set subject_ids for sectional tests based on title
        if ts_data["test_type"] == TestType.SECTIONAL:
            if "General Intelligence" in ts_data["title"] and subjects:
                # Find GI subject
                for s in subjects:
                    if "intelligence" in s.name.lower() or "reasoning" in s.name.lower():
                        ts_data["subject_ids"] = json.dumps([str(s.id)])
                        break
            elif "General Knowledge" in ts_data["title"] and subjects:
                for s in subjects:
                    if "knowledge" in s.name.lower() or "awareness" in s.name.lower():
                        ts_data["subject_ids"] = json.dumps([str(s.id)])
                        break
            elif "Mathematics" in ts_data["title"] and subjects:
                for s in subjects:
                    if "mathematics" in s.name.lower() or "math" in s.name.lower():
                        ts_data["subject_ids"] = json.dumps([str(s.id)])
                        break
            elif "English" in ts_data["title"] and subjects:
                for s in subjects:
                    if "english" in s.name.lower() or "hindi" in s.name.lower():
                        ts_data["subject_ids"] = json.dumps([str(s.id)])
                        break
        
        test_series = TestSeries(
            id=uuid.uuid4(),
            **ts_data,
        )
        db.add(test_series)
        test_series_created += 1
    
    await db.commit()
    print(f"Created {test_series_created} test series")
    return test_series_created


async def seed_data():
    """Main seed function."""
    print("Starting seed process...")
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            await seed_questions(db)
            await seed_test_series(db)
            print("Seed completed successfully!")
        except Exception as e:
            print(f"Error during seed: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_data())
