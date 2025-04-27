import logging
import sys
import os
from datetime import datetime

os.makedirs("logs", exist_ok=True)

def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    c_handler = logging.StreamHandler(sys.stdout)
    current_date = datetime.now().strftime("%Y-%m-%d")
    f_handler = logging.FileHandler(f"logs/{name}_{current_date}.log")
    c_handler.setLevel(logging.INFO)
    f_handler.setLevel(logging.DEBUG)
    
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    c_formatter = logging.Formatter(log_format)
    f_formatter = logging.Formatter(log_format)
    c_handler.setFormatter(c_formatter)
    f_handler.setFormatter(f_formatter)
    
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)
    
    return logger 