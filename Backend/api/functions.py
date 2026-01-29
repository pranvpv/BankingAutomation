from fastapi import APIRouter
from datetime import date, timedelta
import psycopg2

router = APIRouter(prefix="/api/functions", tags=["Functions"])

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "Banking_Last",
    "user": "postgres",
    "password": "9895396678"
}

@router.get("/transactions")
def get_transactions(time_range: str = "yesterday"):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    today = date.today()

    if time_range == "yesterday":
        start_date = today - timedelta(days=1)
    elif time_range == "1week":
        start_date = today - timedelta(days=7)
    elif time_range == "1month":
        start_date = today - timedelta(days=30)
    elif time_range == "3months":
        start_date = today - timedelta(days=90)
    elif time_range == "6months":
        start_date = today - timedelta(days=180)
    elif time_range == "1year":
        start_date = today - timedelta(days=365)

    end_date = today

    cur.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE transaction_date BETWEEN %s AND %s
    """, (start_date, end_date))

    total = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"total_transactions": total}


@router.get("/last_exec")
def get_lastexectime():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
        SELECT late_processed
        FROM ingestion_state
        ORDER BY late_processed DESC
        LIMIT 1
    """)

    row = cur.fetchone()
    last_exec = row[0] if row else None

    cur.close()
    conn.close()

    return {
        "last_ingestion_time": last_exec
    }

@router.get("/anamoly")
def get_anamoly(time_range: str = "yesterday"):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    today = date.today()

    if time_range == "yesterday":
        start_date = today - timedelta(days=1)
    elif time_range == "1week":
        start_date = today - timedelta(days=7)
    elif time_range == "1month":
        start_date = today - timedelta(days=30)
    elif time_range == "3months":
        start_date = today - timedelta(days=90)
    elif time_range == "6months":
        start_date = today - timedelta(days=180)
    elif time_range == "1year":
        start_date = today - timedelta(days=365)

    end_date = today

    cur.execute("""
        SELECT COUNT(*)
        FROM anamoly
        WHERE transaction_date BETWEEN %s AND %s
    """, (start_date, end_date))

    anamoly = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"total_anamoly": anamoly}
