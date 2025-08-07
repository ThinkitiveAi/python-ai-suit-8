# Appointment Booking Endpoint
# Add this code to app.py before the "if __name__ == '__main__':" section

@app.route('/api/v1/appointment/book', methods=['POST'])
@patient_jwt_required
def book_appointment():
    try:
        # Get patient ID from JWT token
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        
        # Validate request data
        data = request.get_json()
        slot_id = data.get('slot_id')
        notes = data.get('notes', '')
        
        if not slot_id:
            return jsonify({
                'success': False,
                'message': 'Slot ID is required',
                'error_code': 'MISSING_SLOT_ID'
            }), 400
        
        # Find the appointment slot
        slot = db.session.get(AppointmentSlot, slot_id)
        if not slot:
            return jsonify({
                'success': False,
                'message': 'Appointment slot not found'
            }), 404
        
        # Check if slot is available
        if slot.status != 'available':
            return jsonify({
                'success': False,
                'message': f'Slot is not available (status: {slot.status})'
            }), 409
        
        # Generate booking reference
        booking_reference = f"APT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Update the slot
        slot.status = 'booked'
        slot.patient_id = patient_id
        slot.booking_reference = booking_reference
        slot.updated_at = datetime.utcnow()
        
        # Commit the changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment booked successfully',
            'data': {
                'booking_reference': booking_reference,
                'appointment_id': slot.id,
                'slot_id': slot_id,
                'patient_id': patient_id,
                'provider_id': slot.provider_id,
                'appointment_time': slot.slot_start_time.isoformat(),
                'appointment_type': slot.appointment_type,
                'notes': notes
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error booking appointment: {str(e)}'
        }), 500 