#!/usr/bin/env python3
"""
Demo script to show how appointment booking would work
This simulates what the booking API endpoint would do
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, AppointmentSlot
from datetime import datetime
import uuid

def demo_booking():
    """Demonstrate the booking process"""
    
    # Patient and slot information from our previous steps
    patient_id = "eec5fecb-8355-40c4-ad42-df9439f1379b"  # John Smith
    slot_id = "c036338b-f97e-4b3a-8b61-8092713222b3"     # 8:00-8:45 slot
    provider_id = "f1365ad6-9115-4a91-bbfe-3764273dcfa0" # Dr. Lisa Anderson
    
    with app.app_context():
        try:
            # Find the appointment slot
            slot = AppointmentSlot.query.get(slot_id)
            if not slot:
                print("❌ Error: Appointment slot not found")
                return
            
            print(f"📋 Found slot: {slot.slot_start_time} - {slot.slot_end_time}")
            print(f"   Status: {slot.status}")
            print(f"   Provider: {slot.provider_id}")
            
            # Check if slot is available
            if slot.status != 'available':
                print(f"❌ Error: Slot is not available (status: {slot.status})")
                return
            
            # Generate booking reference
            booking_reference = f"APT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            
            # Update the slot (this is what the booking API would do)
            slot.status = 'booked'
            slot.patient_id = patient_id
            slot.booking_reference = booking_reference
            slot.updated_at = datetime.utcnow()
            
            # Commit the changes
            db.session.commit()
            
            print("✅ Appointment booked successfully!")
            print(f"   Booking Reference: {booking_reference}")
            print(f"   Patient ID: {patient_id}")
            print(f"   Provider ID: {provider_id}")
            print(f"   Appointment Type: {slot.appointment_type}")
            print(f"   Time: {slot.slot_start_time} - {slot.slot_end_time}")
            
            # Verify the booking by checking the slot again
            updated_slot = AppointmentSlot.query.get(slot_id)
            print(f"\n🔍 Verification:")
            print(f"   Status: {updated_slot.status}")
            print(f"   Patient ID: {updated_slot.patient_id}")
            print(f"   Booking Reference: {updated_slot.booking_reference}")
            
        except Exception as e:
            print(f"❌ Error during booking: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    print("🎯 DEMO: Patient Appointment Booking Process")
    print("=" * 50)
    demo_booking() 