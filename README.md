#  Automated Transaction Monitoring & Anomaly Detection Pipeline

## Overview

Designed and built an **automated batch data pipeline** built to ingest transactional data, process it incrementally, detect anomalies, and expose analytics through APIs and a dashboard. 

The system is designed, with a focus on automation, state management, and analytical data serving.

---

##  Automated Batch Ingestion (Cron)

- Data ingestion is **fully automated** using a scheduled cron job.
- The pipeline runs at fixed intervals (daily) without manual intervention.
- Each run processes only relevant data for the execution window.

**Key objectives:**
- Reliable batch ingestion
- Repeatable execution
- No manual triggering

---

##  Ingestion State Management

To support **incremental processing**, the pipeline uses an `ingestion_state` table.

This table:
- Tracks the last successfully processed date
- Prevents duplicate ingestion
- Allows safe re-runs of the pipeline

---

##  Core Database Tables

### `transactions`
- Stores raw transactional data
- Serves as the primary fact table for analytics
- Used for aggregations and anomaly detection

### `anomaly`
- Stores detected anomalous transaction patterns
- Generated using time-window–based analytical queries
- Enables downstream reporting and analysis

### `ingestion_state`
- Maintains ingestion checkpoints
- Enables incremental and fault-tolerant processing

---

##  Anomaly Detection

- Anomalies are detected using **historical time-based aggregations** on transactional data.
- Current transaction behavior is compared against historical trends.
- Detected anomalies are persisted in a dedicated table for analytics.

This approach follows an **ELT-style pipeline**:
Load → Transform → Serve.

---

##  API Layer (FastAPI)

- Processed data is exposed via **FastAPI REST endpoints**.
- APIs support:
  - Transaction counts over configurable time ranges
  - Anomaly counts over configurable time ranges
  - Latest ingestion execution status
- The API layer decouples storage from consumption.

---

##  Dashboard (Analytics Layer)

- A lightweight dashboard consumes the FastAPI APIs.
- Displays:
  - Total transactions
  - Detected anomalies
  - Latest ingestion run timestamp
- Acts as a monitoring and analytics interface on top of the data pipeline.
  (The Dashboard was made using Claude)

---

##  Data Engineering Concepts Demonstrated

- Automated batch ingestion (cron-based)
- Incremental processing with state tracking
- Analytical data modeling
- Time-window–based aggregations
- Anomaly detection workflows
- API-driven analytics serving
- Clear separation of ingestion, processing, and serving layers

---

##  Tech Stack

- Python
- PostgreSQL
- FastAPI
- SQL
- Cron (job scheduling)

---

## 📌 Notes

- The pipeline is designed with components (ingestion, processing, anomaly detection, and serving), allowing it to be easily extended or adapted for different data sources and   business use cases.
- The ingestion and state management logic can be reused to support other batch-based workflows such as reporting pipelines, data quality monitoring, or compliance checks.
- The anomaly detection layer can be modified or replaced to support different analytical rules or domains without changing the core ingestion pipeline.
- The overall design can be scaled to handle higher data volumes, additional metrics, or new analytical use cases with minimal structural changes.
