from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer

# Define request model
class ArticleURL(BaseModel):
    url: str

# Initialize app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
def analyze_article(article: ArticleURL):
    """Fetch article text and return TF-IDF keywords"""

    # --- Fetch article ---
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        res = requests.get(article.url, headers=headers, timeout=10)
        res.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch article: {e}")

    # --- Parse text ---
    soup = BeautifulSoup(res.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()

    text = ""
    main = soup.find("article")
    if main:
        text = main.get_text(separator=" ")
    if not text:
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text(separator=" ") for p in paragraphs)
    if not text:
        text = soup.get_text(separator=" ")

    text = text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="No text found in the article")

    # --- Keyword extraction ---
    vectorizer = TfidfVectorizer(max_features=20, stop_words="english")
    X = vectorizer.fit_transform([text])
    keywords = vectorizer.get_feature_names_out()
    scores = X.toarray()[0]
    pairs = sorted(zip(keywords, scores), key=lambda x: x[1], reverse=True)

    return [{"word": w, "weight": float(round(s, 4))} for w, s in pairs]
