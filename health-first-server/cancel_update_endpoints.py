# Cancel and Update Appointment Endpoints
# Add this code to app.py before the "if __name__ == '__main__':" section

# Add cancel appointment endpoint
@app.route('/api/v1/appointment/cancel', methods=['POST'])
@patient_jwt_required
def cancel_appointment():
    try:
        # Get patient ID from JWT token
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        
        # Validate request data
        data = request.get_json()
        slot_id = data.get('slot_id')
        cancellation_reason = data.get('cancellation_reason', '')
        
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
        
        # Check if slot is booked by this patient
        if slot.status != 'booked' or slot.patient_id != patient_id:
            return jsonify({
                'success': False,
                'message': 'Appointment not found or not booked by you'
            }), 404
        
        # Check if appointment is in the future (can't cancel past appointments)
        if slot.slot_start_time <= datetime.utcnow():
            return jsonify({
                'success': False,
                'message': 'Cannot cancel past appointments'
            }), 400
        
        # Update the slot
        slot.status = 'cancelled'
        slot.patient_id = None  # Remove patient association
        slot.booking_reference = None  # Remove booking reference
        slot.updated_at = datetime.utcnow()
        
        # Commit the changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment cancelled successfully',
            'data': {
                'appointment_id': slot.id,
                'slot_id': slot_id,
                'cancelled_time': slot.updated_at.isoformat(),
                'cancellation_reason': cancellation_reason,
                'original_appointment_time': slot.slot_start_time.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error cancelling appointment: {str(e)}'
        }), 500

# Add update appointment endpoint
@app.route('/api/v1/appointment/update', methods=['PUT'])
@patient_jwt_required
def update_appointment():
    try:
        # Get patient ID from JWT token
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        
        # Validate request data
        data = request.get_json()
        current_slot_id = data.get('current_slot_id')
        new_slot_id = data.get('new_slot_id')
        notes = data.get('notes', '')
        
        if not current_slot_id or not new_slot_id:
            return jsonify({
                'success': False,
                'message': 'Both current_slot_id and new_slot_id are required',
                'error_code': 'MISSING_SLOT_IDS'
            }), 400
        
        # Find the current appointment slot
        current_slot = db.session.get(AppointmentSlot, current_slot_id)
        if not current_slot:
            return jsonify({
                'success': False,
                'message': 'Current appointment slot not found'
            }), 404
        
        # Check if current slot is booked by this patient
        if current_slot.status != 'booked' or current_slot.patient_id != patient_id:
            return jsonify({
                'success': False,
                'message': 'Current appointment not found or not booked by you'
            }), 404
        
        # Find the new appointment slot
        new_slot = db.session.get(AppointmentSlot, new_slot_id)
        if not new_slot:
            return jsonify({
                'success': False,
                'message': 'New appointment slot not found'
            }), 404
        
        # Check if new slot is available
        if new_slot.status != 'available':
            return jsonify({
                'success': False,
                'message': f'New slot is not available (status: {new_slot.status})'
            }), 409
        
        # Check if new slot is in the future
        if new_slot.slot_start_time <= datetime.utcnow():
            return jsonify({
                'success': False,
                'message': 'Cannot book appointments in the past'
            }), 400
        
        # Generate new booking reference
        new_booking_reference = f"APT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Update current slot (cancel it)
        current_slot.status = 'cancelled'
        current_slot.patient_id = None
        current_slot.booking_reference = None
        current_slot.updated_at = datetime.utcnow()
        
        # Update new slot (book it)
        new_slot.status = 'booked'
        new_slot.patient_id = patient_id
        new_slot.booking_reference = new_booking_reference
        new_slot.updated_at = datetime.utcnow()
        
        # Commit the changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment updated successfully',
            'data': {
                'old_appointment_id': current_slot.id,
                'new_appointment_id': new_slot.id,
                'old_slot_id': current_slot_id,
                'new_slot_id': new_slot_id,
                'patient_id': patient_id,
                'provider_id': new_slot.provider_id,
                'new_appointment_time': new_slot.slot_start_time.isoformat(),
                'new_appointment_type': new_slot.appointment_type,
                'new_booking_reference': new_booking_reference,
                'notes': notes,
                'updated_at': new_slot.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error updating appointment: {str(e)}'
        }), 500 