# main.py
import json, requests, random

def lambda_handler(event):
    try:
        category = event.get('category')
        difficulty_level = event.get('difficulty_level')

        print("Lambda function started.")
        print(f"Received event: {event}")
        print(f"Received category: {category}, difficulty_level: {difficulty_level}")

        CATEGORIES = ["music", "sport_and_leisure", "film_and_tv", "arts_and_literature", "history", "society_and_culture", "science", "geography", "food_and_drink", "general_knowledge"]
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

def get_sorted_questions(category, difficulty_level):
    url = "https://the-trivia-api.com/api/questions"
    params = {
        "categories": category,
        "limit": 50
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        questions = response.json()
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch questions: {str(e)}")
    
    if not questions:
        raise Exception("No questions received from the API.")

    # Sort questions by difficulty
    easy_questions = [q for q in questions if q['difficulty'] == 'easy']
    medium_questions = [q for q in questions if q['difficulty'] == 'medium']
    hard_questions = [q for q in questions if q['difficulty'] == 'hard']

    if difficulty_level.lower() == 'easy':
        if len(easy_questions) < 3 or len(medium_questions) < 3:
            raise Exception("Not enough questions of required difficulties")
        
        selected_easy = random.sample(easy_questions, 3)
        selected_medium = random.sample(medium_questions, 3)
        
        # Arrange in specified order: easy, easy, medium, easy, medium, medium
        return [
            selected_easy[0],    # First easy
            selected_easy[1],    # Second easy
            selected_medium[0],  # First medium
            selected_easy[2],    # Third easy
            selected_medium[1],  # Second medium
            selected_medium[2]   # Third medium
        ]
    else:  # hard difficulty
        if len(medium_questions) < 3 or len(hard_questions) < 3:
            raise Exception("Not enough questions of required difficulties")
        
        selected_medium = random.sample(medium_questions, 3)
        selected_hard = random.sample(hard_questions, 3)
        
        # Arrange in specified order: medium, medium, hard, medium, hard, hard
        return [
            selected_medium[0],  # First medium
            selected_medium[1],  # Second medium
            selected_hard[0],    # First hard
            selected_medium[2],  # Third medium
            selected_hard[1],    # Second hard
            selected_hard[2]     # Third hard
        ]
