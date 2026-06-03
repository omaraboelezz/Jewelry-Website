# Django Backend - Quick Start

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up MySQL database:**
   - Install MySQL
   - Create database: `CREATE DATABASE saudi_silver;`

3. **Create `.env` file:**
   ```
   DB_NAME=saudi_silver
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start server:**
   ```bash
   python manage.py runserver
   ```

## 📍 Access Points

- **API:** https://omarawad9.pythonanywhere.com/api/products/
- **Admin Panel:** http://localhost:8000/admin/
- **Frontend Admin:** http://localhost:5173/admin

For detailed setup, see `DJANGO_SETUP.md`








