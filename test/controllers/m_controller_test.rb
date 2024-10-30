require "test_helper"

class MControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get m_show_url
    assert_response :success
  end
end
