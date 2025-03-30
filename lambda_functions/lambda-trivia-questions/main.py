import json
import requests
import random
from time import sleep

def fetch_trivia_questions(category, difficulty):
    url = "https://the-trivia-api.com/api/questions"
    params = {
        "categories": category,
        "difficulty": difficulty,
        "limit": 50
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        questions = response.json()
        return questions if questions else []
    except requests.RequestException as e:
        print(f"API request failed: {str(e)}")
        return []

def lambda_handler(event, context):
    try:
        category = event.get('category')
        difficulty_level = event.get('difficulty_level')
        user_id = event.get('user_id')

        print("Lambda function started.")
        print(f"Received event: {event}")
        print(f"Received category: {category}, difficulty_level: {difficulty_level}, user_id: {user_id}")

        CATEGORIES = ["music", "sport_and_leisure", "film_and_tv", "arts_and_literature", 
                     "history", "society_and_culture", "science", "geography", 
                     "food_and_drink", "general_knowledge"]
        DIFFICULTIES = ['easy', 'medium', 'hard']

        if difficulty_level not in DIFFICULTIES or category not in CATEGORIES:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': "Invalid params"
                })
            }

        # MOCK DATA: Previously answered question IDs for this user
        # In a real implementation, this would come from DynamoDB
        previously_answered_questions = [
            "622a1c357cc59eab6f950807",
            "622a1c347cc59eab6f94fb63",
            "622a1c367cc59eab6f9511e1",
            "622a1c377cc59eab6f95230a",
            "622a1c347cc59eab6f950010",
            "622a1c367cc59eab6f951655",
            "622a1c377cc59eab6f951f88",
            "622a1c347cc59eab6f94fd32",
            "622a1c357cc59eab6f950c48",
            "622a1c347cc59eab6f94fa3d"
        ]

        # Fetch questions from the API (with retries if we don't get enough or there's an error)
        max_retries = 5
        all_questions = []

        for attempt in range(max_retries):
            print(f"API attempt {attempt + 1}/{max_retries}")

            all_questions = fetch_trivia_questions(category, difficulty_level)
            print(f"Fetched {len(all_questions)} questions from API")

            if len(all_questions) >= 6:
                break

            print(f"Not enough questions (need at least 6). Retrying...")

            if attempt < max_retries - 1:
                sleep(1)

        if len(all_questions) < 6:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': f"Could not fetch enough questions after {max_retries} attempts. Only got {len(all_questions)} questions."
                })
            }

        filtered_questions = [q for q in all_questions if q['id'] not in previously_answered_questions]
        print(f"After filtering, {len(filtered_questions)} questions remain")

        # If we have enough new questions, just randomly select 6
        if len(filtered_questions) >= 6:
            selected_questions = random.sample(filtered_questions, 6)
        else:
            # Not enough new questions, so we'll use all the filtered ones and supplement
            print(f"Only {len(filtered_questions)} new questions available, supplementing with previously answered questions")

            selected_questions = filtered_questions
            needed = 6 - len(selected_questions)

            previously_answered = [q for q in all_questions if q['id'] in previously_answered_questions]
            supplement = random.sample(previously_answered, min(needed, len(previously_answered)))
            selected_questions.extend(supplement)

        random.shuffle(selected_questions)

        questions = []
        for q in selected_questions:
            question = {
                'id': q['id'],
                'question': q['question'],
                'correctAnswer': q['correctAnswer'],
                'incorrectAnswers': q['incorrectAnswers']
            }
            questions.append(question)

        print(f"Returning {len(questions)} questions")
        return {
            'statusCode': 200,
            'body': json.dumps({
                'questions': questions
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
