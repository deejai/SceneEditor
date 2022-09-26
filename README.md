# Scene Editor

## Testing

### Post

curl -X POST -d "{\"background\": \"blue.jpg\", \"description\": \"Town Squares\", \"transitions\": [{\"path\": \"next\", \"x\": 50, \"y\": 50}]}" localhost:5000/start -H "Content-Type: application/json"
{"success": "202 - Accepted scene update"}