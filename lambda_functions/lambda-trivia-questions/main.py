import json
import requests
import random
from time import sleep

def fetch_trivia_questions(category, max_retries=5):
    url = "https://the-trivia-api.com/api/questions"
    params = {
        "categories": category,
        "limit": 50
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            questions = response.json()
            
            if not questions:
                print(f"Attempt {attempt + 1}: No questions received. Retrying...")
                continue
                
            return questions
            
        except requests.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                sleep(1)
            continue
            
    raise Exception(f"Failed to fetch questions after {max_retries} attempts")

def validate_question_counts(questions, difficulty_level):
    easy_questions = [q for q in questions if q['difficulty'] == 'easy']
    medium_questions = [q for q in questions if q['difficulty'] == 'medium']
    hard_questions = [q for q in questions if q['difficulty'] == 'hard']

    # Print the counts of each difficulty
    print(f"Easy questions received: {len(easy_questions)}")
    print(f"Medium questions received: {len(medium_questions)}")
    print(f"Hard questions received: {len(hard_questions)}")
    
    if difficulty_level.lower() == 'easy':
        if len(easy_questions) >= 3 and len(medium_questions) >= 3:
            return easy_questions, medium_questions
        raise Exception("Not enough easy or medium questions")
    else:
        if len(medium_questions) >= 3 and len(hard_questions) >= 3:
            return medium_questions, hard_questions
        raise Exception("Not enough medium or hard questions")

def get_sorted_questions(category, difficulty_level):
    max_retries = 5
    for attempt in range(max_retries):
        try:
            questions = fetch_trivia_questions(category)
            
            if difficulty_level.lower() == 'easy':
                easy_questions, medium_questions = validate_question_counts(questions, difficulty_level)
                
                selected_easy = random.sample(easy_questions, 3)
                selected_medium = random.sample(medium_questions, 3)
                
                return [
                    selected_easy[0],    # First easy
                    selected_easy[1],    # Second easy
                    selected_medium[0],  # First medium
                    selected_easy[2],    # Third easy
                    selected_medium[1],  # Second medium
                    selected_medium[2]   # Third medium
                ]
            else:  # hard difficulty
                medium_questions, hard_questions = validate_question_counts(questions, difficulty_level)
                
                selected_medium = random.sample(medium_questions, 3)
                selected_hard = random.sample(hard_questions, 3)
                
                return [
                    selected_medium[0],  # First medium
                    selected_medium[1],  # Second medium
                    selected_hard[0],    # First hard
                    selected_medium[2],  # Third medium
                    selected_hard[1],    # Second hard
                    selected_hard[2]     # Third hard
                ]
                
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                sleep(1)
            continue
            
    raise Exception(f"Failed to get valid question set after {max_retries} attempts")

def lambda_handler(event, context):
    try:
        category = event.get('category')
        difficulty_level = event.get('difficulty_level')

        print("Lambda function started.")
        print(f"Received event: {event}")
        print(f"Received category: {category}, difficulty_level: {difficulty_level}")

        CATEGORIES = ["music", "sport_and_leisure", "film_and_tv", "arts_and_literature", 
                     "history", "society_and_culture", "science", "geography", 
                     "food_and_drink", "general_knowledge"]
        DIFFICULTIES = ['easy', 'hard']

        if difficulty_level not in DIFFICULTIES or category not in CATEGORIES:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': "Invalid params"
                })
            }

        sorted_questions = get_sorted_questions(category, difficulty_level)
        
        formatted_questions = [
            f"{i+1}. [{q['difficulty']}] {q['question']}"
            for i, q in enumerate(sorted_questions)
        ]
        
        print(f"\n{difficulty_level.capitalize()} mode questions:")
        print("\n".join(formatted_questions))
        print()

        return {
            'statusCode': 200,
            'body': json.dumps({
                'formatted_questions': formatted_questions
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }
