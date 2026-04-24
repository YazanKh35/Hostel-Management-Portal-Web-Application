from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# تفعيل الـ CORS بشكل كامل لضمان قبول الطلبات من الرياكت
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# قاعدة بيانات وهمية (لستة لتخزين الطلبات)
db_tickets = []

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        # توليد ID فريد لكل طلب تسجيل
        data['id'] = f"REG-{len(db_tickets) + 100}"
        
        # الحالة الأساسية للطلب (active يعني لسه ما انحل)
        data['status'] = 'active'
        
        # حالة الموافقة: pending مشان تطلع بالـ Registrations وما تطلع بالأرشيف لسه
        data['approval_status'] = 'pending' 
        
        # قيم افتراضية للغرفة قبل التخصيص
        data['block'] = '-'
        data['room'] = '-'
        
        db_tickets.append(data)
        return jsonify({"message": "Student Registered. Waiting for Warden Approval...", "status": "success"}), 201
    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500

# --- الـ Endpoint المعدلة لاتخاذ القرار وأرشفة الطلب ---
@app.route('/registration_decision/<student_id>', methods=['POST', 'OPTIONS'])
def registration_decision(student_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    try:
        data = request.json
        decision = data.get('decision') # 'approved' or 'rejected'
        new_block = data.get('block')   # البلوك اللي جاي من الـ prompt بالرياكت
        new_room = data.get('room')     # رقم الغرفة اللي جاي من الـ prompt

        # البحث عن الطالب وتحديث بياناته
        for ticket in db_tickets:
            # منقارن الـ student_id لأنك بالفرونت عم تبعته بالـ URL
            if str(ticket.get('student_id')) == str(student_id):
                
                # تحديث حالة الموافقة (هاد اللي بيخليه ينتقل للأرشيف بالفرونت)
                ticket['approval_status'] = decision
                
                if decision == 'approved':
                    ticket['block'] = new_block
                    ticket['room'] = new_room
                    # منعتبر الطلب صار "مكتمل" بجدول التسجيل
                    ticket['status'] = 'completed' 
                else:
                    # في حال الرفض، منخلي البيانات فاضية ومنحط الحالة "rejected"
                    ticket['block'] = 'N/A'
                    ticket['room'] = 'N/A'
                    ticket['status'] = 'rejected'
                    
                return jsonify({"message": f"Registration {decision} successfully", "status": "success"}), 200
        
        return jsonify({"message": "Student record not found", "status": "error"}), 404

    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500

@app.route('/get_tickets', methods=['GET'])
def get_tickets():
    # هي الـ Endpoint بترجع كل شي (تسجيل، صيانة، شكاوي) والفرونت هو اللي بفلتر
    return jsonify(db_tickets), 200

@app.route('/maintenance', methods=['POST'])
def maintenance():
    data = request.json
    data['id'] = f"T-{len(db_tickets) + 101}"
    data['status'] = 'active'
    db_tickets.append(data)
    return jsonify({"message": "Maintenance request sent successfully"}), 201

@app.route('/complaint', methods=['POST'])
def complaint():
    data = request.json
    data['id'] = f"C-{len(db_tickets) + 501}"
    data['status'] = 'active'
    db_tickets.append(data)
    return jsonify({"message": "Complaint sent successfully"}), 201

@app.route('/update_ticket/<ticket_id>', methods=['POST', 'OPTIONS'])
def update_ticket(ticket_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json
        new_status = data.get('status', 'solved')

        for ticket in db_tickets:
            if str(ticket.get('id')) == str(ticket_id):
                ticket['status'] = new_status
                return jsonify({"message": "Status updated", "status": "success"}), 200
        
        return jsonify({"message": "Ticket not found", "status": "error"}), 404

    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)