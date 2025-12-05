import os
import shutil

# Try importing OpenCV, but handle failure gracefully
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

def generate_thumbnail(video_path, thumbnail_path):
    """
    Extracts the first frame of the video as a thumbnail.
    If OpenCV is not available, creates a placeholder.
    """
    if OPENCV_AVAILABLE:
        try:
            cap = cv2.VideoCapture(video_path)
            ret, frame = cap.read()
            if ret:
                cv2.imwrite(thumbnail_path, frame)
            cap.release()
            return True
        except Exception as e:
            print(f"Error generating thumbnail with OpenCV: {e}")
            pass # Fallback
            
    # Fallback: Create a simple placeholder text file or copy a default image
    # For this simplified clone, we'll just create a dummy file if we can't extract a frame
    # In a real app, you'd have a default.jpg
    with open(thumbnail_path, 'wb') as f:
        # Create a small valid 1x1 pixel jpg or png would be better, but 
        # let's just write some bytes for now to represent "no thumbnail"
        f.write(b'Placeholder Thumbnail') 
    return False
