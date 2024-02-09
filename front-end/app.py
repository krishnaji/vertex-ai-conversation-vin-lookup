# A web app to serve a static index.html file
from flask import Flask, render_template

app = Flask(__name__)

# Server index.html from static folder
@app.route("/")
def index():
    return render_template("index.html")

# Start the server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
