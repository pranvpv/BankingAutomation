from datetime import datetime,date,timedelta
from fastapi import FastAPI
import psycopg2
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import requests
import psycopg2
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd

def run_daily_detection():
    SERVICE_ACCOUNT_FILE = r"*******************************************"

    SCOPES = [
        "**************************"
    ]
    
    credentials = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=SCOPES
    )
    
    client = gspread.authorize(credentials)
    
    SHEET_ID = "****************************"
    sheet = client.open_by_key(SHEET_ID)
    
    worksheet = sheet.sheet1
    rows = worksheet.get_all_records()
    length=len(rows)
    lastup=rows[length-1]["DATE"]
    txndate = datetime.strptime(lastup, "%d-%b-%y").date()
    
    print("Succesfully connected to Sheets")
    print("initiating connection to Postgres")
    DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "*************",
    "user": "postgres",
    "password": "***************"
    }

    conn = psycopg2.connect(**DB_CONFIG)
    print("Postgres connection succesful")
    cur = conn.cursor()

    cur.execute("""
    SELECT
    late_processed
    FROM ingestion_state
    """)
    
    rows1=cur.fetchall()
    
    leng=len(rows1)

    if leng>0:
        datadate=rows1[leng-1][0]

        if datadate==txndate:
            return ("Data Already Injested -- Exit Ingestion")
    
    SOURCE_NAME = "google_sheets"
    
    
    cur.execute("""
        SELECT late_processed
        FROM ingestion_state
    """)
    result = cur.fetchone()
    yest=date.today() - timedelta(days=1)
    inserted_rows=0


    for row in rows:
        day=datetime.strptime(row["DATE"], "%d-%b-%y").date()

        if day==yest:

            account_no = str(row["Account No"]).strip()
            details = row.get("TRANSACTION DETAILS", "")
            
            balance = row.get("BALANCEAMT")
            
        
            withdrawal = row.get(" WITHDRAWALAMT ") or 0
            
            deposit = row.get(" DEPOSITAMT ") or 0
        
        
            if withdrawal > 0:
                txn_type = "withdrawal"
                amount = withdrawal
            elif deposit > 0:
                txn_type = "deposit"
                amount = deposit
            else:
                continue
                
        
            cur.execute("""
                INSERT INTO transactions (
                    account_no,
                    transaction_date,
                    transaction_details,
                    transaction_type,
                    amount,
                    balance_amt
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                account_no,
                day,
                details,
                txn_type,
                amount,
                balance
            ))
        
            inserted_rows += 1
        
        
        # =========================
        # UPDATE INGESTION STATE
        # =========================
        
    if inserted_rows > 0:
        cur.execute("""
            INSERT INTO ingestion_state (late_processed,source_name)
            VALUES (%s, %s)
        """, (yest, "google_sheets"))
        
    
        
    print(f"Ingestion complete. Rows inserted: {inserted_rows}")
    cur.execute("""
        INSERT INTO anamoly(
            account_no,
            transaction_date,
            withdrawal_amount,
            avg_7d,
            alert_type
        )
        SELECT
            account_no,
            transaction_date,
            daily_withdrawal,
            avg_7d_withdrawal,
            'WITHDRAWAL_SPIKE'
        FROM (
            SELECT
                account_no,
                transaction_date,
                SUM(amount) AS daily_withdrawal,
                AVG(SUM(amount)) OVER (
                    PARTITION BY account_no
                    ORDER BY transaction_date
                    ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING
                ) AS avg_7d_withdrawal
            FROM transactions
            WHERE transaction_type = 'deposit'
            GROUP BY account_no, transaction_date
        ) t
        WHERE avg_7d_withdrawal IS NOT NULL
          AND daily_withdrawal > 3 * avg_7d_withdrawal;
        """)
    conn.commit()
    cur.close()
    conn.close()
    print("Daily detection complete")

