"""
Rule-Based Academic Recommendation Engine
This module implements rule-based logic to generate academic recommendations
based on student marks, skills, and interests.
"""

def generate_recommendations(marks, skills, interests, department):
    """
    Generate recommendations based on student data using rule-based logic.
    
    Args:
        marks: List of marks dictionaries with subject, marks, percentage, etc.
        skills: Dictionary with 'technical' and 'soft' skill lists
        interests: List of student interests
        department: Student's department
    
    Returns:
        List of recommendation dictionaries
    """
    recommendations = []
    
    # Rule 1: Identify weak subjects (marks < 50%)
    weak_subjects = [m for m in marks if m.get('percentage', 0) < 50]
    for subject in weak_subjects:
        recommendations.append({
            'type': 'subject-improvement',
            'title': f'Focus on Improving {subject.get("subject", "Subject")}',
            'description': f'Your current performance in {subject.get("subject")} is {subject.get("percentage", 0):.1f}%. '
                          f'Consider dedicating more study time, attending extra classes, or seeking tutoring support.',
            'priority': 'high',
            'reasoning': f'Performance below 50% threshold in {subject.get("subject")}'
        })
    
    # Rule 2: Identify strong subjects (marks >= 80%)
    strong_subjects = [m for m in marks if m.get('percentage', 0) >= 80]
    
    # Rule 3: Career path recommendations based on strong subjects and skills
    technical_skills = [s.get('skill', '').lower() for s in skills.get('technical', [])]
    
    # Software Developer Path
    if any('java' in s for s in technical_skills) or any('programming' in s for s in technical_skills):
        java_subjects = [m for m in marks if 'java' in m.get('subject', '').lower() or 
                        'programming' in m.get('subject', '').lower() or
                        'dsa' in m.get('subject', '').lower() or
                        'data structure' in m.get('subject', '').lower()]
        if java_subjects:
            avg_marks = sum(m.get('percentage', 0) for m in java_subjects) / len(java_subjects)
            if avg_marks >= 70:
                recommendations.append({
                    'type': 'career-path',
                    'title': 'Consider Software Developer Career Path',
                    'description': 'Based on your strong performance in programming and data structures, '
                                  'a career in software development could be a great fit. Focus on building '
                                  'projects, contributing to open source, and mastering algorithms.',
                    'priority': 'high',
                    'reasoning': f'Strong performance in programming subjects (avg: {avg_marks:.1f}%) and technical skills in Java/programming'
                })
        else:
            # If no Java/programming subjects but has Java interest/skills - recommend those subjects
            recommendations.append({
                'type': 'subject-improvement',
                'title': 'Software Developer Path - Study Core Programming Subjects',
                'description': 'You are interested in becoming a Software Developer, but you need to study core subjects first. '
                              'Focus on Java, Data Structures, and Algorithms. These are the foundation for your career path.',
                'priority': 'high',
                'reasoning': 'Java/programming skill detected but no related subject marks found. Must study Java, DSA, and Programming fundamentals first.'
            })
    
    # Data Science Path
    math_subjects = [m for m in marks if 'math' in m.get('subject', '').lower() or 
                     'statistics' in m.get('subject', '').lower() or
                     'stat' in m.get('subject', '').lower()]
    if math_subjects:
        avg_math = sum(m.get('percentage', 0) for m in math_subjects) / len(math_subjects)
        if avg_math >= 75:
            recommendations.append({
                'type': 'career-path',
                'title': 'Consider Data Science Career Path',
                'description': 'Your strong mathematical and statistical foundation makes you well-suited for '
                              'data science. Consider learning Python, machine learning, and data visualization tools.',
                'priority': 'high',
                'reasoning': f'Strong performance in Math/Statistics (avg: {avg_math:.1f}%)'
            })
    
    # Rule 4: Skill development recommendations
    if not technical_skills or len(technical_skills) < 3:
        recommendations.append({
            'type': 'skill-development',
            'title': 'Expand Your Technical Skills',
            'description': 'Consider learning additional technical skills relevant to your field. '
                          'Popular options include Python, JavaScript, databases, cloud computing, etc.',
            'priority': 'medium',
            'reasoning': 'Limited technical skills identified'
        })
    
    # Rule 5: Academic plan based on performance trends
    if len(marks) >= 2:
        # Check if performance is improving or declining
        sorted_marks = sorted(marks, key=lambda x: (x.get('year', 0), x.get('semester', 0)))
        recent_avg = sum(m.get('percentage', 0) for m in sorted_marks[-3:]) / min(3, len(sorted_marks))
        older_avg = sum(m.get('percentage', 0) for m in sorted_marks[:-3]) / max(1, len(sorted_marks) - 3) if len(sorted_marks) > 3 else recent_avg
        
        if recent_avg < older_avg - 10:
            recommendations.append({
                'type': 'academic-plan',
                'title': 'Performance Decline Detected',
                'description': 'Your recent performance shows a decline. Consider reviewing your study habits, '
                              'seeking academic counseling, or adjusting your course load.',
                'priority': 'high',
                'reasoning': f'Recent average ({recent_avg:.1f}%) is significantly lower than previous ({older_avg:.1f}%)'
            })
        elif recent_avg > older_avg + 10:
            recommendations.append({
                'type': 'academic-plan',
                'title': 'Great Improvement!',
                'description': 'Your performance has improved significantly. Keep up the excellent work! '
                              'Consider taking on more challenging courses or projects.',
                'priority': 'low',
                'reasoning': f'Recent average ({recent_avg:.1f}%) shows improvement from previous ({older_avg:.1f}%)'
            })
    
    # Rule 6: Subject-specific recommendations
    for mark in marks:
        percentage = mark.get('percentage', 0)
        subject = mark.get('subject', '')
        
        if 50 <= percentage < 60:
            recommendations.append({
                'type': 'subject-improvement',
                'title': f'Improve {subject} to Pass with Better Grade',
                'description': f'You are passing {subject} but could improve. Focus on understanding core concepts '
                              'and practice regularly to move to a higher grade bracket.',
                'priority': 'medium',
                'reasoning': f'Performance in {subject} is between 50-60%'
            })
    
    # Rule 7: Interest-based recommendations with subject validation
    if interests:
        interest_keywords = {
            'java-developer': ('Software Development', ['java', 'programming', 'dsa', 'data structure']),
            'java': ('Software Development', ['java', 'programming', 'dsa', 'data structure']),
            'ai': ('Artificial Intelligence', ['ai', 'machine learning', 'python', 'math']),
            'machine learning': ('Machine Learning', ['machine learning', 'python', 'statistics', 'math']),
            'web': ('Web Development', ['web', 'html', 'css', 'javascript', 'database']),
            'mobile': ('Mobile App Development', ['mobile', 'android', 'ios', 'flutter', 'react']),
            'cybersecurity': ('Cybersecurity', ['cybersecurity', 'security', 'networks', 'os']),
            'cloud': ('Cloud Computing', ['cloud', 'aws', 'azure', 'devops'])
        }
        
        for interest in interests:
            interest_lower = interest.lower()
            for keyword, (field, required_subjects) in interest_keywords.items():
                if keyword in interest_lower:
                    # Check if student has marks in any of the required subjects
                    subject_marks = [m for m in marks if any(
                        req_subj in m.get('subject', '').lower() for req_subj in required_subjects
                    )]
                    
                    if subject_marks:
                        # Has relevant subject marks
                        avg_marks = sum(m.get('percentage', 0) for m in subject_marks) / len(subject_marks)
                        recommendations.append({
                            'type': 'skill-development',
                            'title': f'Excel in {field}',
                            'description': f'Based on your interest in {interest} and solid foundation with average {avg_marks:.1f}% in relevant subjects, '
                                          f'consider exploring {field} further through advanced courses, projects, or certifications.',
                            'priority': 'medium',
                            'reasoning': f'Interest-based recommendation for {interest} with relevant subject knowledge'
                        })
                    else:
                        # No relevant subject marks - recommend which subjects to take
                        recommendations.append({
                            'type': 'subject-improvement',
                            'title': f'{field} - Required Subjects to Study',
                            'description': f'You are interested in {interest}/{field}, but you need to study foundational subjects first. '
                                          f'Consider taking: {", ".join(required_subjects)}. Build these fundamentals before pursuing advanced learning in this field.',
                            'priority': 'high',
                            'reasoning': f'Interest in {interest} detected, but required foundational subjects missing. Must study {", ".join(required_subjects)} first.'
                        })
                    break
    
    return recommendations
