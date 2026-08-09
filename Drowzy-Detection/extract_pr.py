import json
import base64
import sys

ipynb_file = "/Users/sunilpoudel/Desktop/Drowsiness Detection/Fatigue_Detection_and_Alert_System.ipynb"
with open(ipynb_file, 'r') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    source = "".join(cell.get('source', []))
    if 'precision_recall_curve(y_true, y_pred_probs[:, 1])' in source:
        outputs = cell.get('outputs', [])
        for out in outputs:
            if 'data' in out and 'image/png' in out['data']:
                img_data = out['data']['image/png']
                with open("/Users/sunilpoudel/Desktop/Drowsiness Detection/Performance metrics/precision_recall_eye.png", "wb") as img_file:
                    img_file.write(base64.b64decode(img_data))
                print("Extracted successfully!")
                sys.exit(0)
print("Not found.")
