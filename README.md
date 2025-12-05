# How to Run YouClone

## 1. Environment Setup

You have already created a virtual environment. Activate it:

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate
```

**Windows (CMD):**
```cmd
venv\Scripts\activate
```

## 2. Install Dependencies

Install the required packages using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

## 3. Run the Application

Start the Flask server:

```bash
python app.py
```

## 4. Access the App

Open your browser and navigate to:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

## Default Users
(You need to register new users as the database is in-memory and resets on restart)
1. Go to **Register**.
2. Create a **Creator** account (e.g., `creator1`) to upload videos.
3. Create a **Viewer** account (e.g., `viewer1`) to watch and comment.
