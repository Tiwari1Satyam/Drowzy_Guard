# Drowsiness & Fatigue Detection System - Performance Metrics

## Mathematical Formulas

### 1. Eye Aspect Ratio (EAR) Formula
The EAR algorithm determines if a person's eyes are open or closed based on 6 specific facial landmark points around each eye. When the eye closes, the distance between the upper and lower eyelids approaches zero, making the EAR drop rapidly.

**Formula:**
`EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)`

*(Where p1, ..., p6 are the 2D facial landmark coordinates of the eye. The numerator calculates the distance between the vertical eye points, and the denominator computes the distance between the horizontal eye points.)*

### 2. Mouth Aspect Ratio (MAR) Formula
The MAR determines if a person is yawning based on the facial landmarks across the outer and inner lips. When the mouth opens widely to yawn, the vertical distances increase significantly compared to the horizontal distance across the lips.

**Formula:**
`MAR = (||p3 - p11|| + ||p5 - p9||) / (2 * ||p1 - p7||)`

*(Where p1, ..., p11 represent the coordinates of the mouth. The numerator evaluates the vertical distance between the upper and lower lips, scaled against the horizontal width of the mouth.)*

---

## Model Classification Reports & Accuracy

### 1. Eye State Model (Blink / Close Detection)
This model achieved an overall accuracy of **97%**.

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **1_Closed** | 0.96 | 0.98 | 0.97 | 145 |
| **2_Open** | 0.98 | 0.96 | 0.97 | 145 |
| **Overall Accuracy** | | | **0.97** | 290 |
| **Macro Avg** | 0.97 | 0.97 | 0.97 | 290 |
| **Weighted Avg** | 0.97 | 0.97 | 0.97 | 290 |

---

### 2. Yawn Detection Model 
This model achieved an overall accuracy of **57%**. 

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **3_no_yawn** | 0.95 | 0.14 | 0.25 | 145 |
| **4_yawn** | 0.54 | 0.99 | 0.70 | 144 |
| **Overall Accuracy** | | | **0.57** | 289 |
| **Macro Avg** | 0.75 | 0.57 | 0.47 | 289 |
| **Weighted Avg**| 0.75 | 0.57 | 0.47 | 289 |
