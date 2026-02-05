from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import generate_recommendations

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'Python Recommendation Service'})

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract student data
        student_id = data.get('studentId')
        marks = data.get('marks', [])
        skills = data.get('skills', {})
        interests = data.get('interests', [])
        department = data.get('department', '')
        
        # Generate recommendations using rule-based logic
        recommendations = generate_recommendations(
            marks=marks,
            skills=skills,
            interests=interests,
            department=department
        )
        
        return jsonify({
            'success': True,
            'studentId': student_id,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print('Starting Python Recommendation Service...')
    print('Service will run on http://localhost:5001')
    app.run(host='0.0.0.0', port=5001, debug=True)
