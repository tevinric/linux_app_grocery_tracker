from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

# Get all grocery items
@app.route('/api/groceries', methods=['GET'])
def get_groceries():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    SELECT id, name, description, quantity, created_at, updated_at
                    FROM grocery_items
                    ORDER BY name
                ''')
                items = cursor.fetchall()
                return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get low stock items (quantity <= 2)
@app.route('/api/groceries/low-stock', methods=['GET'])
def get_low_stock():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    SELECT id, name, description, quantity, created_at, updated_at
                    FROM grocery_items
                    WHERE quantity <= 2
                    ORDER BY quantity ASC, name
                ''')
                items = cursor.fetchall()
                return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get single grocery item
@app.route('/api/groceries/<int:item_id>', methods=['GET'])
def get_grocery(item_id):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    SELECT id, name, description, quantity, created_at, updated_at
                    FROM grocery_items
                    WHERE id = %s
                ''', (item_id,))
                item = cursor.fetchone()
                if item:
                    return jsonify(item), 200
                else:
                    return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create grocery item
@app.route('/api/groceries', methods=['POST'])
def create_grocery():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        quantity = data.get('quantity', 0)

        if not name:
            return jsonify({'error': 'Name is required'}), 400

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO grocery_items (name, description, quantity)
                    VALUES (%s, %s, %s)
                    RETURNING id, name, description, quantity, created_at, updated_at
                ''', (name, description, quantity))
                new_item = cursor.fetchone()
                return jsonify(new_item), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update grocery item
@app.route('/api/groceries/<int:item_id>', methods=['PUT'])
def update_grocery(item_id):
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        quantity = data.get('quantity')

        if not name:
            return jsonify({'error': 'Name is required'}), 400

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    UPDATE grocery_items
                    SET name = %s, description = %s, quantity = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, name, description, quantity, created_at, updated_at
                ''', (name, description, quantity, item_id))
                updated_item = cursor.fetchone()
                if updated_item:
                    return jsonify(updated_item), 200
                else:
                    return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete grocery item
@app.route('/api/groceries/<int:item_id>', methods=['DELETE'])
def delete_grocery(item_id):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('DELETE FROM grocery_items WHERE id = %s RETURNING id', (item_id,))
                deleted = cursor.fetchone()
                if deleted:
                    return jsonify({'message': 'Item deleted successfully'}), 200
                else:
                    return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
