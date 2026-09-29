"""Integration tests for FastAPI endpoints and Web Studio serving."""

import pytest
from starlette.testclient import TestClient
from interfaces.api.app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "tectonic" in data["compiler"]


def test_api_get_profile(client):
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert data["basics"]["name"] == "Alex Mercer"


def test_api_parse_job(client):
    res = client.post("/api/job/parse", json={"source": "Senior Backend Engineer at Stripe. Required: Rust, Kafka."})
    assert res.status_code == 200
    data = res.json()
    assert "title" in data
    assert len(data["required_skills"]) > 0 or len(data["keywords"]) > 0


def test_api_tailor_and_serve_pdf(client):
    res = client.post(
        "/api/tailor",
        json={
            "job_source": "Senior Distributed Systems Engineer. Requires Rust, Kafka.",
            "theme": "classic",
            "generate_cover_letter": True
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["ats_report"]["overall_score"] > 0
    assert data["resume_url"] is not None

    # Verify serving PDF
    pdf_res = client.get(data["resume_url"])
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")


def test_api_serves_web_studio(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "Saccade Studio" in res.text
