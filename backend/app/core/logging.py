import logging
import sys
import os
from datetime import datetime

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Configure logging
def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Create handlers
    c_handler = logging.StreamHandler(sys.stdout)
    current_date = datetime.now().strftime("%Y-%m-%d")
    f_handler = logging.FileHandler(f"logs/{name}_{current_date}.log")
    c_handler.setLevel(logging.INFO)
    f_handler.setLevel(logging.DEBUG)
    
    # Create formatters and add to handlers
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    c_formatter = logging.Formatter(log_format)
    f_formatter = logging.Formatter(log_format)
    c_handler.setFormatter(c_formatter)
    f_handler.setFormatter(f_formatter)
    
    # Add handlers to the logger
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)
    
    return logger 