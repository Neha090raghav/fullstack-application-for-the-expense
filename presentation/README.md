# AI Incident Copilot for Airport Middleware

Internal 5-slide proposal for the airport technology / operations team.

## Files to use

- `AI-Incident-Copilot-Airport-Middleware.pptx` — native PowerPoint (editable text and shapes)
- `AI-Incident-Copilot-Airport-Middleware.pdf` — matching PDF

Open the PPTX in Microsoft PowerPoint or Google Slides. Every slide has **SOURCE INTEGRATE** in the top-right corner.

## Positioning

Proposed human-in-the-loop concept. AIP Sentinel remains detection and alerting. The Copilot would analyze and recommend; engineers validate and act.

To rebuild after edits:

```bash
python3 presentation/export/build_pptx.py
soffice --headless --convert-to pdf --outdir presentation presentation/AI-Incident-Copilot-Airport-Middleware.pptx
```
