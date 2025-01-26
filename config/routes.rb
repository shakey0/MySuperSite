Rails.application.routes.draw do
  post "log_in", to: "auth_api#log_in", as: "auth_api_log_in"
  delete "log_out", to: "auth_api#log_out", as: "auth_api_log_out"
  post "sign_up", to: "auth_api#sign_up", as: "auth_api_sign_up"
  post "set_password", to: "auth_api#set_password", as: "auth_api_set_password"

  get "brain", to: "brain#index", as: "brain_index"
  get "brain/auth", to: "brain#auth", as: "brain_auth"

  namespace :brain do
    get "knowledge", to: "knowledge#index", as: "knowledge_index"
    get "knowledge/:slug", to: "knowledge#show", as: "knowledge_show"
  end

  get "cats", to: "cats#index", as: "cats_index"
  get "cats/index_data", to: "cats#index_data", as: "cats_index_data"
  get "cats/:slug", to: "cats#show", as: "cats_show"
  get "cats/:slug/data", to: "cats#data", as: "cats_data"
  get "cats/photo/:slug/:filename", to: "cats#photo", constraints: { filename: /.+/ }
  get "cats/video/:slug/:filename", to: "cats#video", constraints: { filename: /.+/ }

  get "m/:id", to: "m#show", as: "m_show"
  get "m_admin", to: "m#admin_index", as: "m_admin_index"
  get "m_admin/:id", to: "m#admin_show", as: "m_admin_show"
  get "m_data", to: "m#data", as: "m_data"
  post "m", to: "m#update", as: "m_update"
  post "m_admin", to: "m#admin_update", as: "m_admin_update"
  get "m_password_form", to: "m#password_form", as: "m_password_form"
  post "m_password_auth", to: "m#password_auth", as: "m_password_auth"

  get "/", to: "home#index", as: "home_index"

  get "favicons/:name", to: "favicons#show", as: "favicons_show"

  get "/redis-test", to: "redis_test#ping"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end
