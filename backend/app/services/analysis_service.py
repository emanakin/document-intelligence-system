from datetime import datetime, timedelta
from typing import Dict, Any
import random, traceback
from core.logging import setup_logger

analysis_logger = setup_logger("analysis_service")

# --------------------------------------------------------------------------- #
#  PUBLIC ENTRY
# --------------------------------------------------------------------------- #
async def analyze_document(
        content: bytes,
        content_type: str,
        file_ext: str,
        progress_cb=None
) -> Dict[str, Any]:
    async def step(pct, msg):
        if progress_cb:
            await progress_cb(pct, msg)

    await step(10, "classifying")
    doc_type = _determine_type(file_ext, content_type)

    extractors = {
        "invoice":   _invoice,
        "receipt":   _receipt,
        "contract":  _contract,
        "report":    _report,
    }
    await step(40, "extracting core fields")
    result = extractors.get(doc_type, _generic)()

    await step(80, "fraud check")
    result["fraudCheck"] = _fraud_check(doc_type)
    result["classification"] = doc_type

    await step(100, "done")
    return result

# --------------------------------------------------------------------------- #
#  HELPERS
# --------------------------------------------------------------------------- #
def _determine_type(ext: str, ctype: str) -> str:
    return random.choice(["invoice", "receipt", "contract", "report"])

def _invoice()  -> Dict[str, Any]:   return _make_financial("INV")
def _receipt()  -> Dict[str, Any]:   return _make_financial("RCP")
def _contract() -> Dict[str, Any]:   return _make_contract()
def _report()   -> Dict[str, Any]:   return _make_report()
def _generic()  -> Dict[str, Any]:   return _make_generic()

# ---- concrete extractors --------------------------------------------------- #
def _make_financial(prefix: str) -> Dict[str, Any]:
    today   = datetime.now()
    due     = today + timedelta(days=30)
    amount  = f"${random.randint(20,10_000)}.{random.randint(0,99):02d}"
    return {
        "invoiceNumber": f"{prefix}-{random.randint(10000,99999)}",
        "clientName":    random.choice(["Acme","Globex","Initech"]),
        "invoiceDate":   today.strftime("%Y-%m-%d"),
        "dueDate":       due.strftime("%Y-%m-%d"),
        "totalAmount":   amount,
        "insights":      "Standard NET-30 payment terms."
    }

def _make_contract() -> Dict[str, Any]:
    start = datetime.now() - timedelta(days=random.randint(1, 60))
    end   = start.replace(year=start.year+random.randint(1,3))
    return {
        "invoiceNumber": f"CNT-{random.randint(10000,99999)}",
        "clientName":    random.choice(["Wayne Ent.","Stark Ind.","Initech LLC"]),
        "invoiceDate":   start.strftime("%Y-%m-%d"),
        "dueDate":       end.strftime("%Y-%m-%d"),
        "totalAmount":   f"${random.randint(5_000,100_000)}",
        "insights":      "Contains standard liability clauses."
    }

def _make_report() -> Dict[str, Any]:
    date = datetime.now() - timedelta(days=random.randint(1, 90))
    return {
        "invoiceNumber": f"RPT-{random.randint(10000,99999)}",
        "clientName":    "Internal",
        "invoiceDate":   date.strftime("%Y-%m-%d"),
        "dueDate":       date.strftime("%Y-%m-%d"),
        "totalAmount":   "N/A",
        "insights":      "Detailed analysis and recommendations."
    }

def _make_generic() -> Dict[str, Any]:
    date = datetime.now() - timedelta(days=random.randint(1, 45))
    return {
        "invoiceNumber": f"DOC-{random.randint(10000,99999)}",
        "clientName":    "Unknown",
        "invoiceDate":   date.strftime("%Y-%m-%d"),
        "dueDate":       date.strftime("%Y-%m-%d"),
        "totalAmount":   "N/A",
        "insights":      "No additional insights."
    }

def _fraud_check(doc_type: str) -> Dict[str, str]:
    chance = random.random()
    if chance < 0.02:
        return {"status":"fraudulent","details":"Signs of manipulation."}
    elif chance < 0.07:
        return {"status":"suspicious","details":"Unusual patterns detected."}
    return {"status":"clean","details":"No issues found."}

def _fallback() -> Dict[str, Any]:
    today = datetime.now().strftime("%Y-%m-%d")
    return {
        "invoiceNumber": "ERROR",
        "clientName":    "N/A",
        "invoiceDate":   today,
        "dueDate":       today,
        "totalAmount":   "N/A",
        "classification":"unknown",
        "fraudCheck":    {"status":"unknown","details":"analysis failed"},
        "insights":      "Analysis failed."
        
    } 