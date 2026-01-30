import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# Constants for Iris tracking
LEFT_IRIS = 468
RIGHT_IRIS = 473

def get_gaze_coordinates(landmarks, image_w, image_h):
    try:
        # Simplified gaze logic for WebSocket speed
        l_iris = landmarks[LEFT_IRIS]
        r_iris = landmarks[RIGHT_IRIS]
        
        # Average iris position (normalized 0.0 to 1.0)
        avg_x = (l_iris.x + r_iris.x) / 2
        avg_y = (l_iris.y + r_iris.y) / 2
        
        # Sensitivity Boost: Helps move cursor to screen edges
        def boost(val):
            return np.clip((val - 0.5) * 2.5 + 0.5, 0, 1)

        return boost(avg_x), boost(avg_y)
    except:
        return None, None