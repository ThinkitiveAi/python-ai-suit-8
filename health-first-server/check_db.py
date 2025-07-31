import sqlite3
import os

def check_database():
    db_path = 'health_first.db'
    
    if not os.path.exists(db_path):
        print(f"Database file not found at: {db_path}")
        return
    
    print(f"Database file exists at: {db_path}")
    print(f"File size: {os.path.getsize(db_path)} bytes")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\nTables in database:")
    for table in tables:
        print(f"\nTable: {table[0]}")
        # Get table info
        cursor.execute(f"PRAGMA table_info({table[0]})")
        columns = cursor.fetchall()
        print("Columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f"Number of rows: {count}")
        
        # Show sample data if exists
        if count > 0:
            cursor.execute(f"SELECT * FROM {table[0]} LIMIT 1")
            sample = cursor.fetchone()
            print("Sample row:")
            print(f"  {sample}")
    
    conn.close()

if __name__ == "__main__":
    check_database() 