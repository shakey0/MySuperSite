class Brain::KnowledgeController < ApplicationController
  before_action :authenticate_user!

  QUIZZES = [
    { title: "Music", slug: "music" },
    { title: "Sport and Leisure", slug: "sport_and_leisure" },
    { title: "Film and TV", slug: "film_and_tv" },
    { title: "Arts and Literature", slug: "arts_and_literature" },
    { title: "History", slug: "history" },
    { title: "Society and Culture", slug: "society_and_culture" },
    { title: "Science", slug: "science" },
    { title: "Geography", slug: "geography" },
    { title: "Food and Drink", slug: "food_and_drink" },
    { title: "General Knowledge", slug: "general_knowledge" }
  ]

  def index
  end

  def quiz
    unless QUIZZES.any? { |q| q[:slug] == params[:slug] }
      redirect_to brain_knowledge_index_path
    end

    @topic = QUIZZES.find { |q| q[:slug] == params[:slug] }
  end

  def review
    unless QUIZZES.any? { |q| q[:slug] == params[:slug] }
      redirect_to brain_knowledge_index_path
    end

    @topic = QUIZZES.find { |q| q[:slug] == params[:slug] }
  end
end
