"""Resume Intake Agent: Ingests PDF, DOCX, and raw text resumes and normalizes them into the canonical career profile."""

import io
import re
from pathlib import Path
from typing import Optional, Union, Dict, Any, List
from pypdf import PdfReader
import docx

from core.exceptions import SaccadeError
from core.llm.router import get_llm_provider
from core.models.profile import (
    MasterProfile,
    ProfileBasics,
    ProfileLocation,
    WorkExperience,
    Education,
    Skill,
    Project,
    Certificate,
)
from core.models.provenance import FactProvenance, AtomicFact


class ResumeIntakeAgent:
    """Extracts raw text from uploaded resumes (PDF, DOCX, TXT) and structures them into a MasterProfile."""

    @classmethod
    def extract_text(cls, file_path_or_name: str, file_bytes: Optional[bytes] = None) -> str:
        """Extracts text from PDF, DOCX, or plain text bytes or file paths."""
        filename = Path(file_path_or_name).name.lower()

        if file_bytes is None:
            path = Path(file_path_or_name)
            if not path.is_file():
                raise SaccadeError(f"Resume file not found: {file_path_or_name}")
            file_bytes = path.read_bytes()

        # Handle PDF
        if filename.endswith(".pdf"):
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                text_pages = [p.extract_text() or "" for p in reader.pages]
                return "\n\n".join(text_pages).strip()
            except Exception as e:
                raise SaccadeError(f"Failed to read PDF document: {e}")

        # Handle DOCX
        elif filename.endswith(".docx"):
            try:
                doc = docx.Document(io.BytesIO(file_bytes))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                # Also extract text from tables
                for table in doc.tables:
                    for row in table.rows:
                        row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                        if row_text:
                            paragraphs.append(row_text)
                return "\n".join(paragraphs).strip()
            except Exception as e:
                raise SaccadeError(f"Failed to read Word (.docx) document: {e}")

        # Handle Plain Text / Markdown
        else:
            try:
                return file_bytes.decode("utf-8").strip()
            except UnicodeDecodeError:
                return file_bytes.decode("latin-1", errors="ignore").strip()

    @classmethod
    async def parse_to_profile(
        cls,
        raw_text: str,
        source_name: str = "uploaded_resume",
        profile_id: Optional[str] = None
    ) -> MasterProfile:
        """Normalizes unstructured resume text into a typed MasterProfile with atomic fact provenance."""
        if not raw_text.strip():
            raise SaccadeError("Cannot parse empty resume text.")

        llm = get_llm_provider()

        prompt = (
            f"Parse the following resume text and convert it strictly into structured JSON conforming to the "
            f"canonical career profile format.\n\n"
            f"\"\"\"\n{raw_text[:6000]}\n\"\"\"\n\n"
            f"Return a JSON object with these keys:\n"
            f"- 'basics': {{ 'name': str, 'label': str, 'email': str, 'phone': str, 'url': str, 'summary': str, 'location': {{ 'city': str, 'region': str }} }}\n"
            f"- 'work': list of {{ 'name': str (company), 'position': str, 'startDate': str, 'endDate': str, 'summary': str, 'highlights': list of str }}\n"
            f"- 'education': list of {{ 'institution': str, 'area': str, 'studyType': str, 'startDate': str, 'endDate': str, 'score': str }}\n"
            f"- 'skills': list of {{ 'name': str (category name), 'keywords': list of str }}\n"
            f"- 'projects': list of {{ 'name': str, 'description': str, 'highlights': list of str }}\n"
            f"- 'certificates': list of {{ 'name': str, 'issuer': str, 'date': str }}"
        )

        try:
            parsed = await llm.generate_json(prompt, schema=MasterProfile)
            profile = cls._build_profile_from_dict(parsed, source_name, profile_id)
        except Exception:
            # Fallback heuristic parser if LLM structured extraction fails
            profile = cls._heuristic_parser(raw_text, source_name, profile_id)

        # Decompose highlights into atomic facts with provenance
        cls._attach_fact_provenance(profile, source_name)
        return profile

    @classmethod
    def _build_profile_from_dict(
        cls,
        data: Dict[str, Any],
        source_name: str,
        profile_id: Optional[str]
    ) -> MasterProfile:
        basics_data = data.get("basics", {})
        loc_data = basics_data.get("location") or {}
        location = ProfileLocation(
            city=loc_data.get("city"),
            region=loc_data.get("region"),
            countryCode=loc_data.get("countryCode")
        ) if loc_data else None

        basics = ProfileBasics(
            name=basics_data.get("name") or "Professional Candidate",
            label=basics_data.get("label"),
            email=basics_data.get("email"),
            phone=basics_data.get("phone"),
            url=basics_data.get("url"),
            summary=basics_data.get("summary"),
            location=location
        )

        work = []
        for w in data.get("work", []):
            work.append(WorkExperience(
                id=f"exp_{len(work)+1}",
                name=w.get("name") or "Employer",
                position=w.get("position") or "Role",
                startDate=w.get("startDate"),
                endDate=w.get("endDate") or "Present",
                summary=w.get("summary"),
                highlights=w.get("highlights", [])
            ))

        education = []
        for e in data.get("education", []):
            education.append(Education(
                institution=e.get("institution") or "University",
                area=e.get("area"),
                studyType=e.get("studyType"),
                startDate=e.get("startDate"),
                endDate=e.get("endDate"),
                score=e.get("score")
            ))

        skills = []
        for s in data.get("skills", []):
            skills.append(Skill(
                name=s.get("name") or "Skills",
                keywords=s.get("keywords", [])
            ))

        projects = []
        for p in data.get("projects", []):
            projects.append(Project(
                name=p.get("name") or "Project",
                description=p.get("description"),
                highlights=p.get("highlights", [])
            ))

        certificates = []
        for c in data.get("certificates", []):
            certificates.append(Certificate(
                name=c.get("name") or "Certificate",
                issuer=c.get("issuer"),
                date=c.get("date")
            ))

        return MasterProfile(
            id=profile_id or f"profile_{abs(hash(basics.name)) % 10000}",
            basics=basics,
            work=work,
            education=education,
            skills=skills,
            projects=projects,
            certificates=certificates
        )

    @classmethod
    def _heuristic_parser(cls, text: str, source_name: str, profile_id: Optional[str]) -> MasterProfile:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        name = lines[0] if lines else "Candidate"
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)

        email = email_match.group(0) if email_match else None
        phone = phone_match.group(0) if phone_match else None

        basics = ProfileBasics(
            name=name[:50],
            label="Professional Candidate",
            email=email,
            phone=phone,
            summary="Imported from " + source_name
        )

        # Extract words that look like technical skills
        all_words = re.findall(r"\b[A-Z][a-zA-Z0-9\+#\.]+\b", text)
        detected_skills = list(dict.fromkeys(all_words))[:15]

        return MasterProfile(
            id=profile_id or "imported_profile",
            basics=basics,
            skills=[Skill(name="Identified Skills", keywords=detected_skills)]
        )

    @classmethod
    def _attach_fact_provenance(cls, profile: MasterProfile, source_name: str) -> None:
        """Decomposes experience highlights into verifiable atomic facts."""
        for work in profile.work:
            atomic_facts = []
            for idx, h in enumerate(work.highlights):
                metrics = re.findall(r"(?:\$[\d,]+|\b\d+%\b|\b\d+\b)", h)
                atomic_facts.append(
                    AtomicFact(
                        id=f"fact_{work.id or 'exp'}_{idx+1}",
                        text=h,
                        entity=work.name,
                        metrics=metrics,
                        verified=True
                    )
                )
            work.provenance = FactProvenance(
                source_type="upload",
                source_ref=source_name,
                atomic_facts=atomic_facts
            )
