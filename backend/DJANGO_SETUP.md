# Django + MySQL Backend Setup Guide

Complete guide to set up Django backend with MySQL database for Saudi Silver jewelry store.

## 📋 Prerequisites

- Python 3.8 or higher
- MySQL Server installed and running
- pip (Python package manager)

## 🚀 Quick Start

### Step 1: Install Python Dependencies

Navigate to the backend folder and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

**Or if using virtual environment (recommended):**

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### Step 2: Set Up MySQL Database

1. **Install MySQL** (if not installed):
   - macOS: `brew install mysql` or download from https://dev.mysql.com/downloads/mysql/
   - Windows: Download installer from https://dev.mysql.com/downloads/installer/
   - Linux: `sudo apt-get install mysql-server` (Ubuntu/Debian)

2. **Start MySQL service:**
   ```bash
   # macOS/Linux
   mysql.server start
   
   # Windows (usually auto-starts after installation)
   ```

3. **Create database:**
   ```bash
   mysql -u root -p
   ```
   
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE saudi_silver CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### Step 3: Configure Database Connection

Create a `.env` file in the `backend` folder:

```bash
cd backend
touch .env  # On macOS/Linux
# or create .env file manually
```

Add the following to `.env`:

```
DB_NAME=saudi_silver
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=your-secret-key-here-change-in-production
```

**Replace `your_mysql_password` with your actual MySQL root password.**

### Step 4: Run Database Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

This creates the product table in your MySQL database.

### Step 5: Create Admin User (Optional but Recommended)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account. You can access Django admin at `http://localhost:8000/admin/`

### Step 6: Start Django Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 7: Test the API

Visit: https://omarawad9.pythonanywhere.com/api/products/

You should see an empty array `[]` if no products exist, or a JSON array of products.

## 📡 API Endpoints

### GET /api/products/
Fetch all products from the database.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Classic Gold Ring",
    "price": 1299.00,
    "badge": "Best Seller",
    "stock": "In Stock",
    "image": "https://example.com/image.jpg",
    "description": "A timeless classic...",
    "shortDescription": "Timeless elegance"
  }
]
```

### POST /api/products/
Add a new product to the database.

**Request Body:**
```json
{
  "name": "Classic Gold Ring",
  "price": 1299,
  "badge": "Best Seller",
  "stock": "In Stock",
  "image": "https://example.com/image.jpg",
  "description": "A timeless classic gold ring...",
  "shortDescription": "Timeless elegance in 18K gold"
}
```

**Response:**
```json
{
  "message": "Product added successfully",
  "product": { ... }
}
```

## 🎨 Admin Dashboard

1. **Start Django server** (if not running):
   ```bash
   python manage.py runserver
   ```

2. **Access frontend admin:**
   - URL: http://localhost:5173/admin
   - Or click "Admin" link in header

3. **Django Admin Panel (Alternative):**
   - URL: http://localhost:8000/admin/
   - Login with superuser credentials

## 🔧 Troubleshooting

### MySQL Connection Error

**Error:** `django.db.utils.OperationalError: (2002, "Can't connect to MySQL server")`

**Solutions:**
1. Make sure MySQL is running:
   ```bash
   # Check status
   mysql.server status
   
   # Start if not running
   mysql.server start
   ```

2. Check your `.env` file has correct database credentials

3. Verify database exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### mysqlclient Installation Error

**Error:** `pip install mysqlclient` fails

**Solutions:**

**macOS:**
```bash
brew install mysql
brew install pkg-config
pip install mysqlclient
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
pip install mysqlclient
```

**Windows:**
- Download MySQL client library from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
- Install wheel file: `pip install mysqlclient‑*.whl`

**Alternative:** Use `pymysql` instead:
```bash
pip install pymysql
```

Then add to `backend/saudi_silver/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Port Already in Use

**Error:** `That port is already in use`

**Solution:**
```bash
# Use different port
python manage.py runserver 8001
```

Then update frontend API URL to `http://localhost:8001/api/products`

### CORS Error

If you see CORS errors in browser:
- Make sure `corsheaders` is in `INSTALLED_APPS` (it should be)
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`
- For development, `CORS_ALLOW_ALL_ORIGINS = True` is enabled

## 📝 Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (create this)
├── saudi_silver/            # Main Django project
│   ├── settings.py          # Django settings
│   ├── urls.py              # URL routing
│   └── ...
└── products/                # Products app
    ├── models.py            # Product database model
    ├── views.py             # API views
    ├── serializers.py       # Data serialization
    └── urls.py              # Product URLs
```

## 🎓 Next Steps

1. **Add Authentication**: Protect admin routes
2. **Add Image Upload**: Upload images instead of URLs
3. **Add Edit/Delete**: CRUD operations for products
4. **Add Categories Management**: Dynamic categories
5. **Production Setup**: Configure for deployment

## 💡 Tips

- Always activate virtual environment before running commands
- Keep `.env` file secret (never commit to git)
- Use Django admin panel to manage products directly
- Check Django server logs for debugging
- Use `python manage.py shell` to test database queries








