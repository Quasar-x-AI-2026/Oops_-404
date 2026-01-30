from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import pyautogui

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALPHA = 0.4
prev_x, prev_y = 0.5, 0.5
pyautogui.FAILSAFE = False

SCREEN_WIDTH, SCREEN_HEIGHT = pyautogui.size()

import time

# Blink State Variables
is_eye_closed = False
last_click_time = 0
CLICK_COOLDOWN = 1.2  # 1.2 seconds tak doosra click ignore hoga

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global prev_x, prev_y, is_eye_closed, last_click_time
    await websocket.accept()
    print("Backend: Connection Accepted!")
    try:
        while True:
            data = await websocket.receive_text()
            coords = json.loads(data)
            
            raw_x = coords.get("x", 0.5)
            raw_y = coords.get("y", 0.5)
            action = coords.get("action", "move")
            target_mode = coords.get("target", "MOBILE")

            # 1. Smoothing Logic
            target_x = 1 - raw_x 
            curr_x = (ALPHA * target_x) + (1 - ALPHA) * prev_x
            curr_y = (ALPHA * raw_y) + (1 - ALPHA) * prev_y
            prev_x, prev_y = curr_x, curr_y

            # 2. CLICK DEBOUNCING LOGIC
            final_action = "move"
            current_time = time.time()

            if action == "click":
                # Sirf tab click karein agar pehle eyes open thi aur cooldown khatam ho gaya hai
                if not is_eye_closed and (current_time - last_click_time > CLICK_COOLDOWN):
                    final_action = "click"
                    last_click_time = current_time
                    is_eye_closed = True
                    print(f"Verified Click Executed at {target_mode}")
            else:
                is_eye_closed = False # Eyes are now open

            # 3. System Control
            if target_mode == "PC" and final_action == "click":
                pyautogui.click(curr_x * SCREEN_WIDTH, curr_y * SCREEN_HEIGHT)

            # 4. Feedback to Frontend
            await websocket.send_json({
                "status": "success",
                "x": round(curr_x, 4),
                "y": round(curr_y, 4),
                "executed_action": final_action
            })

    except Exception as e:
        print(f"WS Error: {e}")